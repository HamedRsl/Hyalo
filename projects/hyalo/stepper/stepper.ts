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
  Directive,
  TemplateRef,
  contentChild,
  effect,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { injectId } from '@hyalo/angular/core';

export interface HyStepControl {
  readonly valid: boolean;
  readonly pending?: boolean;
  /** Classic Angular controls emit when validity changes without replacing the control. */
  readonly statusChanges?: { subscribe(next: () => void): { unsubscribe(): void } };
  reset?(): void;
}
@Directive({ selector: 'ng-template[hyStepContent]' })
export class HyStepContent { readonly template = inject(TemplateRef<unknown>); }
@Directive({ selector: 'ng-template[hyStepLabel]' })
export class HyStepLabel { readonly template = inject(TemplateRef<unknown>); }
@Directive({ selector: 'ng-template[hyStepIndicator]' })
export class HyStepIndicator { readonly template = inject(TemplateRef<unknown>); }

@Component({
  selector: 'hy-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: '<ng-content />@if (created()) { <ng-container [ngTemplateOutlet]="lazy()?.template ?? null" /> }',
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
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly control = input<HyStepControl>();
  /** Overrides control validity for optional or externally validated steps. */
  readonly completionOverride = input<boolean>();
  readonly destroyOnHide = input(false, { transform: booleanAttribute });
  readonly error = input('');
  readonly subtitle = input('');
  readonly icon = input('');
  readonly process = input(false, { transform: booleanAttribute });
  readonly resetRequested = output<void>();
  readonly labelTemplate = contentChild(HyStepLabel);
  readonly indicatorTemplate = contentChild(HyStepIndicator);
  protected readonly lazy = contentChild(HyStepContent);
  protected readonly created = signal(false);
  private readonly controlRevision = signal(0);
  readonly isComplete = computed(() => {
    this.controlRevision();
    const control = this.control();
    return this.completionOverride() ?? (control ? control.valid && !control.pending : this.completed());
  });
  readonly id = injectId('step');
  protected readonly active = computed(
    () => this.stepper.steps()[this.stepper.activeIndex()] === this,
  );
  constructor() {
    effect((onCleanup) => {
      const control = this.control();
      this.controlRevision.update((revision) => revision + 1);
      const subscription = control?.statusChanges?.subscribe(() =>
        this.controlRevision.update((revision) => revision + 1),
      );
      onCleanup(() => subscription?.unsubscribe());
    });
    effect(() => {
      if (this.active()) this.created.set(true);
      else if (this.destroyOnHide()) this.created.set(false);
    });
  }
  reset(): void { this.control()?.reset?.(); this.resetRequested.emit(); }
}

/** Linear steps require each preceding step to be completed before advancing. */
@Component({
  selector: 'hy-stepper',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
  host: { '[attr.data-orientation]': 'orientation()' },
})
export class HyStepper {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  readonly label = input('Steps');
  readonly linear = input(true, { transform: booleanAttribute });
  readonly selected = model(0);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly headerNavigation = input(true, { transform: booleanAttribute });
  readonly progress = input<'number' | 'dot'>('number');
  readonly selectionChange = output<{ previous: number; current: number }>();
  readonly transitionComplete = output<number>();
  readonly steps = contentChildren(HyStep);
  protected readonly available = computed(() =>
    this.steps().map(
      (step, i, steps) =>
        !step.disabled() && !step.hidden() &&
        (!this.linear() || steps.slice(0, i).every((previous) => previous.hidden() || previous.isComplete())),
    ),
  );
  readonly activeIndex = computed(() => {
    const requested = Math.trunc(this.selected());
    if (this.available()[requested]) return requested;
    return this.available().findIndex(Boolean);
  });

  select(index: number): void {
    if (!this.available()[index]) return;
    const previous = this.activeIndex();
    if (previous === index) return;
    this.selected.set(index);
    this.selectionChange.emit({ previous, current: index });
    afterNextRender(
      () => {
        this.el.querySelector<HTMLButtonElement>(`nav button[data-step="${index}"]`)?.focus();
        this.transitionComplete.emit(index);
      },
      { injector: this.injector },
    );
  }
  next(): void {
    this.select(this.activeIndex() + 1);
  }
  previous(): void {
    this.select(this.activeIndex() - 1);
  }
  reset(): void {
    for (const step of this.steps()) step.reset();
    this.selected.set(0);
  }

  protected onKey(event: KeyboardEvent, index: number): void {
    const rtl = this.el.ownerDocument.defaultView?.getComputedStyle(this.el).direction === 'rtl';
    let delta = 0;
    if (this.orientation() === 'vertical' && event.key === 'ArrowDown') delta = 1;
    else if (this.orientation() === 'vertical' && event.key === 'ArrowUp') delta = -1;
    else if (event.key === 'ArrowRight') delta = rtl ? -1 : 1;
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
      this.el.querySelector<HTMLButtonElement>(`nav button[data-step="${target}"]`)?.focus();
  }
}
export const HY_STEPPER = [HyStepper, HyStep, HyStepContent, HyStepLabel, HyStepIndicator] as const;
