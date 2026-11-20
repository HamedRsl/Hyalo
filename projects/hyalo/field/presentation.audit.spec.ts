import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { HyField } from './field';
import { HyInput } from './input';

@Component({
  imports: [HyField, HyInput, ReactiveFormsModule],
  template: `<ng-template #hint let-text
      ><strong>{{ text }}</strong></ng-template
    >
    <ng-template #error let-text let-status="status"
      ><b>{{ status }}:{{ text }}</b></ng-template
    >
    <ng-template #feedback let-status="status"
      ><em>{{ status }}</em></ng-template
    >
    <hy-field
      label="Name"
      hint="Helpful"
      [hintTemplate]="hint"
      [errorTemplate]="error"
      [feedbackTemplate]="feedback"
      [status]="status()"
      [hideRequiredMarker]="hide()"
      subscriptSizing="fixed"
      floatLabel="always"
    >
      <input hyInput [formControl]="control" />
    </hy-field>`,
})
class Host {
  readonly control = new FormControl('', Validators.required);
  readonly hide = signal(false);
  readonly status = signal<'pending' | 'success' | 'warning'>('pending');
}

describe('API-003 through API-007 field rendering', () => {
  it('renders rich feedback with linked IDs and keeps required validity when its marker is hidden', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const field = root.querySelector('hy-field')!;
    const input = root.querySelector('input')!;
    expect(field.getAttribute('data-float-label')).toBe('always');
    expect(field.getAttribute('data-subscript')).toBe('fixed');
    expect(root.querySelector('strong')!.textContent).toBe('Helpful');
    expect(field.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('[role=status] em')!.textContent).toBe('pending');
    for (const id of input.getAttribute('aria-describedby')!.split(' '))
      expect(root.querySelector(`[id="${id}"]`)).not.toBeNull();
    fixture.componentInstance.hide.set(true);
    fixture.componentInstance.status.set('success');
    await fixture.whenStable();
    expect(root.querySelector('.hy-field__required')).toBeNull();
    expect(fixture.componentInstance.control.invalid).toBe(true);
    expect(root.querySelector('em')!.textContent).toBe('success');
    fixture.componentInstance.status.set('warning');
    await fixture.whenStable();
    expect(root.querySelector('em')!.textContent).toBe('warning');
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    expect(root.querySelector('strong')).toBeNull();
    expect(root.querySelector('b')!.textContent).toBe('error:required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
