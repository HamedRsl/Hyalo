import { TestBed } from '@angular/core/testing';
import { HyEmptyState } from './empty-state';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyEmptyState', () => {
  it('renders accessible semantic content', async () => {
    const fixture = TestBed.createComponent(HyEmptyState);
    fixture.componentRef.setInput('heading', 'No matches');
    fixture.componentRef.setInput('description', 'Try another filter');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('No matches');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
