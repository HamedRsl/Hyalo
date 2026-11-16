import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { HyCommand } from './command';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyCommand', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));
  it('filters normalized text, skips disabled options, and returns typed values from the keyboard', async () => {
    const ref = TestBed.inject(HyCommand).open({
      label: 'Workspace commands',
      items: [
        { id: 'blocked', label: 'Blocked', value: 0, disabled: true },
        { id: 'one', label: 'Café', keywords: ['كیف'], value: 1 },
        { id: 'two', label: 'Reports', value: 2 },
      ],
    });
    await TestBed.inject((await import('@angular/core')).ApplicationRef).whenStable();
    const pane = document.querySelector('hy-command-panel')!;
    const input = pane.querySelector('input')!;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }),
    );
    TestBed.tick();
    const activeId = input.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const active = document.getElementById(activeId!);
    expect(active?.textContent).toContain('Café');
    expect(active?.getAttribute('aria-disabled')).not.toBe('true');
    const result = firstValueFrom(ref.closed);
    input.value = 'cafe';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    TestBed.tick();
    expect(pane.querySelectorAll('[role=option]').length).toBe(1);
    await expectNoAxeViolations(pane);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    expect((await result)?.value).toBe(1);
  });
  it('closes on the first click after the search input loses focus', async () => {
    const ref = TestBed.inject(HyCommand).open({
      items: [{ id: 'one', label: 'Reports', value: 1 }],
    });
    await TestBed.inject((await import('@angular/core')).ApplicationRef).whenStable();
    const pane = document.querySelector('hy-command-panel')!;
    const input = pane.querySelector('input')!;
    const button = pane.querySelector('button')!;
    const result = firstValueFrom(ref.closed);
    input.focus();
    button.focus();
    TestBed.tick();
    expect(pane.querySelectorAll('[role=option]').length).toBe(1);
    button.click();
    expect(await result).toBeUndefined();
    expect(document.querySelector('hy-command-panel')).toBeNull();
  });

  it('caps rendered results and closes immediately on Escape', async () => {
    const ref = TestBed.inject(HyCommand).open({
      items: Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        label: 'Page ' + i,
        value: i,
      })),
    });
    TestBed.tick();
    const pane = document.querySelector('hy-command-panel')!;
    expect(pane.querySelectorAll('[role=option]').length).toBe(50);
    const result = firstValueFrom(ref.closed);
    pane
      .querySelector('input')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    expect(await result).toBeUndefined();
  });
});
