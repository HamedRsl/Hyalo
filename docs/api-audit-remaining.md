# Remaining API audit scope

Current conservative consolidation of the **329 original inventory records**. Original inventory/design and scoped resolution snapshots are preserved. JSON is the current machine-readable disposition, not a declaration that every component or release gate passed.

## Status totals

- resolved: **218**
- partial: **72**
- open: **30**
- different-role: **9**

A `resolved` row records a test-backed scoped public contract, not cross-browser/device/AT or full-repository certification. `partial` retains substantive API or explicitly unaccepted environmental work. `open` can mean unverified existing code. Different-role ideas remain separate expansion decisions. This reconciliation executes ledger/prose gates, not component tests; execution counts below are attributed to scoped final reports.

## Reconciliation evidence

- `api-audit-dates-final.md`: 5 files / 40 tests and scoped ESLint passed. Dedicated capability tests supersede old missing-header/template/preset claims and range/keyboard gaps. Physical modal touch, responsive/pixel, focus timing and hit-testing gaps stay explicit.
- `api-audit-select-policy-final.md`: 13 files / 40 tests and scoped ESLint passed. API-070 accepts typed defaults for supported select/tooltip families only, not every component. Rich tooltip mapping uses a named popover dialog, not equivalent text-tooltip semantics. Trigger/auto-close, origin/container, loader, nullable and native-controller limitations remain explicit.
- `api-audit-chart-mapping-final.md`: 8 files / 13 tests and 23 real-engine Edge assertions reported. API-045 through API-050 now have dedicated options/plugins/controllers/selection/export/race evidence. API-147 paging and API-260 chart detail are consumer compositions; API-127 retains missing per-instance container binding. API-146 stays different-role. The report's earlier concurrent full-suite failures are historical, not current release-gate acceptance.
- Current media specs supersede three review findings: API-042 repeated-target completion, API-145 model/viewer-close reopen race, and API-148 raw/masked custom-token separator deletion. Broader lifecycle, live reconfiguration and IME acceptance remain partial.
- Preserve feedback API-209/211/263/315 current regressions, cross-family API-253/262 evidence in `card/audit.spec.ts`, later API-304 guard races and API-186 SSR/hydration gap. Application-scoped IDs are separate from API-070 policy defaults.

## Separate integration/native/device gates

Library/docs tests, build, lint, source/package checks and representative browser acceptance remain final-tree integration gates. Native chooser/keyboard/painting, trusted drag/touch, hydration/event replay and assistive-technology/device acceptance are not inferred from jsdom. See `roadmap-device-acceptance.md`, `roadmap-browser-verification.md`, `roadmap-select-verification.md` and `roadmap-id-verification.md`. These do not add or remove inventory IDs.

## Open and partial work by family

### field

- **API-003 (partial)**: Complete and independently verify Floating label. Existing API characterized; visual acceptance open; `field/presentation.audit.spec.ts` renders floating-label mode; CSS implements focused/filled floating. Pixel/focus CSS behavior is not proven by jsdom.
- **API-006 (partial)**: Complete and independently verify Fixed/dynamic subscript space. Existing API characterized; visual acceptance open; Same test renders fixed subscript mode; actual reserved geometry requires browser measurement.
- **API-008 (partial)**: Complete and independently verify Textarea autosizing. Supported composition verified; `field/autosize.audit.spec.ts`: `HyInput` plus CDK `TextFieldModule`/`cdkTextareaAutosize`, native naming, resize controller and multiline edits. Actual resized pixel heights remain browser-only.

### accordion

- **API-015 (partial)**: Complete and independently verify Animation-complete events. Verified event boundary; Same test rejects descendant/wrong-property transition events and accepts body grid transition completion. Reduced-motion no-transition completion semantics remain open.

### alert

- **API-018 (partial)**: Complete and independently verify Banner preset. Fixed and verified (CSS contract); `alert/alert.css` consumes banner; `alert/audit.spec.ts`: square borderless-inline strip; toggling off restores card radius. Browser layout not certified

### badge

- **API-027 (partial)**: Complete and independently verify Host-relative badge position. Partial, not signed off; `badge/notification.ts` HyBadgeHost establishes relative positioning; No host-relative browser geometry test in this batch

### bento

- **API-030 (partial)**: Complete and independently verify Tile reordering model. Fixed and partially verified; `bento/bento.ts` normalized partial order before moves; `bento/audit.spec.ts`: Alt-arrow moves unlisted tile, updates model and actual DOM reading order; disabled reorder blocked. Synthetic drag-event regression now verifies shared normalized ordering and disabled drop suppression; trusted browser drag/drop and hydration review remain open

