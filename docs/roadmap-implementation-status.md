# Roadmap implementation status and remaining release gates

## Scope and interpretation

### Remediation follow-up (current working tree)

Latest integration after the application-scoped ID fix: **488 library tests across
131 files, 31 docs tests across 10 files, and the generator fixture test pass**.
Library/docs production build prerendered 112 routes. Lint, generated APIs,
110 copyable examples, 109 built package boundaries, the 96-row roadmap gate and
the fresh engine-free consumer check pass. Existing jsdom canvas notices remain;
they are not real GPU rendering evidence. Independent review found a popover
reopen/resize race and a quoted-path portability issue in the consumer script.
Both are corrected: the popover regression was observed failing before its fix,
and the consumer now invokes Node/npm without shell parsing or literal quotes.
Full tests, lint, production build, package and fresh consumer checks pass after
these corrections. No unresolved finding from that scoped review remains; it was
not a complete security or accessibility audit.

The shared ID generator now scopes counters to the application injector rather
than CDK module state. Seven regressions include repeated real SSR bootstraps;
see `roadmap-id-verification.md`. Matching APP_ID and creation order are still
required; this does not close trusted event replay or deferred hydration gates.

The tables below retain the initial audit findings. The following work supersedes
the corresponding missing-test/source gaps; it does not close the browser/device
acceptance matrix:

- Added targeted border-beam, number-ticker, copy, time-picker, search-field,
  password, selectable-radio-card and selectable-checkbox-card specs.
- Fixed copy result state when translated success/failure labels coincide,
  IME search submission, committed time-part selection and disabled-first radio
  focus. `docs/roadmap-families.json` now references these regressions.
- Added filter codec round trips, host-schema rejection and explicit-clock range
  tests. Impossible calendar instants are rejected instead of normalized by
  `Date.parse` (for example, February 30).
- Select now serializes selected option attributes for server-only browsers.
  See `roadmap-select-verification.md` for the real SSR/client findings and
  remaining ID/event-replay limitations.
- Refraction lifecycle regressions cover disposal, context-loss replacement,
  initialization failure and redraw without reloading images. See
  `roadmap-optics-verification.md`; GPU calls are mocked, not driver evidence.
- The notification, marketplace-chat and transfer compositions use public
  primitives and copyable source. Block routes, local state transitions and
  keyboard dismissal/editing were exercised in Chromium. Legacy exports remain.
- Popover panels now observe actual content resizing and reposition after scale
  entry transitions; a short-viewport inbox regression was reproduced in the
  browser and its final panel fit inside the 428px viewport.
- `npm run check:roadmap` verifies all 96 original rows and every referenced
  source/docs/test path, with no unreferenced test gaps. It is a coverage gate,
  not a behavioral-release certificate.
- A fresh built tarball was installed in a scratch consumer without GSAP,
  Chart.js, highlight.js, calendar/editor engines or Three.js. Angular template
  compilation and actual imports of core/button/select/sparkline passed.
  `npm run check:consumer` reproduces this (run a fresh library build first).

Latest settled integration before the shared-ID follow-up: **481 library tests,
31 docs tests and one source-generator regression passed**; lint and 110 generated
example compilations passed. A later full run intentionally caught the new
shared-ID regression before its production fix. Final acceptance still requires
the final unchanged-tree checks; do not treat an intermediate count as a release.

This is an evidence inventory, **not a declaration that phases 0–6 pass release acceptance**. Baseline: `C:/Users/hrsl0/Downloads/Telegram Desktop/ui-kit-roadmap.md`, reviewed November 15, 2026; repository baseline `5ad95a9` plus the working tree inspected during this audit. Existing implementation commits include `2937030` (phase 5), `b91c93d` (phase 6), and `56c1002` (API remediation). These commits are implementation evidence, not browser/device certification.

Phase 5/6 code is already present. All scheduled phase 1–6 rows have identifiable public source and documentation destinations. Several acceptance requirements remain unverified or only partly tested. Phase 0 foundations also exist, but the hydration and performance gates cannot be closed by unit tests or source inspection.

**Explicit plan change:** the user's current classification treats Numeric keypad, Notification center/push card, and Chat/message list as composed **blocks**, not reusable component families. The original phase-5 baseline has 15 scheduled rows; the revised accounting is **12 reusable families + 3 reclassified block rows**, plus the already separate wallet/transfer/order-tracker compositions. Preserve `/keypad`, `/notification-center`, and `/chat` compatibility entry points and old documentation URLs; classification changes do not justify removing public APIs. Inventory, navigation and release notes should use the revised classification consistently. The original roadmap file is not modified by this document.

