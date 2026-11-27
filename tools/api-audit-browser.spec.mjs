import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { mkdtemp, mkdir, rmdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { test } from 'node:test';

const tools = process.env.HYALO_BROWSER_TOOLS;
assert.ok(tools, 'Set HYALO_BROWSER_TOOLS to a directory containing Playwright');
const require = createRequire(join(tools, 'package.json'));
const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('playwright/test');
const base = process.env.HYALO_BASE_URL ?? 'http://127.0.0.1:4200';

for (const [engine, type, width] of [
  ['chromium', chromium, 360],
  ['webkit', webkit, 320],
]) {
  test(`${engine} touch composer keeps Persian drafts and Send above a simulated keyboard`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({
        viewport: { width, height: 740 },
        isMobile: true,
        hasTouch: true,
      });
      await page.goto(base + '/blocks/marketplace-chat', { waitUntil: 'networkidle' });
      const composer = page.locator('.marketplace-composer');
      const bar = composer.locator('.marketplace-actions');
      const input = composer.getByRole('textbox', { name: 'Message Maya Chen' });
      const send = composer.getByRole('button', { name: 'Send message' });
      await input.tap();
      const single = (await input.boundingBox()).height;
      await page.evaluate(() => {
        // Android and iOS can resize only the visual viewport when the keyboard appears.
        Object.defineProperty(visualViewport, 'height', { configurable: true, value: 285 });
        visualViewport.dispatchEvent(new Event('resize'));
      });
      const bottom = () => bar.evaluate((element) =>
        element.getBoundingClientRect().bottom - visualViewport.offsetTop);
      await expect.poll(bottom).toBeLessThanOrEqual(285);

      const persian = 'سلام، برای هماهنگی زمان تحویل صندلی پیام می‌دهم. لطفاً زمان مناسب را به من اطلاع بدهید.';
      await input.fill(persian);
      await expect(input).toBeFocused();
      await expect(input).toHaveCSS('direction', 'rtl');
      assert.ok((await input.boundingBox()).width >= 150);
      assert.ok((await input.boundingBox()).height > single);
      await expect.poll(bottom).toBeLessThanOrEqual(285);

      const mixed = `قرار ملاقات شنبه\nPickup at 10:00\n${persian.repeat(6)}`;
      await input.fill(mixed);
      await expect(input).toHaveValue(mixed);
      assert.ok(await input.evaluate((element) => element.scrollHeight > element.clientHeight));
      await expect.poll(bottom).toBeLessThanOrEqual(285);
      await page.evaluate(() => {
        Object.defineProperty(visualViewport, 'height', { configurable: true, value: 155 });
        visualViewport.dispatchEvent(new Event('resize'));
      });
      await expect.poll(bottom).toBeLessThanOrEqual(155);
      const sendBox = await send.boundingBox();
      assert.ok(sendBox.x >= 0 && sendBox.x + sendBox.width <= width);

      await input.evaluate((element) => element.blur());
      await page.evaluate(() => {
        Reflect.deleteProperty(visualViewport, 'height');
        visualViewport.dispatchEvent(new Event('resize'));
      });
      await expect(input).toHaveValue(mixed);
      await input.fill(persian);
      await send.tap();
      await expect(page.locator('.marketplace-bubble').filter({ hasText: persian })).toBeVisible();
      await expect(input).toHaveValue('');
    } finally {
      await browser.close();
    }
  });
}

