import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_TIMELINE } from './timeline';

@Component({
  imports: [HY_TIMELINE],
  template: `<hy-timeline [reverse]="reverse()" pending="Waiting">
    @for (name of names(); track name) {
      <hy-timeline-item [heading]="name"
        ><button>{{ name }}</button></hy-timeline-item
      >
    }
  </hy-timeline>`,
})
class Host {
  readonly reverse = signal(true);
  readonly names = signal(['First', 'Second']);
}
describe('timeline semantic reverse', () => {
  it('reverses actual reading and focus order, including pending, and restores projection order', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const headings = () =>
      [...f.nativeElement.querySelectorAll('[role=listitem]')].map(
        (el: Element) => el.querySelector('strong')?.textContent ?? el.textContent?.trim(),
      );
    expect(headings()).toEqual(['Waiting', 'Second', 'First']);
    expect(
      [...f.nativeElement.querySelectorAll('button')].map((el: Element) => el.textContent),
    ).toEqual(['Second', 'First']);
    f.componentInstance.names.set(['First', 'Second', 'Third']);
    await f.whenStable();
    expect(headings()).toEqual(['Waiting', 'Third', 'Second', 'First']);
    f.componentInstance.reverse.set(false);
    await f.whenStable();
    expect(headings()).toEqual(['First', 'Second', 'Third', 'Waiting']);
  });
});
