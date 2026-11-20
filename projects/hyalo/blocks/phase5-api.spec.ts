import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyTabBar } from '@hyalo/angular/tab-bar';
import { HyFab } from '@hyalo/angular/fab';
import { HyMeterGroup } from '@hyalo/angular/meter';
import { HyCardStack, HyStackItem } from '@hyalo/angular/card-stack';
import { HySwipeDeck, HySwipeItem } from '@hyalo/angular/swipe-deck';
import { HyMotion } from '@hyalo/angular/motion';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyTabBar, HyMeterGroup],
  template: `
    <hy-tab-bar #bar label="Pages" [items]="items" [showLabels]="false" [disabled]="disabled()" />
    <hy-meter-group
      label="Storage"
      [values]="values"
      [max]="100"
      [labelTemplate]="legend"
      [meterTemplate]="meter"
    />
    <ng-template #legend let-segment let-percent="percent"
      >{{ segment.label }} {{ percent }}%</ng-template
    >
    <ng-template #meter let-segment>{{ segment.label }}</ng-template>
  `,
})
class NavigationHost {
  readonly disabled = signal(false);
  readonly bar = viewChild.required(HyTabBar);
  readonly items = [
    { id: 'a', label: 'Home', href: '/home', target: '_blank' },
    { id: 'b', label: 'Hidden', href: '/hidden', hidden: true },
  ];
  readonly values = [
    { id: 'a', label: 'Used', value: 80, color: 'red' },
    { id: 'b', label: 'Reserved', value: 40 },
  ];
}
@Component({
  imports: [HyCardStack, HyStackItem, HySwipeDeck, HySwipeItem],
  template: `
    <hy-card-stack #stack label="Cards" [items]="items" [itemKey]="key" [loop]="true"
      ><ng-template [hyStackItem]="stack" let-card>{{ card }}</ng-template></hy-card-stack
    >
    <hy-swipe-deck #deck label="Decisions" [items]="items" [itemKey]="key"
      ><ng-template [hySwipeItem]="deck" let-card>{{ card }}</ng-template></hy-swipe-deck
    >
  `,
})
class CardsHost {
  readonly items = ['a', 'b'];
  readonly key = (item: string): string => item;
  readonly stack = viewChild.required<HyCardStack<string>>(HyCardStack);
  readonly deck = viewChild.required<HySwipeDeck<string>>(HySwipeDeck);
}
describe('phase 5 composition APIs', () => {
  it('preserves named native links with hidden labels, filters hidden items, and supports bounded meter templates', async () => {
    const f = TestBed.createComponent(NavigationHost);
    await f.whenStable();
    const links = f.nativeElement.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/home');
    expect(links[0].getAttribute('aria-label')).toBe('Home');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(f.componentInstance.bar().focusItem('a')).toBe(true);
    expect(f.nativeElement.querySelector('.legend').textContent).toContain('Reserved 20%');
    expect(f.nativeElement.querySelector('[role="meter"]').getAttribute('aria-valuenow')).toBe(
      '100',
    );
    f.componentInstance.disabled.set(true);
    await f.whenStable();
    expect(links[0].getAttribute('href')).toBeNull();
    expect(f.componentInstance.bar().focusItem('a')).toBe(false);
    await expectNoAxeViolations(f.nativeElement);
  });
  it('opens the last FAB action with ArrowUp and exposes lifecycle controls', async () => {
    const f = TestBed.createComponent(HyFab);
    f.componentRef.setInput('label', 'Create');
    f.componentRef.setInput('actions', [
      { id: 'a', label: 'First' },
      { id: 'b', label: 'Last' },
    ]);
    const shown = vi.fn();
    const hidden = vi.fn();
    f.componentInstance.shown.subscribe(shown);
    f.componentInstance.hidden.subscribe(hidden);
    await f.whenStable();
    f.nativeElement
      .querySelector('button')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await f.whenStable();
    expect(document.activeElement?.textContent).toContain('Last');
    f.componentInstance.hide();
    await f.whenStable();
    expect(hidden).toHaveBeenCalledTimes(1);
    f.componentInstance.show();
    await f.whenStable();
    expect(shown).toHaveBeenCalledTimes(2);
  });
  it('wraps a looping stack and exposes deck completion, undo, and reset', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const f = TestBed.createComponent(CardsHost);
    await f.whenStable();
    const stack = f.componentInstance.stack();
    stack.previous();
    expect(stack.activeIndex()).toBe(1);
    stack.next();
    expect(stack.activeIndex()).toBe(0);
    const deck = f.componentInstance.deck();
    const finished = vi.fn();
    const undone = vi.fn();
    deck.finished.subscribe(finished);
    deck.undone.subscribe(undone);
    deck.swipe('end');
    await f.whenStable();
    deck.swipe('start');
    await f.whenStable();
    expect(finished).toHaveBeenCalledTimes(1);
    expect(deck.index()).toBe(2);
    deck.undo();
    await f.whenStable();
    expect(undone).toHaveBeenCalledWith({ item: 'b', index: 1 });
    deck.reset();
    await f.whenStable();
    expect(deck.index()).toBe(0);
    expect(deck.busy()).toBe(false);
    TestBed.inject(HyMotion).setReduced(null);
  });
});
