import { Directive, HostAttributeToken, computed, inject, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { injectId } from '@hyalo/angular';

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
export class HyInput implements HyFieldControl {
  protected readonly field = inject(HY_FIELD, { optional: true });
  private readonly formField = inject(FormField, { self: true, optional: true });

  readonly labelable = true;
  /** The element's own static `id` attribute, or a generated one. */
  readonly id = signal(
    inject(new HostAttributeToken('id'), { optional: true }) ?? injectId('input'),
  ).asReadonly();

  readonly invalid = computed(() => {
    const state = this.formField?.state();
    return !!state && state.invalid() && state.touched();
  });

  readonly errorMessage = computed(() => {
    const errors = this.formField?.state().errors() ?? [];
    const first = errors[0];
    return first ? (first.message ?? first.kind) : undefined;
  });

  protected readonly showsError = computed(() =>
    this.field ? this.field.errorShown() : this.invalid(),
  );

  readonly required = computed(() => this.formField?.state().required() ?? false);
  readonly disabled = computed(() => this.formField?.state().disabled() ?? false);

  constructor() {
    this.field?.register(this);
  }
}
