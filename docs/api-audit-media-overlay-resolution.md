# Media, overlay and interaction audit resolution

This ledger covers only carousel, hover-card, icon, image-compare, inline-edit,
interaction, lightbox, masked-input and menu. **Open means not implemented**;
partial entries are not completion claims. Existing selectors and model types
are retained. Existing dirty implementations were preserved; carousel page-step behavior is unchanged.

## Per-ID evidence

| ID | Status | Evidence / remaining work |
| --- | --- | --- |
| API-038 | Resolved | Opt-in `autoplay`, finite `autoplayInterval`, public `play/pause/playing`, focus stop and optional hover stop. Explicit restart avoids automatic focus resumption; edge and destroy cleanup tested in `carousel/audit.spec.ts`. |
| API-039 | Resolved (existing) | `carousel/carousel.spec.ts`, `modes.spec.ts`, `phase2.spec.ts`: visible counts, page-step edge handling and keyboard navigation; existing carousel docs. |
| API-040 | Resolved | Typed container-width `responsive` breakpoints select visible count via ResizeObserver; resize test verifies rendered CSS, page clamping and fallback. SSR uses the base count until first browser render. |
| API-041 | Partial | `orientation` controls vertical CSS snap/viewport height, scroll geometry, mouse drag, native scroll indexing and Up/Down keys. DOM geometry/key test passes; real-browser vertical touch/inertia acceptance remains. |
| API-042 | Partial | `transitionCompleted` reports imperative slide navigation on aligned scrollend, active-slide opacity transitionend for fade, and nonanimated changes after render. Tests reject premature/duplicate completion. External index writes, free native scrolling and canceled/missing fade-end handling remain incomplete; do not claim universal completion. |
| API-128 | Resolved | `hover-card.ts` exposes show/hide timing; `hover-card.spec.ts` verifies delayed open/close and destruction, plus existing keyboard/Escape focus recovery. |
| API-129 | Partial | Panel class is applied and tested. Custom container remains open; CDK default overlay container is retained. |
| API-130 | Open | Icon registry supports locally registered names (including namespaced strings), not remote SVG loading. Remote SVG security and cancellation require separate implementation. |
| API-131 | Resolved (different role) | Font icons are not an SVG registry defect. Project native font-icon content alongside controls; no remote/font dependency introduced. |
| API-132 | Resolved (existing) | `image-compare.spec.ts` verifies horizontal/vertical clipping, handle position and native aria-orientation. |
| API-133 | Resolved | Native range bounds/step are bound; invalid configuration receives finite bounds/positive-step fallbacks. Hover values clamp and snap. `image-compare.spec.ts`. |
| API-134 | Resolved | Disabled range and handler guard; opt-in pointer hover reveal supports both axes, ignores touch and disabled movement. `image-compare.spec.ts`. |
| API-135 | Resolved | `committed` emits on native range `change` (pointer release or keyboard commit), not on each input. Test verifies payload. |
| API-136 | Resolved (existing) | Two-way `editing` model; existing test proves external cancellation discards draft and next open reads current value. |
| API-137 | Resolved | Typed `displayTemplate` and `editorTemplate` render real views; editor context exposes draft, update/save/cancel, disabled/readonly/error. Existing validation and save/cancel buttons retained. `inline-edit/templates.spec.ts` verifies rendered custom draft commit. |
| API-138 | Resolved | `opened` and `closed` fire after rendered editor insertion/removal, not synchronously from model mutation. `inline-edit.spec.ts` checks DOM inside subscribers and absence before rendering. No animation completion is claimed. |
| API-139 | Resolved | Ripple radius, duration and centered origin affect actual span geometry/animation. `interaction/ripple.audit.spec.ts`. |
| API-140 | Resolved | `launch(x?, y?)` returns wave or null; `clear()` removes owned waves. Reduced-motion and destroy guards retained; pointer behavior uses the same controller. `ripple.audit.spec.ts` and existing interaction tests. |
| API-141 | Partial | Rendered zoom/rotation, bounded zoom and navigation reset are tested. Pan/flip contracts are not implemented. |
| API-142 | Open | Viewer content templates remain absent. |
| API-143 | Open | Thumbnail breakpoints/layout configuration remains absent. |
| API-144 | Resolved | `HyLightbox.open` returns the original compatible dialog ref augmented as `HyLightboxRef` with live index/playing, navigation/transforms and play/pause. Gallery exposes play/pause; viewer has localized slideshow button. Actual dialog integration verifies navigation, controller and post-destroy stop; view timer tests retained. |
| API-145 | Partial | Gallery `index`/`visible` models synchronize external writes, viewer navigation and dialog closure (`gallery.spec.ts`). `indexChange` callback retained. Reopen-during-close and changing images/options while already open need explicit generation/reconfiguration policy and tests. |
| API-148 | Partial | `tokens` accepts per-character regex rules (including alphabetic/alphanumeric); localized digit normalization and stateful-regex isolation retained. `policies.spec.ts` verifies custom tokens in rendered input. Custom-token separator deletion currently uses native edit/reparse rather than digit-only adjacent-slot deletion; dedicated custom deletion/IME coverage remains. |
| API-149 | Resolved | Opt-in `valueFormat="masked"` stores presentation while default remains raw; completion payload remains raw. Custom mixed tokens and masked separator deletion tested. |
| API-150 | Partial | `incompletePolicy="clear"` clears incomplete edits on blur; default retain preserves compatibility. Test verifies actual input/model clearing. Partial edits still publish during typing; deferred model/buffer commit policy is not implemented. |
| API-151 | Resolved | `completed` emits raw string only on incomplete-to-complete user input. Test covers duplicate input suppression and deleting/recompleting. |
| API-152 | Open | Context/right-click/long-press trigger remains absent. |
| API-153 | Resolved | Exported `hyMenuTrigger` controller delegates open/close/toggle/isOpen to CDK, guards post-destroy calls; test verifies actual overlay lifecycle. |
| API-154 | Partial | Existing Escape focus restoration verified in `menu.spec.ts`; configurable restore policy remains absent. |
| API-155 | Open | Configurable panel/backdrop policy remains absent. |
| API-156 | Open | Recursive data menu model remains absent; existing projected CDK menus preserved. |

