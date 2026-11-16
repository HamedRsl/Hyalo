export interface HyMeasurement {
  readonly min: number;
  readonly max: number;
  readonly value: number | null;
  readonly fraction: number;
}

/** @internal Invalid bounds fall back together so ARIA and geometry share one valid range. */
export function normalizeMeasurement(
  value: number | null,
  min: number,
  max: number,
): HyMeasurement {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(max - min)) {
    min = 0;
    max = 100;
  }
  const reading =
    value !== null && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
  return {
    min,
    max,
    value: reading,
    fraction: reading === null ? 0 : (reading - min) / (max - min),
  };
}
