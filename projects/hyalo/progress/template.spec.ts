import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyProgress } from './progress';
@Component({
  imports: [HyProgress],
  template: `<hy-progress
      label="Upload"
      [min]="20"
      [max]="60"
      [value]="30"
      [labelTemplate]="label"
    /><ng-template #label let-value let-percent="percent"
      ><b>{{ value }} at {{ percent }}%</b></ng-template
    >`,
})
class Host {}
describe('progress label context', () => {
  it('renders raw value and normalized percent into consumer markup', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    expect(f.nativeElement.querySelector('.value-label b').textContent).toBe('30 at 25%');
    expect(f.nativeElement.querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe(
      '30',
    );
  });
});
