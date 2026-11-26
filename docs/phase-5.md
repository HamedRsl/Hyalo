# Phase 5: mobile and app patterns

Introduced in version 0.5.0.

### Scope correction: application compositions

The latest roadmap decision moves notification center/push card, chat/message list,
and numeric keypad out of reusable component-family scope and into editable blocks.
Phase 5 therefore contains **12 reusable families and 3 application compositions**,
rather than 15 reusable families. The original 15-row inventory below is retained
as historical release scope, not as the updated family count.

Use `/blocks/notifications`, `/blocks/marketplace-chat`, and `/blocks/transfer` for
copyable primitive-based source. Each example supplies editable TypeScript, HTML
and CSS; hosts own their state, transport and backend validation. Existing
`/notification-center`, `/chat`, `/keypad` and `/blocks` exports remain compatible;
no existing selector or entry point is removed. Old component docs routes remain
reachable but these compositions are listed under Application blocks, not the
component-family catalog. No AI chat or prompt-kit family is introduced.

The supplied roadmap is scope and acceptance data. This implementation covers its 15 phase 5 families, shared drag controller and three composed blocks. The optional dock and status island are included. Phase 6 remains separate.

## Inventory

| Family                             | Public entry point   | Docs route                      |
| ---------------------------------- | -------------------- | ------------------------------- |
| Bottom sheet                       | /bottom-sheet        | /components/bottom-sheet        |
| Action sheet                       | /action-sheet        | /components/action-sheet        |
| Mobile tab bar                     | /tab-bar             | /components/tab-bar             |
| FAB / speed dial                   | /fab                 | /components/fab                 |
| Slide to confirm                   | /slide-confirm       | /components/slide-confirm       |
| Numeric keypad                     | /keypad              | /components/keypad              |
| Pull to refresh                    | /pull-refresh        | /components/pull-refresh        |
| Swipe actions                      | /swipe-actions       | /components/swipe-actions       |
| Swipe deck                         | /swipe-deck          | /components/swipe-deck          |
| 3D card stack                      | /card-stack          | /components/card-stack          |
| Notification center and push card  | /notification-center | /components/notification-center |
| Chat bubble and message list       | /chat                | /components/chat                |
| Meter group and segmented progress | /meter (extended)    | /components/meter               |
| Glass dock                         | /dock                | /components/dock                |
| Dynamic status island              | /status-island       | /components/status-island       |

All entry points use the `@hyalo/angular` prefix. The existing meter remains compatible. The 14 new entries bring the package to 99 acyclic entry points. No new runtime dependency is introduced.

## API and configuration comparison

Checked November 17, 2026 against primary documentation and installed declarations. These are design references, not assertions of identical APIs or dependency compatibility.

Installed primary declarations inspected through `tmp/api-audit/query.mjs`:

- Angular Material 22.2.7: bottom sheet configuration/reference, tab navigation and links
- PrimeNG 22.1.5: SpeedDial, Dock, MeterGroup and InputNumber
- NG-ZORRO 22.2.0: notification service and notification configuration
- Nebular 17.0.0: chat/message declarations; its Angular 21 peer range makes it a reference, not a dependency
- Taiga UI core/kit 5.33.0: swipe actions, notification and progress color segments

