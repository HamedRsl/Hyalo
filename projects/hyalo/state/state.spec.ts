import { TestBed } from '@angular/core/testing';
import { HyErrorState, HyLoadingState } from './state';
import { expectNoAxeViolations } from '../src/testing/axe';

describe('HyErrorState', () => {
  it('offers retry only with a label and lets the host own its busy state', async () => {
    const f = TestBed.createComponent(HyErrorState);
    f.componentRef.setInput('heading', 'Report unavailable');
    await f.whenStable();
    expect(f.nativeElement.querySelector('button')).toBeNull();
    const retry = vi.fn();
    f.componentInstance.retry.subscribe(retry);
    f.componentRef.setInput('retryLabel', 'Try again');
    await f.whenStable();
    const button = f.nativeElement.querySelector('button') as HTMLButtonElement;
    button.focus();
    button.click();
    expect(retry).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button);
    f.componentRef.setInput('retrying', true);
    await f.whenStable();
    button.click();
    expect(retry).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(f.nativeElement);
    f.componentRef.setInput('compact', true);
    f.componentRef.setInput('description', 'Check your connection');
    f.componentRef.setInput('live', 'off');
    await f.whenStable();
    expect(f.nativeElement.getAttribute('aria-live')).toBe('off');
    expect(f.nativeElement.textContent).toContain('Check your connection');
    await expectNoAxeViolations(f.nativeElement);
  });
});
describe('HyLoadingState', () => {
  it('keeps one announcement outside the decorative spinner', async () => {
    const f = TestBed.createComponent(HyLoadingState);
    f.componentRef.setInput('label', 'Loading records');
    await f.whenStable();
    expect(f.nativeElement.querySelector('[aria-live]').textContent).toBe('Loading records');
    expect(f.nativeElement.querySelector('hy-spinner').getAttribute('aria-hidden')).toBe('true');
    await expectNoAxeViolations(f.nativeElement);
  });
});
