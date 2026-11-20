import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HY_ACCORDION } from './accordion';

@Component({
  imports: [HY_ACCORDION],
  template: `<hy-accordion><hy-accordion-item heading="Details" [(expanded)]="open" [destroyOnClose]="destroy()"><span class="eager">Eager</span><ng-template hyAccordionContent><input class="lazy" /></ng-template></hy-accordion-item></hy-accordion>`,
})
class Host {
  readonly open = signal(false);
  readonly destroy = signal(false);
}

describe('accordion lazy lifecycle', () => {
  it('creates on first opening, retains by default and destroys only when opted in', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.eager')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.lazy')).toBeNull();
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('.lazy') as HTMLInputElement;
    input.value = 'retained';
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lazy')).toBe(input);
    fixture.componentInstance.destroy.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lazy')).toBeNull();
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lazy').value).toBe('');
  });
});
