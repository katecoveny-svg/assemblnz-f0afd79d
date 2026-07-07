/**
 * Multi-bank NZ bank-statement CSV parser — pure TypeScript, no dependencies,
 * runs in the browser. Detects the exporting bank from the header (or preamble),
 * normalises transactions to a common shape, and finds recurring charges.
 *
 * Everything here is a pure function. No I/O, no network, no globals.
 */

export type ParsedTxn = { date: string; amount: number; description: string; balance?: number };
export type BankFormat = 'ANZ' | 'ASB' | 'BNZ' | 'Westpac' | 'Kiwibank' | 'Unknown';
export type RecurringGroup = {
  merchant: string;
  amount: number;
  occurrences: number;
  cadence: 'weekly' | 'fortnightly' | 'monthly' | 'irregular';
  lastDate: string;
};
export type ParseResult = {
  bank: BankFormat;
  transactions: ParsedTxn[];
  recurring: RecurringGroup[];
  error?: string;
};

/* ------------------------------------------------------------------ */
/* CSV primitives                                                     */
/* ------------------------------------------------------------------ */

/** Split one CSV line into fields, honouring double-quoted fields that
 * contain commas and escaped ("") quotes. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((f) => f.trim());
}

/** Split raw text into non-empty logical lines (handles \r\n, \r, \n). */
function toLines(csvText: string): string[] {
  return csvText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/﻿/g, '').trimEnd())
    .filter((l) => l.trim().length > 0);
}

/* ------------------------------------------------------------------ */
/* Value normalisation                                                */
/* ------------------------------------------------------------------ */

/** Normalise a date string to ISO yyyy-mm-dd, or '' if unparseable.
 * Handles dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, dd/mm/yy (→ 20yy), yyyy-mm-dd. */
export function normaliseDate(raw: string): string {
  const s = (raw ?? '').trim();
  if (!s) return '';

  // yyyy-mm-dd or yyyy/mm/dd
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return iso(+y, +mo, +d);
  }

  // dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy  (day-first — NZ convention)
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return iso(+y, +mo, +d);
  }

  // dd/mm/yy, dd-mm-yy  → assume 20yy
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);
  if (m) {
    const [, d, mo, y] = m;
    return iso(2000 + +y, +mo, +d);
  }

  return '';
}

function iso(y: number, mo: number, d: number): string {
  if (!y || !mo || !d || mo > 12 || d > 31) return '';
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Parse a money string to a number. Handles thousands separators, a
 * leading/trailing minus, currency symbols, and (parentheses) for negatives.
 * Returns NaN if there is no numeric content. */
export function parseAmount(raw: string): number {
  let s = (raw ?? '').trim();
  if (!s) return NaN;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.includes('-')) negative = true;
  // strip currency symbols, spaces, commas, stray minus/plus
  s = s.replace(/[^0-9.]/g, '');
  if (!s || s === '.') return NaN;
  const n = parseFloat(s);
  if (Number.isNaN(n)) return NaN;
  return negative ? -n : n;
}

/* ------------------------------------------------------------------ */
/* Bank detection                                                     */
/* ------------------------------------------------------------------ */

const has = (cols: string[], name: string) => cols.some((c) => c.toLowerCase() === name.toLowerCase());
const hasAll = (cols: string[], names: string[]) => names.every((n) => has(cols, n));

