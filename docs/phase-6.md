# Phase 6: heavy data on demand

Version 0.6.0 adds the heavy-data components below. Gauge retains its existing API and tests.

| Family | Entry point | Docs route |
| --- | --- | --- |
| Data grid | @hyalo/angular/data-grid | /components/data-grid |
| Tree view | @hyalo/angular/tree | /components/tree |
| Tree table | @hyalo/angular/tree-table | /components/tree-table |
| Virtual scroller | @hyalo/angular/virtual-scroller | /components/virtual-scroller |
| Kanban | @hyalo/angular/kanban | /components/kanban |
| Calendar / scheduler | @hyalo/angular/scheduler | /components/scheduler |
| Splitter | @hyalo/angular/splitter | /components/splitter |
| Dashboard layout | @hyalo/angular/dashboard-layout | /components/dashboard-layout |
| Context menu | @hyalo/angular/context-menu | /components/context-menu |
| Rich text editor | @hyalo/angular/rich-text | /components/rich-text |
| Gauge | @hyalo/angular/gauge | /components/gauge |

## Contracts

Each entry exports its component, configuration/data types, contexts, events, and applicable utilities. [The generated inventory](phase-6-api.md) records the complete declared API. Run npm run docs:api after public changes; npm run docs:check-api detects drift. Every docs page displays all component inputs, models, outputs, and public methods. Model names also expose their Angular Change output.

Grid columns cover stable IDs, value getters, widths/bounds, logical pinning/alignment, sorting/comparators, filtering, formatting, cell/editor templates, immutable writes, validation, aggregates, and CSV inclusion. Query state covers pagination, multi-sort, typed filters, global search, and grouping. Selection persists by stable key across pages. Server mode emits a typed query and renders the supplied page without a second client filter. The host owns fetching, loading, errors, and cancellation. No hidden persistence or network calls occur.

Grid state codecs validate version, column references, widths, sort/filter operators, ranges, and selections before applying anything. CSV exports raw values and escapes spreadsheet formula prefixes by default. Date values use UTC for default formatting/export; supply format for application timezone display. Grouping is client-side on the current page; use lazy mode for server grouping/query ownership. Row details are available with the regular renderer; fixed-size virtual rows cannot contain variable-height expansion. Column picker actions provide non-drag ordering, and resize separators provide keyboard control.

Tree nodes use unique, acyclic stable keys. Expansion, single/multiple selection, strict or cascading checks, ancestor-preserving filtering, templates, icons, lazy AbortSignal loaders, loading/error retry, context/activation, and host-owned moves are explicit. Pointer dropping onto a branch and Alt-arrow moves emit proposals; the host updates the node collection. Tree table reuses grid columns and editing with hierarchy metadata, sibling sorting, preserved filtering ancestors, controlled expansion, lazy load requests, virtual scrolling, selection, and wrapper-aware state persistence. Tree-table pagination is disabled to keep ancestors with descendants.

Virtual scroller renders a bounded CDK viewport with native scrolling and a small label-only SSR fallback. Fixed itemSize is a contract, not a height estimate. appendOnly intentionally trades bounded memory for retained views. Prefer the earlier virtual-list family for its richer keyboard-selection behavior.

Kanban accepts immutable columns/cards, swimlanes, WIP limits, disabled state, templates, filtering, touch drag delay, asynchronous canMove, typed move lifecycle, and activation. Pointer, visible earlier/later buttons, column/lane selects, and imperative moves share validation. Replaced or cancelled pending requests cannot write stale data. Dashboard tiles expose grid geometry, constraints, locks, templates, vetoes, move/resize lifecycle, compacting, and validated versioned persistence. Overlaps are rejected; the host can implement a different layout policy through setLayout. Narrow containers stack tiles without rewriting saved desktop geometry.

Splitter uses percentage models with initial/default sizes, min/max bounds, collapse state, orientation, keyboard steps, native pointer capture, cancellation, and resize events. Impossible external allocations throw. Interactive collapse that cannot fit returns without changing state. Context menu uses CDK menu/trigger behavior, contextual data, nested/checkable/radio items, hidden/disabled/separator state, icon/shortcut/custom templates, material overrides, positions, and imperative open/close. Gauge keeps its radial/semicircle, nullable reading, threshold tones, needle, ticks, range, localization, and accessible-value APIs.

## Optional engines

Scheduler lazily imports FullCalendar 6.1.22 core, daygrid, timegrid, list, interaction, and luxon3 plugins, plus Luxon 3. These are optional peers. The wrapper deliberately targets the supported v6 modular API; FullCalendar v7 uses a different package layout and is not silently mixed into this adapter. Full CalendarOptions, additional plugins, and getApi preserve advanced engine configuration: event sources, recurrence, business hours, constraints, locales, custom views and rendering hooks. The wrapper owns its empty DOM mount, bridged callbacks, explicit inputs, and accessible toolbar. Typed dates/ranges, clicks, selections, loading, errors, async move/resize vetoes, navigation methods, refetch, and resize APIs are exposed. Editable events require stable IDs. Pending changes lock further event edits until resolved. The host persists accepted event changes. Premium resource plugins require the host's licensed installation; they are not bundled.

Rich text lazily imports TipTap 3.34 core, StarterKit, Image, Placeholder, and CharacterCount. Install @tiptap/pm too. All are optional peers. HyRichText implements FormValueControl<JSONContent | null>, shared field metadata, touch, disabled/readonly state, named contenteditable focus, JSON changes, selection/focus events, toolbar actions, link/image commands, character limits, reset, and loader retry. starterKit, extensions (including async extension factories), editorOptions, and getEditor expose the engine contract. Reconfiguring extensions recreates the editor from current JSON. Engine destruction and generation checks protect async initialization. Link/image commands reject unsafe schemes; HTML is parsed through the configured schema. Applications still own storage, uploaded media, custom extension security, collaboration servers, and sanitization when displaying HTML outside the editor.

Use the full Hyalo stylesheet or add styles/overlays/rich-text.css next to hyalo-core.css. FullCalendar injects its own structural CSS and inherits wrapper-defined semantic colors.

## Rendering and interaction

Dense rows and tiles use solid/tinted semantic surfaces without nested backdrop blur. Resize and edit feedback follows input immediately. There are no automatic motion loops, animated sorting delays, or new GSAP/Three.js dependencies. CDK handles drag previews; touch cancellation and Escape discard operation commits. Native scrolling is retained. Logical CSS and inherited direction support RTL. Forced-colors focus and selected state retain outlines. Server markup contains real data, labels, or explicit engine-loading fallbacks. Browser-only engines mount after rendering and are destroyed with their component.

Tests and browser checks cover state, edits, async disposal/vetoes, geometry, hierarchy, accessibility naming, optional-engine lifecycle, generated examples, and package boundaries. The verification record below states the actual checks completed. This work does not establish mid-tier device/4K frame budgets, assistive-technology certification, or cross-engine browser parity.
