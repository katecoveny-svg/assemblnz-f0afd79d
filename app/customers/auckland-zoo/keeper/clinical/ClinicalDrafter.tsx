'use client';

import { useState } from 'react';
import {
  ALL_ANIMALS,
  CLINICAL_NOTES,
  getSpecies,
  type ClinicalNote,
} from '@/lib/customers/auckland-zoo/data';
import { Card, DemoTag, Eyebrow } from '../_components/ui';

type NoteType = 'routine' | 'procedure' | 'incident';

const NOTE_TYPES: { value: NoteType; label: string; hint: string }[] = [
  { value: 'routine', label: 'Routine health check', hint: 'Preventative / scheduled' },
  { value: 'procedure', label: 'Procedure', hint: 'Surgery, sedation, transfer' },
  { value: 'incident', label: 'Incident', hint: 'Injury, acute presentation' },
];

export function ClinicalDrafter() {
  const [animalId, setAnimalId] = useState(ALL_ANIMALS[0]?.id ?? '');
  const [noteType, setNoteType] = useState<NoteType>('incident');
  const [drafted, setDrafted] = useState<ClinicalNote | 'empty' | null>(null);

  const animal = ALL_ANIMALS.find((a) => a.id === animalId);
  const species = animal ? getSpecies(animal.species) : undefined;

  function draft() {
    const match = CLINICAL_NOTES.find((n) => n.animalId === animalId && n.noteType === noteType);
    setDrafted(match ?? 'empty');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Controls */}
      <Card className="h-max lg:sticky lg:top-32">
        <Eyebrow>Draft a note</Eyebrow>

        <label className="mt-4 block text-[12px] font-medium" style={{ color: 'var(--tenant-muted)' }}>
          Animal
        </label>
        <select
          value={animalId}
          onChange={(e) => {
            setAnimalId(e.target.value);
            setDrafted(null);
          }}
          className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-[14px] outline-none"
          style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-cream)', color: 'var(--tenant-ink)' }}
        >
          {ALL_ANIMALS.map((a) => {
            const sp = getSpecies(a.species);
            return (
              <option key={a.id} value={a.id}>
                {a.name} — {sp?.name}
              </option>
            );
          })}
        </select>

        <p className="mt-4 block text-[12px] font-medium" style={{ color: 'var(--tenant-muted)' }}>
          Note type
        </p>
        <div className="mt-1.5 space-y-2">
          {NOTE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setNoteType(t.value);
                setDrafted(null);
              }}
              className="flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors"
              style={
                noteType === t.value
                  ? { borderColor: 'var(--tenant-primary)', background: 'var(--tenant-primary-soft)' }
                  : { borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }
              }
            >
              <span
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-[3px]"
                style={{
                  borderColor: noteType === t.value ? 'var(--tenant-primary)' : 'var(--tenant-line)',
                  background: noteType === t.value ? 'var(--tenant-primary)' : 'transparent',
                }}
              />
              <span>
                <span className="block text-[13.5px] font-medium" style={{ color: 'var(--tenant-ink)' }}>
                  {t.label}
                </span>
                <span className="block text-[12px]" style={{ color: 'var(--tenant-muted)' }}>
                  {t.hint}
                </span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={draft}
          className="mt-5 w-full rounded-xl px-4 py-3 text-[14.5px] font-medium text-white"
          style={{ background: 'var(--tenant-primary)' }}
        >
          Keeper — draft the note
        </button>
        <p className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--tenant-muted)' }}>
          Keeper routes to the Zoo Vet specialist and drafts an unsigned SOAP note. A registered NZCCM
          veterinarian reviews and signs. assembl never examines an animal.
        </p>
      </Card>

      {/* Output */}
      <div>
        {drafted === null ? (
          <Card>
            <p className="text-[14px]" style={{ color: 'var(--tenant-muted)' }}>
              Choose an animal and note type, then draft. The Zambezi (rhino) incident scenario is a fully
              worked example from the Kaitiaki spec.
            </p>
          </Card>
        ) : drafted === 'empty' ? (
          <Card>
            <div className="flex items-center justify-between">
              <Eyebrow>Draft — {animal?.name}</Eyebrow>
              <DemoTag>no fabricated clinical data</DemoTag>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
              In a live pilot, Keeper would draft a {noteType} SOAP note here for {animal?.name}
              {species ? ` (${species.name})` : ''}, with species-specific drug dosing cross-checked against
              VetMed NZ and the AZWMP proceedings — as an unsigned draft for the NZCCM vet to review and sign.
            </p>
            <p className="mt-3 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: 'var(--tenant-cream)', color: 'var(--tenant-muted)' }}>
              This demo workspace only ships the worked Zambezi incident scenario. We never fabricate clinical
              detail — try <strong>Zambezi · Incident</strong> to see a complete drafted note.
            </p>
          </Card>
        ) : (
          <SoapNote note={drafted} />
        )}
      </div>
    </div>
  );
}

function SoapNote({ note }: { note: ClinicalNote }) {
  const rows: [string, string][] = [
    ['S', note.soap.s],
    ['O', note.soap.o],
    ['A', note.soap.a],
    ['P', note.soap.p],
  ];
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>NZCCM clinical note — unsigned draft</Eyebrow>
        <DemoTag>{note.provenance}</DemoTag>
      </div>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-[22px]" style={{ color: 'var(--tenant-ink)' }}>
        {note.animalLabel}
      </h2>
      <p className="text-[12.5px]" style={{ color: 'var(--tenant-muted)' }}>
        {note.date} · Author (draft): Keeper — Zoo Vet specialist
      </p>

      <div
        className="mt-3 rounded-lg border-l-4 px-3 py-2 text-[12.5px] leading-relaxed"
        style={{ borderColor: 'var(--tenant-accent)', background: 'rgba(181,115,46,0.07)', color: 'var(--tenant-ink)' }}
      >
        For review &amp; signature: <strong>{note.reviewer}</strong>
      </div>

      <dl className="mt-4 space-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-display)] text-[15px] font-semibold"
              style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}
            >
              {k}
            </dt>
            <dd className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>

      {/* Mana Receipt stamps */}
      <div className="mt-5 rounded-xl p-4" style={{ background: 'var(--tenant-cream)' }}>
        <p className="font-mono text-[12px] uppercase tracking-[0.16em]" style={{ color: 'var(--tenant-primary-deep)' }}>
          Mana Receipt · Kaitiaki stamps
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
          {note.stamps.disclaimer}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <StampField label="Sources cited">
            <ul className="space-y-0.5">
              {note.stamps.sources.map((src) => (
                <li key={src.label}>
                  {src.label} — <span className="font-mono">Tier {src.tier}</span>, retrieved {src.retrieved}
                </li>
              ))}
            </ul>
          </StampField>
          <StampField label="Gates">
            <p>Tikanga gate: {note.stamps.tikangaGate === 'pass' ? 'pass' : 'held'}</p>
            <p>Trust tier: {note.stamps.trustTier}</p>
            <p>Kaitiaki reviewer: {note.stamps.kaitiakiReviewer}</p>
          </StampField>
        </div>
      </div>
    </Card>
  );
}

function StampField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[12px] uppercase tracking-[0.14em]" style={{ color: 'var(--tenant-muted)' }}>
        {label}
      </p>
      <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--tenant-ink)' }}>
        {children}
      </div>
    </div>
  );
}
