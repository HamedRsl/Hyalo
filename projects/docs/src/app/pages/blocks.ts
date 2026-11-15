import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  HyHeroBlock,
  HyPricingBlock,
  HyFeatureBlock,
  HyTestimonialsBlock,
  HyProductBlock,
  HyKpiStripBlock,
  HyActivityBlock,
} from '@hyalo/angular/blocks';
import { HyCodeBlock } from '@hyalo/angular/code-block';
import { DocsPage } from '../shared/page';
@Component({
  selector: 'docs-blocks',
  imports: [
    DocsPage,
    HyHeroBlock,
    HyPricingBlock,
    HyFeatureBlock,
    HyTestimonialsBlock,
    HyProductBlock,
    HyKpiStripBlock,
    HyActivityBlock,
    HyCodeBlock,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<docs-page
    eyebrow="Composable sections"
    heading="Blocks that belong to your page"
    lead="Responsive marketing and app sections built on public Hyalo primitives. Applications own data, actions and backend integrations."
  >
    <hy-hero-block
      eyebrow="Atelier"
      heading="Make room for thoughtful work"
      description="A complete hero without a required animation engine."
      actionHref="/dashboard"
      actionLabel="Explore the dashboard"
      ><div hyBlockMedia class="stage">
        Your media, refraction surface or interactive stage
      </div></hy-hero-block
    >
    <hy-feature-block [features]="features" />
    <hy-pricing-block [plans]="plans" />
    <hy-testimonials-block [items]="testimonials" />
    <hy-product-block
      category="Objects of intention"
      heading="A considered edition"
      description="Supply your own gallery, variants and commerce actions."
      price="$240"
      actionHref="/components/lightbox"
      actionLabel="Explore the gallery"
      ><div hyBlockMedia class="stage">Product media slot</div></hy-product-block
    >
    <h2>Dashboard compositions</h2>
    <hy-kpi-strip-block [items]="kpis" /><hy-activity-block [items]="activities" />
    <p>
      HyDashboardBlock projects a sidebar, toolbar and main content. HyFilterToolbarBlock preserves
      the same typed filter state as HyFilterBar. The dashboard demo shows the complete composition.
    </p>
    <hy-code-block [code]="source" language="html" />
  </docs-page>`,
  styles: `
    :host {
      display: block;
    }
    hy-pricing-block,
    hy-feature-block,
    hy-testimonials-block,
    hy-product-block,
    hy-activity-block {
      display: block;
      margin-block: 3rem;
    }
    .stage {
      display: grid;
      place-content: center;
      min-block-size: 18rem;
      border-radius: var(--hy-radius-l);
      background: linear-gradient(135deg, var(--hy-primary-wash), var(--hy-surface-2));
      color: var(--hy-ink-2);
      padding: 2rem;
      text-align: center;
    }
  `,
})
export default class BlocksPage {
  protected readonly features = [
    {
      id: 'tokens',
      title: 'A shared visual language',
      description: 'Themes and materials use the same tokens.',
    },
    {
      id: 'access',
      title: 'Designed for access',
      description: 'Keyboard behavior belongs to the primitives.',
    },
    {
      id: 'scope',
      title: 'Load what you use',
      description: 'Optional engines stay behind explicit boundaries.',
    },
  ];
  protected readonly plans = [
    {
      id: 'studio',
      name: 'Studio',
      description: 'For a small team',
      monthly: 24,
      annual: 240,
      features: ['Core components', 'Shared themes'],
      href: '/components',
    },
    {
      id: 'team',
      name: 'Team',
      description: 'For connected workflows',
      monthly: 48,
      annual: 480,
      features: ['Core components', 'Dashboard compositions', 'Shared themes'],
      href: '/dashboard',
      featured: true,
    },
  ];
  protected readonly testimonials = [
    {
      id: 'one',
      quote: 'The components fit together without taking over the page.',
      author: 'Mina Rahimi',
      role: 'Sample testimonial',
    },
    {
      id: 'two',
      quote: 'A clear starting point for our next product.',
      author: 'Arman Nouri',
      role: 'Sample testimonial',
    },
  ];
  protected readonly kpis = [
    { id: 'revenue', label: 'Revenue', value: 48250, prefix: '$', trend: 'Up 12.8%' },
    { id: 'projects', label: 'Active projects', value: 4 },
    { id: 'capacity', label: 'Capacity', value: 72, suffix: '%' },
  ];
  protected readonly activities = [
    {
      id: 'one',
      heading: 'Project updated',
      description: 'Mina shared a new brief.',
      time: 'Sample event',
      dateTime: '2026-11-15T09:00:00Z',
    },
    {
      id: 'two',
      heading: 'Review completed',
      description: 'Arman approved the layout.',
      time: 'Sample event',
      dateTime: '2026-11-15T08:00:00Z',
    },
  ];
  protected readonly source =
    '<hy-hero-block heading="Your next chapter" description="Your copy" actionHref="/start">\n  <div hyBlockMedia>Your media</div>\n</hy-hero-block>';
}