### breadcrumb

- **API-033 (partial)**: Complete and independently verify Router command metadata. Verified existing for absolute commands; `breadcrumb/breadcrumb.ts` router metadata; `breadcrumb/audit.spec.ts`: actual URL and Location state; Ctrl-click not intercepted. Relative commands and every modifier not separately certified

### carousel

- **API-041 (partial)**: Complete and independently verify Vertical carousel. Partial; `orientation` controls vertical CSS snap/viewport height, scroll geometry, mouse drag, native scroll indexing and Up/Down keys. DOM geometry/key test passes; real-browser vertical touch/inertia acceptance remains.
- **API-042 (partial)**: External index writes, free native scrolling and canceled/missing fade-end completion remain incomplete; universal completion is not claimed.

### chapter-nav

- **API-044 (partial)**: Complete and independently verify Horizontal chapter-nav mode. Verified DOM/CSS contract; browser review pending; `chapter-nav/chapter-nav.css` horizontal row; `chapter-nav.spec.ts`: nav/list flex and vertical thread hidden; viewport overflow geometry not certified

### choice

- **API-054 (partial)**: Complete and independently verify Choice label placement. Partial, not signed off; Choice labelPosition and CSS; Checkbox binding verified; all three visual placements need browser evidence
- **API-055 (partial)**: Complete and independently verify Focusable disabled choices. Partial, not signed off; Checkbox/radio/switch disabledFocusable; Checkbox activation blocked with enabled native input in `choice/audit.spec.ts`; radio/switch keyboard coverage still required
- **API-056 (partial)**: Complete and independently verify Pending/controlled switch behavior. Verified existing for native click; `choice/switch.ts` controlled/pending/toggleRequested; `choice/audit.spec.ts`: request without model/native mutation, external update, pending suppression; pointer-drag race coverage remains open

### combobox

- **API-062 (partial)**: Complete and independently verify Query threshold/debounce policy. Partial; Same test verifies query threshold. Debounce cancellation is implemented with effect cleanup but no timer-boundary regression added here.
- **API-066 (partial)**: Complete and independently verify Suggestion overlay customization. Partial; `combobox/templates.audit.spec.ts` verifies actual overlay panel class/width and templates; positions/scroll strategy/offset collision geometry not browser-verified here.

### dates

- **API-076 (partial)**: Verify date-cell template pixel presentation in a real browser; the semantic native button, template context and selection are tested.
- **API-078 (partial)**: Physical iOS/Android modal touch acceptance, virtual keyboard, viewport and touch ergonomics remain open; jsdom proves overlay/backdrop/dialog semantics only.
- **API-079 (partial)**: Multiple-month rendering and cross-month range are tested; responsive layout and physical-device geometry remain unaccepted.
- **API-085 (partial)**: Controller attachment/detachment, visibility and disabled veto are tested; native browser focus/animation timing and AT announcement acceptance remain open.
- **API-086 (partial)**: Comparison range model isolation and template context are tested; pixel/contrast acceptance remains open.
- **API-087 (partial)**: Outside-day visibility, disabled/tab-stop state and click policy are tested in jsdom; physical browser visibility/hit-testing remains open.

### description-list

- **API-091 (partial)**: Complete and independently verify Responsive columns/layout. Verified existing at DOM/CSS contract layer; `description-list/description-list.{ts,css,html}` responsive columns/layout; `description-list/description-list.spec.ts`: compact/wide variables and stacked class; container-query browser check remains advisable

### dialog

