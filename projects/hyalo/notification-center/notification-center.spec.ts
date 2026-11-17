import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyNotificationCenter } from './notification-center';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyNotificationCenter],
  template:
    '<hy-notification-center [notifications]="items()" (dismissed)="remove($event)" (readRequested)="read($event)" />',
})
class Host {
  readonly items = signal([
    { id: 'old', title: 'Older', read: false, createdAt: '2026-11-16T09:00:00Z' },
    { id: 'new', title: 'Newer', read: false, createdAt: '2026-11-17T09:00:00Z' },
  ]);
  remove(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
  read(id: string): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }
}
describe('HyNotificationCenter', () => {
  it('sorts a copy and retains focus when the host removes a notification', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-notification-card').textContent).toContain('Newer');
    expect(f.componentInstance.items()[0]?.id).toBe('old');
    const dismiss = f.nativeElement.querySelector(
      'hy-notification-card button:last-child',
    ) as HTMLButtonElement;
    dismiss.focus();
    dismiss.click();
    await f.whenStable();
    expect(f.componentInstance.items()).toHaveLength(1);
    expect(
      f.nativeElement.querySelector('hy-notification-card').contains(document.activeElement),
    ).toBe(true);
    await expectNoAxeViolations(f.nativeElement);
  });
  it('updates unread filtering from application-owned read state', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    f.nativeElement.querySelector('.actions button:nth-child(2)').click();
    await f.whenStable();
    const read = f.nativeElement.querySelector('hy-notification-card button') as HTMLButtonElement;
    read.focus();
    read.click();
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('hy-notification-card')).toHaveLength(1);
    expect(f.componentInstance.items().filter((item) => item.read)).toHaveLength(1);
  });
});
