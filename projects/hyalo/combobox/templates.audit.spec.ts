import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';
import { HyCombobox } from './combobox';
import { HyMultiSelect } from '@hyalo/angular/multi-select';
@Component({
  imports: [HyCombobox, HyMultiSelect],
  template: `<ng-template #option let-item
      ><strong>{{ item.label }}</strong></ng-template
    >
    <ng-template #selected let-item
      ><b>{{ item.label }}</b></ng-template
    >
    <ng-template #group let-label
      ><i>{{ label }}</i></ng-template
    >
    <ng-template #header><em>Header</em></ng-template
    ><ng-template #footer><small>Footer</small></ng-template>
    <hy-combobox
      [options]="options"
      value="a"
      [optionTemplate]="option"
      [selectedTemplate]="selected"
      [groupTemplate]="group"
      [headerTemplate]="header"
      [footerTemplate]="footer"
      panelClass="audit-combo"
      [panelWidth]="420"
      [offsetY]="12"
    />
    <hy-multi-select
      [options]="options"
      [value]="['a']"
      [optionTemplate]="option"
      [selectedTemplate]="selected"
      [groupTemplate]="group"
      [headerTemplate]="header"
      [footerTemplate]="footer"
      panelClass="audit-multi"
      [panelWidth]="360"
    />`,
})
class Host {
  readonly options = [{ value: 'a', label: '<unsafe>', group: { key: 'g', label: 'Group' } }];
}
describe('API-064/066/165/166/169 safe selector templates', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('renders item/group/selection/panel templates and configures the actual overlay panes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(
      [...fixture.nativeElement.querySelectorAll('b')].map(
        (node) => (node as HTMLElement).textContent,
      ),
    ).toEqual(['<unsafe>', '<unsafe>']);
    const combo = fixture.debugElement.query(By.directive(HyCombobox))
      .componentInstance as HyCombobox<string>;
    const multi = fixture.debugElement.query(By.directive(HyMultiSelect))
      .componentInstance as HyMultiSelect<string>;
    combo.show();
    multi.show();
    await fixture.whenStable();
    for (const [selector, width] of [
      ['.audit-combo', '420px'],
      ['.audit-multi', '360px'],
    ]) {
      const panel = document.querySelector<HTMLElement>(selector!)!;
      expect(panel.style.width).toBe(width);
      expect(panel.querySelector('strong')!.textContent).toBe('<unsafe>');
      expect(panel.querySelector('i')!.textContent).toBe('Group');
      expect(panel.querySelector('em')!.textContent).toBe('Header');
      expect(panel.querySelector('small')!.textContent).toBe('Footer');
      expect(panel.querySelector('unsafe')).toBeNull();
    }
  });
});
