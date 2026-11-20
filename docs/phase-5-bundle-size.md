# Phase 5 bundle size comparison

Historical benchmark snapshot: these measurements predate the final cleanup and retain duplicate RxJS copies from the isolated consumer. Treat the byte counts as archived observations, not the current package baseline or verified optimization savings. The follow-up optimization measurement was stopped at the user's request.

Measured November 17, 2026 against the production Hyalo 0.5.0 package built at 11:44:22 UTC. All sizes use decimal kB, 1 kB = 1,000 bytes.

## Result

The complete phase 5 implementation adds **84.61 kB gzip / 70.92 kB Brotli of JavaScript** over the same empty Angular application. The actual complete JS output is **115.05 kB gzip**, including Angular. Adding the three mobile blocks adds only **2.53 kB gzip** to that combined build because their components are already present.

| Build                                               | Added raw JS kB | Added gzip JS kB | Added Brotli JS kB | Total gzip JS including Angular kB |
| --------------------------------------------------- | --------------- | ---------------- | ------------------ | ---------------------------------- |
| 15 phase 5 families                                 | 308.52          | 84.61            | 70.92              | 115.05                             |
| Phase 5 + wallet, transfer and order-tracker blocks | 321.61          | 87.14            | 72.82              | 117.58                             |

The full Hyalo global stylesheet adds **5.54 kB gzip** once. Loading that stylesheet with the complete phase 5 app gives approximately **120.59 kB gzip** across the measured JS and CSS files. This is a benchmark app, without an application router, SSR runtime, polyfills, product code, icons/fonts downloaded separately, or network code.

## Component comparison

Added **gzip JavaScript kB**, including retained framework code, component-local styles and transitive dependencies, after subtracting the empty Angular app. Dynamic JS chunks are included in this table. Global CSS is separate. PrimeNG columns omit an explicit theme preset; themed figures are below. Ionic and Taiga include their documented shared initialization/root setup.

| Family / control       | Hyalo | Material | PrimeNG | NG-ZORRO | Taiga | Ionic |
| ---------------------- | ----- | -------- | ------- | -------- | ----- | ----- |
| Bottom sheet           | 40.49 | 31.54    | n/m     | n/m      | 77.50 | 85.12 |
| Action sheet           | 49.77 | n/m      | n/m     | n/m      | n/m   | 91.01 |
| Tab bar                | 18.54 | 30.78    | n/m     | n/m      | 43.60 | 85.13 |
| Single FAB             | 29.03 | 17.85    | n/m     | 66.76    | n/m   | 88.13 |
| Speed dial             | 29.14 | n/m      | 94.22   | 66.80    | n/m   | 88.72 |
| Slide to confirm       | 21.26 | n/m      | n/m     | n/m      | n/m   | n/m   |
| Numeric keypad         | 10.90 | n/m      | n/m     | n/m      | 39.69 | n/m   |
| Pull to refresh        | 26.02 | n/m      | n/m     | n/m      | 44.92 | 89.72 |
| Swipe actions          | 28.44 | n/m      | n/m     | n/m      | 38.19 | 88.64 |
| Swipe deck             | 27.67 | n/m      | n/m     | n/m      | n/m   | n/m   |
| 3D card stack          | 28.08 | n/m      | n/m     | n/m      | n/m   | n/m   |
| Notification center    | 28.55 | n/m      | n/m     | n/m      | n/m   | n/m   |
| Chat + list + composer | 30.09 | n/m      | n/m     | n/m      | n/m   | n/m   |
| Meter group            | 12.08 | n/m      | 44.74   | n/m      | 38.28 | n/m   |
| Segmented progress     | 9.12  | n/m      | n/m     | n/m      | 38.38 | n/m   |
| Glass dock             | 21.82 | n/m      | 88.21   | n/m      | n/m   | n/m   |
| Status island          | 41.47 | n/m      | n/m     | n/m      | n/m   | n/m   |

n/m means no matching dedicated control was benchmarked; it does not prove the entire library cannot compose that pattern. All 15 Hyalo families were measured. FAB and meter each have two rows so their different modes are not conflated.

Compatibility and equivalence details:

