import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TextFieldModule, CdkTextareaAutosize } from '@angular/cdk/text-field';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { HyField } from './field';
import { HyInput } from './input';
@Component({
  imports: [HyField, HyInput, TextFieldModule],
  template: `<hy-field label="Notes">
    <textarea hyInput cdkTextareaAutosize cdkAutosizeMinRows="2" cdkAutosizeMaxRows="5"></textarea>
  </hy-field>`,
})
class Host {}
describe('API-008 textarea autosize composition', () => {
  it('composes the CDK resize controller with native field naming and input events', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const resize = fixture.debugElement
      .query(By.directive(CdkTextareaAutosize))
      .injector.get(CdkTextareaAutosize);
    expect(resize.minRows).toBe(2);
    expect(resize.maxRows).toBe(5);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(textarea.id);
    textarea.value = 'one\ntwo\nthree';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(() => resize.resizeToFitContent(true)).not.toThrow();
    expect(textarea.value).toBe('one\ntwo\nthree');
    expect(textarea.classList.contains('cdk-textarea-autosize')).toBe(true);
  });
});
