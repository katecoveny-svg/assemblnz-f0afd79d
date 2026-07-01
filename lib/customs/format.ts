/** Formatting helpers shared across the customs workspace. */

export function formatMoney(value: number, currency = 'NZD'): string {
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency.length === 3 ? currency.toUpperCase() : 'NZD',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function nonNegative(n: number | undefined | null): number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0;
}

/** Days from now (positive = future). Deterministic given `now`. */
export function daysUntil(iso: string, now: Date): number {
  const then = new Date(iso).getTime();
  const ms = then - now.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatNzDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatNzDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Relative deadline phrasing, e.g. "in 3 days", "today", "2 days overdue". */
export function relativeDeadline(iso: string, now: Date): string {
  const d = daysUntil(iso, now);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d > 1) return `in ${d} days`;
  if (d === -1) return '1 day overdue';
  return `${Math.abs(d)} days overdue`;
}