- **Nebular 17.0.0 is blocked on this Angular 22/CDK 22 stack.** All four attempts, setup, bubble, composer and complete chat, fail because its FESM imports the removed CDK export `_VIEW_REPEATER_STRATEGY`. Its declared peers require Angular/CDK 21. No source patch, externalized dependency, or fabricated component figure was used. Its CSS asset can still be measured independently below. A valid supported-stack JS measurement needs an Angular 21 benchmark or an Angular 22-compatible Nebular release.
- Material's bottom sheet does not include Hyalo's snap-point dragging contract. Material's tab-nav example includes its required tab-nav panel; both cases use native links and no application router.
- Taiga's keypad is a projected-button layout with app-owned editing, not a numeric form control. Its colored progress bar is a partial meter-group comparison; its segmented numeric progress does not render Hyalo's per-step labels/states. Its swipe-action sample has one end rail, whereas the Hyalo and Ionic samples have start and end actions. Both the modal Taiga sheet and its simpler nonmodal container were measured; the main table uses the modal sheet.
- No persistent notification-inbox equivalent is substituted with a transient toast. Standalone push-card/proxy figures are listed separately: Hyalo notification card **20.48**, Taiga push **46.28**, NG-ZORRO notification service **62.39** kB gzip. Their behavior differs.
- Hyalo chat includes message list, bubble rendering and the new attachment-capable composer. There is no supported-stack Nebular number to rank it against.

## Every Hyalo phase 5 component and block

The raw, gzip and Brotli columns below are whole-app differences from baseline. They are **not additive**. Initial excludes dynamically imported JS; total includes all emitted JS chunks. Compression runs independently per file, as on an HTTP server.

| Case                | Added raw JS kB | Added initial gzip kB | Added total gzip kB | Added total Brotli kB |
| ------------------- | --------------- | --------------------- | ------------------- | --------------------- |
| bottom-sheet        | 138.03          | 40.49                 | 40.49               | 33.89                 |
| bottom-sheet-host   | 142.74          | 42.08                 | 42.08               | 35.13                 |
| action-sheet        | 167.06          | 49.77                 | 49.77               | 41.37                 |
| tab-bar             | 55.28           | 18.54                 | 18.54               | 16.33                 |
| fab                 | 91.12           | 29.03                 | 29.03               | 23.65                 |
| speed-dial          | 91.36           | 29.14                 | 29.14               | 23.72                 |
| slide-confirm       | 63.85           | 21.26                 | 21.26               | 18.63                 |
| keypad              | 32.30           | 10.90                 | 10.90               | 9.68                  |
| pull-refresh        | 81.84           | 26.02                 | 26.02               | 20.98                 |
| swipe-actions       | 90.31           | 28.44                 | 28.44               | 23.18                 |
| swipe-deck          | 86.70           | 27.67                 | 27.67               | 22.47                 |
| card-stack          | 87.60           | 28.08                 | 28.08               | 22.75                 |
| notification-card   | 64.49           | 20.48                 | 20.48               | 16.26                 |
| notification-center | 92.97           | 28.55                 | 28.55               | 23.22                 |
| chat-bubble         | 69.94           | 22.37                 | 22.37               | 17.90                 |
| message-list        | 93.36           | 28.79                 | 28.79               | 23.25                 |
| chat-composer       | 69.85           | 22.14                 | 22.14               | 17.71                 |
| chat                | 100.35          | 30.09                 | 30.09               | 24.38                 |
| meter               | 16.34           | 5.64                  | 5.64                | 4.98                  |
| meter-group         | 36.03           | 12.08                 | 12.08               | 10.70                 |
| segmented-progress  | 27.73           | 9.12                  | 9.12                | 8.12                  |
| dock                | 66.69           | 21.82                 | 21.82               | 19.15                 |
| status-island       | 136.61          | 30.97                 | 41.47               | 35.19                 |
| wallet-block        | 93.14           | 29.58                 | 29.58               | 24.05                 |
| transfer-block      | 78.08           | 25.01                 | 25.01               | 21.98                 |
| order-tracker-block | 166.16          | 49.04                 | 49.04               | 40.82                 |

The service and declarative bottom-sheet host are separate cases. The single FAB and speed-dial cases retain almost the same component implementation. Chat child controls and the complete composition are measured independently. The existing single meter is included as context alongside the phase 5 meter group and segmented progress.

Status island is the main individual case with deferred code: its initial delta is **30.97 kB gzip**, while all emitted JS adds **41.47 kB**. In the full phase 5 build, most of that dependency is already shared, leaving only 173 gzip bytes deferred.

## Combined matched subsets

Each row compiles a fresh app containing the listed controls together. This captures shared-code savings and avoids summing standalone costs. These comparisons are feature-area matches, not assertions of identical API coverage.