The baseline scheduled counts are 12 / 21 / 23 / 14 / 15 / 11 for phases 1–6, **96 original scheduled rows**. `docs/roadmap-families.json` is the machine-readable companion: it preserves every original Section 3 row label, phase and order, uses repository-relative file paths for public entry-point barrels, docs source and tests, and marks the three reclassified phase-5 rows `kind: "block"`. Empty `tests` arrays explicitly mean no targeted test evidence was identified; shared fixture references do not imply exhaustive coverage. A Python validation compared the manifest against the actual supplied Section 3 and verified every referenced path and secondary `ng-package.json` exists. Foundation pieces, controller extensions, demo tools, extra controls, and Section 7 blocks are not additional scheduled families. Entry-point counts and selector counts are not family counts.

### Evidence notation

- `L` = `projects/hyalo/`; `D` = `projects/docs/src/app/`.
- Entry `/x` means `@hyalo/angular/x`; its evidence is `L/x/ng-package.json` and `L/x/public-api.ts`, unless noted otherwise.
- Docs `/components/x` maps through `D/app.routes.ts` to `D/pages/x.ts` and its template. Exceptions are stated explicitly.
- Spec paths below are relative to `L` unless prefixed `D/`. A shared spec is real evidence, but does not establish every state of every control it imports.
- **Source/docs present** means the family can be located, not that its complete behavioral or accessibility contract has been proven.
- **Gap** marks missing targeted evidence, not necessarily missing implementation. Cross-cutting gates below apply to every inventory row.

## Phase 0 - foundations (implemented, acceptance partial)

| Roadmap piece | Real source / public boundary | Docs / test evidence | Remaining acceptance |
| --- | --- | --- | --- |
| Design tokens | `styles/parts/tokens.css`, `themes.css`; `/theme`, `/core` | `/foundations`, `/theming`; `theme/palette.spec.ts` | Verify contrast across palette/theme/material combinations in rendered browsers. Token names use the package's `--hy-*` namespace rather than the roadmap's illustrative names. |
| Glass material directive | `core/lib/material/material.ts`; `styles/parts/glass.css` | `src/lib/material/material.spec.ts` via compatibility re-export | Tinted/solid explicitly disable backdrop filtering; profile whole scenes rather than inferring a safe budget from CSS. |
| Styling axes / defaults | `core/lib/core/axes.ts`, `config.ts`, `core/appearance.ts` | `src/lib/core/config.spec.ts`; `/foundations` | Check applicability per control rather than assume every family exposes identical inputs. |
| State data attributes | `core/lib/interaction/state.ts` | `src/lib/interaction/state.spec.ts`, `interaction/interaction.spec.ts` | Preserve native semantics; interaction tests are not a whole-family focus/AT matrix. |
| Motion runtime | `motion/runtime/motion.ts`, `spring.ts`; optional GSAP loader contract in `core/lib/core/gsap.ts` | `src/lib/motion/{motion,spring}.spec.ts`; `/motion` | Real hidden/offscreen/interrupt cleanup coverage remains partial by effect. |
| Fidelity | `core/lib/fidelity/fidelity.ts` initializes detected tier to medium, probes after render, exposes detected/override | `src/lib/fidelity/fidelity.spec.ts`; `D/settings.ts` | **Hydration gate open:** global `afterNextRender` is not proof of local/deferred hydration completion. |
| Package boundaries | Separate `/core`, `/motion`, per-family secondary entry points; `src/public-api.ts` compatibility facade | `tools/check-package-boundaries.mjs`; built export check | Current topology uses flat per-family entries rather than literal `/primitives`, `/optics`, `/charts/sparkline` aggregates. Keep explicit compatibility mapping; repeat fresh pack/consumer-without-engines validation. |
| Optional interaction directives | `/interaction`: magnetic/tilt/reveal/ripple; shared sampler from `/motion` | `interaction/{interaction,pointer}.spec.ts` | Verify production basic-control import closure and native fallback in a consumer without optional engines. |
| Overlay / a11y base | `/overlay`, `/dialog`, `/popover`; `overlay/hover-intent.ts` | `overlay/{positions,presence}.spec.ts`, dialog/popover/menu/hover-card specs | Full focus-return, safe-corridor, touch and screen-reader matrix remains open. |
| Shared scene light | `motion/scene.ts`, `HySceneLight`, `HySceneLightDirective` | `/motion-layout`; indirect pointer tests | One observer per root, host-local writes and read-before-write batching are visible in source; no dedicated exhaustive scene-light regression suite or performance trace found. |
| Forms contract | `/field`: field metadata, value control and `forms-bridge.ts` (`HyForms`) | `field/{field,forms-bridge,advanced-forms,mobile-forms}.spec.ts` | Verify all control categories on the minimum supported Angular release; a representative bridge test is not universal coverage. |
| Locale / digits | `core/digits.ts`, `locale-number.ts`, `search.ts` | `core/locale-number.spec.ts`, masked/advanced/mobile forms specs | Broaden paste/composition/caret coverage to every affected identifier/number control. |
| Icon | `/icon`: registry and SVG component | `icon/icon.spec.ts`; component examples | Audit meaningful/decorative icon naming in compositions. |
| Typography | `styles/parts/typography.css` | `/foundations`, `/theming` | Persian shaping, font loading and truncation need visual/AT checks. |

