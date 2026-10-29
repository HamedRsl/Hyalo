import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HY_DIALOG_DATA, HY_DIALOG_PARTS, HyButton, HyDialog, HyDialogRef } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';

/** Example content component that receives data and returns a result. */
@Component({
  selector: 'docs-rename-dialog',
  imports: [HY_DIALOG_PARTS, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 hyDialogTitle>Rename collection</h2>
    <div hyDialogContent>
      <p>Current name: {{ data.name }}</p>
      <label class="docs-stack">
        New name
        <input class="rename" #name [value]="data.name" />
      </label>
    </div>
    <div hyDialogActions>
      <button hyButton variant="ghost" tone="neutral" [hyDialogClose]="undefined">Cancel</button>
      <button hyButton (click)="ref.close(name.value)">Rename</button>
    </div>
  `,
  styles: `
    .rename {
      padding: var(--hy-space-2) var(--hy-space-3);
      border: 1px solid var(--hy-line);
      border-radius: var(--hy-radius-s);
      background: var(--hy-surface-1);
      color: inherit;
      font: inherit;
    }
  `,
})
class RenameDialog {
  protected readonly data = inject<{ name: string }>(HY_DIALOG_DATA);
  protected readonly ref = inject<HyDialogRef<string>>(HyDialogRef);
}

@Component({
  selector: 'docs-dialog-page',
  imports: [DocsPage, DocsExample, DocsApiTable, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page heading="Dialog" lead="Modal glass panels for focused tasks and confirmations.">
      <h2>Confirm</h2>
      <docs-example [code]="confirmCode">
        <button hyButton tone="danger" variant="soft" (click)="remove()">Delete draft</button>
        <span class="hy-muted" aria-live="polite">{{ confirmResult() }}</span>
      </docs-example>

      <h2>Custom content</h2>
      <docs-example [code]="openCode">
        <button hyButton variant="glass" (click)="rename()">Rename collection</button>
        <span class="hy-muted" aria-live="polite">Name: {{ collection() }}</span>
      </docs-example>
      <p>
        Content is any component or template. Lay it out with <code>hyDialogTitle</code>,
        <code>hyDialogContent</code> and <code>hyDialogActions</code>, and close it with
        <code>[hyDialogClose]</code> or <code>HyDialogRef.close()</code>.
      </p>

      <h2>Accessibility</h2>
      <ul>
        <li>Focus moves into the dialog, stays there, and returns to the trigger on close.</li>
        <li>
          <code>hyDialogTitle</code> names the dialog. Without a title, pass <code>label</code>.
        </li>
        <li>Escape and a backdrop click close it, unless <code>dismissible</code> is false.</li>
        <li>Confirm uses <code>role="alertdialog"</code> and starts on the safe button.</li>
      </ul>

      <h2>API</h2>
      <p><code>HyDialog.open(content, config)</code> returns a <code>HyDialogRef</code>.</p>
      <docs-api-table [rows]="configRows" />
      <p><code>HyDialog.confirm(options)</code> resolves to true or false.</p>
      <docs-api-table [rows]="confirmRows" />
      <p><code>HyDialogRef</code></p>
      <docs-api-table [rows]="refRows" />
    </docs-page>
  `,
})
export default class DialogPage {
  private readonly dialog = inject(HyDialog);
  protected readonly confirmResult = signal('');
  protected readonly collection = signal('Autumn picks');

  protected async remove(): Promise<void> {
    const ok = await this.dialog.confirm({
      title: 'Delete this draft?',
      message: 'It will be gone for everyone on the team.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    this.confirmResult.set(ok ? 'Deleted.' : 'Kept.');
  }

  protected async rename(): Promise<void> {
    const ref = this.dialog.open<string>(RenameDialog, {
      data: { name: this.collection() },
      size: 'sm',
    });
    const name = await ref.closed;
    if (name?.trim()) this.collection.set(name.trim());
  }

  protected readonly confirmCode = `const ok = await this.dialog.confirm({
  title: 'Delete this draft?',
  message: 'It will be gone for everyone on the team.',
  confirmLabel: 'Delete',
  tone: 'danger',
});`;
  protected readonly openCode = `const ref = this.dialog.open<string>(RenameDialog, {
  data: { name: this.collection() },
  size: 'sm',
});
const name = await ref.closed;

// Inside RenameDialog
data = inject(HY_DIALOG_DATA);
ref = inject(HyDialogRef);`;
  protected readonly configRows: ApiRow[] = [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'full'",
      default: "'md'",
      description: 'Width of the panel.',
    },
    { name: 'data', type: 'D', description: 'Injected with HY_DIALOG_DATA.' },
    { name: 'label', type: 'string', description: 'Accessible name when there is no title.' },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'true',
      description: 'Escape and backdrop click close it.',
    },
    {
      name: 'material',
      type: 'HyMaterial',
      default: "'frosted'",
      description: 'Glass of the panel.',
    },
    {
      name: 'role',
      type: "'dialog' | 'alertdialog'",
      default: "'dialog'",
      description: 'Use alertdialog for urgent questions.',
    },
  ];
  protected readonly confirmRows: ApiRow[] = [
    { name: 'title', type: 'string', description: 'Required. The question.' },
    { name: 'message', type: 'string', description: 'More detail under the title.' },
    {
      name: 'confirmLabel',
      type: 'string',
      default: "'Confirm'",
      description: 'Text of the main button.',
    },
    {
      name: 'cancelLabel',
      type: 'string',
      default: "'Cancel'",
      description: 'Text of the other button.',
    },
    {
      name: 'tone',
      type: 'HyTone',
      default: "'accent'",
      description: 'Use danger for destructive actions.',
    },
  ];
  protected readonly refRows: ApiRow[] = [
    { name: 'close(result?)', type: 'void', description: 'Plays the exit animation, then closes.' },
    {
      name: 'closed',
      type: 'Promise<R | undefined>',
      description: 'Resolves with the result after close.',
    },
  ];
}
