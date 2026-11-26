import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';
import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger,
  MENU_STACK,
  MenuTracker,
} from '@angular/cdk/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { HyIcon } from '@hyalo/angular/icon';
import { HyMaterialDirective } from '@hyalo/angular/core';
export interface HyContextAction<T = unknown> {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly separator?: boolean;
  readonly checked?: boolean;
  readonly role?: 'item' | 'checkbox' | 'radio';
  readonly children?: readonly HyContextAction<T>[];
  readonly data?: T;
}
export interface HyContextActionEvent<T> {
  readonly action: HyContextAction<T>;
  readonly context: T | null;
}
@Directive({
  selector: '[hyContextMenuTriggerFor]',
  exportAs: 'hyContextMenuTrigger',
  hostDirectives: [
    {
      directive: CdkContextMenuTrigger,
      inputs: [
        'cdkContextMenuTriggerFor:hyContextMenuTriggerFor',
        'cdkContextMenuTriggerData:hyContextMenuData',
        'cdkContextMenuPosition:positions',
        'cdkContextMenuDisabled:disabled',
      ],
      outputs: ['cdkContextMenuOpened:opened', 'cdkContextMenuClosed:closed'],
    },
  ],
  host: {
    'aria-haspopup': 'menu',
    '(keydown)': 'keys($event)',
    '(pointerdown)': 'startPress($event)',
    '(pointermove)': 'movePress($event)',
    '(pointerup)': 'cancelPress()',
    '(pointercancel)': 'cancelPress()',
    '(pointerleave)': 'cancelPress()',
    '(contextmenu)': 'cancelPress()',
  },
})
export class HyContextMenuTrigger {
  private readonly trigger = inject(CdkContextMenuTrigger);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly stack = inject(MENU_STACK);
  private readonly tracker = inject(MenuTracker);
  private readonly injector = inject(Injector);
  private pressTimer: ReturnType<typeof setTimeout> | undefined;
  private pressPoint: { readonly x: number; readonly y: number } | undefined;
  private readonly clearPressClick = (): void => {
    this.element.ownerDocument.defaultView?.removeEventListener('click', this.ignorePressClick, true);
  };
  private readonly ignorePressClick = (event: MouseEvent): void => {
    if (event.detail === 0 || !event.composedPath().includes(this.element)) return;
    this.clearPressClick();
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  /** Touch hold duration in milliseconds. Zero leaves native touch handling in place. */
  readonly longPressDelay = input(0);
  /** Restore focus on keyboard dismissal. May target a separate action button. */
  readonly restoreFocus = input<boolean | HTMLElement>(true);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.cancelPress();
      this.clearPressClick();
    });
    this.stack.closed.pipe(takeUntilDestroyed()).subscribe(({ focusParentTrigger }) => {
      const restore = this.restoreFocus();
      if (restore && focusParentTrigger && this.stack.isEmpty()) {
        (restore === true ? this.element : restore).focus({ preventScroll: true });
      }
    });
  }
  openAt(point: { readonly x: number; readonly y: number }): void {
    if (this.trigger.disabled) return;
    this.tracker.update(this.trigger);
    this.trigger.open(point);
    this.focusMenu();
  }
  /** Opens this trigger at a context-menu event that originated elsewhere. */
  openFromEvent(event: MouseEvent): void {
    const view = this.element.ownerDocument.defaultView;
    if (!view || this.trigger.disabled) return;
    event.preventDefault();
    this.element.dispatchEvent(new view.MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
    }));
    // Projected content may attach after CDK attempts its initial focus.
    this.focusMenu();
  }
  private focusMenu(): void {
    afterNextRender(
      () => {
        const menu = this.stack.peek();
        if (menu && 'focusFirstItem' in menu && typeof menu.focusFirstItem === 'function') {
          menu.focusFirstItem('program');
        }
      },
      { injector: this.injector },
    );
  }
  open(): void {
    const rect = this.element.getBoundingClientRect();
    this.openAt({ x: rect.x, y: rect.bottom });
  }
  close(): void {
    this.trigger.close();
  }
  isOpen(): boolean {
    return this.trigger.isOpen();
  }
  protected keys(event: KeyboardEvent): void {
    if (!this.trigger.disabled && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) {
      event.preventDefault();
      event.stopPropagation();
      this.open();
    }
  }

  protected startPress(event: PointerEvent): void {
    this.cancelPress();
    this.clearPressClick();
    const delay = this.longPressDelay();
    if (!event.isPrimary || event.pointerType !== 'touch' || delay <= 0 || this.trigger.disabled) return;
    const point = { x: event.clientX, y: event.clientY };
    this.pressPoint = point;
    this.pressTimer = setTimeout(() => {
      this.cancelPress();
      if (this.trigger.disabled) return;
      this.element.ownerDocument.defaultView?.addEventListener('click', this.ignorePressClick, true);
      this.openAt(point);
    }, delay);
  }

  protected movePress(event: PointerEvent): void {
    const point = this.pressPoint;
    if (point && Math.hypot(event.clientX - point.x, event.clientY - point.y) > 10) this.cancelPress();
  }

  protected cancelPress(): void {
    clearTimeout(this.pressTimer);
    this.pressPoint = undefined;
  }
}
@Component({
  selector: 'hy-context-menu',
  imports: [
    HyIcon,
    NgTemplateOutlet,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemCheckbox,
    CdkMenuItemRadio,
    CdkMenuTrigger,
  ],
  hostDirectives: [{ directive: HyMaterialDirective, inputs: ['hyMaterial:material'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hy-context-menu' },
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class HyContextMenu<T = unknown> {
  readonly items = input<readonly HyContextAction<T>[]>([]);
  readonly context = input<T | null>(null);
  readonly label = input('Context actions');
  readonly itemTemplate =
    input<TemplateRef<{ $implicit: HyContextAction<T>; context: T | null }>>();
  readonly activated = output<HyContextActionEvent<T>>();
  activate(action: HyContextAction<T>): void {
    if (!action.disabled && !action.hidden && !action.separator && !action.children?.length)
      this.activated.emit({ action, context: this.context() });
  }
}
