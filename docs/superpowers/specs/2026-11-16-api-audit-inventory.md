# API audit capability inventory

Source: api-audit.rar, snapshot 2026-11-16T12:58:24.150Z.

Status: remediation in progress. Original classifications below are preserved as
the audit baseline; the evidence ledger records verified follow-up work. Entries
without a ledger resolution remain unverified, not implicitly complete.

## Verified remediation evidence

| ID | Resolution | Implementation and behavioral evidence | Documentation |
| --- | --- | --- | --- |
| API-039 | Implemented | `projects/hyalo/carousel/carousel.ts`, `carousel.html`, `slide.css`; `carousel.spec.ts` verifies visible count, page steps, final viewport boundaries, keyboard wrapping, invalid configuration and model clamping. | `projects/docs/src/app/pages/carousel.ts` |
| API-073 | Partial; full capability not signed off | `projects/hyalo/dates/calendar.ts`; `calendar.spec.ts` regression clears stale previews over disabled endpoints while retaining the pending range start. | Full public documentation review remains pending. |
| API-172 | Implemented | `projects/hyalo/navigation-menu/navigation-menu.{ts,html,css}`; `navigation-menu.spec.ts` exercises nested branches and Escape focus recovery, with legacy behavior and accessibility checks. | `projects/hyalo/navigation-menu/README.md` |
| API-173 | Implemented | Navigation menu command, disabled and visibility metadata; behavioral coverage in `navigation-menu.spec.ts`. | `projects/hyalo/navigation-menu/README.md` |
| API-175 | Implemented | Navigation menu decorations and native link targets with safe blank-target relationships; coverage in `navigation-menu.spec.ts`. | `projects/hyalo/navigation-menu/README.md` |
| API-222 | Implemented | `projects/hyalo/rating/rating.{ts,html}`; `rating.spec.ts` verifies opt-in clearing and readonly protection. | `projects/docs/src/app/pages/rating.html` |
| API-246 | Implemented | `projects/hyalo/sidebar/sidebar.{ts,html,css}`; `sidebar.spec.ts` verifies responsive states, toggle overrides and media-query cleanup. | `projects/hyalo/sidebar/README.md` |
| API-274 / API-276 | Partial; full capabilities not signed off | `projects/hyalo/table/table.ts`; `table.spec.ts` regression clamps a deeply scrolled virtual window after filtering rather than falsely displaying no results. | Full public documentation review remains pending. |

Additional verification cleanup removed dates/table lint violations without
claiming completion of their surrounding capabilities. The full audit remains
open; in particular these fixes do not certify other pre-existing remediation.

## Original audit inventory

