import {
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  inject,
  signal,
  type Signal,
} from '@angular/core';

/**
 * Keeps a sliding indicator under the selected item of a row by writing
 * `--hy-ind-x` and `--hy-ind-size` on the row. The offset is physical (from
 * the left edge) and the indicator is placed physically too, so the same
 * numbers work in both directions.
 *
 * Returns a signal that turns true after the first placement, so CSS can
 * enable the transition only from then on.
 */
export function trackIndicator(
  container: Signal<ElementRef<HTMLElement> | undefined>,
  selected: () => HTMLElement | null,
): Signal<boolean> {
  const ready = signal(false);
  // Bumped when the row resizes, for example after web fonts load.
  const size = signal(0);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const row = container()?.nativeElement;
    if (!row || typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(() => size.update((v) => v + 1));
    observer.observe(row);
    destroyRef.onDestroy(() => observer.disconnect());
  });

  afterRenderEffect({
    earlyRead: () => {
      size();
      const row = container()?.nativeElement;
      const item = selected();
      if (!row || !item) return null;
      const rowRect = row.getBoundingClientRect();
      const rect = item.getBoundingClientRect();
      // Rects are in screen pixels, after any zoom or scale on an ancestor,
      // but the custom properties are read in the row's own pixels.
      const scale = row.offsetWidth ? rowRect.width / row.offsetWidth : 1;
      return {
        row,
        x: (rect.left - rowRect.left) / scale + row.scrollLeft,
        size: rect.width / scale,
      };
    },
    write: (measured) => {
      const m = measured();
      if (!m) return;
      m.row.style.setProperty('--hy-ind-x', `${m.x}px`);
      m.row.style.setProperty('--hy-ind-size', `${m.size}px`);
      if (!ready()) requestAnimationFrame(() => ready.set(true));
    },
  });

  return ready.asReadonly();
}
