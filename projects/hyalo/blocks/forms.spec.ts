import { TestBed } from '@angular/core/testing';
import { HyAuthBlock, HyBookingBlock, HySettingsBlock } from './forms';

describe('transactional block contracts', () => {
  it('rejects unavailable slots, invalid calendar dates and out-of-range guest counts', async () => {
    const f = TestBed.createComponent(HyBookingBlock);
    const requested = vi.fn();
    f.componentInstance.requested.subscribe(requested);
    f.componentRef.setInput('slots', [{ value: '10:30' }, { value: '12:00', disabled: true }]);
    const valid = { date: '2026-11-16', time: '10:30', guests: 2, phone: '09123456789' };
    await f.whenStable();
    for (const change of [
      { time: '12:00' },
      { time: '11:00' },
      { date: '2026-02-30' },
      { guests: 13 },
      { guests: 1.5 },
      { time: 'not-a-time' },
    ]) {
      f.componentInstance.value.set({ ...valid, ...change });
      await f.whenStable();
      f.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { cancelable: true }));
      await f.whenStable();
      expect(requested).not.toHaveBeenCalled();
      expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();
    }
    f.componentInstance.value.set(valid);
    await f.whenStable();
    f.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(requested).toHaveBeenCalledWith({ ...valid, timeZone: 'Asia/Tehran' });
  });

  it('leaves booking loading, server errors and success to the host', async () => {
    const f = TestBed.createComponent(HyBookingBlock);
    const requested = vi.fn();
    f.componentInstance.requested.subscribe(requested);
    f.componentInstance.value.set({
      date: '2026-11-16',
      time: '10:30',
      guests: 1,
      phone: '09123456789',
    });
    f.componentRef.setInput('pending', true);
    await f.whenStable();
    const form = f.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(requested).not.toHaveBeenCalled();
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(f.nativeElement.querySelector('button[type=submit]').disabled).toBe(true);
    f.componentRef.setInput('pending', false);
    f.componentRef.setInput('error', 'Time no longer available');
    await f.whenStable();
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain(
      'Time no longer available',
    );
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(requested).toHaveBeenCalledTimes(1);
    expect(f.componentInstance.pending()).toBe(false);
    expect(f.componentInstance.error()).toBe('Time no longer available');
  });

  it('validates auth, switches to code verification and suppresses pending requests', async () => {
    const f = TestBed.createComponent(HyAuthBlock);
    const requested = vi.fn();
    f.componentInstance.requested.subscribe(requested);
    await f.whenStable();
    const send = async () => {
      f.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { cancelable: true }));
      await f.whenStable();
    };
    await send();
    expect(requested).not.toHaveBeenCalled();
    f.componentInstance.value.set({
      email: 'mina@example.com',
      password: 'example-only',
      code: '',
    });
    await f.whenStable();
    await send();
    expect(requested).toHaveBeenCalledTimes(1);
    f.componentRef.setInput('verify', true);
    f.componentInstance.value.set({ email: 'mina@example.com', password: '', code: '001234' });
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-password')).toBeNull();
    expect(f.nativeElement.querySelector('hy-otp')).not.toBeNull();
    await send();
    expect(requested.mock.calls[1]?.[0].code).toBe('001234');
    f.componentRef.setInput('pending', true);
    f.componentRef.setInput('error', 'Provider unavailable');
    await f.whenStable();
    await send();
    expect(requested).toHaveBeenCalledTimes(2);
    expect(f.nativeElement.querySelector('form').getAttribute('aria-busy')).toBe('true');
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toBe('Provider unavailable');
  });

  it('requires a workspace name and emits edited settings without persisting them', async () => {
    const f = TestBed.createComponent(HySettingsBlock);
    const requested = vi.fn();
    f.componentInstance.requested.subscribe(requested);
    await f.whenStable();
    const send = async () => {
      f.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { cancelable: true }));
      await f.whenStable();
    };
    await send();
    expect(requested).not.toHaveBeenCalled();
    const input = f.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
    input.value = 'کارگاه';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await f.whenStable();
    await send();
    expect(requested.mock.calls[0]?.[0].name).toBe('کارگاه');
    f.componentRef.setInput('pending', true);
    f.componentRef.setInput('error', 'Save failed');
    await f.whenStable();
    await send();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(f.nativeElement.querySelector('form').getAttribute('aria-busy')).toBe('true');
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toBe('Save failed');
  });
});
