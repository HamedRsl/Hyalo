import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HyPassword } from './password';

@Component({
  imports: [HyPassword],
  template: `
    <ng-template #panel let-strength let-value="value"
      ><strong>{{ strength }}:{{ value.length }}</strong></ng-template
    >
    <ng-template #visibility let-revealed>{{ revealed ? 'Conceal' : 'Reveal' }}</ng-template>
    <hy-password
      [value]="'secret'"
      [strengthPolicy]="policy"
      [strengthMessages]="messages"
      [strengthTemplate]="panel"
      [visibilityTemplate]="visibility"
      showLabel="Reveal secret"
      hideLabel="Conceal secret"
    />
  `,
})
class Host {
  readonly policy = (value: string) =>
    value === 'secret' ? ('stronger' as const) : ('short' as const);
  readonly messages = { empty: 'Empty', short: 'Short', variety: 'Variety', stronger: 'Approved' };
}

describe('password audit contracts', () => {
  it('applies a strength policy, localized messages and templates without changing native reveal semantics', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"] strong')!.textContent).toBe('Approved:6');
    const button = root.querySelector('button')!;
    expect(button.textContent!.trim()).toBe('Reveal');
    expect(button.getAttribute('aria-label')).toBe('Reveal secret');
    button.click();
    await fixture.whenStable();
    expect(root.querySelector('input')!.type).toBe('text');
    expect(button.textContent!.trim()).toBe('Conceal');
    expect(button.getAttribute('aria-label')).toBe('Conceal secret');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
