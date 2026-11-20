# Phase 2 optics: refraction lifecycle verification

## Scope

Targeted remediation of the existing `@hyalo/angular/refraction` implementation against roadmap Sections 8.1 and 8.6. This is not a claim that all Phase 2 optical, hydration, accessibility or performance release gates are complete. No Three.js or other dependency was added.

## Confirmed defects and fixes

| Gap                                                                                                                                                                      | Reproduction before fix                                                                                                                | Resolution                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The root service cached a lost renderer forever despite the renderer comment promising a fresh instance on the next registration.                                        | Context-loss test expected two shared backing canvases after a later registration; received one.                                       | Expose renderer availability; dispose/invalidate a lost cached instance before registering with its replacement. Concurrent registrations share one replacement. Existing surfaces stay on CSS fallback rather than being automatically restarted. |
| Renderer destruction left `data-rendered` on painted target canvases, suppressing the CSS fallback. Repeated removal/destruction could also delete resources repeatedly. | Destroy regression expected `data-rendered` to be absent; received `true`.                                                             | Clear target backing stores and rendered markers, make removal/destruction idempotent, and ignore registrations after loss/destruction.                                                                                                            |
| Injector destruction during lazy import still allocated graphics afterward.                                                                                              | Destroy-during-load test expected zero backing canvases; received one.                                                                 | Guard both module initialization and registration completion with service destruction state.                                                                                                                                                       |
| Partial initialization leaked resources on compilation/link failure and accepted a null vertex buffer.                                                                   | Fragment failure deleted one shader instead of two; link failure did not delete its program; null-buffer initialization did not throw. | Clean partial shaders/program/buffer and release the context on initialization failure; reject missing buffers.                                                                                                                                    |
| Updating strength tore down the surface and reloaded its image.                                                                                                          | Component regression expected the image count to remain two; received three.                                                           | Separate strength-triggered drawing from source/tier registration. Update the uniform without reloading the image or replacing content.                                                                                                            |

Each defect was observed as an assertion failure before its corresponding production fix, then passed after the fix.

## Behavioral coverage

`projects/hyalo/refraction/renderer.spec.ts` exercises the actual renderer, lazy service and Angular component. Only browser graphics, frame scheduling, geometry and selected capability seams are replaced for deterministic tests.

- Shader compilation, program linking and missing-buffer failure cleanup.
- Single shared context for multiple surfaces; one replacement for concurrent registrations after loss.
- Context-loss fallback restoration and preservation of projected focused controls.
- Medium/low-tier static baseline without GPU program initialization.
- High-to-low tier downgrade preserves the existing canvas/control and releases its texture.
- Strength changes redraw with the new uniform without another image/texture allocation.
- Resize observation disconnects on unregister; unavailable WebGL retains fallback.
- Pending image completion after unregister cannot upload a texture.
- Rejected image upload deletes its texture and does not hide fallback.
- Queued frames cancel on final unregister and destruction.
- Repeated unregister/destroy calls release resources once.
- Multiple draw requests coalesce to one frame, stop afterward, and retain the existing 2048-pixel backing-dimension ceiling.
- Destroying the injector during lazy loading prevents graphics initialization.

## Verification executed

```sh
npx ng test hyalo --watch=false --include='projects/hyalo/refraction/*.spec.ts'
npx eslint projects/hyalo/refraction/*.ts projects/hyalo/refraction/*.html
npx prettier --check projects/hyalo/refraction/renderer.ts projects/hyalo/refraction/refraction.ts projects/hyalo/refraction/renderer.spec.ts docs/roadmap-optics-verification.md
git diff --check -- projects/hyalo/refraction docs/roadmap-optics-verification.md
```

Result: **14 tests passed in one test file**, scoped ESLint passed. Formatting and whitespace checks passed. Git emitted Windows LF-to-CRLF normalization warnings; no whitespace errors. The existing dev server was not stopped or restarted.

## Preserved contracts and limitations

- Existing CSS-glass host, fallback image, decorative pointer-inert canvas and projected Angular content remain structurally unchanged. No content reparenting or layout-dimension changes were introduced.
- Lazy renderer import, one shared WebGL context, stationary/event-driven rendering, DPR cap and backing-size cap remain intact. Tests establish bounded scheduling, not a hardware performance budget.
- Context restoration is deliberately not automatic. Already registered surfaces remain on fallback after loss; a later registration creates a new renderer. Failed initial WebGL acquisition remains cached as unavailable to avoid repeated unsupported-capability probes.
- GPU operations are test doubles. Actual shader output, native driver context-loss/restoration, CORS behavior and memory reclamation require real-browser/device checks.
- These are DOM/client behavior tests, not SSR-to-client hydration, event-replay or deferred/incremental-hydration proofs. Those roadmap Section 8.6 gates remain unverified here.
- No full-library test, production-package build, cross-browser accessibility pass or device performance trace was run as part of this scoped change.
