import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyAuthBlock, HyBookingBlock, HySettingsBlock } from '@hyalo/angular/blocks';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/advanced-forms';
@Component({
  selector: 'docs-advanced-forms',
  imports: [DocsPage, DocsExample, HyAuthBlock, HyBookingBlock, HySettingsBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './advanced-forms.html',
})
export default class AdvancedFormsPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly notice = signal('');
  protected readonly booking = signal({
    date: '2026-11-16' as string | null,
    time: '10:30',
    guests: 1 as number | null,
    phone: '09123456789',
  });
  protected readonly slots = [
    { value: '09:00' },
    { value: '10:30' },
    { value: '12:00', disabled: true },
    { value: '14:00' },
  ];
  protected readonly teams = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
  ];
  protected readonly settings = signal({
    name: 'Atelier',
    teams: ['design'] as readonly string[],
    reminders: true,
    files: [] as readonly File[],
  });
}