| ID      | Entry            | Audit classification | Priority | Capability                                    |
| ------- | ---------------- | -------------------- | -------- | --------------------------------------------- |
| API-001 | field            | missing              | P1       | Classic forms bridge for custom controls      |
| API-002 | field            | missing              | P1       | Reusable error-state policy                   |
| API-003 | field            | missing              | P2       | Floating label                                |
| API-004 | field            | missing              | P2       | Rich hint/error/validation templates          |
| API-005 | field            | missing              | P2       | Pending/success/warning field status          |
| API-006 | field            | component-only       | P3       | Fixed/dynamic subscript space                 |
| API-007 | field            | component-only       | P3       | Hide required marker                          |
| API-008 | field            | composable           | P2       | Textarea autosizing                           |
| API-009 | accordion        | missing              | P1       | Lazy content creation                         |
| API-010 | accordion        | missing              | P2       | Destroy closed bodies                         |
| API-011 | accordion        | missing              | P2       | Separate header action slot                   |
| API-012 | accordion        | missing              | P2       | Custom/hide expand icon                       |
| API-013 | accordion        | missing              | P2       | Toggle trigger policy                         |
| API-014 | accordion        | missing              | P2       | Group expand/collapse controller              |
| API-015 | accordion        | missing              | P2       | Animation-complete events                     |
| API-016 | alert            | component-only       | P2       | Timed inline-message dismissal                |
| API-017 | alert            | missing              | P2       | Custom message/close icon templates           |
| API-018 | alert            | component-only       | P3       | Banner preset                                 |
| API-019 | avatar           | component-only       | P3       | Avatar shape                                  |
| API-020 | avatar           | missing              | P2       | Responsive image candidates                   |
| API-021 | avatar           | missing              | P2       | Image loading/fetch policy                    |
| API-022 | avatar           | missing              | P2       | Image failure output                          |
| API-023 | avatar           | missing              | P2       | Icon avatar                                   |
| API-024 | avatar           | different-role       | P2       | User-identity composite                       |
| API-025 | badge            | missing              | P2       | Notification count/dot/overflow rules         |
| API-026 | badge            | missing              | P2       | Notification badge positioning                |
| API-027 | badge            | missing              | P2       | Host-relative badge position                  |
| API-028 | badge            | different-role       | P2       | Editable token collection                     |
| API-029 | badge            | component-only       | P3       | Custom removal icon                           |
| API-030 | bento            | missing              | P2       | Tile reordering model                         |
| API-031 | breadcrumb       | missing              | P2       | Router-derived breadcrumbs                    |
| API-032 | breadcrumb       | missing              | P2       | Custom breadcrumb rendering                   |
| API-033 | breadcrumb       | component-only       | P2       | Router command metadata                       |
| API-034 | button           | missing              | P2       | Custom loading indicator                      |
| API-035 | button           | missing              | P2       | Focusable disabled interaction                |
| API-036 | card             | composable           | P2       | Integrated loading placeholder                |
| API-037 | card             | composable           | P3       | Action-row alignment                          |
| API-038 | carousel         | missing              | P2       | Autoplay and pause policy                     |
| API-039 | carousel         | missing              | P2       | Visible slide count and page step             |
| API-040 | carousel         | missing              | P2       | Responsive slide-count options                |
| API-041 | carousel         | missing              | P2       | Vertical carousel                             |
| API-042 | carousel         | missing              | P2       | Transition lifecycle events                   |
| API-043 | chapter-nav      | missing              | P2       | Click/scroll outputs                          |
| API-044 | chapter-nav      | component-only       | P2       | Horizontal chapter-nav mode                   |
| API-045 | chart            | missing              | P1       | Chart.js options passthrough                  |
| API-046 | chart            | missing              | P2       | Chart plugin injection                        |
| API-047 | chart            | missing              | P2       | Additional chart types                        |
| API-048 | chart            | missing              | P2       | Data-point selection output                   |
| API-049 | chart            | missing              | P2       | Chart image export/canvas access              |
| API-050 | chart            | missing              | P2       | Explicit refresh/reinit                       |
| API-051 | choice           | missing              | P2       | Array-valued checkbox group                   |
| API-052 | choice           | missing              | P2       | Nonboolean on/off values                      |
| API-053 | choice           | missing              | P2       | Checkbox click/indeterminate policy           |
| API-054 | choice           | missing              | P2       | Choice label placement                        |
| API-055 | choice           | missing              | P2       | Focusable disabled choices                    |
| API-056 | choice           | missing              | P2       | Pending/controlled switch behavior            |
| API-057 | choice           | missing              | P2       | Custom switch state content                   |
| API-058 | choice           | missing              | P2       | Readonly checkbox                             |
| API-059 | combobox         | missing              | P1       | Value identity/display callbacks              |
| API-060 | combobox         | missing              | P1       | Virtualized suggestions                       |
| API-061 | combobox         | missing              | P2       | Paged viewport loading                        |
| API-062 | combobox         | missing              | P2       | Query threshold/debounce policy               |
| API-063 | combobox         | missing              | P2       | Allow arbitrary free text                     |
| API-064 | combobox         | missing              | P2       | Suggestion/selection rendering callbacks      |
| API-065 | combobox         | missing              | P2       | Exact-match and hint policy                   |
| API-066 | combobox         | missing              | P2       | Suggestion overlay customization              |
| API-067 | combobox         | missing              | P2       | Visibility events                             |
| API-068 | command          | component-only       | P2       | Nested command pages                          |
| API-069 | command          | elsewhere            | P2       | Remote command search                         |
| API-070 | core             | review               | P3       | Per-component default policies                |
| API-071 | dates            | missing              | P1       | Year/multi-year selection views               |
| API-072 | dates            | missing              | P2       | Custom calendar header                        |
| API-073 | dates            | missing              | P1       | Live shared-calendar range selection          |
| API-074 | dates            | missing              | P2       | Custom range-selection strategy               |
| API-075 | dates            | missing              | P2       | Date-cell classes                             |
| API-076 | dates            | missing              | P2       | Date-cell content templates                   |
| API-077 | dates            | elsewhere            | P2       | Date-only Apply/Cancel transaction            |
| API-078 | dates            | missing              | P2       | Modal touch picker                            |
| API-079 | dates            | missing              | P2       | Multiple visible months                       |
| API-080 | dates            | elsewhere            | P2       | Preset range shortcuts                        |
| API-081 | dates            | missing              | P2       | Multiple unrelated selected dates             |
| API-082 | dates            | missing              | P2       | Week numbering and first-day override         |
| API-083 | dates            | missing              | P2       | Range duration constraints                    |
| API-084 | dates            | missing              | P2       | Calendar chrome translations                  |
| API-085 | dates            | missing              | P2       | Popup controller/lifecycle                    |
| API-086 | dates            | missing              | P2       | Comparison-range overlay                      |
| API-087 | dates            | missing              | P2       | Adjacent-month day policy                     |
| API-088 | date-time-picker | missing              | P2       | Time precision/presentation options           |
| API-089 | date-time-picker | missing              | P2       | Disabled-time predicates                      |
| API-090 | date-time-picker | component-only       | P2       | Combined picker panel modes                   |
| API-091 | description-list | missing              | P2       | Responsive columns/layout                     |
| API-092 | description-list | missing              | P2       | Rich item templates/spans                     |
| API-093 | description-list | component-only       | P2       | Header title/extra slot                       |
| API-094 | dialog           | missing              | P2       | Arbitrary geometry                            |
| API-095 | dialog           | missing              | P2       | Runtime geometry updates                      |
| API-096 | dialog           | missing              | P2       | Open/before-close lifecycle                   |
| API-097 | dialog           | missing              | P2       | Interaction event streams                     |
| API-098 | dialog           | missing              | P1       | Universal close predicate/veto                |
| API-099 | dialog           | missing              | P2       | Independent dismissal/backdrop policies       |
| API-100 | dialog           | missing              | P2       | Creation context configuration                |
| API-101 | dialog           | component-only       | P2       | Panel/backdrop classes                        |
| API-102 | dialog           | missing              | P2       | Service-wide registry/controller              |
| API-103 | dialog           | missing              | P2       | Focus-restore/trap timing policies            |
| API-104 | dialog           | missing              | P2       | Scroll/navigation closing policy              |
| API-105 | dialog           | missing              | P2       | Accessible reference configuration            |
| API-106 | dialog           | missing              | P2       | Async confirm actions                         |
| API-107 | dialog           | missing              | P2       | Draggable/maximizable windows                 |
| API-108 | dialog           | missing              | P2       | Docked push/side/over drawer                  |
| API-109 | dialog           | missing              | P2       | Top drawer placement                          |
| API-110 | dialog           | missing              | P2       | Async dismissal guard                         |
| API-111 | divider          | component-only       | P3       | Inset divider                                 |
| API-112 | divider          | component-only       | P3       | Labeled divider alignment                     |
| API-113 | empty-state      | component-only       | P2       | Custom illustration slot                      |
| API-114 | file-upload      | missing              | P1       | Transport workflow                            |
| API-115 | file-upload      | missing              | P2       | Uploader adapter                              |
| API-116 | file-upload      | missing              | P2       | Async approval/transformation                 |
| API-117 | file-upload      | missing              | P2       | Per-file upload state                         |
| API-118 | file-upload      | missing              | P2       | Transport lifecycle outputs                   |
| API-119 | file-upload      | missing              | P2       | Directory selection                           |
| API-120 | file-upload      | missing              | P2       | Image preview hooks                           |
| API-121 | file-upload      | missing              | P2       | Async removal/download hooks                  |
| API-122 | file-upload      | missing              | P2       | File-list/toolbar templates                   |
| API-123 | file-upload      | missing              | P2       | Localized UI/error options                    |
| API-124 | filter           | missing              | P2       | Executable operator registry                  |
| API-125 | filter           | missing              | P2       | Per-field AND/OR constraints                  |
| API-126 | gauge            | different-role       | P3       | Editable knob behavior                        |
| API-127 | hotspot          | component-only       | P2       | Overlay container option                      |
| API-128 | hover-card       | missing              | P2       | Public hover timing policy                    |
| API-129 | hover-card       | missing              | P2       | Panel class/container options                 |
| API-130 | icon             | missing              | P2       | Remote/namespaced SVG loading                 |
| API-131 | icon             | different-role       | P3       | Font icon integration                         |
| API-132 | image-compare    | missing              | P2       | Vertical reveal                               |
| API-133 | image-compare    | missing              | P2       | Reveal bounds/step                            |
| API-134 | image-compare    | missing              | P2       | Disabled/hover reveal policies                |
| API-135 | image-compare    | missing              | P2       | End-of-drag event                             |
| API-136 | inline-edit      | missing              | P2       | External editor state                         |
| API-137 | inline-edit      | missing              | P2       | Custom display/editor templates               |
| API-138 | inline-edit      | missing              | P2       | Editor lifecycle outputs                      |
| API-139 | interaction      | missing              | P2       | Ripple geometry/timing                        |
| API-140 | interaction      | missing              | P2       | Imperative ripple controller                  |
| API-141 | lightbox         | missing              | P2       | Viewer image transforms                       |
| API-142 | lightbox         | missing              | P2       | Viewer content templates                      |
| API-143 | lightbox         | missing              | P2       | Thumbnail layout/breakpoints                  |
| API-144 | lightbox         | missing              | P2       | Slideshow controller                          |
| API-145 | lightbox         | missing              | P2       | Live index/visibility models                  |
| API-146 | list             | different-role       | P2       | Selection-list contract                       |
| API-147 | list             | elsewhere            | P2       | Integrated data-list paging                   |
| API-148 | masked-input     | missing              | P2       | Custom/alphabetic token patterns              |
| API-149 | masked-input     | missing              | P2       | Masked/raw model policy                       |
| API-150 | masked-input     | missing              | P2       | Incomplete-input buffer policy                |
| API-151 | masked-input     | missing              | P2       | Completion event                              |
| API-152 | menu             | missing              | P2       | Context/right-click/long-press trigger        |
| API-153 | menu             | missing              | P2       | Imperative trigger controller                 |
| API-154 | menu             | missing              | P2       | Focus restore policy                          |
| API-155 | menu             | missing              | P2       | Panel/backdrop policy                         |
| API-156 | menu             | component-only       | P2       | Recursive data menu model                     |
| API-157 | meter            | missing              | P2       | Semantic threshold metadata                   |
| API-158 | meter            | different-role       | P2       | Grouped contribution meter                    |
| API-159 | multi-select     | missing              | P1       | Value identity/display hooks                  |
| API-160 | multi-select     | missing              | P1       | Integrated virtual options                    |
| API-161 | multi-select     | missing              | P2       | Paged option loading                          |
| API-162 | multi-select     | missing              | P2       | Maximum selection count                       |
| API-163 | multi-select     | missing              | P2       | Select-all options                            |
| API-164 | multi-select     | missing              | P2       | Selected-summary policy                       |
| API-165 | multi-select     | missing              | P2       | Item/group/chip templates                     |
| API-166 | multi-select     | missing              | P2       | Panel slots                                   |
| API-167 | multi-select     | missing              | P2       | Filter strategy                               |
| API-168 | multi-select     | missing              | P2       | Controlled visibility                         |
| API-169 | multi-select     | missing              | P2       | Overlay policies                              |
| API-170 | multi-select     | missing              | P2       | Fine-grained lifecycle events                 |
| API-171 | navbar           | component-only       | P2       | Mobile breakpoint option                      |
| API-172 | navigation-menu  | missing              | P1       | Arbitrary-depth item tree                     |
| API-173 | navigation-menu  | missing              | P2       | Action/disabled/visibility metadata           |
| API-174 | navigation-menu  | missing              | P2       | Router metadata                               |
| API-175 | navigation-menu  | missing              | P2       | Item decorations/link target                  |
| API-176 | navigation-menu  | missing              | P2       | Menu event/service controller                 |
| API-177 | number-input     | missing              | P2       | Precision/grouping policy                     |
| API-178 | number-input     | missing              | P2       | Custom parser/formatter                       |
| API-179 | number-input     | elsewhere            | P2       | Affix options                                 |
| API-180 | number-input     | missing              | P2       | Spinner layout                                |
| API-181 | number-input     | missing              | P2       | Stepping policy/events                        |
| API-182 | number-input     | missing              | P2       | Currency/locale formatting options            |
| API-183 | number-ticker    | component-only       | P2       | Custom value/loading rendering                |
| API-184 | otp              | missing              | P2       | Masked OTP digits                             |
| API-185 | otp              | missing              | P2       | Alphanumeric code mode                        |
| API-186 | otp              | missing              | P2       | Custom cell template                          |
| API-187 | otp              | missing              | P2       | Input formatter hook                          |
| API-188 | pagination       | missing              | P2       | Page-size selector                            |
| API-189 | pagination       | missing              | P2       | Jump-to-page UI                               |
| API-190 | pagination       | missing              | P2       | Range/report template                         |
| API-191 | pagination       | missing              | P2       | Page-link layout policy                       |
| API-192 | pagination       | missing              | P2       | Disable paginator                             |
| API-193 | pagination       | missing              | P2       | Custom paginator slots                        |
| API-194 | password         | missing              | P2       | Configurable strength policy                  |
| API-195 | password         | missing              | P2       | Localized strength messages                   |
| API-196 | password         | missing              | P2       | Strength-panel templates                      |
| API-197 | password         | missing              | P2       | Visibility affordance templates               |
| API-198 | phone-input      | missing              | P1       | International country selection               |
| API-199 | phone-input      | missing              | P2       | Country search                                |
| API-200 | phone-input      | missing              | P2       | Country-aware masks/policy                    |
| API-201 | popover          | missing              | P2       | Independent tooltip hide delay                |
| API-202 | popover          | missing              | P2       | Touch and origin policy                       |
| API-203 | popover          | component-only       | P2       | Tooltip panel class                           |
| API-204 | popover          | elsewhere            | P2       | Rich tooltip content/context                  |
| API-205 | popover          | missing              | P2       | Trigger and auto-close policy                 |
| API-206 | popover          | missing              | P2       | Popover container/anchor/position policies    |
| API-207 | popover          | missing              | P2       | Popover timing                                |
| API-208 | popover          | missing              | P2       | Post-transition lifecycle                     |
| API-209 | progress         | missing              | P2       | Success/segmented progress                    |
| API-210 | progress         | missing              | P2       | Progress geometry                             |
| API-211 | progress         | missing              | P2       | Progress label rendering                      |
| API-212 | progress         | component-only       | P2       | Spinner geometry/timing                       |
| API-213 | progress         | elsewhere            | P2       | Custom determinate progress bounds            |
| API-214 | range-slider     | missing              | P2       | Minimum/maximum handle separation             |
| API-215 | range-slider     | missing              | P2       | Nonlinear scale                               |
| API-216 | range-slider     | missing              | P2       | Per-handle disabling/separation               |
| API-217 | range-slider     | missing              | P2       | Orientation/reversal                          |
| API-218 | range-slider     | missing              | P2       | Marks and tooltips                            |
| API-219 | range-slider     | missing              | P2       | Commit/drag-end event                         |
| API-220 | rating           | missing              | P2       | Fractional rating                             |
| API-221 | rating           | missing              | P2       | Rating glyph/tooltips                         |
| API-222 | rating           | missing              | P2       | Clear by selecting again                      |
| API-223 | rating           | missing              | P2       | Preview hover outputs                         |
| API-224 | rating           | missing              | P2       | Orientation/icon templates                    |
| API-225 | scroll-area      | review               | P2       | Delegate/customize scroll host                |
| API-226 | scroll-to-top    | missing              | P2       | Scroll behavior option                        |
| API-227 | scroll-to-top    | component-only       | P3       | Custom icon                                   |
| API-228 | search-field     | different-role       | P2       | Global-search overlay presentation            |
| API-229 | segmented        | component-only       | P2       | Multiple selection/empty policy               |
| API-230 | segmented        | component-only       | P2       | Layout/shape policy                           |
| API-231 | segmented        | missing              | P2       | Custom segment content                        |
| API-232 | select           | missing              | P1       | Object identity comparator                    |
| API-233 | select           | missing              | P2       | Custom selected trigger                       |
| API-234 | select           | missing              | P1       | Virtualized options                           |
| API-235 | select           | missing              | P2       | Viewport-paged loading                        |
| API-236 | select           | missing              | P2       | Arbitrary entered value                       |
| API-237 | select           | elsewhere            | P2       | Integrated search/loading/clear UI            |
| API-238 | select           | elsewhere            | P2       | Multiple values on same control               |
| API-239 | select           | missing              | P2       | Public popup controller                       |
| API-240 | select           | missing              | P2       | Panel class/width policy                      |
| API-241 | select           | missing              | P2       | Overlay scroll/offset/container configuration |
| API-242 | select           | missing              | P2       | Typeahead/active-option policy                |
| API-243 | select           | missing              | P2       | Nullable-option selection policy              |
| API-244 | select           | missing              | P2       | Selected/group/panel templates                |
| API-245 | selectable-card  | component-only       | P3       | Card-control sizing                           |
| API-246 | sidebar          | missing              | P1       | Responsive compact/collapse states            |
| API-247 | sidebar          | elsewhere            | P2       | Overlay/push/side placement                   |
| API-248 | sidebar          | missing              | P2       | Service-controlled tagged sidebars            |
| API-249 | sidebar          | missing              | P2       | Recursive navigation groups                   |
| API-250 | sidebar          | missing              | P2       | Router metadata                               |
| API-251 | sidebar          | component-only       | P2       | Viewport docking offsets                      |
| API-252 | skeleton         | composable           | P2       | Structured skeleton preset                    |
| API-253 | skeleton         | component-only       | P3       | Per-instance radius option                    |
| API-254 | slider           | missing              | P2       | Value bubble and formatter                    |
| API-255 | slider           | missing              | P2       | Tick marks                                    |
| API-256 | slider           | missing              | P2       | Labeled/custom mark positions                 |
| API-257 | slider           | missing              | P2       | Orientation/reversal                          |
| API-258 | slider           | missing              | P2       | Nonlinear value scale                         |
| API-259 | slider           | missing              | P2       | Drag lifecycle                                |
| API-260 | sparkline        | elsewhere            | P2       | Area/bar and axis/tooltip customization       |
| API-261 | stat             | missing              | P2       | Custom value content                          |
| API-262 | stat             | composable           | P2       | Integrated loading state                      |
| API-263 | state            | component-only       | P2       | Result variants and illustration slots        |
| API-264 | stepper          | missing              | P1       | Form-control-aware linear gating              |
| API-265 | stepper          | missing              | P2       | Vertical stepper                              |
| API-266 | stepper          | missing              | P2       | Template step labels                          |
| API-267 | stepper          | missing              | P2       | Transition timing/completion                  |
| API-268 | stepper          | missing              | P2       | Step reset/hide semantics                     |
| API-269 | stepper          | missing              | P2       | Whole-stepper reset/header navigation policy  |
| API-270 | stepper          | missing              | P2       | Lazy step content                             |
| API-271 | stepper          | missing              | P2       | Step error/process/icon/subtitle metadata     |
| API-272 | stepper          | missing              | P2       | Progress-dot/custom progress representation   |
| API-273 | table            | missing              | P1       | Multi-column sort                             |
| API-274 | table            | missing              | P1       | Integrated column/global filtering            |
| API-275 | table            | missing              | P1       | Server query protocol                         |
| API-276 | table            | missing              | P1       | Integrated virtual rows                       |
| API-277 | table            | elsewhere            | P2       | Integrated pagination                         |
| API-278 | table            | missing              | P2       | Frozen columns/rows                           |
| API-279 | table            | component-only       | P2       | Scrollable body configuration                 |
| API-280 | table            | missing              | P2       | Column resizing                               |
| API-281 | table            | missing              | P2       | Column reordering                             |
| API-282 | table            | missing              | P2       | Row drag reordering                           |
| API-283 | table            | missing              | P2       | Expandable rows                               |
| API-284 | table            | missing              | P2       | Grouped rows                                  |
| API-285 | table            | missing              | P2       | Row/cell editing lifecycle                    |
| API-286 | table            | missing              | P2       | Selection modes/range gestures                |
| API-287 | table            | missing              | P2       | Conditional selectable rows                   |
| API-288 | table            | missing              | P2       | Row context menu selection                    |
| API-289 | table            | missing              | P2       | Data export                                   |
| API-290 | table            | missing              | P2       | State persistence                             |
| API-291 | table            | missing              | P2       | Footer/summary/multilevel headers             |
| API-292 | table            | missing              | P2       | Loading/empty content templates               |
| API-293 | table            | missing              | P2       | Granular action events                        |
| API-294 | table            | missing              | P2       | Sort direction cycle policy                   |
| API-295 | table            | different-role       | P2       | Tree/hierarchical rows                        |
| API-296 | tabs             | missing              | P1       | Lazy first activation                         |
| API-297 | tabs             | missing              | P2       | Inactive content lifecycle                    |
| API-298 | tabs             | missing              | P2       | Custom header templates                       |
| API-299 | tabs             | missing              | P2       | Route-linked tab navigation                   |
| API-300 | tabs             | missing              | P2       | Overflow paginator controls                   |
| API-301 | tabs             | missing              | P2       | Animated active-panel height                  |
| API-302 | tabs             | missing              | P2       | Vertical/bottom tab placement                 |
| API-303 | tabs             | missing              | P2       | Editable add/close tabs                       |
| API-304 | tabs             | missing              | P1       | Guarded tab transitions                       |
| API-305 | tabs             | missing              | P2       | Focus/animation outputs                       |
| API-306 | tabs             | missing              | P2       | Overflow dropdown                             |
| API-307 | tabs             | component-only       | P2       | Tab badge/responsive labels                   |
| API-308 | time-picker      | missing              | P2       | Explicit format/meridian policy               |
| API-309 | time-picker      | missing              | P2       | Time-unit disabled predicates                 |
| API-310 | time-picker      | missing              | P2       | Custom panel precision and stepping           |
| API-311 | time-picker      | missing              | P2       | Confirmation/footer content                   |
| API-312 | time-picker      | different-role       | P2       | Controlled popup configuration                |
| API-313 | timeline         | missing              | P2       | Timeline alignment/orientation                |
| API-314 | timeline         | missing              | P2       | Marker/opposite templates                     |
| API-315 | timeline         | missing              | P2       | Pending/reverse timeline                      |
| API-316 | timeline         | missing              | P2       | Per-item dot/side configuration               |
| API-317 | toast            | missing              | P2       | Position/responsive configuration             |
| API-318 | toast            | missing              | P2       | Multiple independent toast channels           |
| API-319 | toast            | missing              | P2       | Duplicate/visible-limit policy                |
| API-320 | toast            | missing              | P2       | Rich/template notifications                   |
| API-321 | toast            | missing              | P2       | Per-toast lifecycle/action results            |
| API-322 | toast            | missing              | P2       | Announcement policy                           |
| API-323 | toast            | component-only       | P2       | Click dismissal/content styling policy        |
| API-324 | virtual-list     | missing              | P1       | Horizontal/two-axis virtualization            |
| API-325 | virtual-list     | missing              | P1       | Viewport-range loading                        |
| API-326 | virtual-list     | missing              | P2       | Public rendered-range observation             |
| API-327 | virtual-list     | elsewhere            | P2       | Virtual row loading placeholders              |
| API-328 | virtual-list     | missing              | P2       | Pixel/alignment scroll controller             |
| API-329 | virtual-list     | missing              | P2       | Append-only/bypass rendering modes            |
