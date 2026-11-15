import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyKbd } from './kbd';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyKbd],
  template: '<p>Search <kbd hyKbd>Ctrl</kbd> + <kbd hyKbd>K</kbd></p>',
})
class Host {}
describe('HyKbd', () => {
  it('keeps native key semantics and readable shortcut text', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('kbd').length).toBe(2);
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
