import { booleanAttribute, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
export interface HyTickerValueContext {
  readonly $implicit: number;
  readonly formatted: string;
}
import { HyLocale } from '@hyalo/angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { HyMotion, HySpring, injectHyVisibility } from '@hyalo/angular/motion';
@Component({
  selector: 'hy-number-ticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { '[attr.aria-busy]': 'loading() || null' },
  templateUrl: './number-ticker.html',
  styleUrl: './number-ticker.css',
})
export class HyNumberTicker {
  readonly value = input.required<number>();
  readonly locale = input<string>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingLabel = input('Loading');
  readonly valueTemplate = input<TemplateRef<HyTickerValueContext>>();
  readonly loadingTemplate = input<TemplateRef<unknown>>();
  private readonly globalLocale = inject(HyLocale);
  private readonly effectiveLocale = computed(() => this.locale() ?? this.globalLocale.locale());
  readonly format = input<Intl.NumberFormatOptions>({ maximumFractionDigits: 0 });
  readonly animate = input(false, { transform: booleanAttribute });
  readonly prefix = input('');
  readonly suffix = input('');
  private readonly target = computed(() => (Number.isFinite(this.value()) ? this.value() : 0));
  private readonly live = signal<number | null>(null);
  private readonly formatter = computed(
    () => new Intl.NumberFormat(this.effectiveLocale(), this.format()),
  );
  readonly formatted = computed(
    () => this.prefix() + this.formatter().format(this.live() ?? this.target()) + this.suffix(),
  );
  readonly accessible = computed(
    () => this.prefix() + this.formatter().format(this.target()) + this.suffix(),
  );
  private readonly motion = inject(HyMotion);
  private readonly visible = injectHyVisibility();
  constructor() {
    const injector = inject(Injector),
      destroy = inject(DestroyRef);
    let spring: HySpring | undefined;
    afterNextRender(() => {
      const active = (spring = new HySpring(this.target(), (value) => this.live.set(value)));
      effect(
        () => {
          const target = this.target(),
            enabled = this.animate() && this.visible() && this.motion.enabled();
          untracked(() => {
            if (enabled) active.to(target);
            else active.set(target);
          });
        },
        { injector },
      );
    });
    destroy.onDestroy(() => spring?.stop());
  }
}
