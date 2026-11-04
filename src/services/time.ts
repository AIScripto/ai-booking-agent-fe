// ── Showing times in the business's time zone ───────────────────────────────
//
// Appointment times are stored and sent in UTC. A person must see them in the business's own time
// zone, not in whatever zone their browser happens to use (UXD-003). The zone comes from the server
// (`timeZone` in the tenant vocabulary and branding answers).
// ────────────────────────────────────────────────────────────────────────────

/** The browser's own zone. Only a stand-in until the server's zone has been loaded. */
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** "9:30 AM" */
export function formatTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone });
}

/** "Tue, Nov 10, 2026, 9:30 AM" */
export function formatDateTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  });
}

/** The calendar date of an instant in a zone, as YYYY-MM-DD. */
export function dateKey(iso: string | Date, timeZone: string): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Today's date in a zone, as YYYY-MM-DD. */
export function todayKey(timeZone: string, now: Date = new Date()): string {
  return dateKey(now, timeZone);
}

/** The hour of the day (0-23) of an instant in a zone. */
export function hourInZone(iso: string, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(iso));
  return Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
}

/** "9 AM", "12 PM" for an hour 0-23. */
export function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** "09:30" (24 hours) for an instant in a zone. Used to match an appointment to a calendar row. */
export function timeKey(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('hour')}:${get('minute')}`;
}

/** How far a zone is ahead of UTC at an instant, in minutes. */
function offsetMinutes(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return (asUtc - utcMs) / 60000;
}

/**
 * The UTC instant for a wall-clock time ('YYYY-MM-DD', 'HH:MM') in a zone. This is what must be sent
 * to the server when someone picks "9:00 AM" on a calendar: 9:00 in the business's zone, not 9:00 UTC.
 * Handles summer time. Same method as the server's availability code (which has tests).
 */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - offsetMinutes(guess, timeZone) * 60000;
  return new Date(guess - offsetMinutes(first, timeZone) * 60000);
}

/** The day of the week (0 = Sunday) of a calendar date written YYYY-MM-DD. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "Tuesday, Nov 10, 2026" for a calendar date written YYYY-MM-DD (the same in every browser zone). */
export function formatDateLong(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
