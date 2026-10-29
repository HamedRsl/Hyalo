# @hyalo/angular

Liquid glass components for Angular, built on Angular Aria and the CDK. Signal based, zoneless, server-render safe, accessible, and ready for RTL.

```sh
npm install @hyalo/angular @angular/cdk @angular/aria
```

Add the stylesheet before your own styles in `angular.json`:

```json
"styles": ["node_modules/@hyalo/angular/styles/hyalo.css", "src/styles.css"]
```

Then import the standalone components you need:

```ts
import { HY_CARD, HyButton } from '@hyalo/angular';
```

Configuration, theming, RTL, motion and the full component list are in the [repository README](https://github.com/HamedRsl/Hyalo#readme).

MIT licensed.
