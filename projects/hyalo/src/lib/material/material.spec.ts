import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyFidelity } from '../fidelity/fidelity';
import { HyMaterialDirective } from './material';

@Component({
  imports: [HyMaterialDirective],
  template: `<div hyMaterial></div>
    <div hyMaterial="clear"></div>`,
})
class Host {}

describe('HyMaterialDirective', () => {
  it('uses the default material and honours an explicit one', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = fixture.nativeElement.querySelectorAll('.hy-glass');
    expect(a.dataset.material).toBe('frosted');
    expect(b.dataset.material).toBe('clear');
  });

  it('renders solid on the low tier', async () => {
    const fixture = TestBed.createComponent(Host);
    TestBed.inject(HyFidelity).setTier('low');
    await fixture.whenStable();
    const els = fixture.nativeElement.querySelectorAll('.hy-glass');
    expect([...els].map((el) => (el as HTMLElement).dataset['material'])).toEqual([
      'solid',
      'solid',
    ]);
  });
});
