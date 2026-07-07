'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { UploadCloud, FileText, Check, Loader2 } from 'lucide-react';

type Parsed = { name: string; provider: string; amount: string; category: string };

/**
 * Drag-drop / photo upload for a paper or PDF bill. In this Phase-1 demo the
 * extraction is SIMULATED locally (no file leaves the browser, no OCR call) so
 * the flow is honest and self-contained — it shows what real OCR + LLM
 * extraction would return. The card is clearly labelled as a demo of the flow.
 */
export function UploadDropzone() {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    setFileName(file?.name ?? 'paper-bill.pdf');
    setBusy(true);
    setParsed(null);
    // Simulate OCR + LLM extraction latency, then return a realistic result.
    window.setTimeout(() => {
      setBusy(false);
      setParsed({
        name: file?.name ?? 'paper-bill.pdf',
        provider: 'Watercare',
        amount: '$148.20',
        category: 'Council',
      });
    }, 1100);
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

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
          <UploadCloud size={22} />
        </span>
        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>
          Drop a bill here, or click to browse
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--b-muted)' }}>
          PDF or a photo of a paper bill · demo extracts provider, amount &amp; due date
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {busy && (
        <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)', color: 'var(--b-muted)' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--b-teal)' }} />
          Reading <span className="font-medium" style={{ color: 'var(--b-ink)' }}>{fileName}</span> — extracting details…
        </div>
      )}

      {parsed && (
        <div className="mt-3 rounded-xl px-4 py-3" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-teal-line)' }}>
          <div className="flex items-center gap-2">
            <Check size={15} style={{ color: 'var(--b-teal-deep)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>
              Extracted — review before it’s added
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
            <Field label="Provider" value={parsed.provider} />
            <Field label="Amount" value={parsed.amount} />
            <Field label="Category" value={parsed.category} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--b-faint)' }}>
            <FileText size={12} /> Demo flow — this sample file stays in your browser and isn’t uploaded.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>
        {label}
      </p>
      <p className="font-semibold" style={{ color: 'var(--b-ink)' }}>
        {value}
      </p>
    </div>
  );
}
