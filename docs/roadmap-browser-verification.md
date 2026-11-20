# Roadmap browser verification

## Scope and limits

Interactive Chromium checks used the local Angular SSR/development server.
Viewport simulation is not physical-device testing. No Firefox/WebKit,
screen-reader, native OS picker or hardware performance certification is claimed.
Select-specific SSR/hydration observations are recorded separately in
`roadmap-select-verification.md`.

## Checks exercised

| Flow | Actual observation |
| --- | --- |
| Notification inbox, 762 x 428 | Opened inbox; read-all changed unread count from 2 to 0; Escape closed and restored focus to the launcher. No captured application errors. |
| Short inbox layout | Initial panel extended above the viewport. CDK measured the panel before lazy tab content reached its final height; scale entry also affected geometry. Added size-driven repositioning and entry-transition repositioning. Final pane bounds: x=369, y=2, width=354, height=398 inside the 428px viewport. The content remains natively scrollable. |
| Marketplace conversation, 390px | Adding a local draft increased displayed messages from 3 to 4. Editing updated the same message, keeping the count at 4. No horizontal page overflow and no captured application errors. |
| Marketplace attachment | Native HTTPS PDF link rendered with `rel="noopener noreferrer"`; no transport or upload was executed. Unsafe attachment schemes are covered by regression tests. |
| Fintech transfer, 390 x 844 | Typing Persian `۰۰۱۲٫۵۰` displayed canonical `0012.50` in the default locale, preserving zeros. Twelve keypad buttons formed three equal-width columns; measured key height was 52px. No horizontal page overflow. |
| Transfer controls | Previewed amount entry and pending-disabled control states in the live demo; regression suite separately covers duplicate submission and explicit success/failure/reset. The primary confirmation target was increased to at least 44px after measuring 40px. |
| Dashboard, 1440 x 1000 | Real chart canvas initialized, nine table rows present, no captured application errors. Repeated stat surfaces and actual HyTable sticky header cells computed `backdrop-filter: none`; table headers had an opaque background. This is one scene/theme snapshot, not a compositing/performance budget. |

## Remaining acceptance

Test all relevant modes under Persian/RTL, light/dark/forced colors, reduced
motion and low-tier policies with real users and supported engines. Capture
repeatable whole-scene traces on representative hardware before declaring a blur
or frame-time budget. Exercise trusted pre-bootstrap interactions and enabled
deferred/incremental hydration rather than extrapolating from synthetic events.
