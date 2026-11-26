import { EXAMPLES } from './examples/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import { HyButton } from '@hyalo/angular/button';
import { HY_DIALOG_DATA, HY_DIALOG_PARTS, HyDialog, HyDialogRef } from '@hyalo/angular/dialog';
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
  imports: [DocsPage, DocsTokens, DocsExample, DocsApiTable, HyButton, HY_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.html',
})
export default class DialogPage {
  protected readonly examples = EXAMPLES;

  private readonly dialog = inject(HyDialog);
  private readonly injector = inject(Injector);
  protected readonly confirmResult = signal('');
  protected readonly collection = signal('Autumn picks');
  protected readonly geometry = signal<HyDialogRef | null>(null);
  protected readonly geometryState = signal('');

  protected openGeometry(content: TemplateRef<unknown>): void {
    const ref = this.dialog.open(content, {
      id: 'geometry-dialog',
      templateContext: { $implicit: 'Dimensions update on the same panel.' },
      width: 'min(22rem, 90vw)',
      maxHeight: '85dvh',
      positionStrategy: createGlobalPositionStrategy(this.injector)
        .centerHorizontally()
        .centerVertically(),
      autoFocus: '#geometry-resize',
      autoFocusTiming: 'opened',
      restoreFocus: '#geometry-trigger',
      ariaDescribedBy: 'geometry-description',
      panelClass: 'docs-geometry-pane',
      backdropClass: 'docs-geometry-backdrop',
      closeOnEscape: false,
      closeOnBackdrop: true,
    });
    this.geometry.set(ref);
    ref.opened.subscribe(() => this.geometryState.set('Geometry dialog opened'));
    ref.beforeClosed.subscribe(({ reason }) => this.geometryState.set('Closed by ' + reason));
    void ref.closed.then(() => this.geometry.set(null));
  }

  protected resizeGeometry(): void {
    this.geometry()?.updateGeometry({ width: 'min(30rem, 94vw)' });
  }

  protected positionGeometry(): void {
    this.geometry()?.updatePosition(
      createGlobalPositionStrategy(this.injector).centerHorizontally().top('24px'),
    );
  }

  protected async remove(): Promise<void> {
    const ok = await this.dialog.confirm({
      title: 'Delete this draft?',
      message: 'It will be gone for everyone on the team.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    this.confirmResult.set(ok ? 'Deleted.' : 'Kept.');
  }
  protected toggleMaximized(): void {
    const ref = this.geometry();
    if (ref) ref.setMaximized(!ref.maximized());
  }

  protected async rename(): Promise<void> {
    const ref = this.dialog.open<string>(RenameDialog, {
      data: { name: this.collection() },
      size: 'sm',
    });
    const name = await ref.closed;
    if (name?.trim()) this.collection.set(name.trim());
  }

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
      name: 'autoFocusTiming',
      type: "'attach' | 'opened'",
      default: "'attach'",
      description: 'Wait for entry before moving focus from the dialog to the autoFocus target.',
    },
    {
      name: 'restoreFocus',
      type: 'boolean | string | HTMLElement',
      default: 'true',
      description: 'Restore focus to the opener, a selector, or an element after close.',
    },
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
      default: "'primary'",
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
