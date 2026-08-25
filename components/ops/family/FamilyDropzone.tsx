'use client';

import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { uploadFamilyFileAction } from '@/app/customers/family/ops/actions';
import { InkUpload } from '@/app/customers/family/ops/visuals/ink';

/**
 * FamilyDropzone — drag-and-drop or tap to upload a receipt, a fridge/pantry
 * photo, a product snap or a school newsletter (photo/PDF). The file goes to
 * the private per-tenant bucket and is read by the vision agent; what it finds
 * lands as proposed items with a Trust A/B/C score for Kate to review.
 *
 * Draft-only. Files are RLS-locked to the whānau and auto-deleted after 30 days.
 * Video: capped at ~30s/720p — we grab a still and read that (a whole video
 * can't be decoded server-side).
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const SAGE = '#7A8B6F';

type Kind = 'receipt' | 'fridge' | 'product' | 'newsletter' | 'video';

function Submitting({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? 'scanning…' : children}</>;
}

export function FamilyDropzone({
  kinds, defaultKind, accept = 'image/*,application/pdf', from = 'Kate', hint,
}: {
  kinds: Array<{ key: Kind; label: string }>;
  defaultKind: Kind;
  accept?: string;
  from?: string;
  hint?: string;
}) {
  const [kind, setKind] = useState<Kind>(defaultKind);
  const [over, setOver] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function submitFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setName(files[0].name);
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={uploadFamilyFileAction}
      style={{ borderRadius: 12, border: `1px solid ${GOLD}33`, background: 'linear-gradient(180deg,#ffffff,#fbfcfb)', padding: 12 }}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="from" value={from} />

      {kinds.length > 1 ? (
        <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
          {kinds.map((k) => (
            <button key={k.key} type="button" onClick={() => setKind(k.key)} style={{
              fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '3px 9px', cursor: 'pointer',
              border: `1px solid ${kind === k.key ? SAGE : GOLD}55`, color: kind === k.key ? '#fff' : INK,
              background: kind === k.key ? SAGE : 'transparent',
            }}>{k.label}</button>
          ))}
        </div>
      ) : null}

      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); submitFiles(e.dataTransfer.files); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          border: `1.5px dashed ${over ? SAGE : GOLD}77`, borderRadius: 10, padding: '12px 14px',
          background: over ? `${SAGE}0d` : 'transparent',
        }}>
        <InkUpload size={22} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>
            <Submitting>{name ? `${name} — tap to replace` : 'Drag a photo/PDF here, or tap to choose'}</Submitting>
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{hint ?? 'Read on-device by the vision agent · draft-only · auto-deleted after 30 days'}</div>
        </div>
        <input ref={inputRef} type="file" name="file" accept={accept} capture="environment"
          onChange={(e) => submitFiles(e.target.files)} style={{ display: 'none' }} />
      </label>
    </form>
  );
}

/** Trust badge for a scanned upload's confidence. */
export function TrustBadge({ trust }: { trust: 'A' | 'B' | 'C' | null }) {
  if (!trust) return null;
  const tone = trust === 'A' ? SAGE : trust === 'B' ? GOLD : '#C4342B';
  const label = trust === 'A' ? 'clear read' : trust === 'B' ? 'check it' : 'unclear';
  return (
    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: tone, border: `1px solid ${tone}66`, borderRadius: 999, padding: '2px 7px' }}>
      Trust {trust} · {label}
    </span>
  );
}
