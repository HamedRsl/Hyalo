import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyHoverCard } from './hover-card';
import { By } from '@angular/platform-browser';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyHoverCard],
  template:
    '<button [hyHoverCard]="card" hoverCardLabel="Details" [hoverCardShowDelay]="10" [hoverCardHideDelay]="20" hoverCardPanelClass="custom-card">Open</button><ng-template #card>Details</ng-template>',
})
class TimingHost {}
@Component({
  imports: [HyHoverCard],
  template:
    '<button type="button" [hyHoverCard]="profile" hoverCardLabel="Profile">Profile</button><ng-template #profile><a href="/profile">View profile</a></ng-template>',
})
class Host {}
describe('HyHoverCard', () => {
  it('honors public show and hide delays, panel classes, and destruction', async () => {
    const fixture = TestBed.createComponent(TimingHost);
    await fixture.whenStable();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const card = fixture.debugElement.query(By.directive(HyHoverCard)).injector.get(HyHoverCard);
    vi.useFakeTimers();
    try {
      trigger.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
      vi.advanceTimersByTime(9);
      expect(card.open()).toBe(false);
      vi.advanceTimersByTime(1);
      expect(card.open()).toBe(true);
      expect(document.querySelector('.custom-card')).not.toBeNull();
      trigger.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
      vi.advanceTimersByTime(19);
      expect(card.open()).toBe(true);
      vi.advanceTimersByTime(1);
      expect(card.open()).toBe(false);
      fixture.destroy();
      card.show();
      expect(document.querySelector('.custom-card')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
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
