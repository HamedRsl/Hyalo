import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { injectId } from '../core/ids';

/**
 * An on/off switch for settings that apply right away. For choices that
 * are submitted with a form, a checkbox is usually clearer.
 *
 * It is a native checkbox with `role="switch"`, so screen readers say
 * "on" and "off" and Space toggles it.
 *
 * ```html
 * <hy-switch [(checked)]="notifications">Email notifications</hy-switch>
 * ```
 */
@Component({
  selector: 'hy-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-choice hy-switch',
    '[attr.data-checked]': 'checked() || null',
    '[attr.data-disabled]': 'disabled() || null',
  },
  template: `
    <label class="hy-choice__row">
      <span class="hy-choice__control hy-switch__track">
        <input
          type="checkbox"
          role="switch"
          class="hy-choice__input"
          [name]="name()"
          [checked]="checked()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.aria-checked]="checked()"
          [attr.aria-describedby]="description() ? descriptionId : null"
          (change)="onChange($event)"
          (blur)="touch.emit()"
        />
        <span class="hy-switch__thumb" aria-hidden="true"></span>
      </span>
      <span class="hy-choice__label"><ng-content /></span>
    </label>
    @if (description()) {
      <p class="hy-choice__description" [id]="descriptionId">{{ description() }}</p>
    }
  `,
  styleUrl: './choice.css',
})
export class HySwitch implements FormCheckboxControl {
  protected readonly descriptionId = injectId('switch-desc');

  /** Whether the switch is on. Two-way bindable and works with `[formField]`. */
  readonly checked = model(false);
  /** Secondary text under the label. */
  readonly description = input<string>();
  readonly name = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Emits when focus leaves the switch. */
  readonly touch = output<void>();

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
