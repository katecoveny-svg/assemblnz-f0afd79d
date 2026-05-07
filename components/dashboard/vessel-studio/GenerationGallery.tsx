'use client';

import { getKete } from '@/lib/vessel-studio/keteOptions';
import type { VesselGeneration } from '@/lib/vessel-studio/types';

interface GenerationGalleryProps {
  generations: VesselGeneration[];
  onUseSref: (url: string) => void;
  onUseReference: (gen: VesselGeneration, imageUrl: string) => void;
  onExportSizes: (gen: VesselGeneration, imageUrl: string) => void;
  onDelete: (gen: VesselGeneration) => void;
  onSizePrep: () => void;
}

function formatStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-NZ', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

async function downloadFromUrl(url: string, filename: string) {
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = obj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(obj);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

export function GenerationGallery({
  generations,
  onUseSref,
  onUseReference,
  onExportSizes,
  onDelete,
  onSizePrep,
}: GenerationGalleryProps) {
  // Flatten: each row in vessel_generations may carry multiple image_urls.
  const cards: Array<{
    gen: VesselGeneration;
    imageUrl: string;
    cardKey: string;
  }> = [];
  for (const g of generations) {
    g.image_urls.forEach((url, i) => {
      cards.push({ gen: g, imageUrl: url, cardKey: `${g.id}-${i}` });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10.5px] lowercase tracking-[0.2em] text-[color:var(--text-secondary)]">
            results
          </div>
          <h2 className="mt-0.5 font-display text-[28px] font-light text-[color:var(--text-primary)]">
            generations
          </h2>
        </div>
        <div className="font-mono text-[10.5px] text-[color:var(--text-secondary)]">
          <span>{cards.length} saved</span>
          <span className="mx-2 text-[color:var(--text-secondary)]">·</span>
          <button
            type="button"
            onClick={onSizePrep}
            title="open the size-export panel for an image you didn't generate here"
            className="cursor-pointer bg-transparent p-0 font-mono text-[10.5px] lowercase tracking-[0.16em] text-[color:var(--text-secondary)] underline underline-offset-[3px] hover:text-[color:var(--text-primary)]"
          >
            size-prep an image
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {cards.length === 0 ? (
          <div className="rounded-[2px] border border-dashed border-[color:var(--assembl-cloud)] px-4 py-7 text-center font-mono text-[11px] lowercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            no generations yet · choose a kete, hit generate
          </div>
        ) : (
          cards.map(({ gen, imageUrl, cardKey }) => {
            const k = getKete(gen.preset_key);
            const stamp = formatStamp(gen.generated_at);
            return (
              <div
                key={cardKey}
                className="flex flex-col gap-2.5 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3.5"
              >
                <img
                  src={imageUrl}
                  alt={`${k.name} · ${gen.aspect_ratio}`}
                  loading="lazy"
                  className="block h-auto w-full max-w-[480px] rounded-[2px] border border-[color:var(--assembl-cloud)]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2.5 font-mono text-[10.5px] tracking-[0.1em] text-[color:var(--text-secondary)]">
                  <span>
                    {stamp} · {k.name} · {gen.aspect_ratio}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadFromUrl(
                          imageUrl,
                          `assembl-${k.id}-${Date.parse(gen.generated_at) || Date.now()}.jpg`
                        )
                      }
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1.5 font-mono text-[10.5px] lowercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]"
                    >
                      download
                    </button>
                    <button
                      type="button"
                      onClick={() => onUseSref(imageUrl)}
                      title="pipe url into the midjourney --sref field"
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1.5 font-mono text-[10.5px] lowercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]"
                    >
                      use as sref
                    </button>
                    <button
                      type="button"
                      onClick={() => onUseReference(gen, imageUrl)}
                      title="load this image into the fal redux reference field"
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1.5 font-mono text-[10.5px] lowercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]"
                    >
                      use as reference
                    </button>
                    <button
                      type="button"
                      onClick={() => onExportSizes(gen, imageUrl)}
                      title="open the size-export panel for this image"
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1.5 font-mono text-[10.5px] lowercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]"
                    >
                      export sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(gen)}
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1.5 font-mono text-[10.5px] lowercase tracking-[0.14em] text-[color:#B85C38] hover:bg-[#F4E9E4]"
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