| Controls bundled together                                                                                | Comparator                                 | Hyalo added gzip kB | Comparator added gzip kB | Hyalo relative size |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------- | ------------------------ | ------------------- |
| Bottom sheet + tab bar + single FAB                                                                      | Material                                   | 52.50               | 50.21                    | 4.6%                |
| Speed dial + dock + meter group                                                                          | PrimeNG, no explicit preset                | 34.57               | 103.60                   | -66.6%              |
| Speed dial + dock + meter group                                                                          | PrimeNG with Aura                          | 34.57               | 127.86                   | -73.0%              |
| Sheet host + action sheet + tab bar + speed dial + refresher + swipe actions                             | Ionic with setup                           | 56.90               | 120.47                   | -52.8%              |
| Sheet host + tab bar + keypad + refresher + swipe actions + push card + meter group + segmented progress | Taiga with root/setup; partial equivalents | 59.73               | 91.97                    | -35.1%              |

Material is smaller for the combined sheet + tab-nav + simple-FAB sample by **2.29 kB gzip**. Hyalo's matching speed-dial + dock + meter-group sample is **66.6% smaller** than PrimeNG's sample before an explicit PrimeNG theme. The Taiga comparison includes the partial equivalents documented above and must not be read as feature parity.

## Shared setup and incremental component costs

The base setups add these gzip JS costs over the empty Angular app: PrimeNG + Aura **43.99**, Ionic `provideIonicAngular()` **78.66**, Taiga `TuiRoot` + event plugins **37.04** kB. They are included in the configured rows below. PrimeNG's bare component rows above do not include Aura, so do not subtract the Aura setup from a bare component or simply add the two standalone costs.

The last column compares **component plus setup** to the **same setup without the component**. It is useful when an app already uses that kit; it is not comparable to the cost of adopting a different kit from scratch.

| Kit     | Component          | Configured standalone added gzip kB | Increment over that kit setup kB |
| ------- | ------------------ | ----------------------------------- | -------------------------------- |
| PrimeNG | speed-dial         | 118.59                              | 74.59                            |
| PrimeNG | dock               | 112.53                              | 68.54                            |
| PrimeNG | meter-group        | 69.26                               | 25.26                            |
| Ionic   | bottom-sheet       | 85.12                               | 6.46                             |
| Ionic   | action-sheet       | 91.01                               | 12.35                            |
| Ionic   | tab-bar            | 85.13                               | 6.47                             |
| Ionic   | fab                | 88.13                               | 9.46                             |
| Ionic   | speed-dial         | 88.72                               | 10.06                            |
| Ionic   | pull-refresh       | 89.72                               | 11.06                            |
| Ionic   | swipe-actions      | 88.64                               | 9.98                             |
| Taiga   | bottom-sheet       | 77.50                               | 40.46                            |
| Taiga   | tab-bar            | 43.60                               | 6.56                             |
| Taiga   | keypad             | 39.69                               | 2.65                             |
| Taiga   | pull-refresh       | 44.92                               | 7.88                             |
| Taiga   | swipe-actions      | 38.19                               | 1.15                             |
| Taiga   | notification-card  | 46.28                               | 9.24                             |
| Taiga   | meter-group        | 38.28                               | 1.23                             |
| Taiga   | segmented-progress | 38.38                               | 1.33                             |

This is why an existing Ionic or Taiga app can add a control more cheaply than the main adoption-cost table suggests. The default Ionic initializer retains modal/popover infrastructure; no whole-library `IonicModule` import was used. Component-specific Ionic 9 entry points were used throughout.

## Global styles

Minified and compressed separately. Component-local CSS already retained in JS must not be added again. Core/full rows for the same kit are alternatives, not cumulative. Full ZORRO or Nebular stylesheets are not claims about the minimum selective theme a consumer could generate.

| Asset               | Minified raw kB | Gzip kB | Brotli kB |
| ------------------- | --------------- | ------- | --------- |
| hyaloCore           | 14.77           | 3.99    | 3.50      |
| hyaloFull           | 23.68           | 5.54    | 4.88      |
| hyaloDialogOverlay  | 4.17            | 1.09    | 0.96      |
| hyaloPopoverOverlay | 1.87            | 0.59    | 0.51      |
| materialTheme       | 6.85            | 1.27    | 1.08      |
| zorroFull           | 557.10          | 68.33   | 51.09     |
| ionicCore           | 11.06           | 2.48    | 2.08      |
| ionicFull           | 38.61           | 6.09    | 4.58      |
| taigaTheme          | 87.85           | 5.66    | 4.83      |
| nebularDefaultTheme | 321.51          | 26.86   | 20.27     |

PrimeNG's Aura configuration is JavaScript and is included in its configured cases. Taiga's root component styles are already in its JS; its global theme token CSS is listed separately. Remote font/asset downloads and icon sets are not included. The original global styles were minified without substituting application styling or removing vendor rules.

