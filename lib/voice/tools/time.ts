/**
 * Time helpers for booking slots, in Pacific/Auckland.
 *
 * NZ flips between NZST (+12) and NZDT (+13), so we never hard-code an offset:
 * we derive it for the specific date via Intl. All functions are pure and
 * deterministic given their inputs, so the slot tests run without mocking the
 * clock.
 */
import { TIMEZONE } from '@/lib/voice/config';

/** ISO weekday for a YYYY-MM-DD date string: 1=Mon … 7=Sun. */
export function isoWeekday(dateYmd: string): number {
  // Anchor at local noon so the weekday can't slip across a TZ boundary.
  const d = new Date(`${dateYmd}T12:00:00Z`);
  const wd = d.getUTCDay(); // 0=Sun … 6=Sat
  return wd === 0 ? 7 : wd;
}

/** Offset string ("+12:00" / "+13:00") for a date in Pacific/Auckland. */
export function nzOffset(dateYmd: string): string {
  const fmt = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TIMEZONE,
    timeZoneName: 'shortOffset',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(new Date(`${dateYmd}T12:00:00Z`));
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+12';
  const m = tz.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/);
  if (!m) return '+12:00';
  const hh = String(Math.abs(parseInt(m[1], 10))).padStart(2, '0');
  const sign = m[1].startsWith('-') ? '-' : '+';
  return `${sign}${hh}:${m[2] ?? '00'}`;
}

/** Build an ISO datetime with the correct NZ offset for "HH:mm" on a date. */
export function nzDateTime(dateYmd: string, hhmm: string): string {
  return `${dateYmd}T${hhmm}:00${nzOffset(dateYmd)}`;
}

/** Add minutes to "HH:mm", returning "HH:mm" (no day rollover expected here). */
export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/** "19:00" -> "7:00 pm" (NZ-friendly label). */
export function humanTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/** True if [aStart,aEnd) overlaps [bStart,bEnd) (ISO instants). */
export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}