## Phase 1 - core (12 families, source/docs present; release gates partial)

| Scheduled family | Public entry / source | Docs route | Spec evidence |
| --- | --- | --- | --- |
| Button / icon button / loading | `/button`, `button/button.ts` | `/components/button` | `button/button.spec.ts` |
| Glass panel / card | `/card`, `card/card.ts` | `/components/card` | `card/card.spec.ts` |
| Navbar / app bar | `/navbar` | `/components/navbar` | `navbar/navbar.spec.ts` |
| Tabs / segmented | `/tabs`, `/segmented` | `/components/tabs` | `tabs/tabs.spec.ts`, `segmented/segmented.spec.ts` |
| Text field / textarea / field wrapper | `/field`, `field/{field,input}.ts` | `/components/text-field` | `field/field.spec.ts` |
| Select | `/select` | `/components/select` | `select/select.spec.ts` (keyboard, errors, low-tier native); full dual-mode/hydration matrix missing |
| Checkbox / radio / switch | `/choice` | `/components/checkbox-radio-switch` → `D/pages/choice.ts` | `choice/choice.spec.ts` |
| Dialog / confirm | `/dialog`, `dialog/dialog.ts`, ref/open-surface APIs | `/components/dialog` | `dialog/dialog.spec.ts` |
| Drawer / sheet | `/dialog`, `dialog/{drawer,sheet}.ts` (no separate `/drawer` required) | `/components/drawer` | `dialog/dialog.spec.ts` (shared) |
| Tooltip / popover | `/popover`, `popover/{tooltip,popover}.ts` | `/components/tooltip-popover` | `popover/popover.spec.ts` |
| Toast | `/toast`, `toast/{toaster,toast-stack}.ts` | `/components/toast` | `toast/toast.spec.ts` |
| Accordion / collapsible | `/accordion` | `/components/accordion` | `accordion/accordion.spec.ts` |

Kit Controller evidence: `D/settings.ts` exposes theme, direction/locale, material, motion, detected tier and override; it remains docs-only. Its existence does not establish fidelity override safety on unsupported browser features.

## Phase 2 - showcase / marketing (21 families, source/docs present; release gates partial)

`docs/phase-2.md` still describes “13 components and six helpers”; that is historical/stale accounting, not the revised 21-row roadmap. Its prose also predates later families and package versions.

| Scheduled family | Entry | Docs route | Spec evidence |
| --- | --- | --- | --- |
| Carousel / slider | `/carousel` | `/components/carousel` | `carousel/{carousel,modes,phase2}.spec.ts` |
| Lightbox / gallery | `/lightbox` | `/components/lightbox` | `carousel/phase2.spec.ts` (gallery opening, navigation, dismissal) |
| Image compare | `/image-compare` | `/components/image-compare` | `image-compare/image-compare.spec.ts`, `carousel/phase2.spec.ts` |
| Marquee / logo wall | `/marquee` | `/components/marquee` | `carousel/phase2.spec.ts` (inert copy, pause, fallback) |
| Split-text reveal | `/split-text` | `/components/split-text` | `carousel/phase2.spec.ts` (changed text, accessible Persian source) |
| Refraction | `/refraction`, renderer | `/components/refraction` | `carousel/phase2.spec.ts` (mocked renderer, tier teardown); actual WebGL/context-loss browser gate open |
| 3D hotspot | `/hotspot` | `/components/hotspot` | `hotspot/hotspot.spec.ts`, `carousel/phase2.spec.ts` |
| Mesh / ambient background | `/mesh` | `/components/mesh` | `carousel/phase2.spec.ts` |
| Timeline | `/timeline` | `/components/timeline` | `timeline/timeline.spec.ts`, `carousel/phase2.spec.ts` |
| Stepper | `/stepper` | `/components/stepper` | `carousel/phase2.spec.ts` (gates, inert mounted panels, keyboard) |
| Badge / tag / chip | `/badge` | `/components/badge` | `badge/{chip,status}.spec.ts`, `carousel/phase2.spec.ts` |
| Avatar / group | `/avatar` | `/components/avatar` | `carousel/phase2.spec.ts` (Persian initials/image failure) |
| Skeleton | `/skeleton` | `/components/skeleton` | `skeleton/{skeleton,skeleton-region}.spec.ts` |
| Button / toggle group | `/button-group`, `/segmented` | `/components/button-group` | `carousel/phase2.spec.ts` (group render/axe), `segmented/segmented.spec.ts` |
| Link | `/link` | `/components/link` | `carousel/phase2.spec.ts` (shared render/axe) |
| Divider | `/divider` | `/components/divider` | `carousel/phase2.spec.ts` (shared render/axe) |
| Aspect ratio / media frame | `/aspect-ratio` | `/components/aspect-ratio` | `carousel/phase2.spec.ts` (ratio validation) |
| Chapter nav / progress | `/chapter-nav` | `/components/chapter-nav` | `chapter-nav/chapter-nav.spec.ts` |
| Scroll to top | `/scroll-to-top` | `/components/scroll-to-top` | `carousel/phase2.spec.ts` (scroll/focus restoration) |
| Border beam / glint | `/border-beam` | `/components/border-beam` → `D/pages/extensions.ts` | **Gap:** no targeted family spec found; filter-only `extensions.spec.ts` is not beam coverage |
| Number ticker / odometer | `/number-ticker` | `/components/number-ticker` → `D/pages/extensions.ts` | **Gap:** no targeted locale/negative/decimal/motion spec found |

