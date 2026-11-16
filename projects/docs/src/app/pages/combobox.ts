import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyCombobox } from '@hyalo/angular/combobox';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/combobox';
@Component({
  selector: 'docs-combobox-page',
  imports: [DocsPage, DocsExample, HyField, HyCombobox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './combobox.html',
})
export default class HyComboboxPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly value = signal<string | null>(null);
  protected readonly options = [
    { value: 'tehran', label: 'Tehran' },
    { value: 'shiraz', label: 'Shiraz' },
    { value: 'isfahan', label: 'Isfahan' },
    { value: 'tabriz', label: 'Tabriz', disabled: true },
  ];
}
