import { possibleInstants, zonedDateTime } from './time-zone';

describe('date-time zone conversion', () => {
  it('converts explicit zones independently of the host zone', () => {
    expect(possibleInstants('2026-11-16', '12:00', 'Asia/Tehran')).toEqual([
      Date.UTC(2026, 10, 16, 8, 30),
    ]);
    expect(zonedDateTime(Date.UTC(2026, 10, 16, 8, 30), 'Asia/Tehran')).toMatchObject({
      date: '2026-11-16',
      time: '12:00',
    });
  });
  it('rejects a skipped hour and retains both repeated-hour instants', () => {
    expect(possibleInstants('2026-03-08', '02:30', 'America/New_York')).toEqual([]);
    expect(possibleInstants('2026-11-01', '01:30', 'America/New_York')).toEqual([
      Date.UTC(2026, 10, 1, 5, 30),
      Date.UTC(2026, 10, 1, 6, 30),
    ]);
  });
  it('handles half-hour transitions, skipped days, and malformed values', () => {
    expect(possibleInstants('2026-10-04', '02:15', 'Australia/Lord_Howe')).toEqual([]);
    expect(possibleInstants('2011-12-30', '12:00', 'Pacific/Apia')).toEqual([]);
    expect(possibleInstants('2026-02-30', '12:00', 'UTC')).toEqual([]);
    expect(possibleInstants('2026-11-16', '25:00', 'UTC')).toEqual([]);
    expect(possibleInstants('2026-11-16', '12:00', 'Invalid/Zone')).toEqual([]);
    expect(zonedDateTime(NaN, 'UTC')).toBeNull();
  });
});
