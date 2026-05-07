'use client';

import { useRef, useState } from 'react';
import {
  REF_MAX_BYTES,
  REF_VALID_TYPES,
} from '@/lib/vessel-studio/keteOptions';
import type { ReferenceImage } from '@/lib/vessel-studio/types';

interface ReferenceUploadProps {
  reference: ReferenceImage | null;
  strength: number;
  onLoad: (ref: ReferenceImage) => void;
  onClear: () => void;
  onStrengthChange: (n: number) => void;
  onError: (msg: string) => void;
}

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('could not read file'));
    r.readAsDataURL(file);
  });
}

export function ReferenceUpload({
  reference,
  strength,
  onLoad,
  onClear,
  onStrengthChange,
  onError,
}: ReferenceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (!REF_VALID_TYPES.includes(file.type)) {
      onError(`unsupported image type: ${file.type || 'unknown'}. use jpeg, png, or webp.`);
      return;
    }
    if (file.size > REF_MAX_BYTES) {
      onError(
        `reference image too large (${humanBytes(file.size)}). max 8 MB — try compressing it.`
      );
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      onLoad({
        dataUrl,
        filename: file.name || 'reference',
        sizeBytes: file.size,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      onError(`could not read file: ${msg}`);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        role="button"
        tabIndex={0}
        aria-label={reference ? 'reference image loaded' : 'upload reference image'}
        onClick={() => {
          if (!reference) fileInputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !reference) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          const f = e.dataTransfer?.files?.[0];
          if (f) void handleFile(f);
        }}
        className={[
          'rounded-[2px] transition-colors',
          reference
            ? 'flex flex-col gap-2.5 border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 p-3 cursor-default'
            : [
                'relative flex h-60 cursor-pointer items-center justify-center overflow-hidden border border-dashed bg-[color:var(--assembl-cloud)] text-center',
                dragging
                  ? 'border-[color:var(--assembl-gold-thread)] bg-[#E0D6BD]'
                  : 'border-[color:var(--assembl-gold-thread)] hover:bg-[#DDD8CF]',
              ].join(' '),
        ].join(' ')}
      >
        {reference ? (
          <>
            <img
              src={reference.dataUrl}
              alt={reference.filename}
              className="block max-h-60 max-w-[240px] rounded-[2px] border border-[color:var(--assembl-cloud)]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--text-secondary)]">
                <span className="break-all text-[color:var(--text-secondary)]">
                  {reference.filename}
                </span>
                <span>{humanBytes(reference.sizeBytes)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="bg-transparent p-0 font-mono text-[10.5px] lowercase tracking-[0.16em] text-[color:var(--text-primary)] hover:underline"
              >
                remove
              </button>
            </div>
          </>
        ) : (
          <span className="px-4 font-mono text-xs italic font-light tracking-[0.04em] text-[color:var(--text-secondary)]">
            drag an image here, or click to upload
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = '';
        }}
      />

      <p className="font-mono text-[10px] tracking-[0.04em] text-[color:var(--text-secondary)]">
        kept in this browser. up to ~5 MB before storage may complain — reduce file size if so.
      </p>

      {reference && (
        <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 p-3.5">
          <div className="mb-2 font-mono text-[10.5px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            anchor to reference:{' '}
            <span className="text-[color:var(--text-primary)]">
              {strength.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={strength}
            onChange={(e) => onStrengthChange(parseFloat(e.target.value))}
            aria-label="image prompt strength"
            className="h-[2px] w-full cursor-pointer appearance-none rounded-[2px] bg-[color:var(--assembl-cloud)] outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[color:var(--assembl-paper)] [&::-moz-range-thumb]:bg-[color:var(--text-primary)] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[color:var(--assembl-paper)] [&::-webkit-slider-thumb]:bg-[color:var(--text-primary)]"
          />
          <div className="mt-2 flex justify-between font-mono text-[9.5px] tracking-[0.14em] text-[color:var(--text-secondary)]">
            <span>loose</span>
            <span>← anchor →</span>
            <span>tight</span>
          </div>
        </div>
      )}
    </div>
  );
}
