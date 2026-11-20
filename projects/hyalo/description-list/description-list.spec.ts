import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyDescriptionList } from './description-list';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyDescriptionList],
  template: `<ng-template #term let-item
      ><b>{{ item.term }}</b></ng-template
    >
    <ng-template #detail let-item
      ><a href="/plan">{{ item.detail }}</a></ng-template
    >
    <hy-description-list
      title="Account"
      [items]="items"
      [columns]="3"
      [termTemplate]="term"
      [detailTemplate]="detail"
    >
      <button hyDescriptionExtra type="button">Edit</button>
    </hy-description-list>`,
})
class RichHost {
  readonly items = [{ term: 'Plan', detail: 'Team', span: 2 }];
}

describe('HyDescriptionList', () => {
  it('renders rich items with bounded responsive spans and header extras', async () => {
    const fixture = TestBed.createComponent(RichHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('dt b')?.textContent).toBe('Plan');
    expect(el.querySelector('dd a')?.textContent).toBe('Team');
    expect(el.querySelector('dl > div')?.getAttribute('style')).toContain(
      '--hy-description-span-wide: 2',
    );
    expect(el.querySelector('dl > div')?.getAttribute('style')).toContain(
      '--hy-description-span-compact: 1',
    );
    expect(el.querySelector('header')?.textContent).toContain('Account');
    expect(el.querySelector('header button')?.textContent).toBe('Edit');
  });
  it('applies responsive column counts and a stacked item layout', async () => {
    const fixture = TestBed.createComponent(HyDescriptionList);
    fixture.componentRef.setInput('items', [{ term: 'Plan', detail: 'Team' }]);
    fixture.componentRef.setInput('columns', { compact: 2, wide: 3 });
    fixture.componentRef.setInput('layout', 'stacked');
    await fixture.whenStable();

    const list: HTMLElement = fixture.nativeElement.querySelector('dl');
    expect(list.style.getPropertyValue('--hy-description-columns-compact')).toBe('2');
    expect(list.style.getPropertyValue('--hy-description-columns-wide')).toBe('3');
    expect(list.classList.contains('stacked')).toBe(true);
  });

  it('renders accessible semantic content', async () => {
    const fixture = TestBed.createComponent(HyDescriptionList);
    fixture.componentRef.setInput('items', [
      { term: 'Plan', detail: 'Team' },
      { term: 'Region', detail: 'Europe' },
    ]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('dt').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('dd')[1].textContent).toBe('Europe');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
