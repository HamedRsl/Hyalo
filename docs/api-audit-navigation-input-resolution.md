# Navigation and specialized-input audit resolution

This remediation ledger records the initial batch and the follow-up disposition of every navigation/input leftover. Existing dirty work was preserved; no dependencies or generated example sources were changed. Tests named below live under `projects/hyalo/<entry>/`. Dedicated OTP template SSR/hydration certification remains partial; browser-native painting and keyboard matrices are not certified by jsdom.

## Implemented and verified in this batch

| ID      | Resolution and behavioral evidence                                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API-176 | `navigation-menu.ts`: `openMenu(id)`, `close(restoreFocus?)`, `openChanged`, `selected`. `navigation-menu.audit.spec.ts` verifies disabled-branch rejection, idempotent opening, activation events, close notification and focus restoration. Existing recursive-menu tests still pass. Use the component reference as the controller; no singleton registry was added.        |
| API-184 | Existing `masked` native password input verified by `otp.audit.spec.ts`.                                                                                                                                                                                                                                                                                                       |
| API-185 | Existing `mode="alphanumeric"` and localized-digit normalization verified by `otp.audit.spec.ts`.                                                                                                                                                                                                                                                                              |
| API-187 | Fixed formatter execution: once per edit/paste, before built-in normalization, filtering and truncation. `otp.audit.spec.ts` reproduces a non-idempotent formatter losing the first code character before the fix and verifies completion afterward. Custom formatter edits place the caret at the end; default normalization preserves digit-relative caret placement.        |
| API-188 | Existing `pageSizes` and two-way `pageSize` verified through native select interaction in `pagination.audit.spec.ts`; preserves the previously visible record when changing size.                                                                                                                                                                                              |
| API-189 | Existing `showJump` verified through native change interaction and page-model update in `pagination.audit.spec.ts`.                                                                                                                                                                                                                                                            |
| API-192 | Existing `disabled` verified across buttons, select, jump input and public imperative methods in `pagination.audit.spec.ts`.                                                                                                                                                                                                                                                   |
| API-194 | Added `strengthPolicy: (value: string) => HyPasswordStrength`; `password.audit.spec.ts` verifies policy result rather than the default length heuristic is displayed.                                                                                                                                                                                                          |
| API-195 | Added complete `strengthMessages` map, `strengthPrefix`, `strengthDisclaimer`, `showLabel` and `hideLabel`. Audit test verifies localized strength and reveal action labels.                                                                                                                                                                                                   |
| API-196 | Added `strengthTemplate: TemplateRef<HyPasswordStrengthContext>`. Context contains `$implicit` localized estimate, `value`, `level`. Audit test renders the custom status content.                                                                                                                                                                                             |
| API-197 | Added `visibilityTemplate: TemplateRef<HyPasswordVisibilityContext>`; `$implicit` is revealed state. Audit test verifies both rendered states while native input type and aria-pressed change.                                                                                                                                                                                 |
| API-198 | Existing consumer-supplied `countries` catalog/country model verified through native country selection. Fixed fallback when catalog omits IR: first supported country now drives both selector and telephone policy without mutating the public country model. `phone-input.audit.spec.ts` verifies US-to-GB selection and clearing.                                           |
| API-199 | Existing country search verified through DOM input; retains effective selected country while filtering. Fixed retention of fallback country.                                                                                                                                                                                                                                   |
| API-200 | Existing country mask/dial code/normalizer policy verified with US and GB international values; readonly country selection is blocked. No global numbering database or inferred country is introduced.                                                                                                                                                                         |
| API-214 | Added `minDistance`/`maxDistance` in value units, applied to native handle bounds and input updates; range audit test verifies minimum distance clamping and maximum-distance native bound. Negative/nonfinite minimum becomes zero; oversized minimum caps at domain width; maximum below minimum is raised to minimum. Programmatic model writes are not silently rewritten. |
| API-216 | Added independent `startDisabled` and `endDisabled`, enforced on native elements and dispatched events. Remains two native handles, not an overlapping custom track. `range-slider.audit.spec.ts` verifies end disabling.                                                                                                                                                      |
| API-219 | Added `committed` tuple output on native change (keyboard or pointer commitment), distinct from input/model changes and blocked for disabled handles. Verified by range audit test.                                                                                                                                                                                            |

