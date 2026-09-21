import { splitCsvLine, normaliseDate } from '@/lib/bills/csv-parser';
import { calendarDate, financialSnapshot, parseCents, type FinancialSnapshot } from './model';

export const FINANCIAL_CSV_LIMIT = 256_000;
/** Explicit columns only: no heuristic guesses or silently discarded financial rows. */
export function financialCsv(text: string, asOf: string, observedAt: string): FinancialSnapshot {
  if (new TextEncoder().encode(text).length > FINANCIAL_CSV_LIMIT) throw new Error('Choose a CSV under 256 KB.');
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n').filter(line => line.trim());
  if (lines.length < 2 || lines.length > 2001) throw new Error('Use a CSV with a header and 1–2,000 transactions.');
  if (lines.some(line => (line.match(/"/g) || []).length % 2)) throw new Error('Quoted fields must fit on one line. No rows were imported.');
  const validLine = /^(?:"(?:[^"]|"")*"|[^",]*)(?:,(?:"(?:[^"]|"")*"|[^",]*))*$/;
  if (lines.some(line => !validLine.test(line))) throw new Error('Check CSV quoting. Quote a whole field and escape embedded quotes as two quotes. No rows were imported.');
  const headers = splitCsvLine(lines[0]).map(value => value.toLowerCase());
  if (new Set(headers).size !== headers.length) throw new Error('Remove duplicate column names.');
  const dateIndex = headers.indexOf('date');
  const amountIndex = headers.indexOf('amount');
  const descriptionIndex = headers.findIndex(value => ['description', 'details', 'payee'].includes(value));
  const referenceIndex = headers.indexOf('reference');
  const currencyIndex = headers.indexOf('currency');
  if ([dateIndex, amountIndex, descriptionIndex].some(value => value < 0)) throw new Error('Include Date, Description (or Details/Payee), and Amount columns. Use negative amounts for money out.');
  const transactions = lines.slice(1).map((line, index) => {
    const fields = splitCsvLine(line);
    try {
      if (fields.length !== headers.length) throw new Error();
      const date = calendarDate.parse(normaliseDate(fields[dateIndex]));
      if (date > asOf) throw new Error();
      if (currencyIndex >= 0 && fields[currencyIndex].toUpperCase() !== 'NZD') throw new Error();
      const description = fields[descriptionIndex].trim();
      if (!description || description.length > 1000) throw new Error();
      return {
        id: 'csv-' + (index + 1), accountId: 'csv-account', date, description,
        merchant: null, reference: referenceIndex >= 0 ? fields[referenceIndex] || null : null,
        amount: { amount: parseCents(fields[amountIndex]), currency: 'NZD' as const }, status: 'posted' as const,
        transfer: false,
        source: { kind: 'csv' as const, reference: 'CSV row ' + (index + 2), observedAt },
      };
    } catch { throw new Error('Check CSV row ' + (index + 2) + ': date, NZD amount, description and column count must be valid. No rows were imported.'); }
  });
  return financialSnapshot.parse({
    mode: 'csv', asOf, fetchedAt: observedAt, complete: false,
    accounts: [{ id: 'csv-account', name: 'Your selected CSV', currency: 'NZD', balance: null, balanceObservedAt: null, balanceFreshness: 'unavailable' }],
    transactions, notices: ['Only the selected CSV was analysed. Its coverage and settlement status have not been verified.', 'Repeated transfers or shopping may look recurring. Check each candidate against the source.'],
  });
}
export const FINANCIAL_CSV_EXAMPLE = 'Date,Description,Amount,Currency,Reference\n2026-06-10,Example broadband,-79.00,NZD,DEMO-JUN\n2026-07-10,Example broadband,-79.00,NZD,DEMO-JUL\n2026-08-10,Example broadband,-89.00,NZD,DEMO-AUG\n';
