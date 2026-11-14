import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyChip } from './badge';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyChip],
  template: '<hy-chip [(selected)]="selected" [disabled]="disabled()">Steel</hy-chip>',
})
class Host {
  readonly selected = signal(false);
  readonly disabled = signal(false);
}
describe('HyChip', () => {
  it('publishes native toggle selection and keeps disabled chips unchanged', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBe(false);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    button.click();
    expect(fixture.componentInstance.selected()).toBe(false);
    expect(button.disabled).toBe(true);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
