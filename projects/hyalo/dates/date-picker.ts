import {
  ChangeDetectionStrategy,
  Component,
  computed,
  afterRenderEffect,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { hyDropdownPositions } from '@hyalo/angular/overlay';
import { HyCalendar } from './calendar';
import { HY_DATE_ADAPTER, type HyDate, type HyDateAdapter } from './date-adapter';
@Component({
  selector: 'hy-date-picker',
  imports: [HyCalendar, CdkConnectedOverlay, CdkOverlayOrigin, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class HyDatePicker extends HyValueControl implements FormValueControl<HyDate | null> {
  readonly value = model<HyDate | null>(null);
  readonly adapter = input<HyDateAdapter<HyDate>>(inject(HY_DATE_ADAPTER));
  readonly locale = input('en');
  readonly min = input<HyDate>();
  readonly max = input<HyDate>();
  readonly referenceDate = input<HyDate>('2026-01-01');
  readonly isDateDisabled = input<(date: HyDate) => boolean>(() => false);
  protected readonly positions = hyDropdownPositions();
  protected readonly open = signal(false);
  constructor() {
    super();
    effect(() => {
      if (this.blocked()) this.open.set(false);
    });
    effect(() => this.validationChange.emit(this.validationError()));
    afterRenderEffect(() =>
      this.element
        .querySelector<HTMLInputElement>('input')
        ?.setCustomValidity(this.validationError() ?? ''),
    );
  }
  protected readonly calendar = viewChild(HyCalendar);
  protected readonly error = linkedSignal(() => {
    this.value();
    return '';
  });
  readonly validationMessage = input('Enter an available date as YYYY/MM/DD.');
  readonly validationError = computed(() => this.error() || null);
  readonly validationChange = output<string | null>();
  protected readonly draft = linkedSignal(() =>
    this.value() ? this.adapter().inputText(this.value() as HyDate, this.locale()) : '',
  );
  protected readonly display = computed(() =>
    this.value() ? this.adapter().format(this.value() as HyDate, this.locale()) : '',
  );
  protected edit(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    const text = (event.target as HTMLInputElement).value;
    if (!text.trim()) {
      this.value.set(null);
      this.draft.set('');
      this.error.set('');
      return;
    }
    const date = this.adapter().parse(text);
    if (
      date &&
      date >= (this.min() ?? this.adapter().min) &&
      date <= (this.max() ?? this.adapter().max) &&
      !this.isDateDisabled()(date)
    ) {
      this.value.set(date);
      this.error.set('');
    } else {
      this.value.set(null);
      this.error.set(this.validationMessage());
    }
    this.draft.set(text);
    (event.target as HTMLInputElement).setCustomValidity(this.error());
  }
  protected show(): void {
    if (!this.blocked()) this.open.set(true);
  }
  protected attached(): void {
    queueMicrotask(() => this.calendar()?.focusActive());
  }
  protected pick(date: HyDate): void {
    if (this.blocked()) return;
    this.value.set(date);
    this.error.set('');
    this.close();
  }
  protected close(restore = true): void {
    this.open.set(false);
    this.touch.emit();
    if (restore) this.focus();
  }
  protected keys(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
  reset(): void {
    this.open.set(false);
    this.error.set('');
    this.draft.set(
      this.value() ? this.adapter().inputText(this.value() as HyDate, this.locale()) : '',
    );
  }
}
