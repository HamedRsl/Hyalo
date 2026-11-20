# Roadmap implementation decisions

## Composition before configuration

Notification inbox/push card, marketplace conversations, and the fintech keypad
are application blocks, not additional reusable component families. Their live
examples expose complete editable TypeScript, HTML and CSS using public
primitives. Local signal records demonstrate state transitions; applications
replace them with their own store, persistence, delivery acknowledgements and
payment authorization. No permission, transport or payment request is inferred.

The existing `@hyalo/angular/chat`, `/notification-center`, `/keypad` and
`HyTransferBlock` exports are retained for compatibility. They are not required
by the new compositions. The documentation separates Application blocks from
Components and keeps old routes reachable.

The supplied roadmap's historical Phase 5 count is 15. Reclassifying these three
rows gives 12 reusable families plus 3 compositions, not three extra families.
The Phase 0 engine and remaining phases keep their existing scope. No AI chat,
prompt kit, specialist map, payment processing or realtime backend is added.

## Design and performance

- Keep the repository's shared tokens, themes, material/fidelity policy, logical
  CSS and font system rather than introducing brand-specific hard-coded colors.
- Use clear/frosted glass sparingly for chrome/overlays; repeated messages and
  notification content use tinted/solid surfaces without repeated backdrop blur.
- Keep native scrolling, visible keyboard controls, persistent labels and
  application-owned feedback. Decorative animation must not delay input.
- Reuse the existing optional GSAP adapter for suitable motion. These three
  compositions do not justify a mandatory animation dependency or graphics loop.
- Existing refraction uses a lazy shared WebGL renderer, bounds device-pixel
  ratio, and disposes textures/buffers. Do not replace it with Three.js merely to
  use a dependency. Three.js guidance applies to future specialist scene hosts,
  not text inputs and inbox rows.
- Do not claim a hardware performance budget from a production bundle or unit
  test. Physical-device, 4K, cross-engine and assistive-technology gates remain
  separate evidence requirements in the phase coverage ledger.

## API research and deliberate differences

The existing `phase-5-api-review.md`, `phase-6-api-review.md` and API audit ledger
record component-by-component comparisons. Vendor configuration is a reference,
not a promise to reproduce every alias. Where vendor vocabulary conflicts,
Hyalo keeps one typed canonical contract, public templates and host styling.

For the compositions specifically:

| Reference | Capability considered | Decision |
| --- | --- | --- |
| Angular Material bottom sheet | data/context, focus restore, dismissal, geometry | Reuse Hyalo overlay primitives instead of creating another inbox overlay service. |
| PrimeNG Toast | headless templates, keyed messages, close action, duration | Copyable push-card markup; transient duration/position remain Toast responsibilities. |
| NG-ZORRO notification | title/content templates, key, pause/duration, data | Persistent inbox records and read/dismiss operations belong to the application store. |
| Ant Design notification | custom actions, close icons, semantic styles, stacking | Editable markup/CSS allows customization without another wrapper-input layer. |
| Nebular chat source | sender/date, files, quote/custom message rendering | Application-owned records and template editing; plain text by default, safe attachment links. No imported chat framework. |
| Angular Signal Forms | FormValueControl/checked contracts, validation | Reuse existing field controls where needed; an application keypad grid is not a new value accessor. |

Primary references checked during this implementation:

- <https://angular.dev/style-guide>
- <https://angular.dev/guide/forms/signals/custom-controls>
- <https://angular.dev/guide/components/lifecycle>
- <https://angular.dev/guide/hydration>
- <https://material.angular.dev/components/bottom-sheet/api>
- <https://primeng.org/toast>
- <https://ng.ant.design/components/notification/en>
- <https://ant.design/components/notification>
- <https://github.com/akveo/nebular/blob/master/src/framework/theme/components/chat/chat-message.component.ts>
- <https://developer.apple.com/design/human-interface-guidelines/materials>
- <https://gsap.com/docs/v3/GSAP/gsap.context()/>
- <https://threejs.org/manual/en/how-to-dispose-of-objects.html>

These web references can describe versions newer than the pinned Angular 22.2
stack. Implementation compiles and tests against the repository lockfile; this
review does not silently upgrade framework or optional engine versions.
