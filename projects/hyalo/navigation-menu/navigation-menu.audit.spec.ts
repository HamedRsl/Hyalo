import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { HyNavigationMenu } from './navigation-menu';

describe('navigation controller (API-176)', () => {
  it('opens only visible enabled branches and emits actual visibility and activation changes', async () => {
    const fixture = TestBed.createComponent(HyNavigationMenu);
    document.body.appendChild(fixture.nativeElement);
    const item = {
      id: 'docs',
      label: 'Docs',
      children: [{ id: 'run', label: 'Run', command: vi.fn() }],
    };
    fixture.componentRef.setInput('items', [item, { ...item, id: 'blocked', disabled: true }]);
    await fixture.whenStable();
    const changed = vi.fn();
    const selected = vi.fn();
    fixture.componentInstance.openChanged.subscribe(changed);
    fixture.componentInstance.selected.subscribe(selected);
    fixture.componentInstance.openMenu('blocked');
    expect(fixture.componentInstance.open()).toBeNull();
    fixture.componentInstance.openMenu('docs');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-expanded')).toBe(
      'true',
    );
    fixture.componentInstance.openMenu('docs');
    expect(changed.mock.calls).toEqual([['docs']]);
    document.querySelector<HTMLButtonElement>('.panel button')!.click();
    await fixture.whenStable();
    expect(selected).toHaveBeenCalledWith(expect.objectContaining({ item: item.children[0] }));
    expect(changed.mock.calls).toEqual([['docs'], [null]]);
    fixture.componentInstance.openMenu('docs');
    await fixture.whenStable();
    fixture.componentInstance.close(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('button'));
  });
});
