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
  it('optionally reveals on hover in both orientations and ignores disabled movement', async () => {
    const { fixture, host } = createCompare();
    fixture.componentRef.setInput('hoverReveal', true);
    await fixture.whenStable();
    const frame = host.querySelector<HTMLElement>('.frame')!;
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      bottom: 110,
      width: 100,
      height: 100,
    } as DOMRect);
    frame.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 35, clientY: 35, pointerType: 'mouse' }),
    );
    expect(fixture.componentInstance.value()).toBe(25);
    fixture.componentRef.setInput('orientation', 'vertical');
    await fixture.whenStable();
    frame.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 35, clientY: 35, pointerType: 'mouse' }),
    );
    expect(fixture.componentInstance.value()).toBe(75);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    frame.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 60, clientY: 60, pointerType: 'mouse' }),
    );
    expect(fixture.componentInstance.value()).toBe(75);
  });
  it('applies reveal bounds and step, commits changes, and blocks disabled interaction', async () => {
    const { fixture, range } = createCompare();
    fixture.componentRef.setInput('min', 20);
    fixture.componentRef.setInput('max', 80);
    fixture.componentRef.setInput('step', 10);
    fixture.componentRef.setInput('value', 95);
    await fixture.whenStable();
    expect(range().min).toBe('20');
    expect(range().max).toBe('80');
    expect(range().step).toBe('10');
    expect(range().value).toBe('80');
    const committed = vi.fn();
    fixture.componentInstance.committed.subscribe(committed);
    range().value = '40';
    range().dispatchEvent(new Event('input'));
    range().dispatchEvent(new Event('change'));
    expect(committed).toHaveBeenCalledWith(40);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(range().disabled).toBe(true);
    range().value = '60';
    range().dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe(40);
  });
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
