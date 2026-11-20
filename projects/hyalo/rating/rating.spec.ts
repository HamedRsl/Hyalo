import { TestBed } from '@angular/core/testing';
import { HyRating } from './rating';

function setup() {
  const fixture = TestBed.createComponent(HyRating);
  const element: HTMLElement = fixture.nativeElement;
  const radios = () => [...element.querySelectorAll<HTMLInputElement>('input[type=radio]')];
  return { fixture, element, radios };
}

describe('HyRating', () => {
  it('keeps integer choices by default and accepts fractional choices when configured', async () => {
    const { fixture, radios } = setup();
    await fixture.whenStable();
    expect(radios().map((radio) => radio.value)).toEqual(['1', '2', '3', '4', '5']);
    fixture.componentRef.setInput('step', 0.5);
    fixture.componentRef.setInput('max', 2);
    await fixture.whenStable();
    expect(radios().map((radio) => radio.value)).toEqual(['0.5', '1', '1.5', '2']);
    expect(radios()[2]!.getAttribute('aria-label')).toBe('1.5 out of 2');
    radios()[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(1.5);
  });

  it('clears an active choice only when clearing is enabled and the control is editable', async () => {
    const { fixture, radios } = setup();
    await fixture.whenStable();
    radios()[1]!.click();
    await fixture.whenStable();
    radios()[1]!.click();
    expect(fixture.componentInstance.value()).toBe(2);
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('readonly', true);
    await fixture.whenStable();
    radios()[1]!.click();
    expect(fixture.componentInstance.value()).toBe(2);
    fixture.componentRef.setInput('readonly', false);
    await fixture.whenStable();
    radios()[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(0);
    expect(radios().some((radio) => radio.checked)).toBe(false);
  });
});