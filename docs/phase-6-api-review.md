# Phase 6 API and configuration review

Reviewed against installed primary type declarations on November 18, 2026, alongside official documentation. Vendor packages are reference material only; none are Hyalo runtime dependencies. The snapshot lives in tmp/api-audit/competitor-api.json and versions.json. node tmp/api-audit/query.mjs accepts a declaration-name expression for reproducible inspection.

| Reference | Version inspected | Relevant contract |
| --- | --- | --- |
| Angular Material/CDK | 22.2.7 | table/data source, sort/pagination, tree, fixed virtual viewport, drag/drop, context menu, resizable positioning patterns |
| PrimeNG | 22.1.5 | Table/TreeTable column, sort/filter/page/lazy, selection, resize/reorder, frozen columns, templates, editing/export; Tree, ContextMenu, Splitter, Editor, Knob |
| NG-ZORRO | 22.2.0 | table/tree/tree-select, virtual rendering, check strategies, async expansion/drop guards, splitter panel constraints, resizable bounds/grid/handles, dropdown context, calendar |
| Nebular | 17.0.0 | tree-grid hierarchy/sort/filter, data sources, menu items/context-menu placement/trigger and show/hide/toggle APIs; Angular 21 peer baseline is reference-only |
| Taiga UI core/kit | 5.33.0 | tree data/accessors, selection/focus and template contracts, hosted contextual content |
| ng-bootstrap | 21.0.0 | accessible contextual actions, event/focus and positioning contracts; it does not supply an enterprise grid/board/editor |
| FullCalendar | 6.1.22 adapter | complete CalendarOptions/CalendarApi, date/range/events/selection, editing constraints, sources/recurrence, hooks and plugins |
| TipTap | 3.34.0 | EditorOptions/Editor/extensions, StarterKit configuration, JSON schema, commands/history, selection lifecycle, placeholder/count/image |

## Mapping and decisions

| Concern found in reference APIs | Hyalo contract |
| --- | --- |
| Table data and identity | data model, required rowKey, stable selections and duplicate-key validation |
| Sort/filter/page/lazy | sorts, filters, page, pageSize, search, totalRecords, lazy, query/queryChange; explicit operators and runtime-validated saved query |
| Column definitions/configuration | HyGridColumn getters, comparison, formatting, bounds, logical pinned/alignment, templates, editors, validation, aggregate, export flags; global HY_DATA_GRID_DEFAULTS plus per-grid config |
| Column resize/reorder/frozen/picker | columnWidths/order/hidden models, pointer and keyboard resizing, visible ordering buttons, reorder/resize outputs, pinned header/body offsets |
| Grid/row state | disabled/loading/error/retry, rowDisabled, rowMetadata, row detail template and expandedRows, row activation/context, total/page counts |
| Editing | cell/row modes, immutable writes, native number/select/checkbox/text or custom editors, start/commit/cancel/error, async canCommit and stale-row protection |
| Export/persistence | CSV scopes/delimiters/BOM/filename/download/formula escaping, versioned encode/decode/save/restore/reset |
| Tree state | selectedKeys/checkedKeys/expandedKeys, selection modes, strict/cascade checks, tri-state, node flags, filtering/locale, line/indent, templates/icons, loading/empty |
| Tree async and moves | AbortSignal loadChildren, request cancellation/errors/retry, canDrop/moveRequested, pointer and Alt-arrow proposals; immutable host ownership |
| Hierarchical table | same columns/config/edits, sibling sorts, preserved ancestors, treegrid levels/positions, controlled expansion, lazy requests and state including hierarchy filter/expansion |
| Virtualization | fixed item/row sizes, viewport/buffers/cache/append-only, trackBy, templates and range/index events; imperative scroll/measure/refresh |
| Splitter/resizable | pane IDs/data/templates/default/min/max, percentage sizes, collapsed IDs, orientation/gutter/keyboard controls, resize lifecycle and rollback |
| Dashboard geometry | tiles, rows/columns/gap, bounds/locks, collision rejection, move/resize/veto/lifecycle, atomic setLayout, compact and validated persistence |
| Sortable boards | columns/cards/swimlanes, limits/disabled/filter/templates, pointer/keyboard/API moves, async gate/cancel and announcements |
| Context actions | CDK trigger template/data/positions/disabled/opened/closed, keyboard trigger and public openAt/open/close/isOpen; item models, submenus, check/radio, templates, icons/shortcuts, material |
| Scheduling | typed options and getApi retain engine-native surface; wrapper events, view/date models, locale/timezone/direction, editing/selection, async mutation gate, loading/errors and methods |
| Rich text | JSON-valued Signal Forms control, native TipTap EditorOptions/StarterKit/extensions and getEditor, actions/commands, links/images/count/placeholder, value/selection/focus/error lifecycle |
| Gauge | existing nullable measurement, min/max, variants, tones/bands, ticks/needle/range, locale/Intl/unit/valueText/emptyLabel preserved |

Hyalo does not copy every vendor property alias. CSS classes/styles belong on Angular hosts or templates; visual options use semantic tokens and material. Events have one typed canonical name. Host-owned network requests, immutable node moves, and event persistence keep transport and backend policy outside the component. Export supports CSV; XLSX/PDF engines, grouping pagination strategies, spreadsheet formulas, pivoting, column virtualization, collaborative editing backends, and premium resource licensing are separate product integrations. These differences are explicit rather than undocumented missing aliases.

[Complete generated API declarations](phase-6-api.md) include all public inputs, models, outputs, methods, data/config types, and utility signatures. Engine passthrough means new native options do not require inventing a second wrapper alias.

Primary sources: [Angular Aria tree](https://angular.dev/guide/aria/tree), [Angular Aria grid](https://angular.dev/guide/aria/grid), [CDK scrolling API](https://material.angular.dev/cdk/scrolling/api), [PrimeNG Table](https://primeng.org/table), [PrimeNG TreeTable](https://primeng.org/treetable), [PrimeNG Tree](https://primeng.org/tree), [PrimeNG Splitter](https://primeng.org/splitter), [NG-ZORRO tree](https://ng.ant.design/components/tree/en), [NG-ZORRO table](https://ng.ant.design/components/table/en), [Nebular TreeGrid source](https://github.com/akveo/nebular/tree/master/src/framework/theme/components/tree-grid), [FullCalendar v6 documentation](https://fullcalendar.io/docs/v6), and [TipTap installation](https://tiptap.dev/docs/editor/getting-started/install/vanilla-javascript).
