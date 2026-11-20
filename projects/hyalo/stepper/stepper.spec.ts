import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { HY_STEPPER, HyStepper } from './stepper';

@Component({
  imports: [HY_STEPPER],
  template: `<hy-stepper><hy-step label="Account" [control]="control">Account</hy-step><hy-step label="Confirm">Confirm</hy-step></hy-stepper>`,
})
class Host {
  readonly control = new FormControl('', { nonNullable: true, validators: Validators.required });
}

describe('stepper form gating', () => {
  it('reacts to validity and pending changes on the same FormControl instance', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const stepper = fixture.debugElement.query(By.directive(HyStepper)).componentInstance as HyStepper;
    stepper.select(1);
    expect(stepper.activeIndex()).toBe(0);
    fixture.componentInstance.control.setValue('valid');
    await fixture.whenStable();
    stepper.select(1);
    expect(stepper.activeIndex()).toBe(1);
    stepper.select(0);
    fixture.componentInstance.control.markAsPending();
    await fixture.whenStable();
    stepper.select(1);
    expect(stepper.activeIndex()).toBe(0);
    fixture.componentInstance.control.updateValueAndValidity();
    await fixture.whenStable();
    stepper.select(1);
    expect(stepper.activeIndex()).toBe(1);
  });
});
