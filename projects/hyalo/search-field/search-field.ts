import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-search-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './search-field.html',
  styleUrl: './search-field.css',
})
export class HySearchField extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly placeholder = input('Search');
  readonly loading = input(false);
  readonly submitted = output<string>();
  protected submit(event: Event): void {
    if (this.effectiveDisabled() || ('isComposing' in event && event.isComposing)) return;
    this.submitted.emit(this.value());
  }
  protected update(event: Event): void {
    if (this.blocked() || ('isComposing' in event && event.isComposing)) return;
    this.value.set((event.target as HTMLInputElement).value);
  }
  protected clear(): void {
    if (!this.blocked()) {
      this.value.set('');
      this.submitted.emit('');
      this.focus();
    }
  }
}
