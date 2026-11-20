import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HyGallery, HyLightbox } from './lightbox';
it.each(['model', 'viewer'] as const)(
  'reopens at the latest requested index after an in-flight %s exit finishes',
  async (source) => {
    const open = vi.spyOn(TestBed.inject(HyLightbox), 'open');
    const fixture = TestBed.createComponent(HyGallery);
    fixture.componentRef.setInput('images', [
      { src: 'a.jpg', alt: 'A' },
      { src: 'b.jpg', alt: 'B' },
    ]);
    await fixture.whenStable();
    fixture.componentInstance.open(0);
    await fixture.whenStable();
    const first = open.mock.results[0]!.value!;
    let finishExit!: () => void;
    first.exit = (finish: () => void) => {
      finishExit = finish;
    };
    if (source === 'model') fixture.componentInstance.visible.set(false);
    else document.querySelector<HTMLButtonElement>('hy-lightbox-view button')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
    fixture.componentInstance.open(1);
    await fixture.whenStable();
    expect(open).toHaveBeenCalledTimes(1);
    finishExit();
    await first.closed;
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(true);
    expect(open).toHaveBeenCalledTimes(2);
    expect(document.querySelector('hy-lightbox-view img')?.getAttribute('src')).toBe('b.jpg');
    expect(fixture.componentInstance.index()).toBe(1);
    TestBed.inject(Dialog).closeAll();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
  },
);
it('synchronizes gallery visibility and index models with the live viewer', async () => {
  const fixture = TestBed.createComponent(HyGallery);
  fixture.componentRef.setInput('images', [
    { src: 'a.jpg', alt: 'A' },
    { src: 'b.jpg', alt: 'B' },
  ]);
  await fixture.whenStable();
  fixture.componentInstance.visible.set(true);
  await fixture.whenStable();
  fixture.componentInstance.index.set(1);
  await fixture.whenStable();
  expect(document.querySelector('hy-lightbox-view img')?.getAttribute('src')).toBe('b.jpg');
  const previous = Array.from(
    document.querySelectorAll<HTMLButtonElement>('hy-lightbox-view button'),
  ).find((button) => button.textContent?.includes('Previous image'))!;
  previous.click();
  await fixture.whenStable();
  expect(fixture.componentInstance.index()).toBe(0);
  TestBed.inject(Dialog).closeAll();
  await fixture.whenStable();
  expect(fixture.componentInstance.visible()).toBe(false);
});