- **API-094 (open)**: Implement or independently disprove and behaviorally verify Arbitrary geometry; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-095 (open)**: Implement or independently disprove and behaviorally verify Runtime geometry updates; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-096 (open)**: Implement or independently disprove and behaviorally verify Open/before-close lifecycle; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-097 (open)**: Implement or independently disprove and behaviorally verify Interaction event streams; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-098 (partial)**: Complete and independently verify Universal close predicate/veto. Partial; event routes verified and scroll defect fixed; `dialog.spec.ts` drives programmatic/action/Escape/backdrop/navigation/window-scroll vetoes and asserts the same connected surface and focus. Window scroll previously threw when passed to Node.contains; `open-surface.ts` now uses the container document's Node constructor before containment checks. Actual drawer gesture-veto animation/focus integration remains open.
- **API-099 (open)**: Implement or independently disprove and behaviorally verify Independent dismissal/backdrop policies; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-100 (open)**: Implement or independently disprove and behaviorally verify Creation context configuration; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-101 (open)**: Implement or independently disprove and behaviorally verify Panel/backdrop classes; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-102 (open)**: Implement or independently disprove and behaviorally verify Service-wide registry/controller; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-103 (open)**: Implement or independently disprove and behaviorally verify Focus-restore/trap timing policies; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-104 (open)**: Implement or independently disprove and behaviorally verify Scroll/navigation closing policy; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-105 (open)**: Implement or independently disprove and behaviorally verify Accessible reference configuration; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-106 (open)**: Implement or independently disprove and behaviorally verify Async confirm actions; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-107 (open)**: Implement or independently disprove and behaviorally verify Draggable/maximizable windows; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-108 (open)**: Implement or independently disprove and behaviorally verify Docked push/side/over drawer; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.
- **API-109 (open)**: Implement or independently disprove and behaviorally verify Top drawer placement; add public usage documentation. No per-ID acceptance evidence was established in this consolidation.

### divider

- **API-111 (open)**: Complete and independently verify Inset divider. Verified existing inset binding; `divider/divider.ts` logical inline inset; `divider/audit.spec.ts`: rendered 12px inline-start margin retained in labeled layout; vertical browser geometry remains unverified

### file-upload

- **API-114 (partial)**: Complete and independently verify Transport workflow. Existing transport core verified; full workflow UI not signed off; `file-upload.spec.ts` exercises consumer uploader progress, AbortSignal cancellation, stale progress/result suppression after retry, failure and retry success, destruction abort, and unchanged File[] value. No endpoint or transport dependency added. Built-in progress/status/retry UI is not established by these tests.
- **API-118 (partial)**: Complete and independently verify Transport lifecycle outputs. Partial; Prior transport regression verifies state, not every lifecycle output payload/order.
- **API-119 (partial)**: Complete and independently verify Directory selection. Partial; `webkitdirectory` attribute verified; actual directory chooser/drop traversal requires browser/device testing.
- **API-122 (open)**: Complete and independently verify File-list/toolbar templates. Open; File/toolbar/empty TemplateRef inputs exist, but their consumer template contexts are not exercised in this continuation.
- **API-123 (partial)**: Complete and independently verify Localized UI/error options. Partial; Custom remove text/accessible name verified. Full translated status/error catalogue not signed off.

### hotspot

- **API-127 (partial)**: Scoped OverlayContainer dependency-injection mapping is tested, but an independently bindable per-hotspot container input is still absent. Custom-container positioning, fullscreen and browser geometry remain unverified.

### hover-card

- **API-129 (partial)**: Complete and independently verify Panel class/container options. Partial; Panel class is applied and tested. Custom container remains open; CDK default overlay container is retained.

### icon

- **API-130 (open)**: Implement optional remote/namespaced SVG loading with security, cancellation, failure and cache tests; local registry namespaces alone are insufficient.

### lightbox

- **API-141 (partial)**: Complete and independently verify Viewer image transforms. Partial; Rendered zoom/rotation, bounded zoom and navigation reset are tested. Pan/flip contracts are not implemented.
- **API-142 (open)**: Implement and test typed lightbox content templates and their context/accessibility.
- **API-143 (open)**: Implement and test thumbnail layout/breakpoint configuration, including actual responsive geometry.
- **API-145 (partial)**: Changing images/options while open still requires explicit generation/reconfiguration policy and tests; reopen-during-close is now covered.

### masked-input

- **API-148 (partial)**: Broader custom deletion directions, selection and physical IME/browser acceptance remain open; the tested custom-token separator deletion no longer falls through native reparse.
- **API-150 (partial)**: Complete and independently verify Incomplete-input buffer policy. Partial; `incompletePolicy="clear"` clears incomplete edits on blur; default retain preserves compatibility. Test verifies actual input/model clearing. Partial edits still publish during typing; deferred model/buffer commit policy is not implemented.

### menu

- **API-152 (open)**: Implement and test contextmenu/right-click/long-press triggering, cancellation and keyboard/accessibility behavior.
- **API-154 (partial)**: Complete and independently verify Focus restore policy. Partial; Existing Escape focus restoration verified in `menu.spec.ts`; configurable restore policy remains absent.
- **API-155 (open)**: Implement and test configurable menu panel/backdrop policies.
- **API-156 (open)**: Implement and test recursive data-driven menu rendering while preserving projected CDK menus.

