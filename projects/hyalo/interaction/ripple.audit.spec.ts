import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyRipple } from './ripple';
import { HyMotion } from '@hyalo/angular/motion';

@Component({
  imports: [HyRipple],
  template:
    '<button hyRipple [rippleRadius]="12" [rippleDuration]="240" [rippleCentered]="true">Press</button>',
})
class Host {
  readonly ripple = viewChild.required(HyRipple);
}

describe('ripple controller', () => {
  it('launches configured centered waves and clears only its own decorations', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 40,
      left: 0,
      top: 0,
    } as DOMRect);
    const wave = fixture.componentInstance.ripple().launch(3, 7);
    expect(wave?.style.getPropertyValue('--hy-ripple-size')).toBe('24px');
    expect(wave?.style.getPropertyValue('--hy-ripple-x')).toBe('50px');
    expect(wave?.style.getPropertyValue('--hy-ripple-y')).toBe('20px');
    expect(wave?.style.animationDuration).toBe('240ms');
    fixture.componentInstance.ripple().clear();
    expect(button.querySelector('.hy-ripple')).toBeNull();
    expect(button.textContent).toBe('Press');
    TestBed.inject(HyMotion).setReduced(true);
    expect(fixture.componentInstance.ripple().launch()).toBeNull();
    TestBed.inject(HyMotion).setReduced(null);
  });
});
