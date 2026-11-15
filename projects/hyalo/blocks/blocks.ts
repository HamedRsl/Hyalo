import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyCard } from '@hyalo/angular/card';
import { HyNumberTicker } from '@hyalo/angular/number-ticker';
import { HyStat } from '@hyalo/angular/stat';
import { HyFilterBar, type HyFilterField, type HyFilterToken } from '@hyalo/angular/filter';

@Component({
  selector: 'hy-hero-block',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <div>
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h2>{{ heading() }}</h2>
      <p>{{ description() }}</p>
      <div class="actions">
        @if (actionHref()) {
          <a hyButton [href]="actionHref()">{{ actionLabel() }}</a>
        }
        <ng-content select="[hyBlockActions]" />
      </div>
    </div>
    <div class="stage"><ng-content select="[hyBlockMedia]" /></div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    section {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: center;
      gap: clamp(1.5rem, 5vw, 5rem);
      padding-block: clamp(2rem, 6vw, 6rem);
    }
    h2 {
      font-size: clamp(2rem, 5vw, 4rem);
      line-height: 1.1;
      margin: 0.5rem 0;
      max-inline-size: 16ch;
    }
    p {
      line-height: 1.7;
      color: var(--hy-ink-2);
    }
    .eyebrow {
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .stage {
      min-inline-size: 0;
    }
    @media (max-width: 48rem) {
      section {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HyHeroBlock {
  readonly eyebrow = input('');
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly actionHref = input('');
  readonly actionLabel = input('Get started');
}
export interface HyPricingPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly monthly: number;
  readonly annual: number;
  readonly features: readonly string[];
  readonly href: string;
  readonly featured?: boolean;
}
@Component({
  selector: 'hy-pricing-block',
  imports: [HyCard, HyButton, HyNumberTicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <h2>{{ heading() }}</h2>
    <div class="billing" role="group" [attr.aria-label]="billingLabel()">
      <button
        type="button"
        [attr.aria-pressed]="billing() === 'monthly'"
        (click)="billing.set('monthly')"
      >
        {{ monthlyLabel() }}</button
      ><button
        type="button"
        [attr.aria-pressed]="billing() === 'annual'"
        (click)="billing.set('annual')"
      >
        {{ annualLabel() }}
      </button>
    </div>
    <div class="plans">
      @for (plan of plans(); track plan.id) {
        <hy-card material="tinted" [class.featured]="plan.featured"
          ><h3>{{ plan.name }}</h3>
          <p>{{ plan.description }}</p>
          <strong
            ><hy-number-ticker
              [value]="billing() === 'monthly' ? plan.monthly : plan.annual"
              [locale]="locale()"
              [format]="currencyFormat()"
          /></strong>
          <p>{{ billing() === 'monthly' ? monthlyLabel() : annualLabel() }}</p>
          <ul>
            @for (feature of plan.features; track feature) {
              <li>{{ feature }}</li>
            }
          </ul>
          <a hyButton [href]="plan.href">{{ actionLabel() }} {{ plan.name }}</a></hy-card
        >
      }
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    h2 {
      font-size: clamp(1.5rem, 3vw, 2.5rem);
    }
    .billing {
      display: flex;
      gap: 0.5rem;
      margin-block: 1rem;
    }
    .plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: 1rem;
    }
    hy-card {
      padding: 1.5rem;
    }
    .featured {
      outline: 2px solid var(--hy-primary);
    }
    strong {
      font-size: 2rem;
    }
    p,
    li {
      color: var(--hy-ink-2);
      line-height: 1.7;
    }
    button {
      min-block-size: 44px;
      font: inherit;
      background: var(--hy-surface-1);
      color: var(--hy-ink);
      border: 1px solid var(--hy-line);
      border-radius: var(--hy-radius-s);
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
    button[aria-pressed='true'] {
      background: var(--hy-primary-wash);
    }
    button:focus-visible {
      outline: 2px solid var(--hy-primary);
      outline-offset: 2px;
    }
  `,
})
export class HyPricingBlock {
  readonly heading = input('Plans for your next chapter');
  readonly plans = input.required<readonly HyPricingPlan[]>();
  readonly billing = model<'monthly' | 'annual'>('monthly');
  readonly locale = input<string>();
  readonly currencyFormat = input<Intl.NumberFormatOptions>({
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  readonly monthlyLabel = input('Monthly');
  readonly annualLabel = input('Annual');
  readonly billingLabel = input('Billing period');
  readonly actionLabel = input('Choose');
}
export interface HyFeature {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}
@Component({
  selector: 'hy-feature-block',
  imports: [HyCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <h2>{{ heading() }}</h2>
    <div class="grid">
      @for (feature of features(); track feature.id) {
        <hy-card material="tinted"
          ><h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p></hy-card
        >
      }
      <ng-content />
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }
    hy-card {
      padding: 1.5rem;
    }
    hy-card:first-child {
      grid-column: span 2;
    }
    p {
      line-height: 1.7;
      color: var(--hy-ink-2);
    }
    @media (max-width: 40rem) {
      .grid {
        grid-template-columns: 1fr;
      }
      hy-card:first-child {
        grid-column: auto;
      }
    }
  `,
})
export class HyFeatureBlock {
  readonly heading = input('Built for the way you work');
  readonly features = input.required<readonly HyFeature[]>();
}
export interface HyTestimonial {
  readonly id: string;
  readonly quote: string;
  readonly author: string;
  readonly role: string;
}
@Component({
  selector: 'hy-testimonials-block',
  imports: [HyCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <h2>{{ heading() }}</h2>
    <div class="wall">
      @for (item of items(); track item.id) {
        <hy-card material="tinted"
          ><figure>
            <blockquote>{{ item.quote }}</blockquote>
            <figcaption>
              <strong>{{ item.author }}</strong
              ><span>{{ item.role }}</span>
            </figcaption>
          </figure></hy-card
        >
      }
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .wall {
      columns: 18rem;
      column-gap: 1rem;
    }
    hy-card {
      display: block;
      break-inside: avoid;
      margin-block-end: 1rem;
      padding: 1.5rem;
    }
    figure,
    blockquote {
      margin: 0;
    }
    blockquote {
      line-height: 1.8;
    }
    figcaption {
      display: grid;
      gap: 0.25rem;
      margin-block-start: 1.5rem;
    }
    span {
      font-size: 0.875rem;
      color: var(--hy-ink-2);
    }
  `,
})
export class HyTestimonialsBlock {
  readonly heading = input('Trusted by thoughtful teams');
  readonly items = input.required<readonly HyTestimonial[]>();
}
@Component({
  selector: 'hy-product-block',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <div class="media"><ng-content select="[hyBlockMedia]" /></div>
    <div>
      <p>{{ category() }}</p>
      <h2>{{ heading() }}</h2>
      <p>{{ description() }}</p>
      <strong>{{ price() }}</strong>
      <div class="choices"><ng-content select="[hyBlockOptions]" /></div>
      <a hyButton [href]="actionHref()">{{ actionLabel() }}</a
      ><ng-content />
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    section {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: center;
      gap: 2rem;
    }
    .media {
      min-inline-size: 0;
    }
    h2 {
      font-size: clamp(1.75rem, 4vw, 3rem);
    }
    p {
      color: var(--hy-ink-2);
      line-height: 1.8;
    }
    .choices {
      margin-block: 1.5rem;
    }
    strong {
      font-size: 1.5rem;
    }
    @media (max-width: 48rem) {
      section {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HyProductBlock {
  readonly category = input('');
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly price = input.required<string>();
  readonly actionHref = input.required<string>();
  readonly actionLabel = input('View product');
}
@Component({
  selector: 'hy-dashboard-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="shell">
    <aside><ng-content select="[hyBlockSidebar]" /></aside>
    <div class="main">
      <header><ng-content select="[hyBlockToolbar]" /></header>
      <ng-content />
    </div>
  </div>`,
  styles: `
    :host {
      display: block;
    }
    .shell {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 1.5rem;
    }
    .main {
      min-inline-size: 0;
    }
    header {
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      background: var(--hy-surface-1);
      padding-block: 0.75rem;
    }
    @media (max-width: 40rem) {
      .shell {
        grid-template-columns: 1fr;
      }
      aside {
        overflow: auto;
      }
    }
  `,
})
export class HyDashboardBlock {}
export interface HyKpi {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly trend?: string;
  readonly prefix?: string;
  readonly suffix?: string;
}
@Component({
  selector: 'hy-kpi-strip-block',
  imports: [HyStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="strip">
    @for (item of items(); track item.id) {
      <hy-stat
        [label]="item.label"
        [value]="item.value"
        [trend]="item.trend ?? ''"
        [prefix]="item.prefix ?? ''"
        [suffix]="item.suffix ?? ''"
        [locale]="locale()"
      />
    }
  </div>`,
  styles: `
    :host {
      display: block;
    }
    .strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
      gap: 1rem;
    }
  `,
})
export class HyKpiStripBlock {
  readonly items = input.required<readonly HyKpi[]>();
  readonly locale = input<string>();
}
export interface HyActivity {
  readonly id: string;
  readonly heading: string;
  readonly description: string;
  readonly time: string;
  readonly dateTime: string;
}
@Component({
  selector: 'hy-activity-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section>
    <h2>{{ heading() }}</h2>
    <ol>
      @for (item of items(); track item.id) {
        <li>
          <div>
            <strong>{{ item.heading }}</strong>
            <p>{{ item.description }}</p>
          </div>
          <time [attr.datetime]="item.dateTime">{{ item.time }}</time>
        </li>
      }
    </ol>
    <ng-content />
  </section>`,
  styles: `
    :host {
      display: block;
    }
    ol {
      list-style: none;
      padding: 0;
    }
    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding-block: 1rem;
      border-block-end: 1px solid var(--hy-line);
    }
    p,
    time {
      color: var(--hy-ink-2);
      font-size: 0.875rem;
    }
    p {
      margin-block: 0.5rem 0;
    }
    time {
      white-space: nowrap;
    }
  `,
})
export class HyActivityBlock {
  readonly heading = input('Recent activity');
  readonly items = input.required<readonly HyActivity[]>();
}
@Component({
  selector: 'hy-filter-toolbar-block',
  imports: [HyFilterBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<hy-filter-bar
    [fields]="fields()"
    [clauses]="clauses()"
    (clausesChange)="clauses.set($event)"
    [label]="label()"
    ><ng-content
  /></hy-filter-bar>`,
})
export class HyFilterToolbarBlock<C extends HyFilterToken> {
  readonly fields = input.required<readonly HyFilterField<C>[]>();
  readonly clauses = model<readonly C[]>([]);
  readonly label = input('Filter results');
}