### multi-select

- **API-161 (partial)**: Complete and independently verify Paged option loading. Shared implementation, partial evidence; Multi-select inherits the same page loader tested via combobox. No separate multi-select paged integration test; do not count inherited declaration alone as full acceptance.
- **API-169 (partial)**: Complete and independently verify Overlay policies. Partial; Template integration verifies panel width/class; full overlay positions/scroll/outside geometry remain integration gates.
- **API-170 (partial)**: Complete and independently verify Fine-grained lifecycle events. Partial; Policy test verifies selection/removal/visibility emissions; fine-grained timing/attachment-completion is not certified.

### otp

- **API-186 (partial)**: Complete and independently verify Custom cell template. Partial: `otp.composition.spec.ts` verifies masked cell/index context, aria-hidden decorations and single labeled native input. Dedicated SSR/hydration template execution remains open.

### popover

- **API-202 (partial)**: Opt-in synthetic touch opens the overlay. Custom pointer-position/alternate tooltip origin is absent; physical touch-device acceptance remains open.
- **API-205 (partial)**: Click/manual trigger and boolean auto-close policies are tested. Independent per-dismissal-reason switches and hover triggers are not provided.
- **API-206 (partial)**: Existing placement and resize scheduling remain supported; custom container/anchor/offset APIs and browser collision geometry remain open.
- **API-208 (open)**: Public post-transition lifecycle outputs remain absent. Reduced-motion and canceled-transition semantics require design and executable acceptance.

### scroll-area

- **API-225 (partial)**: Complete and independently verify Delegate/customize scroll host. Resolved native boundary: host remains sole scroll viewport; scrollTo delegates to host and scrolled emits top/left. `scroll-area.audit.spec.ts`. Customize host styles/attributes/native scrollbar CSS; external viewport substitution is unsupported.

### select

- **API-235 (partial)**: Loading/page offsets, explicit dismissal/destroy abort, stale exclusion, retry/append and hasMore stop are tested. Empty-state rendering and dedicated server-loader acceptance remain open.
- **API-236 (partial)**: Trimmed creation, empty input and draft reset are tested. Rejection callback/exception handling remains unimplemented; native chooser cannot enter arbitrary text.
- **API-237 (open)**: Runtime integration mapping for search/loading/clear to combobox remains unverified; single-choice select has not gained these features.
- **API-238 (open)**: Runtime integration mapping to multi-select remains unverified; select remains single-value.
- **API-239 (partial)**: Custom open/close/toggle state, output, focus, disabled and destruction are tested. Native OS-popup controller acceptance remains open.
- **API-240 (partial)**: Actual panel width/class are tested. Trigger resize-driven minimum width and browser geometry remain unverified; native chooser geometry is OS-owned.
- **API-241 (partial)**: Positions/scrollStrategy/offset inputs exist, but custom container and real collision/scroll geometry acceptance remain open.
- **API-242 (partial)**: Injected delay/wrap defaults and explicit precedence are tested. Actual timed typeahead, wrap edges and virtual/nonvirtual policy parity remain open.
- **API-243 (partial)**: Nullable disabled-state parity is fixed for native/custom options. Placeholder/reset and undefined-option identity remain unaccepted; null object options require explicit stable key.

### skeleton

- **API-252 (open)**: Add a dedicated structured multi-placeholder skeleton composition/mapping test and usage reference; existing single-placeholder region test is insufficient.

### stepper

- **API-267 (partial)**: Complete and independently verify Transition timing/completion. Partial; Same test verifies selection/after-render completion; no configurable transition duration or animation-boundary completion implemented.

### table

