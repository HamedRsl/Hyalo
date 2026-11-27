import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { type HySize, injectId } from '@hyalo/angular/core';

import { HY_FIELD, type HyFieldContext, type HyFieldControl } from './field-control';
import { HyInput } from './input';
import { HyPasswordMode, HyPasswordToggle } from './password-mode';

export interface HyErrorState {
  readonly invalid: boolean;
  readonly touched: boolean;
  readonly dirty: boolean;
  readonly submitted: boolean;
  readonly pending: boolean;
}
export type HyErrorStateMatcher = (state: HyErrorState) => boolean;
export type HyFieldStatus = 'none' | 'pending' | 'success' | 'warning' | 'error';
export interface HyFieldFeedbackContext {
  readonly $implicit: string | undefined;
  readonly status: HyFieldStatus;
}

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
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: HY_FIELD, useExisting: forwardRef(() => HyField) }],
  host: {
    class: 'hy-field',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'errorShown() || null',
    '[attr.data-disabled]': 'control()?.disabled() || null',
    '[attr.data-composite]': 'control()?.composite || null',
    '[attr.data-status]': 'currentStatus()',
    '[attr.data-float-label]': 'floatLabel()',
    '[attr.data-filled]': 'filled() || control()?.filled?.() || null',
    '[attr.data-subscript]': 'subscriptSizing()',
    '[attr.aria-busy]': 'currentStatus() === "pending" || null',
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
  readonly submitted = input(false, { transform: booleanAttribute });
  readonly errorStateMatcher = input<HyErrorStateMatcher>();
  readonly status = input<HyFieldStatus | 'auto'>('auto');
  readonly statusText = input('');
  readonly hintTemplate = input<TemplateRef<HyFieldFeedbackContext>>();
  readonly errorTemplate = input<TemplateRef<HyFieldFeedbackContext>>();
  readonly feedbackTemplate = input<TemplateRef<HyFieldFeedbackContext>>();
  readonly hideRequiredMarker = input(false, { transform: booleanAttribute });
  readonly subscriptSizing = input<'dynamic' | 'fixed'>('dynamic');
  /** Floating labels use filled for custom controls that do not expose native text. */
  readonly floatLabel = input<'never' | 'auto' | 'always'>('never');
  readonly filled = input(false, { transform: booleanAttribute });

  protected readonly control = signal<HyFieldControl | undefined>(undefined);

  protected readonly labelFor = computed(() => {
    const c = this.control();
    return c?.labelable ? c.id() : null;
  });

  protected readonly errorText = computed(() => {
    if (this.error()) return this.error();
    const c = this.control();
    if (!c) return undefined;
    const matcher = this.errorStateMatcher();
    const visible = matcher ? matcher({
      invalid: c.rawInvalid?.() ?? c.invalid(),
      touched: c.touched?.() ?? c.invalid(),
      dirty: c.dirty?.() ?? false,
      pending: c.pending?.() ?? false,
      submitted: this.submitted(),
    }) : c.invalid();
    return visible || this.forceError() ? c.errorMessage() : undefined;
  });

  readonly errorShown = computed(() => !!this.errorText());
  readonly currentStatus = computed<HyFieldStatus>(() => this.errorShown() ? 'error' :
    this.status() !== 'auto' ? this.status() as HyFieldStatus :
    this.control()?.pending?.() ? 'pending' : 'none');
  protected readonly feedbackContext = computed<HyFieldFeedbackContext>(() => ({
    $implicit: this.errorText() ?? this.hint(), status: this.currentStatus(),
  }));

  readonly describedBy = computed(() => {
    const ids = [];
    if ((this.hint() || this.hintTemplate()) && !this.errorText()) ids.push(this.hintId);
    if (this.errorText()) ids.push(this.errorId);
    if (this.statusText() || this.feedbackTemplate()) ids.push(this.hintId + '-status');
    return ids.length ? ids.join(' ') : null;
  });

  register(control: HyFieldControl): void {
    this.control.set(control);
  }
}

/** Everything needed to build a text field. */
export const HY_TEXT_FIELD = [HyField, HyInput, HyPrefix, HySuffix, HyPasswordMode, HyPasswordToggle] as const;
