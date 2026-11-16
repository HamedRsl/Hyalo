import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyHoverCard } from './hover-card';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyHoverCard],
  template:
    '<button type="button" [hyHoverCard]="profile" hoverCardLabel="Profile">Profile</button><ng-template #profile><a href="/profile">View profile</a></ng-template>',
})
class Host {}
describe('HyHoverCard', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));
  it('opens on focus, retains focus until requested, and only Escape closes the card', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.focus();
    await fixture.whenStable();
    const pane = document.querySelector<HTMLElement>('.hy-hover-card-pane')!;
    expect(pane).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
    await expectNoAxeViolations(pane);
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(pane.contains(document.activeElement)).toBe(true);
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
    );
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
    expect(document.querySelector('.hy-hover-card-pane')).toBeNull();
  });
});
