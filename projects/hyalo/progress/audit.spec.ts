import { TestBed } from '@angular/core/testing';
import { HyProgress } from './progress';
describe('circular segmentation', () => {
  it('cuts equal gaps in track, total and success without changing measurement or leaking SVG IDs', async () => {
    const fixtures = [
      TestBed.createComponent(HyProgress),
      TestBed.createComponent(HyProgress),
    ] as const;
    for (const f of fixtures) {
      for (const [key, value] of Object.entries({
        label: 'Upload',
        variant: 'circle',
        segments: 4,
        value: 60,
        success: 20,
      }))
        f.componentRef.setInput(key, value);
    }
    for (const f of fixtures) {
      await f.whenStable();
      const mask: SVGMaskElement = f.nativeElement.querySelector('mask');
      expect(mask).not.toBeNull();
      expect(mask.querySelector('circle')?.getAttribute('stroke-dasharray')).toBe('23 2');
      expect(f.nativeElement.querySelector('g')?.getAttribute('mask')).toBe(`url(#${mask.id})`);
      expect(f.nativeElement.querySelector('circle.fill')?.getAttribute('stroke-dashoffset')).toBe(
        '40',
      );
      expect(
        f.nativeElement.querySelector('circle.success')?.getAttribute('stroke-dashoffset'),
      ).toBe('80');
    }
    expect(fixtures[0].nativeElement.querySelector('mask').id).not.toBe(
      fixtures[1].nativeElement.querySelector('mask').id,
    );
    fixtures[0].componentRef.setInput('segments', Infinity);
    await fixtures[0].whenStable();
    expect(fixtures[0].nativeElement.querySelector('mask')).toBeNull();
  });
});
