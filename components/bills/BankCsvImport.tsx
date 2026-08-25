'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Upload, Check, Repeat, AlertCircle, Loader2 } from 'lucide-react';
import { parseBankCsv, type ParseResult, type RecurringGroup } from '@/lib/bills/csv-parser';

const money = (n: number) =>
  `$${n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CADENCE_LABEL: Record<RecurringGroup['cadence'], string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  irregular: 'Irregular',
};

/**
 * Drag-drop / click CSV import for NZ bank statements. Parsing is 100% local —
 * the file never leaves the browser. Detects the bank, counts transactions,
 * and surfaces the recurring charges it found.
 */
export function BankCsvImport() {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const readAsText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('read failed'));
      r.readAsText(file);
    });

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;
    setResult(null);
    setFileName(file.name);
    setBusy(true);
    try {
      const text = await readAsText(file);
      // Parsing is synchronous & local; the tick lets the spinner paint.
      await new Promise((r) => setTimeout(r, 0));
      setResult(parseBankCsv(text));
    } catch {
      setResult({ bank: 'Unknown', transactions: [], recurring: [], error: "We couldn't read that file." });
    } finally {
      setBusy(false);
    }
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    void handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const unhappy = result && (result.bank === 'Unknown' || result.transactions.length === 0);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-10 text-center transition"
        style={{
          border: `1.5px dashed ${over ? 'var(--b-teal)' : 'var(--b-line)'}`,
          background: over ? 'var(--b-teal-soft)' : 'var(--b-surface-alt)',
        }}
      >
        <span
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}
        >
          <Upload size={22} />
        </span>
        <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>
          Drop a bank CSV here, or click to browse
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--b-muted)' }}>
          ANZ · ASB · BNZ · Westpac · Kiwibank — read privately on your device
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {busy && (
        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)', color: 'var(--b-muted)' }}
        >
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--b-teal)' }} />
          Reading <span className="font-medium" style={{ color: 'var(--b-ink)' }}>{fileName}</span> — parsing locally…
        </div>
      )}

      {unhappy && (
        <div
          className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--b-coral-soft)', border: '1px solid var(--b-coral-line)', color: 'var(--b-coral-deep)' }}
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>
            {result?.error ??
              "We couldn't recognise this file as a bank statement. Export a CSV from ANZ, ASB, BNZ, Westpac or Kiwibank and try again."}
          </span>
        </div>
      )}

      {result && !unhappy && (
        <div className="mt-3 rounded-xl px-4 py-4" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <Check size={15} style={{ color: 'var(--b-teal-deep)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>
              Read {result.transactions.length.toLocaleString('en-NZ')} transactions
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[12px] font-semibold uppercase tracking-wide"
              style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}
            >
              {result.bank}
            </span>
          </div>

          {result.recurring.length > 0 ? (
            <div className="mt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>
                <Repeat size={12} style={{ color: 'var(--b-teal-deep)' }} />
                {result.recurring.length} recurring {result.recurring.length === 1 ? 'charge' : 'charges'} found
              </p>
              <ul className="flex flex-col gap-1.5">
                {result.recurring.map((g, i) => (
                  <li
                    key={`${g.merchant}-${g.amount}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                    style={{ background: 'var(--b-surface-alt)', border: '1px solid var(--b-line)' }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>
                        {toTitle(g.merchant)}
                      </p>
                      <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>
                        {CADENCE_LABEL[g.cadence]} · {g.occurrences}× · last {g.lastDate}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: 'var(--b-coral-deep)' }}>
                      {money(g.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-xs" style={{ color: 'var(--b-muted)' }}>
              No recurring charges detected in this statement.
            </p>
          )}

          <p className="mt-3 text-[12px]" style={{ color: 'var(--b-faint)' }}>
            Parsed entirely on your device — nothing was uploaded.
          </p>
        </div>
      )}
    </div>
  );
}

/** Uppercase merchant key → readable title case for display. */
function toTitle(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
