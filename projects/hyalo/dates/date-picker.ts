import { HyIcon } from '@hyalo/angular/icon';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  afterRenderEffect,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  viewChild,
} from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
import { hyDropdownPositions } from '@hyalo/angular/overlay';
import { HyCalendar, type HyCalendarOptions } from './calendar';
import { HY_DATE_ADAPTER, type HyDate, type HyDateAdapter } from './date-adapter';
@Component({
  selector: 'hy-date-picker',
  imports: [HyIcon, HyCalendar, CdkConnectedOverlay, CdkOverlayOrigin, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class HyDatePicker extends HyValueControl implements FormValueControl<HyDate | null> {
  readonly value = model<HyDate | null>(null);
  readonly adapter = input<HyDateAdapter<HyDate>>(inject(HY_DATE_ADAPTER));
  readonly locale = input('en');
  readonly calendarLabel = input('Calendar');
  readonly min = input<HyDate>();
  readonly max = input<HyDate>();
  readonly referenceDate = input<HyDate>('2026-01-01');
  readonly isDateDisabled = input<(date: HyDate) => boolean>(() => false);
  readonly calendarOptions = input<HyCalendarOptions>({});
  protected readonly defaultCellClass = (): string => '';
  protected readonly defaultCalendarLabels = {
    previous: 'Previous month',
    next: 'Next month',
    chooseMonth: 'Choose month',
    chooseYear: 'Choose year',
    week: 'Week',
  };
  readonly touchUi = input(false);
  /** Opt-in calendar transaction; typed input retains its existing immediate behavior. */
  readonly confirmation = input(false);
  readonly applyLabel = input('Apply');
  readonly cancelLabel = input('Cancel');
  protected readonly pendingDate = linkedSignal({
    source: () => ({ value: this.value(), open: this.opened() }),
    computation: ({ value }) => value,
  });
  protected readonly canApply = computed(() => {
    const date = this.pendingDate();
    return (
      !!date &&
      !this.blocked() &&
      date >= (this.min() ?? this.adapter().min) &&
      date <= (this.max() ?? this.adapter().max) &&
      !this.isDateDisabled()(date)
    );
  });
  apply(): void {
    if (!this.canApply()) return;
    this.value.set(this.pendingDate());
    this.error.set('');
    this.close();
  }
  cancel(): void {
    this.close();
  }
  readonly closeLabel = input('Close calendar');
  readonly dialogLabel = input('Choose date');
  readonly opened = model(false);
  readonly opening = output<void>();
  readonly openedPanel = output<void>();
  readonly closedPanel = output<void>();
  readonly visibilityChange = output<boolean>();
  protected readonly positions = hyDropdownPositions();
  protected readonly touchPositions = hyDropdownPositions(0);
  protected readonly open = this.opened;
  constructor() {
    super();
    effect(() => {
      if (this.blocked()) this.open.set(false);
    });
    let wasOpen = false;
    effect(() => {
      const open = this.open();
      if (open === wasOpen) return;
      wasOpen = open;
      this.visibilityChange.emit(open);
      if (open) this.opening.emit();
    });
    effect(() => this.validationChange.emit(this.validationError()));
    afterRenderEffect(() =>
      this.element
        .querySelector<HTMLInputElement>('input')
        ?.setCustomValidity(this.validationError() ?? ''),
    );
  }
  protected readonly calendar = viewChild(HyCalendar);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('datePanel');
  private opener: HTMLElement | null = null;
  private restoreInput: boolean | undefined;
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
  show(): void {
    if (!this.blocked()) this.open.set(true);
  }
  protected attached(): void {
    const active = this.element.ownerDocument.activeElement;
    this.opener = active instanceof HTMLElement ? active : null;
    this.openedPanel.emit();
    queueMicrotask(() => {
      const panel = this.panel()?.nativeElement;
      if (!this.open() || !panel) return;
      this.calendar()?.focusActive();
      if (!panel.contains(panel.ownerDocument.activeElement)) {
        (panel.querySelector<HTMLElement>('button:not([disabled])') ?? panel).focus();
      }
    });
  }
  protected detached(): void {
    const opener = this.opener;
    const restoreInput = this.restoreInput;
    this.opener = null;
    this.restoreInput = undefined;
    if (restoreInput) this.focus();
    else if (restoreInput === undefined && opener?.isConnected) opener.focus();
    this.closedPanel.emit();
  }
  protected pick(date: HyDate): void {
    if (this.blocked()) return;
    if (this.confirmation()) {
      this.pendingDate.set(date);
      return;
    }
    this.value.set(date);
    this.error.set('');
    this.close();
  }
  close(restore = true): void {
    this.pendingDate.set(this.value());
    if (this.opener) this.restoreInput = restore;
    else if (restore) this.focus();
    this.open.set(false);
    this.touch.emit();
  }
  hide(): void {
    this.close();
  }
  toggle(): void {
    if (this.open()) this.close();
    else this.show();
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
