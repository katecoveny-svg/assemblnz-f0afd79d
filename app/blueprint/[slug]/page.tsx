import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readBlueprint } from '@/lib/build-an-agent/blueprint-store';

/**
 * /blueprint/[slug] — a kept Business Blueprint, rendered in the business's
 * own colours.
 *
 * The page is deliberately not indexed: it describes someone else's business,
 * and it exists to be sent to a person, not found by strangers.
 */

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const kept = await readBlueprint(slug);
  if (!kept) return { title: 'Blueprint — assembl', robots: { index: false, follow: false } };
  const name = kept.domain.replace(/^www\./, '');
  return {
    title: `${name} — Business Blueprint`,
    description: kept.brief.business,
    robots: { index: false, follow: false },
  };
}

export default async function BlueprintPage({ params }: Params) {
  const { slug } = await params;
  const kept = await readBlueprint(slug);
  if (!kept) notFound();

  const { brief, domain } = kept;
  const accent = brief.brand?.primary ?? '#B8964F';
  const second = brief.brand?.secondary ?? null;
  const ink = '#1A1918';
  const name = domain.replace(/^www\./, '');
  const total = brief.questions.length;
  const answered = typeof brief.answered === 'number' ? brief.answered : null;
  const kept_until = new Date(kept.expiresAt).toLocaleDateString('en-NZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const label: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.16em',
    textTransform: 'uppercase', color: accent, marginBottom: 12,
  };
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16, padding: '26px 28px',
    border: '1px solid rgba(26,25,24,0.08)', boxShadow: '0 14px 40px rgba(26,25,24,0.05)',
  };

  return (
    <main style={{ background: '#FDFBF7', color: ink, minHeight: '100vh', fontFamily: "'Lato', sans-serif" }}>
      {/* Their colour, full bleed — the first thing anyone sees is their own brand. */}
      <header style={{ background: accent, padding: '54px 24px 46px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
            Business Blueprint · assembl
          </div>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 300, color: '#fff', margin: '18px 0 0', letterSpacing: '-0.015em' }}>
            {name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 17, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 620 }}>
            {brief.business}
          </p>
        </div>
      </header>
      {second ? <div style={{ background: second, height: 5 }} /> : null}

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '44px 24px 80px' }}>
        {answered !== null && total > 0 ? (
          <section style={{ ...card, marginBottom: 26, borderLeft: `4px solid ${accent}` }}>
            <div style={label}>what your website answers</div>
            <p style={{ fontSize: 'clamp(20px,3vw,27px)', fontWeight: 300, margin: 0, lineHeight: 1.35 }}>
              This site answers <strong style={{ color: accent, fontWeight: 400 }}>{answered} of the {total}</strong>{' '}
              questions its customers are most likely to ask.
            </p>
            <p style={{ fontSize: 13.5, color: '#6E6B64', margin: '14px 0 0', lineHeight: 1.6 }}>
              A count of real questions, not a score — there is no league table behind this number.
            </p>
          </section>
        ) : null}

        {brief.sells.length ? (
          <section style={{ ...card, marginBottom: 26 }}>
            <div style={label}>what they offer</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {brief.sells.map((s) => (
                <span key={s} style={{ padding: '7px 14px', borderRadius: 30, fontSize: 14, background: `${accent}14`, border: `1px solid ${accent}44` }}>{s}</span>
              ))}
            </div>
          </section>
        ) : null}

        {brief.facts.length ? (
          <section style={{ ...card, marginBottom: 26 }}>
            <div style={label}>facts an agent must not invent around</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {brief.facts.map((f) => (
                <li key={f} style={{ fontSize: 15, lineHeight: 1.65, color: '#3D3A35', marginBottom: 7 }}>{f}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {brief.voice ? (
          <section style={{ ...card, marginBottom: 26 }}>
            <div style={label}>how they already write</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: 0, color: '#3D3A35' }}>{brief.voice}</p>
          </section>
        ) : null}

        {brief.blindSpots.length ? (
          <section style={{ ...card, marginBottom: 26, background: '#080D1A' }}>
            <div style={{ ...label, color: '#D4A843' }}>what this website doesn&rsquo;t answer</div>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 20px' }}>
              Every one of these is a question a customer already has.
            </p>
            {brief.blindSpots.map((b, i) => (
              <div key={b} style={{ display: 'flex', gap: 14, padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#D4A843', paddingTop: 3 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ color: '#fff', fontSize: 15.5, lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </section>
        ) : null}

        {brief.brand ? (
          <section style={{ ...card, marginBottom: 26 }}>
            <div style={label}>their colours, counted off their own stylesheets</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[brief.brand.primary, brief.brand.secondary, brief.brand.accent].filter(Boolean).map((hex) => (
                <div key={hex as string} style={{ textAlign: 'center' }}>
                  <div style={{ width: 76, height: 46, borderRadius: 10, background: hex as string, border: '1px solid rgba(26,25,24,0.12)' }} />
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: '#6E6B64', marginTop: 6 }}>{hex}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ textAlign: 'center', padding: '38px 0 0' }}>
          <a
            href="/"
            style={{
              display: 'inline-block', background: '#1A1918', color: '#FDFBF7', textDecoration: 'none',
              padding: '15px 30px', borderRadius: 40, fontSize: 15,
            }}
          >
            Assemble one for your business →
          </a>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A867E', marginTop: 26, lineHeight: 1.9 }}>
            Read from one public page on {new Date(kept.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}.
            <br />Kept until {kept_until}, then deleted. Nothing here is a claim about the business — only a reading of its own website.
            <br />assembl NZ Limited · assembl@assembl.co.nz
          </p>
        </section>
      </div>
    </main>
  );
}
