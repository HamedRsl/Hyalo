import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyDockedDrawer, HyDrawerLayout } from './drawer-layout';

@Component({
  imports: [HyDockedDrawer, HyDrawerLayout],
  template: `<hy-drawer-layout #layout [(opened)]="opened" [mode]="mode()" [hasBackdrop]="backdrop()" [dismissible]="dismissible()">
    <hy-docked-drawer label="Filters"><input value="preset" aria-label="Filter" /></hy-docked-drawer>
    <button type="button" (click)="layout.toggle()">Open</button>
  </hy-drawer-layout>`,
})
class Host {
  readonly opened = signal(false);
  readonly mode = signal<'side' | 'over'>('over');
  readonly backdrop = signal<boolean | undefined>(undefined);
  readonly dismissible = signal(true);
}

it('preserves the projected drawer, scopes interaction blocking, and restores focus on dismissal', async () => {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const host = fixture.componentInstance;
  const root: HTMLElement = fixture.nativeElement;
  const content = root.querySelector<HTMLElement>('.content')!;
  const drawer = root.querySelector<HTMLElement>('.drawer')!;
  const open = root.querySelector('button')!;
  const input = drawer.querySelector('input')!;
  expect(drawer.hidden).toBe(true);
  open.focus();
  open.click();
  await fixture.whenStable();
  expect(host.opened()).toBe(true);
  expect(content.inert).toBe(true);
  expect(document.activeElement).toBe(drawer);
  input.value = 'custom';
  input.focus();
  const escape = () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  host.dismissible.set(false);
  await fixture.whenStable();
  escape();
  expect(host.opened()).toBe(true);
  host.dismissible.set(true);
  await fixture.whenStable();
  escape();
  await fixture.whenStable();
  expect(drawer.hidden).toBe(true);
  expect(document.activeElement).toBe(open);
  host.mode.set('side');
  host.opened.set(true);
  await fixture.whenStable();
  expect(drawer.querySelector('input')).toBe(input);
  expect(input.value).toBe('custom');
  expect(content.inert).toBe(false);
  expect(root.querySelector('.backdrop')).toBeNull();
  host.backdrop.set(true);
  await fixture.whenStable();
  expect(content.inert).toBe(true);
  root.querySelector<HTMLElement>('.backdrop')!.click();
  await fixture.whenStable();
  expect(host.opened()).toBe(false);
});
