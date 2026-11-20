import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';
import { HY_TABS, HyTabs } from './tabs';
@Component({
  imports: [HY_TABS],
  template: `<hy-tabs
    [placement]="placement()"
    [overflow]="overflow()"
    [editable]="true"
    selected="one"
  >
    <hy-tab value="one" label="First" badge="3" compactLabel="1" [closable]="true"
      ><ng-template hyTabHeader><b>Rich first</b></ng-template></hy-tab
    >
    <hy-tab value="two" label="Second" route="/second" />
  </hy-tabs>`,
})
class Host {
  readonly placement = signal<'start' | 'bottom'>('start');
  readonly overflow = signal<'dropdown' | 'paginator'>('dropdown');
}
describe('API-298/299/300/302/303/305/306/307 tab presentation', () => {
  it('renders custom headers badges and vertical semantics; routes approved dropdown selection and emits edit/focus events', async () => {
    const navigate = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigateByUrl: navigate } }],
    });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const tabs = fixture.debugElement.query(By.directive(HyTabs)).componentInstance as HyTabs;
    const root: HTMLElement = fixture.nativeElement;
    const adds: unknown[] = [],
      closes: string[] = [],
      focused: string[] = [];
    tabs.addRequested.subscribe((value) => adds.push(value));
    tabs.closeRequested.subscribe((value) => closes.push(value));
    tabs.focused.subscribe((value) => focused.push(value));
    expect(root.querySelector('[role=tablist]')!.getAttribute('aria-orientation')).toBe('vertical');
    expect(root.querySelector('b')!.textContent).toBe('Rich first');
    expect(root.querySelector('.hy-tabs__badge')!.textContent).toBe('3');
    root.querySelector<HTMLButtonElement>('[role=tab]')!.focus();
    root.querySelector<HTMLButtonElement>('[aria-label="Close tab: First"]')!.click();
    [...root.querySelectorAll('button')]
      .find((button) => button.textContent === 'Add tab')!
      .click();
    expect(focused).toContain('one');
    expect(closes).toEqual(['one']);
    expect(adds).toHaveLength(1);
    const dropdown = root.querySelector('select')!;
    dropdown.value = 'two';
    dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    expect(tabs.selected()).toBe('two');
    expect(navigate).toHaveBeenCalledWith('/second');
    fixture.componentInstance.placement.set('bottom');
    fixture.componentInstance.overflow.set('paginator');
    await fixture.whenStable();
    expect(root.querySelector('hy-tabs')!.getAttribute('data-placement')).toBe('bottom');
    expect(root.querySelector('select')).toBeNull();
    const list = root.querySelector<HTMLElement>('[role=tablist]')!;
    Object.defineProperty(list, 'clientWidth', { value: 200 });
    list.scrollBy = vi.fn();
    root.querySelector<HTMLButtonElement>('[aria-label="Next tabs"]')!.click();
    expect(list.scrollBy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' });
  });
});
