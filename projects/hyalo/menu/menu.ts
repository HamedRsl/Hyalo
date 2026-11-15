import {
  CdkMenu,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  input,
  output,
} from '@angular/core';
import { HyMaterialDirective } from '@hyalo/angular';
import { HyButton } from '@hyalo/angular/button';
@Component({
  selector: 'hy-menu',
  hostDirectives: [CdkMenu, { directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class HyMenu {}
@Directive({
  selector: '[hyMenuTriggerFor]',
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
export class HyMenuTrigger {}
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
  imports: [HyButton, HyMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<button hyButton type="button" [disabled]="disabled()" (click)="activated.emit()">{{label()}}</button><button hyButton type="button" [disabled]="disabled()" [hyMenuTriggerFor]="menu()" [attr.aria-label]="menuLabel()"><span aria-hidden="true">⌄</span></button>',
  styles:
    ':host{display:inline-flex;gap:1px}button:first-child{border-start-end-radius:0;border-end-end-radius:0}button:last-child{border-start-start-radius:0;border-end-start-radius:0;min-inline-size:44px}',
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
