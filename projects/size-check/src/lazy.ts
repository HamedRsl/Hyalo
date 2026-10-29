import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HyDialog } from '@hyalo/angular/dialog';
import { HY_TEXT_FIELD } from '@hyalo/angular/field';
import { HyTooltip } from '@hyalo/angular/popover';
import { HySelect } from '@hyalo/angular/select';
import { HY_TABS } from '@hyalo/angular/tabs';
import { HyToaster } from '@hyalo/angular/toast';

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
