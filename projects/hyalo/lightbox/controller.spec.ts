import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HyLightbox } from './lightbox';
it('returns public live controls without replacing the compatible dialog ref', async () => {
  const ref = TestBed.inject(HyLightbox).open([
    { src: 'a.jpg', alt: 'A' },
    { src: 'b.jpg', alt: 'B' },
  ])!;
  TestBed.tick();
  ref.goTo(1);
  TestBed.tick();
  expect(document.querySelector('hy-lightbox-view img')?.getAttribute('src')).toBe('b.jpg');
  expect(ref.index()).toBe(1);
  ref.goTo(0);
  ref.play();
  expect(ref.playing()).toBe(true);
  ref.pause();
  expect(ref.playing()).toBe(false);
  expect(typeof ref.close).toBe('function');
  TestBed.inject(Dialog).closeAll();
  await ref.closed;
  ref.play();
  expect(ref.playing()).toBe(false);
});