## Usage of added contracts

```html
<hy-image-compare before="before.jpg" after="after.jpg"
  beforeAlt="Before" afterAlt="After" [min]="10" [max]="90" [step]="5"
  [hoverReveal]="true" [disabled]="busy" (committed)="persist($event)" />

<button [hyHoverCard]="details" hoverCardLabel="Details"
  [hoverCardShowDelay]="250" [hoverCardHideDelay]="150"
  hoverCardPanelClass="details-panel">Details</button>
<ng-template #details>Details content</ng-template>

<button [hyMenuTriggerFor]="actions" #menu="hyMenuTrigger">Actions</button>
<button (click)="menu.open()">Open actions</button>

<hy-inline-edit [(editing)]="editing" [(value)]="title"
  (opened)="editorReady()" (closed)="editorClosed()" />
<hy-masked-input mask="##-##" (completed)="useRawCode($event)" />
```

Hover-card show delay defaults to 250 ms. Hide delay defaults to `null`, preserving
existing pointer-corridor grace; a finite explicit number chooses a fixed delay.
Focus within the trigger/card prevents delayed dismissal. Panel class is captured
when the overlay is first created. Container configuration is not exposed.

Ripple inputs are `rippleRadius` (pixels, null = auto), `rippleDuration`
(milliseconds, null = stylesheet timing), and `rippleCentered` (false by default).
Use a `viewChild(HyRipple)` to call `launch`/`clear`; coordinates are host-relative.
The returned element permits consumer-owned early removal; `clear` never removes
projected content. Reduced motion suppresses both pointer and imperative waves.

Lightbox options add localized zoom/rotation labels, `slideshowInterval` (default
3000 ms, minimum 100 ms), and `indexChange`. The view exposes bounded `goTo`,
`zoomIn`, `zoomOut`, `rotate`, `play`, and `pause`. These controls are also exposed
on the returned `HyLightboxRef`, which remains a `HyDialogRef` (same identity,
close lifecycle and focus management). Gallery supports `[(index)]` and
`[(visible)]`; live option/image replacement is not yet supported.

Carousel `responsive` accepts `{ minWidth, visibleSlides }[]` in container pixels.
`orientation="vertical"` uses `--hy-carousel-height` (default 20rem). Autoplay
defaults off; focus and (by default) pointer entry stop it until explicit `play()`.
`transitionCompleted` has the limited guarantees recorded under API-042.

Inline templates receive `$implicit` as the display value or editor draft; editor
context also provides `update(value)`, `save()`, `cancel()`, `disabled`, `readonly`
and `error`. Custom controls must use the context update function, not mutate the
committed value directly.

Mask token example: `[tokens]="{ A: letterRule }" mask="AA-##"`, where
`letterRule = /[a-z]/i`. `#` remains numeric. `valueFormat` is raw by default or
masked on opt-in; `incompletePolicy` is retain by default or clear-on-blur.

## Verification

New behavior was tested RED (missing public contracts, or hover movement retaining
50 instead of 25), then GREEN with real Angular components and DOM assertions.
No dependencies, commits, motion-internal changes or global source sync were made.
Scoped combined run: **18 test files / 69 tests passed** across all nine owned
entrypoints. Scoped ESLint over those entrypoints passed with no diagnostics.
The jsdom/axe run printed four existing canvas `getContext` not-implemented
notices; they did not fail tests. Ledger validation parsed all **32** owned IDs:
18 resolved, 8 partial, 6 open, with no missing or extra IDs.
Repository-wide build, package checks and browser verification belong to the
parent integration pass.