## Local module inventory

These are **minified published partial-compiled FESM files**, excluding all imports and application linking. They are useful to distinguish Hyalo's own module size from full adoption cost, but **are not individual component browser sizes** and must not be summed as a shipping bundle. The chat and meter entry points each export several components; blocks exports other phases too.

| Hyalo entry point   | Published raw kB | Minified module kB | Minified module gzip kB |
| ------------------- | ---------------- | ------------------ | ----------------------- |
| bottom-sheet        | 21.92            | 15.70              | 4.93                    |
| action-sheet        | 9.76             | 7.34               | 2.00                    |
| tab-bar             | 14.77            | 11.96              | 3.04                    |
| fab                 | 18.18            | 13.73              | 3.41                    |
| slide-confirm       | 12.71            | 10.50              | 2.77                    |
| keypad              | 15.49            | 12.07              | 2.86                    |
| pull-refresh        | 12.92            | 9.64               | 2.72                    |
| swipe-actions       | 17.18            | 13.61              | 3.25                    |
| swipe-deck          | 14.93            | 11.10              | 3.08                    |
| card-stack          | 17.43            | 12.70              | 3.54                    |
| notification-center | 33.33            | 26.33              | 4.26                    |
| chat                | 48.11            | 38.90              | 5.72                    |
| meter               | 31.11            | 25.79              | 3.61                    |
| dock                | 12.38            | 9.09               | 2.42                    |
| status-island       | 12.13            | 9.27               | 2.37                    |
| blocks              | 95.47            | 75.07              | 9.96                    |
| motion              | 23.69            | 16.39              | 5.28                    |
| core                | 13.97            | 9.82               | 3.17                    |

## Method and provenance

- Fresh production build, then `npm pack`, then extraction of that exact archive into an isolated benchmark consumer. The whole Hyalo npm archive is **506.58 kB** compressed and **2.78 MB** unpacked. Those are whole-kit installation sizes, not phase 5 browser download sizes.
- Same Angular core/platform-browser **22.2.3**, Angular compiler **22.2.3**, CLI/build **22.2.5**, CDK **22.2.7**, Node **v26.3.1**, ES2022, production AOT, minification and tree shaking. No externals, source maps, SSR runtime or polyfills. Styles were kept out of the app styles array and measured separately.
- Comparator versions: Material **22.2.7**, PrimeNG **22.1.5**, NG-ZORRO **22.2.0**, Ionic Angular/core **9.0.11**, Taiga core/kit/addon-mobile/layout **5.33.0**, Nebular **17.0.0** attempted and blocked. These are pinned benchmark versions, not a claim that each is the latest available release.
- Empty app: **91.53 raw / 30.44 gzip / 27.52 Brotli kB**. Each delta subtracts independently compressed complete app outputs. Gzip level 9; Brotli quality 11. Every emitted JS resource is compressed separately and summed; static-import closure defines initial JS.
- **70 production cases built successfully; four Nebular cases blocked** with preserved compiler logs. All successful result totals were checked against their emitted file sums. Named imports and minimal real templates/service event handlers keep the measured code reachable. These are build/transfer measurements, not a browser interaction or performance test.
- Hyalo's full phase 5 output has no GSAP, Chart.js, highlight.js, date engine, vendor-kit or Ionic dependency in its build attribution. Its retained module bytes include Angular/CDK and RxJS. No runtime dependency or implementation source was changed for this audit.
- Snapshot npm integrity: `sha512-iR6S+RSrvWkxlGL6ppBead3+hMgwFwdfp2VPlXb9JmHoZ4VknROKHZm7BAHlfZGVuolIZqVy+ow9zOba5pONHQ==`.
- Machine-readable byte results are in [phase-5-bundle-results.json](phase-5-bundle-results.json), with a [CSV](phase-5-bundle-results.csv). The isolated harness, exact templates, build logs and esbuild input/output graphs remain in `tmp/phase5-bundle-audit/`; rerun `node tmp/phase5-bundle-audit/run.mjs` with that environment intact. Failed cases are retried; successful identical cases are cached by fixture, package versions and archive metadata.

Primary references: [Angular package format and tree shaking](https://angular.dev/tools/libraries/angular-package-format), [Ionic 9 per-component imports](https://github.com/ionic-team/ionic-framework/blob/main/packages/angular/README.md), [Taiga mobile controls](https://taiga-ui.dev/components/swipe-actions/), [Material bottom sheet](https://material.angular.dev/components/bottom-sheet/overview), [PrimeNG SpeedDial](https://primeng.org/speeddial). The numerical results above are local build measurements, not vendor-published size claims.
