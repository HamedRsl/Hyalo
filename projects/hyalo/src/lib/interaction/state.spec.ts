import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FocusMonitor } from '@angular/cdk/a11y';
import { HyInteractive } from './state';

@Component({
  imports: [HyInteractive],
  template: `<button hyInteractive>Press</button>`,
})
class Host {}

// Hover and the touch rule are covered with the other directives in
// interaction/interaction.spec.ts.
describe('HyInteractive', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, button };
  }

  it('releases press on pointerup and pointercancel', async () => {
    const { fixture, button } = await setup();
    for (const release of ['pointerup', 'pointercancel']) {
      button.dispatchEvent(new PointerEvent('pointerdown'));
      await fixture.whenStable();
      expect(button.dataset['press']).toBe('true');
      button.dispatchEvent(new PointerEvent(release));
      await fixture.whenStable();
      expect(button.hasAttribute('data-press')).toBe(false);
    }
  });

  it('marks focus from the keyboard only', async () => {
    const { fixture, button } = await setup();
    const focusMonitor = TestBed.inject(FocusMonitor);
    focusMonitor.focusVia(button, 'keyboard');
    await fixture.whenStable();
    expect(button.dataset['focusVisible']).toBe('true');
    button.blur();
    focusMonitor.focusVia(button, 'mouse');
    await fixture.whenStable();
    expect(button.hasAttribute('data-focus-visible')).toBe(false);
  });
});
