import { TestBed } from '@angular/core/testing';
import { HyImageCompare } from './public-api';

function createCompare() {
  const fixture = TestBed.createComponent(HyImageCompare);
  fixture.componentRef.setInput('before', 'before.jpg');
  fixture.componentRef.setInput('after', 'after.jpg');
  fixture.componentRef.setInput('beforeAlt', 'Before');
  fixture.componentRef.setInput('afterAlt', 'After');
  const host = fixture.nativeElement as HTMLElement;
  const range = () => host.querySelector<HTMLInputElement>('input')!;
  const before = () => host.querySelector<HTMLImageElement>('.before')!;
  return { fixture, host, range, before };
}

describe('HyImageCompare', () => {
  it('defaults to a horizontal reveal and can switch to a bottom-to-top reveal (API-132)', async () => {
    const { fixture, range, before, host } = createCompare();
    fixture.componentRef.setInput('value', 25);
    await fixture.whenStable();
    expect(before().style.clipPath).toBe('inset(0 75% 0 0)');
    fixture.componentRef.setInput('orientation', 'vertical');
    await fixture.whenStable();
    expect(before().style.clipPath).toBe('inset(75% 0 0 0)');
    expect(range().getAttribute('aria-orientation')).toBe('vertical');
    expect(host.querySelector<HTMLElement>('.handle')!.style.insetBlockEnd).toBe('25%');
  });
});