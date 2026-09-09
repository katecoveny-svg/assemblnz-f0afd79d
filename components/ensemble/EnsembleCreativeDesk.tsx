'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ENSEMBLE_MAKERS, ENSEMBLE_PACKAGE_STAGES } from '@/lib/ensemble/demo-package';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

/**
 * Polished public shell of CreativeWorkspace DNA —
 * maker picker + brief → staged package. Scripted DEMO only.
 * Live console: /customers/creative-agency/ops
 */
export function EnsembleCreativeDesk() {
  const [active, setActive] = useState(ENSEMBLE_MAKERS[0].slug);
  const [brief, setBrief] = useState(
    'Winter single-origin launch for a Wellington café — warm, claim-safe, ready for approval.',
  );
  const [staged, setStaged] = useState(false);

  const maker = useMemo(
    () => ENSEMBLE_MAKERS.find((m) => m.slug === active) ?? ENSEMBLE_MAKERS[0],
    [active],
  );

  const packageLine = useMemo(() => {
    if (!staged) return null;
    if (maker.slug === 'auaha') {
      return ENSEMBLE_PACKAGE_STAGES.map((s) => `${s.agent}: staged`).join(' · ');
    }
    const hit = ENSEMBLE_PACKAGE_STAGES.find(
      (s) => s.agent.toLowerCase() === maker.name.toLowerCase(),
    );
    return hit
      ? `${hit.label} — ${hit.body}`
      : `${maker.name} draft staged for approval.`;
  }, [maker, staged]);

  return (
    <div className="ens-desk" id="ensemble-desk">
      <div className="ens-makers" role="listbox" aria-label="Creative makers">
        {ENSEMBLE_MAKERS.map((m) => (
          <button
            key={m.slug}
            type="button"
            role="option"
            aria-selected={m.slug === active}
            className={`ens-maker${m.slug === active ? ' is-active' : ''}`}
            onClick={() => {
              setActive(m.slug);
              setStaged(false);
            }}
          >
            <strong>{m.name}</strong>
            <span className="ens-mono">{m.role}</span>
            <p>{m.blurb}</p>
          </button>
        ))}
      </div>

      <div className="ens-console">
        <div className="ens-console-head">
          <div>
            <strong>{maker.name}</strong>
            <span className="ens-mono" style={{ display: 'block', marginTop: 4, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ens-muted)' }}>
              scripted · draft-only · DEMO
            </span>
          </div>
          <span className="ens-mono" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ens-rose)' }}>
            {ENSEMBLE_PREVIEW.demoBadge}
          </span>
        </div>

        <div className="ens-console-body">
          <label className="ens-mono">
            Brief
            <textarea
              value={brief}
              onChange={(e) => {
                setBrief(e.target.value);
                setStaged(false);
              }}
              aria-label="Creative brief"
            />
          </label>
          <div className="ens-console-actions">
            <button type="button" onClick={() => setStaged(true)}>
              Assemble package
            </button>
            <Link href="/customers/creative-agency/ops">{ENSEMBLE_PREVIEW.workspaceCta}</Link>
          </div>
        </div>

        <div className="ens-receipt">
          <p>
            {staged && packageLine
              ? packageLine
              : 'No draft yet — give the desk a brief and assemble a DEMO package.'}
          </p>
          <span className="ens-mono">
            {staged
              ? ENSEMBLE_PREVIEW.approvalLabel
              : ENSEMBLE_PREVIEW.evidenceLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
