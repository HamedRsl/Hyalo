import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HySegmented } from './segmented';
@Component({ imports: [HySegmented], template: `<ng-template #content let-option let-selected="selected"><b>{{option.label}}:{{selected}}</b></ng-template><hy-segmented [options]="options" [optionTemplate]="content" orientation="vertical" shape="rounded" [block]="true" [allowEmpty]="true" />` })
class Host { options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }]; }
describe('segmented audit contracts', () => {
  it('uses checkboxes and an independent array model for multiple selection', async () => {
    const f = TestBed.createComponent(HySegmented<string>);
    f.componentRef.setInput('options', [{ value: 'a', label: 'Alpha' }]);
    f.componentRef.setInput('multiple', true);
    f.componentRef.setInput('allowEmpty', false); await f.whenStable();
    const c = f.componentInstance;
    const input: HTMLInputElement = f.nativeElement.querySelector('input');
    expect(input.type).toBe('checkbox'); input.click(); await f.whenStable();
    expect(c.selectedValues()).toEqual(['a']); expect(c.value()).toBeUndefined();
    input.click(); await f.whenStable(); expect(c.selectedValues()).toEqual(['a']); expect(input.checked).toBe(true);
  });
  it('renders custom vertical content and supports empty single selection without disabled mutations', async () => {
    const f = TestBed.createComponent(Host); await f.whenStable();
    const host: HTMLElement = f.nativeElement.querySelector('hy-segmented');
    expect(host.getAttribute('aria-orientation')).toBe('vertical');
    const inputs = host.querySelectorAll<HTMLInputElement>('input');
    inputs[0]!.click(); await f.whenStable(); expect(host.textContent).toContain('Alpha:true');
    inputs[0]!.click(); await f.whenStable(); expect(inputs[0]!.checked).toBe(false);
    inputs[1]!.dispatchEvent(new Event('change')); await f.whenStable(); expect(host.textContent).toContain('Beta:false');
  });
});
