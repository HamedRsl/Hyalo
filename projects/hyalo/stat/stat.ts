import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { HyMotion, HySpring } from '@hyalo/angular';
@Component({
  selector: 'hy-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat.html',
  styleUrl: './stat.css',
})
export class HyStat {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly trend = input('');
  readonly locale = input('en');
  readonly format = input<Intl.NumberFormatOptions>({ maximumFractionDigits: 0 });
  readonly animate = input(false, { transform: booleanAttribute });
  readonly prefix = input('');
  readonly suffix = input('');
  private readonly motion = inject(HyMotion);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly visible = signal(false);
  private readonly live = signal<number | null>(null);
  private readonly target = computed(() => (Number.isFinite(this.value()) ? this.value() : 0));
  private readonly formatter = computed(() => new Intl.NumberFormat(this.locale(), this.format()));
  readonly formatted = computed(
    () => this.prefix() + this.formatter().format(this.live() ?? this.target()) + this.suffix(),
  );
  readonly accessible = computed(
    () => this.prefix() + this.formatter().format(this.target()) + this.suffix(),
  );
  constructor() {
    let spring: HySpring | undefined, observer: IntersectionObserver | undefined;
    afterNextRender(() => {
      const activeSpring = new HySpring(this.target(), (v) => this.live.set(v));
      spring = activeSpring;
      if (typeof IntersectionObserver === 'undefined') this.visible.set(true);
      else {
        observer = new IntersectionObserver((entries) =>
          this.visible.set(entries.some((e) => e.isIntersecting)),
        );
        observer.observe(this.host.nativeElement);
      }
      effect(
        () => {
          const value = this.target(),
            enabled = this.animate() && this.motion.enabled() && this.visible();
          untracked(() => {
            if (enabled) activeSpring.to(value);
            else activeSpring.set(value);
          });
        },
        { injector: this.injector },
      );
    });
    inject(DestroyRef).onDestroy(() => {
      spring?.stop();
      observer?.disconnect();
    });
  }
}
