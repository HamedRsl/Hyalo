import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyInlineEdit } from './public-api';

@Component({
  imports: [HyInlineEdit],
  template: '<hy-inline-edit [(editing)]="editing" [(value)]="value" />',
})
class EditingHost {
  readonly editing = signal(false);
  readonly value = signal('Original');
}

describe('HyInlineEdit', () => {
  it('opens and closes from its editing binding without committing a draft (API-136)', async () => {
    const fixture = TestBed.createComponent(EditingHost);
    const host = fixture.nativeElement as HTMLElement;
    const state = fixture.componentInstance;
    await fixture.whenStable();

    state.value.set('Current');
    state.editing.set(true);
    await fixture.whenStable();
    const editor = host.querySelector<HTMLInputElement>('input')!;
    expect(editor.value).toBe('Current');
    editor.value = 'Unsaved';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    state.editing.set(false);
    await fixture.whenStable();
    expect(host.querySelector('input')).toBeNull();
    expect(state.value()).toBe('Current');

    host.querySelector('button')!.click();
    await fixture.whenStable();
    expect(state.editing()).toBe(true);
    expect(host.querySelector<HTMLInputElement>('input')!.value).toBe('Current');
    expect(document.activeElement).toBe(host.querySelector('input'));
  });
});