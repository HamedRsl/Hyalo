# Responsive sidebar (API-246)

Responsive behavior is opt-in. Without `responsive`, the sidebar keeps its existing
16rem expanded width and `[(collapsed)]` manual icon-rail behavior.

```html
<hy-sidebar
  [(collapsed)]="collapsed"
  [responsive]="{ compact: '(max-width: 64rem)', collapsed: '(max-width: 40rem)' }"
>
  <strong hySidebarBrand>Workspace</strong>
  <a hySidebarItem href="/" label="Overview" icon="home"></a>
</hy-sidebar>
```

`HySidebarResponsive` is exported from `@hyalo/angular/sidebar`. Both media-query
properties are optional; the application chooses its breakpoints. Pass `null` to
disable responsive behavior. Replacing the configuration releases old listeners;
destroying the sidebar releases all remaining listeners.

- **Expanded:** existing presentation, width `--hy-sidebar-width` (default 16rem).
- **Compact:** narrower labeled navigation, width `--hy-sidebar-compact-width`
  (default 12rem, capped by the expanded width), with tighter section spacing.
- **Collapsed:** existing icon rail, width `--hy-sidebar-collapsed-width`
  (default 4.5rem). Brand, footer, group headings and item copy are hidden; links
  retain accessible names, titles and current-page semantics. Supply item icons
  for meaningful visual navigation in the rail.

The host exposes `data-state="expanded|compact|collapsed"`; `data-collapsed` remains
available for compatibility. A matching collapsed query wins over a compact query.
An explicit `collapsed=true` also wins. Viewport changes do **not** emit
`collapsedChange` or overwrite the consumer's manual preference.

The toggle reflects the effective state in its localized labels and
`aria-expanded`. Expanding an automatic rail temporarily overrides the collapsed
query, returning to compact (if its query matches) or expanded. This override resets
when the viewport leaves the collapsed range or the responsive configuration
changes. Clicking collapse writes `true` to the existing model as before.

Queries are evaluated after browser rendering, not during server rendering, to
preserve the initial SSR/hydration structure. Without `matchMedia`, the manual
sidebar remains functional. No new animation is introduced; existing reduced-motion
and RTL behavior is retained.

Regression coverage: `sidebar.spec.ts` exercises media transitions and precedence,
manual-model preservation, automatic-rail expansion, focus/ARIA state, absent
media APIs, opt-in defaults and listener cleanup; existing sidebar/group tests
continue to exercise native links and accessibility.
