<p align="center">
  <img src="https://raw.githubusercontent.com/HamedRsl/Hyalo/main/.github/assets/hyalo-logo.jpg" alt="Hyalo, Angular UI kit" width="240" />
</p>

# @hyalo/angular

Liquid glass components for Angular, built on Angular Aria and the CDK. Signal based, zoneless, server-render safe, accessible, and ready for RTL.

```sh
npm install @hyalo/angular @angular/cdk @angular/aria
```

Add the stylesheet before your own styles in `angular.json`:

```json
"styles": ["node_modules/@hyalo/angular/styles/hyalo.css", "src/styles.css"]
```

Then import the standalone components you need. Each one has its own entry point, so a lazy route only loads what it uses:

```ts
import { HyButton } from '@hyalo/angular/button';
import { HY_CARD } from '@hyalo/angular/card';
```

`@hyalo/angular` itself holds the shared foundations, such as `provideHyalo()`, `HyFidelity` and `HyMotion`.

Configuration, theming, RTL, motion and the full component list are in the [repository README](https://github.com/HamedRsl/Hyalo#readme).

MIT licensed.
