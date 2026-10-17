import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) throw new Error('Local demonstration only.');
const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const session = await page.context().newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 80,
        downloadThroughput: 200 * 1024,
        uploadThroughput: 90 * 1024,
    });
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
        window.__laviannLCP = 0;
        new PerformanceObserver(list => {
            for (const entry of list.getEntries()) window.__laviannLCP = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    const response = await page.goto(url, { waitUntil: 'load' });
    if (!response?.ok()) throw new Error('Storefront failed to load.');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const result = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            ttfbMs: Math.round(navigation.responseStart),
            domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
            loadMs: Math.round(navigation.loadEventEnd),
            observedLcpMs: Math.round(window.__laviannLCP),
            resourceCount: performance.getEntriesByType('resource').length,
        };
    });
    const report = {
        measuredAt: new Date().toISOString(),
        viewport: '390x844',
        profile:
            'Local production server; 80 ms simulated latency, 200 KiB/s download, 4x CPU slowdown; single cold browser context',
        ...result,
    };
    mkdirSync('docs/screenshots', { recursive: true });
    writeFileSync('docs/screenshots/performance.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
} finally {
    await browser.close();
}
