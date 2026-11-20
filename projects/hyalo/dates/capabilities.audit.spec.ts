import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { HyCalendar } from './calendar';
import { HyDatePicker } from './date-picker';
import { HyDateRangePicker } from './date-range';
import { HyJalaliDateAdapter } from './date-adapter';

@Component({
  imports: [HyCalendar],
  template: ` <ng-template #header let-calendar let-heading="heading">
      <button class="custom-next" (click)="calendar.moveMonth(1)">{{ heading }}</button>
    </ng-template>
    <ng-template
      #cell
      let-date
      let-selected="selected"
      let-preview="preview"
      let-comparison="comparison"
      let-outside="outside"
    >
      <span
        class="custom-cell"
        [attr.data-context]="[date, selected, preview, comparison, outside].join('|')"
        >{{ date }}</span
      >
    </ng-template>
    <hy-calendar
      [headerTemplate]="header"
      [cellTemplate]="cell"
      [cellClass]="classes"
      [(value)]="date"
      [comparisonRange]="{ start: '2026-01-09', end: '2026-01-11' }"
    />`,
})
class TemplateHost {
  readonly date = signal('2026-01-10');
  readonly classes = (date: string) => (date === '2026-01-10' ? ['holiday', 'event'] : '');
}

function day(root: ParentNode, date: string): HTMLButtonElement {
  return root.querySelector<HTMLButtonElement>(`button[data-date="${date}"]:not([data-outside])`)!;
}

