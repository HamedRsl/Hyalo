import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_BENTO } from './bento';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HY_BENTO],
  template:
    '<hy-bento><section hyBentoTile [columns]="99" [rows]="0" aria-label="Revenue">Revenue</section><section hyBentoTile aria-label="Projects">Projects</section></hy-bento>',
})
class Host {}
describe('HyBento', () => {
  it('bounds tile spans and keeps reading order', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const tiles = fixture.nativeElement.querySelectorAll('section');
    expect(tiles[0].style.getPropertyValue('--hy-bento-columns')).toBe('3');
    expect(tiles[0].style.gridRow).toBe('span 1');
    expect(tiles[1].textContent).toBe('Projects');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
