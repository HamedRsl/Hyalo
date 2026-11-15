interface Point {
  x: number;
  y: number;
}
function triangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const side = (u: Point, v: Point, w: Point): number =>
    (u.x - w.x) * (v.y - w.y) - (v.x - w.x) * (u.y - w.y);
  const d = [side(p, a, b), side(p, b, c), side(p, c, a)];
  return !(d.some((v) => v < 0) && d.some((v) => v > 0));
}
/** Bounded pointer grace; keyboard dismissal never waits for the corridor. */
export class HyHoverIntent {
  private timer?: ReturnType<typeof setTimeout>;
  private abort?: AbortController;
  constructor(private readonly document: Document) {}
  cancel(): void {
    clearTimeout(this.timer);
    this.abort?.abort();
    this.abort = undefined;
  }
  leave(event: PointerEvent | undefined, target: HTMLElement | undefined, close: () => void): void {
    this.cancel();
    const finish = (): void => {
      this.cancel();
      close();
    };
    this.timer = setTimeout(finish, 150);
    if (!event || !target || event.pointerType === 'touch') return;
    const bounds = target.getBoundingClientRect(),
      start = { x: event.clientX, y: event.clientY };
    const dx = (bounds.left + bounds.right) / 2 - start.x,
      dy = (bounds.top + bounds.bottom) / 2 - start.y;
    const horizontal =
      Math.abs(dx) / Math.max(1, bounds.width) > Math.abs(dy) / Math.max(1, bounds.height);
    const edge = horizontal
      ? dx > 0
        ? bounds.left
        : bounds.right
      : dy > 0
        ? bounds.top
        : bounds.bottom;
    const a = horizontal ? { x: edge, y: bounds.top - 8 } : { x: bounds.left - 8, y: edge };
    const b = horizontal ? { x: edge, y: bounds.bottom + 8 } : { x: bounds.right + 8, y: edge };
    const deadline = performance.now() + 500;
    this.abort = new AbortController();
    this.document.addEventListener(
      'pointermove',
      (move) => {
        if (performance.now() >= deadline) {
          finish();
          return;
        }
        if (!triangle({ x: move.clientX, y: move.clientY }, start, a, b)) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(finish, Math.min(150, deadline - performance.now()));
      },
      { passive: true, signal: this.abort.signal },
    );
  }
}