- **API-276 (partial)**: Complete and independently verify Integrated virtual rows. Bounded fixed-row virtualization verified; Large-data test renders two data rows in a 96px viewport, exposes absolute row index and still renders the matching row after filtering. Variable-height expanded/grouped/frozen row interaction and real browser geometry remain open.
- **API-278 (partial)**: Complete and independently verify Frozen columns/rows. Partial; Frozen start-column offsets respond to widths/reorder. Sticky geometry/frozen rows under real scrolling remain open.
- **API-281 (partial)**: Complete and independently verify Column reordering. Partial; `moveColumn` updates actual rendered header order, frozen offsets and exported order; draggable attribute verified. Physical drag/drop remains open.
- **API-282 (partial)**: Complete and independently verify Row drag reordering. Partial; `moveRow` emits reordered copy, leaves frozen caller array intact, ignores unknown keys/noninteger indices. Physical drag/drop remains open.
- **API-284 (partial)**: Complete and independently verify Grouped rows. Regression fixed; partial; Group template previously received all page rows (`A:3/B:3`); now receives actual group members (`A:2/B:1`). Group membership is indexed once per view, not scanned per rendered cell. Noncontiguous input is not automatically regrouped; consumers supply group-contiguous order. Virtual group headers remain open.
- **API-285 (partial)**: Complete and independently verify Row/cell editing lifecycle. Existing lifecycle verified, partial; Start/commit/cancel payloads and reset verified; commit does not mutate consumer data. Consumer editTemplate rendering/validation remains open.
- **API-291 (partial)**: Complete and independently verify Footer/summary/multilevel headers. Existing contract partly verified; Multilevel header colspan and footer row context rendered; complex rowspan accessibility and per-column `footer` option remain unverified.
- **API-292 (open)**: Complete and independently verify Loading/empty content templates. Open; Template inputs exist, but custom loading/empty templates are not exercised. Prior default empty/loading DOM regression remains green.
- **API-293 (partial)**: Complete and independently verify Granular action events. Partial; Existing actions emitted from API methods; exhaustive action payload/order matrix remains open.
- **API-294 (partial)**: Complete and independently verify Sort direction cycle policy. Partial; Existing default sort cycle covered; custom cycle policy remains unverified.

### tabs

- **API-300 (partial)**: Complete and independently verify Overflow paginator controls. Verified DOM/controller contract; Same test clicks paginator and verifies viewport scroll distance. Actual overflow geometry remains browser gate.
- **API-301 (open)**: Implement and test animated active-panel height, including interruption, reduced motion and cleanup.
- **API-302 (partial)**: Complete and independently verify Vertical/bottom tab placement. Verified DOM contract; Same test vertical ARIA orientation and bottom-placement state; pixel layout remains browser gate.
- **API-305 (partial)**: Complete and independently verify Focus/animation outputs. Partial; Presentation test verifies focus output; completion is after-render rather than actual CSS transition-end.
- **API-307 (partial)**: Complete and independently verify Tab badge/responsive labels. Partial; Presentation test verifies badge/custom header. Responsive compact-label pixel behavior not browser-verified.

### time-picker

- **API-311 (partial)**: Complete and independently verify Confirmation/footer content. Partial; Time suite verifies confirmation transaction/reset/empty values; footerTemplate exists but custom footer integration not separately tested here.

### timeline

- **API-313 (partial)**: Complete and independently verify Timeline alignment/orientation. Partial                                             ; Existing horizontal/start/end preserved; alternate layout added. Template regression checks config. Horizontal alternate/end-side combinations still need browser review.

### toast

- **API-317 (partial)**: Complete and independently verify Position/responsive configuration. Implemented for four corners and fluid width        ; Channel position top/bottom + logical start/end; width capped by viewport. Regression checks top placement and normalized CSS width. No arbitrary breakpoint configuration or center positions.

### virtual-list

- **API-324 (partial)**: Complete and independently verify Horizontal/two-axis virtualization. Outside owned virtual-scroller scope                ; Inventory refers to virtual-list. Existing `HyVirtualScroller` stays bounded; no claim for two-axis virtualization.
- **API-325 (partial)**: Complete and independently verify Viewport-range loading. Outside owned virtual-scroller scope                ; virtual-list loading ownership remains separate.
- **API-326 (partial)**: renderedRangeChange exists; verify output payloads and update/deduplication across scroll, resize and data replacement.
- **API-327 (open)**: Add a runtime loading-placeholder composition test and usage mapping for virtual-list; a generic row template alone does not prove this outcome.
- **API-328 (partial)**: Pixel/index alignment methods exist; test start/center/end/nearest and pixel scroll behavior on all supported axes with real geometry.
- **API-329 (partial)**: appendOnly and virtual=false exist; test retained windows, bypass mode, mode changes, focus and explicit bounded-DOM tradeoffs.

## Different-role IDs (not completion of missing APIs)

API-024, API-028, API-126, API-131, API-146, API-158, API-228, API-295, API-312.

## Gate

Run `node tools/check-api-audit.mjs` and `node tools/check-prose.mjs`. The ledger gate checks exact original ID/family coverage, schema, evidence paths, substantive test-file evidence for resolved rows and remaining work for unresolved rows. Neither gate executes component tests or certifies physical/browser acceptance.
