import { TestBed } from '@angular/core/testing';
import { HyBreadcrumb } from './breadcrumb';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyBreadcrumb', () => {
  it('renders accessible semantic content', async () => {
    const fixture = TestBed.createComponent(HyBreadcrumb);
    fixture.componentRef.setInput('items', [{ label: 'Home', href: '/' }, { label: 'Current' }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-current]').textContent).toBe('Current');
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(1);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
