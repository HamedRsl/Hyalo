import { TestBed } from '@angular/core/testing';
import { HyDescriptionList } from './description-list';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyDescriptionList', () => {
  it('applies responsive column counts and a stacked item layout', async () => {
    const fixture = TestBed.createComponent(HyDescriptionList);
    fixture.componentRef.setInput('items', [{ term: 'Plan', detail: 'Team' }]);
    fixture.componentRef.setInput('columns', { compact: 2, wide: 3 });
    fixture.componentRef.setInput('layout', 'stacked');
    await fixture.whenStable();

    const list: HTMLElement = fixture.nativeElement.querySelector('dl');
    expect(list.style.getPropertyValue('--hy-description-columns-compact')).toBe('2');
    expect(list.style.getPropertyValue('--hy-description-columns-wide')).toBe('3');
    expect(list.classList.contains('stacked')).toBe(true);
  });

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
