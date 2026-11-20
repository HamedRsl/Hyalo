import { TestBed } from '@angular/core/testing';
import type { Calendar, CalendarOptions, EventApi } from '@fullcalendar/core';
import { HY_SCHEDULER_LOADER, HyScheduler } from './scheduler';
describe('HyScheduler', () => {
  it('keeps navigation models synchronized and blocks overlapping async mutations', async () => {
    let options: CalendarOptions = {},
      currentDate = new Date('2026-11-18T00:00:00Z'),
      complete: (value: boolean) => void = () => undefined;
    const calendar = {
      getOption: () => [],
      view: { type: 'dayGridMonth', title: 'November 2026' },
      getDate: () => currentDate,
      render: () => undefined,
      destroy: vi.fn(),
      updateSize: () => undefined,
      changeView: vi.fn(),
      gotoDate: vi.fn(),
      resetOptions: (value: CalendarOptions) => (options = value),
      next: () => {
        currentDate = new Date('2026-12-18T00:00:00Z');
        options.datesSet?.({ view: calendar.view } as Parameters<
          NonNullable<CalendarOptions['datesSet']>
        >[0]);
      },
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HY_SCHEDULER_LOADER,
          useValue: async () => ({
            createCalendar: (_element: HTMLElement, value: CalendarOptions) => {
              options = value;
              return calendar as unknown as Calendar;
            },
          }),
        },
      ],
    });
    const f = TestBed.createComponent(HyScheduler);
    f.componentRef.setInput('label', 'Team');
    f.componentRef.setInput(
      'canChange',
      () => new Promise<boolean>((resolve) => (complete = resolve)),
    );
    await f.whenStable();
    await Promise.resolve();
    await f.whenStable();
    f.componentInstance.next();
    expect(f.componentInstance.date()).toBe('2026-12-18T00:00:00.000Z');
    const event = { id: 'one', startStr: '2026-12-18' } as EventApi,
      revert = vi.fn(),
      secondRevert = vi.fn();
    const arg = { event, oldEvent: event, relatedEvents: [], revert } as unknown as Parameters<
      NonNullable<CalendarOptions['eventDrop']>
    >[0];
    options.eventDrop?.(arg);
    options.eventDrop?.({ ...arg, revert: secondRevert });
    expect(secondRevert).toHaveBeenCalledOnce();
    complete(false);
    await Promise.resolve();
    await Promise.resolve();
    expect(revert).toHaveBeenCalledOnce();
    expect(f.componentInstance.pending()).toBe(0);
    f.destroy();
    expect(calendar.destroy).toHaveBeenCalledOnce();
  });
  it('discards a loader after the component is destroyed', async () => {
    let resolve: (engine: typeof import('./engine')) => void = () => undefined;
    const createCalendar = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HY_SCHEDULER_LOADER,
          useValue: () =>
            new Promise<typeof import('./engine')>((complete) => (resolve = complete)),
        },
      ],
    });
    const f = TestBed.createComponent(HyScheduler);
    f.componentRef.setInput('label', 'Team');
    await f.whenStable();
    f.destroy();
    resolve({ createCalendar, plugins: [] });
    await Promise.resolve();
    await Promise.resolve();
    expect(createCalendar).not.toHaveBeenCalled();
  });
});
