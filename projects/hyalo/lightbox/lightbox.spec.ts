import { TestBed } from '@angular/core/testing';
import { HY_DIALOG_DATA, HyDialogRef } from '@hyalo/angular/dialog';
import { HyLightboxView } from './lightbox';

function createViewer() {
  const indexChange = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: HY_DIALOG_DATA,
        useValue: {
          images: [
            { src: 'one.jpg', alt: 'One' },
            { src: 'two.jpg', alt: 'Two' },
          ],
          indexChange,
          slideshowInterval: 100,
        },
      },
      { provide: HyDialogRef, useValue: { close: vi.fn() } },
    ],
  });
  return { fixture: TestBed.createComponent(HyLightboxView), indexChange };
}

describe('lightbox viewer controls', () => {
  it('renders zoom and rotation, resets transforms on navigation, and publishes live index', async () => {
    const { fixture, indexChange } = createViewer();
    await fixture.whenStable();
    fixture.componentInstance.zoomIn();
    fixture.componentInstance.rotate();
    await fixture.whenStable();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.style.transform).toBe('scale(1.25) rotate(90deg)');
    fixture.componentInstance.goTo(1);
    await fixture.whenStable();
    expect(image.src).toContain('two.jpg');
    expect(image.style.transform).toBe('scale(1) rotate(0deg)');
    expect(indexChange).toHaveBeenLastCalledWith(1);
  });
  it('advances slideshow and stops at the last image and on destruction', async () => {
    const { fixture } = createViewer();
    await fixture.whenStable();
    vi.useFakeTimers();
    try {
      fixture.componentInstance.play();
      vi.advanceTimersByTime(100);
      expect(fixture.componentInstance.index()).toBe(1);
      vi.advanceTimersByTime(100);
      expect(fixture.componentInstance.playing()).toBe(false);
      fixture.destroy();
      fixture.componentInstance.play();
      expect(fixture.componentInstance.playing()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
