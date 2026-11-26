# API audit continuation

The [audit ledger](api-audit-status.json) records the disposition of each original capability.
The browser checks exercise the public API examples in Chromium, Firefox and WebKit. They use
the development server so Playwright can call the public virtual-list controller through
Angular's debug API.

## Peer comparison

| Reference | Comparable contracts | Hyalo surface |
| --- | --- | --- |
| Angular Material and CDK | Dialog geometry, close predicates, focus capture and restoration, virtual viewport ranges and form-field subscript sizing | Dialog has shared dismissal policy and runtime geometry. Virtual list exposes rendered item intervals and logical-axis scrolling. Field reserves a minimum feedback line and lets longer messages wrap. [Dialog source](https://github.com/angular/components/blob/main/src/material/dialog/dialog-config.ts), [CDK scrolling](https://material.angular.dev/cdk/scrolling/overview), [form field source](https://github.com/angular/components/blob/main/src/material/form-field/form-field.ts) |
| PrimeNG | Dialog drag and maximize, lazy virtual scrolling, select empty state, upload progress and templates | Hyalo dialog uses an opt-in pointer and keyboard handle. The virtual list delegates range requests to a caller, and the upload control exposes typed templates and abortable transport. [Dialog](https://primeng.dev/dialog), [VirtualScroller](https://primeng.dev/virtualscroller), [Select](https://primeng.dev/select), [FileUpload](https://primeng.dev/fileupload) |
| Nebular | Dialog context, backdrop and Escape policies, template-based content, and selection components | Hyalo supports component injection and bindings, template context, independent dismissal and shared dialog/drawer management. Select retains a native single-value fallback. [Dialog source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/dialog), [Select source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/select) |
| NG-ZORRO | Modal lifecycle, async confirmation, overlays, upload events and custom transport | Hyalo supplies open and accepted-close events, a shared close guard, localized upload controls and a caller-owned uploader. [Modal](https://ng.ant.design/components/modal/en), [Upload](https://ng.ant.design/components/upload/en), [Select](https://ng.ant.design/components/select/en) |
| Ant Design | Modal confirmation, popup trigger modes and mounting, table sort direction and empty content | Hyalo maps these to its dialog reference, CDK-backed popover policies and native table templates. [Modal](https://ant.design/components/modal/), [Popover](https://ant.design/components/popover/), [Table](https://ant.design/components/table/) |

## Tabs, searchable choices and image previews

| Reference | Comparable API | Hyalo decision |
| --- | --- | --- |
| Angular Material | Tab group exposes dynamic height, animation duration and header pagination. Its autocomplete renders caller-provided options. | Tabs opt into panel-height motion with a numeric millisecond duration. Combobox also accepts a cancellable loader. [Tabs source](https://github.com/angular/components/blob/main/src/material/tabs/tab-group.ts), [Autocomplete source](https://github.com/angular/components/blob/main/src/material/autocomplete/autocomplete.ts) |
| PrimeNG | AutoComplete accepts suggestions and a completion callback. Gallery offers content and thumbnail templates. | Combobox manages loading, retry and clearing. Gallery templates receive strongly typed image, index and transform context. [AutoComplete](https://primeng.dev/autocomplete), [Gallery](https://primeng.dev/gallery) |
| Nebular | Autocomplete supplies an input trigger and selectable suggestions. | Use Combobox for searchable single values and Multi-select for searchable arrays. [Autocomplete source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/autocomplete), [Select source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/select) |
| NG-ZORRO | Select supports server search, loading, clearing and multiple selection. Its image service supports grouped previews. | Hyalo exposes each search and selection contract through its corresponding field. The lightbox service also opens a group at a supplied index. [Select](https://ng.ant.design/components/select/en), [Image](https://ng.ant.design/components/image/en) |
| Ant Design | Select offers multiple selection, search and a configurable clear control. Image preview supports custom content with transform data. | Hyalo implements named clear controls, abortable queries and typed preview templates. Thumbnail columns respond to container space using the configured minimum width and gap. [Select](https://ant.design/components/select/), [Image](https://ant.design/components/image/) |

## Docked drawers, menu backdrops and remote icons

| Reference | Comparable API | Hyalo decision |
| --- | --- | --- |
| Angular Material | Sidenav offers side, push and over. Menu exposes backdrop controls. The icon registry supports named SVG URLs. | The docked layout scopes its backdrop to the content region. Projected menus expose panel and backdrop classes. Remote icons pass through a flat SVG geometry parser. [Sidenav source](https://github.com/angular/components/blob/main/src/material/sidenav/sidenav.md), [Menu source](https://github.com/angular/components/blob/main/src/material/menu/menu.md), [Icon registry](https://github.com/angular/components/blob/main/src/material/icon/icon-registry.ts) |
| PrimeNG | Drawer supplies an overlay and Menu supports popup mode. | Use the drawer service for viewport overlays or the projected layout for content-local panels. [Drawer](https://primeng.dev/drawer), [Menu](https://primeng.dev/menu) |
| Nebular | Sidebar and context menu expose separate application layout and contextual action surfaces. | The drawer layout and contextual menu are separate public components. [Sidebar source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/sidebar), [Context menu source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/context-menu) |
| NG-ZORRO | Dropdown supports custom overlay classes and placement. | Configure the projected panel class on the menu and the connected positions on its trigger. [Dropdown](https://ng.ant.design/components/dropdown/en) |
| Ant Design | Dropdown exposes semantic styling and click, hover and context-menu triggers. | Projected action menus offer an optional backdrop and contextual menus handle pointer-positioned opening. [Dropdown API source](https://github.com/ant-design/ant-design/blob/master/components/dropdown/index.en-US.md) |

## Live image previews, responsive notifications and timelines

| Reference | Comparable API | Hyalo decision |
| --- | --- | --- |
| Angular Material | Snack bars configure horizontal and vertical placement separately. | Toast channels configure a logical position and width, with optional CSS-width breakpoints. [Snack-bar configuration](https://github.com/angular/components/blob/main/src/material/snack-bar/snack-bar-config.ts) |
| PrimeNG | Image preview exposes zoom and rotation. Toast supports position and responsive styles. Timeline offers horizontal and vertical layouts with alternating content. | Image controls also expose bounded pointer and keyboard pan. Toast relocates the existing stack at a breakpoint. Horizontal timeline events share a rail. [Image](https://primeng.dev/image), [Toast](https://primeng.dev/toast), [Timeline](https://primeng.dev/timeline) |
| Nebular | Toastr configures the notification position. | Hyalo adds logical start and end positions and allows a channel to change placement as the viewport changes. [Toastr configuration](https://github.com/akveo/nebular/blob/master/src/framework/theme/components/toastr/toastr-config.ts) |
| NG-ZORRO | Image previews accept zoom, rotation and both flip axes. Notification exposes placement. | Hyalo exposes transforms through the preview reference and template context, with keyboard panning and an explicit reset. [Image](https://ng.ant.design/components/image/en), [Notification](https://ng.ant.design/components/notification/en) |
| Ant Design | Preview exposes drag, transforms and controlled visibility. Timeline supports horizontal and alternating layouts. | Hyalo keeps an open dialog mounted while its image list and options update. Timeline lets an individual event override its side. [Image](https://ant.design/components/image/), [Timeline](https://ant.design/components/timeline/) |

For step transitions, Angular Material exposes an animation duration and completion event. Hyalo
keeps existing instantaneous selection as the default, then waits for the incoming panel's
animation when a duration is supplied. An interrupted panel emits no stale completion.
[Angular Material stepper source](https://github.com/angular/components/blob/main/src/material/stepper/stepper.ts)

## Scroll hosts, grouped headers and calendar cells

Angular CDK Scrolling supports a separate scrolling element. Hyalo delegates native scroll
commands and events to a caller-owned element while retaining its existing host as the default.
PrimeNG ScrollPanel provides a dedicated component-managed scroll surface.
[CDK scrolling](https://material.angular.dev/cdk/scrolling/overview), [PrimeNG ScrollPanel](https://primeng.dev/scrollpanel)

PrimeNG, NG-ZORRO and Ant Design support spanning table headers. Hyalo accepts positional spans
and explicitly associates data and footer cells with the applicable group and leaf headers.
[PrimeNG Table](https://primeng.dev/table), [NG-ZORRO Table](https://ng.ant.design/components/table/en),
[Ant Design Table](https://ant.design/components/table/)

Material's comparison dates and NG-ZORRO's custom date rendering map to Hyalo's separate
comparison range and date template context. The browser example also exercises adjacent-month
policies and the responsive two-month layout.
[Angular Material Datepicker](https://github.com/angular/components/blob/main/src/material/datepicker/datepicker.md),
[NG-ZORRO DatePicker](https://ng.ant.design/components/date-picker/en)

NG-ZORRO and Ant Design offer directory mode in Upload. Hyalo preserves relative paths from
both native directory input and folder drops that expose file-system entries. PrimeNG allows OTP
input templates. Hyalo's template renders decorative cells around one native input, with
server-rendered markup checked before hydration.
[NG-ZORRO Upload](https://ng.ant.design/components/upload/en), [Ant Design Upload](https://ant.design/components/upload/), [PrimeNG InputOtp](https://primeng.dev/inputotp)

### Frozen rows, virtual groups and overlay parents

Material supports sticky header rows and start/end columns. PrimeNG exposes frozen rows and
columns, NG-ZORRO measures fixed column offsets, and Ant Design combines fixed columns and
headers with virtual row scrolling. Hyalo measures rendered widths, keeps the
first configured rows mounted, and uses estimated offsets for unmounted group and detail rows.
[Material Table](https://v18.material.angular.dev/components/table), [PrimeNG Table](https://primeng.dev/table),
[NG-ZORRO Table](https://ng.ant.design/components/table/en), [Ant Design Table](https://ant.design/components/table/)

PrimeNG Select exposes `appendTo` and Ant Design exposes `getPopupContainer`. Hyalo Hotspot,
Hover Card and Select accept an optional DOM parent through the CDK's native top-layer
placement. Browsers without that feature use the configured CDK overlay container.
[PrimeNG Select](https://primeng.dev/select), [Ant Design Select](https://ant.design/components/select/)

### Menu focus

Angular Material exposes menu-trigger focus restoration as a boolean. PrimeNG returns keyboard
focus to the popup trigger on Escape. Hyalo keeps that default and accepts an explicit return
element for cases such as a menu action that changes the surrounding layout.
[Material Menu API](https://v14.material.angular.dev/docs-content/api-docs/material-menu),
[PrimeNG Menu](https://primeng.dev/menu)

### Touch date picker and mask editing

Material offers an opt-in touch date dialog. Hyalo's `touchUi` keeps the dialog centered when
the viewport is narrow, including RTL layouts, and the popup controller restores focus
after detachment. PrimeNG InputMask exposes a raw value event and an incomplete-value clear
policy. Hyalo lets callers choose the published format, incomplete-value policy and commit timing.
[Material Datepicker](https://github.com/angular/components/blob/main/src/material/datepicker/datepicker.md),
[PrimeNG InputMask](https://primeng.dev/inputmask)

## Building blocks and performance

The browser matrix checks that the desktop dashboard scrolls its content while the sidebar stays
in place. It measures the scheduler's custom chevron inside the native select and uses a real
right-click to reply in the marketplace chat. Unit tests also exercise forwarding and the local
draft lifecycle.

See the [production dashboard measurement](verification.md#version-060-dashboard-measurement)
for the desktop and throttled mobile profiles.

## Usage and verification

- Dialog, Drawer, Text field, Select, Table, Virtual list, File upload, Divider, Skeleton, and
  Tooltip and popover contain runnable examples in the docs.
- The examples document defaults and controlled behavior. For example, a virtual grid loads
  contiguous whole-row item intervals, and a custom select draft remains editable after rejection.
- The large virtual-grid fixture measures the mounted item bound during viewport changes. This
  verifies bounded DOM work for the tested grid. Results depend on the range source and row template.
- Automated browser input covers pointer, keyboard, runtime geometry and reduced motion. Physical
  mobile pickers, assistive technology and hardware-specific rendering remain separate checks.

Run the audit from the repository root with the docs development server running.

```powershell
$env:HYALO_BROWSER_TOOLS = 'C:/tmp/hyalo-browser-check'
$env:HYALO_BASE_URL = 'http://127.0.0.1:4200'
npm run check:api-browser
npm run check:api-audit
```
