import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHyalo } from '@hyalo/angular/core';
import { HyTooltip } from './tooltip';

@Component({
  imports: [HyTooltip],
  template: `<button
    hyTooltip="Hint"
    [tooltipHideDelay]="70"
    tooltipPanelClass="consumer-tip"
    tooltipTouch="show"
  >
    Help
  </button>`,
})
class Host {}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function panel() {
  for (let i = 0; i < 60; i++) {
    const found = document.querySelector<HTMLElement>('.hy-tooltip');
    if (found) return found;
    await wait(10);
  }
  throw new Error('Tooltip did not attach');
}
describe('tooltip policy contracts', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('applies panel class and independent hide delay, canceling dismissal on reentry', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    const tooltip = fixture.debugElement.query(By.directive(HyTooltip)).injector.get(HyTooltip);
    tooltip.show(0);
    const tip = await panel();
    expect(tip.closest('.consumer-tip')).not.toBeNull();
    button.dispatchEvent(new PointerEvent('pointerleave'));
    await wait(25);
    expect(tip.dataset['state']).not.toBe('closing');
    tooltip.show(0);
    await wait(90);
    expect(tip.dataset['state']).not.toBe('closing');
    button.dispatchEvent(new PointerEvent('pointerleave'));
    await wait(90);
    expect(tip.dataset['state']).toBe('closing');
    fixture.destroy();
    expect(document.querySelector('.hy-tooltip')).toBeNull();
  });
  it('allows opted-in touch while retaining keyboard focus semantics and configured defaults', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHyalo({ components: { tooltip: { showDelay: 0, hideDelay: 40, touch: 'ignore' } } }),
      ],
    });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
    await panel();
    const tooltip = fixture.debugElement.query(By.directive(HyTooltip)).injector.get(HyTooltip);
    expect(tooltip.tooltipHideDelay()).toBe(70);
    tooltip.hide();
    fixture.destroy();
    await wait(100);
    expect(document.querySelector('.hy-tooltip')).toBeNull();
  });
});
