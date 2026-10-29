import { InjectionToken, type Signal } from '@angular/core';

/**
 * What a control tells the field around it. Implemented by `hyInput` and
 * `hy-select`. Custom controls can implement it too, so `hy-field` can
 * label them and show their errors.
 */
export interface HyFieldControl {
  /** Id of the focusable element. */
  readonly id: Signal<string>;
  /** True when the field should show as invalid. */
  readonly invalid: Signal<boolean>;
  /** First error message to show, if any. */
  readonly errorMessage: Signal<string | undefined>;
  readonly required: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  /**
   * True when the control is a native labelable element (input, textarea,
   * select, button). Those get `<label for>`. Others rely on
   * `aria-labelledby`.
   */
  readonly labelable: boolean;
}

/** The field a control sits in. */
export interface HyFieldContext {
  readonly labelId: string;
  readonly hintId: string;
  readonly errorId: string;
  /** True while the field displays an error. */
  readonly errorShown: Signal<boolean>;
  /** Space-separated ids for `aria-describedby`. */
  readonly describedBy: Signal<string | null>;
  register(control: HyFieldControl): void;
}

/** Provided by `hy-field` to the control inside it. */
export const HY_FIELD = new InjectionToken<HyFieldContext>('HY_FIELD');
