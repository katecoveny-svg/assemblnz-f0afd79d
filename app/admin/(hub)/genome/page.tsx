import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getGenomeFactsFor,
  getRecentEnquiries,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import { ASSEMBL_TENANT, ASSEMBL_GENOME_FACTS } from '@/lib/customers/assembl/genome';
import { GenomeEditor } from './GenomeEditor';

// Kate's operator view over assembl's OWN genome (behind ensureAdmin via the
// hub layout). Review read: unverified facts show so they can be confirmed.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Genome · assembl admin',
  robots: { index: false },
};

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export default async function AdminGenomePage() {
  const [{ facts, live }, enquiries] = await Promise.all([
    getGenomeFactsFor(ASSEMBL_TENANT, ASSEMBL_GENOME_FACTS, { includeUnverified: true }),
    getRecentEnquiries(8, ASSEMBL_TENANT),
  ]);
  // Brand grounding lines (no readBy) live in code, not the DB — the editor
  // shows only the operational facts the surfaces read.
  const editable = facts.filter((f) => f.readBy.length > 0);

  return (
    <div style={{ margin: '0 auto', maxWidth: 980, padding: '36px 20px 90px', color: INK }}>
      <header style={{ paddingBottom: 22, borderBottom: `1px solid ${HAIRLINE}` }}>
        <p style={{ margin: 0, color: '#8b7447', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          assembl · Business Genome
        </p>
        <h1
          style={{
            margin: '10px 0 0',
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(30px, 4.5vw, 44px)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
          }}
        >
          Your genome
        </h1>
        <p style={{ margin: '12px 0 0', maxWidth: 560, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
          Edit a fact once and every reader follows — the public site, the Ad Studio and the
          operating loop all ground on these rows.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 999,
              border: `1px solid ${HAIRLINE}`,
              color: TEAL,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: live ? TEAL : '#b8964f' }} />
            {live ? 'live from the database' : 'static mirror'}
          </span>
          <Link href="/genome" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>
            Public view →
          </Link>
        </div>
      </header>

      <div style={{ marginTop: 26 }}>
        <GenomeEditor facts={editable} live={live} />
      </div>

      <section style={{ marginTop: 40 }}>
        <h2
          style={{
            margin: 0,
            color: MUTED,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Recent enquiries
        </h2>
        {enquiries.length === 0 ? (
          <p style={{ margin: '10px 0 0', color: MUTED, fontSize: 13 }}>
            None yet — enquiries sent to assembl land here with a drafted reply in Approvals.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {enquiries.map((e) => (
              <article
                key={e.id}
                style={{
                  display: 'grid',
                  gap: 4,
                  padding: '12px 16px',
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 12,
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 14 }}>{e.name}</strong>
                  <span style={{ color: MUTED, fontSize: 12 }}>{e.email}</span>
                  <span style={{ marginLeft: 'auto', color: MUTED, fontSize: 12 }}>{e.when}</span>
                </div>
                <p style={{ margin: 0, color: INK, fontSize: 13, lineHeight: 1.5 }}>{e.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
