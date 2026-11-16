import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HyValueControl } from '@hyalo/angular/field';

@Component({
  selector: 'hy-selectable-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'leave($event)' },
  templateUrl: './selectable-card.html',
  styleUrl: './selectable-card.css',
})
export class HySelectableCard extends HyValueControl implements FormValueControl<string> {
  readonly value = model('');
  readonly options =
    input.required<
      readonly {
        readonly value: string;
        readonly label: string;
        readonly description?: string;
        readonly disabled?: boolean;
      }[]
    >();
  protected choose(event: Event): void {
    if (!this.blocked()) this.value.set((event.target as HTMLInputElement).value);
  }
}