for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
  test(`${engine} chat composer grows with drafts and compacts above the scrolled history`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 420, height: 750 } });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(base + '/blocks/marketplace-chat', { waitUntil: 'networkidle' });
      const composer = page.locator('.marketplace-composer');
      const input = composer.getByRole('textbox', { name: 'Message Maya Chen' });
      await input.fill('Quick note');
      const single = (await input.boundingBox()).height;
      await input.press('End');
      await input.press('Enter');
      await input.press('A');
      await expect(input).toHaveValue('Quick note\nA');
      await expect(input).toBeFocused();
      assert.ok((await input.boundingBox()).height > single);
      await input.fill('A long message that wraps naturally on a narrow screen. '.repeat(10));
      assert.ok((await input.boundingBox()).height > single);
      await input.fill('');
      assert.equal((await input.boundingBox()).height, single);

      const history = page.getByRole('region', { name: 'Conversation with Maya Chen' });
      await history.evaluate((element) => { element.scrollTop = 0; });
      await expect(composer).not.toHaveAttribute('data-history-scrolled', 'true');
      const resting = (await composer.boundingBox()).height;
      await history.evaluate((element) => { element.scrollTop = element.scrollHeight; });
      await expect(composer).toHaveAttribute('data-history-scrolled', 'true');
      await expect.poll(async () => (await composer.boundingBox()).height).toBeLessThan(resting);
      await expect(composer.getByRole('button', { name: 'Send message' })).toBeVisible();

      await page.locator('[data-message-id="seller-1"] .marketplace-bubble').click({ button: 'right' });
      const reactLabel = page.getByRole('menuitem', { name: 'React', exact: true }).locator('span').first();
      const replyLabel = page.getByRole('menuitem', { name: 'Reply', exact: true }).locator('span').first();
      await expect(reactLabel).toHaveCSS('display', 'flex');
      assert.ok(Math.abs((await reactLabel.boundingBox()).x - (await replyLabel.boundingBox()).x) < 1);
      await reactLabel.hover();
      await expect(page.getByRole('menuitem', { name: /Thumbs up/ })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} notification panel stays the same size throughout opening`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 900, height: 625 } });
      await page.goto(base + '/blocks/notifications', { waitUntil: 'networkidle' });
      const trigger = page.getByRole('button', { name: 'Open notifications' });
      await trigger.scrollIntoViewIfNeeded();
      const frames = await trigger.evaluate((button) => new Promise((resolve) => {
        const samples = [];
        const started = performance.now();
        function sample() {
          const panel = document.querySelector('.hy-popover:has(.notification-panel)');
          if (panel?.dataset.state === 'open' && Number(getComputedStyle(panel).opacity) > 0) {
            const box = panel.getBoundingClientRect();
            samples.push([box.x, box.y, box.width, box.height]);
          }
          if (performance.now() - started < 550) requestAnimationFrame(sample);
          else resolve(samples);
        }
        button.click();
        requestAnimationFrame(sample);
      }));
      assert.ok(frames.length > 2);
      const settled = frames.at(-1);
      assert.ok(frames.every((frame) => frame.every((value, index) =>
        Math.abs(value - settled[index]) <= 1)), JSON.stringify(frames.slice(0, 8)));
      await expect(page.getByRole('dialog', { name: 'Notifications', exact: true })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} polished component controls preserve their interactions`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 820 } });
      const go = (path) => page.goto(base + path, { waitUntil: 'networkidle' });
      await go('/blocks/marketplace-chat');
      const listToggle = page.getByRole('button', { name: 'Conversations', exact: true });
      if (await listToggle.isVisible()) await listToggle.click();
      for (const name of ['New chat', 'Emoji', 'Attach files', 'Record voice', 'Send message']) {
        await expect(page.getByRole('button', { name, exact: true }).locator('svg')).toBeVisible();
      }
      await expect(page.locator('.marketplace-filters')).toHaveCSS('flex-wrap', 'nowrap');
      await expect(page.locator('.marketplace-filters')).toHaveCSS('scrollbar-width', 'none');

      await go('/components/sidebar');
      const sidebar = page.locator('hy-sidebar');
      await sidebar.getByRole('button', { name: 'Collapse navigation' }).click();
      await expect.poll(() => sidebar.evaluate((rail) => {
        const bounds = rail.getBoundingClientRect();
        return Array.from(rail.querySelectorAll('a hy-icon')).every((icon) => {
          const box = icon.getBoundingClientRect();
          return box.left >= bounds.left && box.right <= bounds.right;
        });
      })).toBe(true);
      await expect(sidebar.locator('ul').first()).toHaveCSS('list-style-type', 'none');

      await go('/components/otp');
      const code = page.getByRole('group', { name: 'Code with separate inputs' });
      const first = code.getByRole('textbox', { name: 'Character 1 of 6' });
      const second = code.getByRole('textbox', { name: 'Character 2 of 6' });
      await first.fill('۰');
      await expect(first).toHaveValue('0');
      await expect(second).toBeFocused();
      await second.press('Backspace');
      await expect(first).toHaveValue('');
      await expect(first).toBeFocused();

      await go('/components/multi-select');
      await page.locator('hy-multi-select').first().getByRole('combobox').press('ArrowDown');
      const options = page.locator('.options.hy-glass').getByRole('listbox');
      await expect(options.locator('[data-active="true"]')).toHaveCount(1);
      await expect(options.getByRole('option', { name: 'Design', selected: true }).locator('hy-icon')).toBeVisible();

      await go('/components/kanban');
      const destination = page.getByRole('combobox', { name: 'Move Review design tokens to column' });
      await destination.press('Enter');
      await page.locator('.hy-select__panel').getByRole('option', { name: 'In progress' }).click();
      await expect(page.getByRole('button', { name: 'Review design tokens', exact: true })).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: 'Review design tokens moved to In progress' })).toBeAttached();

      await go('/components/tab-bar');
      const active = page.locator('hy-tab-bar a[aria-current="page"]');
      const indicator = page.locator('hy-tab-bar .active-indicator');
      await expect(indicator).toBeVisible();
      assert.ok((await indicator.boundingBox()).width < (await active.boundingBox()).width);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} notification and settings dropdowns use compact themed menus`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
      await page.goto(base + '/blocks/notifications', { waitUntil: 'networkidle' });
      const preview = page.getByRole('combobox', { name: 'Preview notification state' });
      const triggerWidth = (await preview.locator('..').boundingBox()).width;
      await preview.press('Enter');
      const menu = page.locator('.hy-select__panel.hy-glass').getByRole('listbox');
      await expect(menu).toBeVisible();
      await expect.poll(async () =>
        Math.abs((await menu.locator('..').boundingBox()).width - triggerWidth),
      ).toBeLessThan(4);
      await menu.getByRole('option', { name: 'Loading' }).click();
      await expect(preview).toContainText('Loading');
      await expect(page.getByText('Checking for updates…', { exact: true })).toBeVisible();
      await expect(menu).toHaveCount(0);
      await preview.press('Enter');
      await menu.getByRole('option', { name: 'Ready' }).click();
      await expect(page.getByText('Order confirmed', { exact: true })).toBeVisible();

      await page.getByRole('button', { name: 'Display settings' }).click();
      const settings = page.getByRole('dialog', { name: 'Display settings' });
      const material = settings.getByRole('combobox', { name: 'Material' });
      await material.press('Enter');
      await settings.getByRole('option', { name: 'Solid', exact: true }).click();
      await expect(settings).toBeVisible();
      await expect(material).toContainText('Solid');
    } finally {
      await browser.close();
    }
  });

  test(`${engine} themed controls and compact icon actions`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1200, height: 650 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/dashboard', { waitUntil: 'networkidle' });
      const status = page.locator('hy-filter-bar').getByRole('combobox', { name: /status/i });
      await status.press('Enter');
      const list = page.locator('.hy-select__panel.hy-glass').getByRole('listbox');
      await expect(list.getByRole('option', { name: 'Active' })).toBeVisible();
      await list.getByRole('option', { name: 'Active' }).click();
      await expect(status).toContainText('Active');
      const sidebar = page.locator('hy-sidebar').first();
      const expandedWidth = (await sidebar.boundingBox()).width;
      await sidebar.getByRole('button', { name: 'Collapse navigation' }).click();
      await expect.poll(async () => (await sidebar.boundingBox()).width).toBeLessThan(expandedWidth - 40);
      await sidebar.getByRole('button', { name: 'Expand navigation' }).click();
      await expect.poll(async () => (await sidebar.boundingBox()).width).toBeGreaterThan(expandedWidth - 2);

      await page.goto(base + '/components/combobox', { waitUntil: 'networkidle' });
      const combo = page.getByRole('combobox').first();
      await combo.press('ArrowDown');
      const options = page.locator('hy-combobox .options, .options.hy-glass').first();
      await expect(options.getByRole('option').first()).toBeVisible();
      await expect(options.locator('[data-active="true"]')).toHaveCount(1);
      assert.equal(await options.getByRole('option').nth(2).evaluate((row) => getComputedStyle(row).outlineStyle), 'none');

      await page.goto(base + '/components/code-block', { waitUntil: 'networkidle' });
      const copy = page.getByRole('button', { name: 'Copy Table import', exact: true });
      await expect(copy.locator('svg')).toBeVisible();
      await expect(copy).toHaveText('');

      await page.goto(base + '/components/text-field', { waitUntil: 'networkidle' });
      const secret = page.getByLabel('New password');
      await expect(secret).toHaveAttribute('type', 'password');
      await secret.fill('example-password');
      await page.getByRole('button', { name: 'Show password' }).click();
      await expect(secret).toHaveAttribute('type', 'text');
      await expect(secret).toHaveValue('example-password');
      await expect(secret).toBeFocused();
      await page.getByRole('button', { name: 'Hide password' }).click();
      await expect(secret).toHaveAttribute('type', 'password');
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} workspace layout and grid use functional icon controls`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(base + '/components/dashboard-layout', { waitUntil: 'networkidle' });
      const layout = page.getByRole('group', { name: 'Operations dashboard' });
      const tile = layout.getByRole('region', { name: 'Capacity' });
      const handle = tile.getByRole('button', { name: /Move Capacity/ });
      await expect(handle).toHaveCSS('cursor', 'grab');
      await expect(tile.getByRole('button', { name: /Resize Capacity/ })).toHaveCSS('cursor', 'nwse-resize');
      await handle.click();
      await tile.getByRole('button', { name: 'Move inline end' }).click();
      await expect(tile).toContainText('Column 2');
      await page.getByRole('button', { name: 'Save layout' }).click();
      await expect(page.getByText('Layout saved', { exact: true })).toBeVisible();
      await handle.press('ArrowLeft');
      await expect(tile).toContainText('Column 1');
      await page.getByRole('button', { name: 'Restore layout' }).click();
      await expect(tile).toContainText('Column 2');
      const resize = tile.getByRole('button', { name: /Resize Capacity/ });
      await resize.click();
      await tile.getByRole('button', { name: 'Resize inline end' }).click();
      await expect(tile).toContainText('6 × 3');
      const grip = await resize.boundingBox();
      assert.ok(grip);
      await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
      await page.mouse.down();
      await page.mouse.move(grip.x - 55, grip.y + grip.height / 2, { steps: 5 });
      await page.mouse.up();
      await expect(tile).toContainText('5 × 3');

      await page.goto(base + '/components/data-grid', { waitUntil: 'networkidle' });
      const grid = page.locator('hy-data-grid');
      await expect(grid.getByRole('button', { name: 'Export CSV' }).locator('svg')).toBeVisible();
      const header = grid.locator('.header');
      await expect.poll(() => header.evaluate((row) => {
        const last = row.lastElementChild;
        return Math.abs(row.getBoundingClientRect().right - last.getBoundingClientRect().right);
      })).toBeLessThan(2);
      await grid.locator('summary[aria-label="Columns"]').click();
      await expect(grid.getByRole('button', { name: 'Move Team earlier' }).locator('svg')).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} anchored calendars fit the viewport and load Vazirmatn`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 620, height: 440 } });
      await page.goto(base + '/components/date-picker', { waitUntil: 'networkidle' });
      const dates = page.locator('hy-date-picker');
      const fit = async () => {
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('button', { name: 'Previous month' })).toBeVisible();
        const bounds = await dialog.boundingBox();
        assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 441);
        await dialog.getByRole('button', { name: 'Close calendar' }).click();
        await expect(dialog).toHaveCount(0);
      };
      const trigger = dates.first().getByRole('button', { name: 'Calendar', exact: true });
      await expect(trigger.locator('svg')).toBeVisible();
      await trigger.click();
      await fit();
      await page.locator('hy-date-range hy-date-picker').first().getByRole('button', { name: 'Calendar', exact: true }).click();
      await fit();
      const persian = page.locator('[lang="fa"] hy-date-picker input');
      await expect(persian).toHaveCSS('font-family', /Vazirmatn/);
      const loaded = await page.evaluate(async () =>
        (await document.fonts.load('16px Vazirmatn', 'تاریخ')).some((font) => font.status === 'loaded'),
      );
      assert.equal(loaded, true);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} building-block dashboard scroll, scheduler chevron and chat reply`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      await page.goto(base + '/dashboard', { waitUntil: 'networkidle' });
      const content = page.locator('.workspace-content');
      const sidebar = page.locator('.workspace > hy-sidebar');
      const start = await sidebar.boundingBox();
      const scroll = await content.evaluate((el) => {
        el.scrollTop = 500;
        return { top: el.scrollTop, room: el.scrollHeight - el.clientHeight };
      });
      assert.ok(start && scroll.room >= 500 && scroll.top >= 500);
      const end = await sidebar.boundingBox();
      assert.ok(end && Math.abs(end.y - start.y) <= 1);

      await page.goto(base + '/components/scheduler', { waitUntil: 'networkidle' });
      const control = page.locator('.view-select').first();
      const select = control.getByRole('combobox');
      const icon = select.locator('hy-icon');
      await expect(select).toBeEnabled();
      await expect(select).toHaveCSS('appearance', 'none');
      const box = await select.boundingBox();
      const mark = await icon.boundingBox();
      assert.ok(box && mark && Math.abs(box.x + box.width - (mark.x + mark.width)) <= 2);
      assert.ok(Math.abs(box.y + box.height / 2 - mark.y - mark.height / 2) <= 1);

      await page.goto(base + '/blocks/marketplace-chat', { waitUntil: 'networkidle' });
      const bubble = page.locator('[data-message-id="seller-1"] .marketplace-bubble');
      await bubble.click({ button: 'right' });
      const reply = page.getByRole('menuitem', { name: 'Reply', exact: true });
      await expect(reply).toBeVisible();
      await reply.click();
      await expect(page.getByText('Replying to Maya Chen', { exact: true })).toBeVisible();
      const composer = page.locator('.marketplace-composer');
      await composer.locator('textarea').fill('Can you confirm pickup?');
      await composer.locator('button[type="submit"]').click();
      await expect(page.locator('.marketplace-history .marketplace-bubble').filter({ hasText: 'Can you confirm pickup?' })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} dialog geometry, focus, dismissal and drawer gesture`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 800 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/components/dialog');
      const trigger = page.getByRole('button', { name: 'Open geometry dialog' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Dialog geometry' });
      await expect(dialog.getByRole('button', { name: 'Widen' })).toBeFocused();
      await expect(dialog).toHaveAccessibleDescription('Dimensions update on the same panel.');
      await expect.poll(async () => (await dialog.boundingBox())?.width).toBeCloseTo(352, 0);
      await expect(page.getByText('Geometry dialog opened', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Widen' }).click();
      await expect.poll(async () => (await dialog.boundingBox())?.width).toBeCloseTo(480, 0);
      await dialog.getByRole('button', { name: 'Move toward top' }).click();
      await expect.poll(async () => (await dialog.boundingBox())?.y).toBeCloseTo(24, 0);
      const move = dialog.getByRole('button', { name: 'Move with arrow keys or drag' });
      await move.focus();
      await page.keyboard.press('ArrowDown');
      await expect.poll(async () => (await dialog.boundingBox())?.y).toBeCloseTo(40, 0);
      const handleBox = await move.boundingBox();
      assert.ok(handleBox);
      await page.mouse.move(handleBox.x + 10, handleBox.y + 10);
      await page.mouse.down();
      await page.mouse.move(handleBox.x + 35, handleBox.y + 30, { steps: 6 });
      await page.mouse.up();
      await expect.poll(async () => (await dialog.boundingBox())?.y).toBeCloseTo(60, 0);
      await move.focus();
      await page.keyboard.press('Home');
      await expect.poll(async () => (await dialog.boundingBox())?.y).toBeCloseTo(24, 0);
      await dialog.getByRole('button', { name: 'Maximize', exact: true }).click();
      await expect.poll(async () => (await dialog.boundingBox())?.width).toBeCloseTo(1024, 0);
      await expect.poll(async () => (await dialog.boundingBox())?.height).toBeCloseTo(800, 0);
      await dialog.getByRole('button', { name: 'Restore size' }).click();
      await expect.poll(async () => (await dialog.boundingBox())?.width).toBeCloseTo(480, 0);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeVisible();
      await page.locator('.docs-geometry-backdrop').click({ position: { x: 10, y: 10 } });
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(
        page.getByRole('status').filter({ hasText: 'Closed by backdrop' }),
      ).toBeVisible();

      await page.goto(base + '/components/drawer');
      await page.getByRole('button', { name: 'From top' }).click();
      const drawer = page.getByRole('dialog', { name: 'Filters' });
      await expect.poll(async () => (await drawer.boundingBox())?.y).toBeCloseTo(0, 0);
      await drawer.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(drawer).toHaveCount(0);
      await page.getByRole('button', { name: 'Guarded sheet' }).click();
      const checkbox = drawer.getByRole('checkbox', { name: 'In stock' });
      await expect(checkbox).toBeFocused();
      const handle = drawer.locator('.hy-drawer__grabber');
      await expect(handle).toBeVisible();
      await expect
        .poll(async () => {
          const box = await drawer.boundingBox();
          return box ? box.y + box.height : -1;
        })
        .toBeCloseTo(800, 0);
      const box = await handle.boundingBox();
      assert.ok(box);
      const x = box.x + box.width / 2,
        y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, Math.min(795, y + 235), { steps: 8 });
      await page.mouse.up();
      await expect(drawer.getByRole('status')).toHaveText('Filters stay open after the swipe.');
      await expect(checkbox).toBeFocused();
      await expect
        .poll(async () => {
          const rect = await drawer.boundingBox();
          return rect ? rect.y + rect.height : -1;
        })
        .toBeCloseTo(800, 0);
      await drawer.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(drawer).toHaveCount(0);
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} dialog deferred autofocus and restoration`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 800 } });
      await page.goto(base + '/components/dialog', { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: '.docs-geometry-pane > .cdk-dialog-container { animation-duration: 350ms !important; }' });
      const trigger = page.getByRole('button', { name: 'Open geometry dialog' });
      const dialog = page.getByRole('dialog', { name: 'Dialog geometry' });
      const widen = dialog.getByRole('button', { name: 'Widen' });
      const close = dialog.getByRole('button', { name: 'Close geometry dialog' });
      await page.evaluate(() => {
        document.addEventListener('focusin', (event) => {
          const element = event.target;
          if (element.id === 'geometry-dialog' || element.id === 'geometry-resize') {
            document.body.dataset.geometryFocus = [document.body.dataset.geometryFocus, element.id].filter(Boolean).join(' ');
          }
        });
      });
      await trigger.press('Enter');
      await expect(dialog).toBeFocused();
      await expect(widen).toBeFocused();
      assert.equal(await page.locator('body').getAttribute('data-geometry-focus'), 'geometry-dialog geometry-resize');
      await close.press('Enter');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();

      await trigger.press('Enter');
      await expect(dialog).toBeFocused();
      await close.press('Tab');
      await expect(widen).toBeFocused();
      await close.focus();
      await expect(page.getByText('Geometry dialog opened', { exact: true })).toBeVisible();
      await expect(close).toBeFocused();
      await close.press('Enter');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await trigger.press('Enter');
      await expect(widen).toBeFocused();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} docked drawer modes, local backdrop and RTL geometry`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 800 }, reducedMotion: 'reduce' });
      await page.goto(base + '/components/drawer', { waitUntil: 'networkidle' });
      const layout = page.locator('hy-drawer-layout');
      await layout.scrollIntoViewIfNeeded();
      const content = layout.locator('.content');
      const toggle = layout.getByRole('button', { name: 'Toggle filters' });
      const drawer = layout.getByRole('complementary', { name: 'Docked filters' });
      const mode = (name) => page.getByRole('group', { name: 'Drawer mode' }).getByRole('button', { name, exact: true });
      const side = (name) => page.getByRole('group', { name: 'Drawer side' }).getByRole('button', { name, exact: true });
      const baseline = await content.boundingBox();
      assert.ok(baseline);
      await toggle.press('Enter');
      await expect(drawer).toBeVisible();
      const panel = await drawer.boundingBox();
      assert.ok(panel);
      let bounds = await content.boundingBox();
      assert.ok(bounds && Math.abs(bounds.width + panel.width - baseline.width) <= 1);
      assert.ok(Math.abs(bounds.x - baseline.x - panel.width) <= 1);
      await expect(toggle).toBeFocused();
      await mode('push').click();
      await expect(layout).toHaveAttribute('data-mode', 'push');
      bounds = await content.boundingBox();
      assert.ok(bounds && Math.abs(bounds.width - baseline.width) <= 1);
      assert.ok(Math.abs(bounds.x - baseline.x - panel.width) <= 1);
      await expect(content).toHaveAttribute('inert', '');
      await expect(layout.locator('.drawer')).toBeFocused();
      await layout.locator('.drawer').press('Escape');
      await expect(toggle).toBeFocused();
      await expect(drawer).toHaveCount(0);

      await mode('over').click();
      await expect(layout).toHaveAttribute('data-mode', 'over');
      await toggle.press('Enter');
      bounds = await content.boundingBox();
      assert.ok(bounds && Math.abs(bounds.x - baseline.x) <= 1 && Math.abs(bounds.width - baseline.width) <= 1);
      await layout.locator('.backdrop').click({ position: { x: baseline.width - 8, y: 8 } });
      await expect(drawer).toHaveCount(0);
      await expect(toggle).toBeFocused();
      await layout.evaluate((el) => { el.dir = 'rtl'; });
      await side('end').click();
      await expect(layout).toHaveAttribute('data-side', 'end');
      await mode('side').click();
      await toggle.press('Enter');
      await expect(drawer).toBeVisible();
      const rtlPanel = await drawer.boundingBox();
      bounds = await content.boundingBox();
      assert.ok(rtlPanel && bounds);
      assert.ok(Math.abs(rtlPanel.x - baseline.x) <= 1);
      assert.ok(Math.abs(bounds.x - baseline.x - rtlPanel.width) <= 1);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} two-axis virtual range, RTL alignment and loading rows`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({
        viewport: { width: 1024, height: 800 },
        reducedMotion: 'reduce',
      });
      await page.goto(base + '/components/virtual-list');
      const viewport = page.getByRole('list', { name: 'Activity events' });
      const firstGeometry = () =>
        viewport.evaluate((node) => ({
          top: node.scrollTop,
          left: node.scrollLeft,
          width: node.clientWidth,
          height: node.clientHeight,
          count: node.querySelectorAll('[role="listitem"]').length,
        }));
      await page.getByRole('button', { name: 'Horizontal', exact: true }).click();
      await expect(viewport).toHaveAttribute('data-orientation', 'horizontal');
      await viewport.focus();
      await page.keyboard.press('End');
      await expect(viewport.locator('[aria-posinset="10000"]')).toBeFocused();
      assert.ok((await firstGeometry()).left > 1_000_000);
      await page.getByRole('button', { name: 'Grid', exact: true }).click();
      await expect(viewport).toHaveAttribute('data-orientation', 'grid');
      await viewport.evaluate((node) => node.setAttribute('dir', 'rtl'));
      // Use the public controller against actual browser scrolling and measured dimensions.
      await viewport.evaluate((node) =>
        window.ng.getComponent(node).scrollToIndex(422, { align: 'center' }),
      );
      const index = viewport.locator('[aria-posinset="423"]');
      await expect(index).toBeVisible();
      const grid = await firstGeometry();
      assert.ok(grid.left < 0 && grid.top > 0);
      assert.ok(grid.count < 250);
      const delta = await index.evaluate((cell) => {
        const parent = cell.closest('hy-virtual-list');
        const box = cell.getBoundingClientRect(),
          view = parent.getBoundingClientRect();
        return [
          box.x + box.width / 2 - view.x - parent.clientLeft - parent.clientWidth / 2,
          box.y + box.height / 2 - view.y - parent.clientTop - parent.clientHeight / 2,
        ];
      });
      assert.ok(
        delta.every((value) => Math.abs(value) <= 2),
        String(delta),
      );
      await viewport.evaluate((node) =>
        window.ng.getComponent(node).scrollToIndex(422, { align: 'nearest' }),
      );
      assert.deepEqual(await firstGeometry(), grid);
      for (const [align, expected] of [
        ['start', 0],
        ['end', 1],
      ]) {
        await viewport.evaluate(
          (node, value) => window.ng.getComponent(node).scrollToIndex(435, { align: value }),
          align,
        );
        const row = viewport.locator('[aria-posinset="436"]');
        const actual = await row.evaluate((cell, towardEnd) => {
          const parent = cell.closest('hy-virtual-list');
          const box = cell.getBoundingClientRect(),
            view = parent.getBoundingClientRect();
          return towardEnd
            ? [
                box.bottom,
                box.left,
                view.top + parent.clientTop + parent.clientHeight,
                view.left + parent.clientLeft,
              ]
            : [
                box.top,
                box.right,
                view.top + parent.clientTop,
                view.left + parent.clientLeft + parent.clientWidth,
              ];
        }, expected);
        assert.ok(
          Math.abs(actual[0] - actual[2]) <= 2 && Math.abs(actual[1] - actual[3]) <= 2,
          String(actual),
        );
      }
      await page.getByRole('button', { name: 'Preview loading' }).click();
      await expect(viewport).toHaveAttribute('aria-busy', 'true');
      await expect(viewport.locator('hy-skeleton').first()).toBeVisible();
      await expect(viewport).toHaveAttribute('aria-busy', 'false');
      await expect(viewport.locator('hy-skeleton')).toHaveCount(0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} upload and retry controls and RTL divider inset`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({
        viewport: { width: 375, height: 812 },
        reducedMotion: 'reduce',
      });
      await page.goto(base + '/components/file-upload');
      await page.waitForFunction(() =>
        Boolean(window.ng?.getComponent(document.querySelector('hy-file-upload'))),
      );
      await page.locator('hy-file-upload input[type="file"]:not([webkitdirectory])').setInputFiles({
        name: 'invoice.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF demo'),
      });
      const upload = page.locator('hy-file-upload').filter({ has: page.locator('input:not([webkitdirectory])') });
      await upload.getByRole('button', { name: 'Upload', exact: true }).click();
      await expect(
        upload.getByRole('progressbar', { name: 'Upload progress for invoice.pdf' }),
      ).toBeVisible();
      await upload.getByRole('button', { name: 'Cancel upload' }).click();
      await expect(upload.getByRole('status').filter({ hasText: 'Cancelled' })).toBeVisible();
      await upload.getByRole('button', { name: 'Retry upload' }).click();
      await expect(upload.getByRole('status').filter({ hasText: 'Completed' })).toBeVisible();
      await page.goto(base + '/components/divider');
      const divider = page.locator('hy-divider[aria-orientation="vertical"]');
      await expect(divider).toBeVisible();
      const ltr = await divider.evaluate((node) => {
        const rect = node.getBoundingClientRect(),
          prior = node.previousElementSibling.getBoundingClientRect();
        return rect.left - prior.right;
      });
      await divider.evaluate((node) => {
        node.parentElement.dir = 'rtl';
      });
      const rtl = await divider.evaluate((node) => {
        const rect = node.getBoundingClientRect(),
          prior = node.previousElementSibling.getBoundingClientRect();
        return prior.left - rect.right;
      });
      assert.ok(ltr >= 20 && Math.abs(ltr - rtl) <= 1, `${ltr}/${rtl}`);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} table replacement templates, sort cycle and structured skeleton`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({
        viewport: { width: 1024, height: 800 },
        reducedMotion: 'reduce',
      });
      await page.goto(base + '/components/table');
      const region = page.getByRole('region', { name: 'Recent projects' });
      await page.getByRole('button', { name: 'Loading preview' }).click();
      await expect(region).toHaveAttribute('aria-busy', 'true');
      await expect(region.getByRole('cell', { name: 'Fetching project records' })).toBeVisible();
      await page.getByRole('button', { name: 'Empty preview' }).click();
      await expect(region.getByRole('cell', { name: 'No projects match' })).toBeVisible();
      await page.getByRole('button', { name: 'Show projects' }).click();
      const sort = region.getByRole('button', { name: 'Project', exact: true });
      const column = region.getByRole('columnheader', { name: 'Project', exact: true });
      for (const order of ['descending', 'ascending', 'none']) {
        await sort.click();
        await expect(column).toHaveAttribute('aria-sort', order);
      }
      await page.goto(base + '/components/skeleton');
      const skeletons = page.locator('hy-skeleton-region');
      await expect(skeletons.getByRole('status')).toHaveText('Loading studio profile');
      await expect(skeletons.locator('hy-skeleton[aria-hidden="true"]')).toHaveCount(4);
      const media = skeletons.locator('hy-skeleton[data-shape="rect"]');
      await expect.poll(async () => (await media.boundingBox())?.height).toBeCloseTo(112, 0);
      await page.getByRole('button', { name: 'Show content' }).click();
      await expect(skeletons).toHaveCount(0);
      await expect(page.getByText('Atelier studio', { exact: true })).toBeVisible();
      await page.goto(base + '/components/accordion');
      const returns = page.getByRole('button', { name: 'Returns', exact: true });
      await returns.click();
      await expect(page.getByText('Returns opened', { exact: true })).toBeVisible();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await returns.click();
      await expect(page.getByText('Returns closed', { exact: true })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} field geometry and select draft, empty state and width tracking`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({
        viewport: { width: 1024, height: 800 },
        reducedMotion: 'reduce',
      });
      await page.goto(base + '/components/text-field');
      const input = page.getByRole('textbox', { name: 'Order reference' });
      const relativeLabel = () =>
        input.evaluate((node) => {
          const label = node.labels[0].getBoundingClientRect(),
            box = node.closest('hy-field').getBoundingClientRect();
          return label.y - box.y;
        });
      const resting = await relativeLabel();
      await input.focus();
      await expect.poll(relativeLabel).toBeLessThan(resting - 8);
      await input.fill('AB 123');
      const feedback = page.getByRole('button', { name: 'Toggle reference feedback' });
      const fieldHeight = () =>
        input.evaluate((node) => node.closest('hy-field').getBoundingClientRect().height);
      const before = await fieldHeight();
      await feedback.click();
      await expect(input).toHaveAccessibleDescription('Enter the full order reference.');
      await expect.poll(relativeLabel).toBeLessThan(resting - 8);
      assert.ok(Math.abs((await fieldHeight()) - before) <= 1);
      const notes = page.getByRole('textbox', { name: 'Notes that grow' });
      const initialHeight = (await notes.boundingBox()).height;
      await notes.fill('one\ntwo\nthree\nfour\nfive');
      await expect
        .poll(async () => (await notes.boundingBox()).height)
        .toBeGreaterThan(initialHeight + 20);

      await page.goto(base + '/components/select');
      const select = page
        .getByRole('combobox', { name: 'Custom tag' })
        .and(page.locator('button.hy-select__trigger'));
      await select.click();
      await expect(page.getByText('No saved tags', { exact: true })).toBeVisible();
      const panel = page.locator('.hy-select__panel').filter({ hasText: 'No saved tags' });
      const width = (await select.boundingBox()).width;
      await expect
        .poll(async () => (await panel.boundingBox()).width)
        .toBeGreaterThanOrEqual(width - 1);
      await select.evaluate((node) => {
        node.closest('hy-field').style.inlineSize = '20rem';
      });
      await expect.poll(async () => (await select.boundingBox()).width).toBeLessThan(width - 10);
      await expect.poll(async () => (await panel.boundingBox()).width).toBeLessThan(width - 10);
      const draft = panel.getByRole('textbox', { name: 'Add option' });
      await select.focus();
      await page.keyboard.press('Tab');
      await expect(draft).toBeFocused();
      await draft.fill('ab');
      await draft.press('Enter');
      await expect(page.getByText('Use at least three characters.', { exact: true })).toBeVisible();
      await expect(draft).toHaveValue('ab');
      await draft.pressSequentially(' c');
      await draft.press('Enter');
      await expect(select).toContainText('ab c');
    } finally {
      await browser.close();
    }
  });

  test(`${engine} popover mounting, anchor geometry and dismissal policy`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({
        viewport: { width: 1024, height: 850 },
        reducedMotion: 'reduce',
      });
      await page.goto(base + '/components/tooltip-popover');
      const trigger = page.getByRole('button', { name: 'Collection details' });
      const pane = page.getByRole('dialog', { name: 'Collection details' });
      await trigger.focus();
      await trigger.hover();
      await expect(pane).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: 'Details ready' })).toBeVisible();
      await expect(trigger).toBeFocused();
      assert.equal(
        await pane.evaluate((node) => node.closest('docs-tooltip-popover-page') !== null),
        true,
      );
      const anchor = await page.getByText('Details ready', { exact: true }).boundingBox();
      const panel = await pane.boundingBox();
      assert.ok(anchor && panel);
      assert.ok(
        Math.abs(panel.y - (anchor.y + anchor.height + 16)) <= 2 ||
          Math.abs(anchor.y - (panel.y + panel.height + 16)) <= 2,
      );
      await page.keyboard.press('Escape');
      await expect(pane).toHaveCount(0);
      await expect(page.getByText('Details closed', { exact: true })).toBeVisible();
      await page.mouse.move(10, 10);
      await trigger.hover();
      await expect(pane).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} alert, badge, chapter navigation and description layout`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1180, height: 850 } });
      await page.goto(base + '/components/alert');
      const banner = page.locator('hy-alert section').filter({ hasText: 'Storage is almost full' });
      await expect(banner).toHaveCSS('border-start-start-radius', '0px');
      await expect(banner).toHaveCSS('border-inline-start-width', '0px');
      const card = page.locator('hy-alert section').filter({ hasText: 'Your changes are saved' });
      assert.ok(parseFloat(await card.evaluate((node) => getComputedStyle(node).borderTopLeftRadius)) > 0);

      await page.goto(base + '/components/badge');
      for (const direction of ['ltr', 'rtl']) {
        const host = page.locator(`[hyBadgeHost][dir="${direction}"]`);
        const target = await host.boundingBox();
        const badge = await host.locator('hy-notification-badge').boundingBox();
        assert.ok(target && badge);
        assert.ok(badge.y < target.y && badge.y + badge.height > target.y);
        if (direction === 'ltr') assert.ok(badge.x + badge.width > target.x + target.width);
        else assert.ok(badge.x < target.x);
      }

      await page.goto(base + '/components/chapter-nav');
      await page.getByRole('switch', { name: 'Horizontal links' }).click();
      const nav = page.locator('hy-chapter-nav');
      await expect(nav).toHaveAttribute('data-orientation', 'horizontal');
      await expect(nav.locator('.thread')).toBeHidden();
      const material = await nav.getByRole('link', { name: 'Material' }).boundingBox();
      const craft = await nav.getByRole('link', { name: 'Craft' }).boundingBox();
      assert.ok(material && craft && Math.abs(craft.y - material.y) < 1 && craft.x > material.x);
      const chapterPane = nav.locator('nav');
      await nav.evaluate((node) => { node.style.inlineSize = '11rem'; });
      assert.ok(await chapterPane.evaluate((node) => node.scrollWidth > node.clientWidth));

      await page.goto(base + '/components/description-list');
      const list = page.locator('hy-description-list');
      await list.evaluate((node) => { node.style.inlineSize = '34rem'; });
      const columnCount = () => list.locator('dl').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      await expect.poll(columnCount).toBe(2);
      await list.evaluate((node) => { node.style.inlineSize = '24rem'; });
      await expect.poll(columnCount).toBe(1);
      const term = await list.locator('dt').first().boundingBox();
      const detail = await list.locator('dd').first().boundingBox();
      assert.ok(term && detail && detail.y > term.y && Math.abs(detail.x - term.x) < 1);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} namespaced remote SVG icon renders accessible geometry`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const result = page.waitForResponse((response) => response.url().endsWith('/icon-mark.svg'));
      await page.goto(base + '/components/fab');
      assert.equal((await result).status(), 200);
      const icon = page.getByRole('img', { name: 'Example brand mark' });
      await expect(icon.locator('svg')).toHaveAttribute('viewBox', '0 0 20 20');
      await expect(icon.locator('path')).toHaveAttribute('stroke', 'currentColor');
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} hotspot, hover card, and select use their own overlay mounts`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 850 } });
      await page.goto(base + '/components/hotspot', { waitUntil: 'networkidle' });
      const hotspot = page.getByRole('button', { name: 'Sapphire crystal' });
      const canFullscreen = await hotspot.evaluate((trigger) => {
        const scene = trigger.closest('.scene');
        if (!document.fullscreenEnabled || !scene?.requestFullscreen) return false;
        trigger.addEventListener('click', () => scene.requestFullscreen(), { once: true });
        return true;
      });
      await hotspot.click();
      if (canFullscreen) {
        await expect.poll(() => page.evaluate(() => document.fullscreenElement?.classList.contains('scene')))
          .toBe(true);
      }
      const details = page.locator('.scene-panels').getByRole('dialog', { name: 'Sapphire crystal' });
      await expect(details).toBeVisible();
      await expect(details).toContainText('Scratch-resistant');
      const anchor = await hotspot.boundingBox();
      const tip = await details.boundingBox();
      assert.ok(anchor && tip && Math.abs(anchor.x + anchor.width / 2 - (tip.x + tip.width / 2)) < 32);
      await details.getByRole('button', { name: 'Close details' }).click();
      await expect(details).toHaveCount(0);
      if (canFullscreen) await page.evaluate(() => document.exitFullscreen());

      await page.goto(base + '/components/hover-card', { waitUntil: 'networkidle' });
      const cardTrigger = page.getByRole('button', { name: 'Mina Rahimi' });
      await cardTrigger.focus();
      const card = page.locator('.profile-panels').getByRole('dialog', { name: 'Mina Rahimi profile' });
      await expect(card).toHaveClass(/team-profile-pane/);
      await cardTrigger.press('ArrowDown');
      const profile = card.getByRole('link', { name: 'View workspace' });
      await expect(profile).toBeFocused();
      await profile.press('Escape');
      await expect(card).toHaveCount(0);
      await expect(cardTrigger).toBeFocused();

      await page.goto(base + '/components/select', { waitUntil: 'networkidle' });
      const select = page.getByRole('combobox', { name: 'Select with custom panel mount' });
      await select.evaluate((trigger) => {
        Object.assign(trigger.style, { position: 'fixed', width: '230px', left: '160px', bottom: '12px' });
      });
      await select.press('Enter');
      const list = page.locator('.select-panels').getByRole('listbox');
      await expect(list).toBeVisible();
      const triggerBox = await select.boundingBox();
      const paneBox = await page.locator('.select-panels .cdk-overlay-pane').boundingBox();
      assert.ok(triggerBox && paneBox && paneBox.y + paneBox.height <= triggerBox.y + 2);
      assert.ok(Math.abs(paneBox.x - triggerBox.x - 12) < 3,
        `Expected a 12px offset, measured ${paneBox.x - triggerBox.x}px`);
      await list.getByRole('option', { name: 'France' }).click();
      await expect(select).toContainText('France');
      await expect(list).toHaveCount(0);
      await select.evaluate((trigger) => {
        trigger.removeAttribute('style');
        trigger.scrollIntoView({ block: 'center' });
      });
      await select.press('Enter');
      await expect(list).toBeVisible();
      const pane = page.locator('.select-panels .cdk-overlay-pane');
      const initialTop = (await select.boundingBox()).y;
      await page.evaluate(() => window.scrollBy(0, 65));
      await expect.poll(async () => Math.abs((await select.boundingBox()).y - initialTop)).toBeGreaterThan(20);
      await expect.poll(async () => {
        const trigger = await select.boundingBox();
        const popup = await pane.boundingBox();
        return Math.min(Math.abs(popup.y - trigger.y - trigger.height - 6),
          Math.abs(trigger.y - popup.y - popup.height - 6));
      }).toBeLessThan(3);
      await select.press('Escape');
      await expect(list).toHaveCount(0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} menu panel and backdrop click-through policy`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 850 } });
      await page.goto(base + '/components/menu', { waitUntil: 'networkidle' });
      const trigger = page.getByRole('button', { name: 'Project actions' });
      await trigger.press('Enter');
      const menu = page.getByRole('menu', { name: 'Project actions' });
      const shade = page.locator('.project-menu-backdrop');
      await expect(menu).toHaveClass(/project-menu/);
      await expect(shade).toBeVisible();
      const outside = page.getByRole('button', { name: 'Export', exact: true });
      const box = await outside.boundingBox();
      assert.ok(box);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(menu).toHaveCount(0);
      await expect(shade).toHaveCount(0);
      await expect(page.getByRole('status').filter({ hasText: 'Export started' })).toHaveCount(0);
      await outside.click();
      await expect(page.getByRole('status').filter({ hasText: 'Export started' })).toBeVisible();
      await trigger.press('Enter');
      await menu.getByRole('menuitem', { name: 'Open report' }).press('Escape');
      await expect(trigger).toBeFocused();
      await expect(shade).toHaveCount(0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} context menu pointer, keyboard and recursive actions`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 850 }, hasTouch: true });
      await page.goto(base + '/components/context-menu', { waitUntil: 'networkidle' });
      const target = page.locator('.context-target');
      const root = page.getByRole('menu', { name: 'Project actions' });
      await target.click({ button: 'right' });
      await expect(root.getByRole('menuitem', { name: /Open details/ })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(root).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Project actions' })).toBeFocused();
      await target.focus();
      await page.keyboard.press('Shift+F10');
      const assign = root.getByRole('menuitem', { name: 'Assign to' });
      await expect(root.getByRole('menuitem', { name: /Open details/ })).toBeFocused();
      await assign.press('ArrowRight');
      await expect(assign).toHaveAttribute('aria-expanded', 'true');
      await page.getByRole('menuitem', { name: 'Design team' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Design team' })).toBeVisible();
      if (engine === 'chromium') {
        const cdp = await page.context().newCDPSession(page);
        const box = await target.boundingBox();
        assert.ok(box);
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart', touchPoints: [{ x: box.x + 30, y: box.y + box.height / 2 }],
        });
        await expect(root).toBeVisible();
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect(root).toBeVisible();
      }
    } finally {
      await browser.close();
    }
  });

  test(`${engine} time picker custom footer and confirmation transaction`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      await page.goto(base + '/components/time-picker', { waitUntil: 'networkidle' });
      const picker = page.locator('hy-field').filter({ hasText: 'Time to confirm' });
      await picker.getByRole('button', { name: '14:00' }).press('Enter');
      await expect(page.getByText('Pending time: 14:00', { exact: true })).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: 'Confirmed time: 09:00' })).toBeVisible();
      await picker.getByRole('button', { name: 'Confirm' }).press('Enter');
      await expect(page.getByRole('status').filter({ hasText: 'Confirmed time: 14:00' })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} tabs placement and responsive badge labels`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 850 } });
      await page.goto(base + '/components/tabs', { waitUntil: 'networkidle' });
      const delivery = page.getByRole('tablist', { name: 'Delivery settings' });
      const shipping = delivery.getByRole('tab', { name: 'Shipping details' });
      const pickup = delivery.getByRole('tab', { name: 'Pickup locations' });
      await expect(delivery).toHaveAttribute('aria-orientation', 'vertical');
      await expect(shipping.getByText('Shipping details')).toBeVisible();
      await expect(shipping.getByText('Shipping', { exact: true })).toBeHidden();
      await expect(shipping.getByText('2', { exact: true })).toBeVisible();
      await shipping.press('ArrowDown');
      await expect(pickup).toBeFocused();
      const list = await delivery.boundingBox();
      const panel = await page.getByText('Available locations', { exact: true }).boundingBox();
      assert.ok(list && panel && panel.x >= list.x + list.width);
      const bottom = await page.getByRole('tablist', { name: 'Account view' }).boundingBox();
      const summary = await page.getByText('Account summary', { exact: true }).boundingBox();
      assert.ok(bottom && summary && bottom.y >= summary.y + summary.height);
      await page.setViewportSize({ width: 425, height: 850 });
      await expect(shipping).toHaveAccessibleName('Shipping details');
      await expect(shipping.getByText('Shipping details')).toBeHidden();
      await expect(shipping.getByText('Shipping', { exact: true })).toBeVisible();
      await expect(shipping.getByText('2', { exact: true })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} animated tab height, controlled selection and overflow pagination`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 410, height: 820 } });
      await page.goto(base + '/components/tabs');
      const list = page.getByRole('tablist', { name: 'Release stages' });
      const overview = list.getByRole('tab', { name: 'Overview' });
      const checklist = list.getByRole('tab', { name: 'Checklist' });
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      const tabs = page.locator('hy-tabs').filter({ has: list });
      const viewport = tabs.locator('.hy-tabs__panels > div');
      const height = () => viewport.evaluate((el) => el.getBoundingClientRect().height);
      const animationCount = () => viewport.evaluate((el) => el.getAnimations().length);
      const start = await height();
      await checklist.click();
      await expect.poll(animationCount).toBe(1);
      await expect(page.getByRole('status').filter({ hasText: 'Finished: checklist' })).toBeVisible();
      expect(await height()).toBeGreaterThan(start + 55);
      await page.getByRole('button', { name: 'Show overview' }).click();
      await expect.poll(animationCount).toBe(1);
      await expect.poll(height).toBeCloseTo(start, 0);
      await expect(overview).toHaveAttribute('aria-selected', 'true');

      const scroll = () => list.evaluate((el) => Math.abs(el.scrollLeft));
      const size = await list.evaluate((el) => ({ scroll: el.scrollWidth, visible: el.clientWidth }));
      expect(size.scroll).toBeGreaterThan(size.visible);
      await tabs.getByRole('button', { name: 'Next tabs' }).click();
      await expect.poll(scroll).toBeGreaterThan(20);
      await tabs.getByRole('button', { name: 'Previous tabs' }).click();
      await expect.poll(scroll).toBeLessThanOrEqual(1);
      await tabs.evaluate((el) => el.setAttribute('dir', 'rtl'));
      await tabs.getByRole('button', { name: 'Next tabs' }).click();
      await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeLessThan(-20);
      await tabs.getByRole('button', { name: 'Previous tabs' }).click();
      await expect.poll(scroll).toBeLessThanOrEqual(1);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await checklist.click();
      await expect(checklist).toHaveAttribute('aria-selected', 'true');
      await expect.poll(height).toBeGreaterThan(start + 55);
      expect(await animationCount()).toBe(0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} remote combobox and paged multi-select`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1010, height: 820 } });
      await page.goto(base + '/components/combobox', { waitUntil: 'networkidle' });
      const city = page.getByRole('combobox', { name: 'Search cities' });
      await city.fill('unavailable');
      await expect(page.getByRole('status').filter({ hasText: 'Loading options' })).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: 'Could not load options' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
      await city.fill('shir');
      await expect(page.getByRole('option', { name: 'Shiraz' })).toBeVisible();
      await city.press('ArrowDown');
      await city.press('Enter');
      await expect(city).toHaveValue('Shiraz');
      const clear = page.getByRole('button', { name: 'Clear city' });
      await clear.click();
      await expect(city).toHaveValue('');
      await expect(city).toBeFocused();
      await expect(clear).toHaveCount(0);

      await page.goto(base + '/components/multi-select', { waitUntil: 'networkidle' });
      const teams = page.getByRole('combobox', { name: 'Search teams' });
      await teams.press('ArrowDown');
      const more = page.getByRole('button', { name: 'Load more teams' });
      await expect(more).toBeVisible();
      await teams.press('PageDown');
      await expect(page.getByRole('option', { name: 'Research' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Design' })).toBeVisible();
      await teams.press('End');
      await expect(teams).toHaveAttribute('aria-activedescendant', /-option-2$/);
      await teams.press('Enter');
      const research = page.getByRole('button', { name: 'Remove Research' });
      await expect(research).toBeVisible();
      await teams.fill('en');
      await expect(page.getByRole('option', { name: 'Engineering' })).toBeVisible();
      await page.getByRole('option', { name: 'Engineering' }).click();
      const engineering = page.getByRole('button', { name: 'Remove Engineering' });
      await expect(engineering).toBeVisible();
      await expect(research).toBeVisible();
      await research.click();
      await expect(research).toHaveCount(0);
      await expect(engineering).toBeVisible();
      await expect(teams).toBeFocused();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} choice label geometry, disabled keyboard activation and controlled drag`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1060, height: 800 }, reducedMotion: 'reduce' });
      await page.goto(base + '/components/checkbox-radio-switch', { waitUntil: 'networkidle' });
      const policies = page.locator('[aria-label="Choice policies"]');
      for (const [role, name] of [
        ['checkbox', 'Quarterly reports'], ['radio', 'Weekly review'], ['switch', 'Public profile'],
      ]) {
        const input = policies.getByRole(role, { name });
        const row = input.locator('xpath=ancestor::label');
        const label = row.locator('.hy-choice__label');
        const control = row.locator('.hy-choice__control');
        const description = row.locator('xpath=following-sibling::p');
        const edge = async (locator, rtl) => locator.evaluate((el, rtl) => {
          const rect = el.getBoundingClientRect();
          const padding = parseFloat(getComputedStyle(el).paddingInlineStart) || 0;
          return rtl ? rect.right - padding : rect.left + padding;
        }, rtl);
        for (const rtl of [false, true]) {
          await policies.evaluate((el, rtl) => { el.dir = rtl ? 'rtl' : 'ltr'; }, rtl);
          const labelStart = await edge(label, rtl);
          assert.ok(rtl ? labelStart > await edge(control, rtl) : labelStart < await edge(control, rtl));
          assert.ok(Math.abs(labelStart - await edge(description, rtl)) <= 1);
        }
        await expect(input).toHaveAttribute('aria-disabled', 'true');
        await input.focus();
        await expect(input).toBeFocused();
        await input.press('Space');
        await expect(input).not.toBeChecked();
      }
      const daily = policies.getByRole('radio', { name: 'Daily review' });
      await expect(daily).toBeChecked();
      await daily.press('ArrowDown');
      await expect(daily).toBeChecked();
      await policies.evaluate((el) => { el.dir = 'ltr'; });
      const sharing = policies.getByRole('switch', { name: 'Share activity' });
      const track = sharing.locator('xpath=parent::span');
      await track.scrollIntoViewIfNeeded();
      const box = await track.boundingBox();
      assert.ok(box);
      const pause = policies.getByRole('checkbox', { name: 'Pause sharing changes' });
      const requests = policies.locator('output');
      const beginDrag = async (from, to) => {
        await page.mouse.move(box.x + box.width * from, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * to, box.y + box.height / 2, { steps: 6 });
      };
      await beginDrag(0.25, 0.75);
      await expect(track.locator('[data-dragging]')).toHaveCount(1);
      await page.mouse.up();
      await expect(requests).toHaveText('Sharing requests: 1');
      await expect(sharing).toBeChecked();

      await beginDrag(0.75, 0.25);
      await expect(track.locator('[data-dragging]')).toHaveCount(1);
      await pause.evaluate((el) => el.click());
      await expect(sharing).toHaveAttribute('aria-disabled', 'true');
      await expect(track.locator('[data-dragging]')).toHaveCount(0);
      await page.mouse.up();
      await expect(requests).toHaveText('Sharing requests: 1');
      await expect(sharing).toBeChecked();

      await pause.evaluate((el) => el.click());
      await beginDrag(0.75, 0.25);
      await page.mouse.up();
      await expect(requests).toHaveText('Sharing requests: 2');
      await expect(sharing).not.toBeChecked();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} carousel reports external writes and native scroll completion`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
      await page.goto(base + '/components/carousel', { waitUntil: 'networkidle' });
      const carousel = page.getByRole('region', { name: 'Atelier collection' });
      const viewport = carousel.getByRole('group', { name: 'Atelier collection' });
      await page.getByRole('button', { name: 'Select second slide externally' }).click();
      await expect(page.getByText('Settled slide 2', { exact: true })).toBeVisible();
      await viewport.evaluate((el) => el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'instant' }));
      await expect(page.getByText('Settled slide 3', { exact: true })).toBeVisible();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} bento reorders mounted tiles with keyboard and pointer`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1160, height: 850 } });
      const response = await page.request.get(base + '/components/bento');
      assert.match((await response.text()).match(/<hy-bento[^>]*>[\s\S]*?<\/hy-bento>/i)?.[0] ?? '', /tileId="revenue"[\s\S]+tileId="projects"/i);
      await page.goto(base + '/components/bento', { waitUntil: 'networkidle' });
      const tiles = page.locator('hy-bento .grid > [draggable="true"]');
      await expect(tiles).toHaveCount(3);
      const first = page.locator('[tileId="revenue"]');
      await first.press('Alt+ArrowRight');
      await expect(tiles.nth(1)).toHaveAttribute('tileId', 'revenue');
      await expect(first).toBeFocused();
      await first.dragTo(tiles.nth(0), { sourcePosition: { x: 8, y: 8 }, targetPosition: { x: 8, y: 8 } });
      await expect(tiles.nth(0)).toHaveAttribute('tileId', 'revenue');
    } finally {
      await browser.close();
    }
  });

  test(`${engine} folder picker queues nested files with their relative paths`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    const fixture = await mkdtemp(join(tmpdir(), 'hyalo-folder-'));
    const folder = join(fixture, 'hyalo-directory-fixture');
    try {
      await mkdir(join(folder, 'nested'), { recursive: true });
      await writeFile(join(folder, 'root.txt'), 'root');
      await writeFile(join(folder, 'nested', 'child.txt'), 'child');
      const page = await browser.newPage();
      await page.goto(base + '/components/file-upload', { waitUntil: 'networkidle' });
      const input = page.locator('input[webkitdirectory]');
      await expect(input).toHaveCount(1);
      await input.setInputFiles(folder);
      const paths = await input.evaluate((element) =>
        window.ng.getComponent(element.closest('hy-file-upload')).value()
          .map((file) => file.webkitRelativePath).sort()
      );
      assert.deepEqual(paths, ['hyalo-directory-fixture/nested/child.txt', 'hyalo-directory-fixture/root.txt']);
    } finally {
      await browser.close();
      await Promise.allSettled([
        unlink(join(folder, 'nested', 'child.txt')),
        unlink(join(folder, 'root.txt')),
      ]);
      await rmdir(join(folder, 'nested'));
      await rmdir(folder);
      await rmdir(fixture);
    }
  });

  test(`${engine} custom OTP cells render during SSR and retain one input after hydration`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.request.get(base + '/components/otp');
      const html = await response.text();
      await page.goto(base + '/components/otp', { waitUntil: 'networkidle' });
      assert.match(html, /class="demo-pin-cell"[^>]*data-index="0"[^>]*>[^<]*[•●]/);
      const otp = page.locator('hy-field').filter({ hasText: 'Example PIN' }).locator('hy-otp');
      const input = otp.locator('input');
      const cells = otp.locator('.demo-pin-cell');
      await expect(cells).toHaveCount(4);
      await expect(input).toHaveCount(1);
      await expect(input).toHaveValue('12');
      await input.fill('4567');
      await expect(cells.nth(3)).not.toHaveText('–');
      await expect(otp.locator('.chips')).toHaveAttribute('aria-hidden', 'true');
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} vertical carousel responds to keyboard and native scrolling`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
      await page.goto(base + '/components/carousel', { waitUntil: 'networkidle' });
      const collection = page.getByRole('region', { name: 'Vertical collection' });
      const frame = collection.locator('.viewport');
      await frame.scrollIntoViewIfNeeded();
      await frame.press('ArrowDown');
      await expect.poll(() => frame.evaluate((node) => node.scrollTop)).toBeGreaterThan(50);
      await expect(collection.getByText('Gold collection', { exact: true })).toBeInViewport();
      await frame.evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
      await expect(collection.getByText('Studio collection', { exact: true })).toBeInViewport();
      assert.equal(await frame.evaluate((node) => node.scrollLeft), 0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} masked input keeps a partial draft until blur`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      await page.goto(base + '/components/masked-input', { waitUntil: 'networkidle' });
      const input = page.getByRole('textbox', { name: 'Deferred reference' });
      await input.pressSequentially('123');
      await expect(input).toHaveValue('12-3');
      await expect(page.getByText('Saved reference empty', { exact: true })).toBeVisible();
      await input.press('Tab');
      await expect(page.getByText('Saved reference 123', { exact: true })).toBeVisible();
      const custom = page.getByRole('textbox', { name: 'Alphabetic reference' });
      await custom.evaluate((node) => node.setSelectionRange(2, 2));
      await custom.press('Delete');
      await expect(custom).toHaveValue('ab-d');
      await custom.evaluate((node) => node.setSelectionRange(3, 3));
      await custom.press('Backspace');
      await expect(custom).toHaveValue('ad');
      await custom.fill('abcd');
      await custom.evaluate((node) => node.setSelectionRange(1, 4));
      await custom.press('Backspace');
      await expect(custom).toHaveValue('ad');
    } finally {
      await browser.close();
    }
  });

  test(`${engine} calendar lays out months and applies date template and adjacent day policies`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(base + '/components/date-picker', { waitUntil: 'networkidle' });
      const calendar = page.locator('hy-calendar');
      const grids = calendar.getByRole('grid');
      await expect(grids).toHaveCount(2);
      const a = await grids.nth(0).boundingBox();
      const b = await grids.nth(1).boundingBox();
      assert.ok(a && b && b.x > a.x && Math.abs(a.y - b.y) < 1);
      const compared = calendar.locator('button[data-date="2026-11-19"]').first();
      await expect(compared.locator('.comparison-mark')).toBeVisible();
      await expect(compared).not.toHaveCSS('box-shadow', 'none');
      const adjacent = grids.nth(0).locator('button[data-outside]').first();
      await expect(adjacent).toHaveAttribute('aria-disabled', 'true');
      await expect(adjacent).toHaveAttribute('tabindex', '-1');
      await adjacent.evaluate((el) => el.click());
      await expect(page.getByText('Calendar selection 2026-11-16')).toBeVisible();
      await page.getByRole('button', { name: 'Hide adjacent dates' }).click();
      await expect(adjacent).toBeHidden();
      await page.getByRole('button', { name: 'Show adjacent dates' }).click();
      await expect(adjacent).toBeVisible();
      await expect(adjacent).toHaveAttribute('aria-disabled', 'false');
      await adjacent.click();
      await expect(page.getByText('Calendar selection 2026-11-16')).toHaveCount(0);
      await page.setViewportSize({ width: 390, height: 900 });
      const stacked = await grids.nth(1).boundingBox();
      const first = await grids.nth(0).boundingBox();
      assert.ok(stacked && first && stacked.y > first.y && Math.abs(stacked.x - first.x) < 1);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} date picker keeps the touch dialog within a narrow viewport`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 650 }, hasTouch: true });
      await page.goto(base + '/components/date-picker', { waitUntil: 'networkidle' });
      await page.getByRole('checkbox', { name: 'Use touch calendar layout' }).check();
      await page.getByRole('button', { name: 'Toggle appointment calendar' }).tap();
      const modal = page.getByRole('dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      const distanceFromCenter = async () => {
        const box = await modal.boundingBox();
        return Math.max(Math.abs(box.x + box.width / 2 - 195), Math.abs(box.y + box.height / 2 - 325));
      };
      await expect.poll(distanceFromCenter).toBeLessThan(5);
      const day = modal.getByRole('button', { name: 'November 17, 2026', exact: true });
      await day.tap();
      await expect(modal).toHaveCount(0);
      await expect(page.getByRole('textbox', { name: 'Appointment date' })).toHaveValue('2026/11/17');
      await page.evaluate(() => document.documentElement.dir = 'rtl');
      await page.getByRole('button', { name: 'Toggle appointment calendar' }).tap();
      await expect.poll(distanceFromCenter).toBeLessThan(5);
      await modal.getByRole('button', { name: 'Close calendar' }).tap();
      await expect(modal).toHaveCount(0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} date picker controller focuses the calendar and reports attachment and detachment`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      await page.goto(base + '/components/date-picker', { waitUntil: 'networkidle' });
      const toggle = page.getByRole('button', { name: 'Toggle appointment calendar' });
      const date = page.getByRole('textbox', { name: 'Appointment date' });
      await toggle.click();
      await expect(page.getByText('Calendar attached', { exact: true })).toBeVisible();
      const dialog = page.getByRole('dialog');
      const active = dialog.locator('hy-calendar button[tabindex="0"]');
      await expect(active).toBeFocused();
      await active.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText('Calendar detached', { exact: true })).toBeVisible();
      await expect(date).toBeFocused();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} option overlays honor width, offsets, dismissal, and attachment events`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
      for (const [route, label, panel] of [
        ['combobox', 'Search cities', '.docs-city-panel'],
        ['multi-select', 'Search teams', '.docs-team-panel'],
      ]) {
        await page.goto(base + '/components/' + route, { waitUntil: 'networkidle' });
        const trigger = page.getByRole('combobox', { name: label });
        await trigger.scrollIntoViewIfNeeded();
        if (route === 'combobox') {
          await trigger.fill('shir');
          await expect(page.getByRole('option', { name: 'Shiraz' })).toBeVisible();
        } else {
          await trigger.press('ArrowDown');
          await expect(page.getByRole('option', { name: 'Design' })).toBeVisible();
        }
        await expect(page.getByText('Popup mounted', { exact: true })).toBeVisible();
        const pane = page.locator(panel);
        await expect(pane).toBeVisible();
        const box = await pane.boundingBox();
        const anchor = await trigger.evaluate((el) => {
          const origin = el.closest('.control');
          return origin.getBoundingClientRect().toJSON();
        });
        assert.ok(box && Math.abs(box.width - 260) < 1);
        assert.ok(Math.abs(box.x - anchor.x - 8) < 2);
        assert.ok(Math.abs(box.y + box.height - anchor.y + 6) < 2);
        await page.evaluate(() => document.addEventListener('mousedown', (event) => event.preventDefault(), { once: true }));
        await page.mouse.click(12, 100);
        await expect(pane).toBeVisible();
        await trigger.press('Escape');
        await expect(pane).toHaveCount(0);
        await expect(page.getByText('Popup detached', { exact: true })).toBeVisible();
      }
    } finally {
      await browser.close();
    }
  });

  test(`${engine} table reorders headers and rows using browser drag and drop`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
      await page.goto(base + '/components/table', { waitUntil: 'networkidle' });
      const table = page.getByRole('table', { name: 'Drag to reorder projects' });
      const headers = table.getByRole('columnheader');
      await table.scrollIntoViewIfNeeded();
      const drag = async (source, target) => {
        await source.hover({ position: { x: 8, y: 8 } });
        await page.mouse.down();
        await target.hover({ position: { x: 8, y: 8 } });
        await target.hover({ position: { x: 10, y: 10 } });
        await page.mouse.up();
      };
      await drag(headers.nth(0), headers.nth(1));
      await expect(headers.nth(0)).toContainText('Owner');
      await expect(headers.nth(1)).toContainText('Project');
      const rows = table.locator('tbody tr');
      await drag(rows.nth(0), rows.nth(1));
      await expect(rows.nth(0)).toContainText('Design system');
      await expect(rows.nth(1)).toContainText('Website refresh');
    } finally {
      await browser.close();
    }
  });

  test(`${engine} table pins rows and logical columns during two-axis scrolling`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
      await page.goto(base + '/components/table', { waitUntil: 'networkidle' });
      const viewport = page.getByRole('region', { name: 'Pinned project register' });
      await viewport.scrollIntoViewIfNeeded();
      const rows = viewport.locator('tbody > tr[aria-rowindex]');
      for (const direction of ['ltr', 'rtl']) {
        await viewport.evaluate((node, dir) => {
          node.dir = dir;
          node.scrollTo({ left: dir === 'rtl' ? -200 : 200, top: 720 });
        }, direction);
        await expect.poll(() => viewport.evaluate((node, dir) => {
          const bounds = node.getBoundingClientRect();
          const header = node.querySelector('thead').getBoundingClientRect();
          const [first, second] = node.querySelectorAll('tbody > tr.frozen-row');
          const [start, owner, , end] = Array.from(first.cells, (cell) => cell.getBoundingClientRect());
          const inlineStart = dir === 'rtl' ? bounds.right - start.right : start.left - bounds.left;
          const inlineEnd = dir === 'rtl' ? end.left - bounds.left : bounds.right - end.right;
          const adjacent = dir === 'rtl' ? start.left - owner.right : owner.left - start.right;
          return Math.max(
            Math.abs(header.top - bounds.top - 1),
            Math.abs(first.getBoundingClientRect().top - header.bottom),
            Math.abs(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom),
            Math.abs(inlineStart - 1),
            Math.abs(inlineEnd - 1),
            Math.abs(adjacent),
          );
        }, direction)).toBeLessThan(2);
        await expect(rows.nth(0)).toContainText('Project 1');
        await expect(rows.nth(1)).toContainText('Project 2');
        assert.ok(Number(await rows.nth(2).getAttribute('aria-rowindex')) > 5);
        assert.ok(await rows.count() < 24);
      }
    } finally {
      await browser.close();
    }
  });

  test(`${engine} table measures virtual group and detail rows while keeping pinned rows`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
      await page.goto(base + '/components/table', { waitUntil: 'networkidle' });
      const viewport = page.getByRole('region', { name: 'Grouped project register' });
      await viewport.scrollIntoViewIfNeeded();
      const rows = viewport.locator('tbody > tr[aria-rowindex]');
      const second = rows.filter({ hasText: 'Project 2' }).first();
      await expect(viewport.getByText('Batch 1 · 5 projects', { exact: true })).toBeVisible();
      await second.getByRole('button', { name: 'Toggle row details' }).click();
      const detail = viewport.getByText('Delivery notes for Project 2', { exact: true });
      await expect(detail).toBeVisible();
      await expect.poll(async () => (await detail.boundingBox())?.height ?? 0).toBeGreaterThan(100);
      await viewport.evaluate((node) => node.scrollTop = 3400);
      await expect.poll(async () => Number(await rows.nth(1).getAttribute('aria-rowindex'))).toBeGreaterThan(30);
      await expect(rows.nth(0)).toContainText('Project 1');
      await expect(viewport.getByText(/^Batch (8|9|10|11|12) · 5 projects$/).first()).toBeVisible();
      await expect(detail).toHaveCount(0);
      assert.ok(await rows.count() < 24);
      await viewport.evaluate((node) => node.scrollTop = 0);
      await expect(detail).toBeVisible();
      await second.getByRole('button', { name: 'Toggle row details' }).click();
      await expect(detail).toHaveCount(0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} table associates cells with the correct spanning headers`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1120, height: 850 } });
      await page.goto(base + '/components/table', { waitUntil: 'networkidle' });
      const table = page.getByRole('table', { name: 'Project allocation' });
      const group = table.getByRole('columnheader', { name: 'Project details' });
      await expect(group).toHaveAttribute('rowspan', '2');
      const cell = table.getByRole('cell', { name: 'Mina' });
      const labels = await cell.evaluate((el) => el.headers.split(' ').map((id) =>
        el.ownerDocument.getElementById(id)?.textContent?.trim(),
      ));
      assert.deepEqual(labels.slice(0, 2), ['Allocation', 'Staffing']);
      assert.match(labels[2], /^Owner/);
      const bounds = await group.boundingBox();
      const leaf = await table.getByRole('columnheader', { name: 'Project', exact: true }).boundingBox();
      assert.ok(bounds && leaf && Math.abs(bounds.x - leaf.x) < 1);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} scroll area delegates programmatic and keyboard scrolling to a native viewport`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ reducedMotion: 'reduce' });
      await page.goto(base + '/components/scroll-area', { waitUntil: 'networkidle' });
      const wrapper = page.getByRole('region', { name: 'Delegated activity' });
      const viewport = wrapper.getByRole('region', { name: 'Activity viewport' });
      await page.getByRole('button', { name: 'Scroll activity' }).click();
      await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(160);
      assert.equal(await wrapper.evaluate((el) => el.scrollTop), 0);
      await viewport.press('End');
      await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(160);
      await expect(viewport).toBeFocused();
    } finally {
      await browser.close();
    }
  });

  test(`${engine} select distinguishes null choice and undefined reset`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      await page.goto(base + '/components/select', { waitUntil: 'networkidle' });
      const custom = page.getByRole('combobox', { name: /^Resettable material/ });
      await custom.press('ArrowDown');
      await page.getByRole('listbox').getByRole('option', { name: 'Unassigned' }).click();
      await expect(custom).toContainText('Unassigned');
      await custom.press('ArrowDown');
      await page.getByRole('listbox').getByRole('option', { name: 'Reset selection' }).click();
      await expect(custom).toContainText('Choose material');
      const native = page.getByRole('combobox', { name: 'Native resettable material' });
      await native.selectOption({ label: 'Unassigned' });
      await expect(native).toHaveValue('object:null');
      await native.selectOption({ label: 'Reset selection' });
      await expect(native).toHaveValue('');
    } finally {
      await browser.close();
    }
  });

  test(`${engine} select virtual typeahead honors delay and wrap policy`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1060, height: 800 }, reducedMotion: 'reduce' });
      await page.goto(base + '/components/select', { waitUntil: 'networkidle' });
      const trigger = page.getByRole('combobox', { name: /Virtual country/ });
      await trigger.press('ArrowDown');
      const active = async (name) => {
        const option = page.getByRole('listbox').getByRole('option', { name, exact: true });
        await expect(option).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-activedescendant', await option.getAttribute('id'));
      };
      await active('Germany');
      await trigger.press('ArrowUp');
      await active('Germany');
      await trigger.press('End');
      await active('Netherlands');
      await trigger.press('ArrowDown');
      await active('Netherlands');
      await trigger.press('i');
      await active('Iran');
      await page.waitForTimeout(140);
      await trigger.press('f');
      await active('France');
      await trigger.press('Enter');
      await expect(trigger).toContainText('France');
      const standard = page.getByRole('combobox', { name: /Standard country/ });
      await standard.press('ArrowDown');
      await standard.press('End');
      const last = page.getByRole('listbox').getByRole('option', { name: 'Netherlands' });
      await expect(standard).toHaveAttribute('aria-activedescendant', await last.getAttribute('id'));
      await standard.press('ArrowDown');
      await expect(standard).toHaveAttribute('aria-activedescendant', await last.getAttribute('id'));
      await standard.press('f');
      const france = page.getByRole('listbox').getByRole('option', { name: 'France' });
      await expect(standard).toHaveAttribute('aria-activedescendant', await france.getAttribute('id'));
    } finally {
      await browser.close();
    }
  });

  test(`${engine} stepper emits only after the latest accepted panel animation`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1060, height: 800 } });
      await page.goto(base + '/components/stepper', { waitUntil: 'networkidle' });
      const stepper = page.locator('hy-stepper');
      await stepper.getByRole('textbox', { name: 'Full name' }).fill('Maya');
      await stepper.getByRole('button', { name: 'Save and continue' }).click();
      const second = stepper.getByRole('group', { name: 'Your matter' });
      await expect(second).toBeVisible();
      await expect.poll(() => second.evaluate((el) => el.getAnimations().length)).toBe(1);
      await expect(page.getByText('Step 2 ready', { exact: true })).toHaveCount(0);
      await stepper.getByRole('button', { name: 'Your details' }).press('Enter');
      await expect(page.getByText('Step 1 ready', { exact: true })).toBeVisible();
      await expect(page.getByText('Step 2 ready', { exact: true })).toHaveCount(0);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await stepper.getByRole('button', { name: 'Save and continue' }).press('Enter');
      await expect(page.getByText('Step 2 ready', { exact: true })).toBeVisible();
      assert.equal(await second.evaluate((el) => el.getAnimations().length), 0);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} horizontal timeline shares a rail across alternating events`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1090, height: 800 } });
      await page.goto(base + '/components/timeline', { waitUntil: 'networkidle' });
      const list = page.getByRole('list', { name: 'Release timeline' });
      const items = list.getByRole('listitem');
      const y = async () => Promise.all([0, 1, 2].map((i) => items.nth(i).locator('.event').boundingBox()));
      const dots = async () => Promise.all([0, 1, 2].map((i) => items.nth(i).locator('.dot').boundingBox()));
      let [plan, build, review] = await y();
      const rail = await dots();
      assert.ok(plan.y > build.y && plan.y > review.y);
      assert.ok(rail.every((marker) => Math.abs(marker.y - rail[0].y) < 1));
      await list.evaluate((el) => { el.dir = 'rtl'; });
      [plan, build, review] = await y();
      assert.ok(plan.x > build.x && build.x > review.x);
      assert.ok(plan.y > build.y && plan.y > review.y);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} responsive toast changes placement without replacing the message`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 800 }, reducedMotion: 'reduce' });
      await page.goto(base + '/components/toast', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Responsive toast' }).click();
      const stack = page.getByRole('region', { name: 'Notifications' });
      const message = stack.getByText('Responsive position', { exact: true });
      await expect(message).toBeVisible();
      const node = await message.elementHandle();
      let box = await stack.boundingBox();
      assert.ok(box && box.y < 10 && Math.abs(box.x + box.width / 2 - 512) < 2);
      await page.setViewportSize({ width: 420, height: 720 });
      await expect.poll(async () => (await stack.boundingBox())?.y ?? 0).toBeGreaterThan(600);
      box = await stack.boundingBox();
      assert.ok(box && Math.abs(box.x + box.width / 2 - 210) < 2 && Math.abs(box.width - 288) < 2);
      assert.equal(await node.evaluate((item) => item.isConnected), true);
      await page.setViewportSize({ width: 1024, height: 800 });
      await expect.poll(async () => (await stack.boundingBox())?.y ?? 800).toBeLessThan(10);
    } finally {
      await browser.close();
    }
  });

  test(`${engine} lightbox template context and responsive thumbnail geometry`, async () => {
    const browser = await type.launch(engine === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1060, height: 800 }, reducedMotion: 'reduce' });
      await page.goto(base + '/components/lightbox', { waitUntil: 'networkidle' });
      const group = page.getByRole('group', { name: 'Atelier collection' });
      const steel = group.getByRole('button', { name: /Steel watch/ });
      const gold = group.getByRole('button', { name: /Gold watch/ });
      const desktop = await steel.boundingBox();
      const desktopNext = await gold.boundingBox();
      assert.ok(desktop && desktopNext && desktopNext.x > desktop.x && desktopNext.y === desktop.y);
      expect(desktopNext.x - desktop.x - desktop.width).toBeCloseTo(16, 0);
      await page.setViewportSize({ width: 360, height: 760 });
      const mobile = await steel.boundingBox();
      const mobileNext = await gold.boundingBox();
      assert.ok(mobile && mobileNext && mobileNext.y > mobile.y && mobileNext.x === mobile.x);
      await steel.focus();
      await page.keyboard.press('Enter');
      const viewer = page.getByRole('dialog', { name: 'Atelier collection' });
      await expect(viewer.getByRole('button', { name: 'Close gallery' })).toBeFocused();
      const image = viewer.getByRole('img', { name: /Steel watch/ });
      await expect(image).toBeVisible();
      const zoom = viewer.getByRole('button', { name: 'Zoom in' });
      await expect.poll(() => image.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
      await zoom.click();
      await expect(image).toHaveCSS('transform', 'matrix(1.25, 0, 0, 1.25, 0, 0)');
      const stage = viewer.getByRole('group', { name: 'Pan zoomed image with arrow keys' });
      await stage.press('ArrowDown');
      const offset = () => image.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f);
      await expect.poll(offset).toBeGreaterThan(0);
      const box = await stage.boundingBox();
      assert.ok(box);
      await stage.scrollIntoViewIfNeeded();
      const dragOrigin = await stage.boundingBox();
      assert.ok(dragOrigin);
      await page.mouse.move(dragOrigin.x + dragOrigin.width / 2, dragOrigin.y + dragOrigin.height / 2);
      await page.mouse.down();
      await expect(stage).toHaveAttribute('data-dragging', 'true');
      await page.mouse.move(dragOrigin.x + dragOrigin.width / 2, dragOrigin.y + dragOrigin.height / 2 - 64, { steps: 4 });
      await page.mouse.up();
      await expect.poll(offset).toBeLessThan(0);
      const flip = viewer.getByRole('button', { name: 'Flip horizontally' });
      await flip.click();
      await expect(flip).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(() => image.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(0);
      await viewer.getByRole('button', { name: 'Reset image' }).click();
      await expect(image).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
      await zoom.press('ArrowRight');
      await expect(viewer.getByRole('img', { name: /Gold watch/ })).toBeVisible();
      await expect(viewer.getByText('Gold, 38 mm. Photo 2 of 2.')).toBeVisible();
      await page.getByRole('button', { name: 'Show only steel watch', includeHidden: true }).evaluate((button) => button.click());
      await expect(viewer.getByText('Steel, 42 mm. Photo 1 of 1.')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(viewer).toHaveCount(0);
      await expect(steel).toBeFocused();
    } finally {
      await browser.close();
    }
  });
}
