import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { HyGallery, HyGalleryThumbnail, HyLightbox, HyLightboxContent } from './lightbox';
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

@Component({
  imports: [HyGallery, HyGalleryThumbnail, HyLightboxContent],
  template: `<hy-gallery
      [images]="images"
      thumbnailMinWidth="14rem"
      thumbnailAspectRatio="1"
      thumbnailGap="2rem"
      [thumbnailTemplate]="thumbnail.template"
      [options]="{ contentTemplate: preview.template, captionTemplate: previewCaption.template }"
    />
    <ng-template hyGalleryThumbnail #thumbnail="hyGalleryThumbnail" let-image let-index="index">
      <span>{{ index + 1 }}: {{ image.alt }}</span>
    </ng-template>
    <ng-template
      hyLightboxContent
      #preview="hyLightboxContent"
      let-image
      let-scale="scale"
      let-rotation="rotation"
    >
      <img [src]="image.src" [alt]="image.alt" [attr.data-transform]="scale + '/' + rotation" />
    </ng-template>
    <ng-template
      hyLightboxContent
      #previewCaption="hyLightboxContent"
      let-image
      let-index="index"
      let-count="count"
    >
      {{ image.caption }} {{ index + 1 }} / {{ count }}
    </ng-template>`,
})
class TemplateGallery {
  readonly images = [
    { src: 'a.jpg', alt: 'A', caption: 'First' },
    { src: 'b.jpg', alt: 'B', caption: 'Second' },
  ];
}

it('renders typed thumbnail, content and caption contexts and forwards active transforms', async () => {
  const fixture = TestBed.createComponent(TemplateGallery);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const group = root.querySelector<HTMLElement>('[role="group"]')!;
  expect(group.style.getPropertyValue('--hy-gallery-thumbnail-min')).toBe('14rem');
  expect(group.style.getPropertyValue('--hy-gallery-thumbnail-ratio')).toBe('1');
  expect(group.style.getPropertyValue('--hy-gallery-thumbnail-gap')).toBe('2rem');
  const thumbnail = group.querySelector<HTMLButtonElement>('[aria-label="Open image: A"]')!;
  expect(thumbnail.textContent).toContain('1: A');
  thumbnail.click();
  await fixture.whenStable();
  const viewer = document.querySelector('hy-lightbox-view')!;
  const buttons = Array.from(viewer.querySelectorAll('button'));
  const press = (label: string) =>
    buttons.find((button) => button.textContent?.trim() === label)!.click();
  press('Zoom in');
  press('Rotate image');
  await fixture.whenStable();
  expect(viewer.querySelector('img')?.getAttribute('data-transform')).toBe('1.25/90');
  press('Next image');
  await fixture.whenStable();
  expect(viewer.querySelector('img')?.getAttribute('alt')).toBe('B');
  expect(viewer.querySelector('img')?.getAttribute('data-transform')).toBe('1/0');
  expect(viewer.querySelector('figcaption')?.textContent).toContain('Second 2 / 2');
  TestBed.inject(Dialog).closeAll();
  await fixture.whenStable();
});

it('updates a visible gallery without replacing the dialog and clamps the controlled index', async () => {
  const fixture = TestBed.createComponent(HyGallery);
  const original = [
    { src: 'a.jpg', alt: 'A' },
    { src: 'b.jpg', alt: 'B' },
  ];
  fixture.componentRef.setInput('images', original);
  fixture.componentInstance.open(1);
  await fixture.whenStable();
  const panel = document.querySelector('hy-lightbox-view')!;
  fixture.componentRef.setInput('images', [{ src: 'c.jpg', alt: 'C' }]);
  fixture.componentRef.setInput('options', { closeLabel: 'Done' });
  await fixture.whenStable();
  expect(document.querySelector('hy-lightbox-view')).toBe(panel);
  expect(panel.querySelector('img')?.alt).toBe('C');
  expect(panel.querySelector('button')?.textContent?.trim()).toBe('Done');
  expect(fixture.componentInstance.index()).toBe(0);
  fixture.componentRef.setInput('images', []);
  await vi.waitFor(() => expect(document.querySelector('hy-lightbox-view')).toBeNull());
  expect(fixture.componentInstance.visible()).toBe(false);
});

it('exposes flip and reset state on the lightbox reference', async () => {
  const ref = TestBed.inject(HyLightbox).open([{ src: 'a.jpg', alt: 'A' }])!;
  ref.zoomIn();
  ref.rotate();
  ref.flipHorizontal();
  ref.flipVertical();
  expect(ref.transform()).toMatchObject({ scale: 1.25, rotation: 90, flipX: true, flipY: true });
  ref.resetTransform();
  expect(ref.transform()).toEqual({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
    flipX: false,
    flipY: false,
  });
  TestBed.inject(Dialog).closeAll();
});
