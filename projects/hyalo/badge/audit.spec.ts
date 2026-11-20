import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyBadge } from './badge';
@Component({
  imports: [HyBadge],
  template: `<hy-badge removable (removed)="removed = removed + 1"
    >Draft<span hyBadgeRemoveIcon>Delete</span></hy-badge
  >`,
})
class Host {
  removed = 0;
}
describe('badge removal projection', () => {
  it('renders the custom removal icon within the native button and emits once per activation', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const button: HTMLButtonElement = f.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('Delete');
    expect(button.getAttribute('aria-label')).toBe('Remove');
    button.click();
    expect(f.componentInstance.removed).toBe(1);
  });
});
