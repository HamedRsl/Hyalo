import { TestBed } from '@angular/core/testing';
import { HyScrollArea } from './scroll-area';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyScrollArea', () => {
  it('renders accessible semantic content', async () => {
    const fixture = TestBed.createComponent(HyScrollArea);
    fixture.componentRef.setInput('label', 'Recent activity');
    fixture.componentRef.setInput('maxHeight', '12rem');
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Recent activity');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