| Family                     | Reference and relevant controls                                                                                                                                                                               | Hyalo decision                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bottom sheet               | [Material](https://material.angular.dev/components/bottom-sheet/api): data, label, focus, dismissal, ref/result; [Ionic modal](https://ionicframework.com/docs/api/modal): breakpoints and initial breakpoint | Service/ref plus declarative host; fractions 0..1; always retains a full stop; snapTo, breakpoint signal/output and typed closed result; existing drawer material, size, autofocus, role, data and dismissible contract                                             |
| Action sheet               | [Ionic](https://ionicframework.com/docs/api/action-sheet): button text, disabled/destructive/cancel roles, dismissal/result                                                                                   | Typed HySheetAction extends shared HyAction, explicit destructive tone, cancel last, selected/dismissed outputs and shared sheet options                                                                                                                            |
| Tab bar                    | [Material tabs](https://material.angular.dev/components/tabs/api): active, disabled, native links and focus                                                                                                   | HyNavigationItem with activeId, label, badge/icon, logical orientation, fixed safe-area layout, material and selected event; native link semantics rather than tab-panel roles                                                                                      |
| FAB / speed dial           | [PrimeNG](https://primeng.org/speeddial): model, visible, direction, type, radius, mask, disabled, outside close, keyboard                                                                                    | Shared actions, open model, four layouts, logical direction, radius, mask, outside/selection dismissal, labels, shared size/tone and selected/activated events                                                                                                      |
| Slide to confirm           | [Ionic gesture controller](https://ionicframework.com/docs/utilities/gestures): intent, threshold, cancellation; native button semantics                                                                      | Boolean Signal Forms value, actual-distance threshold, loading/readonly/disabled, confirmation output, explicit reset, native click/keyboard alternative; velocity alone cannot confirm                                                                             |
| Numeric keypad             | [PrimeNG InputNumber](https://primeng.org/inputnumber): locale, numeric parsing, readonly and form interaction                                                                                                | String value deliberately preserves zeros; localized digits, decimal/negative opt-ins, maxLength, masking, composition/paste, submit and shared field metadata. Currency grouping/rounding remains the existing number-input responsibility                         |
| Pull to refresh            | [Ionic](https://ionicframework.com/docs/api/refresher): pull threshold, disabled, completion and refresh event                                                                                                | One native scroll owner, threshold and height, refreshing model/complete(), labels and a visible refresh button; no simulated network work or custom scrolling engine                                                                                               |
| Swipe actions              | [Ionic item sliding](https://ionicframework.com/docs/api/item-sliding) and [Taiga](https://taiga-ui.dev/components/swipe-actions/): sides, open/close and desktop controls                                    | Logical start/end actions, open model, action width, optional full swipe, disabled/outside closing, selected event, inert closed rails and visible disclosure                                                                                                       |
| Swipe deck                 | [Ionic gesture controller](https://ionicframework.com/docs/utilities/gestures): pointer ownership and cancellation                                                                                            | Typed card fragment and key function, controlled index, threshold, logical direction decision event, native pass/keep/undo and stale-completion guard; no direct equivalent in the compared Angular component suites                                                |
| 3D card stack              | Existing carousel/card composition and native navigation                                                                                                                                                      | Typed fragment with active/index context, stable keys, controlled activeIndex, depth/count/spread/perspective, disabled/navigation labels and selected event; decorative layers are inert; no direct equivalent claimed                                             |
| Notifications              | [NG-ZORRO](https://ng.ant.design/components/notification/en): keyed notifications, placement, duration, data and lifecycle callbacks                                                                          | Persistent immutable center and standalone push card; id, tone, read, timestamps, action links, dismissibility, sorting/filtering, localized labels, read/dismiss/action/clear outputs. Duration and placement remain the existing transient toast service contract |
| Chat                       | [Nebular](https://akveo.github.io/nebular/docs/components/chat/overview): sender/date, avatar, quote/files, reply and scroll-bottom behavior                                                                  | Typed message/attachment records, incoming/outgoing bubbles, avatar, quote, native attachment links, delivery/retry states, UTC/locale configuration, scroll-aware history loading and projected composer; text is never rendered as HTML                           |
| Meter / segmented progress | [PrimeNG](https://primeng.org/metergroup): min/max, values, orientation and legend placement; [Taiga progress](https://taiga-ui.dev/components/progress-bar/): segments                                       | Existing meter retained; bounded allocation, semantic tones, horizontal/vertical orientation, legend placement/orientation, localized values, accessible aggregate meter and a separate semantic progress-stage list                                                |
| Glass dock                 | [PrimeNG](https://primeng.org/dock): data model, position, names and keyboard navigation                                                                                                                      | Reuses tab-bar data/semantics/material, logical position and optional fixed mode; opt-in magnification/distance/max scale affect icons only, gated by fine pointer, motion and fidelity                                                                             |
| Status island              | Existing popover/progress with keyed notification priority patterns                                                                                                                                           | Controlled items or injectable HyStatusQueue, priority/tie order, expanded model, localized labels/live policy, progress/action/dismissibility, stable trigger and focus-managed details; no direct equivalent claimed                                              |

Vendor class/style forwarding, per-library animation engines and duplicate event aliases are represented by Angular host styling, Hyalo design tokens, existing configuration and one typed output per action. Ionic nonmodal sheet/backdrop-breakpoint modes remain separate from this modal sheet contract. Use canDismiss for synchronous or asynchronous dismissal validation; dismissible controls user Escape/backdrop/zero-stop dismissal. See [the phase 5 API follow-up](phase-5-api-review.md) for the added contracts.

The component docs enumerate public inputs, models, events and methods. Data objects are readonly; hosts replace arrays/records after actions. Localization is supplied through label inputs, locale and state-label records.

## Shared gesture and motion contract

`HyDragController` in /motion owns one pointer and one bounded spring. It locks axis intent after slop, rejects perpendicular scrolling, ignores other pointer IDs, uses capture and timestamp velocity, projects releases, applies edge resistance, suppresses the post-drag click and cancels on lost capture or pointercancel. Releasing outside the element clears a pending press. Visibility changes settle finite work without leaving a completion stranded; destroy removes listeners and frame work.

`provideHyGestures({ slop, swipeThreshold, refreshThreshold })` composes with a parent provider. Defaults are 10px, 80px and 72px. Interactive descendants keep native behavior. Every gesture has native controls. Reduced motion and low fidelity keep static functionality; depth and dock magnification are optional enhancements.

## Forms, overlays and rendering

Keypad and confirmation implement Angular 22 Signal Forms value controls through the existing field metadata base. Tests cover canonical value, leading zeros, composition, maxLength, required, readonly/disabled, touch and reset. Typed Reactive Forms can use the existing compatForm bridge. A displayed confirmation is UI intent; hosts still authorize transactions.

Sheets reuse CDK dialogs, focus trap, focus return and the drawer's overlay CSS. Use HyBottomSheet.open for component/TemplateRef content. Declarative hosts also accept a content TemplateRef. Prefer an explicit template for composed or reprojected content so nested controls remain deferred while a sheet is closed. Both server and client keep that closed template uninstantiated. No skip-hydration escape is used.

Components use OnPush/signals, standalone imports, logical CSS, shared semantic tokens and bounded per-component overrides. Dock scales icons inside stable links. Repeated cards and lists use existing solid/tinted surface tokens; they do not add repeated backdrop-blur layers.

## Composed blocks

Import HyWalletBlock, HyTransferBlock and HyOrderTrackerBlock from /blocks. Live examples and callbacks are at /mobile-patterns.

- Wallet: readonly account records (id, label, balance, currency, detail), active account model, locale, quick actions, loading/error/empty/retry states; hyWalletContent slot
- Transfer: recipient and canonical amount models, currency/locale, idle/loading/error/success, localized labels, submitted request; hyTransferDetails slot for fees/disclosures
- Order tracker: open model, heading/detail, readonly stages, sheet options, loading/error/retry and host action; hyOrderRoute specialist integration slot and additional projected content

The transfer block accepts a positive decimal amount with at most two fraction digits as a UI default. Hosts validate currency-specific precision, limits, recipient eligibility, fees and authorization. Map rendering, payment processing, chat transport, push subscriptions and realtime state are application integrations.

## Verification

Validation results are recorded after the final build and browser pass. Unit axe checks exclude color contrast because jsdom cannot compute styles; browser contrast checks complement them. Automated results do not replace manual screen-reader or real-device testing. No physical-device performance budget is claimed.
