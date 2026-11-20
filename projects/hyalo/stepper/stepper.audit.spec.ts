import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { HY_STEPPER, HyStepper } from './stepper';
@Component({
  imports: [HY_STEPPER],
  template: `<hy-stepper
    orientation="vertical"
    [linear]="false"
    [headerNavigation]="headers()"
    progress="dot"
  >
    <hy-step label="First" [control]="control" subtitle="Details" error="Check" [process]="true">
      <ng-template hyStepLabel><strong>Custom label</strong></ng-template>
      <ng-template hyStepIndicator let-i let-active="active"
        ><b>{{ i }}:{{ active }}</b></ng-template
      >
    </hy-step>
    <hy-step label="Second" [destroyOnHide]="destroy()"
      ><ng-template hyStepContent><input class="lazy" /></ng-template
    ></hy-step>
    <hy-step label="Hidden" [hidden]="true" />
  </hy-stepper>`,
})
class Host {
  readonly control = new FormControl('original');
  readonly headers = signal(true);
  readonly destroy = signal(false);
}
describe('API-265 through API-272 stepper presentation/lifecycle', () => {
  it('renders labels metadata and custom indicators, lazily retains/destroys, resets controls and blocks headers', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const stepper = fixture.debugElement.query(By.directive(HyStepper))
      .componentInstance as HyStepper;
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('hy-stepper')!.getAttribute('data-orientation')).toBe('vertical');
    expect(root.querySelectorAll('nav button')).toHaveLength(2);
    expect(root.querySelector('strong')!.textContent).toBe('Custom label');
    expect(root.querySelector('b')!.textContent).toBe('0:true');
    expect(root.querySelector('nav button')!.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('nav button')!.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('.lazy')).toBeNull();
    const changes: unknown[] = [],
      complete: number[] = [];
    stepper.selectionChange.subscribe((value) => changes.push(value));
    stepper.transitionComplete.subscribe((value) => complete.push(value));
    stepper.select(1);
    await fixture.whenStable();
    const input = root.querySelector<HTMLInputElement>('.lazy')!;
    expect(input).not.toBeNull();
    expect(root.querySelectorAll('nav button')[1]!.getAttribute('aria-current')).toBe('step');
    expect(changes).toEqual([{ previous: 0, current: 1 }]);
    expect(complete).toEqual([1]);
    stepper.select(0);
    await fixture.whenStable();
    expect(root.querySelector('.lazy')).toBe(input);
    fixture.componentInstance.destroy.set(true);
    await fixture.whenStable();
    expect(root.querySelector('.lazy')).toBeNull();
    fixture.componentInstance.control.setValue('changed');
    stepper.reset();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect(stepper.activeIndex()).toBe(0);
    fixture.componentInstance.headers.set(false);
    await fixture.whenStable();
    expect(
      [...root.querySelectorAll<HTMLButtonElement>('nav button')].every(
        (button) => button.disabled,
      ),
    ).toBe(true);
    stepper.next();
    await fixture.whenStable();
    expect(stepper.activeIndex()).toBe(1);
  });
});
