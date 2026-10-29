# Contributing

Thanks for helping. This file covers how the repo is set up and what a change needs before it is merged.

## Setup

You need Node 22.22.3 or later.

```sh
npm install
npm start
```

`npm install` also sets up the Git hooks. The pre-commit hook runs the linters and the commit-msg hook checks the message format.

## Where things live

- `projects/hyalo/src`: the primary entry point, `@hyalo/angular`. Only the foundations every component needs: config, fidelity, motion, material and shared helpers. It never imports another entry point.
- `projects/hyalo/<name>`: one secondary entry point per component or concern, such as `button` for `@hyalo/angular/button`, each with an `ng-package.json`, a `public-api.ts` and specs next to the code. Import other entry points by package path, never with `../`, or the build gets a second copy of them. ESLint checks this.
- `projects/hyalo/styles`: global CSS. Tokens, themes, glass, motion, and styles for anything that renders outside a component (overlays, projected slots).
- `projects/docs`: the documentation site. Each page is in `src/app/pages`.
- `tools`: small checks run by `npm run lint`.

## Rules for code

- Standalone components, `OnPush`, signal inputs and models. No `zone.js`.
- Nothing touches `window` or `document` outside `afterNextRender`, an effect that runs in the browser, or an explicit platform check. The docs site is prerendered, so a mistake here fails the build.
- CSS uses logical properties only. If a physical property is really needed, add `/* physical-ok */` on that line with a short reason. `npm run lint` checks this.
- Keep component styles in the component unless the element renders elsewhere, then use the global stylesheet in `styles/` inside the `hy.base` layer. Projected slot styles go in `hyalo-core.css`. Styles for something rendered in an overlay go in that entry point's file in `styles/overlays/`, which `hyalo.css` imports.
- Every new component needs a spec with an axe check, keyboard tests for anything interactive, and a docs page.

## Writing

Docs, comments and TSDoc should be short and plain. Explain why when it is not obvious, and skip comments that repeat the code. No em dashes and no emoji anywhere in the repo; `npm run lint` fails on both.

## Commits and pull requests

Commits follow [Conventional Commits](https://www.conventionalcommits.org): `feat(select): ...`, `fix(dialog): ...`, `docs: ...`. Keep one logical change per commit.

Before opening a pull request, run:

```sh
npm run lint
npm test
npm run build
```

Fill in the pull request template, and add a screenshot or short clip for visual changes, ideally in both light and dark, LTR and RTL.
