import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  HY_CARD,
  HyButton,
  HyFidelity,
  HyMagnetic,
  HyMotion,
  HyReveal,
  HyTilt,
} from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-motion',
  imports: [DocsPage, DocsExample, DocsApiTable, HY_CARD, HyButton, HyTilt, HyMagnetic, HyReveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page
      eyebrow="Start"
      heading="Motion and fidelity"
      lead="Shared timing, a few interaction directives, and a fidelity tier that decides how much effort a device gets."
    >
      <h2>Timing</h2>
      <p>
        Three presets cover almost everything. <code>settle</code> is the default for things moving
        into place. <code>pop</code> overshoots a little and is only for motion the user caused,
        like a switch they just flipped. <code>quick</code> is for acknowledgements such as a press.
        The same values exist as CSS tokens (<code>--hy-dur-settle</code>,
        <code>--hy-ease-out</code> and so on) and as the <code>MOTION</code> constant for GSAP.
      </p>

      <h2>Fidelity tiers</h2>
      <p>
        <code>HyFidelity</code> picks <code>high</code>, <code>medium</code> or
        <code>low</code> from device memory, CPU cores, pointer type, data saver and reduced motion.
        The server and the first client render always use medium, so hydration sees identical
        markup, and the real tier is set right after. This page is on
        <strong>{{ fidelity.tier() }}</strong> right now, and motion is
        <strong>{{ motion.reduced() ? 'reduced' : 'full' }}</strong
        >.
      </p>
      <ul>
        <li><strong>High</strong>: everything, including cursor physics.</li>
        <li><strong>Medium</strong>: tilt, magnetic hover and reveals.</li>
        <li>
          <strong>Low</strong>: CSS only. Glass is solid, cursor effects are off, the select is
          native.
        </li>
      </ul>

      <h2>Tilt and glow</h2>
      <p>
        Move the pointer over the cards. Listeners are attached outside change detection and only
        with a fine pointer.
      </p>
      <docs-example [code]="tiltCode">
        <div class="docs-grid">
          <hy-card hyTilt
            ><h3 hyCardHeader>Tilt</h3>
            <p>Default, 6 degrees.</p></hy-card
          >
          <hy-card hyTilt [tiltMax]="12" material="tinted"
            ><h3 hyCardHeader>Stronger</h3>
            <p>12 degrees, tinted.</p></hy-card
          >
        </div>
      </docs-example>

      <h2>Magnetic</h2>
      <docs-example [code]="magneticCode">
        <button hyButton size="lg" hyMagnetic>Pull me</button>
        <button hyButton size="lg" variant="glass" hyMagnetic [magneticStrength]="0.5">
          Stronger pull
        </button>
      </docs-example>

      <h2>Reveal on scroll</h2>
      <p>
        Content below the fold fades in when it scrolls into view. Nothing is hidden on the server,
        on screen at load, or with reduced motion, so there is no state where content waits on a
        script.
      </p>
      <docs-example [code]="revealCode">
        <div class="docs-grid">
          @for (n of [1, 2, 3, 4, 5, 6]; track n) {
            <hy-card hyReveal [revealDelay]="n * 70" [revealFrom]="n % 2 ? 'up' : 'scale'">
              <h3 hyCardHeader>Item {{ n }}</h3>
            </hy-card>
          }
        </div>
      </docs-example>

      <h2>Directives</h2>
      <docs-api-table [rows]="rows" />
    </docs-page>
  `,
})
export default class MotionPage {
  protected readonly fidelity = inject(HyFidelity);
  protected readonly motion = inject(HyMotion);

  protected readonly tiltCode = `<hy-card hyTilt>...</hy-card>
<hy-card hyTilt [tiltMax]="12" [tiltGlow]="false">...</hy-card>`;
  protected readonly magneticCode = `<button hyButton hyMagnetic>Pull me</button>
<button hyButton hyMagnetic [magneticStrength]="0.5" [magneticMax]="14">...</button>`;
  protected readonly revealCode = `@for (item of items; track item.id; let i = $index) {
  <hy-card hyReveal [revealDelay]="i * 70">...</hy-card>
}`;
  protected readonly rows: ApiRow[] = [
    {
      name: 'hyTilt',
      type: 'directive',
      description: 'Tilts toward the cursor and moves a glow. Inputs: tiltMax, tiltGlow.',
    },
    {
      name: 'hyMagnetic',
      type: 'directive',
      description: 'Pulls toward the cursor. Inputs: magneticStrength, magneticMax.',
    },
    {
      name: 'hyReveal',
      type: 'directive',
      description: 'Reveals on scroll. Inputs: revealDelay, revealFrom, revealRepeat.',
    },
    {
      name: 'hyRipple',
      type: 'directive',
      description: 'A light ripple from the press point. Built into hyButton.',
    },
    {
      name: 'hyInteractive',
      type: 'directive',
      description: 'Writes data-hover, data-press and data-focus-visible for CSS.',
    },
    {
      name: 'HyMotion',
      type: 'service',
      description: 'reduced(), enabled(), setReduced(), gsap().',
    },
    { name: 'HyFidelity', type: 'service', description: 'tier() and setTier().' },
  ];
}