Foundation extensions exist in `motion/layout.ts` (`HyFlip`, `HyStagger`) with `/motion-layout` docs. They are not extra families. No dedicated FLIP interruption/focus or stagger identity/destroy spec was located.

## Phase 3 - app shell / data (23 families, source/docs present; release gates partial)

No standalone `docs/phase-1.md` or `docs/phase-3.md` exists in the inspected docs inventory. Live pages and tests, not missing summary files, establish source presence.

| Scheduled family | Entry | Docs route | Spec evidence |
| --- | --- | --- | --- |
| Sidebar | `/sidebar` | `/components/sidebar` | `sidebar/{sidebar,sidebar-groups}.spec.ts` |
| Breadcrumb | `/breadcrumb` | `/components/breadcrumb` | `breadcrumb/breadcrumb.spec.ts`; `D/pages/demo-navigation.spec.ts` |
| Dropdown / menu button / split button | `/menu` | `/components/menu` | `menu/menu.spec.ts` |
| Command palette | `/command` | `/components/command` | `command/command.spec.ts` |
| Navigation / mega menu | `/navigation-menu` | `/components/navigation-menu` | `navigation-menu/navigation-menu.spec.ts` |
| Pagination | `/pagination` | `/components/pagination` | `pagination/pagination.spec.ts` |
| Table | `/table` | `/components/table` | `table/table.spec.ts`; cross-engine sticky background/alignment gate open |
| Stat / KPI | `/stat` | `/components/stat` | `stat/stat.spec.ts` |
| Chart wrapper | `/chart`, lazy `chart/engine.ts` | `/components/chart` | `chart/chart.spec.ts` (fake engine, accessible table, teardown); real-engine theme/tooltip/perf gate open |
| Sparkline | `/sparkline` (independent flat entry, not charts-parent import) | `/components/sparkline` | `sparkline/sparkline.spec.ts` |
| Progress bar / circle | `/progress`, `HyProgress` | `/components/progress` | `progress/progress.spec.ts` |
| Spinner / loader | `/progress`, `HySpinner` (separate family, shared entry) | `/components/progress` | `progress/progress.spec.ts` explicitly tests named spinner |
| Alert / inline message | `/alert` | `/components/alert` | `alert/alert.spec.ts` |
| Empty state | `/empty-state` | `/components/empty-state` | `empty-state/empty-state.spec.ts` |
| List / item | `/list` | `/components/list` | `list/list.spec.ts` |
| Bento / tile layout | `/bento` | `/components/bento` | `bento/bento.spec.ts` |
| Scroll area | `/scroll-area` | `/components/scroll-area` | `scroll-area/scroll-area.spec.ts` |
| Hover card | `/hover-card` | `/components/hover-card` | `hover-card/hover-card.spec.ts` |
| Description list | `/description-list` | `/components/description-list` | `description-list/description-list.spec.ts` |
| Kbd | `/kbd` | `/components/kbd` | `kbd/kbd.spec.ts` |
| Code block | `/code-block`, lazy highlighting adapter | `/components/code-block` | `code-block/code-block.spec.ts` |
| Copy button / snippet | `/copy` | `/components/copy` → `D/pages/extensions.ts` | **Gap:** no targeted `HyCopy` success/rejection spec found; code-block/docs copy specs exercise different components |
| Faceted filter bar | `/filter`, `filter/state.ts` | `/components/filter` → `D/pages/extensions.ts`; `/dashboard` | `filter/filter.spec.ts`, `D/pages/extensions.spec.ts`; **codec round-trip/rejection suite missing** |

