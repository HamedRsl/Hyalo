import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { HyField } from '@hyalo/angular/field';
import { describe, expect, it } from 'vitest';
import { HySearchField } from './search-field';

@Component({
  imports: [HyField, HySearchField, FormField],
  template: `<hy-field label="Find records" hint="Type a query">
    <hy-search-field [formField]="fields.query" />
  </hy-field>`,
})
class FormHost {
  readonly model = signal({ query: 'initial' });
  readonly locked = signal(false);
  readonly fields = form(this.model, (path) => {
    required(path.query);
    disabled(path.query, { when: () => this.locked() });
  });
}

describe('HySearchField', () => {
  it('publishes text immediately and submits current values from keyboard and native search', async () => {
    const fixture = TestBed.createComponent(HySearchField);
    const submitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'سلام ۱۲۳';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('سلام ۱۲۳');
    expect(submitted).toEqual([]);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    input.dispatchEvent(new Event('search', { bubbles: true }));
    expect(submitted).toEqual(['سلام ۱۲۳', 'سلام ۱۲۳']);
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('search', { bubbles: true }));
    await fixture.whenStable();
    expect(submitted).toEqual(['سلام ۱۲۳', 'سلام ۱۲۳', '']);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('clears to an empty string, submits it once and restores input focus', async () => {
    const fixture = TestBed.createComponent(HySearchField);
    fixture.componentRef.setInput('value', 'existing');
    const submitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Clear search');
    button.focus();
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    expect(input.value).toBe('');
    expect(submitted).toEqual(['']);
    expect(document.activeElement).toBe(input);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('announces host-owned loading without blocking edits or submitting automatically', async () => {
    const fixture = TestBed.createComponent(HySearchField);
    fixture.componentRef.setInput('loading', true);
    const submitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toBe('Searching');
    expect(input.disabled).toBe(false);
    input.value = 'next query';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('next query');
    expect(submitted).toEqual([]);
    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(input.hasAttribute('aria-busy')).toBe(false);
    expect(fixture.nativeElement.querySelector('[role=status]')).toBeNull();
  });

  it.each(['readonly', 'disabled'])('blocks editing and clearing when %s', async (state) => {
    const fixture = TestBed.createComponent(HySearchField);
    fixture.componentRef.setInput('value', 'unchanged');
    fixture.componentRef.setInput(state, true);
    const submitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(state === 'readonly' ? input.readOnly : input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    input.value = 'blocked';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('unchanged');
    expect(submitted).toEqual([]);
    if (state === 'disabled') {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      input.dispatchEvent(new Event('search', { bubbles: true }));
      expect(submitted).toEqual([]);
    }
  });

  it('touches only when focus leaves the input and clear-button composite', async () => {
    const fixture = TestBed.createComponent(HySearchField);
    fixture.componentRef.setInput('value', 'query');
    let touches = 0;
    fixture.componentInstance.touch.subscribe(() => touches++);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: button }));
    expect(touches).toBe(0);
    button.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: input }));
    expect(touches).toBe(0);
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(touches).toBe(1);
  });

  it('supports required, touched, disabled and reset through Signal Forms and field metadata', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.required).toBe(true);

    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    fixture.nativeElement.querySelector('button').click();
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().query).toBe('');
    expect(fixture.componentInstance.fields.query().invalid()).toBe(true);
    expect(fixture.componentInstance.fields.query().touched()).toBe(true);
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    fixture.componentInstance.fields().reset({ query: 'reset query' });
    await fixture.whenStable();
    expect(input.value).toBe('reset query');
    expect(fixture.componentInstance.fields.query().touched()).toBe(false);
  });

  it('does not submit Enter used to finish an IME composition', async () => {
    const fixture = TestBed.createComponent(HySearchField);
    fixture.componentRef.setInput('value', 'previous');
    const submitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'جستجو';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('previous');
    expect(submitted).toEqual([]);
    input.dispatchEvent(new Event('compositionend', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('جستجو');
    expect(submitted).toEqual(['جستجو']);
  });
});
