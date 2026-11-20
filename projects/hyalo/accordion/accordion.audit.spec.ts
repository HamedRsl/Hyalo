import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { HY_ACCORDION, HyAccordion, HyAccordionItem } from './accordion';
@Component({
  imports: [HY_ACCORDION],
  template: `<hy-accordion [multiple]="true">
    <hy-accordion-item
      heading="First"
      [toggleTrigger]="manual() ? 'manual' : 'header'"
      [hideIcon]="hide()"
    >
      <button hyAccordionActions (click)="actions = actions + 1">Action</button>
      <ng-template hyAccordionIcon let-open
        ><span class="custom">{{ open ? 'open' : 'closed' }}</span></ng-template
      >
    </hy-accordion-item>
    <hy-accordion-item heading="Second" />
    <hy-accordion-item heading="Locked" [disabled]="true" />
  </hy-accordion>`,
})
class Host {
  readonly manual = signal(false);
  readonly hide = signal(false);
  actions = 0;
}
describe('API-011 through API-015 accordion contracts', () => {
  it('keeps header actions separate and supports custom/hidden icons and manual toggling', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const item = fixture.debugElement.query(By.directive(HyAccordionItem))
      .componentInstance as HyAccordionItem;
    const action: HTMLButtonElement = fixture.nativeElement.querySelector('[hyAccordionActions]');
    expect(action.closest('.hy-accordion__trigger')).toBeNull();
    action.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.actions).toBe(1);
    expect(item.expanded()).toBe(false);
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('.hy-accordion__trigger');
    trigger.click();
    await fixture.whenStable();
    expect(item.expanded()).toBe(true);
    expect(fixture.nativeElement.querySelector('.custom').textContent).toBe('open');
    fixture.componentInstance.manual.set(true);
    fixture.componentInstance.hide.set(true);
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();
    expect(item.expanded()).toBe(true);
    expect(fixture.nativeElement.querySelector('.custom')).toBeNull();
    item.expanded.set(false);
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
  it('controls enabled group items and emits completion only at the body transition boundary', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group = fixture.debugElement.query(By.directive(HyAccordion))
      .componentInstance as HyAccordion;
    const items = fixture.debugElement
      .queryAll(By.directive(HyAccordionItem))
      .map((entry) => entry.componentInstance as HyAccordionItem);
    const done: boolean[] = [];
    items[0]!.animationComplete.subscribe((open) => done.push(open));
    group.expandAll();
    await fixture.whenStable();
    expect(items.map((item) => item.expanded())).toEqual([true, true, false]);
    const body: HTMLElement = fixture.nativeElement.querySelector('.hy-accordion__body');
    function end(target: HTMLElement, propertyName: string) {
      const event = new Event('transitionend', { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: propertyName });
      target.dispatchEvent(event);
    }
    end(body.firstElementChild as HTMLElement, 'grid-template-rows');
    end(body, 'opacity');
    expect(done).toEqual([]);
    end(body, 'grid-template-rows');
    expect(done).toEqual([true]);
    group.collapseAll();
    await fixture.whenStable();
    expect(items.map((item) => item.expanded())).toEqual([false, false, false]);
    group.toggleAll();
    await fixture.whenStable();
    expect(items.map((item) => item.expanded())).toEqual([true, true, false]);
  });
});
