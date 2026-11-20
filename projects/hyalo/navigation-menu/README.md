# Navigation menu

Import `HyNavigationMenu` and `HyNavigationItem` from
`@hyalo/angular/navigation-menu`. Existing `sections: [{ label, links }]`
menus continue to work; sections and children may coexist on any item.

```ts
const items: readonly HyNavigationItem[] = [
  {
    id: 'learn',
    label: 'Learn',
    children: [
      {
        id: 'guides',
        label: 'Guides',
        children: [
          { id: 'setup', label: 'Setup', href: '/setup', badge: 'New' },
          {
            id: 'help',
            label: 'Help',
            command: ({ item, originalEvent }) => showHelp(item, originalEvent),
          },
        ],
      },
    ],
  },
];
```

Bind with `<hy-navigation-menu [items]="items" />`.

- **API-172:** `children` recursively accepts items without a fixed depth limit.
  IDs must be unique among siblings; IDs can repeat in different branches.
  A branch (children or sections) is a disclosure, not a navigation destination:
  its `href`/`command` is not activated. Put destinations/actions in leaf items.
  Descendants mount only while their branch is expanded. Closing a branch resets
  its descendants; closing the top-level overlay resets every branch.
- **API-173:** Items and legacy section links support `visible` (default true),
  `disabled` (default false), and `command`. Invisible entries are not rendered.
  Disabled entries cannot activate or receive sequential keyboard focus.
  A leaf with a command but no href is a native button. A command on a link
  receives `{ item, originalEvent }` and may prevent native navigation via
  `originalEvent.preventDefault()`. Activation closes the overlay.
- **API-175:** Shared metadata includes `description`, registered `icon` name,
  text `badge`, `title`, `target`, and `rel`. Native `_blank` links add
  `noopener noreferrer` while retaining supplied relationship tokens.

Tab enters the overlay at its first enabled link/button; Shift+Tab at the first
entry returns to the top-level trigger. Escape inside an expanded branch closes
that branch and returns to its trigger; Escape otherwise closes the overlay and
returns to the top-level trigger. Links retain native browser semantics.

Router-specific metadata (**API-174**) and a menu event/service controller
(**API-176**) are not implemented by this change.