/** Detect the exporting bank from a single header line's column names. */
export function detectBankFormat(headerLine: string): BankFormat {
  const cols = splitCsvLine(headerLine);
  const lower = cols.map((c) => c.toLowerCase());

  // ASB — the real header carries "Unique Id" + "Tran Type" + "Payee".
  if (hasAll(cols, ['Date', 'Unique Id', 'Tran Type']) || (has(cols, 'Unique Id') && has(cols, 'Payee'))) {
    return 'ASB';
  }

  // Kiwibank — leads with "Account number" and carries the OP/TP ref columns.
  if (
    has(cols, 'Account number') &&
    (lower.includes('memo/description') || lower.some((c) => c.startsWith('op ') || c.startsWith('tp ')))
  ) {
    return 'Kiwibank';
  }

  // BNZ — Payee + Particulars + Code + "Tran Type" + "This Party Account".
  if (
    hasAll(cols, ['Date', 'Amount', 'Payee']) &&
    (has(cols, 'This Party Account') || has(cols, 'Tran Type') || has(cols, 'Processed Date'))
  ) {
    return 'BNZ';
  }

  // Westpac — "Other Party" or "Analysis Code" alongside Description.
  if (has(cols, 'Analysis Code') || (has(cols, 'Other Party') && has(cols, 'Description'))) {
    return 'Westpac';
  }

  // ANZ — Type/Details/Particulars/Code/Reference/Amount/Date, or the short
  // Date/Amount/Details export.
  if (
    (has(cols, 'Details') && has(cols, 'Particulars') && has(cols, 'Amount') && has(cols, 'Type')) ||
    (has(cols, 'Details') && has(cols, 'Amount') && has(cols, 'Date') && cols.length <= 4)
  ) {
    return 'ANZ';
  }

  return 'Unknown';
}

/** Does a line look like the ASB/preamble metadata rather than data? */
function isAsbPreamble(line: string): boolean {
  return /^(bank|account|from date|to date|created date)\b/i.test(line.trim());
}

/* ------------------------------------------------------------------ */
/* Column mapping per bank                                            */
/* ------------------------------------------------------------------ */

type ColMap = {
  date: number;
  amount: number;
  balance: number;
  descParts: number[]; // ordered, most-descriptive first; joined for description
};

const idx = (cols: string[], name: string) =>
  cols.findIndex((c) => c.toLowerCase() === name.toLowerCase());

const firstIdx = (cols: string[], names: string[]) => {
  for (const n of names) {
    const i = idx(cols, n);
    if (i !== -1) return i;
  }
  return -1;
};

function mapColumns(bank: BankFormat, header: string[]): ColMap {
  const date = firstIdx(header, ['Date']);
  const amount = firstIdx(header, ['Amount']);
  const balance = firstIdx(header, ['Balance']);

  const primary = firstIdx(header, [
    'Payee',
    'Details',
    'Other Party',
    'OP name',
    'Description',
    'Memo/Description',
    'Memo',
    'Payee/Description',
  ]);
  const secondary = [
    firstIdx(header, ['Particulars', 'TP part', 'OP part']),
    firstIdx(header, ['Code', 'TP code', 'OP code', 'Analysis Code']),
    firstIdx(header, ['Reference', 'TP ref', 'OP ref']),
    firstIdx(header, ['Memo']),
  ];

  const descParts: number[] = [];
  if (primary !== -1) descParts.push(primary);
  for (const s of secondary) if (s !== -1 && !descParts.includes(s)) descParts.push(s);

  return { date, amount, balance, descParts };
}

/** Best-effort column discovery for Unknown formats: scan the first data rows
 * to find a date-like column and an amount-like column. */
function guessColumns(header: string[], rows: string[][]): ColMap {
  let date = firstIdx(header, ['Date']);
  let amount = firstIdx(header, ['Amount']);
  const balance = firstIdx(header, ['Balance']);
  const width = Math.max(header.length, ...rows.map((r) => r.length), 0);

  const sample = rows.slice(0, 12);
  if (date === -1) {
    for (let c = 0; c < width; c++) {
      const hits = sample.filter((r) => normaliseDate(r[c] ?? '')).length;
      if (hits >= Math.max(1, Math.ceil(sample.length * 0.6))) {
        date = c;
        break;
      }
    }
  }
  if (amount === -1) {
    for (let c = 0; c < width; c++) {
      if (c === date) continue;
      const vals = sample.map((r) => parseAmount(r[c] ?? '')).filter((n) => !Number.isNaN(n));
      // amount column: mostly numeric AND at least one value has a fraction or sign
      if (
        vals.length >= Math.max(1, Math.ceil(sample.length * 0.6)) &&
        vals.some((v) => v < 0 || Math.abs(v) % 1 !== 0)
      ) {
        amount = c;
        break;
      }
    }
    // fallback: any mostly-numeric column
    if (amount === -1) {
      for (let c = 0; c < width; c++) {
        if (c === date) continue;
        const vals = sample.map((r) => parseAmount(r[c] ?? '')).filter((n) => !Number.isNaN(n));
        if (vals.length >= Math.max(1, Math.ceil(sample.length * 0.6))) {
          amount = c;
          break;
        }
      }
    }
  }

  // description: the widest text column that isn't date/amount/balance
  const descParts: number[] = [];
  let best = -1;
  let bestLen = 0;
  for (let c = 0; c < width; c++) {
    if (c === date || c === amount || c === balance) continue;
    const len = sample.reduce((a, r) => a + (r[c]?.length ?? 0), 0);
    const numericish = sample.filter((r) => !Number.isNaN(parseAmount(r[c] ?? ''))).length;
    if (numericish > sample.length * 0.7) continue; // skip numeric columns
    if (len > bestLen) {
      bestLen = len;
      best = c;
    }
  }
  if (best !== -1) descParts.push(best);

  return { date, amount, balance, descParts };
}

