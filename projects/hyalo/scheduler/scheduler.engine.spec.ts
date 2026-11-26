import { TestBed } from '@angular/core/testing';
import { HyScheduler, HY_SCHEDULER_LOADER } from './scheduler';
import * as engine from './engine';
import timeGrid from '@fullcalendar/timegrid';

describe('HyScheduler real FullCalendar', () => {
  it('retains built-in plugins removed from redundant consumer options', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: HY_SCHEDULER_LOADER, useValue: async () => engine }] });
    const f = TestBed.createComponent(HyScheduler);
    f.componentRef.setInput('label', 'Team');
    f.componentRef.setInput('options', { plugins: [timeGrid] });
    await f.whenStable();
    f.componentRef.setInput('options', { plugins: [] });
    await f.whenStable();
    expect(() => f.componentInstance.changeView('timeGridWeek')).not.toThrow();
    f.destroy();
  });
  it('vetoes a real event proposal asynchronously and ignores completion after disposal', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: HY_SCHEDULER_LOADER, useValue: async () => engine }],
    });
    const f = TestBed.createComponent(HyScheduler);
    f.componentRef.setInput('label', 'Team');
    f.componentRef.setInput('date', '2026-11-18');
    f.componentRef.setInput('events', [{ id: 'one', title: 'Review', start: '2026-11-18' }]);
    let complete!: (allowed: boolean) => void;
    f.componentRef.setInput(
      'canChange',
      () => new Promise<boolean>((resolve) => (complete = resolve)),
    );
    await f.whenStable();
    const api = f.componentInstance.getApi()!;
    const event = api.getEventById('one')!;
    const revert = vi.fn();
    const rejected = vi.fn();
    const accepted = vi.fn();
    f.componentInstance.changeRejected.subscribe(rejected);
    f.componentInstance.eventChanged.subscribe(accepted);
    const drop = api.getOption('eventDrop')!;
    const arg = { event, oldEvent: event, relatedEvents: [], revert } as unknown as Parameters<
      typeof drop
    >[0];
    drop(arg);
    expect(f.componentInstance.pending()).toBe(1);
    complete(false);
    await Promise.resolve();
    await Promise.resolve();
    expect(revert).toHaveBeenCalledOnce();
    expect(rejected).toHaveBeenCalledOnce();
    expect(accepted).not.toHaveBeenCalled();
    drop(arg);
    f.destroy();
    complete(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(accepted).not.toHaveBeenCalled();
  });
  it('retains built-in views when reactive options reset the real engine', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: HY_SCHEDULER_LOADER, useValue: async () => engine }],
    });
    const f = TestBed.createComponent(HyScheduler);
    f.componentRef.setInput('label', 'Team');
    f.componentRef.setInput('date', '2026-11-18');
    await f.whenStable();
    const api = f.componentInstance.getApi()!;
    expect(api.view.type).toBe('dayGridMonth');
    f.componentRef.setInput('editable', true);
    await f.whenStable();
    f.componentInstance.changeView('timeGridWeek');
    await f.whenStable();
    expect(api.view.type).toBe('timeGridWeek');
    expect(f.nativeElement.querySelector('.fc-timegrid')).not.toBeNull();
    f.destroy();
    expect(f.nativeElement.querySelector('.fc-view-harness')).toBeNull();
  });
  it('labels the native view selector and synchronizes it in both directions', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: HY_SCHEDULER_LOADER, useValue: async () => engine }],
    });
    const fixture = TestBed.createComponent(HyScheduler);
    fixture.componentRef.setInput('label', 'Team');
    fixture.componentRef.setInput('viewLabel', 'Calendar layout');
    fixture.componentRef.setInput('views', [
      { value: 'dayGridMonth', label: 'Monthly' },
      { value: 'timeGridWeek', label: 'Weekly' },
    ]);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.labels?.[0]?.textContent).toContain('Calendar layout');
    expect(select.value).toBe('dayGridMonth');
    select.value = 'timeGridWeek';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.getApi()?.view.type).toBe('timeGridWeek');
    fixture.componentInstance.changeView('listWeek');
    await fixture.whenStable();
    expect(select.value).toBe('listWeek');
    expect(select.closest('label')?.querySelector('hy-icon')?.getAttribute('aria-hidden')).toBe('true');
  });
});
