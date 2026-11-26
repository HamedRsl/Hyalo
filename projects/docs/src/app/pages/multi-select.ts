import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Overlay, type ConnectedPosition } from '@angular/cdk/overlay';
import { HyField } from '@hyalo/angular/field';
import { HyMultiSelect } from '@hyalo/angular/multi-select';
import type { HyOptionPageLoader } from '@hyalo/angular/combobox';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLES } from './examples/multi-select';
@Component({
  selector: 'docs-multi-select-page',
  imports: [DocsPage, DocsExample, HyField, HyMultiSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-select.html',
})
export default class HyMultiSelectPage {
  protected readonly examples = EXAMPLES;
  protected readonly popupPosition: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];
  protected readonly popupStatus = signal('Popup idle');
  protected readonly popupScroll = inject(Overlay).scrollStrategies.noop();
  protected readonly remoteTeams = signal<readonly string[]>([]);
  protected readonly loadTeams: HyOptionPageLoader<string> = async ({
    query,
    offset,
    limit,
    signal,
  }) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    signal.throwIfAborted();
    const matching = this.options.filter((team) =>
      team.label.toLowerCase().includes(query.toLowerCase()),
    );
    return {
      options: matching.slice(offset, offset + limit),
      hasMore: offset + limit < matching.length,
    };
  };
  protected readonly values = signal<readonly string[]>(['design']);
  protected readonly options = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'research', label: 'Research' },
    { value: 'legal', label: 'Legal', disabled: true },
  ];
}
