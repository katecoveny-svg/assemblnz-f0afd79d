import { z } from 'zod';
import { identifyService, type ServiceCategory } from './services';
import { calendarDate } from './model';

/**
 * Reads a bill out of an email, deterministically. The input is the same shape the Personal
 * DO mail read returns (unverified sender header, subject, date, body text). The output is a
 * reading for a person to check against the actual bill before anything is added: nothing here
 * is a confirmed invoice, a due date is only a due date once the person checks it, and account
 * numbers, addresses and links are never copied out. No model is used.
 */
export const mailBillSource = z.object({
  from: z.string().max(500),
  subject: z.string().max(500),
  date: z.string().max(80),
  text: z.string().max(20000),
}).strict();
export type MailBillSource = z.infer<typeof mailBillSource>;

export type BillReading = {
  provider: string | null;
  category: ServiceCategory | null;
  /** Total payable in cents, NZD only. Null when no NZD total is stated. */
  totalCents: number | null;
  dueOn: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  /** Electricity or gas usage in kWh for the period, when the email states it. */
  usageKwh: number | null;
  /** Lines the figures came from, trimmed, with digits that look like account numbers removed. */
  evidence: string[];
  confidence: 'high' | 'medium' | 'low';
  /** True when the email itself says the bill is paid or by direct debit. Still a claim, not a payment record. */
  paymentMentioned: boolean;
  notices: string[];
};

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const iso = (y: number, m: number, d: number) => {
  if (y < 2000 || y > 2100) return null;
  const value = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return calendarDate.safeParse(value).success ? value : null;
};
/** First date in a line: ISO, NZ day/month/year, or "5 October 2026" / "Oct 5, 2026". No year means no date. */
export function readDate(text: string): string | null {
  const lower = text.toLowerCase();
  let m = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return iso(Number(m[1]), Number(m[2]), Number(m[3]));
  m = lower.match(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/);
  if (m) return iso(Number(m[3]), Number(m[2]), Number(m[1]));
  m = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*,?\s+(\d{4})\b/);
  if (m) return iso(Number(m[3]), MONTHS[m[2]], Number(m[1]));
  m = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/);
  if (m) return iso(Number(m[3]), MONTHS[m[1]], Number(m[2]));
  return null;
}
const MONEY = /(?:nz\$|\$|nzd)\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\.(\d{2}))?/i;
function readCents(line: string): number | null {
  const m = line.match(MONEY);
  if (!m) return null;
  const whole = Number(m[1].replace(/,/g, '')), fraction = m[2] ? Number(m[2]) : 0;
  if (!Number.isFinite(whole) || whole > 1_000_000) return null;
  return whole * 100 + fraction;
}
const TOTAL = /\b(?:total (?:amount )?(?:due|payable|to pay)|amount (?:due|payable|to pay)|please pay|balance due|you owe|total for this bill|total)\b/i;
const DUE = /\b(?:due (?:date|on|by)|payment (?:is )?due|pay by|due:)\b/i;
const PERIOD = /\b(?:billing period|bill period|period|for the period|usage period|from)\b/i;
const USAGE = /(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?\s*kwh\b/i;
const PAID = /\b(?:already paid|has been paid|paid in full|direct debit|will be (?:debited|deducted)|automatic payment)\b/i;
const ACCOUNT = /\b(?:account|customer|icp|reference|ref|invoice)\s*(?:no\.?|number|#|:)?\s*[:#]?\s*[A-Z0-9-]{6,}\b/gi;
const LONG_DIGITS = /\b\d[\d -]{7,}\d\b/g;
const SECRET = /https?:\/\/\S+|\S+@\S+/g;
/** Keeps a line readable as evidence while dropping account-like numbers, links and addresses. */
export function evidenceLine(line: string) {
  return line.replace(SECRET, '[link removed]').replace(ACCOUNT, match => match.replace(/[A-Z0-9-]{6,}$/i, '[number removed]')).replace(LONG_DIGITS, '[number removed]').replace(/\s+/g, ' ').trim().slice(0, 160);
}

export function readBillFromMail(input: MailBillSource): BillReading {
  const source = mailBillSource.parse(input);
  const lines = `${source.subject}\n${source.text}`.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const identity = identifyService(source.from) || identifyService(source.subject) || lines.map(identifyService).find(Boolean) || null;
  const notices: string[] = [];
  const evidence: string[] = [];
  let totalCents: number | null = null, dueOn: string | null = null, periodFrom: string | null = null, periodTo: string | null = null, usageKwh: number | null = null;
  for (const line of lines) {
    if (totalCents === null && TOTAL.test(line)) { const cents = readCents(line); if (cents !== null && cents > 0) { totalCents = cents; evidence.push(evidenceLine(line)); } }
    if (dueOn === null && DUE.test(line)) { const date = readDate(line); if (date) { dueOn = date; evidence.push(evidenceLine(line)); } }
    if (periodFrom === null && PERIOD.test(line)) {
      const dates = line.toLowerCase().split(/\s+(?:to|-|–|until)\s+/).map(readDate).filter((value): value is string => Boolean(value));
      if (dates.length === 2 && dates[0] <= dates[1]) { [periodFrom, periodTo] = dates; evidence.push(evidenceLine(line)); }
    }
    if (usageKwh === null) { const m = line.match(USAGE); if (m) { const value = Number(m[1].replace(/,/g, '')); if (value > 0 && value < 100000) { usageKwh = value; evidence.push(evidenceLine(line)); } } }
  }
  if (lines.some(line => /\b(?:AUD?|USD?)\s*\$|\bAUD\b|\bUSD\b|£|€/.test(line))) notices.push('Another currency appears in this email. Only NZD figures are read.');
  if (totalCents === null) notices.push('No total amount was found. Enter it from the bill yourself.');
  if (dueOn === null) notices.push('No due date with a year was found. A due date needs checking against the bill.');
  const paymentMentioned = lines.some(line => PAID.test(line));
  if (paymentMentioned) notices.push('The email mentions a payment or direct debit. That is a claim in the email, not a bank record.');
  if (!identity) notices.push('No known provider name was found. Name the provider yourself.');
  const found = [totalCents !== null, dueOn !== null, identity !== null].filter(Boolean).length;
  return {
    provider: identity?.provider ?? null, category: identity?.category ?? null, totalCents, dueOn, periodFrom, periodTo, usageKwh,
    evidence: [...new Set(evidence)].slice(0, 6), confidence: found === 3 ? 'high' : found === 2 ? 'medium' : 'low', paymentMentioned, notices,
  };
}

export type UsageObservation = { periodFrom: string; periodTo: string; usageKwh: number };
export type UsageCheck = {
  status: 'unusual' | 'typical' | 'insufficient';
  latestDailyKwh: number | null;
  medianDailyKwh: number | null;
  percentAbove: number | null;
  note: string;
};
const days = (from: string, to: string) => Math.max(1, Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000) + 1);
const winter = (to: string) => { const month = Number(to.slice(5, 7)); return month >= 5 && month <= 9; };
/**
 * Unusually high energy use: the latest period's daily kWh against the median of the earlier
 * periods. At least three periods are needed. A rise of 25% or more is flagged; a winter period
 * is still flagged, with the heating season named so the person can judge it.
 */
export function energyUsageCheck(observations: UsageObservation[]): UsageCheck {
  const valid = observations.filter(value => calendarDate.safeParse(value.periodFrom).success && calendarDate.safeParse(value.periodTo).success && value.periodTo >= value.periodFrom && value.usageKwh > 0)
    .sort((a, b) => a.periodTo.localeCompare(b.periodTo));
  if (valid.length < 3) return { status: 'insufficient', latestDailyKwh: null, medianDailyKwh: null, percentAbove: null, note: 'Three periods with usage are needed before a comparison means anything.' };
  const daily = valid.map(value => value.usageKwh / days(value.periodFrom, value.periodTo));
  const latest = daily[daily.length - 1];
  const earlier = daily.slice(0, -1).sort((a, b) => a - b);
  const median = earlier.length % 2 ? earlier[(earlier.length - 1) / 2] : (earlier[earlier.length / 2 - 1] + earlier[earlier.length / 2]) / 2;
  const percentAbove = Math.round((latest / median - 1) * 100);
  const round = (value: number) => Math.round(value * 10) / 10;
  if (percentAbove >= 25) {
    const season = winter(valid[valid.length - 1].periodTo) ? ' This period falls in the heating season, which often explains a rise; check the heater, hot water and any new appliance.' : ' It is outside the usual heating season, so check hot water, a new appliance or a meter reading that was estimated.';
    return { status: 'unusual', latestDailyKwh: round(latest), medianDailyKwh: round(median), percentAbove, note: `The latest period used ${round(latest)} kWh a day against a typical ${round(median)} kWh, ${percentAbove}% more.${season} Ask the provider whether the reading was actual or estimated.` };
  }
  return { status: 'typical', latestDailyKwh: round(latest), medianDailyKwh: round(median), percentAbove, note: `The latest period used ${round(latest)} kWh a day, close to the usual ${round(median)} kWh.` };
}
