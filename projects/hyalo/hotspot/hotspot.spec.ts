import { TestBed } from '@angular/core/testing';
import { HyHotspot } from './hotspot';
import { expectNoAxeViolations } from '../src/testing/axe';

describe('HyHotspot detail panel', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove()),
  );

  it('opens details next to the trigger and returns focus on Escape', async () => {
    const fixture = TestBed.createComponent(HyHotspot);
    fixture.componentRef.setInput('label', 'Sapphire crystal');
    fixture.componentRef.setInput('position', { x: 50, y: 40 });
    fixture.componentRef.setInput('description', 'Scratch-resistant sapphire.');
    fixture.componentRef.setInput('mode', 'pin');
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    await vi.waitFor(() => expect(document.querySelector('.hy-popover')).toBeTruthy());
    await fixture.whenStable();
    const panel = document.querySelector<HTMLElement>('.hy-popover')!;
    expect(panel.textContent).toContain('Scratch-resistant sapphire.');
    expect(panel.getAttribute('aria-label')).toBe('Sapphire crystal');
    expect(panel.dataset['material']).toBe('solid');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.open()).toBe(true);
    await expectNoAxeViolations(panel);
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('retains the plain action API without a description', async () => {
    const fixture = TestBed.createComponent(HyHotspot);
    fixture.componentRef.setInput('label', 'Inspect case');
    fixture.componentRef.setInput('position', { x: 25, y: 60 });
    const activated = vi.fn();
    fixture.componentInstance.activated.subscribe(activated);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    expect(activated).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.querySelector('.hy-popover')).toBeNull();
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
