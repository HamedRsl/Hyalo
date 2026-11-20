// Browser binaries/tooling are opt-in developer tools, never library dependencies.
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const tools = process.env.HYALO_BROWSER_TOOLS;
if (!tools) throw new Error('Set HYALO_BROWSER_TOOLS to the directory containing playwright and @axe-core/playwright');
const require = createRequire(join(tools, 'package.json'));
const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');
const base = process.env.HYALO_BASE_URL ?? 'http://127.0.0.1:4200';
const out = resolve(process.env.HYALO_BROWSER_OUTPUT ?? 'docs/verification/browser');
mkdirSync(out, { recursive: true });
const results = [];
const modes = [
  { name: 'dark', colorScheme: 'dark', width: 1440, height: 1000 },
  { name: 'light', colorScheme: 'light', width: 1280, height: 900 },
  { name: 'rtl-reduced', colorScheme: 'dark', reducedMotion: 'reduce', width: 390, height: 844, rtl: true },
  { name: 'forced', colorScheme: 'light', forcedColors: 'active', width: 1024, height: 768 },
];
for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
  let browser;
  try { browser = await browserType.launch(engine === 'chromium' ? { channel: 'chromium', headless: true } : { headless: true }); }
  catch (error) { results.push({ engine, status: 'blocked', error: String(error) }); continue; }
  try {
    for (const mode of modes) {
      const context = await browser.newContext({ viewport: { width: mode.width, height: mode.height }, colorScheme: mode.colorScheme, reducedMotion: mode.reducedMotion, forcedColors: mode.forcedColors });
      for (const route of ['/blocks/notifications', '/blocks/marketplace-chat', '/blocks/transfer', '/components/select', '/components/table']) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        const item = { engine, mode: mode.name, route, status: 'passed' };
        try {
          await page.goto(base + route, { waitUntil: 'networkidle' });
          if (mode.rtl) await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'fa'; });
          await page.locator('docs-page h1').waitFor();
          if (route.includes('notifications')) {
            const trigger = page.getByRole('button', { name: 'Open notifications', exact: true });
            await trigger.click();
            const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
            await panel.waitFor();
            await panel.getByRole('button', { name: 'Mark all as read', exact: true }).click();
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open notifications');
          } else if (route.includes('marketplace')) {
            await page.locator('textarea').fill('Can I collect tomorrow?');
            await page.getByRole('button', { name: 'Add local draft', exact: true }).click();
            await expect(page.locator('.marketplace-message')).toHaveCount(4);
          } else if (route.endsWith('transfer')) {
            await page.locator('#transfer-amount').fill('۰۰۱۲٫۵۰');
            assert.equal(await page.locator('#transfer-amount').inputValue(), '0012.50');
            await page.getByRole('button', { name: 'Confirm demo transfer', exact: true }).click();
            await expect(page.locator('#transfer-amount')).toBeDisabled();
          }
          item.horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          const scan = await new AxeBuilder({ page }).include('docs-page').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
          item.violations = scan.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
          item.errors = [...errors];
          if (item.horizontalOverflow || item.violations.length || item.errors.length) item.status = 'failed';
          await page.screenshot({ path: join(out, `${engine}-${mode.name}-${route.split('/').pop()}.png`), fullPage: false });
        } catch (error) { item.status = 'failed'; item.error = String(error); }
        results.push(item);
        writeFileSync(join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
        console.log(`${item.status}: ${engine}/${mode.name}${route}`);
        await page.close();
      }
      await context.close();
    }
  } finally { await browser.close(); }
}
const summary = { passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length, blocked: results.filter(r => r.status === 'blocked').length };
writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(summary);
if (summary.failed || summary.blocked) process.exitCode = 1;
