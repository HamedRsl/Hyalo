import {
  CdkMenu,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger,
  MENU_STACK,
} from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  Renderer2,
  afterRenderEffect,
  booleanAttribute,
  TemplateRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HyMaterialDirective } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';
@Component({
  selector: 'hy-menu',
  hostDirectives: [CdkMenu, { directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'panelClass()' },
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class HyMenu {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  /** Extra CSS classes on the rendered menu panel. */
  readonly panelClass = input<string | readonly string[]>('');
  /** Prevent outside clicks from reaching the content underneath the menu. */
  readonly hasBackdrop = input(false, { transform: booleanAttribute });
  /** Extra CSS classes on the optional backdrop. */
  readonly backdropClass = input<string | readonly string[]>('');

  protected readonly classes = (value: string | readonly string[]): string[] =>
    (typeof value === 'string' ? value : value.join(' ')).split(/\s+/).filter(Boolean);

  constructor() {
    afterRenderEffect((onCleanup) => {
      const enabled = this.hasBackdrop();
      const classes = this.classes(this.backdropClass());
      const overlay = this.element.closest('.cdk-overlay-pane')?.parentElement;
      if (!enabled || !overlay?.parentElement) return;

      // The backdrop is outside the pane, so CDK keeps ownership of outside dismissal.
      const parent = overlay.parentElement;
      const backdrop = this.renderer.createElement('div') as HTMLElement;
      this.renderer.setAttribute(backdrop, 'aria-hidden', 'true');
      for (const name of new Set(['cdk-overlay-backdrop', 'cdk-overlay-backdrop-showing', 'cdk-overlay-transparent-backdrop', ...classes])) {
        this.renderer.addClass(backdrop, name);
      }
      this.renderer.insertBefore(parent, backdrop, overlay);
      onCleanup(() => this.renderer.removeChild(parent, backdrop));
    });
  }
}
@Directive({
  selector: '[hyMenuTriggerFor]',
  exportAs: 'hyMenuTrigger',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: [
        'cdkMenuTriggerFor: hyMenuTriggerFor',
        'cdkMenuPosition: menuPosition',
        'cdkMenuTriggerData: menuData',
      ],
      outputs: ['cdkMenuOpened: menuOpened', 'cdkMenuClosed: menuClosed'],
    },
  ],
})
export class HyMenuTrigger {
  private readonly trigger = inject(CdkMenuTrigger);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Keep CDK focus return, redirect it to an element, or leave focus to the application. */
  readonly restoreFocus = input<boolean | HTMLElement>(true);

  constructor() {
    const stack = inject(MENU_STACK);
    stack.closed.pipe(takeUntilDestroyed()).subscribe(({ focusParentTrigger }) => {
      const target = this.restoreFocus();
      if (target === true || !focusParentTrigger || !stack.isEmpty()) return;

      // Let CDK finish closing the stack and leave application-managed focus alone.
      queueMicrotask(() => {
        if (this.destroyRef.destroyed || !stack.isEmpty()) return;
        const root = this.element.getRootNode() as Document | ShadowRoot;
        if (root.activeElement !== this.element) return;
        if (target === false) this.element.blur();
        else if (target.isConnected) target.focus();
      });
    });
  }

  open(): void {
    if (!this.destroyRef.destroyed) this.trigger.open();
  }
  close(): void {
    if (!this.destroyRef.destroyed) this.trigger.close();
  }
  toggle(): void {
    if (!this.destroyRef.destroyed) this.trigger.toggle();
  }
  isOpen(): boolean {
    return !this.destroyRef.destroyed && this.trigger.isOpen();
  }
}
const itemStyles =
  ':host{display:flex;align-items:center;gap:.75rem;inline-size:100%;min-block-size:44px;padding:.5rem .75rem;border:0;border-radius:var(--hy-radius-s);background:transparent;color:var(--hy-ink);font:inherit;text-align:start;text-decoration:none;cursor:pointer;box-sizing:border-box}:host(:focus){outline:2px solid var(--hy-primary);outline-offset:-2px;background:var(--hy-primary-wash)}:host(:hover){background:var(--hy-surface-3)}:host([aria-disabled=true]){opacity:.45;cursor:default}:host([aria-checked=true]){background:var(--hy-primary-wash)}:host([aria-checked=true])::after{content:"";inline-size:.4rem;block-size:.7rem;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg);margin-inline-start:auto}';
@Component({
  // Native elements preserve link, list, key, and button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[hyMenuItem],a[hyMenuItem]',
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuitemTypeaheadLabel: typeaheadLabel'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styles: itemStyles,
})
export class HyMenuItem {}
@Component({
  // Native elements preserve link, list, key, and button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[hyMenuCheckbox]',
  hostDirectives: [
    {
      directive: CdkMenuItemCheckbox,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styles: itemStyles,
})
export class HyMenuCheckbox {}
@Component({
  // Native elements preserve link, list, key, and button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[hyMenuRadio]',
  hostDirectives: [
    {
      directive: CdkMenuItemRadio,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styles: itemStyles,
})
export class HyMenuRadio {}
@Component({
  selector: 'hy-split-button',
  imports: [HyButton, HyMenuTrigger, HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<button hyButton type="button" [disabled]="disabled()" (click)="activated.emit()">{{label()}}</button><button hyButton iconOnly type="button" [disabled]="disabled()" [hyMenuTriggerFor]="menu()" [attr.aria-label]="menuLabel()"><hy-icon class="chevron" name="chevron-down" size="1rem" /></button>',
  styles:
    ':host{display:inline-flex;gap:1px}button:first-child{border-start-end-radius:0;border-end-end-radius:0}button:last-child{border-start-start-radius:0;border-end-start-radius:0;min-inline-size:44px}.chevron{transition:rotate var(--hy-dur-quick) var(--hy-ease-out)}button[aria-expanded=true] .chevron{rotate:180deg}@media(prefers-reduced-motion:reduce){.chevron{transition:none}}',
})
export class HySplitButton {
  readonly label = input.required<string>();
  readonly menu = input.required<TemplateRef<unknown>>();
  readonly menuLabel = input('More actions');
  readonly disabled = input(false);
  readonly activated = output<void>();
}
export const HY_MENU = [
  HyMenu,
  HyMenuItem,
  HyMenuTrigger,
  HyMenuCheckbox,
  HyMenuRadio,
  HySplitButton,
] as const;
