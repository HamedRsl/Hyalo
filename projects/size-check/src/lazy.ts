import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HY_TABS, HY_TEXT_FIELD, HyDialog, HySelect, HyToaster, HyTooltip } from '@hyalo/angular';

/** Uses the heavier parts of the kit: overlays, Angular Aria and forms. */
@Component({
  selector: 'app-lazy',
  imports: [HY_TABS, HY_TEXT_FIELD, HySelect, HyTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lazy.html',
})
export default class Lazy {
  protected readonly dialog = inject(HyDialog);
  protected readonly toaster = inject(HyToaster);
  protected readonly name = signal('');
  protected readonly size = signal<string | undefined>(undefined);
  protected readonly sizes = [
    { value: 's', label: 'Small' },
    { value: 'l', label: 'Large' },
  ];
}