`filter/state.ts` has a correlated clause generic, versioned encoder/decoder, scalar/array/preset/absolute forms, duplicate-ID rejection and explicit rolling start-inclusive/end-exclusive resolution. This is implementation evidence for Section 8.8, not proof of all serialization/host-schema cases. `progressive-blur/progressive-blur.ts` provides the separate Phase 3 chrome extension; it is not a scheduled family.

## Phase 4 - advanced forms (14 families, source/docs present; release gates partial)

`docs/phase-4.md` supplies detailed calendar/digit/forms contracts and a historical verification record. Its package/test/route totals must not be treated as current totals. The later `HyForms` adapter exists in addition to the documented `compatForm` path; examples and guidance should reflect the actual supported contract.

| Scheduled family | Entry | Docs route | Spec evidence |
| --- | --- | --- | --- |
| Jalali/Gregorian date picker / range | `/dates` | `/components/date-picker` | `dates/{date-adapter,calendar}.spec.ts`, `field/advanced-forms.spec.ts` |
| Time picker / slots | `/time-picker` | `/components/time-picker` | **Gap:** no dedicated time-picker spec found; do not substitute date-time-picker tests |
| Combobox / autocomplete | `/combobox` | `/components/combobox` | `combobox/combobox.spec.ts` |
| Multi-select | `/multi-select` | `/components/multi-select` | `combobox/combobox.spec.ts` (multi-selection and remote labels) |
| Search field | `/search-field` | `/components/search-field` | **Gap:** no targeted specialized control spec found |
| Number input | `/number-input` | `/components/number-input` | `field/{advanced-forms,forms-bridge}.spec.ts`, `core/locale-number.spec.ts` |
| Password | `/password` | `/components/password` | **Gap:** no targeted strength/show-hide/focus spec found |
| OTP / PIN | `/otp` | `/components/otp` | `field/advanced-forms.spec.ts` (leading zeros/composition/reset) |
| Masked / phone | `/masked-input`, `/phone-input` | `/components/masked-input` | `masked-input/masked-input.spec.ts`, `field/advanced-forms.spec.ts` |
| Slider / range | `/slider`, `/range-slider` | `/components/slider` | `field/advanced-forms.spec.ts` (ordered range handles); single-slider keyboard/cancellation coverage not established |
| Upload / dropzone | `/file-upload` | `/components/file-upload` | `file-upload/file-upload.spec.ts` |
| Rating | `/rating` | `/components/rating` | `rating/rating.spec.ts` |
| Selectable cards | `/selectable-card` | `/components/selectable-card` | **Gap:** no targeted radio/checkbox-card forms/keyboard spec found |
| Inline editable text | `/inline-edit` | `/components/inline-edit` | `inline-edit/inline-edit.spec.ts`, `field/advanced-forms.spec.ts` |

`/date-time-picker` is an additional control with its own timezone tests; it does not add a baseline roadmap family or close booking DST decisions. Host applications remain responsible for backend availability, time-instant resolution, payments/authentication and server validation.

## Phase 5 - mobile/app patterns (12 reusable families + 3 reclassified blocks)

Existing `docs/phase-5.md` uses the original 15-family terminology. It and `phase-5-api-review.md` are implementation/API context, not proof of real-device gesture or performance acceptance. Optional dock and status island are implemented, not deferred.

