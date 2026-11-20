import { TestBed } from '@angular/core/testing';
import { HyNotificationBadge } from './notification';

describe('notification badge', () => {
  it('hides zero by default and renders overflow, explicit zero and dots', async () => {
    const f = TestBed.createComponent(HyNotificationBadge);
    await f.whenStable();
    expect(f.nativeElement.hidden).toBe(true);
    f.componentRef.setInput('count', 120);
    await f.whenStable();
    expect(f.nativeElement.hidden).toBe(false);
    expect(f.nativeElement.textContent).toBe('99+');
    f.componentRef.setInput('count', 0);
    f.componentRef.setInput('showZero', true);
    await f.whenStable();
    expect(f.nativeElement.textContent).toBe('0');
    f.componentRef.setInput('dot', true);
    f.componentRef.setInput('label', 'Unread messages');
    await f.whenStable();
    expect(f.nativeElement.textContent).toBe('');
    expect(f.nativeElement.getAttribute('aria-label')).toBe('Unread messages');
  });

  it('uses the correct overlap direction for each logical corner and RTL', async () => {
    const f = TestBed.createComponent(HyNotificationBadge);
    f.componentRef.setInput('count', 1);
    for (const [position, translate] of [
      ['top-end', '30% -30%'],
      ['top-start', '-30% -30%'],
      ['bottom-end', '30% 30%'],
      ['bottom-start', '-30% 30%'],
    ]) {
      f.componentRef.setInput('position', position);
      await f.whenStable();
      expect(f.nativeElement.style.translate).toBe(translate);
    }
    f.componentRef.setInput('direction', 'rtl');
    await f.whenStable();
    expect(f.nativeElement.style.translate).toBe('30% 30%');
    f.componentRef.setInput('overlap', false);
    await f.whenStable();
    expect(f.nativeElement.style.translate).toBe('');
  });

  it('never displays non-finite count or overflow labels', async () => {
    const f = TestBed.createComponent(HyNotificationBadge);
    f.componentRef.setInput('count', Infinity);
    f.componentRef.setInput('max', NaN);
    f.componentRef.setInput('showZero', true);
    await f.whenStable();
    expect(f.nativeElement.textContent).toBe('0');
  });
});
