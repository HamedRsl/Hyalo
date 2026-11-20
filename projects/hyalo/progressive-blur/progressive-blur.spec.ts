import { TestBed } from '@angular/core/testing';
import { HyFidelity, HyMotion, provideHyalo } from '@hyalo/angular';
import { HyProgressiveBlur } from './progressive-blur';

describe('progressive blur static lifecycle', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'high' })] }),
  );
  afterEach(() => {
    document.documentElement.removeAttribute('data-hy-motion');
    vi.restoreAllMocks();
  });

  it('keeps decorative edges out of focus and the accessibility tree across tier changes', async () => {
    const fixture = TestBed.createComponent(HyProgressiveBlur);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(element.getAttribute('data-edge')).toBe('top');
    expect(element.querySelectorAll('i')).toHaveLength(2);
    expect(element.classList.contains('blur')).toBe(true);
    const fidelity = TestBed.inject(HyFidelity);
    for (const tier of ['medium', 'low', 'high'] as const) {
      fidelity.setTier(tier);
      await fixture.whenStable();
      expect(element.classList.contains('blur')).toBe(tier === 'high');
      expect(element.querySelectorAll('i')).toHaveLength(2);
      expect(element.querySelector('button, input, [tabindex]')).toBeNull();
    }
    fixture.componentRef.setInput('edge', 'bottom');
    await fixture.whenStable();
    expect(element.getAttribute('data-edge')).toBe('bottom');
  });

  it('does not acquire animation work or change focus under reduced motion and destroy', async () => {
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();
    const fixture = TestBed.createComponent(HyProgressiveBlur);
    await fixture.whenStable();
    const request = vi.spyOn(window, 'requestAnimationFrame');
    TestBed.inject(HyMotion).setReduced(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains('blur')).toBe(true);
    // Blur is a static material effect, not a movement; reduced motion need not remove it.
    request.mockClear();
    fixture.destroy();
    expect(request).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
    button.remove();
  });
});
