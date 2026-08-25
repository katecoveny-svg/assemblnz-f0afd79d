'use client';

import { useState } from 'react';
import { SPECIES, educationForSpecies, getSpecies } from '@/lib/customers/auckland-zoo/data';
import { Card, DemoTag, Eyebrow, KaumatuaHold, SpeciesSilhouette, TaongaBadge } from '../_components/ui';

type Format = 'card' | 'activity' | 'social';

const FORMATS: { value: Format; label: string }[] = [
  { value: 'card', label: 'Meet-the-animal card' },
  { value: 'activity', label: 'Kids activity sheet' },
  { value: 'social', label: 'Social post' },
];

export function EducationStudio() {
  const [slug, setSlug] = useState(SPECIES[0]?.slug ?? '');
  const [format, setFormat] = useState<Format>('card');
  const [generated, setGenerated] = useState(false);

  const species = getSpecies(slug);
  const drafts = educationForSpecies(slug);
  const cardDraft = drafts[0];

  return (
    <div>
      {/* Species picker */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SPECIES.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => {
              setSlug(s.slug);
              setGenerated(false);
            }}
            className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] transition-colors"
            style={
              slug === s.slug
                ? { borderColor: 'var(--tenant-primary)', background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }
                : { borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)', color: 'var(--tenant-muted)' }
            }
          >
            <SpeciesSilhouette slug={s.slug} className="h-5 w-5" />
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Controls */}
        <Card className="h-max">
          <Eyebrow>Content format</Eyebrow>
          <div className="mt-3 space-y-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setFormat(f.value);
                  setGenerated(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13.5px] transition-colors"
                style={
                  format === f.value
                    ? { borderColor: 'var(--tenant-primary)', background: 'var(--tenant-primary-soft)', color: 'var(--tenant-ink)' }
                    : { borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)', color: 'var(--tenant-ink)' }
                }
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border-[3px]"
                  style={{
                    borderColor: format === f.value ? 'var(--tenant-primary)' : 'var(--tenant-line)',
                    background: format === f.value ? 'var(--tenant-primary)' : 'transparent',
                  }}
                />
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="mt-5 w-full rounded-xl px-4 py-3 text-[14.5px] font-medium text-white"
            style={{ background: 'var(--tenant-primary)' }}
          >
            Keeper — draft content
          </button>
          <p className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--tenant-muted)' }}>
            Drafted in Auckland Zoo's public /news voice, for the education team to review, edit and publish.
          </p>
        </Card>

        {/* Output */}
        <div>
          {species?.taonga ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <TaongaBadge />
              <span className="text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>
                Whakapapa &amp; naming content is held for iwi consultation on this species.
              </span>
            </div>
          ) : null}

          {!generated ? (
            <Card>
              <p className="text-[14px]" style={{ color: 'var(--tenant-muted)' }}>
                Pick a species and format, then draft. The North Island brown kiwi chick card is a fully worked
                example from the Kaitiaki spec — with whakapapa content held for iwi.
              </p>
            </Card>
          ) : format === 'card' && cardDraft ? (
            <EducationCard draft={cardDraft} speciesName={species?.name ?? ''} />
          ) : (
            <PlaceholderDraft format={format} speciesName={species?.name ?? ''} taonga={species?.taonga ?? false} />
          )}
        </div>
      </div>
    </div>
  );
}

function EducationCard({ draft, speciesName }: { draft: ReturnType<typeof educationForSpecies>[number]; speciesName: string }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>Visitor-education draft — for education team to review &amp; publish</Eyebrow>
        <DemoTag>{draft.provenance}</DemoTag>
      </div>
      <p className="mt-2 text-[12px]" style={{ color: 'var(--tenant-muted)' }}>
        {speciesName} · {draft.moment}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-[26px] leading-tight" style={{ color: 'var(--tenant-ink)' }}>
        {draft.title}
      </h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
        {draft.body.split('\n\n').map((para, i) => (
          <p key={i} className={para.trim().startsWith('[') ? 'italic' : ''} style={para.trim().startsWith('[') ? { color: 'var(--tenant-muted)' } : undefined}>
            {para}
          </p>
        ))}
      </div>

      {draft.kaumatuaHold && draft.holdNote ? (
        <div className="mt-4">
          <KaumatuaHold note={draft.holdNote} />
        </div>
      ) : null}

      <div
        className="mt-4 rounded-lg border-l-4 px-3 py-2 text-[12.5px]"
        style={{ borderColor: 'var(--tenant-primary)', background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}
      >
        For review: <strong>{draft.reviewer}</strong> · Mana Receipt attached
      </div>
    </Card>
  );
}

function PlaceholderDraft({ format, speciesName, taonga }: { format: Format; speciesName: string; taonga: boolean }) {
  const label = format === 'activity' ? 'kids activity sheet' : 'social post';
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Eyebrow>Draft — {speciesName}</Eyebrow>
        <DemoTag>demo scaffold</DemoTag>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
        In a live pilot, Keeper would draft a {label} for {speciesName} in Auckland Zoo's public voice — for the
        education team to review, edit and publish.
      </p>
      {taonga ? (
        <div className="mt-4">
          <KaumatuaHold note="Taonga species. Any whakapapa, naming or cultural framing is held for iwi consultation and rohe-appropriate kaitiaki sign-off — Keeper never generates this content." />
        </div>
      ) : (
        <p className="mt-3 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-muted)' }}>
          This demo only ships the fully worked kiwi-chick card. Try the <strong>North Island brown kiwi</strong> +
          <strong> meet-the-animal card</strong> to see a complete draft with the kaumātua-hold gate.
        </p>
      )}
    </Card>
  );
}
