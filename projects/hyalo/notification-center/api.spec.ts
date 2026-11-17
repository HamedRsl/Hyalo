import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyNotificationCenter } from './notification-center';
import { expectNoAxeViolations } from '../src/testing/axe';
@Component({
  imports: [HyNotificationCenter],
  template: `
    <hy-notification-center
      #center
      [notifications]="items()"
      [itemTemplate]="item"
      (dismissed)="remove($event)"
    />
    <ng-template #item let-note
      ><button type="button" (click)="center.request(note.id, 'dismiss')">
        {{ note.title }}
      </button></ng-template
    >
  `,
})
class TemplateHost {
  readonly center = viewChild.required(HyNotificationCenter);
  readonly items = signal([
    { id: 'a', title: 'First' },
    { id: 'b', title: 'Second' },
  ]);
  remove(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}
describe('notification customization', () => {
  it('recovers focus inside a custom item template after controlled removal', async () => {
    const f = TestBed.createComponent(TemplateHost);
    await f.whenStable();
    const button = f.nativeElement.querySelector('.notification-list button') as HTMLButtonElement;
    button.focus();
    button.click();
    await f.whenStable();
    expect(document.activeElement?.textContent).toContain('Second');
    expect(f.componentInstance.items()).toHaveLength(1);
    await expectNoAxeViolations(f.nativeElement);
  });
  it('separates loading, error, empty, and pagination requests and guards bulk operations', async () => {
    const f = TestBed.createComponent(HyNotificationCenter);
    f.componentRef.setInput('notifications', []);
    f.componentRef.setInput('loading', true);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-empty-state')).toBeNull();
    expect(f.nativeElement.querySelector('[role="status"]').textContent).toContain('Loading');
    f.componentRef.setInput('loading', false);
    f.componentRef.setInput('error', 'Offline');
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-empty-state')).toBeNull();
    expect(f.nativeElement.querySelector('[role="alert"]').textContent).toBe('Offline');
    const more = vi.fn();
    f.componentInstance.moreRequested.subscribe(more);
    f.componentRef.setInput('hasMore', true);
    f.componentRef.setInput('loadingMore', true);
    f.componentInstance.requestMore();
    expect(more).not.toHaveBeenCalled();
    f.componentRef.setInput('loadingMore', false);
    f.componentInstance.requestMore();
    expect(more).toHaveBeenCalledTimes(1);
    f.componentRef.setInput('disabled', true);
    f.componentInstance.requestMore();
    expect(more).toHaveBeenCalledTimes(1);
  });
});
