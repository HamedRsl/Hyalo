import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { injectId } from '@hyalo/angular/core';

@Component({
  selector: 'hy-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    role: 'group',
    '[id]': 'id + "-panel"',
    '[attr.aria-labelledby]': 'id',
    '[hidden]': '!active()',
    '[attr.inert]': 'active() ? null : ""',
  },
})
export class HyStep {
  private readonly stepper = inject(HyStepper);
  readonly label = input.required<string>();
  readonly completed = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = injectId('step');
  protected readonly active = computed(
    () => this.stepper.steps()[this.stepper.activeIndex()] === this,
  );
}

/** Linear steps require each preceding step to be completed before advancing. */
@Component({
  selector: 'hy-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class HyStepper {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  readonly label = input('Steps');
  readonly linear = input(true, { transform: booleanAttribute });
  readonly selected = model(0);
  readonly steps = contentChildren(HyStep);
  protected readonly available = computed(() =>
    this.steps().map(
      (step, i, steps) =>
        !step.disabled() &&
        (!this.linear() || steps.slice(0, i).every((previous) => previous.completed())),
    ),
  );
  readonly activeIndex = computed(() => {
    const requested = Math.trunc(this.selected());
    if (this.available()[requested]) return requested;
    return this.available().findIndex(Boolean);
  });

  select(index: number): void {
    if (!this.available()[index]) return;
    this.selected.set(index);
    afterNextRender(
      () => this.el.querySelectorAll<HTMLButtonElement>('nav button')[this.activeIndex()]?.focus(),
      { injector: this.injector },
    );
  }
  next(): void {
    this.select(this.activeIndex() + 1);
  }
  previous(): void {
    this.select(this.activeIndex() - 1);
  }

  protected onKey(event: KeyboardEvent, index: number): void {
    const rtl = this.el.ownerDocument.defaultView?.getComputedStyle(this.el).direction === 'rtl';
    let delta = 0;
    if (event.key === 'ArrowRight') delta = rtl ? -1 : 1;
    else if (event.key === 'ArrowLeft') delta = rtl ? 1 : -1;
    else if (event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const indices = this.available().flatMap((enabled, i) => (enabled ? [i] : []));
    const target =
      event.key === 'Home'
        ? indices[0]
        : event.key === 'End'
          ? indices.at(-1)
          : indices[indices.indexOf(index) + delta];
    if (target !== undefined)
      this.el.querySelectorAll<HTMLButtonElement>('nav button')[target]?.focus();
  }
}
export const HY_STEPPER = [HyStepper, HyStep] as const;