| Baseline scheduled row | Current classification / entry | Docs compatibility route | Spec evidence |
| --- | --- | --- | --- |
| Bottom sheet | Family `/bottom-sheet` | `/components/bottom-sheet` | `bottom-sheet/{bottom-sheet,api,content}.spec.ts` |
| Action sheet | Family `/action-sheet` | `/components/action-sheet` | `action-sheet/{action-sheet,api}.spec.ts` |
| Mobile tab bar | Family `/tab-bar` | `/components/tab-bar` | `tab-bar/tab-bar.spec.ts`; `D/pages/mobile-ui.spec.ts` |
| FAB / speed dial | Family `/fab` | `/components/fab` | `fab/fab.spec.ts`, `blocks/phase5-api.spec.ts` |
| Slide to confirm | Family `/slide-confirm` | `/components/slide-confirm` | `slide-confirm/slide-confirm.spec.ts`, `field/mobile-forms.spec.ts` |
| Numeric keypad | **Block**; retain `/keypad` | `/components/keypad`; block-first transfer composition under active remediation | `keypad/{keypad,api}.spec.ts`, `field/mobile-forms.spec.ts` |
| Pull to refresh | Family `/pull-refresh` | `/components/pull-refresh` | `pull-refresh/{pull-refresh,api}.spec.ts` |
| Swipe actions | Family `/swipe-actions` | `/components/swipe-actions` | `swipe-actions/{swipe-actions,api}.spec.ts` |
| Swipe deck | Family `/swipe-deck` | `/components/swipe-deck` | `swipe-deck/swipe-deck.spec.ts`, `blocks/phase5-api.spec.ts` |
| 3D card stack | Family `/card-stack` | `/components/card-stack` | `card-stack/card-stack.spec.ts`, `blocks/phase5-api.spec.ts` |
| Notification center / push card | **Block**; retain `/notification-center` | `/components/notification-center`; block-first composition under active remediation | `notification-center/{notification-center,api}.spec.ts`; new docs block tests need final integrated rerun |
| Chat bubbles / message list | **Block**; retain `/chat` | `/components/chat`; block-first composition under active remediation | `chat/{chat,composer}.spec.ts`; new docs composition tests need final integrated rerun |
| Meter / segmented progress | Family `/meter` (existing entry extended) | `/components/meter` | `meter/{meter,segmented}.spec.ts`, `blocks/phase5-api.spec.ts` |
| Glass dock | Family `/dock` | `/components/dock` | `dock/dock.spec.ts`; `D/pages/mobile-ui.spec.ts` |
| Dynamic status island | Family `/status-island` | `/components/status-island` | `status-island/status-island.spec.ts` |

Shared prerequisite exists: `/motion` exports `HyDragController`; `motion/drag.spec.ts` exercises gesture lifecycle. Its presence is not evidence of physical touch quality across platforms. Original separate mobile compositions exist in `blocks/mobile.ts`: `HyWalletBlock`, `HyTransferBlock`, `HyOrderTrackerBlock`, with `blocks/{mobile,phase5-api}.spec.ts` and `/mobile-patterns` documentation.

## Phase 6 - heavy data (11 families, source/docs present; release gates partial)

`docs/phase-6.md` explicitly calls this unreleased work, not a 1.0 stability declaration. `docs/phase-6-api.md` is generated API evidence; `phase-6-api-review.md` records comparisons. Package version remains 0.5.0.

| Scheduled family | Entry | Docs route | Spec evidence |
| --- | --- | --- | --- |
| Data grid | `/data-grid` | `/components/data-grid` | `data-grid/{data-grid,grid-model}.spec.ts` |
| Tree view | `/tree` | `/components/tree` | `tree/{tree,tree-model}.spec.ts` |
| Tree table | `/tree-table` | `/components/tree-table` | `tree-table/tree-table.spec.ts` |
| Virtual scroller | `/virtual-scroller` | `/components/virtual-scroller` | `virtual-scroller/virtual-scroller.spec.ts` |
| Kanban / sortable board | `/kanban` | `/components/kanban` | `kanban/kanban.spec.ts` |
| Calendar / scheduler | `/scheduler`, lazy FullCalendar/Luxon adapter | `/components/scheduler` | `scheduler/scheduler.spec.ts` |
| Splitter | `/splitter` | `/components/splitter` | `splitter/{splitter,sizes}.spec.ts` |
| Dashboard layout | `/dashboard-layout` | `/components/dashboard-layout` | `dashboard-layout/{dashboard-layout,layout-model}.spec.ts` |
| Context menu | `/context-menu` | `/components/context-menu` | `context-menu/context-menu.spec.ts` |
| Rich text | `/rich-text`, lazy TipTap adapter | `/components/rich-text` | `rich-text/rich-text.spec.ts` |
| Gauge | `/gauge` (implemented earlier, still counted here) | `/components/gauge` | `gauge/gauge.spec.ts` |

Fixed-size virtual rows, current-page grouping, host-owned persistence/fetching, optional FullCalendar v6 and TipTap peers, and premium scheduler licensing are documented limitations, not invisible application features. `/virtual-list` is an extra existing control, not a replacement for auditing `/virtual-scroller`.

## Section 7 - composed blocks (separate acceptance track)

