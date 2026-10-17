import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const customer = process.env.CUSTOMER_TEST_ORIGIN || 'http://localhost:3000';
const vendor = process.env.VENDOR_TEST_ORIGIN || 'http://localhost:3001';
for (const origin of [customer, vendor])
    if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Local demo servers only.');
const env = Object.fromEntries(
    readFileSync('.env.test.local', 'utf8')
        .trim()
        .split('\n')
        .map(line => {
            const i = line.indexOf('=');
            return [line.slice(0, i), line.slice(i + 1)];
        }),
);

test('vendor pack, fee and payment settings persist and reach the customer estimate', async ({ page, browser }) => {
    await page.goto(`${vendor}/login`);
    await page.getByLabel('Email address').fill(env.TEST_VENDOR_EMAIL!);
    await page.getByLabel('Password', { exact: true }).fill(env.TEST_VENDOR_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in to workspace →' }).click();
    await expect(page).toHaveURL(`${vendor}/`);
    await page.goto(`${vendor}/products`);
    const breast = page.locator('details.product-editor').filter({ has: page.getByText('Chicken breast', { exact: true }) });
    await breast.locator('summary').click();
    const index = (await breast.getByLabel(/Pack \d+ weight \(grams\)/).count()) + 1;
    await breast.getByRole('button', { name: 'Add fixed pack', exact: true }).click();
    await breast.getByLabel(`Pack ${index} weight (grams)`, { exact: true }).fill('1500');
    await breast.getByLabel(`Pack ${index} price (Rs)`, { exact: true }).fill('695');
    await breast.getByRole('button', { name: 'Save product', exact: true }).click();
    await expect(page.getByText('Product saved. Existing quotations keep their original prices.')).toBeVisible();
    await page.reload();
    await breast.locator('summary').click();
    await expect(breast.getByLabel(`Pack ${index} weight (grams)`, { exact: true })).toHaveValue('1500');
    for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(
            (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations,
        ).toEqual([]);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'docs/screenshots/vendor-product-editor-390.png', fullPage: true });
    await page.goto(`${vendor}/settings/delivery`);
    await page.getByLabel('North delivery fee (Rs)').fill('130');
    await page.getByRole('button', { name: 'Save North', exact: true }).click();
    await expect(page.getByText('Delivery settings saved.', { exact: true })).toBeVisible();
    await page.goto(`${vendor}/settings/payments`);
    const juice = page.locator('form').filter({ has: page.getByRole('heading', { name: 'MCB JUICE', exact: true }) });
    const originalInstructions = await juice.getByLabel('MCB Juice instructions').inputValue();
    await juice.getByLabel('MCB Juice instructions').fill('DEMO browser setting — ask the vendor to verify any transfer.');
    await juice.getByRole('button', { name: 'Save payment preference' }).click();
    await expect(page.getByText('Payment instructions saved.', { exact: true })).toBeVisible();

    const buyer = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await buyer.goto(`${customer}/product/chicken-breast`);
    await buyer.getByRole('button', { name: 'Fixed packs', exact: true }).click();
    await buyer.getByRole('combobox', { name: 'Fixed pack', exact: true }).selectOption({ label: '1.5 kg · Rs 695 / pack' });
    await buyer.getByRole('button', { name: 'Add to cart' }).click();
    await buyer.goto(`${customer}/checkout`);
    await buyer.getByLabel('Full name', { exact: true }).fill('Demo Fixed Pack Buyer');
    await buyer.getByLabel('Phone number', { exact: true }).fill('+230 00000000');
    await buyer.getByRole('combobox', { name: 'Delivery zone', exact: true }).selectOption({ label: 'North · Rs 130' });
    await buyer.getByLabel('Locality', { exact: true }).fill('Demo locality');
    await buyer.getByLabel('Address & landmark', { exact: true }).fill('DEMO ADDRESS — not a real delivery');
    await expect(buyer.getByText('DEMO browser setting — ask the vendor to verify any transfer.')).toBeVisible();
    await buyer.getByRole('radio', { name: /MCB Juice/ }).check();
    await buyer.getByRole('button', { name: 'Review your request →' }).click();
    await expect(buyer.getByText('Rs 825', { exact: true })).toBeVisible();
    await expect(buyer.getByText(/3 × 500 g/)).toBeVisible();
    await buyer.close();

    await juice.getByLabel('MCB Juice instructions').fill(originalInstructions);
    await juice.getByRole('button', { name: 'Save payment preference' }).click();
    await expect(page.getByText('Payment instructions saved.', { exact: true })).toBeVisible();
    await page.goto(`${vendor}/settings/delivery`);
    await page.getByLabel('North delivery fee (Rs)').fill('125');
    await page.getByRole('button', { name: 'Save North', exact: true }).click();
    await expect(page.getByText('Delivery settings saved.', { exact: true })).toBeVisible();
    await page.goto(`${vendor}/products`);
    await breast.locator('summary').click();
    await breast.getByRole('button', { name: `Remove pack ${index}`, exact: true }).click();
    await breast.getByRole('button', { name: 'Save product', exact: true }).click();
    await expect(page.getByText('Product saved. Existing quotations keep their original prices.')).toBeVisible();
});
