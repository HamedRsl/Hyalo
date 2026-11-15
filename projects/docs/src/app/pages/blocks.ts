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
  templateUrl: './blocks.html',
  styleUrl: './blocks.css',
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
