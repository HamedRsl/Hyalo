import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { HyLocale } from '@hyalo/angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import type {
  Calendar,
  CalendarApi,
  CalendarOptions,
  EventInput,
  EventClickArg,
  DatesSetArg,
  DateSelectArg,
  EventDropArg,
  EventApi,
} from '@fullcalendar/core';
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
export type HySchedulerView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
export interface HySchedulerViewOption {
  readonly value: string;
  readonly label: string;
}
export interface HySchedulerChange {
  readonly kind: 'drop' | 'resize';
  readonly event: EventApi;
  readonly previous: EventApi;
  readonly related: readonly EventApi[];
  readonly revert: () => void;
}
let engine: Promise<typeof import('./engine')> | undefined;
const loadEngine = (): Promise<typeof import('./engine')> =>
  (engine ??= import('./engine').catch((error: unknown) => {
    engine = undefined;
    throw error;
  }));
export const HY_SCHEDULER_LOADER = new InjectionToken<() => Promise<typeof import('./engine')>>(
  'HY_SCHEDULER_LOADER',
  { providedIn: 'root', factory: () => loadEngine },
);
@Component({
  selector: 'hy-scheduler',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scheduler.html',
  styleUrl: './scheduler.css',
})
export class HyScheduler {
  readonly label = input.required<string>();
  readonly events = input<readonly EventInput[]>([]);
  readonly options = input<CalendarOptions>({});
  readonly view = model<string>('dayGridMonth');
  readonly date = model<string | null>(null);
  readonly locale = input<string>();
  readonly timeZone = input('local');
  readonly direction = input<'ltr' | 'rtl'>();
  readonly editable = input(false);
  readonly selectable = input(false);
  readonly disabled = input(false);
  readonly height = input<number | string>('auto');
  readonly showToolbar = input(true);
  readonly viewLabel = input('View');
  readonly views = input<readonly HySchedulerViewOption[]>([
    { value: 'dayGridMonth', label: 'Month' },
    { value: 'timeGridWeek', label: 'Week' },
    { value: 'timeGridDay', label: 'Day' },
    { value: 'listWeek', label: 'Agenda' },
  ]);
  readonly showAgenda = input(true);
  readonly agendaLabel = input('Event summary');
  readonly emptyLabel = input('No events');
  readonly loadingLabel = input('Loading calendar');
  readonly canChange = input<(change: HySchedulerChange) => boolean | Promise<boolean>>(() => true);
  readonly initialized = output<CalendarApi>();
  readonly rangeChanged = output<DatesSetArg>();
  readonly eventClicked = output<EventClickArg>();
  readonly dateClicked = output<DateClickArg>();
  readonly selected = output<DateSelectArg>();
  readonly eventChanged = output<HySchedulerChange>();
  readonly changeRejected = output<HySchedulerChange>();
  readonly loadingChanged = output<boolean>();
  readonly failed = output<unknown>();
  private readonly globalLocale = inject(HyLocale);
  private readonly load = inject(HY_SCHEDULER_LOADER);
  private readonly destroy = inject(DestroyRef);
  private readonly mount = viewChild.required<ElementRef<HTMLElement>>('mount');
  private calendar: Calendar | undefined;
  private enginePlugins: NonNullable<CalendarOptions['plugins']> = [];
  private revision = 0;
  private readonly pendingChanges = new Map<string, number>();
  private request = 0;
  protected readonly ready = signal(false);
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly title = signal('');
  protected readonly viewOptions = computed(() => {
    const options = this.views();
    const current = this.view();
    return options.some(({ value }) => value === current)
      ? options
      : [{ value: current, label: current }, ...options];
  });
  readonly pending = signal(0);
  protected readonly effectiveLocale = computed(() => this.locale() ?? this.globalLocale.locale());
  protected readonly agenda = computed(() =>
    this.events()
      .filter((event) => typeof event.title === 'string')
      .map((event, index) => ({
        id: event.id ?? String(index),
        title: event.title ?? '',
        start:
          typeof event.start === 'string'
            ? event.start
            : event.start instanceof Date
              ? event.start.toISOString()
              : '',
        allDay: !!event.allDay,
      })),
  );
  private readonly calendarOptions = computed<CalendarOptions>(() => {
    const options = this.options();
    return {
      ...options,
      events: [...this.events()],
      initialView: this.view(),
      initialDate: this.date() ?? undefined,
      locale: this.effectiveLocale(),
      timeZone: this.timeZone(),
      direction: this.direction(),
      editable: this.editable() && !this.disabled() && this.pending() === 0,
      selectable: this.selectable() && !this.disabled() && this.pending() === 0,
      height: this.height(),
      headerToolbar: false,
      datesSet: (arg) => {
        untracked(() => {
          this.title.set(arg.view.title);
          this.view.set(arg.view.type);
          if (this.calendar) this.date.set(this.calendar.getDate().toISOString());
          this.rangeChanged.emit(arg);
          options.datesSet?.(arg);
        });
      },
      eventAllow: (drop, event) =>
        !this.disabled() && this.pending() === 0 && (options.eventAllow?.(drop, event) ?? true),
      dateClick: (arg) => {
        if (!this.disabled()) {
          this.dateClicked.emit(arg);
          options.dateClick?.(arg);
        }
      },
      eventClick: (arg) => {
        if (!this.disabled()) {
          this.eventClicked.emit(arg);
          options.eventClick?.(arg);
        }
      },
      select: (arg) => {
        if (!this.disabled()) {
          this.selected.emit(arg);
          options.select?.(arg);
        }
      },
      eventDrop: (arg) => {
        void this.changed('drop', arg);
        options.eventDrop?.(arg);
      },
      eventResize: (arg) => {
        void this.changed('resize', arg);
        options.eventResize?.(arg);
      },
      loading: (loading) => {
        this.loadingChanged.emit(loading);
        options.loading?.(loading);
      },
      eventSourceFailure: (error) => {
        this.failed.emit(error);
        if (this.calendar) return options.eventSourceFailure?.call(this.calendar, error);
      },
    };
  });
  constructor() {
    afterNextRender(() => {
      this.ready.set(true);
      void this.initialize();
    });
    afterRenderEffect(() => {
      const options = this.calendarOptions();
      if (!this.ready()) return;
      untracked(() => {
        if (!this.calendar) return;
        const current = this.calendar;
        current.resetOptions({
          ...options,
          plugins: [...new Set([...this.enginePlugins, ...(options.plugins ?? [])])],
        });
        if (current.view.type !== this.view()) current.changeView(this.view());
        const date = this.date();
        if (date && current.getDate().getTime() !== new Date(date).getTime())
          current.gotoDate(date);
        current.updateSize();
      });
    });
    this.destroy.onDestroy(() => {
      this.revision++;
      this.pendingChanges.clear();
      this.calendar?.destroy();
      this.calendar = undefined;
    });
  }
  private async initialize(): Promise<void> {
    const revision = ++this.revision;
    this.status.set('loading');
    try {
      const engine = await this.load();
      if (this.destroy.destroyed || revision !== this.revision) return;
      const options = this.calendarOptions(),
        calendar = engine.createCalendar(this.mount().nativeElement, options);
      this.calendar = calendar;
      this.enginePlugins =
        engine.plugins ??
        (calendar.getOption('plugins') ?? []).filter(
          (plugin) => !options.plugins?.includes(plugin),
        );
      calendar.render();
      this.status.set('ready');
      this.title.set(calendar.view.title);
      this.initialized.emit(calendar);
    } catch (error) {
      if (!this.destroy.destroyed && revision === this.revision) {
        this.calendar?.destroy();
        this.calendar = undefined;
        this.status.set('error');
        this.failed.emit(error);
      }
    }
  }
  retry(): void {
    if (this.ready() && this.status() === 'error') void this.initialize();
  }
  private async changed(
    kind: 'drop' | 'resize',
    arg: EventDropArg | EventResizeDoneArg,
  ): Promise<void> {
    if (!arg.event.id || this.pending() > 0) {
      arg.revert();
      this.failed.emit(
        new Error('Editable events require unique IDs and a completed pending edit'),
      );
      return;
    }
    const events = this.events();
    const proposal = {
        kind,
        event: arg.event,
        previous: arg.oldEvent,
        related: arg.relatedEvents,
        revert: arg.revert,
      },
      key = arg.event.id || arg.event.startStr,
      request = ++this.request;
    this.pendingChanges.set(key, request);
    this.pending.set(this.pendingChanges.size);
    try {
      const allowed = !this.disabled() && (await this.canChange()(proposal));
      if (this.destroy.destroyed || this.pendingChanges.get(key) !== request) return;
      if (this.events() !== events) {
        arg.revert();
        return;
      }
      if (!allowed) {
        arg.revert();
        this.changeRejected.emit(proposal);
      } else this.eventChanged.emit(proposal);
    } catch (error) {
      if (!this.destroy.destroyed && this.pendingChanges.get(key) === request) {
        arg.revert();
        this.failed.emit(error);
      }
    } finally {
      if (!this.destroy.destroyed && this.pendingChanges.get(key) === request) {
        this.pendingChanges.delete(key);
        this.pending.set(this.pendingChanges.size);
      }
    }
  }
  getApi(): CalendarApi | undefined {
    return this.calendar;
  }
  next(): void {
    if (!this.disabled()) this.calendar?.next();
  }
  previous(): void {
    if (!this.disabled()) this.calendar?.prev();
  }
  today(): void {
    if (!this.disabled()) this.calendar?.today();
  }
  gotoDate(date: string): void {
    if (this.disabled()) return;
    this.date.set(date);
    this.calendar?.gotoDate(date);
  }
  changeView(view: string, date?: string): void {
    if (this.disabled()) return;
    this.view.set(view);
    if (date) this.date.set(date);
    this.calendar?.changeView(view, date);
  }
  refetchEvents(): void {
    this.calendar?.refetchEvents();
  }
  updateSize(): void {
    this.calendar?.updateSize();
  }
  protected chooseView(event: Event): void {
    this.changeView((event.target as HTMLSelectElement).value);
  }
}
