// Provider-free wake-up executor. Reads only the saved notes, sorts them by what
// the dates and words say, and writes a worksheet. No model, no inbox, no action.
import { PERSONAL_BOUNDARY, type WakeTrigger } from "./contract";


export type WorksheetInput = {
  title: string;
  goal: string;
  notes: string;
  timezone: string;
  now: Date;
  trigger: WakeTrigger;
  note?: string | null;
};
type Item = { text: string; date: string | null; waiting: boolean; question: boolean; done: boolean };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WAITING = /\b(waiting (on|for)|chase|chasing|follow(?:ing)? up|no reply|hasn'?t replied|still owed|owes me)\b/i;
const QUESTION = /\?\s*$|^\s*(should (i|we)|do (i|we)|decide|undecided|not sure)\b/i;
const DONE = /^\s*(?:-\s*)?\[x\]|^\s*(done|finished|paid|booked|sent)\b[:\s]/i;

/** Calendar date in the owner's time zone as a UTC-midnight Date, for whole-day arithmetic. */
export function localDay(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-NZ", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
}
const key = (day: Date) => day.toISOString().slice(0, 10);
const addDays = (day: Date, n: number) => new Date(day.getTime() + n * 864e5);
const dayLabel = (iso: string) => {
  const parts = new Intl.DateTimeFormat("en-NZ", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).formatToParts(new Date(iso + "T00:00:00Z"));
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`;
};

/** First date mentioned in a line, resolved against today in the owner's zone; null when none. */
export function dateIn(text: string, today: Date): string | null {
  const lower = text.toLowerCase();
  let m = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return iso(Number(m[1]), Number(m[2]), Number(m[3]));
  m = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/); // NZ day/month[/year]
  if (m) return iso(m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : nearYear(today, Number(m[2]), Number(m[1])), Number(m[2]), Number(m[1]));
  m = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+(\d{4}))?\b/);
  if (m) return iso(m[3] ? Number(m[3]) : nearYear(today, MONTHS.indexOf(m[2]) + 1, Number(m[1])), MONTHS.indexOf(m[2]) + 1, Number(m[1]));
  m = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (m) return iso(nearYear(today, MONTHS.indexOf(m[1]) + 1, Number(m[2])), MONTHS.indexOf(m[1]) + 1, Number(m[2]));
  if (/\btoday\b|\btonight\b/.test(lower)) return key(today);
  if (/\btomorrow\b/.test(lower)) return key(addDays(today, 1));
  // Whole weekday names and their usual short forms only: "monthly", "wedding" and "sunset" are not dates.
  m = lower.match(/\b(?:(this|next)\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/);
  if (m) {
    const target = DAYS.indexOf(m[2].slice(0, 3));
    const ahead = (target - today.getUTCDay() + 7) % 7;
    // "Friday" on a Friday is today; "next Friday" on a Friday is a week away.
    return key(addDays(today, m[1] === "next" && ahead === 0 ? 7 : ahead));
  }
  if (/\bnext week\b/.test(lower)) return key(addDays(today, 7 - ((today.getUTCDay() + 6) % 7)));
  return null;
}
function iso(y: number, m: number, d: number) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 ? key(date) : null;
}
/** A day/month without a year means the nearest one not more than a week in the past, so late December read in early January is still the overdue one. */
function nearYear(today: Date, month: number, day: number) {
  const year = today.getUTCFullYear();
  const floor = today.getTime() - 7 * 864e5;
  for (const y of [year - 1, year, year + 1]) if (Date.UTC(y, month - 1, day) >= floor) return y;
  return year + 1;
}

export function worksheetItems(notes: string, today: Date): Item[] {
  return notes
    .split(/\r?\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(line => line.length > 1)
    .map(text => ({ text: text.replace(/^\[[ x]?\]\s*/i, ""), date: dateIn(text, today), waiting: WAITING.test(text), question: QUESTION.test(text), done: DONE.test(text) }));
}

const WORD = /[a-z0-9']{4,}/g;
export function prepareWorksheet(input: WorksheetInput) {
  const today = localDay(input.now, input.timezone);
  const todayKey = key(today);
  const weekEnd = key(addDays(today, 6));
  const items = worksheetItems(input.notes, today);
  const section = (heading: string, rows: Item[], render = (i: Item) => i.text) =>
    rows.length ? [`${heading}`, ...rows.map(i => `- ${render(i)}`), ""] : [];
  const dated = (i: Item) => `${i.text} (${dayLabel(i.date as string)})`;
  const open = items.filter(i => !i.done);
  const overdue = open.filter(i => i.date && i.date < todayKey);
  const due = open.filter(i => i.date === todayKey);
  const week = open.filter(i => i.date && i.date > todayKey && i.date <= weekEnd);
  const later = open.filter(i => i.date && i.date > weekEnd);
  const placed = new Set([...overdue, ...due, ...week, ...later]);
  const waiting = open.filter(i => !placed.has(i) && i.waiting);
  const questions = open.filter(i => !placed.has(i) && !i.waiting && i.question);
  const rest = open.filter(i => !placed.has(i) && !i.waiting && !i.question);
  const done = items.filter(i => i.done);
  const noteWords = new Set((input.note ?? "").toLowerCase().match(WORD) ?? []);
  const about = noteWords.size ? open.filter(i => (i.text.toLowerCase().match(WORD) ?? []).some(w => noteWords.has(w))) : [];
  const why = { scheduled: "woke up on schedule", once: "woke up once, as planned", manual: "woke up because you asked", message: "woke up for your note" }[input.trigger];
  const next = overdue[0] ?? due[0] ?? about[0] ?? week[0] ?? waiting[0] ?? questions[0] ?? rest[0];
  return [
    `${input.title} · ${dayLabel(todayKey)} · DO ${why} · prepared from your saved notes · no model called`,
    "",
    `Goal: ${input.goal}`,
    "",
    ...(input.note ? [`Your note: “${input.note}”`, ""] : []),
    ...section("About your note", about),
    ...section("Overdue", overdue, dated),
    ...section("Today", due),
    ...section("This week", week, dated),
    ...section("Later", later, dated),
    ...section("Waiting on someone else", waiting),
    ...section("Questions only you can answer", questions),
    ...section("Everything else you noted", rest),
    ...section("Already done", done),
    next ? `Suggested next step: ${next.text}` : "Nothing in these notes is dated, waiting or open. Add what matters and DO will sort it next time.",
    "",
    PERSONAL_BOUNDARY,
    "Edit the notes to change the next worksheet.",
  ].join("\n");
}
