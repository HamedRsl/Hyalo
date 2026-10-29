import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HY_CARD, HyButton, HyIcon, HyReveal, HyTilt } from '@hyalo/angular';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-home',
  imports: [DocsPage, RouterLink, HyButton, HyIcon, HY_CARD, HyTilt, HyReveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class HomePage {
  protected readonly features = [
    {
      title: 'Glass as a material',
      body: 'One material input on every surface: clear, frosted, tinted or solid. It turns solid by itself when blur would hurt.',
    },
    {
      title: 'Accessible behaviour',
      body: 'Tabs, select and accordion run on Angular Aria. Dialogs, drawers and popovers use the CDK focus tools.',
    },
    {
      title: 'Motion with manners',
      body: 'Shared timing tokens, GSAP only if you want it, and nothing that ignores reduced motion.',
    },
    {
      title: 'Ready for RTL',
      body: 'Logical properties everywhere, start and end placements, and icons that know when to mirror.',
    },
  ];

  protected readonly usage = `import { HyButton, HY_CARD } from '@hyalo/angular';

@Component({
  imports: [HyButton, HY_CARD],
  template: \`
    <hy-card>
      <h3 hyCardHeader>Calibre 7</h3>
      <p>Hand-wound, 42 mm.</p>
      <div hyCardFooter><button hyButton>Reserve</button></div>
    </hy-card>
  \`,
})
export class Product {}`;

  protected readonly config = `// app.config.ts
providers: [
  provideHyalo({
    material: 'frosted',
    gsap: () => import('gsap').then((m) => m.gsap),
  }),
]`;
}
