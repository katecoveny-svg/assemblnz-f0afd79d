'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Mail, Check, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useBillsSession } from './useSession';

type Parsed = {
  provider: string | null;
  category: string | null;
  total_amount: number | null;
  due_date: string | null;
  confidence: string | null;
};

const money = (n: number | null) =>
  n == null ? '—' : `$${n.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`;
const MAX = 2 * 1024 * 1024;

/**
 * Email-first ingestion — forward a bill email and paste it here, or drop the
 * .eml/.txt file. POSTs to /api/bills/parse-email (real model extraction with
 * a deterministic fallback) and logs the record to the session bill log.
 */
export function EmailDropzone() {
  const sessionId = useBillsSession();
  const [text, setText] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const parse = useCallback(
    async (email: string, fileName?: string) => {
      if (email.trim().length < 20) {
        setError('Paste the whole email (or drop the .eml file) so there’s something to read.');
        return;
      }
      setError('');
      setParsed(null);
      setBusy(true);
      try {
        const res = await fetch('/api/bills/parse-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fileName, sessionId }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error ?? 'Could not read that email — please try again.');
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

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (file.size > MAX) {
        setError('Keep email files under 2MB.');
        return;
      }
      const body = await file.text();
      setText(body.slice(0, 20_000));
      void parse(body, file.name);
    },
    [parse],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className="rounded-2xl p-3 transition"
        style={{
          border: `1.5px dashed ${over ? 'var(--b-teal)' : 'var(--b-line)'}`,
          background: over ? 'var(--b-teal-soft)' : 'var(--b-surface-alt)',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder={'Paste a forwarded bill email here — subject, body, the lot.\nOr drag the .eml file straight in.'}
          className="w-full resize-y rounded-xl px-3 py-2.5 text-sm leading-relaxed"
          style={{
            border: '1px solid var(--b-line)',
            background: '#fff',
            color: 'var(--b-ink)',
            outline: 'none',
          }}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void parse(text)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--b-teal-deep)', opacity: busy ? 0.6 : 1 }}
          >
            <Mail size={13} /> {busy ? 'Reading…' : 'Read this email'}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full px-4 py-2 text-xs font-semibold transition hover:bg-black/5"
            style={{ border: '1px solid var(--b-teal-line)', color: 'var(--b-teal-deep)' }}
          >
            Drop / choose .eml file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".eml,.txt,message/rfc822,text/plain"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {busy && (
        <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)', color: 'var(--b-muted)' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--b-teal)' }} />
          Reading the email — extracting provider, amount and due date…
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
              <span className="text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>Extracted from email — review before it’s added</span>
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
            <FileText size={12} /> Saved to your bill log. Nothing is paid or actioned.
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
