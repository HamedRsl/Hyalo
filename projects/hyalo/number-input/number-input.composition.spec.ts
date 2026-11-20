import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyField, HyPrefix, HySuffix } from '@hyalo/angular/field';
import { HyNumberInput } from './number-input';
@Component({ imports: [HyField, HyPrefix, HySuffix, HyNumberInput], template: `<hy-field label="Amount"><span hyPrefix>USD</span><hy-number-input buttonLayout="stacked" /><span hySuffix>per item</span></hy-field>` })
class Host {}
describe('number input native composition', () => {
  it('projects affixes around a label-associated control and lays out stacked spinner buttons', async () => {
    const f = TestBed.createComponent(Host); await f.whenStable();
    const box: HTMLElement = f.nativeElement.querySelector('.hy-field__box');
    expect(box.firstElementChild!.textContent).toBe('USD'); expect(box.lastElementChild!.textContent).toBe('per item');
    const input: HTMLInputElement = box.querySelector('input')!;
    expect(input.getAttribute('aria-labelledby')).toBe(f.nativeElement.querySelector('label').id);
    const control = f.nativeElement.querySelector('.control');
    expect(getComputedStyle(control).display).toBe('grid');
    expect(getComputedStyle(input).gridColumn).toBe('1');
  });
});
