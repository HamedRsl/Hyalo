# Chart and lightweight-content API final evidence

This is a scoped acceptance report, not a blanket certification from a green suite. `docs/api-audit-status.json` is intentionally not modified by this work.

## Executed verification

- `npx ng test hyalo --watch=false --include='projects/hyalo/{chart,hotspot,list,sparkline}/*.spec.ts'`: **8 files, 13 tests passed**. The pre-existing real-engine jsdom check logs the expected missing canvas `getContext` warning; canvas rendering is independently covered below.
- `tools/chart-api-browser-probe.js` executed through scratch Playwright against the current development application at `http://localhost:4200/components/chart`, headless installed Microsoft Edge. **23 assertions passed**; machine-readable results are in `docs/verification/chart-api-browser.json`.
- Scoped ESLint on chart implementation and all four added spec files: passed.
- Full library run during concurrent audit work: **208 files passed / 2 failed; 713 tests passed / 2 failed**. Failures were outside this ownership: `select/select.loader.audit.spec.ts` dismissal-abort assertion and `dates/capabilities.audit.spec.ts` year-view keyboard focus assertion. Those files were being developed by other audit owners; no unrelated fix or blanket full-suite success is claimed.
- Browser diagnostics deliberately access the live component's engine and replace input readers for isolated consumer configurations. They exercise actual Chart.js drawing/controllers/hooks and DOM mouse events, not a bundled fake. Public input wiring and replacement are covered separately by Angular TestBed. This is not a trusted physical-pointer, screenshot, cross-browser or hydration claim.

## Per-record disposition

| ID | Disposition | Exact evidence and limits |
| --- | --- | --- |
| API-045 | Verified scoped options contract | `chart/api.audit.spec.ts`: consumer onClick composition, replacement drops prior max and callback. Browser: nested token tooltip preserved with partial scales, real engine replacement drops previous max and invokes only replacement callback. Objects merge recursively; arrays/functions/false replace. Not every Chart.js option permutation is certified. |
| API-046 | Verified local plugins | Angular test forwards plugins and removes them on replacement; browser plugin beforeInit/afterDraw/beforeDestroy proves registration, drawing and replacement teardown. Local `plugins` does not globally register plugins. Re-render destroys/recreates; it is not an in-place plugin diff. |
| API-047 | Verified added controllers | Browser constructs pie/radar/polarArea/scatter/bubble, two actual elements each; scatter/bubble parsed y coordinates asserted. Also verifies area gradient and bar. `points` supplies coordinate data; `values` + `labels` remain the table fallback. Caller must keep numeric fallback aligned: the table intentionally does not serialize x/r coordinates. |
| API-048 | Verified selection/callback composition | Actual DOM mouse event at real chart point gives exactly one `{event,elements}` output with datasetIndex/index 0. Empty activation emits no output but does call consumer callback. Angular test independently verifies payload references and new callback replacement. Not a keyboard point-selection API. |
| API-049 | Fixed and verified lifecycle | RED: new teardown test returned an image from a destroyed engine. GREEN: clear engine reference on destroy; getCanvas returns null after destruction. Test covers pre-ready undefined export/no-op refresh, forwarding MIME/quality, post-destroy undefined export/no-op refresh. Browser export decodes to a real 740×272 PNG and canvas identity matches live Chart.js. Export may throw native canvas/security errors; no download helper is claimed. |
| API-050 | Verified refresh/reinitialize and races | Angular tests prove refresh updates without construction, reinitialize destroys/recreates, only latest out-of-order loader result constructs, and existing chart.spec.ts rejects late load after destroy. Browser retains same live instance for refresh and replaces it through public reinitialize. Reinitialize schedules a render; it is not an awaitable completion promise. |
| API-127 | Partial: supported scoped container mapping verified; per-hotspot input still open | `hotspot/mapping.audit.spec.ts` supplies CDK OverlayContainer, clicks real hotspot trigger, waits for lazy popover load, asserts actual named dialog/content under custom container and synchronous disposal on teardown. Thus scoped dependency-injection container policy already works without touching shared popover. There is still **no independently bindable hotspot container input**; provider governs the injector scope, not each hotspot instance. Custom-container positioning, fullscreen and browser geometry remain unverified. Do not mark fully resolved if inventory requires per-instance binding. |
| API-146 | Different-role, intentionally unchanged | `list/mapping.audit.spec.ts` confirms native ul/li and absence of listbox semantics. Content list is not a selected-value control; no selection-list feature is fabricated. |
| API-147 | Verified elsewhere/composition | `list/mapping.audit.spec.ts` uses actual HyPagination next buttons to update consumer signal-backed list slices: A/B → C/D → E, with disabled final next button and semantic list naming. This proves explicit consumer paging composition, not an integrated fetching/paging list engine or virtualization. |
| API-260 | Verified elsewhere/composition | `sparkline/mapping.audit.spec.ts`: SVG trend loads no chart engine; opt-in detail switches to HyChart area and bar, passes axis max/tooltip enabled, renders numeric fallback and destroys every constructed engine on return to SVG. Real browser independently proves area gradient/bar/controllers. HySparkline itself intentionally remains line SVG with no axes/tooltip engine. |

