# Phase 5 API follow-up

Reviewed November 17, 2026 on the existing `develop` working tree. Scope is the roadmap's 15 mobile families, their shared gesture prerequisite, and the three mobile blocks. This is an API capability comparison, not a promise that every vendor property or alias has an identical Hyalo name.

## References

The comparison uses primary published declarations for Angular Material 22.2.7, PrimeNG 22.1.5, NG-ZORRO 22.2.0, Nebular 17.0.0 and Taiga UI 5.33.0, plus Ionic's public gesture-oriented API documentation. Nebular's Angular 21 peer range is a comparison constraint; it was not installed into Hyalo. No runtime dependency was added.

- [Material bottom sheet](https://material.angular.dev/components/bottom-sheet/api): overlay configuration, results, focus restoration and interaction observables
- [Material tabs](https://material.angular.dev/components/tabs/overview): navigation versus content tabs
- [PrimeNG SpeedDial](https://primeng.org/speeddial), [Dock](https://primeng.org/dock), [MeterGroup](https://primeng.org/metergroup) and [InputNumber](https://primeng.org/inputnumber): templates, layout, item metadata, precision and imperative controls
- [NG-ZORRO notifications](https://ng.ant.design/components/notification/en): notification presentation and lifecycle boundaries
- [Nebular chat](https://akveo.github.io/nebular/docs/components/chat/overview): composer, files, messages and date formatting
- [Taiga swipe actions](https://taiga-ui.dev/components/swipe-actions/) and [progress segments](https://taiga-ui.dev/components/progress-bar/): action disclosure and segment presentation
- [Ionic modal](https://ionicframework.com/docs/api/modal), [action sheet](https://ionicframework.com/docs/api/action-sheet), [refresher](https://ionicframework.com/docs/api/refresher) and [sliding item](https://ionicframework.com/docs/api/item-sliding): dismissal validation, async action handlers, gesture lifecycle and reveal metrics

## Gaps implemented

The component documentation tables include the individual inputs, outputs, methods and template context types added by this review.

| Phase 5 family             | Added APIs and behavior                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bottom sheet               | `canDismiss` boolean/async guard; serialized `dismiss(result, reason)` returning acceptance; `opened`, structured `dismissed`, guard-error reporting; backdrop/keyboard observables; handle visibility/click policy; restore-focus policy; custom injector/view container, direction, backdrop, classes, scroll strategy, sizing and navigation disposal options |
| Action sheet               | Optional action `handler` and `data`; Promise handlers and false vetoes; `pending`, `actionError`, `disabled`, `closeOnSelect`; public `choose`; duplicate execution and stale async-result protection                                                                                                                                                           |
| Tab bar                    | Item `hidden`, `target`, `rel`, `ariaLabel`, `badgeLabel`; global disabled/label visibility; typed `itemTemplate`; `focusItem(id)`; native blank-target protection and accessible disabled links                                                                                                                                                                 |
| FAB / speed dial           | Typed `itemTemplate`, `closeIcon`, `shown`/`hidden`, public `show`/`hide`/`toggle`; ArrowUp opens at the last enabled action; horizontal keyboard movement follows RTL                                                                                                                                                                                           |
| Slide to confirm           | Public guarded `confirm()`; measures the current track for programmatic or keyboard confirmation; existing form value, threshold, loading, cancellation and reset contracts retained                                                                                                                                                                             |
| Numeric keypad             | Telephone/calculator ordering, displayed decimal separator with canonical dot model, `maxFractionDigits`, native `autocomplete`; public append/erase/clear/sign/submit; complete-number submission and IME-safe Enter                                                                                                                                            |
| Pull to refresh            | `pullFactor`, `maxPull`, `started`, `pulled`, `refreshEnded`; public request/cancel/getProgress and existing complete; external refreshing state also holds the indicator                                                                                                                                                                                        |
| Swipe actions              | Public `reveal(side)`, physical open amount and signed logical sliding ratio; `sliding`, configurable full-swipe threshold and close-on-select; disabled and unavailable rails reject imperative reveals                                                                                                                                                         |
| Swipe deck                 | Public swipe/undo/reset, `allowUndo`, `undone`, `finished`, `busy`; duplicate decision protection and cancellation of pending work on reset or changed data                                                                                                                                                                                                      |
| 3D card stack              | `loop`, public select/next/previous/reset; wrapped visible cards and matching navigation controls                                                                                                                                                                                                                                                                |
| Notification center/card   | Loading/error/retry and pagination contracts; disabled controls; typed item template; configurable Intl date format; optional image; guarded read/dismiss/action/bulk request methods                                                                                                                                                                            |
| Chat / message list        | `HyChatComposer` and submission/file rejection types; controlled draft/files, pending state, attachment count/byte limits, localized labels and native accept hint; Shift+Enter/IME support; message templates, sender/avatar visibility, date format, attachment activation, near-bottom threshold and scroll-to-message                                        |
| Meter / segmented progress | Segment CSS color/icon metadata; typed meter/legend templates with normalized percent/total; start/end projection slots; label visibility; vertical stage layout, accessible value text and step template                                                                                                                                                        |
| Glass dock                 | Inherits tab-bar templates, disabled state and label policy; public focus-by-ID; responsive pixel breakpoint; magnification reset when data, position or motion policy changes                                                                                                                                                                                   |
| Status island              | Typed detail template and disabled state; public dismiss/activate; keyed queue get/has/update; expanded details close when the queue empties or the control is disabled                                                                                                                                                                                          |

The shared drag controller accepts an optional positive distance factor for refresher resistance. Existing axis locking, pointer ownership, velocity, bounds, reduced-motion behavior and cancellation remain shared.

## Contracts and deliberate differences

- Normal sheet dismissal paths use the same guard, including injected `HyDialogRef.close`. A false result retains the sheet; rejected guards remain observable and can be retried. Concurrent requests share the first request and result. `dismiss()` resolves when accepted; `closed`/`dismissed` resolve after exit. Component destruction and optional CDK navigation disposal must release the overlay without waiting for an application guard.
- `dismissible` controls Escape, backdrop and the zero stop. An explicit close action still works unless `canDismiss` vetoes it. The full-height breakpoint remains available for compatibility. Sheet stops are fractions of the configured sheet height. Content scrolling remains native; dragging is owned by the handle. Ionic's content-driven expansion, nonmodal backdrop breakpoints and platform-specific presentation modes are not copied.
- Action handlers run for explicit action activation. A false return retains the sheet; a rejected handler emits `actionError`. Existing selected and dismissed outputs remain compatible. Hosts still own routing, destructive work and application results. Backdrop dismissal does not execute a cancel action's handler.
- Phase 5 tab bar and dock are native navigation controls. Async/lazy content panels belong to the existing tabs family and routing, outside this request's phase. General forms directives and earlier-phase component gaps are also outside scope.
- Composer attachments are local `File` values. The accept attribute is a picker hint; count and size are client convenience checks. Uploading, MIME verification, message persistence, map rendering, payments and realtime subscriptions remain host integrations.
- PrimeNG item commands are represented by existing typed selection outputs. Component class/style aliases, framework-specific animation options and repeated event aliases use Hyalo's host styling, tokens, motion policy and existing controlled state instead.
- Notification center is a persistent inbox. Transient placement, duration and toast stacking remain the existing toast service's responsibility. No duplicate notification service was introduced. Status island, swipe deck, slide confirmation and card stack have no direct one-to-one equivalent in every compared suite.
- Wallet, transfer and order-tracker blocks were checked as consumers of these APIs. Their existing loading/error/success, immutable data and host callbacks remain appropriate; no backend contract was added.

## Validation

Focused phase 5 tests cover guarded dismissal and disposal, async action veto/error/duplicates, localized keypad precision and IME, composer submission and attachments, navigation accessibility, template contexts, stack/deck controls, refresh lifecycle, and swipe metrics. Existing phase 5 component, motion, forms and mobile-block tests are included in the integration runs.

The final validation results are reported with the implementation. Unit accessibility checks run in jsdom and exclude computed color contrast. Production docs compilation/prerendering checks the SSR baseline; it does not establish real-device gesture performance, browser hydration/event replay or screen-reader coverage.

Final automated results on November 17, 2026:

- `npm test`: 313 library tests and 12 docs tests passed, 325 total
- `npm run build`: library package built; production docs prerendered 99 routes
- `npm run lint`: Angular/TypeScript/template lint, logical CSS, prose and architecture checks passed
- `npm run check:package`: 99 acyclic entry points, generated exports and optional-engine isolation passed
- `npm run docs:check-sources`: 100 standalone Angular examples compiled

The changes remain uncommitted in the existing working tree.
