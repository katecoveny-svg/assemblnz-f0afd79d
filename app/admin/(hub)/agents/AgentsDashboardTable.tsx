'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DashboardRow, DerivedStatus } from '@/lib/admin/agents-dashboard';

/**
 * The single-pane agent table — filterable, sortable, sticky-headed; collapses
 * to an accordion card list under 760px. Styling follows the admin UI kit
 * (components/admin/ui.tsx): Cormorant lowercase names, Lato body, Space Mono
 * labels, champagne gold #BFA37A. Presentation only — every fact arrives
 * precomputed from lib/admin/agents-dashboard.ts.
 */

const C = {
  gold: '#BFA37A',
  goldDeep: '#8A6B4E',
  pale: '#FFF1C2',
  ink: '#3A3832',
  body: '#56544B',
  muted: '#8A8678',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  ok: '#3A7D6E',
  warn: '#C98A1B',
  bad: '#B5533A',
  dark: '#4A4840',
} as const;

const DISPLAY = 'var(--font-display), "Cormorant Garamond", Georgia, serif';
const BODY = 'var(--font-body), Lato, system-ui, sans-serif';
const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';

const STATUS_META: Record<DerivedStatus, { dot: string; label: string; fg: string; bg: string }> = {
  live: { dot: '🟢', label: 'Live', fg: C.ok, bg: 'rgba(58,125,110,.12)' },
  chat_only: { dot: '🟡', label: 'Chat wired, no citations', fg: C.warn, bg: 'rgba(201,138,27,.14)' },
  stub: { dot: '🔴', label: 'Stub / static', fg: C.bad, bg: 'rgba(181,83,58,.12)' },
  not_started: { dot: '⚫', label: 'Not started', fg: C.body, bg: C.cream },
};

const PROMPT_LABELS: Record<DashboardRow['promptSource'], string> = {
  code: 'Code (locked)',
  code_staged: 'Code · staged edit',
  missing: 'Missing',
};

type SortKey = 'name' | 'bundle' | 'status' | 'synced';
const STATUS_RANK: Record<DerivedStatus, number> = { live: 0, chat_only: 1, stub: 2, not_started: 3 };

function nzDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function AgentsDashboardTable({ rows }: { rows: DashboardRow[] }) {
  const bundles = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) if (r.bundle) seen.set(r.bundle, r.bundleName);
    return [...seen.entries()].map(([slug, name]) => ({ slug, name }));
  }, [rows]);

  const [q, setQ] = useState('');
  const [bundleSel, setBundleSel] = useState<Set<string>>(new Set());
  const [statusSel, setStatusSel] = useState<Set<DerivedStatus>>(new Set());
  const [missingPrompt, setMissingPrompt] = useState(false);
  const [missingKnowledge, setMissingKnowledge] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (needle && !(`${r.name} ${r.teReo} ${r.slug}`.toLowerCase().includes(needle))) return false;
      if (bundleSel.size && !(r.bundle && bundleSel.has(r.bundle))) return false;
      if (statusSel.size && !statusSel.has(r.status)) return false;
      if (missingPrompt && r.promptSource !== 'missing') return false;
      if (missingKnowledge && r.knowledgeSources.length > 0) return false;
      return true;
    });
    const cmp = (a: DashboardRow, b: DashboardRow): number => {
      switch (sortKey) {
        case 'bundle':
          return a.bundleName.localeCompare(b.bundleName) || a.name.localeCompare(b.name);
        case 'status':
          return STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.name.localeCompare(b.name);
        case 'synced':
          return (b.lastSyncedAt ?? '').localeCompare(a.lastSyncedAt ?? '') || a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    };
    return list.sort((a, b) => cmp(a, b) * sortDir);
  }, [rows, q, bundleSel, statusSel, missingPrompt, missingKnowledge, sortKey, sortDir]);

  function toggle<T>(set: Set<T>, v: T, update: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    update(next);
  }

  function header(label: string, key?: SortKey) {
    const active = key && sortKey === key;
    return (
      <th
        key={label}
        onClick={
          key
            ? () => {
                if (sortKey === key) setSortDir(sortDir === 1 ? -1 : 1);
                else {
                  setSortKey(key);
                  setSortDir(1);
                }
              }
            : undefined
        }
        style={{
          textAlign: 'left',
          padding: '12px 14px',
          borderBottom: `1px solid ${C.hairline}`,
          fontFamily: MONO,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: active ? C.goldDeep : C.muted,
          whiteSpace: 'nowrap',
          cursor: key ? 'pointer' : 'default',
          userSelect: 'none',
          position: 'sticky',
          top: 0,
          background: C.paper,
          zIndex: 2,
        }}
      >
        {label}
        {active ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
      </th>
    );
  }

  const chip = (active: boolean) =>
    ({
      fontFamily: MONO,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      color: active ? C.ink : C.body,
      background: active ? C.gold : C.paper,
      border: `1.5px solid ${active ? C.gold : C.hairline}`,
      borderRadius: 999,
      padding: '6px 12px',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
    });

  const tdBase = {
    padding: '12px 14px',
    borderBottom: `1px solid ${C.hairline}`,
    color: C.ink,
    verticalAlign: 'top' as const,
    fontFamily: BODY,
    fontSize: 13.5,
  };

  function statusPill(s: DerivedStatus) {
    const m = STATUS_META[s];
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: m.bg,
          color: m.fg,
          fontFamily: MONO,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 999,
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden>{m.dot}</span>
        {m.label}
      </span>
    );
  }

  function nameCell(r: DashboardRow) {
    const inner = (
      <>
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 20,
            lineHeight: 1.1,
            color: C.ink,
            textTransform: 'lowercase',
          }}
        >
          {r.name}
        </span>
        {r.teReo && (
          <span style={{ fontFamily: BODY, fontSize: 12, color: C.muted, marginLeft: 8 }}>{r.teReo}</span>
        )}
        {r.isBundleLead && (
          <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.goldDeep, marginLeft: 8, letterSpacing: '0.08em' }}>
            LEAD
          </span>
        )}
        <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>{r.slug}</div>
      </>
    );
    if (r.status === 'not_started') return <div>{inner}</div>;
    return (
      <Link href={`/admin/agents/${r.slug}`} style={{ textDecoration: 'none' }}>
        {inner}
      </Link>
    );
  }

  function knowledgeCell(r: DashboardRow) {
    if (!r.knowledgeSources.length) return <span style={{ color: C.muted }}>—</span>;
    return (
      <span style={{ color: C.body, fontSize: 12.5 }}>
        {r.knowledgeSources.map((s, i) => (
          <span key={s.slug}>
            {i > 0 && ' · '}
            {s.name.replace(/\s*\(.*\)$/, '')}
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.goldDeep }}> {s.tier}</span>
          </span>
        ))}
      </span>
    );
  }

  function surfacesCell(r: DashboardRow) {
    if (!r.surfaces.length) return <span style={{ color: C.muted }}>—</span>;
    return (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
        {r.surfaces.map((s) => (
          <a
            key={s.href + s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              color: C.goldDeep,
              background: C.cream,
              border: `1px solid ${C.hairline}`,
              borderRadius: 999,
              padding: '3px 9px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </a>
        ))}
      </span>
    );
  }

  return (
    <div>
      {/* filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search by name, te reo or slug…"
          style={{
            fontFamily: BODY,
            fontSize: 14,
            color: C.ink,
            background: C.paper,
            border: `1px solid ${C.hairline}`,
            borderRadius: 999,
            padding: '8px 16px',
            minWidth: 220,
            outline: 'none',
          }}
        />
        {bundles.map((b) => (
          <button key={b.slug} type="button" onClick={() => toggle(bundleSel, b.slug, setBundleSel)} style={chip(bundleSel.has(b.slug))}>
            {b.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 18 }}>
        {(Object.keys(STATUS_META) as DerivedStatus[]).map((s) => (
          <button key={s} type="button" onClick={() => toggle(statusSel, s, setStatusSel)} style={chip(statusSel.has(s))}>
            {STATUS_META[s].dot} {STATUS_META[s].label}
          </button>
        ))}
        <button type="button" onClick={() => setMissingPrompt(!missingPrompt)} style={chip(missingPrompt)}>
          missing prompt
        </button>
        <button type="button" onClick={() => setMissingKnowledge(!missingKnowledge)} style={chip(missingKnowledge)}>
          missing knowledge source
        </button>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
          {filtered.length} / {rows.length} agents
        </span>
      </div>

      {/* desktop table */}
      <div
        className="aad-table"
        style={{
          overflow: 'auto',
          maxHeight: '72vh',
          background: C.paper,
          border: `1px solid ${C.hairline}`,
          borderRadius: 16,
          boxShadow: '0 16px 40px rgba(180,150,40,.06)',
        }}
      >
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: 1080 }}>
          <thead>
            <tr>
              {header('Agent', 'name')}
              {header('Bundle', 'bundle')}
              {header('Status', 'status')}
              {header('Prompt source')}
              {header('Knowledge sources')}
              {header('Live surfaces')}
              {header('Last synced', 'synced')}
              {header('Test')}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.slug}>
                <td style={tdBase}>{nameCell(r)}</td>
                <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
                  {r.bundleName}
                  {r.kaumatuaHold && (
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.goldDeep, marginTop: 2 }}>
                      KAUMĀTUA-HOLD
                    </div>
                  )}
                </td>
                <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>{statusPill(r.status)}</td>
                <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: r.promptSource === 'missing' ? C.bad : C.body }}>
                    {PROMPT_LABELS[r.promptSource]}
                  </span>
                  {r.inSqlCorpus && (
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.muted }}>+ SQL corpus</div>
                  )}
                </td>
                <td style={{ ...tdBase, maxWidth: 260 }}>{knowledgeCell(r)}</td>
                <td style={{ ...tdBase, maxWidth: 300 }}>{surfacesCell(r)}</td>
                <td style={{ ...tdBase, fontFamily: MONO, fontSize: 11.5, whiteSpace: 'nowrap', color: r.lastSyncedAt ? C.body : C.muted }}>
                  {nzDateTime(r.lastSyncedAt)}
                </td>
                <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
                  {r.status === 'not_started' ? (
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>—</span>
                  ) : (
                    <Link
                      href={`/admin/agents/${r.slug}`}
                      style={{
                        fontFamily: BODY,
                        fontWeight: 700,
                        fontSize: 12.5,
                        color: C.ink,
                        background: C.gold,
                        borderRadius: 999,
                        padding: '6px 14px',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Test
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td style={{ ...tdBase, textAlign: 'center', color: C.muted }} colSpan={8}>
                  no agents match those filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="aad-cards" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
        {filtered.map((r) => {
          const isOpen = open === r.slug;
          return (
            <div
              key={r.slug}
              style={{
                background: C.paper,
                border: `1px solid ${C.hairline}`,
                borderRadius: 14,
                boxShadow: '0 10px 24px rgba(180,150,40,.05)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, color: C.ink, textTransform: 'lowercase' }}>
                    {r.name}
                  </span>
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: C.muted }}>
                    {r.bundleName} · {r.slug}
                  </span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {statusPill(r.status)}
                  <span style={{ fontFamily: MONO, color: C.muted, fontSize: 12 }}>{isOpen ? '−' : '+'}</span>
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 16px 16px', fontFamily: BODY, fontSize: 13, color: C.body }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: '0.1em' }}>PROMPT </span>
                    {PROMPT_LABELS[r.promptSource]}
                    {r.inSqlCorpus ? ' · + SQL corpus' : ''}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: '0.1em' }}>KNOWLEDGE </span>
                    {knowledgeCell(r)}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: '0.1em' }}>SYNCED </span>
                    <span style={{ fontFamily: MONO, fontSize: 11.5 }}>{nzDateTime(r.lastSyncedAt)}</span>
                  </div>
                  <div style={{ marginBottom: 12 }}>{surfacesCell(r)}</div>
                  {r.status !== 'not_started' && (
                    <Link
                      href={`/admin/agents/${r.slug}`}
                      style={{
                        fontFamily: BODY,
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.ink,
                        background: C.gold,
                        borderRadius: 999,
                        padding: '8px 18px',
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      Open + test
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .aad-table { display: none; }
          .aad-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
