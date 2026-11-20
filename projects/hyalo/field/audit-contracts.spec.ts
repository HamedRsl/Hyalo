import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HyNumberInput } from '@hyalo/angular/number-input';
import { describe, expect, it } from 'vitest';
import { HyForms } from './forms-bridge';
import { HyField, type HyErrorStateMatcher } from './field';

@Component({
  imports: [HyNumberInput, HyForms, ReactiveFormsModule, FormsModule],
  template: `<form [formGroup]="group"><hy-number-input #amount [hyForms]="amount" formControlName="amount" /></form>
    <hy-number-input #other [hyForms]="other" [(ngModel)]="value" />`,
})
class BridgeHost {
  readonly group = new FormGroup({ amount: new FormControl<number | null>(4) });
  value: number | null = 7;
}

@Component({
  imports: [HyField, HyNumberInput],
  template: `<hy-field label="Amount" [submitted]="submitted()" [errorStateMatcher]="matcher" [error]="server()"><hy-number-input [invalid]="true" [errors]="errors" [dirty]="dirty()" [pending]="pending()" /></hy-field>`,
})
class PolicyHost {
  readonly errors = [{ kind: 'required', message: 'Required amount' }];
  readonly submitted = signal(false);
  readonly dirty = signal(false);
  readonly pending = signal(false);
  readonly server = signal('');
  readonly matcher: HyErrorStateMatcher = (state) => state.invalid && !state.pending && (state.dirty || state.submitted);
}

describe('forms audit contracts', () => {
  it('supports formControlName and ngModel writes and user changes', async () => {
    const fixture = TestBed.createComponent(BridgeHost);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0]!.value).toBe('4');
    expect(inputs[1]!.value).toBe('7');
    inputs[0]!.value = '9';
    inputs[0]!.dispatchEvent(new Event('input'));
    inputs[1]!.value = '11';
    inputs[1]!.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.group.controls.amount.value).toBe(9);
    expect(fixture.componentInstance.value).toBe(11);
    fixture.componentInstance.group.reset();
    fixture.componentInstance.value = null;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(inputs[0]!.value).toBe('');
    expect(inputs[1]!.value).toBe('');
  });

  it('passes dirty and pending metadata into the reusable field error policy', async () => {
    const fixture = TestBed.createComponent(PolicyHost);
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('hy-field') as HTMLElement;
    expect(field.hasAttribute('data-invalid')).toBe(false);
    fixture.componentInstance.dirty.set(true);
    await fixture.whenStable();
    expect(field.hasAttribute('data-invalid')).toBe(true);
    fixture.componentInstance.pending.set(true);
    await fixture.whenStable();
    expect(field.hasAttribute('data-invalid')).toBe(false);
    expect(field.getAttribute('data-status')).toBe('pending');
    fixture.componentInstance.server.set('Server error');
    await fixture.whenStable();
    expect(field.textContent).toContain('Server error');
    expect(field.getAttribute('data-status')).toBe('error');
  });
});
