import { TestBed } from '@angular/core/testing';
import { HyDescriptionList } from './description-list';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyDescriptionList', () => {
  it('renders accessible semantic content', async () => {
    const fixture = TestBed.createComponent(HyDescriptionList);
    fixture.componentRef.setInput('items', [
      { term: 'Plan', detail: 'Team' },
      { term: 'Region', detail: 'Europe' },
    ]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('dt').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('dd')[1].textContent).toBe('Europe');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
