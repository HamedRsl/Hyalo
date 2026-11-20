import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
export interface HyTimeSlot {
  readonly value: string;
  readonly label?: string;
  readonly disabled?: boolean;
}
@Component({
  selector: 'hy-time-picker',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.css',
})
export class HyTimePicker extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly min = input<string | undefined>('00:00');
  readonly max = input<string | undefined>('23:59');
  readonly step = input(900);
  readonly slots = input<readonly HyTimeSlot[]>([]);
  readonly hourFormat = input<'auto' | '12' | '24'>('auto');
  readonly showSeconds = input(false);
  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly isHourDisabled = input<(hour: number) => boolean>(() => false);
  readonly isMinuteDisabled = input<(hour: number, minute: number) => boolean>(() => false);
  readonly isSecondDisabled = input<(hour: number, minute: number, second: number) => boolean>(
    () => false,
  );
  readonly meridianLabels = input<readonly [string, string]>(['AM', 'PM']);
  readonly hourLabel = input('Hour');
  readonly minuteLabel = input('Minute');
  readonly secondLabel = input('Second');
  readonly meridianLabel = input('Period');
  readonly confirmSelection = input(false);
  readonly confirmLabel = input('Confirm');
  readonly footerTemplate = input<TemplateRef<{ $implicit: HyTimePicker; draft: string }>>();
  readonly confirmed = output<string>();
  protected readonly draft = linkedSignal(() => this.value());
  protected readonly parts = computed(() => this.parse(this.draft()) ?? [0, 0, 0]);
  protected readonly hours = computed(() =>
    Array.from({ length: this.hourFormat() === '12' ? 12 : 24 }, (_, i) =>
      this.hourFormat() === '12' ? i + 1 : i,
    ).filter((_, i) => i % Math.max(1, Math.floor(this.hourStep())) === 0),
  );
  protected readonly minutes = computed(() =>
    Array.from({ length: 60 }, (_, i) => i).filter(
      (i) => i % Math.max(1, Math.floor(this.minuteStep())) === 0,
    ),
  );
  protected readonly seconds = computed(() =>
    Array.from({ length: 60 }, (_, i) => i).filter(
      (i) => i % Math.max(1, Math.floor(this.secondStep())) === 0,
    ),
  );
  protected readonly shownHour = computed(() =>
    this.hourFormat() === '12' ? this.parts()[0] % 12 || 12 : this.parts()[0],
  );
  protected readonly period = computed(() => (this.parts()[0] >= 12 ? 1 : 0));
  protected readonly choices = computed(() =>
    this.slots().map((slot) => ({
      ...slot,
      blocked: !!slot.disabled || !this.available(slot.value),
    })),
  );
  private parse(value: string): readonly [number, number, number] | null {
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/u.exec(value);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)] : null;
  }
  private secondsOf(value: string): number | null {
    const p = this.parse(value);
    return p ? p[0] * 3600 + p[1] * 60 + p[2] : null;
  }
  available(value: string): boolean {
    const p = this.parse(value);
    if (!p) return false;
    const seconds = p[0] * 3600 + p[1] * 60 + p[2],
      min = this.secondsOf(this.min() ?? '00:00'),
      max = this.secondsOf(this.max() ?? '23:59:59');
    return (
      (min === null || seconds >= min) &&
      (max === null || seconds <= max) &&
      !this.isHourDisabled()(p[0]) &&
      !this.isMinuteDisabled()(p[0], p[1]) &&
      !this.isSecondDisabled()(p[0], p[1], p[2])
    );
  }
  protected change(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (this.blocked()) return;
    const value = element.value;
    if (!value || this.available(value)) this.setDraft(value);
    else element.value = this.draft();
  }
  protected choose(value: string): void {
    if (!this.blocked() && this.choices().some((slot) => slot.value === value && !slot.blocked))
      this.setDraft(value);
  }
  private setDraft(value: string): void {
    this.draft.set(value);
    if (!this.confirmSelection()) this.value.set(value);
  }
  protected editPart(part: 'hour' | 'minute' | 'second' | 'period', event: Event): void {
    if (this.blocked()) return;
    let [hour, minute, second] = this.parts();
    const value = Number((event.target as HTMLSelectElement).value);
    if (part === 'hour')
      hour = this.hourFormat() === '12' ? (value % 12) + this.period() * 12 : value;
    else if (part === 'minute') minute = value;
    else if (part === 'second') second = value;
    else hour = (hour % 12) + value * 12;
    const next = [hour, minute, ...(this.showSeconds() ? [second] : [])]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
    if (this.available(next)) this.setDraft(next);
    else
      (event.target as HTMLSelectElement).value = String(
        part === 'hour'
          ? this.shownHour()
          : part === 'minute'
            ? this.parts()[1]
            : part === 'second'
              ? this.parts()[2]
              : this.period(),
      );
  }
  confirm(): void {
    if (!this.blocked() && (!this.draft() || this.available(this.draft()))) {
      this.value.set(this.draft());
      this.confirmed.emit(this.value());
      this.touch.emit();
    }
  }
  reset(): void {
    this.draft.set(this.value());
  }
}
