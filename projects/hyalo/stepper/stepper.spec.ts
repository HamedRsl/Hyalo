import { Component } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { HY_STEPPER, HyStepper } from './stepper';

@Component({
  imports: [HY_STEPPER],
  template: `<hy-stepper [animationDuration]="200"
    ><hy-step label="Account" [control]="control">Account</hy-step
    ><hy-step label="Confirm">Confirm</hy-step></hy-stepper
  >`,
})
class Host {
  readonly control = new FormControl('', { nonNullable: true, validators: Validators.required });
}

describe('stepper form gating', () => {
  it('waits for the current animation and discards an interrupted completion', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.control.setValue('ready');
    await fixture.whenStable();
    const stepper = fixture.debugElement.query(By.directive(HyStepper))
      .componentInstance as HyStepper;
    const panels = fixture.nativeElement.querySelectorAll('hy-step') as NodeListOf<HTMLElement>;
    let finishFirst!: () => void;
    let rejectSecond!: (reason: Error) => void;
    const first = new Promise<void>((resolve) => { finishFirst = resolve; });
    const second = new Promise<void>((_resolve, reject) => { rejectSecond = reject; });
    const cancel = vi.fn(() => rejectSecond(new Error('canceled')));
    Object.defineProperty(panels[1]!, 'animate', {
      value: vi.fn(() => ({ finished: second, cancel })),
    });
    Object.defineProperty(panels[0]!, 'animate', {
      value: vi.fn(() => ({ finished: first, cancel: vi.fn() })),
    });
    const values: number[] = [];
    stepper.transitionComplete.subscribe((index) => values.push(index));
    stepper.select(1);
    await fixture.whenStable();
    expect(values).toEqual([]);
    stepper.select(0);
    await fixture.whenStable();
    expect(cancel).toHaveBeenCalledOnce();
    expect(values).toEqual([]);
    finishFirst();
    await fixture.whenStable();
    expect(values).toEqual([0]);
  });

  it('reacts to validity and pending changes on the same FormControl instance', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const stepper = fixture.debugElement.query(By.directive(HyStepper))
      .componentInstance as HyStepper;
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
