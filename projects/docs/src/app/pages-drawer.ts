import type { Injector, TemplateRef } from '@angular/core';
import { HyDrawer, type HyDialogRef } from '@hyalo/angular/dialog';

/**
 * Opens the page list in a drawer. The shell loads this file on the first
 * tap, so the drawer code stays out of the initial bundle. It is a separate
 * file because importing @hyalo/angular/dialog itself dynamically would pull
 * all of it into the shell, which already imports the dialog parts.
 */
export function openPagesDrawer(injector: Injector, content: TemplateRef<unknown>): HyDialogRef {
  return injector.get(HyDrawer).open(content, { side: 'start', label: 'Pages' });
}
