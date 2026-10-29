import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HyButton, HyToaster } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-toast-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page heading="Toast" lead="Short, temporary messages that stack in a corner.">
      <docs-example [code]="code">
        <button hyButton variant="glass" (click)="saved()">Success</button>
        <button hyButton variant="glass" (click)="failed()">Error</button>
        <button hyButton variant="glass" (click)="archived()">With undo</button>
        <button hyButton variant="ghost" tone="neutral" (click)="toaster.dismissAll()">
          Dismiss all
        </button>
      </docs-example>

      <h2>Behaviour</h2>
      <ul>
        <li>Up to four are visible. A fifth one pushes the oldest out.</li>
        <li>Timers pause while the pointer is over the stack or focus is inside it.</li>
        <li>
          A toast with an action stays until dismissed, so nobody has to race a timer to press Undo.
        </li>
        <li>Swipe a toast sideways to dismiss it on touch screens.</li>
      </ul>

      <h2>Accessibility</h2>
      <ul>
        <li>
          Messages go through a live region. Danger toasts are assertive, the rest are polite.
        </li>
        <li>The stack is a labelled region, so screen reader users can find it later.</li>
        <li>Never put the only copy of important information in a toast. It goes away.</li>
      </ul>

      <h2>API</h2>
      <p><code>HyToaster</code></p>
      <docs-api-table [rows]="methodRows" />
      <p><code>HyToastOptions</code></p>
      <docs-api-table [rows]="optionRows" />
    </docs-page>
  `,
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
