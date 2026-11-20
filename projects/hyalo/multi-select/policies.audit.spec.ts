import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { HyMultiSelect } from './multi-select';

describe('API-162/163/164/167/168/170 multi-select policies', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('applies filtered select-all with a maximum, preserves disabled selections on clear, summarizes and reports removal', async () => {
    const fixture = TestBed.createComponent(HyMultiSelect<string>);
    fixture.componentRef.setInput('options', [
      { value: 'locked', label: 'Locked', disabled: true },
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Gamma' },
    ]);
    fixture.componentRef.setInput('value', ['locked']);
    fixture.componentRef.setInput('maxSelected', 2);
    fixture.componentRef.setInput('maxVisibleChips', 1);
    fixture.componentRef.setInput('summary', (count: number) => `${count} choices`);
    fixture.componentRef.setInput(
      'filterOption',
      (option: { value: string }) => option.value !== 'c',
    );
    const removed: string[] = [];
    const changes: readonly string[][] = [];
    fixture.componentInstance.removed.subscribe((value) => removed.push(value));
    fixture.componentInstance.selectionChanged.subscribe((value) =>
      (changes as string[][]).push([...value]),
    );
    const visibility: boolean[] = [];
    fixture.componentInstance.visibilityChange.subscribe((value) => visibility.push(value));
    await fixture.whenStable();
    fixture.componentInstance.show();
    await fixture.whenStable();
    expect(document.querySelectorAll('[role=option]')).toHaveLength(3);
    fixture.componentInstance.selectAll();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['locked', 'a']);
    expect(fixture.nativeElement.textContent).toContain('2 choices');
    expect(fixture.nativeElement.querySelectorAll('.chips button')).toHaveLength(1);
    fixture.componentInstance.clearAll();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['locked']);
    fixture.componentRef.setInput('maxVisibleChips', undefined);
    fixture.componentInstance.selectAll();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button[aria-label="Remove Alpha"]').click();
    await fixture.whenStable();
    expect(removed).toEqual(['a']);
    expect(changes.length).toBe(4);
    fixture.componentInstance.hide();
    await fixture.whenStable();
    expect(visibility).toEqual([true, false]);
    fixture.componentRef.setInput('readonly', true);
    await fixture.whenStable();
    fixture.componentInstance.selectAll();
    expect(fixture.componentInstance.value()).toEqual(['locked']);
  });
});
