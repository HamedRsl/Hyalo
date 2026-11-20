import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_STATE } from './state';
@Component({
  imports: [HY_STATE],
  template: `<hy-result-state
      heading="Payment saved"
      description="Receipt ready"
      variant="success"
      live="polite"
    >
      <svg hyStateIllustration aria-label="Receipt"></svg><button>View receipt</button>
    </hy-result-state>
    <hy-error-state heading="Failed"
      ><b hyStateIllustration>Offline</b><button>Help</button></hy-error-state
    >
    <hy-loading-state label="Loading"><b hyStateIllustration>Preparing</b></hy-loading-state>`,
})
class Host {}
describe('state presentation', () => {
  it('supports result variants and dedicated illustration slots, keeping actions distinct', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const result = f.nativeElement.querySelector('hy-result-state');
    expect(result.getAttribute('data-variant')).toBe('success');
    expect(result.getAttribute('aria-live')).toBe('polite');
    expect(result.querySelector('h2')?.textContent).toBe('Payment saved');
    expect(result.querySelector('.actions button')?.textContent).toBe('View receipt');
    expect(result.querySelector('.actions svg')).toBeNull();
    const error = f.nativeElement.querySelector('hy-error-state');
    expect(error.querySelector('.illustration b')?.textContent).toBe('Offline');
    expect(error.querySelector('.projected-actions b')).toBeNull();
    const loading = f.nativeElement.querySelector('hy-loading-state');
    expect(loading.querySelector('.illustration b')?.textContent).toBe('Preparing');
    expect(loading.querySelector('hy-spinner')).toBeNull();
  });
});
