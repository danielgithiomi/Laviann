import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 240_000,
    expect: { timeout: 15_000 },
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        browserName: 'chromium',
        headless: true,
        actionTimeout: 15_000,
        viewport: { width: 390, height: 844 },
        screenshot: 'only-on-failure',
    },
});