### Usage

```html
<hy-navigation-menu
  #navigation
  [items]="items"
  (openChanged)="recordVisibility($event)"
  (selected)="recordSelection($event)"
/>
<button type="button" (click)="navigation.openMenu('products')">Products</button>

<ng-template #strength let-message let-level="level">{{ level }}: {{ message }}</ng-template>
<ng-template #visibility let-revealed>{{ revealed ? 'Conceal' : 'Reveal' }}</ng-template>
<hy-password
  [strengthPolicy]="passwordPolicy"
  [strengthMessages]="passwordMessages"
  [strengthTemplate]="strength"
  [visibilityTemplate]="visibility"
  showLabel="Reveal secret"
  hideLabel="Conceal secret"
/>

<hy-range-slider
  [(value)]="priceRange"
  [minDistance]="10"
  [maxDistance]="100"
  [endDisabled]="lockMaximum"
  (committed)="saveRange($event)"
/>
```

The default password heuristic, text, model type, form integration and readonly reveal behavior are preserved. Strength estimates are not a security guarantee; templates must not accidentally disclose password text. Country catalogs remain application-owned. `countryChanged` emits on explicit user selection, not fallback resolution.

## Previously resolved baseline (not newly implemented here)

| ID      | Evidence/status                                                                                             |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| API-172 | Existing `navigation-menu.spec.ts`: arbitrary-depth disclosures and branch-by-branch Escape focus recovery. |
| API-173 | Existing menu tests: root/nested/section visibility, disabled state and commands.                           |
| API-175 | Existing menu tests: decorations and native target/rel safety.                                              |
| API-222 | Baseline inventory already records implementation and `rating.spec.ts` evidence for clear-on-reselect.      |
| API-246 | Baseline inventory already records `sidebar.spec.ts` responsive state and cleanup evidence.                 |

## Follow-up per-ID disposition (supersedes the initial open table)

All assigned leftovers were reviewed. Resolved native contracts below are backed by executable DOM/model evidence; partial or browser/SSR limitations are stated explicitly. They are not claims of real-browser visual or hydration certification.

