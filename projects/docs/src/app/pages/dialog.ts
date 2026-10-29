import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HY_DIALOG_DATA, HY_DIALOG_PARTS, HyButton, HyDialog, HyDialogRef } from '@hyalo/angular';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
import { DocsExample } from '../shared/example';
import { DocsPage } from '../shared/page';
import { DocsTokens } from '../shared/tokens-table';

/** Example content component that receives data and returns a result. */
@Component({
  selector: 'docs-rename-dialog',
  imports: [HY_DIALOG_PARTS, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rename-dialog.html',
  styleUrl: './rename-dialog.css',
})
class RenameDialog {
  protected readonly data = inject<{ name: string }>(HY_DIALOG_DATA);
  protected readonly ref = inject<HyDialogRef<string>>(HyDialogRef);
}

@Component({
  selector: 'docs-dialog-page',
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.html',
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
