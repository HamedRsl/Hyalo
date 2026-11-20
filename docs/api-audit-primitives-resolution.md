# Primitive and presentation API audit resolution

This is a partial batch, not completion of the inventory. Existing APIs were
inspected across every owned family. `Verified existing` means a behavioral test
was exercised, not that an input declaration alone was accepted as evidence.
Paths below are relative to `projects/hyalo/`. This document is also the usage
reference for the verified contracts in this batch.

## Per-capability evidence

| ID | Status | Implementation | Behavioral evidence / remaining work |
| --- | --- | --- | --- |
| API-016 | Verified existing | `alert/alert.ts` duration effect and destruction cleanup | `alert/audit.spec.ts`: duration replacement, timed dismissal, cancellation after destroy |
| API-017 | Verified existing composition | `alert/alert.html` named projected icon slots and message content | `alert/audit.spec.ts`: message, icon and close-icon rendered separately; these are projected rich content, not lazy TemplateRefs |
| API-018 | Fixed and verified (CSS contract) | `alert/alert.css` consumes banner | `alert/audit.spec.ts`: square borderless-inline strip; toggling off restores card radius. Browser layout not certified |
| API-019 | Verified existing | `avatar/avatar.ts` shape binding | `avatar/avatar.spec.ts`: square radius rendered |
| API-020 | Verified existing | `avatar/avatar.html` srcset/sizes | `avatar/avatar.spec.ts`: native image candidate attributes |
| API-021 | Verified existing | `avatar/avatar.html` loading/fetchPriority | `avatar/avatar.spec.ts`: lazy/low policy reaches image |
| API-022 | Verified existing | `avatar/avatar.ts` imageError/failure state | `avatar/avatar.spec.ts`: error output, initials fallback, new-source retry |
| API-023 | Verified existing | `avatar/avatar.html` icon fallback | `avatar/avatar.spec.ts`: icon replaces missing image and accessible name remains |
| API-024 | Out of scope: different role | Existing avatar retained | User identity composite is expansion, not remediation |
| API-025 | Fixed and verified | `badge/notification.ts` count/dot/max/showZero, finite normalization | `badge/notification.spec.ts`: hidden zero, overflow, zero, dot, nonfinite values |
| API-026 | Fixed and verified with explicit direction | `badge/notification.ts` logical corners and overlap translation | `badge/notification.spec.ts`: all LTR corners, RTL bottom-start, overlap off; automatic inherited-direction detection is not provided |
| API-027 | Partial, not signed off | `badge/notification.ts` HyBadgeHost establishes relative positioning | No host-relative browser geometry test in this batch |
| API-028 | Out of scope: different role | Badge/chip purpose retained | Editable token collection is expansion |
| API-029 | Verified existing | `badge/badge.html` hyBadgeRemoveIcon | `badge/audit.spec.ts`: custom icon inside native named button, removal output |
| API-030 | Fixed and partially verified | `bento/bento.ts` normalized partial order before moves | `bento/audit.spec.ts`: Alt-arrow moves unlisted tile, updates model and actual DOM reading order; disabled reorder blocked. Synthetic drag-event regression now verifies shared normalized ordering and disabled drop suppression; trusted browser drag/drop and hydration review remain open |
| API-031 | Verified existing | `breadcrumb/breadcrumb.ts` fromRouter | `breadcrumb/audit.spec.ts`: real nested navigation, href accumulation and stale crumb replacement |
| API-032 | Verified existing | `breadcrumb/breadcrumb.{ts,html}` templates | `breadcrumb/audit.spec.ts`: item/index/last context, separator only between items and hidden from AT |
| API-033 | Verified existing for absolute commands | `breadcrumb/breadcrumb.ts` router metadata | `breadcrumb/audit.spec.ts`: actual URL and Location state; Ctrl-click not intercepted. Relative commands and every modifier not separately certified |
| API-034 | Verified existing | `button/button.html` hyButtonLoading slot | `button/audit.spec.ts`: custom content replaces SVG, decorative wrapper retained |
| API-035 | Verified existing | `button/button.ts` disabledFocusable and capture guard | `button/audit.spec.ts`: actual focus retained, native disable removed, aria-disabled set, app click blocked |
| API-036 | Verified composition | `card/card.ts` body | `card/audit.spec.ts`: busy region switches skeleton to stat without integrated loading input |
| API-037 | Verified composition | `card/card.ts` footer | `card/audit.spec.ts`: consumer flex end-aligned footer and native action remain separate from body |
| API-043 | Fixed and verified | `chapter-nav/chapter-nav.ts` completion notification guard | `chapter-nav.spec.ts`: exact click/active/completion payloads, duplicate scrollend after a tracked final scroll emits once; instant/reduced-motion navigation preserved |
| API-044 | Verified DOM/CSS contract; browser review pending | `chapter-nav/chapter-nav.css` horizontal row | `chapter-nav.spec.ts`: nav/list flex and vertical thread hidden; viewport overflow geometry not certified |
| API-051 | Verified existing | `choice/checkbox-group.ts` HyCheckboxGroup | `choice/audit.spec.ts`: equivalent object identity, array add/remove, disabled option |
| API-052 | Verified existing | `choice/checkbox-group.ts` HyValueCheckbox | `choice/audit.spec.ts`: native click maps string off/on values |
| API-053 | Verified existing | `choice/checkbox.ts` clickAction | `choice/audit.spec.ts`: check-only retains indeterminate, noop blocks; `choice/choice.spec.ts`: default clears indeterminate |
| API-054 | Partial, not signed off | Choice labelPosition and CSS | Checkbox binding verified; all three visual placements need browser evidence |
| API-055 | Partial, not signed off | Checkbox/radio/switch disabledFocusable | Checkbox activation blocked with enabled native input in `choice/audit.spec.ts`; radio/switch keyboard coverage still required |
| API-056 | Verified existing for native click | `choice/switch.ts` controlled/pending/toggleRequested | `choice/audit.spec.ts`: request without model/native mutation, external update, pending suppression; pointer-drag race coverage remains open |
| API-057 | Verified existing | `choice/switch.html` hySwitchOn/hySwitchOff slots | `choice/audit.spec.ts`: only correct state content attached |
| API-058 | Verified existing | `choice/checkbox.ts` readonly click/change guards | `choice/audit.spec.ts`: native click leaves checked/model unchanged |
| API-091 | Verified existing at DOM/CSS contract layer | `description-list/description-list.{ts,css,html}` responsive columns/layout | `description-list/description-list.spec.ts`: compact/wide variables and stacked class; container-query browser check remains advisable |
| API-092 | Implemented and verified | `description-list/description-list.{ts,html,css}` term/detail templates and responsive bounded spans | `description-list/description-list.spec.ts`: real rich elements and separate wide/compact spans |
| API-093 | Implemented and verified | `description-list/description-list.{ts,html,css}` title/header extra slot | `description-list/description-list.spec.ts`: title and interactive extra rendered in header |
| API-111 | Verified existing inset binding | `divider/divider.ts` logical inline inset | `divider/audit.spec.ts`: rendered 12px inline-start margin retained in labeled layout; vertical browser geometry remains unverified |
| API-112 | Fixed and verified DOM/CSS contract | `divider/divider.css` flex rules before/after label | `divider/audit.spec.ts`: start/center/end ratios, real projected label and inset. Logical start/end ratios 1:9 / 9:1; center 1:1 |
| API-113 | Verified existing replacement composition | `empty-state/empty-state.html` hyEmptyIllustration | `empty-state/audit.spec.ts`: custom SVG suppresses fallback icon, remains outside actions |

