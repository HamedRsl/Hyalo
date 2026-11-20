import { EXAMPLE } from './examples/bottom-sheet';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyBottomSheetHost } from '@hyalo/angular/bottom-sheet';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-bottom-sheet-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyBottomSheetHost, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottom-sheet.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyBottomSheetConfig.handle',
      type: 'boolean',
      default: 'data',
      description: 'Shows the resize handle; draggable independently controls pointer dragging.',
    },
    {
      name: 'HyBottomSheetConfig.handleBehavior',
      type: "'cycle' | 'none'",
      default: 'data',
      description: 'Cycles stops on click/keyboard, or leaves the handle for dragging only.',
    },
    {
      name: 'HyBottomSheetConfig.canDismiss',
      type: 'boolean | ((result: unknown, reason: HySheetDismissReason) => boolean | Promise<boolean>)',
      default: 'data',
      description:
        'Veto or asynchronously validate dismissal, including content refs, Escape, backdrop and zero-stop gestures.',
    },
    {
      name: 'HyBottomSheetConfig.restoreFocus',
      type: 'boolean',
      default: 'data',
      description: 'Restores focus to the previously focused element after dismissal.',
    },
    {
      name: 'HyBottomSheetConfig.panelClass',
      type: 'string | readonly string[]',
      default: 'data',
      description: 'Additional CDK overlay panel classes.',
    },
    {
      name: 'HyBottomSheetConfig.injector',
      type: 'Injector',
      default: 'data',
      description: 'Injector inherited by the sheet content.',
    },
    {
      name: 'HyBottomSheetConfig.viewContainerRef',
      type: 'ViewContainerRef',
      default: 'data',
      description: 'Logical Angular ownership of the overlay content.',
    },
    {
      name: 'HyBottomSheetConfig.direction',
      type: 'Direction',
      default: 'data',
      description: 'Text direction for the sheet overlay.',
    },
    {
      name: 'HyBottomSheetConfig.hasBackdrop',
      type: 'boolean',
      default: 'data',
      description: 'Shows a modal backdrop by default.',
    },
    {
      name: 'HyBottomSheetConfig.backdropClass',
      type: 'string | string[]',
      default: 'data',
      description: 'CSS class or classes for the overlay backdrop.',
    },
    {
      name: 'HyBottomSheetConfig.ariaModal',
      type: 'boolean',
      default: 'data',
      description: 'Modal accessibility policy for the dialog.',
    },
    {
      name: 'HyBottomSheetConfig.closeOnNavigation',
      type: 'boolean',
      default: 'data',
      description:
        'Allows CDK navigation disposal; browser navigation disposes the overlay without waiting for a guard.',
    },
    {
      name: 'HyBottomSheetConfig.scrollStrategy',
      type: 'ScrollStrategy',
      default: 'data',
      description: 'CDK overlay scroll strategy.',
    },
    {
      name: 'HyBottomSheetConfig.minHeight',
      type: 'string',
      default: 'data',
      description: 'Minimum panel height as a CSS length.',
    },
    {
      name: 'HyBottomSheetConfig.maxHeight',
      type: 'string',
      default: 'data',
      description: 'Maximum panel height as a CSS length.',
    },
    {
      name: 'HyBottomSheetConfig.width',
      type: 'string',
      default: 'data',
      description: 'Panel width as a CSS length.',
    },
    {
      name: 'HyBottomSheetConfig.maxWidth',
      type: 'string',
      default: 'data',
      description: 'Maximum panel width as a CSS length.',
    },
    {
      name: 'HySheetDismissal.result',
      type: 'R | undefined',
      default: 'data',
      description: 'Value returned when the sheet closes.',
    },
    {
      name: 'HySheetDismissal.reason',
      type: 'HySheetDismissReason',
      default: 'data',
      description: 'Dismissal source; programmatic, backdrop, Escape, gesture, or close button.',
    },
    {
      name: 'SheetSurfaceRef.dispose()',
      type: '() => void',
      default: 'method',
      description: 'Readonly dispose metadata for SheetSurfaceRef.',
    },
    {
      name: 'SheetSurfaceRef.request',
      type: '(result?: R) => void',
      default: 'signal',
      description: 'Starts one enabled refresh until complete or cancel.',
    },
    {
      name: 'SheetSurfaceRef.close()',
      type: '(result?: R) => void',
      default: 'method',
      description: 'Readonly close metadata for SheetSurfaceRef.',
    },
    {
      name: 'SheetSurfaceRef.finish()',
      type: '(result?: R) => void',
      default: 'method',
      description: 'Readonly finish metadata for SheetSurfaceRef.',
    },
    {
      name: 'SheetContext.opened',
      type: '() => void',
      default: 'data',
      description: 'Emits or resolves after sheet entrance completes.',
    },
    {
      name: 'SheetContext.dismiss',
      type: '(result: unknown, reason: HySheetDismissReason) => void',
      default: 'data',
      description:
        'Requests guarded dismissal; the promise reports acceptance rather than animation completion.',
    },
    {
      name: 'HyBottomSheetRef.opened',
      type: 'Promise<void>',
      default: 'signal',
      description: 'Emits or resolves after sheet entrance completes.',
    },
    {
      name: 'HyBottomSheetRef.dismissed',
      type: 'Promise<HySheetDismissal<R>>',
      default: 'signal',
      description: 'Dismissal details or existing dismissal event.',
    },
    {
      name: 'HyBottomSheetRef.dismissError',
      type: 'unknown',
      default: 'signal',
      description: 'Reports a rejected dismissal guard while preserving the open sheet.',
    },
    {
      name: 'HyBottomSheetRef.backdropClick()',
      type: '() => Observable<MouseEvent>',
      default: 'method',
      description: 'Observable of backdrop clicks, including when automatic dismissal is disabled.',
    },
    {
      name: 'HyBottomSheetRef.keydownEvents()',
      type: '() => Observable<KeyboardEvent>',
      default: 'method',
      description: 'Observable of keyboard events received by the overlay.',
    },
    {
      name: 'HyBottomSheetRef.dismiss()',
      type: '(result?: R, reason?: HySheetDismissReason) => Promise<boolean>',
      default: 'method',
      description:
        'Requests guarded dismissal; the promise reports acceptance rather than animation completion.',
    },
    {
      name: 'HyBottomSheetHost.opened',
      type: 'void',
      default: 'output',
      description: 'Emits or resolves after sheet entrance completes.',
    },
    {
      name: 'HyBottomSheetHost.dismissed',
      type: 'HySheetDismissal<unknown>',
      default: 'output',
      description: 'Dismissal details or existing dismissal event.',
    },
    {
      name: 'HyBottomSheetHost.dismissError',
      type: 'unknown',
      default: 'output',
      description: 'Reports a rejected dismissal guard while preserving the open sheet.',
    },
    {
      name: 'content',
      type: 'TemplateRef<unknown>',
      default: 'projected fallback',
      description:
        'Explicit deferred content. Prefer this for nested or reprojected component compositions so closed sheets remain uninstantiated during SSR.',
    },
    {
      name: 'provideHyGestures(config)',
      type: 'Provider',
      default: 'slop 10px, swipeThreshold 80px, refreshThreshold 72px',
      description:
        'Hierarchical partial defaults for the shared drag controllers, exported from /motion.',
    },

    {
      name: 'HyBottomSheetHost.open',
      type: 'boolean',
      default: 'false',
      description: 'Controlled open state; supports two-way binding.',
    },
    {
      name: 'HyBottomSheetHost.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyBottomSheetHost.options',
      type: 'HyBottomSheetConfig',
      default: '{}',
      description: 'Sheet configuration; shares the drawer material, focus and data contract.',
    },
    {
      name: 'HyBottomSheetHost.closed',
      type: 'unknown',
      default: 'output',
      description: 'Emits the result after the surface finishes closing.',
    },
    {
      name: 'HyBottomSheetHost.breakpointChange',
      type: 'number',
      default: 'output',
      description: 'Emits the current positive sheet fraction when it changes.',
    },
    {
      name: 'HyBottomSheet.open(content, config)',
      type: 'HyBottomSheetRef<R>',
      default: 'service',
      description:
        'Opens a component or TemplateRef, injects HY_DIALOG_DATA, and resolves closed with the close result.',
    },
    {
      name: 'breakpoints / initialBreakpoint',
      type: 'readonly number[] / number',
      default: '[0.5, 1] / first positive',
      description: 'Valid fractions from 0 to 1; an invalid initial stop throws.',
    },
    {
      name: 'handleLabel / closeLabel',
      type: 'string',
      default: 'Resize sheet / Close',
      description: 'Localized names for native sheet controls.',
    },
    {
      name: 'snapTo(point) / close(result?)',
      type: 'void',
      default: 'methods',
      description: 'Configured stops only. Zero dismisses when dismissible.',
    },
  ];
  protected readonly open = signal(false);
  protected readonly point = signal(0.35);
  protected readonly rowsOfContent = Array.from({ length: 12 }, (_, i) => i + 1);
}
