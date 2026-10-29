import { expectNoAxeViolations } from '../../testing/axe';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHyalo } from '../core/config';
import { HyFidelity } from '../fidelity/fidelity';
import { HyButton } from './button';

@Component({
  imports: [HyButton],
  template: `
    <button hyButton variant="glass" [loading]="loading()" (click)="clicks = clicks + 1">
      Save
    </button>
    <a hyButton href="/x" [disabled]="true" (click)="clicks = clicks + 1">Link</a>
    <button hyButton disabled>Off</button>
  `,
})
class Host {
  readonly loading = signal(false);
  clicks = 0;
}

describe('HyButton', () => {
  it('reflects variant, size and tone defaults', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.dataset['variant']).toBe('glass');
    expect(button.dataset['size']).toBe('md');
    expect(button.dataset['tone']).toBe('accent');
    expect(button.classList).toContain('hy-glass');
    expect(button.dataset['material']).toBe('frosted');
  });

  it('follows the configured material and goes solid on the low tier', async () => {
    TestBed.configureTestingModule({ providers: [provideHyalo({ material: 'clear' })] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.dataset['material']).toBe('clear');
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    expect(button.dataset['material']).toBe('solid');
  });

  it('blocks clicks while loading but stays focusable', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(fixture.componentInstance.clicks).toBe(0);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(false);
  });

  it('disables links with aria-disabled and removes them from the tab order', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    link.click();
    expect(fixture.componentInstance.clicks).toBe(0);
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.tabIndex).toBe(-1);
  });

  it('uses the native disabled attribute on buttons', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const off = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    expect(off.disabled).toBe(true);
  });
});

describe('HyButton accessibility', () => {
  it('has no axe violations', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
