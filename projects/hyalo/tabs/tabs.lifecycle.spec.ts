import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { HY_TABS, HyTabs } from './tabs';

@Component({
  imports: [HY_TABS],
  template: `<hy-tabs
    [(selected)]="selected"
    [beforeChange]="guard"
    [dynamicHeight]="dynamicHeight()"
    [animationDuration]="duration()"
  >
    <hy-tab value="one" label="One">One</hy-tab>
    <hy-tab value="two" label="Two" [disabled]="disabled()" [destroyOnHide]="destroy()"
      ><ng-template hyTabContent><input class="lazy" /></ng-template
    ></hy-tab>
    <hy-tab value="three" label="Three">Three</hy-tab>
  </hy-tabs>`,
})
class Host {
  readonly selected = signal<string | undefined>('one');
  readonly disabled = signal(false);
  readonly dynamicHeight = signal(false);
  readonly duration = signal(220);
  readonly destroy = signal(false);
  resolve!: (allowed: boolean) => void;
  readonly guard = () =>
    new Promise<boolean>((resolve) => {
      this.resolve = resolve;
    });
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

describe('dynamic tab height', () => {
  it('interrupts from the visible height, completes the latest selection and cancels on destroy', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    await fixture.whenStable();
    const tabs = fixture.debugElement.query(By.directive(HyTabs)).componentInstance as HyTabs;
    const root: HTMLElement = fixture.nativeElement;
    const viewport = root.querySelector<HTMLElement>('.hy-tabs__panels > div')!;
    const content = viewport.firstElementChild!;
    const heights: Record<string, number> = { one: 40, two: 180, three: 90 };
    const measure = (height: number) => new DOMRect(0, 0, 300, height);
    vi.spyOn(content, 'getBoundingClientRect').mockImplementation(() =>
      measure(heights[host.selected() ?? 'one'] ?? 40),
    );
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(measure(115));
    const animations: (EventTarget & { cancel: ReturnType<typeof vi.fn> })[] = [];
    const animate = vi.fn(() => {
      const animation = Object.assign(new EventTarget(), { cancel: vi.fn() });
      animations.push(animation);
      return animation;
    });
    viewport.animate = animate as unknown as HTMLElement['animate'];
    const completed: string[] = [];
    tabs.transitionComplete.subscribe((value) => completed.push(value));
    host.dynamicHeight.set(true);
    await fixture.whenStable();
    expect(animate).not.toHaveBeenCalled();

    tabs.select('two');
    host.resolve(true);
    await fixture.whenStable();
    expect(animate.mock.calls).toHaveLength(1);
    expect(completed).toEqual([]);

    tabs.select('three');
    host.resolve(true);
    await fixture.whenStable();
    expect(animate).toHaveBeenLastCalledWith(
      [
        { height: '115px', overflow: 'clip' },
        { height: '90px', overflow: 'clip' },
      ],
      expect.objectContaining({ duration: 220 }),
    );
    expect(animations[0]!.cancel).toHaveBeenCalledOnce();
    animations[0]!.dispatchEvent(new Event('finish'));
    animations[1]!.dispatchEvent(new Event('finish'));
    expect(completed).toEqual(['three']);

    host.selected.set('one');
    await fixture.whenStable();
    expect(animate.mock.calls).toHaveLength(3);
    fixture.destroy();
    expect(animations[2]!.cancel).toHaveBeenCalledOnce();
  });

  it('completes after rendering when the height duration is zero', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.duration.set(0);
    host.dynamicHeight.set(true);
    await fixture.whenStable();
    const tabs = fixture.debugElement.query(By.directive(HyTabs)).componentInstance as HyTabs;
    const completed: string[] = [];
    tabs.transitionComplete.subscribe((value) => completed.push(value));
    tabs.select('two');
    host.resolve(true);
    await fixture.whenStable();
    expect(completed).toEqual(['two']);
  });
});
