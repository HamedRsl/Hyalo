import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type HySize, injectId } from '@hyalo/angular';

import { HY_FIELD, type HyFieldContext, type HyFieldControl } from './field-control';
import { HyInput } from './input';

/** Content before the control inside the field box, such as an icon. */
@Directive({ selector: '[hyPrefix]', host: { class: 'hy-field__prefix' } })
export class HyPrefix {}

/** Content after the control inside the field box, such as a unit or a button. */
@Directive({ selector: '[hySuffix]', host: { class: 'hy-field__suffix' } })
export class HySuffix {}

/**
 * Label, hint and error around one form control.
 *
 * ```html
 * <hy-field label="Email" hint="Only used for the receipt">
 *   <hy-icon hyPrefix name="mail" />
 *   <input hyInput type="email" [formField]="form.email" />
 * </hy-field>
 * ```
 *
 * With Signal Forms the error comes from the field state and shows once the
 * field is touched. An explicit `error` input always wins, which is how
 * server-side errors are shown.
 */
@Component({
  selector: 'hy-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: HY_FIELD, useExisting: forwardRef(() => HyField) }],
  host: {
    class: 'hy-field',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'errorShown() || null',
    '[attr.data-disabled]': 'control()?.disabled() || null',
  },
  templateUrl: './field.html',
  styleUrl: './field.css',
})
export class HyField implements HyFieldContext {
  readonly labelId = injectId('field-label');
  readonly hintId = injectId('field-hint');
  readonly errorId = injectId('field-error');

  /** Visible label. Always set one, placeholders are not labels. */
  readonly label = input<string>();
  /** Help text under the control. Hidden while an error shows. */
  readonly hint = input<string>();
  /** Error text. Overrides errors from the form. */
  readonly error = input<string>();
  /** Show errors before the field is touched, for example after submit. */
  readonly forceError = input(false, { transform: booleanAttribute });
  /** Height of the field box. */
  readonly size = input<HySize>('md');

  protected readonly control = signal<HyFieldControl | undefined>(undefined);

  protected readonly labelFor = computed(() => {
    const c = this.control();
    return c?.labelable ? c.id() : null;
  });

  protected readonly errorText = computed(() => {
    if (this.error()) return this.error();
    const c = this.control();
    return c && (c.invalid() || this.forceError()) ? c.errorMessage() : undefined;
  });

  readonly errorShown = computed(() => !!this.errorText());

  readonly describedBy = computed(() => {
    const ids = [];
    if (this.hint() && !this.errorText()) ids.push(this.hintId);
    if (this.errorText()) ids.push(this.errorId);
    return ids.length ? ids.join(' ') : null;
  });

  register(control: HyFieldControl): void {
    this.control.set(control);
  }
}

/** Everything needed to build a text field. */
export const HY_TEXT_FIELD = [HyField, HyInput, HyPrefix, HySuffix] as const;
