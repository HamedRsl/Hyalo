import {
  Directive, ElementRef, effect, forwardRef, inject, input, untracked,
  type ModelSignal, type OutputRef, type WritableSignal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

/** Value and disabled ownership used by the opt-in classic forms adapter. */
export interface HyFormsControl<T> {
  readonly value?: ModelSignal<T>;
  readonly checked?: ModelSignal<T>;
  readonly formDisabled: WritableSignal<boolean>;
  readonly touch?: OutputRef<void>;
}

/**
 * Connect a custom control to Reactive Forms or ngModel.
 * `<hy-number-input #amount [hyForms]="amount" [formControl]="control" />`
 * Import this directive with the appropriate Angular forms module. Do not put
 * `[formField]` and this adapter on the same control.
 */
@Directive({
  selector: '[hyForms]',
  exportAs: 'hyForms',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HyForms), multi: true }],
  host: { '(focusout)': 'leave($event)' },
})
export class HyForms<T> implements ControlValueAccessor {
  readonly hyForms = input.required<HyFormsControl<T>>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private writing = false;
  private hasValue = false;
  private pending: T | null = null;
  private disabled = false;
  private target?: HyFormsControl<T>;
  private empty!: T;

  constructor() {
    effect((cleanup) => {
      const target = this.hyForms();
      const model = target.value ?? target.checked;
      if (!model) throw new Error('hyForms requires a value or checked model.');
      this.target = target;
      this.empty = untracked(model);
      target.formDisabled.set(this.disabled);
      if (this.hasValue) this.apply(this.pending);
      const change = model.subscribe((value) => {
        if (!this.writing) this.onChange(value);
      });
      const touch = target.touch?.subscribe(() => this.onTouched());
      cleanup(() => {
        change.unsubscribe();
        touch?.unsubscribe();
        target.formDisabled.set(false);
        if (this.target === target) this.target = undefined;
      });
    });
  }

  writeValue(value: T | null): void {
    this.pending = value;
    this.hasValue = true;
    this.apply(value);
  }
  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.target?.formDisabled.set(disabled);
  }
  protected leave(event: FocusEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }
  private apply(value: T | null): void {
    const model = this.target?.value ?? this.target?.checked;
    if (!model) return;
    this.writing = true;
    try { model.set(value === null ? this.empty : value); }
    finally { this.writing = false; }
  }
}
