import { EXAMPLE } from './examples/menu';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_MENU } from '@hyalo/angular/menu';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-menu-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HY_MENU, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.html',
  styleUrl: './phase3.css',
})
export default class MenuPage {
  protected readonly example = EXAMPLE;

  protected readonly message = signal('');
  protected readonly pinned = signal(false);
  protected readonly toggle = (value: boolean): boolean => !value;
  protected readonly rows: ApiRow[] = [
    {
      name: 'hyMenuTriggerFor',
      type: 'TemplateRef<unknown>',
      default: 'required',
      description: 'Anchors a menu, with collision handling and focus restoration.',
    },
    {
      name: 'HyMenuTrigger.restoreFocus',
      type: 'boolean | HTMLElement',
      default: 'true',
      description: 'Returns focus to the trigger or a supplied element, or leaves it to the application.',
    },
    {
      name: 'HyMenu.panelClass, backdropClass',
      type: 'string | readonly string[]',
      description: 'Classes on the menu panel and optional backdrop.',
    },
    {
      name: 'HyMenu.hasBackdrop',
      type: 'boolean',
      default: 'false',
      description: 'Captures outside clicks while the menu is open.',
    },
    {
      name: 'HyMenuItem.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Skips unavailable actions.',
    },
    {
      name: 'HyMenuItem.triggered',
      type: 'output<void>',
      default: '',
      description: 'Runs on pointer or keyboard activation.',
    },
    {
      name: 'HyMenuCheckbox.checked',
      type: 'boolean',
      default: 'false',
      description: 'Controlled checked state.',
    },
    {
      name: 'HySplitButton.activated',
      type: 'output<void>',
      default: '',
      description: 'Primary action separate from its menu.',
    },
  ];
}