describe('dates public capability evidence', () => {
  it('API-077 keeps date-only selection private until Apply and rolls back on Cancel', async () => {
    const f = TestBed.createComponent(HyDatePicker);
    f.componentRef.setInput('value', '2026-01-10');
    f.componentRef.setInput('confirmation', true);
    await f.whenStable();
    f.componentInstance.show();
    await f.whenStable();
    day(document, '2026-01-12').click();
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('2026-01-10');
    expect(f.componentInstance.opened()).toBe(true);
    (document.querySelector('[data-date-cancel]') as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('2026-01-10');
    f.componentInstance.show();
    await f.whenStable();
    expect(day(document, '2026-01-10').getAttribute('aria-pressed')).toBe('true');
    day(document, '2026-01-13').click();
    await f.whenStable();
    (document.querySelector('[data-date-apply]') as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('2026-01-13');
    expect(f.componentInstance.opened()).toBe(false);
  });

  it('API-077 discards a pending date when controlled visibility closes and revalidates Apply', async () => {
    const f = TestBed.createComponent(HyDatePicker);
    f.componentRef.setInput('confirmation', true);
    f.componentRef.setInput('value', '2026-01-10');
    await f.whenStable();
    f.componentInstance.opened.set(true);
    await f.whenStable();
    day(document, '2026-01-12').click();
    await f.whenStable();
    f.componentRef.setInput('isDateDisabled', (date: string) => date === '2026-01-12');
    await f.whenStable();
    expect((document.querySelector('[data-date-apply]') as HTMLButtonElement).disabled).toBe(true);
    f.componentInstance.opened.set(false);
    await f.whenStable();
    f.componentInstance.opened.set(true);
    await f.whenStable();
    expect(day(document, '2026-01-10').getAttribute('aria-pressed')).toBe('true');
  });

  it('API-080 applies available presets and rejects out-of-bounds and invalid durations', async () => {
    const f = TestBed.createComponent(HyDateRangePicker);
    f.componentRef.setInput('minDate', '2026-01-01');
    f.componentRef.setInput('minRangeDays', 3);
    f.componentRef.setInput('presets', [
      { label: 'Holiday', range: { start: '2026-01-10', end: '2026-01-12' } },
      { label: 'Too short', range: { start: '2026-01-10', end: '2026-01-11' } },
      { label: 'Too early', range: { start: '2025-12-29', end: '2026-01-02' } },
    ]);
    await f.whenStable();
    const buttons = f.nativeElement.querySelectorAll(
      '[data-range-preset]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons).toHaveLength(3);
    expect(buttons.item(1).disabled).toBe(true);
    expect(buttons.item(2).disabled).toBe(true);
    buttons[0]!.click();
    await f.whenStable();
    expect(f.componentInstance.value()).toEqual({ start: '2026-01-10', end: '2026-01-12' });
    f.componentRef.setInput('readonly', true);
    await f.whenStable();
    expect(buttons[0]!.disabled).toBe(true);
  });
  it('API-072/075/076/086 renders template contexts and classes without replacing selection semantics', async () => {
    const f = TestBed.createComponent(TemplateHost);
    await f.whenStable();
    const button = day(f.nativeElement, '2026-01-10');
    expect(button.classList.contains('holiday')).toBe(true);
    expect(button.classList.contains('event')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.querySelector('.custom-cell')?.getAttribute('data-context')).toBe(
      '2026-01-10|true|false|true|false',
    );
    expect(
      f.nativeElement
        .querySelector('[data-date="2025-12-31"] .custom-cell')
        .getAttribute('data-context'),
    ).toBe('2025-12-31|false|false|false|true');
    expect(f.nativeElement.querySelectorAll('[data-comparison="true"]')).toHaveLength(3);
    day(f.nativeElement, '2026-01-12').click();
    await f.whenStable();
    expect(f.componentInstance.date()).toBe('2026-01-12');
    expect(f.nativeElement.querySelectorAll('[data-comparison="true"]')).toHaveLength(3);
    f.nativeElement.querySelector('.custom-next').click();
    await f.whenStable();
    expect(f.nativeElement.querySelector('.custom-next').textContent).toContain('February 2026');
    expect(f.nativeElement.querySelector('.calendar-heading')).toBeNull();
  });

  it('API-073/079 shares range selection, keyboard preview and commit across two visible months', async () => {
    const f = TestBed.createComponent(HyDateRangePicker);
    f.componentRef.setInput('sharedCalendar', true);
    f.componentRef.setInput('calendarOptions', { months: 2 });
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('table[role="grid"]')).toHaveLength(2);
    const previews: unknown[] = [];
    f.componentInstance.rangePreview.subscribe((value) => previews.push(value));
    day(f.nativeElement, '2026-01-31').click();
    await f.whenStable();
    day(f.nativeElement, '2026-01-31').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight' }),
    );
    await f.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await f.whenStable();
    expect(previews.at(-1)).toEqual({ start: '2026-01-31', end: '2026-02-01' });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-02-01');
    day(f.nativeElement, '2026-02-02').click();
    await f.whenStable();
    expect(f.componentInstance.value()).toEqual({ start: '2026-01-31', end: '2026-02-02' });
    expect(day(f.nativeElement, '2026-02-02').getAttribute('aria-pressed')).toBe('true');
  });

  it('API-074/083 validates custom strategy results and commits only valid inclusive durations', async () => {
    const f = TestBed.createComponent(HyCalendar);
    f.componentRef.setInput('rangeMode', true);
    f.componentRef.setInput('minRangeDays', 3);
    f.componentRef.setInput('maxRangeDays', 5);
    f.componentRef.setInput('rangeStrategy', (date: string) => ({
      start: '2026-01-10',
      end: date,
    }));
    await f.whenStable();
    for (const end of ['2026-01-09', '2026-01-11', '2026-01-15']) {
      day(f.nativeElement, end).click();
      expect(f.componentInstance.range()).toBeNull();
    }
    day(f.nativeElement, '2026-01-12').click();
    expect(f.componentInstance.range()).toEqual({ start: '2026-01-10', end: '2026-01-12' });
    f.componentRef.setInput('isDateDisabled', (date: string) => date === '2026-01-14');
    await f.whenStable();
    day(f.nativeElement, '2026-01-14').click();
    expect(f.componentInstance.range()?.end).toBe('2026-01-12');
  });

  it('API-083 preserves a pending start after invalid duration and accepts inclusive maximum', async () => {
    const f = TestBed.createComponent(HyDateRangePicker);
    f.componentRef.setInput('sharedCalendar', true);
    f.componentRef.setInput('minRangeDays', 3);
    f.componentRef.setInput('maxRangeDays', 5);
    await f.whenStable();
    day(f.nativeElement, '2026-01-10').click();
    day(f.nativeElement, '2026-01-11').click();
    await f.whenStable();
    expect(f.componentInstance.value()).toBeNull();
    day(f.nativeElement, '2026-01-15').click();
    await f.whenStable();
    expect(f.componentInstance.value()).toBeNull();
    day(f.nativeElement, '2026-01-14').click();
    await f.whenStable();
    expect(f.componentInstance.value()).toEqual({ start: '2026-01-10', end: '2026-01-14' });
  });

  it('API-081 toggles unrelated dates without changing the single value and blocks disabled edits', async () => {
    const f = TestBed.createComponent(HyCalendar);
    f.componentRef.setInput('multiple', true);
    await f.whenStable();
    day(f.nativeElement, '2026-01-10').click();
    day(f.nativeElement, '2026-01-20').click();
    await f.whenStable();
    expect(f.componentInstance.selectedDates()).toEqual(['2026-01-10', '2026-01-20']);
    expect(f.componentInstance.value()).toBeUndefined();
    expect(day(f.nativeElement, '2026-01-10').getAttribute('aria-pressed')).toBe('true');
    day(f.nativeElement, '2026-01-10').click();
    expect(f.componentInstance.selectedDates()).toEqual(['2026-01-20']);
    f.componentRef.setInput('disabled', true);
    await f.whenStable();
    day(f.nativeElement, '2026-01-20').click();
    expect(f.componentInstance.selectedDates()).toEqual(['2026-01-20']);
  });

  it('API-082/084 applies first-day override, ISO/custom week numbers and translated chrome', async () => {
    const f = TestBed.createComponent(HyCalendar);
    f.componentRef.setInput('firstDayOfWeek', 1);
    f.componentRef.setInput('showWeekNumbers', true);
    f.componentRef.setInput('labels', {
      previous: 'Avant',
      next: 'Après',
      chooseMonth: 'Mois',
      chooseYear: 'Année',
      week: 'Semaine',
    });
    await f.whenStable();
    expect(f.nativeElement.querySelector('thead th').textContent).toBe('Semaine');
    expect(f.nativeElement.querySelectorAll('thead th')[1].textContent).toBe('Mon');
    expect(f.nativeElement.querySelector('tbody th').textContent).toBe('1');
    expect(f.nativeElement.querySelector('tbody button').getAttribute('data-date')).toBe(
      '2025-12-29',
    );
    expect(f.nativeElement.querySelector('[aria-label="Avant"]')).not.toBeNull();
    expect(f.nativeElement.querySelector('[aria-label="Après"]')).not.toBeNull();
    f.componentRef.setInput('weekNumber', () => 99);
    await f.whenStable();
    expect(f.nativeElement.querySelector('tbody th').textContent).toBe('99');
    day(f.nativeElement, '2026-01-08').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    await f.whenStable();
    expect(
      f.nativeElement.querySelector('[data-date][tabindex="0"]').getAttribute('data-date'),
    ).toBe('2026-01-05');
  });

  it.each(['visible', 'hidden', 'disabled'] as const)(
    'API-087 enforces %s adjacent-day policy',
    async (policy) => {
      const f = TestBed.createComponent(HyCalendar);
      f.componentRef.setInput('outsideDays', policy);
      await f.whenStable();
      const outside = f.nativeElement.querySelector(
        '[data-date="2025-12-31"]',
      ) as HTMLButtonElement;
      expect(outside.style.visibility).toBe(policy === 'hidden' ? 'hidden' : '');
      expect(outside.getAttribute('aria-disabled')).toBe(String(policy === 'disabled'));
      expect(outside.tabIndex).toBe(-1);
      if (policy !== 'hidden') {
        outside.click();
        expect(f.componentInstance.value()).toBe(policy === 'disabled' ? undefined : '2025-12-31');
      }
    },
  );

  it('API-078/085 opens a labelled touch dialog and reports controller lifecycle through actual attachment', async () => {
    const f = TestBed.createComponent(HyDatePicker);
    f.componentRef.setInput('touchUi', true);
    f.componentRef.setInput('dialogLabel', 'Touch date');
    const events: string[] = [];
    f.componentInstance.opening.subscribe(() => events.push('opening'));
    f.componentInstance.openedPanel.subscribe(() => events.push('opened'));
    f.componentInstance.closedPanel.subscribe(() => events.push('closed'));
    f.componentInstance.visibilityChange.subscribe((value) => events.push(`visible:${value}`));
    await f.whenStable();
    f.componentInstance.show();
    await f.whenStable();
    const dialog = document.querySelector('[role="dialog"][data-touch="true"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Touch date');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.querySelector('.cdk-overlay-backdrop')).not.toBeNull();
    expect(events).toContain('opening');
    expect(events).toContain('opened');
    f.componentInstance.hide();
    await f.whenStable();
    expect(document.querySelector('[role="dialog"][data-touch="true"]')).toBeNull();
    expect(events).toContain('closed');
    expect(events).toContain('visible:false');
    f.componentInstance.toggle();
    await f.whenStable();
    expect(f.componentInstance.opened()).toBe(true);
    f.componentRef.setInput('disabled', true);
    await f.whenStable();
    expect(f.componentInstance.opened()).toBe(false);
    f.componentInstance.show();
    expect(f.componentInstance.opened()).toBe(false);
  });

  it('API-071 moves focus through enabled year/month choices and returns focus to bounded day grid', async () => {
    const f = TestBed.createComponent(HyCalendar);
    f.componentRef.setInput('min', '2026-06-15');
    f.componentRef.setInput('max', '2027-03-10');
    f.componentRef.setInput('referenceDate', '2026-06-15');
    await f.whenStable();
    f.componentInstance.showView('multi-year');
    await f.whenStable();
    const years = [
      ...f.nativeElement.querySelectorAll('.calendar-choices button:not(:disabled)'),
    ] as HTMLButtonElement[];
    years[0]!.focus();
    years[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(years[1]);
    years[1]!.click();
    await f.whenStable();
    expect(document.activeElement?.textContent?.trim()).toBe('Jan');
    const january = document.activeElement!;
    january.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement?.textContent?.trim()).toBe('Mar');
    (document.activeElement as HTMLButtonElement).click();
    await f.whenStable();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2027-03-01');
  });

  it('API-071 supports bounded Jalali year/month drill-down without changing the selected value', async () => {
    const f = TestBed.createComponent(HyCalendar);
    const adapter = new HyJalaliDateAdapter();
    f.componentRef.setInput('adapter', adapter);
    f.componentRef.setInput('min', '2025-03-21');
    f.componentRef.setInput('max', '2026-03-20');
    f.componentRef.setInput('referenceDate', '2025-03-21');
    await f.whenStable();
    f.componentInstance.showView('multi-year');
    await f.whenStable();
    const years = [
      ...f.nativeElement.querySelectorAll('.calendar-choices button'),
    ] as HTMLButtonElement[];
    expect(
      years.filter((button) => !button.disabled).map((button) => button.textContent?.trim()),
    ).toEqual(['1404']);
    years.find((button) => button.textContent?.trim() === '1404')!.click();
    await f.whenStable();
    (f.nativeElement.querySelectorAll('.calendar-choices button')[11] as HTMLButtonElement).click();
    await f.whenStable();
    const active = f.nativeElement.querySelector('[data-date][tabindex="0"]')!;
    expect(adapter.parts(active.getAttribute('data-date')!).month).toBe(12);
    expect(active.getAttribute('aria-disabled')).toBe('false');
    expect(f.componentInstance.value()).toBeUndefined();
    expect(f.debugElement.query(By.directive(HyCalendar))).toBeNull(); // root calendar has no nested duplicate
  });
});