/* ------------------------------------------------------------------ */
/* Main parse                                                         */
/* ------------------------------------------------------------------ */

export function parseBankCsv(csvText: string): ParseResult {
  const empty = (error: string): ParseResult => ({ bank: 'Unknown', transactions: [], recurring: [], error });

  if (!csvText || !csvText.trim()) return empty('The file was empty.');

  let lines = toLines(csvText);
  if (lines.length === 0) return empty('The file had no readable rows.');

  // Peel off ASB-style preamble metadata to find the real header.
  let preambleTrimmed = false;
  while (lines.length > 1 && isAsbPreamble(lines[0])) {
    lines.shift();
    preambleTrimmed = true;
  }
  if (lines.length === 0) return empty('The file had no transaction rows.');

  const headerLine = lines[0];
  let bank = detectBankFormat(headerLine);

  // Kiwibank sometimes ships headerless — first cell is an account number and
  // the row already looks like data. Detect that and synthesise the header.
  const headerLooksLikeData = normaliseDate(splitCsvLine(headerLine)[1] ?? '') !== '' &&
    !Number.isNaN(parseAmount(splitCsvLine(headerLine)[12] ?? ''));

  let header: string[];
  let dataLines: string[];

  if (bank === 'Unknown' && headerLooksLikeData) {
    // Assume Kiwibank fixed layout (no header row).
    bank = 'Kiwibank';
    header = [
      'Account number', 'Date', 'Memo/Description', 'Source Code', 'TP ref', 'TP part',
      'TP code', 'OP ref', 'OP part', 'OP code', 'OP name', 'OP Bank Account Number',
      'Amount', 'Balance',
    ];
    dataLines = lines; // every line is data
  } else {
    header = splitCsvLine(headerLine);
    dataLines = lines.slice(1);
  }

  const rows = dataLines.map(splitCsvLine).filter((r) => r.some((c) => c.length > 0));

  const cols =
    bank === 'Unknown' ? guessColumns(header, rows) : mapColumns(bank, header);

  if (cols.date === -1 || cols.amount === -1) {
    return empty(
      bank === 'Unknown'
        ? "We couldn't recognise this as a bank statement — no date and amount columns found."
        : `Recognised a ${bank} export but couldn't locate the date/amount columns.`,
    );
  }

  const transactions: ParsedTxn[] = [];
  for (const r of rows) {
    const date = normaliseDate(r[cols.date] ?? '');
    const amount = parseAmount(r[cols.amount] ?? '');
    if (!date || Number.isNaN(amount)) continue;

    const description = cols.descParts
      .map((i) => (r[i] ?? '').trim())
      .filter(Boolean)
      .join(' · ')
      .replace(/\s+/g, ' ')
      .trim();

    const txn: ParsedTxn = { date, amount, description: description || '(no description)' };
    if (cols.balance !== -1) {
      const bal = parseAmount(r[cols.balance] ?? '');
      if (!Number.isNaN(bal)) txn.balance = bal;
    }
    transactions.push(txn);
  }

  if (transactions.length === 0) {
    return {
      bank,
      transactions: [],
      recurring: [],
      error:
        bank === 'Unknown'
          ? "We couldn't read any transactions from this file."
          : `Recognised a ${bank} export but read 0 transactions.${preambleTrimmed ? '' : ''}`,
    };
  }

  return { bank, transactions, recurring: detectRecurring(transactions) };
}

