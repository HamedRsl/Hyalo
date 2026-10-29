import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyMotion } from '../motion/motion';
import { HyInteractive } from './state';
import { HyReveal } from './reveal';
import { HyRipple } from './ripple';

type IoCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

class FakeObserver {
  static last: FakeObserver;
  constructor(readonly callback: IoCallback) {
    FakeObserver.last = this;
  }
  observe(): void {}
  disconnect(): void {}
  emit(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }]);
  }
}

@Component({
  imports: [HyInteractive, HyReveal, HyRipple],
  template: `
    <button hyInteractive hyRipple>Press</button>
    <section hyReveal [revealDelay]="120">Below the fold</section>
  `,
})
class Host {}

describe('interaction directives', () => {
  beforeEach(() => vi.stubGlobal('IntersectionObserver', FakeObserver));
  afterEach(() => vi.unstubAllGlobals());

  it('reports hover and press as data attributes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    button.dispatchEvent(new PointerEvent('pointerdown'));
    await fixture.whenStable();
    expect(button.dataset['hover']).toBe('true');
    expect(button.dataset['press']).toBe('true');
    button.dispatchEvent(new PointerEvent('pointerleave'));
    await fixture.whenStable();
    expect(button.hasAttribute('data-hover')).toBe(false);
  });

  it('ignores hover from touch', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
    await fixture.whenStable();
    expect(button.hasAttribute('data-hover')).toBe(false);
  });

  it('hides off-screen content and shows it on intersection', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    expect(section.hasAttribute('data-hy-reveal')).toBe(false);
    FakeObserver.last.emit(false);
    expect(section.dataset['hyReveal']).toBe('hidden');
    FakeObserver.last.emit(true);
    expect(section.dataset['hyReveal']).toBe('shown');
    expect(section.style.getPropertyValue('--hy-reveal-delay')).toBe('120ms');
  });

  it('leaves content that starts on screen untouched', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    FakeObserver.last.emit(true);
    expect(fixture.nativeElement.querySelector('section').hasAttribute('data-hy-reveal')).toBe(
      false,
    );
  });

  it('never hides content with reduced motion', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const observer = vi.fn();
    vi.stubGlobal('IntersectionObserver', observer);
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(observer).not.toHaveBeenCalled();
    TestBed.inject(HyMotion).setReduced(null);
  });

  it('adds and cleans up a ripple on press', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
    const wave = button.querySelector('.hy-ripple');
    expect(wave?.getAttribute('aria-hidden')).toBe('true');
    wave?.dispatchEvent(new Event('animationend'));
    expect(button.querySelector('.hy-ripple')).toBeNull();
  });
});
