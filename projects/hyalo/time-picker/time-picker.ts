import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({ selector: 'hy-time-picker', changeDetection: ChangeDetectionStrategy.OnPush, host: { '(focusout)': 'leave($event)' }, templateUrl: './time-picker.html', styleUrl: './time-picker.css' })
export class HyTimePicker extends HyValueControl implements FormValueControl<string> {

 readonly value = model('');
 readonly min = input<string | undefined>('00:00');
 readonly max = input<string | undefined>('23:59');
 readonly step = input(900);
 /** Slot values are local wall times. The host combines a date and timezone. */
 readonly slots = input<readonly { readonly value: string; readonly label?: string; readonly disabled?: boolean }[]>([]);
 protected readonly choices = computed(() => this.slots().map(slot => ({ ...slot, blocked: !!slot.disabled || slot.value < (this.min() ?? '00:00') || slot.value > (this.max() ?? '23:59') })));
 protected change(event: Event): void {
   const value = (event.target as HTMLInputElement).value;
   if (!this.blocked() && (!value || (/^([01]\d|2[0-3]):[0-5]\d$/u.test(value) && value >= (this.min() ?? '00:00') && value <= (this.max() ?? '23:59')))) this.value.set(value);
 }
 protected choose(value: string): void {
   if (!this.blocked() && this.choices().some(slot => slot.value === value && !slot.blocked)) this.value.set(value);
 }

}