## Supported usage

### Alerts and avatar

```html
<hy-alert [duration]="5000" dismissible>
  <span hyAlertIcon aria-hidden="true">!</span>
  Changes saved.
  <span hyAlertCloseIcon aria-hidden="true">Close</span>
</hy-alert>
<hy-avatar name="Ada Lovelace" src="/ada.png"
  srcset="/ada.png 1x, /ada@2x.png 2x" sizes="40px"
  loading="lazy" fetchPriority="low" shape="square" icon="user"
  (imageError)="recordImageFailure($event)" />
```

Alert duration defaults to zero (persistent); positive finite values start after
client render and restart on duration/visibility changes. Dismissal updates
`visible` and emits `dismissed`. Avatar defaults remain eager/circular; failed
images fall back to the icon or name initials. A new source is retried.

### Notification badges and buttons

```html
<span hyBadgeHost>
  Inbox
  <hy-notification-badge [count]="unread()" [max]="99"
    position="bottom-start" direction="rtl" label="Unread messages" />
</span>
<button hyButton [loading]="saving()" [disabled]="locked()" disabledFocusable>
  Save <span hyButtonLoading>Working</span>
</button>
```

Import `HyBadgeHost` and `HyNotificationBadge` explicitly from the badge entry
point. Count defaults to hidden zero; `showZero` exposes zero and `dot` replaces
text. Nonfinite counts normalize to zero; a nonfinite maximum uses 99. Set
`direction` explicitly for RTL overlap (default LTR). Position uses logical
start/end. `disabledFocusable` preserves focus, not activation permission.