| ID      | Follow-up resolution / explicit limitation                                                                                                                                     |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-171 | Resolved native contract: `mobileBreakpoint` CSS pixels observes container width, reacts to input changes, disconnects on destroy; `navbar.audit.spec.ts`. Undefined keeps 48rem container-query fallback. Browser layout matrix remains unclaimed. |
| API-174 | Resolved: optional routerLink/queryParams/fragment/state on item metadata; conditional RouterLink anchors preserve router-free native href consumers. `navigation-menu.router.spec.ts` verifies URL and stale-open cleanup; existing navigation suite passes. |
| API-177 | Resolved: precision/grouping and rounded-bound clamping exercised in `number-input.audit.spec.ts`; fixed rounding a valid draft beyond max. |
| API-178 | Resolved: custom parser/formatter, invalid draft/custom validity and reset rendering exercised in number audit tests. |
| API-179 | Resolved elsewhere: `HyField` + `hyPrefix`/`hySuffix`; `number-input.composition.spec.ts` verifies projection order and native label association. |
| API-180 | Resolved native CSS contract: stacked spinner computed grid/input placement verified in number composition test; hidden/horizontal CSS policies retained. Real-browser pixel matrix not claimed. |
| API-181 | Resolved: snap minimum-anchored stepping and events characterized; fixed duplicate stepped output at clamped unchanged bound. Number audit tests. |
| API-182 | Resolved: de-DE grouping parse/format roundtrip and EUR code accessible metadata verified in number audit tests. |
| API-186 | Partial: `otp.composition.spec.ts` verifies masked cell/index context, aria-hidden decorations and single labeled native input. Dedicated SSR/hydration template execution remains open. |
| API-190 | Resolved: report template first/last/total rendered by `pagination.composition.spec.ts`. |
| API-191 | Resolved: current-only layout with zero siblings and no boundary links exercised in pagination composition test; showLinks baseline retained. |
| API-193 | Resolved: start/end projection rendered in pagination composition test. |
| API-215 | Resolved native contract: optional monotone scale mapping to normalized positions; constraints remain value units. Range audit verifies logarithmic mapping and distance boundary. |
| API-217 | Resolved native contract: vertical writing-mode, direction reversal and aria-orientation on both handles; range audit. Browser keyboard/appearance matrix not claimed. |
| API-218 | Resolved native contract: labeled datalist marks and formatted native title/aria-valuetext on each handle; range audit. Native tooltip presentation is browser-owned, not a custom popup. |
| API-220 | Resolved existing behavior: `rating.spec.ts` clicks fractional choices and checks accessible label. |
| API-221 | Resolved: glyph text, localized tooltipFormatter and iconTemplate; `rating.audit.spec.ts` renders custom content/tooltips. |
| API-223 | Resolved: previewChanged emits hover value/null without model commitment; rating audit. |
| API-224 | Resolved native contract: vertical layout/aria-orientation and iconTemplate selected/preview context; rating audit. |
| API-225 | Resolved native boundary: host remains sole scroll viewport; scrollTo delegates to host and scrolled emits top/left. `scroll-area.audit.spec.ts`. Customize host styles/attributes/native scrollbar CSS; external viewport substitution is unsupported. |
| API-226 | Resolved: scroll-to-top audit spies actual scrollTo options with reduced motion taking precedence over smooth. |
| API-227 | Resolved: iconTemplate renders aria-hidden decoration while button keeps text accessible name; scroll-to-top audit. |
| API-228 | Resolved classification: different-role expansion, not an input defect. No command palette/global overlay added; existing search-field tests preserved and rerun. |
| API-229 | Resolved native contract: opt-in multiple with independent selectedValues array model and checkboxes; allowEmpty policy; existing single value/Signal Forms contract unchanged. Segmented audit verifies last-item prevention keeps native checked state. |
| API-230 | Resolved native layout contract: orientation/block/shape inputs and CSS; segmented audit renders vertical semantic state. Browser pixel verification remains unclaimed. |
| API-231 | Resolved: optionTemplate context includes option and selected; segmented audit renders and changes custom content. |
| API-245 | Resolved: sm/lg card padding/gaps implemented; computed-style regression verifies 12px/24px at default root size. RED saw 16px before missing size selectors were added; combined tests pass. |
| API-247 | Resolved elsewhere: sidebar inside HyDrawer start placement; `sidebar.composition.spec.ts` opens real overlay and checks sidebar landmark/native link. |
| API-248 | Resolved: application-scoped HySidebarController registry with get/expand/collapse/toggle; tag changes/destruction unregister via effect cleanup; duplicate live tags throw. Sidebar audit verifies control and destruction. |
| API-249 | Resolved: recursive data navigation disclosures with native buttons, visible/disabled policy and Escape close; sidebar audit opens two levels and closes child branch. |
| API-250 | Resolved: conditional RouterLink native anchors with query/fragment/state; sidebar audit verifies URL, baseline router-free native href tests pass. |
| API-251 | Resolved: opt-in docked sticky positioning with topOffset/bottomOffset CSS lengths; sidebar audit verifies host styles. |
| API-254 | Resolved native output contract: valueFormatter and showValue policy; slider audit verifies formatted output and aria-valuetext. No custom floating popup is claimed. |
| API-255 | Resolved: explicit value-unit ticks rendered as native datalist options, transformed through scale; slider audit. |
| API-256 | Resolved native marks: value/label entries rendered as datalist options; slider audit. Browser decides datalist label painting. |
| API-257 | Resolved native contract: writing-mode vertical and direction reversal with aria-orientation; slider audit. |
| API-258 | Resolved native contract: optional monotone scale toPosition/fromPosition mapping; logarithmic input/model conversion verified in slider audit; no gauge/knob redesign. |
| API-259 | Resolved: pointer capture start/end/cancel/lostcapture outputs, distinct native change committed output, blocked protection; slider audit verifies lifecycle and commitment. |

