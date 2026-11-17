import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_SWIPE_DECK } from './swipe-deck';
import { pointer } from '../src/testing/pointer';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HY_SWIPE_DECK],
  template:
    '<hy-swipe-deck #deck label="Listings" [items]="items" [itemKey]="key" (decided)="decisions.push($event.direction)"><ng-template [hySwipeItem]="deck" let-item><h3>{{ item.label }}</h3></ng-template></hy-swipe-deck>',
})
class Host {
  readonly items = [
    { id: 1, label: 'First listing' },
    { id: 2, label: 'Second listing' },
  ];
  readonly key = (item: { id: number }): number => item.id;
  readonly decisions: string[] = [];
}
describe('HySwipeDeck', () => {
  it('supports button decisions and undo without requiring a swipe', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const buttons = f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[1]?.click();
    await f.whenStable();
    expect(f.componentInstance.decisions).toEqual(['end']);
    expect(f.nativeElement.textContent).toContain('Second listing');
    buttons[2]?.click();
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('First listing');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('does not advance a cancelled swipe and preserves stable action buttons at the end', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const card = f.nativeElement.querySelector('.card');
    pointer(card, 'pointerdown', 0, 0);
    pointer(card, 'pointermove', 200, 0);
    pointer(card, 'pointercancel', 200, 0);
    expect(f.componentInstance.decisions).toEqual([]);
    const buttons = f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[1]?.click();
    await f.whenStable();
    buttons[1]?.click();
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('No more cards');
    expect(f.nativeElement.querySelectorAll('button')[1]).toBe(buttons[1]);
    expect(buttons[2]?.disabled).toBe(false);
  });
});
