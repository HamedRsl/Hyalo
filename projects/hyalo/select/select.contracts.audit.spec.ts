import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HyFidelity } from '@hyalo/angular/core';
import { HySelect, type HySelectOption } from './select';

interface Item {
  id: number;
}
@Component({
  imports: [HySelect],
  template: `<hy-select
      [options]="options()"
      [(value)]="value"
      [compareWith]="compare"
      [selectedTemplate]="selected"
      [groupTemplate]="group"
      [headerTemplate]="header"
      [footerTemplate]="footer"
      panelClass="audit-pane"
      [popupWidth]="320"
    />
    <ng-template #selected let-value let-option="option"
      ><b class="selection">{{ value?.id }}:{{ option?.label }}</b></ng-template
    >
    <ng-template #group let-label
      ><strong>{{ label }}</strong></ng-template
    >
    <ng-template #header><p>Choices header</p></ng-template>
    <ng-template #footer><p>Choices footer</p></ng-template>`,
})
class Host {
  readonly value = signal<Item | undefined>({ id: 2 });
  readonly compare = (a: Item, b: Item) => a.id === b.id;
  readonly options = signal<readonly HySelectOption<Item>[]>([
    { key: 'a', value: { id: 1 }, label: 'Same' },
    { key: 'b', value: { id: 2 }, label: 'Same', group: { key: 'g', label: 'Group' } },
  ]);
}

describe('select existing contracts audit', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('compares replacement objects with duplicate labels and renders consumer contexts and width', async () => {
    TestBed.inject(HyFidelity).setTier('high');
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const select = fixture.debugElement.query(By.directive(HySelect))
      .componentInstance as HySelect<Item>;
    expect(fixture.nativeElement.querySelector('.selection').textContent).toBe('2:Same');
    fixture.componentInstance.options.update((items) =>
      items.map((o) => ({
        ...o,
        value: { ...o.value },
        label: o.key === 'b' ? 'Replacement' : o.label,
      })),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.selection').textContent).toBe('2:Replacement');
    select.open();
    await fixture.whenStable();
    const pane = document.querySelector<HTMLElement>('.audit-pane')!;
    expect(pane.style.width).toBe('320px');
    expect(pane.textContent).toContain('Choices header');
    expect(pane.textContent).toContain('Choices footer');
    expect(pane.querySelector('strong')?.textContent).toBe('Group');
    expect(pane.querySelector('[role="group"][aria-label="Group"]')).not.toBeNull();
    expect(pane.querySelector('[aria-selected="true"]')?.textContent).toContain('Replacement');
    (pane.querySelector('[role="option"]') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()?.id).toBe(1);
    expect(select.opened()).toBe(false);
  });
  it('bounds virtual options and navigates to an initially unrendered enabled option', async () => {
    TestBed.inject(HyFidelity).setTier('high');
    const fixture = TestBed.createComponent(HySelect<number>);
    fixture.componentRef.setInput(
      'options',
      Array.from({ length: 1000 }, (_, value) => ({
        value,
        label: `Option ${value}`,
        disabled: value === 999,
      })),
    );
    fixture.componentRef.setInput('virtualized', true);
    await fixture.whenStable();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBeLessThan(12);
    const end = document.querySelector('[aria-posinset="999"]');
    expect(end?.getAttribute('aria-setsize')).toBe('1000');
    expect(trigger.getAttribute('aria-activedescendant')).toBe(end?.id);
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(998);
  });
  it('public controller emits once per state change, restores focus and refuses disabled opening', async () => {
    TestBed.inject(HyFidelity).setTier('high');
    const fixture = TestBed.createComponent(HySelect<string>);
    fixture.componentRef.setInput('options', [{ value: 'a', label: 'A' }]);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const select = fixture.componentInstance;
    const opened = vi.fn(),
      closed = vi.fn();
    select.openedPanel.subscribe(opened);
    select.closedPanel.subscribe(closed);
    select.open();
    await fixture.whenStable();
    select.open();
    await fixture.whenStable();
    expect(opened).toHaveBeenCalledTimes(1);
    select.close();
    await fixture.whenStable();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('[role="combobox"]'));
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    select.toggle();
    await fixture.whenStable();
    expect(select.opened()).toBe(false);
    fixture.destroy();
    expect(document.querySelector('.hy-select__panel')).toBeNull();
  });
  it('creates a trimmed entered value only on commit, clears the draft and ignores empty commits', async () => {
    TestBed.inject(HyFidelity).setTier('high');
    const fixture = TestBed.createComponent(HySelect<string>);
    fixture.componentRef.setInput('options', []);
    const create = vi.fn((text: string) => text.toUpperCase());
    fixture.componentRef.setInput('createValue', create);
    await fixture.whenStable();
    fixture.componentInstance.open();
    await fixture.whenStable();
    const input = document.querySelector<HTMLInputElement>('.hy-select__panel input')!;
    input.value = '  custom  ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(create).toHaveBeenCalledWith('custom');
    expect(fixture.componentInstance.value()).toBe('CUSTOM');
    fixture.componentInstance.open();
    await fixture.whenStable();
    const next = document.querySelector<HTMLInputElement>('.hy-select__panel input')!;
    expect(next.value).toBe('');
    next.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(create).toHaveBeenCalledTimes(1);
  });
});
