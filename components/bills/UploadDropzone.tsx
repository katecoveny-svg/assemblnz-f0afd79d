'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { UploadCloud, FileText, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useBillsSession } from './useSession';

type Parsed = {
  provider: string | null;
  category: string | null;
  total_amount: number | null;
  due_date: string | null;
  account_number: string | null;
  confidence: string | null;
};

const money = (n: number | null) => (n == null ? '—' : `$${n.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`);
const MAX = 8 * 1024 * 1024;

/**
 * Drag-drop / photo upload → REAL vision extraction via /api/bills/parse (Anthropic → platform edge model).
 * The file is read to a base64 data URL in the browser and POSTed; the endpoint
 * runs the actual model and persists the record. Real bill in → real fields out.
 */
export function UploadDropzone({ sessionId: sessionProp }: { sessionId?: string }) {
  const sessionHook = useBillsSession();
  const sessionId = sessionProp || sessionHook;
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('read failed'));
      r.readAsDataURL(file);
    });

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setError('');
      setParsed(null);
      if (file.size > MAX) {
        setError('That file is over 8MB — try a smaller image or PDF.');
        return;
      }
      setFileName(file.name);
      setBusy(true);
      try {
        const dataUrl = await readAsDataUrl(file);
        const res = await fetch('/api/bills/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, fileName: file.name, sessionId, source: file.type === 'application/pdf' ? 'upload' : 'photo' }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error ?? 'Could not read that bill — please try again.');
        } else {
          setParsed(json.parsed as Parsed);
        }
      } catch {
        setError('Network error — please try again.');
      } finally {
        setBusy(false);
      }
    },
    [sessionId],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    void handleFile(e.dataTransfer.files?.[0] ?? null);
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
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
          <UploadCloud size={22} />
        </span>
        <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>
          Drop a bill here, or click to browse
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--b-muted)' }}>
          <Sparkles size={12} style={{ color: 'var(--b-teal-deep)' }} /> PDF or photo · read live by the reading agent
        </p>
        <input ref={inputRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0] ?? null)} />
      </div>

      {busy && (
        <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)', color: 'var(--b-muted)' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--b-teal)' }} />
          Reading <span className="font-medium" style={{ color: 'var(--b-ink)' }}>{fileName}</span> — the reading agent is extracting the fields…
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--b-coral-soft)', border: '1px solid var(--b-coral-line)', color: 'var(--b-coral-deep)' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {parsed && (
        <div className="mt-3 rounded-xl px-4 py-3" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-teal-line)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={15} style={{ color: 'var(--b-teal-deep)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>Extracted — review before it’s added</span>
            </div>
            {parsed.confidence && (
              <span className="rounded-md px-1.5 py-0.5 text-[12px] font-semibold" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
                {parsed.confidence} confidence
              </span>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Field label="Provider" value={parsed.provider ?? '—'} />
            <Field label="Category" value={parsed.category ?? '—'} />
            <Field label="Amount" value={money(parsed.total_amount)} />
            <Field label="Due" value={parsed.due_date ?? '—'} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--b-faint)' }}>
            <FileText size={12} /> Read live and saved to your bill log. Nothing is paid or actioned.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>{label}</p>
      <p className="truncate font-semibold" style={{ color: 'var(--b-ink)' }}>{value}</p>
    </div>
  );
}
