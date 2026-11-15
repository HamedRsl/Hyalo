import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_LIST } from './list';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HY_LIST],
  template:
    '<hy-list label="Members"><li hyListItem heading="Mina" description="Owner"><a href="/profile">View profile</a></li></hy-list>',
})
class Host {}
describe('HyList', () => {
  it('preserves native list and action semantics', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ul').getAttribute('aria-label')).toBe('Members');
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(1);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
