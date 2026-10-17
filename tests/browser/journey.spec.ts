import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const customer = process.env.CUSTOMER_TEST_ORIGIN || 'http://localhost:3000';
const vendor = process.env.VENDOR_TEST_ORIGIN || 'http://localhost:3001';
const env = Object.fromEntries(
    readFileSync('.env.test.local', 'utf8')
        .trim()
        .split('\n')
        .map(line => {
            const i = line.indexOf('=');
            return [line.slice(0, i), line.slice(i + 1)];
        }),
);
for (const origin of [customer, vendor])
    if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
        throw new Error('Browser mutations are restricted to local demo servers.');
const output = 'docs/screenshots';
mkdirSync(output, { recursive: true });
const inspected: { screen: string; width: number; violations: number }[] = [];
async function checkScreen(page: Page, screen: string, widths: number[], screenshots: number[] = [390]) {
    for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('main')).toBeVisible();
        const overflow = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
        expect(overflow.content, `${screen} overflow at ${width}px`).toBeLessThanOrEqual(overflow.viewport);
        const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const violations = scan.violations.map(v => ({
            id: v.id,
            nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })),
        }));
        expect(violations, `${screen} accessibility at ${width}px`).toEqual([]);
        inspected.push({ screen, width, violations: scan.violations.length });
        if (screenshots.includes(width))
            await page.screenshot({
                path: `${output}/${screen}-${width}.png`,
                fullPage: true,
                mask: [page.getByLabel('Private quotation link')],
            });
    }
    await page.setViewportSize({ width: 390, height: 844 });
}
async function fillContact(page: Page, name: string) {
    await page.getByLabel('Full name', { exact: true }).fill(name);
    await page.getByLabel('Phone number', { exact: true }).fill('+230 00000000');
    await page.getByRole('combobox', { name: 'Delivery zone', exact: true }).selectOption({ label: 'North · Rs 125' });
    await page.getByLabel('Locality', { exact: true }).fill('Demo locality');
    await page.getByLabel('Address & landmark', { exact: true }).fill('DEMO ADDRESS — not a real delivery');
    await page.getByRole('radio', { name: /Cash on delivery/ }).check();
}
async function login(page: Page) {
    await page.goto(`${vendor}/login`);
    await page.getByLabel('Email address').fill(env.TEST_VENDOR_EMAIL!);
    await page.getByLabel('Email address').press('Tab');
    await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
    await page.getByLabel('Password', { exact: true }).fill(env.TEST_VENDOR_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in to workspace →' }).click();
    await expect(page).toHaveURL(`${vendor}/`);
}
const customerWidths = [320, 390, 768, 1440];
const vendorWidths = [390, 768, 1440];

test('customer and vendor complete the six-kilo order and manual workflow across all screen sizes', async ({ browser, page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(customer);
    await expect(page.getByRole('heading', { name: 'QUALITY MEATS, GREATER MEALS.' })).toBeVisible();
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toHaveCSS('clip-path', 'inset(50%)');
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveCSS('clip-path', 'none');
    await expect(skipLink).toHaveCSS('top', '8px');
    await page.keyboard.press('Tab');
    await expect(skipLink).toHaveCSS('clip-path', 'inset(50%)');
    await checkScreen(page, 'customer-home', customerWidths, [390, 1440]);
    await page.goto(`${customer}/shop`);
    await checkScreen(page, 'customer-catalogue', customerWidths);
    await page.getByLabel('Search cuts').fill('breast');
    await expect(page.locator('.product-card')).toHaveCount(1);
    await page.getByLabel('Search cuts').fill('');
    await page.goto(`${customer}/category/chicken`);
    await expect(page.locator('.product-card')).toHaveCount(5);
    await checkScreen(page, 'customer-category', customerWidths);
    for (const slug of ['chicken-breast', 'chicken-drumsticks', 'chicken-wings']) {
        await page.goto(`${customer}/product/${slug}`);
        await page.getByLabel('Weight (grams)').fill('2000');
        await page.getByLabel('Portion size').selectOption('500');
        await page.getByLabel('Special instructions (optional)').fill('DEMO: label each 500 g package.');
        if (slug === 'chicken-breast') await checkScreen(page, 'customer-product', customerWidths);
        await page.getByRole('button', { name: 'Add to cart' }).click();
        await expect(page.getByText('Saved with your weight, cut and portions.')).toBeVisible();
    }
    await page.goto(`${customer}/cart`);
    await expect(page.getByText('Rs 1,970', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator('.cart-item')).toHaveCount(3);
    await checkScreen(page, 'customer-cart', customerWidths);
    await page.getByRole('link', { name: 'Edit choices' }).first().click();
    await expect(page.getByLabel('Weight (grams)')).toHaveValue('2000');
    await expect(page.getByLabel('Special instructions (optional)')).toHaveValue('DEMO: label each 500 g package.');
    await page.goto(`${customer}/checkout`);
    const name = `Demo Browser ${Date.now()}`;
    await fillContact(page, name);
    await checkScreen(page, 'customer-checkout', customerWidths);
    await page.getByRole('button', { name: 'Review your request →' }).click();
    await expect(page.getByText('Rs 2,095', { exact: true })).toBeVisible();
    // Cart edits after a draft preserve contact details and update the trusted review.
    await page.getByRole('link', { name: 'Edit products & portions' }).click();
    await page.getByRole('link', { name: 'Edit choices' }).first().click();
    await page.getByLabel('Special instructions (optional)').fill('DEMO: revised labels, still four 500 g packages.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.goto(`${customer}/review`);
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText('“DEMO: revised labels, still four 500 g packages.”')).toBeVisible();
    await expect(page.getByText('Rs 2,095', { exact: true })).toBeVisible();
    await checkScreen(page, 'customer-review', customerWidths);
    await page.getByRole('button', { name: 'Submit order request', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'YOUR REQUEST IS WITH US.' })).toBeVisible();
    const statusURL = page.url().replace('/submitted', '/status');
    await checkScreen(page, 'customer-submitted', customerWidths);

    const adminContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const admin = await adminContext.newPage();
    admin.on('pageerror', e => errors.push(e.message));
    await admin.goto(`${vendor}/login`);
    await checkScreen(admin, 'vendor-login', vendorWidths);
    await login(admin);
    await checkScreen(admin, 'vendor-overview', vendorWidths, [390, 1440]);
    await admin.goto(`${vendor}/orders`);
    await checkScreen(admin, 'vendor-orders', vendorWidths);
    await admin.getByLabel('Search orders').fill(name);
    await admin.getByRole('link', { name: 'Review →', exact: true }).click();
    await expect(admin.getByRole('button', { name: 'Issue quotation v1' })).toBeVisible();
    const detailURL = admin.url();
    await checkScreen(admin, 'vendor-order-detail', vendorWidths, [390, 1440]);
    await admin.getByRole('button', { name: 'Issue quotation v1' }).click();
    await expect(admin.getByLabel('Private quotation link')).toBeVisible();
    const quoteURL = await admin.getByLabel('Private quotation link').inputValue();
    await page.goto(quoteURL);
    await expect(page.getByRole('button', { name: 'Approve this quotation', exact: true })).toBeVisible();
    await expect(page.getByText('Rs 2,095', { exact: true })).toBeVisible();
    await checkScreen(page, 'customer-quotation', customerWidths);
    await page.getByRole('button', { name: 'Approve this quotation', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'CONFIRMED', exact: true })).toBeVisible();
    await admin.reload();
    for (const status of ['Preparing', 'Ready for Delivery']) {
        await admin.getByRole('button', { name: `Mark ${status}`, exact: true }).click();
        await expect(admin.getByText(`Order marked ${status}.`, { exact: true })).toBeVisible();
    }
    await admin.goto(`${vendor}/deliveries`);
    await checkScreen(admin, 'vendor-deliveries', vendorWidths);
    await admin.goto(detailURL);
    for (const status of ['Out for Delivery', 'Delivered']) {
        await admin.getByRole('button', { name: `Mark ${status}`, exact: true }).click();
        await expect(admin.getByText(`Order marked ${status}.`, { exact: true })).toBeVisible();
    }
    await page.goto(statusURL);
    await expect(page.getByRole('heading', { name: 'DELIVERED', exact: true })).toBeVisible();
    await expect(page.getByText('unpaid', { exact: true })).toBeVisible();
    await admin.getByRole('combobox', { name: 'Payment status', exact: true }).selectOption('paid');
    await admin.getByLabel('Verification note / reference').fill('DEMO cash received by vendor');
    await admin.getByRole('button', { name: 'Save payment record' }).click();
    await expect(admin.getByText('Payment record saved.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Refresh status' }).click();
    await expect(page.getByText('paid', { exact: true })).toBeVisible();
    await checkScreen(page, 'customer-status', customerWidths);

    await admin.goto(`${vendor}/orders/new`);
    await checkScreen(admin, 'vendor-manual-order', vendorWidths);
    await admin.getByLabel('Choose a product').selectOption({ label: 'Whole chicken' });
    await admin.getByLabel('Weight (grams)').fill('2000');
    await admin.getByLabel('Portion size').selectOption('1000');
    await admin.getByRole('button', { name: 'Add to request' }).click();
    await fillContact(admin, 'Demo WhatsApp Customer');
    await admin.getByRole('button', { name: 'Create manual order request' }).click();
    await expect(admin.getByText('WhatsApp / phone request', { exact: true })).toBeVisible();
    await admin.getByRole('button', { name: 'Issue quotation v1' }).click();
    await expect(admin.getByLabel('Private quotation link')).toBeVisible();
    const oldQuote = await admin.getByLabel('Private quotation link').inputValue();
    await admin.getByLabel('Changes / vendor notes').fill('DEMO revised delivery guidance.');
    await admin.getByRole('button', { name: 'Issue quotation v2' }).click();
    await expect(admin.getByRole('heading', { name: 'QUOTATION V2', exact: true })).toBeVisible();
    const currentQuote = await admin.getByLabel('Private quotation link').inputValue();
    expect(currentQuote).not.toBe(oldQuote);
    await page.goto(oldQuote);
    await expect(page.getByRole('heading', { name: 'LET’S CHECK THAT LINK.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve this quotation' })).toHaveCount(0);
    await page.goto(currentQuote);
    await page.getByRole('button', { name: 'Approve this quotation' }).click();
    await expect(page.getByRole('heading', { name: 'CONFIRMED', exact: true })).toBeVisible();
    await admin.reload();
    await admin.getByLabel('Reason / delivery follow-up').fill('DEMO cancellation before preparation');
    await admin.getByRole('button', { name: 'Mark Cancelled', exact: true }).click();
    await expect(admin.getByText('Order marked Cancelled.', { exact: true })).toBeVisible();

    for (const [path, label] of [
        ['/products', 'vendor-products'],
        ['/inventory', 'vendor-inventory'],
        ['/settings/delivery', 'vendor-delivery-settings'],
        ['/settings/payments', 'vendor-payment-settings'],
    ]) {
        await admin.goto(`${vendor}${path}`);
        await checkScreen(admin, label!, vendorWidths, label === 'vendor-inventory' ? [390, 1440] : [390]);
    }
    await admin.goto(`${vendor}/inventory`);
    const wings = admin.locator('section.card').filter({ has: admin.getByRole('heading', { name: /^Chicken wings$/i }) });
    await wings.getByText('Replenish, adjust or change target', { exact: true }).click();
    await wings.getByLabel('Stock change (grams)').fill('1000');
    await wings.getByLabel('Reason', { exact: true }).fill('DEMO browser replenishment');
    await wings.getByRole('button', { name: 'Record adjustment' }).click();
    await expect(admin.getByText('Inventory updated; movement recorded.', { exact: true })).toBeVisible();
    await expect(wings.locator('.stock-values')).toContainText('4 kg');
    // A deliberate second save must be a new operation, unlike a network retry.
    await wings.getByRole('button', { name: 'Record adjustment' }).click();
    await expect(wings.locator('.stock-values')).toContainText('5 kg');
    await checkScreen(admin, 'vendor-inventory-editor', vendorWidths, []);
    expect(errors, 'Browser runtime errors').toEqual([]);
    writeFileSync('docs/screenshots/verification.json', JSON.stringify(inspected, null, 2) + '\n');
    await adminContext.close();
});

test('HTTP boundaries reject cross-origin, unauthenticated, malformed and oversized operations', async ({ request }) => {
    const body = { token: '0'.repeat(64), action: 'view' };
    expect((await request.post(`${customer}/api/guest`, { data: body })).status()).toBe(403);
    expect(
        (await request.post(`${customer}/api/guest`, { headers: { Origin: 'https://unrelated.example' }, data: body })).status(),
    ).toBe(403);
    expect((await request.post(`${customer}/api/guest`, { headers: { Origin: customer }, data: body })).status()).toBe(403);
    expect(
        (
            await request.post(`${customer}/api/requests`, {
                headers: { Origin: customer, 'Content-Type': 'application/json' },
                data: 'not json',
            })
        ).status(),
    ).toBe(400);
    expect(
        (
            await request.post(`${customer}/api/requests`, { headers: { Origin: customer }, data: { value: 'x'.repeat(48_001) } })
        ).status(),
    ).toBe(413);
    expect(
        (
            await request.post(`${vendor}/api/operations`, { headers: { Origin: vendor }, data: { action: 'stock', input: {} } })
        ).status(),
    ).toBe(401);
});