| Phase | Scheduled composition | Source/docs evidence | Remaining gate |
| --- | --- | --- | --- |
| 1 | Basic hero, media, dual CTA | `blocks/blocks.ts: HyHeroBlock`; `hero-block.html` has `hyBlockMedia` / `hyBlockActions`; `/blocks` | Actual demo shows one supplied CTA; verify second CTA, keyboard order, RTL and responsive states, not just slot availability. |
| 2 | Enhanced hero, pricing, bento feature, social proof, product stage | `HyHeroBlock`, `HyPricingBlock`, `HyFeatureBlock`, `HyTestimonialsBlock`, `HyProductBlock` in `blocks/blocks.ts`; `/blocks` | Enhanced hero is a composable media slot, not separately verified optics composition. Test responsive/Persian/static/loading/error contracts and every displayed source. |
| 3 | Dashboard shell, KPI strip, filter toolbar, activity feed | `HyDashboardBlock`, `HyKpiStripBlock`, `HyFilterToolbarBlock`, `HyActivityBlock`; `/blocks`, `/dashboard` | Navigation tests exist; no dedicated comprehensive block contract/state/RTL suite found for these exports. |
| 4 | Auth split-screen, booking/checkout summary, account settings | `blocks/forms.ts`: `HyAuthBlock`, `HyBookingBlock`, `HySettingsBlock`; `/advanced-forms` | Verify exact layouts and realistic state transitions; a separate checkout composition is not established by the booking export. Application actions remain host-owned. |
| 5 | Wallet / quick actions, P2P transfer, live tracker sheet | `blocks/mobile.ts`; `/mobile-patterns`; `blocks/mobile.spec.ts` | Native alternative actions tested in part; real touch, responsive/RTL and backend-free realistic states still need acceptance records. |
| 5 revised | Keypad/transfer, notification, marketplace chat | Legacy public primitives and docs examples exist; block-first docs work is concurrent with this audit | Re-run docs tests/build/source checks after all related edits settle; retain compatibility exports and URLs, keep state/actions/data contracts explicit. |

## Checks actually executed for this audit

This checkout was being edited concurrently by other workers. The checks below describe the observed snapshot, not a frozen final release candidate.

| Command | Actual result | Interpretation |
| --- | --- | --- |
| `npm test` | Library: **118 spec files / 374 tests passed**. Docs build initially failed during concurrent notification-block edits: missing `notification-block.css` and missing store methods (`readAll`, `clear`, `setFilter`, `read`, `dismiss`). | The original combined invocation did **not** pass. A later independent docs rerun below passed; the initial errors were transient integration-state evidence, not established remaining defects. |
| `npx ng test docs --watch=false` (later rerun) | **10 spec files / 30 tests passed**. One Angular `NG8102` warning flagged unnecessary `?? message.delivery` in `D/pages/chat.html`; jsdom also emitted a canvas warning. | Docs tests passed at the later inspected snapshot. This does not replace a final all-gates run on an unchanged revision. |
| `npm run check:architecture` | **109 entry points, acyclic dependencies** | Source topology check passed, including core/motion dependency restrictions. |
| `npm run check:package` | **109 entry points; generated exports and isolated engine imports verified** | Passed against existing `dist/hyalo`; this audit did not produce a fresh library build or prove artifact/source freshness. |
| `npm run docs:check-api` | **348 API members; 70 exported type/utility/configuration declarations** | Phase-6 generated inventory matched source at check time. |
| `npm run docs:check-sources` | **110 standalone Angular examples verified** | Displayed/generated example compile check passed at that snapshot; concurrent later edits still require regeneration/check. |

The unit run emitted jsdom `HTMLCanvasElement.getContext()` not-implemented warnings. These did not fail the library suite and are not successful real canvas/WebGL rendering evidence. `src/testing/axe.ts` disables **color contrast and region** rules in fixture checks. Unit axe passes are not a rendered contrast audit or screen-reader certification.

No production build, fresh pack/install smoke test, browser matrix, physical-device test or performance trace was executed by this audit. Historical phase documents report earlier Chromium checks; those are explicitly bounded historical records, not fresh verification of this working tree.

## Explicit remaining gates and acceptance evidence to collect

