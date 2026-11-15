import { DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/** A static SSR state keeps browser measurements out of the hydration structure. */
export function injectHyVisibility() {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const destroy = inject(DestroyRef);
  const visible = signal(false);
  afterNextRender(() => {
    const doc = host.ownerDocument;
    let intersects = false;
    const update = (): void => visible.set(intersects && doc.visibilityState !== 'hidden');
    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            intersects = entries.some((entry) => entry.isIntersecting);
            update();
          })
        : null;
    observer?.observe(host);
    doc.addEventListener('visibilitychange', update);
    destroy.onDestroy(() => {
      observer?.disconnect();
      doc.removeEventListener('visibilitychange', update);
    });
  });
  return visible.asReadonly();
}
