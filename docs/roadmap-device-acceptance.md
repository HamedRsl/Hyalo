# Reproducible browser and device acceptance

## Automated local tooling

Browser tools are deliberately not package runtime dependencies. Install them into
an explicit developer scratch directory (not a project consumer):

```sh
npm install --prefix "$HYALO_BROWSER_TOOLS" --no-audit --no-fund playwright @axe-core/playwright
node "$HYALO_BROWSER_TOOLS/node_modules/playwright/cli.js" install chromium firefox webkit
npm run build
```

Serve the production prerendered output with
`python -m http.server 4400 --bind 127.0.0.1 --directory dist/docs/browser`,
set `HYALO_BASE_URL=http://127.0.0.1:4400`, and execute:

```sh
npm run check:browsers
npm run check:performance
```

`HYALO_BROWSER_TOOLS` must be an absolute directory containing `node_modules`.
`HYALO_BROWSER_OUTPUT` overrides evidence output. Run against a settled production
build: Angular HMR error overlays during concurrent editing invalidate results.
The browser matrix records per-case runtime exceptions, axe violations, document
horizontal overflow and screenshots. It exercises notifications/read-all/Escape
focus restoration, chat draft addition, normalized amount/pending state, Select
and Table in Chromium/Firefox/WebKit across dark/light, forced colors and a narrow
RTL/reduced-motion mode. Axe does not replace screen-reader testing. Setting
`lang=fa` and direction tests geometry, not translated copy or Persian calendar
correctness. Browser preference modes must also be checked against actual
application theme controls before claiming full theme fidelity.

The performance harness records actual local Chromium frame intervals, long tasks,
visible backdrop areas, CDP metrics and Playwright traces for desktop and 4x CPU /
3x DPR mobile emulation. It reports measurements rather than asserting a made-up
hardware threshold. Emulation is not a mid-tier physical phone or GPU-driver test.

## Manual release gates (do not mark passed without device evidence)

Record device/OS/browser/assistive technology versions, app build SHA or dirty
snapshot identifier, scenario, expected result, actual result and trace/video.

- iOS Safari + VoiceOver: native Select before/after hydration, focus order,
  labels/help/errors, dialog dismissal and returned focus, editable fields.
- Android Chrome + TalkBack: the same forms and notifications, reduced motion,
  digit input and announcements. Verify virtual-list focus recovery offscreen.
- Windows Firefox/NVDA and Edge/JAWS where supported: keyboard-only flow,
  forced colors, native/enhanced Select equivalence, menus, tab/step guards.
- Real touch gestures: sheet drag/release/cancel, pointer capture loss, swipe
  action cancellation, scroll/pull-to-refresh competition, zoom and non-drag
  button alternatives. Do not replace gesture acceptance with dispatched JS.
- Persian locale: Jalali boundary/leap dates, timezone/DST transitions, RTL
  logical arrows/placement and localized decimals/digits without corrupting
  canonical form values. Test real mobile keyboard/IME composition.
- Representative mid-tier phones and high-DPI desktop: collect repeated
  production scroll/open/update/cleanup traces with battery/thermal context;
  establish budgets from these measurements, not headless workstation averages.
- Native GPU: context loss/recovery, failed image load/CORS, retained texture and
  canvas counts after repeated navigation; ensure no continuous hidden rendering.

Physical hardware and assistive technologies are not supplied by this repository.
These items stay open when that environment is unavailable, even when automated
checks pass.
