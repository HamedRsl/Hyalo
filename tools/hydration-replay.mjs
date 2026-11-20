import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(
  process.env.HY_PLAYWRIGHT ? pathToFileURL(resolve(process.env.HY_PLAYWRIGHT)).href : 'playwright'
);
const root = resolve('dist/hydration-fixture/browser');
const server = createServer(async (req, res) => {
  try {
    const file = resolve(
      root,
      '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'),
    );
    if (!file.startsWith(root + '/'.replace('/', process.platform === 'win32' ? '\\' : '/')))
      throw Error('path');
    res.setHeader(
      'Content-Type',
      { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }[extname(file)] ||
        'application/octet-stream',
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(4301, '127.0.0.1', r));
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true, channel: 'chromium' });
  for (const tier of ['high', 'medium', 'low']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.addInitScript((t) => {
      localStorage.setItem('docs-hydration-tier', t);
      window.eventEvidence = [];
      for (const type of ['input', 'change'])
        document.addEventListener(
          type,
          (e) => {
            if (e.target instanceof HTMLSelectElement)
              window.eventEvidence.push({ type, trusted: e.isTrusted, value: e.target.value });
          },
          true,
        );
    }, tier);
    let release;
    const gate = new Promise((r) => (release = r));
    await page.route('**/main.js', async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('http://127.0.0.1:4301/', { waitUntil: 'commit' });
    await page.waitForSelector('#eager select');
    await page.evaluate(() => {
      window.retained = [...document.querySelectorAll('hy-select')].map((host) => ({
        host,
        select: host.querySelector('select'),
        trigger: host.querySelector('button'),
        id: host.querySelector('select').id,
      }));
    });
    assert.equal(await page.evaluate(() => !!window.ng), false, 'bootstrap must be blocked');
    await page.locator('#eager select').focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('#eager select').inputValue(), 'string:second');
    const events = await page.evaluate(() => window.eventEvidence);
    assert(
      events.some((e) => e.type === 'change' && e.trusted && e.value === 'string:second'),
      'must use trusted browser selection, not dispatchEvent/selectOption',
    );
    release();
    await page.waitForFunction(() => document.querySelector('#booted').textContent === 'true');
    await page.waitForFunction(
      () => document.querySelector('#eager .model').textContent === 'second',
    );
    assert.equal(await page.locator('#eager select').inputValue(), 'string:second');
    assert.equal(
      await page
        .locator('#eager select')
        .evaluate((s) => !s.hidden && s === document.activeElement),
      true,
    );
    // Deferred SSR remains usable after root bootstrap, before interaction hydrates it.
    assert.equal(await page.locator('#deferred select').evaluate((s) => !s.hidden), true);
    await page.locator('#deferred select').focus();
    await page.keyboard.press('ArrowDown');
    await page
      .waitForFunction(
        () => document.querySelector('#deferred .model').textContent === 'second',
        undefined,
        {
          timeout: 5000,
        },
      )
      .catch(async (e) => {
        console.log(
          await page.evaluate(() => ({
            html: document.querySelector('#deferred').outerHTML,
            events: window.eventEvidence,
          })),
          errors,
        );
        throw e;
      });
    await page.locator('#outside').click();
    await page.waitForFunction(
      (t) => [...document.querySelectorAll('select')].every((s) => s.hidden === (t !== 'low')),
      tier,
    );
    const identity = await page.evaluate(() =>
      window.retained.every(
        (r) =>
          r.host.isConnected &&
          r.host.querySelector('select') === r.select &&
          r.host.querySelector('button') === r.trigger &&
          r.select.id === r.id,
      ),
    );
    assert(identity, 'hydration must retain nodes and IDs');
    assert.equal(await page.locator('#tier').textContent(), tier, 'persisted capability override');
    // Capability changes must not replace a focused trigger or open overlay.
    if (tier !== 'low') {
      await page.locator('#eager [role="combobox"]').focus();
      await page.keyboard.press('ArrowDown');
      await page.waitForSelector('.hy-select__panel');
      await page.evaluate(() => document.querySelector('#low').click());
      assert.equal(await page.locator('#eager select').evaluate((s) => s.hidden), true);
      await page.keyboard.press('Escape');
      await page.locator('#outside').click();
      await page.waitForFunction(() =>
        [...document.querySelectorAll('select')].every((s) => !s.hidden),
      );
    }
    assert.deepEqual(errors, []);
    results.push({
      tier,
      trustedEvents: await page.evaluate(() => window.eventEvidence),
      identity,
      errors,
    });
    await context.close();
  }
  console.log(JSON.stringify({ passed: results.length, results }, null, 2));
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
