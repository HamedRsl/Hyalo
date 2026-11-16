import { TestBed } from '@angular/core/testing';
import { HyStatus } from './status';
import { expectNoAxeViolations } from '../src/testing/axe';

describe('HyStatus', () => {
  it('keeps visible meaning beside a decorative dot and announces only when requested', async () => {
    const f = TestBed.createComponent(HyStatus);
    f.componentRef.setInput('label', 'Online');
    f.componentRef.setInput('tone', 'success');
    await f.whenStable();
    expect(f.nativeElement.querySelector('.dot').getAttribute('aria-hidden')).toBe('true');
    expect(f.nativeElement.hasAttribute('role')).toBe(false);
    f.componentRef.setInput('announce', true);
    f.componentRef.setInput('label', 'Offline');
    await f.whenStable();
    expect(f.nativeElement.getAttribute('role')).toBe('status');
    expect(f.nativeElement.textContent).toBe('Offline');
    await expectNoAxeViolations(f.nativeElement);
  });
});