## Verification

New behaviors were first exercised as failing tests (missing typed API compile failures or concrete runtime regressions), then passed after implementation. Pagination coverage is explicitly existing-behavior characterization, not a reason to alter production code.

Targeted commands:

```sh
npx ng test hyalo --watch=false --include='**/navigation-menu*.spec.ts' --include='**/password*.spec.ts' --include='**/phone-input*.spec.ts' --include='**/otp*.spec.ts' --include='**/pagination*.spec.ts' --include='**/range-slider*.spec.ts' --include='**/sidebar*.spec.ts' --include='**/rating*.spec.ts' --include='**/search-field*.spec.ts' --include='**/selectable-card*.spec.ts' --include='**/selectable-checkbox*.spec.ts'
npx eslint projects/hyalo/{navigation-menu,phone-input,password,otp,pagination,range-slider}/*.{ts,html}
```

Initial targeted regression run: **15 test files, 67 tests passed**.

Follow-up final run (all owned entries, including navbar/number/slider/segmented/scroll): **32 test files, 95 tests passed**, scoped ESLint exit code **0**. New behavior was exercised RED→GREEN; composition and pre-existing number/rating contracts were passing characterization. Concrete RED regressions included duplicate bound-step events, precision crossing max, rejected final checkbox visually unchecking, stale navbar breakpoint changes, absent native nonlinear/marks/drag/template/controller APIs and missing selectable-card sizing selectors.

An intermediate full library run returned **674 passed, 1 failed** across 199 files: the unrelated `carousel/audit.spec.ts:85` fade completion assertion. Selectable-card passed in that full run; an earlier parent run observed its RED state before size CSS was implemented. No tests were weakened to hide that failure. The expected computed padding remains 12px/24px for sm/lg at the default root size.

### Follow-up usage and supported native boundaries

- Slider/range `scale` is a consumer-owned monotone increasing invertible pair `{ toPosition(value), fromPosition(position) }` mapping value units to 0..1. Without it native min/max/step behavior is unchanged. With it the native position uses `step="any"`; the adapter owns nonlinear quantization. `marks` are `{value,label}` entries rendered through native datalists. Slider also takes explicit `ticks: number[]`, `valueFormatter`, `showValue`, `orientation`, `reversed`, and emits `committed`, `dragStarted`, `dragEnded`. Range marks expose native title tooltips and aria-valuetext, not custom floating overlays.
- Segmented `multiple` opts into native checkboxes and `[(selectedValues)]`; default `[(value)]` remains single-valued and retains its existing Signal Forms contract. `allowEmpty` permits deselecting the last choice. `optionTemplate` receives `$implicit` option and `selected`; `orientation`, `block`, `shape` control layout. Vertical uses per-item selection backgrounds instead of the horizontal moving indicator. For multiple forms integration bind the array model explicitly; do not treat its single-value form contract as an array control.
- Navigation/sidebar router metadata creates RouterLink anchors only when configured; ordinary href users do not need router providers. Configure Angular Router in applications using data router metadata. `state` is passed to RouterLink navigation, not serialized into href.
- Sidebar `tag` registers with `HySidebarController`; inject it and call `expand(tag)`, `collapse(tag)`, `toggle(tag)` or `get(tag)`. Tags must be unique among live instances. `docked` enables sticky positioning with `topOffset`/`bottomOffset`. Drawer placement remains composition with `HyDrawer.open(SidebarContent, {side:'start', label:'Navigation'})`.
- Scroll-area is the viewport itself: bind host attributes/styles for native scrollbar customization, call its `scrollTo(ScrollToOptions)` and subscribe to `scrolled` coordinates. No hidden inner viewport or external-host replacement is introduced.
- Scroll-to-top `iconTemplate` is decorative; `label` remains the native button name. Reduced motion always overrides requested smooth behavior.


Full build, global lint, generated-source synchronization, package verification and browser verification are not claimed by this bounded worker. jsdom's axe canvas probe logs its existing missing-canvas notice; no dependency was installed to suppress it.
