import { TestBed } from '@angular/core/testing';
import { HyPagination } from './pagination';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyPagination', () => {
  it('bounds unsafe counts without an unbounded numeric loop', async () => {
    const fixture = TestBed.createComponent(HyPagination);
    fixture.componentRef.setInput('total', Number.MAX_VALUE);
    fixture.componentRef.setInput('pageSize', 1);
    fixture.componentRef.setInput('page', Number.MAX_VALUE);
    await fixture.whenStable();
    expect(fixture.componentInstance.current()).toBe(Number.MAX_SAFE_INTEGER);
    expect(fixture.componentInstance.pages().length).toBeLessThanOrEqual(7);
  });
  it('bounds navigation and publishes the active page', async () => {
    const fixture = TestBed.createComponent(HyPagination);
    fixture.componentRef.setInput('total', 248);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0]!.disabled).toBe(true);
    buttons[buttons.length - 1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.page()).toBe(2);
    expect(fixture.nativeElement.querySelector('[aria-current]').textContent.trim()).toBe('2');
    fixture.componentInstance.go(999);
    await fixture.whenStable();
    expect(fixture.componentInstance.current()).toBe(25);
    fixture.componentRef.setInput('total', 0);
    fixture.componentRef.setInput('pageSize', NaN);
    await fixture.whenStable();
    expect(fixture.componentInstance.current()).toBe(1);
    await expectNoAxeViolations(fixture.nativeElement);
  });
  it('localizes digits and limits the visible page window', async () => {
    const fixture = TestBed.createComponent(HyPagination);
    fixture.componentRef.setInput('total', 100000);
    fixture.componentRef.setInput('page', 400);
    fixture.componentRef.setInput('locale', 'fa');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-current]').textContent.trim()).toBe(
      new Intl.NumberFormat('fa').format(400),
    );
    expect(fixture.nativeElement.querySelectorAll('button').length).toBeLessThanOrEqual(7);
  });
});