| Gate | Current evidence / concern | Concrete closure criteria |
| --- | --- | --- |
| G1 - settled integrated build | Concurrent block edits made docs tests fail during the observed run; source checks independently passed earlier. | After workers finish, run `npm test`, `npm run lint`, `npm run build`, `npm run docs:check-api`, and `npm run docs:check-sources` on one unchanged revision; record exact output/totals and fix failures. |
| G2 - two-pass SSR/hydration | Fidelity starts deterministically at medium; Select starts native. `select/select.ts` sets local `ready` with `afterNextRender`, then uses a microtask to change structure. Focus/open checks exist, but a render callback/microtask does not independently establish deferred hydration readiness. | Add browser SSR→high/medium/low cases with delayed detection, persisted host settings, event replay, focused/open native Select and enabled deferred/incremental boundaries. Assert stable IDs/labels/value, one active control, no NG hydration errors or focus/input loss. Retain baseline if local hydration readiness cannot be established. Include charts/refraction/engine mounts. |
| G3 - dual Select equivalence | Plain labels, typed keys, object-key requirement, disabled groups and native lookup exist. Current dedicated spec covers a small string-value example and tier switch only. | Test native/custom numeric and object values, duplicate labels/distinct keys, invalid duplicate keys, grouping/disabled groups, async changes, required/reset/touched/disabled, focused/open mode deferral and submission/a11y-tree uniqueness. |
| G4 - filter serialization | Encoder/decoder and host type correlation exist; no `encodeFilters`/`decodeFilters` round-trip test references were found in specs. Grid-state codecs are a different contract. | Add scalar/array/preset/absolute round trips; invalid version/JSON/IDs/operators/fields/ranges/timezones; host codec narrowing; clear/empty semantics and explicit clock/timezone boundaries. Prove Phase-4 editors retain persisted schema and stable clause IDs. |
| G5 - optional engine/package isolation | Source and existing-built checks pass. Flat per-family topology is a deliberate compatibility mapping, not the exact placeholder aggregate layout. | Fresh build/pack; install core/button/select/sparkline in a clean consumer without optional peers; inspect production output. Compare Sparkline/full chart paths; exercise opted-in engines with documented peer versions. Do not infer runtime missing-engine safety solely from static graph checks. |
| G6 - dense surfaces / sticky headers | `glass.css` explicitly disables backdrop filtering for tinted/solid. `table/table.css` uses solid viewport and sticky cell backgrounds. Dense phase-6 CSS uses semantic surfaces. | Browser computed-style audit of the actual dashboard/repeated tiles and menus under every material override; confirm no accidental nested live blur. Verify continuous sticky-header coverage/alignment with horizontal scrolling/zoom in Chromium, Firefox and WebKit. Source CSS does not prove compositing behavior. |
| G7 - whole-scene performance | No checked-in trace/HAR artifact was found outside generated/dependency folders during inspection. Bundle-size CSV/JSON is transfer-size evidence, not frame-time evidence. | Capture scrolling, menu opening and chart update traces on representative mid-tier hardware, high-DPI/4K and mobile browsers. Record frame-time, paint/compositing, memory, active blur area/layers and scene configuration. Establish measured budget; do not invent a universal surface-count limit. |
| G8 - scene-light/controller lifecycle | `motion/scene.ts` has per-root observers, cached geometry, host writes, hidden/offscreen cleanup and a source-level 64-participant work cap. Indirect pointer tests do not validate the whole scene contract. | Dedicated nested-root/offscreen/removal/hidden/no-IO/reduced-motion/touch tests; verify all reads precede writes and no per-frame root CSS writes. Profile style recalculation; the cap is an implementation bound, not a proven performance budget. Add FLIP/stagger/progressive-blur focus/cancel/destroy tests. |
| G9 - proportional family tests | Targeted evidence gaps: border beam, localized ticker, HyCopy, time picker, search field, password, selectable cards; some slider/shared-fixture coverage is narrow. | Add tests matching each real interaction contract, including async failure, focus, keyboard, reset/disabled/touched, static fallbacks and cleanup. Avoid calling a catalog/import smoke check behavioral acceptance. |
| G10 - cross-engine / AT / physical touch | Historical docs bound browser checks to Chromium. jsdom checks omit contrast/regions and cannot establish native inertia, voice output or GPU behavior. | Record Firefox/WebKit/Chromium light/dark/forced-color, Persian/RTL, low-tier and reduced-motion results; keyboard + real screen-reader names/announcements/focus; iOS/Android physical gestures, cancellation, scroll preservation and non-drag alternatives. Mark unsupported/unrun combinations openly. |
| G11 - chart / optics / enterprise engine runtime | Chart spec uses FakeChart; refraction spec mocks renderer; engine wrappers have lifecycle tests and documented optional peers. | Real Chart.js line/bar/area/donut, resize gradients, token/theme/locale refresh, DOM tooltip positioning/scroll/teardown and accessible data exploration; WebGL fail/context-loss fallback; real scheduler/editor initialization/reconfigure/disposal and host-owned async workflows. |
| G12 - blocks and inventory consistency | Existing blocks/source are identifiable; three Phase-5 rows are being reclassified. Phase summary files have stale terminology/totals. | Validate final block-first routes/navigation/copyable source, realistic loading/error/success states, localized labels, keyboard/focus/RTL/responsiveness and lower-phase-only dependencies. Update publication inventory/counts together while retaining compatibility paths. Reconcile phase-2/4/5 historical prose with current status. |

**Release posture:** implementation inventory is broad and phase 5/6 are not blank future work. Acceptance remains **partial** until the settled integration checks, targeted missing regressions and explicitly unrun hydration/browser/device/performance gates above have evidence. Do not replace those gates with blanket “all phases complete” language.
