import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyNumberTicker } from './number-ticker';
@Component({
  imports: [HyNumberTicker],
  template: `<ng-template #value let-number let-text="formatted"
      ><b>{{ number }}:{{ text }}</b></ng-template
    >
    <ng-template #loading><em>Waiting</em></ng-template>
    <hy-number-ticker
      [value]="42"
      [valueTemplate]="value"
      [loadingTemplate]="loading"
      [loading]="busy()"
    />`,
})
class Host {
  readonly busy = signal(true);
}
describe('API-183 ticker templates', () => {
  it('switches loading content to custom formatted values without injecting HTML', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('em').textContent).toBe('Waiting');
    fixture.componentInstance.busy.set(false);
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('em')).toBeNull();
    expect(fixture.nativeElement.querySelector('b').textContent).toBe('42:42');
    expect(fixture.nativeElement.querySelector('.sr').textContent).toBe('42');
  });
});
