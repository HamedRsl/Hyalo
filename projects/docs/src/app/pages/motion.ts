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
  templateUrl: './motion.html',
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
      description: 'An optional light ripple from the press point. Input: rippleDisabled.',
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
