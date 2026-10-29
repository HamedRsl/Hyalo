import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expectNoAxeViolations } from '../../testing/axe';
import { HY_CARD } from './card';

@Component({
  imports: [HY_CARD],
  template: `
    <hy-card material="clear" padding="lg">
      <img hyCardMedia src="data:," alt="" />
      <h3 hyCardHeader><a hyCardLink href="/watch">Calibre 7</a></h3>
      <p>Hand-wound.</p>
      <div hyCardFooter><button type="button">Save</button></div>
    </hy-card>
  `,
})
class Host {}

describe('HyCard', () => {
  it('projects slots in order and applies the material', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const card: HTMLElement = fixture.nativeElement.querySelector('hy-card');
    expect(card.dataset['material']).toBe('clear');
    expect(card.dataset['padding']).toBe('lg');
    const order = [...card.children].map((el) => el.className.split(' ')[0]);
    expect(order).toEqual([
      'hy-card__media',
      'hy-card__header',
      'hy-card__body',
      'hy-card__footer',
    ]);
  });

  it('has no axe violations', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
