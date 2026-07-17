'use client';

import * as React from 'react';
import {
  GENOME_SECTION_LABELS,
  type GenomeFact,
  type GenomeSection,
} from '@/lib/customers/auckland-dog-trainer/genome';
import { addAssemblFactAction, updateAssemblFactAction } from './actions';

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const GOLD = '#b8964f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const SECTION_ORDER = Object.keys(GENOME_SECTION_LABELS) as GenomeSection[];
const SURFACE_CHOICES = ['website', 'email', 'crm', 'booking', 'proposals', 'voice', 'support', 'faq', 'social'] as const;

/** Inline editor over assembl's live genome — save a fact, every reader follows. */
export function GenomeEditor({ facts, live }: { facts: GenomeFact[]; live: boolean }) {
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState('');

  const [adding, setAdding] = React.useState(false);
  const [newSection, setNewSection] = React.useState<GenomeSection>('services');
  const [newLabel, setNewLabel] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [newSurfaces, setNewSurfaces] = React.useState<string[]>(['website']);

  const startEdit = (fact: GenomeFact) => {
    setEditing(fact.id);
    setDraft(fact.value);
    setNote('');
  };

  const save = async (factId: string) => {
    if (busy) return;
    setBusy(true);
    const result = await updateAssemblFactAction(factId, draft);
    setBusy(false);
    if (!result.ok) {
      setNote(result.message ?? 'Could not save that just now.');
      return;
    }
    setEditing(null);
    setNote('');
  };

  const addFact = async () => {
    if (busy) return;
    setBusy(true);
    const result = await addAssemblFactAction({
      section: newSection,
      label: newLabel,
      value: newValue,
      readBy: newSurfaces,
    });
    setBusy(false);
    if (!result.ok) {
      setNote(result.message ?? 'Could not save that just now.');
      return;
    }
    setAdding(false);
    setNewLabel('');
    setNewValue('');
    setNewSurfaces(['website']);
    setNote('');
  };

  const toggleSurface = (s: string) =>
    setNewSurfaces((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const input: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 10,
    border: `1px solid ${HAIRLINE}`,
    background: '#fff',
    color: INK,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <div style={{ display: 'grid', gap: 26 }}>
      {!live && (
        <p
          style={{
            margin: 0,
            padding: '10px 14px',
            borderRadius: 12,
            border: `1px solid ${HAIRLINE}`,
            background: '#fbfaf6',
            color: MUTED,
            fontSize: 13,
          }}
        >
          Reading the static mirror — the database is unreachable right now, so edits are off.
        </p>
      )}
      {note && (
        <p style={{ margin: 0, color: '#8a4b3c', fontSize: 13 }} aria-live="polite">
          {note}
        </p>
      )}

      {SECTION_ORDER.map((section) => {
        const sectionFacts = facts.filter((f) => f.section === section);
        if (sectionFacts.length === 0) return null;
        return (
          <section key={section}>
            <h2
              style={{
                margin: 0,
                color: MUTED,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {GENOME_SECTION_LABELS[section]}
            </h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              {sectionFacts.map((fact) => (
                <article
                  key={fact.id}
                  style={{
                    display: 'grid',
                    gap: 8,
                    padding: '14px 16px',
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 14,
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <p style={{ margin: 0, color: TEAL, fontSize: 13, fontWeight: 700 }}>{fact.label}</p>
                    {fact.verification && fact.verification !== 'confirmed' && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: `1px solid ${HAIRLINE}`,
                          color: GOLD,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {fact.verification}
                      </span>
                    )}
                    {live && editing !== fact.id && (
                      <button
                        type="button"
                        onClick={() => startEdit(fact)}
                        style={{
                          marginLeft: 'auto',
                          border: 'none',
                          background: 'transparent',
                          color: TEAL,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editing === fact.id ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={2}
                        maxLength={300}
                        style={{ ...input, resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => save(fact.id)}
                          disabled={busy}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 999,
                            border: 'none',
                            background: INK,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: busy ? 'default' : 'pointer',
                            opacity: busy ? 0.7 : 1,
                          }}
                        >
                          {busy ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 999,
                            border: `1px solid ${HAIRLINE}`,
                            background: '#fff',
                            color: MUTED,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: INK, fontSize: 14, lineHeight: 1.55 }}>{fact.value}</p>
                  )}

                  {fact.readBy.length > 0 && (
                    <p style={{ margin: 0, color: MUTED, fontSize: 11 }}>read by {fact.readBy.join(' · ')}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {live && (
        <section
          style={{
            padding: '16px 18px',
            border: `1px dashed ${HAIRLINE}`,
            borderRadius: 14,
            background: '#fbfaf6',
          }}
        >
          {adding ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'minmax(160px, 220px) 1fr' }}>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as GenomeSection)}
                  style={input}
                  aria-label="Section"
                >
                  {SECTION_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {GENOME_SECTION_LABELS[s]}
                    </option>
                  ))}
                </select>
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label — e.g. Response time"
                  maxLength={60}
                  style={input}
                />
              </div>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="The fact, in one plain sentence"
                rows={2}
                maxLength={300}
                style={{ ...input, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SURFACE_CHOICES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSurface(s)}
                    aria-pressed={newSurfaces.includes(s)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: `1px solid ${newSurfaces.includes(s) ? TEAL : HAIRLINE}`,
                      background: newSurfaces.includes(s) ? 'rgba(63,115,115,0.1)' : '#fff',
                      color: newSurfaces.includes(s) ? '#2e5a58' : MUTED,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={addFact}
                  disabled={busy}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 999,
                    border: 'none',
                    background: INK,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: busy ? 'default' : 'pointer',
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {busy ? 'Saving…' : 'Add the fact'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 999,
                    border: `1px solid ${HAIRLINE}`,
                    background: '#fff',
                    color: MUTED,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setNote('');
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: TEAL,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Add a fact
            </button>
          )}
        </section>
      )}
    </div>
  );
}
