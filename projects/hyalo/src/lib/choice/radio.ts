import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { injectId } from '../core/ids';

/**
 * A group of radio buttons. Holds the value; the radios inside only say
 * which value they stand for.
 *
 * ```html
 * <hy-radio-group label="Delivery" [formField]="form.delivery">
 *   <hy-radio value="standard" description="3 to 5 days">Standard</hy-radio>
 *   <hy-radio value="express">Express</hy-radio>
 * </hy-radio-group>
 * ```
 *
 * The radios are native inputs sharing one name, so arrow keys move the
 * selection the way the platform does, including in RTL.
 */
@Component({
  selector: 'hy-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-radio-group',
    role: 'radiogroup',
    '[attr.aria-labelledby]': 'label() ? labelId : null',
    '[attr.aria-invalid]': 'showsError() || null',
    '[attr.aria-required]': 'required() || null',
    '[attr.data-orientation]': 'orientation()',
  },
  template: `
    @if (label()) {
      <span class="hy-radio-group__label" [id]="labelId">{{ label() }}</span>
    }
    <div class="hy-radio-group__items"><ng-content /></div>
    @if (showsError()) {
      <p class="hy-choice__error">{{ errorMessage() }}</p>
    }
  `,
  styleUrl: './choice.css',
})
export class HyRadioGroup<T> implements FormValueControl<T | undefined> {
  protected readonly labelId = injectId('radio-label');
  private readonly generatedName = injectId('radio');

  /** Selected value. Two-way bindable and works with `[formField]`. */
  readonly value = model<T | undefined>(undefined);
  /** Visible group label. */
  readonly label = input<string>();
  /** Shared input name. Generated when not set. */
  readonly name = input('');
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly errors = input<readonly { readonly kind: string; readonly message?: string }[]>([]);
  /** Emits when focus leaves a radio. */
  readonly touch = output<void>();

  readonly groupName = computed(() => this.name() || this.generatedName);
  protected readonly showsError = computed(() => this.invalid() && this.touched());
  protected readonly errorMessage = computed(() => {
    const first = this.errors()[0];
    return first ? (first.message ?? first.kind) : '';
  });
}

/** One option inside a `hy-radio-group`. */
@Component({
  selector: 'hy-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hy-choice hy-radio',
    '[attr.data-checked]': 'checked() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
  },
  template: `
    <label class="hy-choice__row">
      <span class="hy-choice__control hy-radio__circle">
        <input
          type="radio"
          class="hy-choice__input"
          [name]="group.groupName()"
          [checked]="checked()"
          [disabled]="isDisabled()"
          [attr.aria-describedby]="description() ? descriptionId : null"
          (change)="group.value.set(value())"
          (blur)="group.touch.emit()"
        />
        <span class="hy-radio__dot" aria-hidden="true"></span>
      </span>
      <span class="hy-choice__label"><ng-content /></span>
    </label>
    @if (description()) {
      <p class="hy-choice__description" [id]="descriptionId">{{ description() }}</p>
    }
  `,
  styleUrl: './choice.css',
})
export class HyRadio<T> {
  protected readonly group = inject<HyRadioGroup<T>>(HyRadioGroup);
  protected readonly descriptionId = injectId('radio-desc');

  /** The value this radio selects. */
  readonly value = input.required<T>();
  /** Secondary text under the label. */
  readonly description = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly checked = computed(() => this.group.value() === this.value());
  protected readonly isDisabled = computed(() => this.disabled() || this.group.disabled());
}
