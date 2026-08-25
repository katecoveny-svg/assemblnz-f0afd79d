import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';
import { MANA_RECEIPTS, type ManaReceipt } from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

/**
 * Mana Receipts — the tamper-evident audit trail for compliance-critical
 * actions (Food Act 2014, Sale & Supply of Alcohol Act 2012, Holidays Act /
 * Employment Relations Act). Every receipt names the action, who did it, when,
 * the statutory basis, and a hash so a health inspector, the DLC, or a labour
 * inspector can trust the record wasn't edited after the fact.
 *
 * Demo hashes only — no live signing in the concept build.
 */
export function ManaReceiptRow({ r }: { r: ManaReceipt }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 14,
        padding: '14px 0',
        borderBottom: `1px solid ${B.line}`,
        alignItems: 'start',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: B.ocean,
          color: B.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l7 3v6c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V5l7-3z" stroke={B.canary} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke={B.canary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--lula-body), system-ui, sans-serif', fontSize: 14.5, fontWeight: 600, color: B.ink }}>
          {r.action}
        </div>
        <div style={{ fontSize: 12.5, color: B.inkSoft, marginTop: 2 }}>
          {r.actor} · {r.ts}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 7 }}>
          <span
            style={{
              fontFamily: 'var(--lula-mono), monospace',
              fontSize: 12,
              letterSpacing: '0.06em',
              color: B.brassDark,
              textTransform: 'uppercase',
            }}
          >
            {r.basis.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--lula-mono), monospace',
              fontSize: 12,
              color: B.inkSoft,
              background: B.sand,
              border: `1px solid ${B.line}`,
              padding: '2px 7px',
              borderRadius: 6,
            }}
          >
            sha256 {r.sha}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Full Mana Receipts panel — used on /today and the compliance modules. */
export function ManaReceiptsPanel({
  receipts = MANA_RECEIPTS,
  limit,
}: {
  receipts?: ManaReceipt[];
  limit?: number;
}) {
  const rows = limit ? receipts.slice(0, limit) : receipts;
  return (
    <div
      style={{
        background: B.cream,
        borderRadius: 18,
        border: `1px solid ${B.line}`,
        padding: 22,
        boxShadow: '0 8px 26px rgba(14,77,74,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--lula-display), Georgia, serif', fontWeight: 600, fontSize: 22, color: B.ocean, margin: 0 }}>
          Mana Receipts
        </h2>
        <span style={{ fontFamily: 'var(--lula-mono), monospace', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: B.inkSoft }}>
          tamper-evident audit trail
        </span>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: B.inkSoft, margin: '0 0 8px', maxWidth: 640 }}>
        A signed record for each compliance-critical action — ready for a health
        inspector, the District Licensing Committee, or a labour inspector to
        trust without taking your word for it.
      </p>
      <div>
        {rows.map((r) => (
          <ManaReceiptRow key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
