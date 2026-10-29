import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HyButton, HyToaster } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

@Component({
  selector: 'docs-toast-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.html',
})
export default class ToastPage {
  protected readonly toaster = inject(HyToaster);

  protected saved(): void {
    this.toaster.success('Your changes are live.', 'Saved');
  }

  protected failed(): void {
    this.toaster.error('Check your connection and try again.', 'Upload failed');
  }

  protected archived(): void {
    this.toaster.show({
      message: 'Three orders moved to the archive.',
      action: {
        label: 'Undo',
        run: () => this.toaster.show({ message: 'Restored.', tone: 'info' }),
      },
    });
  }

  protected readonly code = `toaster = inject(HyToaster);

this.toaster.success('Your changes are live.', 'Saved');
this.toaster.show({
  message: 'Three orders moved to the archive.',
  action: { label: 'Undo', run: () => this.restore() },
});`;
  protected readonly methodRows: ApiRow[] = [
    {
      name: 'show(options)',
      type: 'HyToastRef',
      description: 'Shows a toast. The ref has dismiss().',
    },
    {
      name: 'success(message, title?)',
      type: 'HyToastRef',
      description: 'Shortcut for the success tone.',
    },
    {
      name: 'error(message, title?)',
      type: 'HyToastRef',
      description: 'Shortcut for the danger tone.',
    },
    { name: 'dismiss(id)', type: 'void', description: 'Hides one toast.' },
    { name: 'dismissAll()', type: 'void', description: 'Hides every toast.' },
  ];
  protected readonly optionRows: ApiRow[] = [
    { name: 'message', type: 'string', description: 'Required. The text.' },
    { name: 'title', type: 'string', description: 'Bold first line.' },
    {
      name: 'tone',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: 'Colour and icon.',
    },
    {
      name: 'duration',
      type: 'number',
      default: '5000',
      description: 'Milliseconds. 0 keeps it. Defaults to 0 with an action.',
    },
    { name: 'action', type: '{ label, run }', description: 'One button, such as Undo.' },
  ];
}
