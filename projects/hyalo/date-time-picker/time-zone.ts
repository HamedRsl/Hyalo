import { dateEpoch } from '@hyalo/angular/dates';

export interface WallDateTime {
  readonly date: string;
  readonly time: string;
}
function formatter(timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
}
function parts(
  instant: number,
  format: Intl.DateTimeFormat,
): WallDateTime & { readonly second: number } {
  const values = Object.fromEntries(
    format.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  return {
    date: values['year'] + '-' + values['month'] + '-' + values['day'],
    time: values['hour'] + ':' + values['minute'],
    second: Number(values['second']),
  };
}
export function zonedDateTime(instant: number, timeZone: string): WallDateTime | null {
  try {
    return Number.isFinite(instant) ? parts(instant, formatter(timeZone)) : null;
  } catch {
    return null; /* Unsupported instants and zones are validation failures, not render failures. */
  }
}

/** Round-tripping rejects skipped times and retains both instants in a repeated hour. */
export function possibleInstants(date: string, time: string, timeZone: string): readonly number[] {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/u.test(time)) return [];
  try {
    const format = formatter(timeZone);
    const [hour = 0, minute = 0] = time.split(':').map(Number);
    const wall = dateEpoch(date) + hour * 3600000 + minute * 60000;
    const offsets = new Set<number>();
    for (const hours of [-48, -24, -12, 0, 12, 24, 48]) {
      const sample = wall + hours * 3600000;
      const p = parts(sample, format);
      const [h = 0, m = 0] = p.time.split(':').map(Number);
      offsets.add(dateEpoch(p.date) + h * 3600000 + m * 60000 + p.second * 1000 - sample);
    }
    return [...offsets]
      .map((offset) => wall - offset)
      .filter((instant) => {
        const p = parts(instant, format);
        return p.date === date && p.time === time && p.second === 0;
      })
      .sort((a, b) => a - b);
  } catch {
    return []; /* Invalid wall dates and zones cannot produce a selectable instant. */
  }
}
