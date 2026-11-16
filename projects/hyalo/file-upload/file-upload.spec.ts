import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyFileUpload } from './file-upload';
describe('file validation', () => {
  it('preserves an accepted file when a replacement is rejected', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    const previous = new File(['ok'], 'accepted.pdf');
    fixture.componentRef.setInput('value', [previous]);
    fixture.componentRef.setInput('accept', '.pdf');
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'wrong.txt')],
    });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([previous]);
  });
  it('applies accept, byte size, count limits, removal, and disabled state', async () => {
    const fixture = TestBed.createComponent(HyFileUpload);
    fixture.componentRef.setInput('accept', '.pdf');
    fixture.componentRef.setInput('maxSize', 5);
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('maxFiles', 1);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [
        new File(['ok'], 'one.pdf'),
        new File(['other'], 'two.pdf'),
        new File(['x'], 'x.txt'),
        new File(['too large'], 'big.pdf'),
      ],
    });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value().map((file) => file.name)).toEqual(['one.pdf']);
    expect(fixture.nativeElement.textContent).toContain('file limit reached');
    expect(fixture.nativeElement.textContent).toContain('not accepted');
    expect(fixture.nativeElement.textContent).toContain('too large');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    fixture.componentRef.setInput('disabled', false);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([]);
  });
});
