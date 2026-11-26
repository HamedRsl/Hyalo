import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Overlay, type ConnectedPosition } from '@angular/cdk/overlay';
import { HyField } from '@hyalo/angular/field';
import { HyCombobox, type HyOptionLoader } from '@hyalo/angular/combobox';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLES } from './examples/combobox';
@Component({
  selector: 'docs-combobox-page',
  imports: [DocsPage, DocsExample, HyField, HyCombobox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './combobox.html',
})
export default class HyComboboxPage {
  protected readonly popupPosition: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];
  protected readonly popupStatus = signal('Popup idle');
  protected readonly popupScroll = inject(Overlay).scrollStrategies.noop();
  protected readonly examples = EXAMPLES;
  protected readonly value = signal<string | null>(null);
  protected readonly remoteCity = signal<string | null>(null);
  protected readonly loadCities: HyOptionLoader<string> = async (query, signal) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 280));
    signal.throwIfAborted();
    if (query.toLowerCase() === 'unavailable') throw new Error('Search unavailable');
    return this.options.filter((city) => city.label.toLowerCase().includes(query.toLowerCase()));
  };
  protected readonly options = [
    { value: 'tehran', label: 'Tehran' },
    { value: 'shiraz', label: 'Shiraz' },
    { value: 'isfahan', label: 'Isfahan' },
    { value: 'tabriz', label: 'Tabriz', disabled: true },
  ];
}
