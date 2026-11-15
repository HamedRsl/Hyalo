import { TestBed } from '@angular/core/testing';
import ExtensionsPage from './extensions';

describe('Faceted filter demonstration', () => {
  it('filters visible results and restores them when search is cleared', async () => {
    const fixture = TestBed.createComponent(ExtensionsPage);
    fixture.componentRef.setInput('feature', 'filter');
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'DESIGN';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    const results = (): HTMLElement => fixture.nativeElement.querySelector('.filter-results');
    expect(results().textContent).toContain('1 matching projects');
    expect(results().textContent).toContain('Design system');
    expect(results().textContent).not.toContain('Mobile launch');
    input.value = 'no-such-project';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(results().textContent).toContain('No projects match');
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(results().querySelectorAll('li')).toHaveLength(4);
  });
});