### Bento ordering and choices

```html
<hy-bento [(order)]="tileOrder" [reorderable]="true">
  <section hyBentoTile tileId="summary">Summary</section>
  <section hyBentoTile tileId="activity">Activity</section>
</hy-bento>
<hy-checkbox-group label="Plans" [options]="plans" [(value)]="selectedPlans"
  [compareWith]="samePlan" />
<hy-value-checkbox [(value)]="consent" trueValue="yes" falseValue="no">Consent</hy-value-checkbox>
<hy-checkbox readonly [checked]="true">Recorded choice</hy-checkbox>
<hy-switch controlled [checked]="enabled()" [pending]="saving()"
  (toggleRequested)="requestEnabled($event)">
  Notifications <span hySwitchOn>Enabled</span><span hySwitchOff>Disabled</span>
</hy-switch>
```

Use unique stable tile IDs. Alt+arrow reorders enabled tiles and physically
updates DOM order. Missing IDs in a partial order are appended before a move;
unknown and duplicate order entries are normalized on movement. Choice groups
use Object.is by default; provide compareWith for replaced equivalent objects.
Controlled switches request a value but wait for the consumer to update checked.
Pending blocks interaction. Checkbox clickAction defaults to
`check-indeterminate`; `check` retains indeterminate and `noop` suppresses changes.

### Description lists

```html
<ng-template #detail let-item let-index="index">
  <a [href]="'/details/' + index">{{ item.detail }}</a>
</ng-template>
<hy-description-list title="Account" [items]="details"
  [columns]="{compact: 1, wide: 3}" layout="stacked" [detailTemplate]="detail">
  <button hyDescriptionExtra type="button">Edit</button>
</hy-description-list>
```

`HyDescription` retains required string term/detail and adds optional numeric
`span`. `termTemplate` and `detailTemplate` receive the item as `$implicit` and
its `index`. Without templates, existing text rendering remains. Span is
finite, positive and clamped separately to compact/wide column counts to avoid
implicit overflow columns. The compact breakpoint is component width 30rem.
Header extras are projected and do not replace item content.

## Executed verification

Baseline owned-family run: 11 files / 34 tests passed.
Earlier owned-family run: 17 files / 47 tests passed. Follow-up combined owned primitive/feedback run: 36 files / 94 tests passed (see feedback ledger).

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/{alert,avatar,badge,bento,breadcrumb,button,card,chapter-nav,choice,description-list,divider,empty-state}/**/*.spec.ts'
npx eslint 'projects/hyalo/{alert,avatar,badge,bento,breadcrumb,button,card,chapter-nav,choice,description-list,divider,empty-state}/**/*.{ts,html}'
```

Both final commands exited zero. The test environment prints the existing JSDOM
canvas getContext diagnostic during axe checks; no test failed. New description
API tests first failed compilation for missing template inputs; notification
corner/nonfinite tests and partial-order bento tests failed behaviorally before
the fixes. Passing characterization tests did not trigger unnecessary production
changes. No dependencies, global source sync, commits or unrelated files were
changed. Full shared-tree acceptance/build/browser checks belong to integration.
