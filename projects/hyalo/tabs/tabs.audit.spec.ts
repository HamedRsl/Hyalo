import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { HY_TABS, HyTabs } from './tabs';

@Component({
  imports: [HY_TABS],
  template: `<hy-tabs [(selected)]="selected" [beforeChange]="guard()" selectionMode="explicit">
    <hy-tab value="one" label="One">One</hy-tab>
    @if (present()) {
      <hy-tab value="two" label="Two">Two</hy-tab>
    }
    <hy-tab value="three" label="Three">Three</hy-tab>
  </hy-tabs>`,
})
class Host {
  readonly selected = signal<string | undefined>('one');
  readonly present = signal(true);
  readonly guard = signal<() => boolean | Promise<boolean>>(() => true);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const tabs = fixture.debugElement.query(By.directive(HyTabs)).componentInstance as HyTabs;
  const buttons = () =>
    [...fixture.nativeElement.querySelectorAll('[role=tab]')] as HTMLButtonElement[];
  return { fixture, tabs, buttons };
}

describe('API-304 guarded tab races and focus', () => {
  it('restores the selected tab focus after a vetoed keyboard/click request', async () => {
    const { fixture, buttons } = await setup();
    fixture.componentInstance.guard.set(() => false);
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    buttons()[1]!.focus();
    buttons()[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBe('one');
    expect(document.activeElement).toBe(buttons()[0]);
    expect(buttons().map((button) => button.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
      'false',
    ]);
  });

  it('invalidates approval after a controlled change away and back', async () => {
    const { fixture, tabs } = await setup();
    let approve!: (value: boolean) => void;
    fixture.componentInstance.guard.set(
      () =>
        new Promise<boolean>((resolve) => {
          approve = resolve;
        }),
    );
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    tabs.select('two');
    fixture.componentInstance.selected.set('three');
    await fixture.whenStable();
    fixture.componentInstance.selected.set('one');
    await fixture.whenStable();
    approve(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBe('one');
    expect(tabs.pending()).toBe(false);
  });

  it('ignores obsolete approvals and recovers from rejection', async () => {
    const { fixture, tabs, buttons } = await setup();
    const requests: { resolve: (value: boolean) => void; reject: (reason: unknown) => void }[] = [];
    fixture.componentInstance.guard.set(
      () =>
        new Promise<boolean>((resolve, reject) => {
          requests.push({ resolve, reject });
        }),
    );
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    const errors: unknown[] = [];
    tabs.transitionError.subscribe((error) => errors.push(error));
    tabs.select('two');
    tabs.select('three');
    requests[0]!.resolve(true);
    await fixture.whenStable();
    expect(tabs.pending()).toBe(true);
    expect(fixture.componentInstance.selected()).toBe('one');
    buttons()[2]!.focus();
    requests[1]!.reject('denied');
    await fixture.whenStable();
    expect(errors).toEqual(['denied']);
    expect(tabs.pending()).toBe(false);
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('ignores removed targets and completion after destruction', async () => {
    const { fixture, tabs } = await setup();
    let approve!: (value: boolean) => void;
    fixture.componentInstance.guard.set(
      () =>
        new Promise<boolean>((resolve) => {
          approve = resolve;
        }),
    );
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    const changes: unknown[] = [];
    tabs.selectionChange.subscribe((change) => changes.push(change));
    tabs.select('two');
    fixture.componentInstance.present.set(false);
    await fixture.whenStable();
    approve(true);
    await fixture.whenStable();
    expect(changes).toEqual([]);
    tabs.select('three');
    fixture.destroy();
    approve(true);
    await Promise.resolve();
    expect(changes).toEqual([]);
  });
});
