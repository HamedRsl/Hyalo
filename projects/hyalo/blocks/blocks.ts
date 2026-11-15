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
  templateUrl: './hero-block.html',
  styleUrl: './hero-block.css',
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
  templateUrl: './pricing-block.html',
  styleUrl: './pricing-block.css',
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
  templateUrl: './feature-block.html',
  styleUrl: './feature-block.css',
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
  templateUrl: './testimonials-block.html',
  styleUrl: './testimonials-block.css',
})
export class HyTestimonialsBlock {
  readonly heading = input('Trusted by thoughtful teams');
  readonly items = input.required<readonly HyTestimonial[]>();
}
@Component({
  selector: 'hy-product-block',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-block.html',
  styleUrl: './product-block.css',
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
  templateUrl: './dashboard-block.html',
  styleUrl: './dashboard-block.css',
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
  templateUrl: './kpi-strip-block.html',
  styleUrl: './kpi-strip-block.css',
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
  templateUrl: './activity-block.html',
  styleUrl: './activity-block.css',
})
export class HyActivityBlock {
  readonly heading = input('Recent activity');
  readonly items = input.required<readonly HyActivity[]>();
}
@Component({
  selector: 'hy-filter-toolbar-block',
  imports: [HyFilterBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-toolbar-block.html',
})
export class HyFilterToolbarBlock<C extends HyFilterToken> {
  readonly fields = input.required<readonly HyFilterField<C>[]>();
  readonly clauses = model<readonly C[]>([]);
  readonly label = input('Filter results');
}
