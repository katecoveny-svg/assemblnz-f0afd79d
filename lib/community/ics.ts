/**
 * Calendar-file support for community agent chats (/a/[slug]).
 *
 * The family-admin prompt addendum asks the model to append a fenced
 * ```ics-events block — one JSON object per line: {title, date, time?, note?}
 * — when a reply contains dated events. This module is both halves of that
 * contract on the client: extractIcsEvents() strips the block from the
 * displayed text and defensively validates each line (malformed lines are
 * ignored silently; hard caps on count and string lengths), and buildIcs()
 * hand-rolls a valid VCALENDAR string — no dependencies, UTC-naive (floating
 * local) timed events or all-day events, RFC 5545 text escaping and 75-octet
 * line folding.
 *
 * Pure and client-safe: no server-only imports.
 */

export interface IcsEvent {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, 24-hour — omitted means all-day. */
  time?: string;
  note?: string;
}

export const MAX_ICS_EVENTS = 30;
const MAX_TITLE_CHARS = 200;
const MAX_NOTE_CHARS = 500;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Matches a complete fenced block — or, mid-stream, an unterminated one — so
// raw JSON never flashes into the chat while a reply is still streaming.
const ICS_BLOCK_RE = /```ics-events[^\S\n]*\n?([\s\S]*?)(?:```|$)/g;

/** True for a real calendar date (rejects e.g. 2026-02-30). */
function isRealDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const [y, m, d] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d
  );
}

/** Validate + clamp one JSON line into an IcsEvent, or null to skip it. */
function parseEventLine(line: string): IcsEvent | null {
  if (!line || line.length > 2000) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const title = typeof r.title === 'string' ? r.title.trim().slice(0, MAX_TITLE_CHARS) : '';
  const date = typeof r.date === 'string' ? r.date.trim() : '';
  if (!title || !isRealDate(date)) return null;

  const event: IcsEvent = { title, date };
  if (typeof r.time === 'string' && TIME_RE.test(r.time.trim())) {
    event.time = r.time.trim();
  }
  if (typeof r.note === 'string' && r.note.trim()) {
    event.note = r.note.trim().slice(0, MAX_NOTE_CHARS);
  }
  return event;
}

/**
 * Strip every ics-events block from a reply and return the events parsed from
 * it. Malformed lines are skipped silently; at most MAX_ICS_EVENTS survive.
 */
export function extractIcsEvents(text: string): { text: string; events: IcsEvent[] } {
  if (!text.includes('```ics-events')) return { text, events: [] };
  const events: IcsEvent[] = [];
  const cleaned = text
    .replace(ICS_BLOCK_RE, (_match, body: string) => {
      for (const line of body.split('\n')) {
        if (events.length >= MAX_ICS_EVENTS) break;
        const event = parseEventLine(line.trim());
        if (event) events.push(event);
      }
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: cleaned, events };
}

/** RFC 5545 §3.3.11 TEXT escaping. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 §3.1 line folding — content lines over 75 octets fold with CRLF + space. */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let octets = 0;
  for (const ch of line) {
    const chOctets = encoder.encode(ch).length;
    if (octets + chOctets > 75) {
      parts.push(current);
      current = '';
      octets = 1; // the folded continuation line's leading space
    }
    current += ch;
    octets += chOctets;
  }
  parts.push(current);
  return parts.map((part, i) => (i === 0 ? part : ` ${part}`)).join('\r\n');
}

/** YYYYMMDD for the day after a YYYY-MM-DD date (all-day DTEND is exclusive). */
function nextDayBasic(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(next.getUTCDate()).padStart(2, '0');
  return `${next.getUTCFullYear()}${mm}${dd}`;
}

/**
 * Build a VCALENDAR string from validated events. Timed events are floating
 * local time (no TZID, no Z) — the reader's calendar keeps them at the wall
 * clock they were written for; all-day events use VALUE=DATE.
 */
export function buildIcs(events: IcsEvent[]): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uidBase = now.getTime().toString(36);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//assembl//community-agent//EN',
    'CALSCALE:GREGORIAN',
  ];
  events.slice(0, MAX_ICS_EVENTS).forEach((event, index) => {
    const day = event.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uidBase}-${index}-${day}@assembl.co.nz`);
    lines.push(`DTSTAMP:${stamp}`);
    if (event.time) {
      lines.push(`DTSTART:${day}T${event.time.replace(':', '')}00`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${day}`);
      lines.push(`DTEND;VALUE=DATE:${nextDayBasic(event.date)}`);
    }
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
    if (event.note) lines.push(`DESCRIPTION:${escapeIcsText(event.note)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
