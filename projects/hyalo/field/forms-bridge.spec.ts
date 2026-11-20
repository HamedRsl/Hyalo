import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HyNumberInput } from '@hyalo/angular/number-input';
import { HyForms } from './forms-bridge';

@Component({
  imports: [HyNumberInput, HyForms, ReactiveFormsModule],
  template: '<hy-number-input #amount [hyForms]="amount" [formControl]="control" />',
})
class Host {
  readonly control = new FormControl<number | null>(12);
}

describe('HyForms', () => {
  it('bridges writes, user input, reset, touched and disabled without echoing writes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('12');
    const values: (number | null)[] = [];
    fixture.componentInstance.control.valueChanges.subscribe(value => values.push(value));
    fixture.componentInstance.control.setValue(25);
    await fixture.whenStable();
    expect(input.value).toBe('25');
    expect(values).toEqual([25]);
    input.value = '30';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(30);
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    fixture.componentInstance.control.enable();
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(input.disabled).toBe(false);
    expect(values).toEqual([25, 30, 30, 30, null]);
  });
});
