import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyCheckbox } from './checkbox';
import { HySwitch } from './switch';
import { HyCheckboxGroup, HyValueCheckbox } from './checkbox-group';

@Component({
  imports: [HyCheckboxGroup, HyValueCheckbox, HySwitch],
  template: `<hy-checkbox-group
      label="Plans"
      [options]="options"
      [(value)]="selected"
      [compareWith]="compare"
    />
    <hy-value-checkbox [(value)]="value" trueValue="yes" falseValue="no">Agree</hy-value-checkbox>
    <hy-switch
      [controlled]="true"
      [pending]="pending()"
      [checked]="checked()"
      (toggleRequested)="requested.set($event)"
    >
      Notify <span hySwitchOn>Enabled</span><span hySwitchOff>Disabled</span>
    </hy-switch>`,
})
class Host {
  readonly options = [
    { value: { id: 1 }, label: 'One' },
    { value: { id: 2 }, label: 'Two', disabled: true },
  ];
  readonly selected = signal([{ id: 1 }]);
  readonly compare = (a: { id: number }, b: { id: number }) => a.id === b.id;
  readonly value = signal('no');
  readonly checked = signal(false);
  readonly pending = signal(false);
  readonly requested = signal<boolean | null>(null);
}

describe('choice audit contracts', () => {
  it('updates array and nonboolean values through native checkbox interactions', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const inputs: NodeListOf<HTMLInputElement> = f.nativeElement.querySelectorAll('input');
    expect(inputs[0]!.checked).toBe(true);
    inputs[0]!.click();
    await f.whenStable();
    expect(f.componentInstance.selected()).toEqual([]);
    inputs[0]!.click();
    inputs[1]!.click();
    inputs[2]!.click();
    await f.whenStable();
    expect(f.componentInstance.selected()).toEqual([{ id: 1 }]);
    expect(f.componentInstance.value()).toBe('yes');
  });

  it('requests controlled switch changes without changing native or model state and blocks pending requests', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('[role=switch]');
    input.click();
    await f.whenStable();
    expect(f.componentInstance.requested()).toBe(true);
    expect(input.checked).toBe(false);
    expect(f.nativeElement.querySelector('hy-switch').textContent).toContain('Disabled');
    expect(f.nativeElement.querySelector('[hySwitchOn]')).toBeNull();
    f.componentInstance.checked.set(true);
    f.componentInstance.pending.set(true);
    f.componentInstance.requested.set(null);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-switch').textContent).toContain('Enabled');
    input.click();
    expect(f.componentInstance.requested()).toBeNull();
    expect(input.disabled).toBe(true);
  });

  it('preserves indeterminate for check-only policy and blocks readonly, noop and focusable-disabled activation', async () => {
    const f = TestBed.createComponent(HyCheckbox);
    f.componentRef.setInput('indeterminate', true);
    f.componentRef.setInput('clickAction', 'check');
    f.componentRef.setInput('labelPosition', 'before');
    await f.whenStable();
    const input: HTMLInputElement = f.nativeElement.querySelector('input');
    input.click();
    await f.whenStable();
    expect(f.componentInstance.checked()).toBe(true);
    expect(f.componentInstance.indeterminate()).toBe(true);
    expect(f.nativeElement.dataset.labelPosition).toBe('before');
    for (const policy of ['readonly', 'noop', 'disabled']) {
      f.componentRef.setInput('readonly', policy === 'readonly');
      f.componentRef.setInput('clickAction', policy === 'noop' ? 'noop' : 'check');
      f.componentRef.setInput('disabled', policy === 'disabled');
      f.componentRef.setInput('disabledFocusable', true);
      await f.whenStable();
      input.click();
      await f.whenStable();
      expect(input.disabled).toBe(false);
      expect(input.checked).toBe(true);
      expect(f.componentInstance.checked()).toBe(true);
    }
  });
});
