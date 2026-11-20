import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
  signal,
  computed,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { injectId } from '@hyalo/angular/core';

import { HyIcon } from '@hyalo/angular/icon';

/**
 * A checkbox with a label. It wraps a real `<input type="checkbox">`, so
 * Space toggles it, clicking the label works and forms see it.
 *
 * ```html
 * <hy-checkbox [formField]="form.terms">I accept the terms</hy-checkbox>
 * <hy-checkbox [(checked)]="all" [indeterminate]="some">Select all</hy-checkbox>
 * ```
 */
@Component({
  selector: 'hy-checkbox',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-choice hy-checkbox',
    '[attr.data-checked]': 'checked() || null',
    '[attr.data-indeterminate]': 'indeterminate() || null',
    '[attr.data-disabled]': 'disabled() || null',
    '[attr.data-invalid]': '(invalid() && touched()) || null',
    '[attr.data-label-position]': 'labelPosition()',
  },
  templateUrl: './checkbox.html',
  styleUrl: './choice.css',
})
export class HyCheckbox implements FormCheckboxControl {
  protected readonly descriptionId = injectId('checkbox-desc');

  /** Whether the box is checked. Two-way bindable and works with `[formField]`. */
  readonly checked = model(false);
  /** Shows a dash for a partly selected group. Cleared when the user toggles. */
  readonly indeterminate = model(false);
  /** Secondary text under the label. */
  readonly description = input<string>();
  readonly name = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly formDisabled = signal(false);
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabledFocusable = input(false, { transform: booleanAttribute });
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly clickAction = input<'check-indeterminate' | 'check' | 'noop'>('check-indeterminate');
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  /** Emits when focus leaves the checkbox. */
  readonly touch = output<void>();

  protected onChange(event: Event): void {
    if (this.effectiveDisabled() || this.readonly() || this.clickAction() === 'noop') {
      (event.target as HTMLInputElement).checked = this.checked();
      return;
    }
    if (this.clickAction() === 'check-indeterminate') this.indeterminate.set(false);
    this.checked.set((event.target as HTMLInputElement).checked);
  }
  protected guard(event: MouseEvent): void {
    if (this.effectiveDisabled() || this.readonly() || this.clickAction() === 'noop') event.preventDefault();
  }
}
