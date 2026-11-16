import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';
@Component({
  selector: 'hy-selectable-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './selectable-checkbox.html',
  styleUrl: './selectable-card.css',
})
export class HySelectableCheckbox extends HyValueControl implements FormCheckboxControl {
  readonly checked = model(false);
  protected change(event: Event): void {
    if (!this.blocked()) this.checked.set((event.target as HTMLInputElement).checked);
  }
}
