import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyButton } from './button';

@Component({
  imports: [HyButton],
  template: `<button hyButton [disabled]="true" disabledFocusable (click)="clicks = clicks + 1">
      Save
    </button>
    <button hyButton loading><span hyButtonLoading>Working</span>Submit</button>`,
})
class Host {
  clicks = 0;
}

describe('button audit contracts', () => {
  it('keeps disabled controls focusable without permitting application activation', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const button: HTMLButtonElement = f.nativeElement.querySelector('button');
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    button.click();
    expect(f.componentInstance.clicks).toBe(0);
  });
  it('replaces the default spinner with custom loading content', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const spinner: HTMLElement = f.nativeElement.querySelector('.hy-button__spinner');
    expect(spinner.textContent?.trim()).toBe('Working');
    expect(spinner.querySelector('svg')).toBeNull();
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
  });
});
