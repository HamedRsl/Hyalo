import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { HY_TABS, HyTabs } from './tabs';

@Component({
  imports: [HY_TABS],
  template: `<hy-tabs [(selected)]="selected" [beforeChange]="guard">
    <hy-tab value="one" label="One">One</hy-tab>
    <hy-tab value="two" label="Two" [disabled]="disabled()" [destroyOnHide]="destroy()"><ng-template hyTabContent><input class="lazy" /></ng-template></hy-tab>
    <hy-tab value="three" label="Three">Three</hy-tab>
  </hy-tabs>`,
})
class Host {
  readonly selected = signal<string | undefined>('one');
  readonly disabled = signal(false);
  readonly destroy = signal(false);
  resolve!: (allowed: boolean) => void;
  readonly guard = () => new Promise<boolean>((resolve) => { this.resolve = resolve; });
}

describe('guarded tab lifecycle', () => {
  it('lazily creates and retains a panel until destruction on hide is requested', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lazy')).toBeNull();
    fixture.componentInstance.selected.set('two');
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('.lazy') as HTMLInputElement;
    expect(input).not.toBeNull();
    fixture.componentInstance.selected.set('one');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lazy')).toBe(input);
    fixture.componentInstance.destroy.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lazy')).toBeNull();
  });
  it('ignores an approval made stale by a controlled selection update', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const tabs = fixture.debugElement.query(By.directive(HyTabs)).componentInstance as HyTabs;
    tabs.select('two');
    fixture.componentInstance.selected.set('three');
    await fixture.whenStable();
    fixture.componentInstance.resolve(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBe('three');
    expect(tabs.pending()).toBe(false);
    expect(fixture.nativeElement.querySelector('.lazy')).toBeNull();
  });

  it('does not activate a target disabled while its guard is pending', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const tabs = fixture.debugElement.query(By.directive(HyTabs)).componentInstance as HyTabs;
    tabs.select('two');
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    fixture.componentInstance.resolve(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBe('one');
    expect(tabs.pending()).toBe(false);
  });
});