/* ------------------------------------------------------------------ */
/* Recurring-charge detection                                         */
/* ------------------------------------------------------------------ */

/** Normalise a description into a stable merchant key: uppercase, strip
 * trailing reference numbers, dates, card tails and card-payment noise. */
export function merchantKey(description: string): string {
  let s = description.toUpperCase();
  // drop the joined secondary parts — keep the primary merchant token group
  s = s.split('·')[0];
  // remove common card / payment prefixes
  s = s.replace(/\b(EFTPOS|VISA PURCHASE|VISA|POS|DEBIT|CARD|PAYMENT TO|PAYMENT FROM|D\/D|AP|DD|BILL PAYMENT)\b/g, ' ');
  // remove dates embedded in the description
  s = s.replace(/\b\d{1,2}[-/.]\d{1,2}([-/.]\d{2,4})?\b/g, ' ');
  // remove long digit runs (ref numbers, card tails, amounts)
  s = s.replace(/\b\d{3,}\b/g, ' ');
  // remove trailing standalone numbers / short codes
  s = s.replace(/[^A-Z0-9&]+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  // collapse to a few leading words — enough to identify the merchant
  const words = s.split(' ').filter(Boolean);
  return words.slice(0, 4).join(' ');
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function daysBetween(a: string, b: string): number {
  const da = Date.parse(a + 'T00:00:00Z');
  const db = Date.parse(b + 'T00:00:00Z');
  if (Number.isNaN(da) || Number.isNaN(db)) return NaN;
  return Math.abs(db - da) / 86_400_000;
}

function cadenceFromGap(gap: number): RecurringGroup['cadence'] {
  if (gap >= 5 && gap <= 9) return 'weekly';
  if (gap >= 12 && gap <= 16) return 'fortnightly';
  if (gap >= 26 && gap <= 33) return 'monthly';
  return 'irregular';
}

/**
 * Find recurring debits: group by (merchantKey, amount within ±$0.50) where the
 * pair appears ≥2 times. Only money-out (negative) transactions count as
 * recurring charges. Cadence is inferred from the median gap between dates.
 */
export function detectRecurring(txns: ParsedTxn[]): RecurringGroup[] {
  const debits = txns.filter((t) => t.amount < 0);

  // Bucket by merchant key first.
  const byMerchant = new Map<string, ParsedTxn[]>();
  for (const t of debits) {
    const key = merchantKey(t.description);
    if (!key) continue;
    const arr = byMerchant.get(key) ?? [];
    arr.push(t);
    byMerchant.set(key, arr);
  }

  const groups: RecurringGroup[] = [];

  for (const [key, items] of byMerchant) {
    // Within a merchant, cluster by amount (±$0.50).
    const used = new Array(items.length).fill(false);
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue;
      const base = Math.abs(items[i].amount);
      const cluster = [items[i]];
      used[i] = true;
      for (let j = i + 1; j < items.length; j++) {
        if (used[j]) continue;
        if (Math.abs(Math.abs(items[j].amount) - base) <= 0.5) {
          cluster.push(items[j]);
          used[j] = true;
        }
      }
      if (cluster.length < 2) continue;

      const dates = cluster.map((c) => c.date).sort();
      const gaps: number[] = [];
      for (let k = 1; k < dates.length; k++) {
        const g = daysBetween(dates[k - 1], dates[k]);
        if (!Number.isNaN(g) && g > 0) gaps.push(g);
      }
      const medGap = median(gaps);

      groups.push({
        merchant: key,
        amount: Math.round(base * 100) / 100,
        occurrences: cluster.length,
        cadence: gaps.length ? cadenceFromGap(medGap) : 'irregular',
        lastDate: dates[dates.length - 1],
      });
    }
  }

  groups.sort((a, b) => b.occurrences - a.occurrences || b.amount - a.amount);
  return groups;
}
