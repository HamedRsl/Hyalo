// Opt-in local Chromium measurement; emulation is not a hardware certification.
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { cpus, platform, release } from 'node:os';
const tools = process.env.HYALO_BROWSER_TOOLS;
if (!tools) throw new Error('Set HYALO_BROWSER_TOOLS to a directory containing playwright');
const { chromium } = createRequire(join(tools, 'package.json'))('playwright');
const out = resolve(process.env.HYALO_BROWSER_OUTPUT ?? 'tmp/verification/performance');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.HYALO_CHROMIUM_CHANNEL ?? 'chromium',
  headless: true,
});
const records = [];
try {
  for (const profile of [{ name: 'desktop', width: 1440, height: 1000, dpr: 1, cpu: 1 }, { name: 'mobile-emulated', width: 390, height: 844, dpr: 3, cpu: 4 }]) {
    const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: profile.dpr });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
    await page.goto((process.env.HYALO_BASE_URL ?? 'http://127.0.0.1:4200') + '/dashboard', { waitUntil: 'networkidle' });
    await session.send('Performance.enable');
    await context.tracing.start({ screenshots: true, snapshots: true });
    const measurements = await page.evaluate(async () => {
      const longTasks = [];
      const observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(e => e.duration)));
      observer.observe({ type: 'longtask', buffered: true });
      const before = performance.now();
      const frames = [];
      const content = document.querySelector('.workspace-content');
      const scroller = content?.clientHeight < content?.scrollHeight &&
        getComputedStyle(content).overflowY === 'auto' ? content : document.scrollingElement;
      const distance = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      let previous = before;
      await new Promise(resolve => {
        const frame = now => {
          frames.push(now - previous);
          previous = now;
          scroller.scrollTop = Math.min(1, (now - before) / 2500) * distance;
          if (now - before < 2500) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
      observer.disconnect();
      const surfaces = [...document.querySelectorAll('*')].filter(e => {
        const style = getComputedStyle(e);
        return style.backdropFilter !== 'none' && style.display !== 'none' && e.getClientRects().length;
      }).map(e => {
        const r = e.getBoundingClientRect();
        return { tag: e.tagName, classes: e.className, visibleArea: Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)), blur: getComputedStyle(e).backdropFilter };
      });
      frames.sort((a, b) => a - b);
      return { frames: frames.length, frameP50: frames[Math.floor(frames.length * .5)], frameP95: frames[Math.floor(frames.length * .95)], over32ms: frames.filter(n => n > 32).length, scrollTarget: scroller === content ? 'workspace' : 'document', scrollDistance: distance, longTasks, surfaces, userAgent: navigator.userAgent };
    });
    const metrics = await session.send('Performance.getMetrics');
    await context.tracing.stop({ path: join(out, `${profile.name}.zip`) });
    records.push({ profile, measurements, metrics: Object.fromEntries(metrics.metrics.map(m => [m.name, m.value])) });
    writeFileSync(join(out, 'results.json'), JSON.stringify({ environment: { platform: platform(), release: release(), cpu: cpus()[0]?.model }, records }, null, 2) + '\n');
    console.log(profile.name, measurements.frameP95, 'p95 ms;', measurements.surfaces.length, 'blur surfaces');
    await context.close();
  }
} finally { await browser.close(); }
