export interface HyRowWindow {
  readonly first: number;
  readonly last: number;
  readonly before: number;
  readonly after: number;
}
export function rowWindow(
  total: number,
  rowHeight: number,
  scrollTop: number,
  viewportHeight: number,
  overscan = 4,
  initialCount = 10,
): HyRowWindow {
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(rowHeight) || rowHeight <= 0)
    return { first: 0, last: 0, before: 0, after: 0 };
  total = Math.floor(total);
  const buffer = Number.isFinite(overscan) ? Math.min(100, Math.max(0, Math.trunc(overscan))) : 4;
  const initial = Number.isFinite(initialCount)
    ? Math.min(100, Math.max(1, Math.trunc(initialCount)))
    : 10;
  const offset = Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0;
  const visible =
    Number.isFinite(viewportHeight) && viewportHeight > 0
      ? Math.ceil(viewportHeight / rowHeight) + 1
      : initial;
  const start = Math.min(total - 1, Math.floor(offset / rowHeight));
  const first = Math.max(0, start - buffer);
  const last = Math.min(total, start + visible + buffer);
  return { first, last, before: first * rowHeight, after: (total - last) * rowHeight };
}
