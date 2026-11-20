import { TestBed } from '@angular/core/testing';
import { HyDock } from './dock';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyDock', () => {
  it('reuses named native links and logical orientation with magnification off', async () => {
    const f = TestBed.createComponent(HyDock);
    f.componentRef.setInput('label', 'Workspace');
    f.componentRef.setInput('position', 'start');
    f.componentRef.setInput('items', [
      { id: 'home', label: 'Home', href: '#home' },
      { id: 'chat', label: 'Messages', href: '#chat' },
    ]);
    await f.whenStable();
    const bar = f.nativeElement.querySelector('hy-tab-bar');
    expect(bar.getAttribute('data-orientation')).toBe('vertical');
    const links = bar.querySelectorAll('a');
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
    expect(bar.querySelector('.icon').style.transform).toBe('');
    await expectNoAxeViolations(f.nativeElement);
  });
});
