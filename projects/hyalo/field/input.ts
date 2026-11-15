import type { Subscription } from 'rxjs';
import { NgControl, Validators, type AbstractControl } from '@angular/forms';
import {
  Directive,
  HostAttributeToken,
  DestroyRef,
  DoCheck,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FORM_FIELD } from '@angular/forms/signals';
import { injectId } from '@hyalo/angular/core';

import { HY_FIELD, type HyFieldControl } from './field-control';

/**
 * Marks a native `<input>` or `<textarea>` as the control of a `hy-field`.
 * It wires the label, hint and error ids, and reads validity from Signal
 * Forms when `[formField]` is on the same element.
 *
 * The element stays native, so Signal Forms, `ngModel`, autofill and
 * mobile keyboards all work as usual.
 */
@Directive({
  selector: 'input[hyInput], textarea[hyInput]',
  host: {
    class: 'hy-input',
    '[id]': 'id()',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
    '[attr.aria-invalid]': 'showsError() || null',
  },
})
export class HyInput implements HyFieldControl, DoCheck {
  protected readonly field = inject(HY_FIELD, { optional: true });
  // The token, not the FormField class, so apps without forms do not bundle them.
  private readonly formField = inject(FORM_FIELD, { self: true, optional: true });

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroy = inject(DestroyRef);
  private readonly revision = signal(0);
  private control: AbstractControl | null | undefined;
  private subscription?: Subscription;
  constructor() {
    this.field?.register(this);
    this.destroy.onDestroy(() => this.subscription?.unsubscribe());
  }
  ngDoCheck(): void {
    const control = this.ngControl?.control;
    if (control === this.control) return;
    this.subscription?.unsubscribe();
    this.control = control;
    this.subscription = control?.events.subscribe(() => this.revision.update((value) => value + 1));
    this.revision.update((value) => value + 1);
  }
  readonly labelable = true;
  /** The element's own static `id` attribute, or a generated one. */
  readonly id = signal(
    inject(new HostAttributeToken('id'), { optional: true }) ?? injectId('input'),
  ).asReadonly();

  readonly invalid = computed(() => {
    this.revision();
    const state = this.formField?.state(),
      control = this.ngControl?.control;
    return state ? state.invalid() && state.touched() : !!control?.invalid && control.touched;
  });

  readonly errorMessage = computed(() => {
    this.revision();
    const control = this.ngControl?.control;
    if (!this.formField && control?.errors) {
      const first = Object.keys(control.errors)[0];
      const detail: unknown = first ? control.errors[first] : undefined;
      return typeof detail === 'object' &&
        detail !== null &&
        'message' in detail &&
        typeof detail.message === 'string'
        ? detail.message
        : first;
    }
    const errors = this.formField?.state().errors() ?? [];
    const first = errors[0];
    return first ? (first.message ?? first.kind) : undefined;
  });

  protected readonly showsError = computed(() =>
    this.field ? this.field.errorShown() : this.invalid(),
  );

  readonly required = computed(() => {
    this.revision();
    return (
      this.formField?.state().required() ??
      this.ngControl?.control?.hasValidator(Validators.required) ??
      false
    );
  });
  readonly disabled = computed(() => {
    this.revision();
    return this.formField?.state().disabled() ?? this.ngControl?.control?.disabled ?? false;
  });
}
