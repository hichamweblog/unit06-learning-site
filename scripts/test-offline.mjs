import assert from 'node:assert/strict';
import { preview } from 'vite';
import { chromium } from '@playwright/test';

const port = Number(process.env.PWA_TEST_PORT ?? 4179);
const server = await preview({
  configFile: 'vite.config.ts',
  preview: { host: '127.0.0.1', port, strictPort: true },
});
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 10_000 });

  await page.goto(`${baseUrl}/activities`);
  assert.match(await page.locator('h1').innerText(), /أنشطة تطبيقية/);

  await context.setOffline(true);
  await page.goto(`${baseUrl}/learn?section=2`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1');
  assert.match(await page.locator('h1').innerText(), /تعلّم الدرس/);
  assert.equal(new URL(page.url()).pathname, '/learn');
  console.log('✓ PWA: استعاد المسار الداخلي من الغلاف المخزن بعد قطع الشبكة.');
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