## Public usage contracts

### Chart options, plugins, selection and export

```ts
import { HyChart, type HyChartData } from '@hyalo/angular/chart';
import type { ChartOptions, Plugin } from 'chart.js'; // type-only; does not eager-load engine

readonly options: ChartOptions = {
  scales: { y: { max: 100 } },
  onClick: (_event, elements) => console.log(elements),
};
readonly plugins: readonly Plugin[] = [{ id: 'consumer', afterDraw: chart => {
  // Draw using chart.ctx if required. Hook executes inside Chart.js lifecycle.
} }];
readonly data: HyChartData = {
  labels: ['A', 'B'],
  series: [{ label: 'Values', values: [10, 20],
    points: [{ x: 1, y: 10, r: 4 }, { x: 2, y: 20, r: 8 }] }],
};
```

```html
<hy-chart #chart label="Values" type="bubble" [data]="data"
  [options]="options" [plugins]="plugins"
  (dataPointSelected)="handleSelection($event)" />
<button (click)="chart.refresh()">Refresh</button>
<button (click)="chart.reinitialize()">Reinitialize</button>
```

After the lazy engine is ready, `chart.getCanvas()` exposes its canvas and `chart.toBase64Image('image/png')` returns a data URL. Before ready export is undefined; after component destruction canvas is null and export is undefined. Readiness has no new public output in this change. Consumer onClick is preserved alongside selection output. Replacing `options`/`plugins` uses a fresh chart configuration, not retention of removed overrides.

### Hotspot container policy

Provide CDK `OverlayContainer` in the owning application/feature injector with `getContainerElement()` returning the desired real DOM container (use a normal OverlayContainer subclass in production to retain its cleanup/style behavior). Descendant hotspot popovers use that container through their existing lazy overlay injector. See the executable provider fixture in `hotspot/mapping.audit.spec.ts`. This is an injection policy, **not** a `[container]` hotspot input. A provider override can affect other CDK overlays in that same injector scope.

### Paged content lists

Import `HyList`, `HyListItem` from `@hyalo/angular/list` and `HyPagination` from `@hyalo/angular/pagination`. Keep one consumer-owned page signal and derive `visible = computed(() => items().slice((page()-1)*pageSize, page()*pageSize))`. Render visible entries with `<li hyListItem [heading]="item">` inside `<hy-list label="Results">`; bind `<hy-pagination [total]="items().length" [pageSize]="pageSize" [(page)]="page" />`. Reset or clamp the consumer page when the source/filter shrinks. The component does not fetch remote data or mutate the list for you.

### Lightweight trend to full chart

Use `<hy-sparkline [data]="values" label="Trend" />` for SVG-only overview. For area/bar/axis/tooltips, explicitly render `<hy-chart type="area" [data]="chartData" [options]="options" label="Trend detail" />` (or type bar), with labels and series values mapped by the consumer. This opt-in boundary preserves lazy Chart.js loading; no static engine import was added.
