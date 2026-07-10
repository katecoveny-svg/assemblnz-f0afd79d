import type { Metadata } from 'next';
import Link from 'next/link';
import { getBrandFonts } from '@/lib/brand/fonts';
import {
  getLiveGenomeFacts,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { EnquiryForm } from './EnquiryForm';

// The whole page is genome-read: a fact edited in Supabase renders here on
// the very next request. That IS the demo.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'auckland dog trainer · learn to talk dog — a living site, built by assembl',
  description:
    'Fred’s public website, generated from his Business Genome — services, pricing, FAQs and proof all read live from one source of truth. Part of the assembl living-site demo.',
  // A fictional sample business — keep it out of real dog-training searches.
  robots: { index: false, follow: true },
};

const NAVY = '#1B2A4A';
const PINK = '#D4A5B0';
const PINK_DEEP = '#B87A8A';
const BLUSH = '#F7EEF1';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';
const GOLD = '#C4A574';

const display = 'var(--font-brand-display), Georgia, serif';
const mono = 'var(--font-brand-mono), ui-monospace, monospace';

const eyebrow: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: PINK_DEEP,
  fontFamily: mono,
};

const card: React.CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${NAVY}14`,
  background: CREAM,
  boxShadow: '0 10px 28px rgba(27,42,74,0.06)',
};

const inner: React.CSSProperties = {
  maxWidth: 1040,
  margin: '0 auto',
  padding: '0 clamp(16px, 4vw, 32px)',
};

/** Quiet provenance chip — the demo's whole point, worn lightly. */
function GenomeTag({ factId }: { factId: string }) {
  return (
    <span
      style={{
        fontSize: 9.5,
        letterSpacing: '0.08em',
        fontFamily: mono,
        color: `${NAVY}66`,
        whiteSpace: 'nowrap',
      }}
    >
      genome · {factId}
    </span>
  );
}

/** '$299 + GST · assessment + success plan' → { price, detail }. */
function splitService(value: string): { price: string; detail: string | null } {
  const [price, ...rest] = value.split(' · ');
  return { price, detail: rest.length ? rest.join(' · ') : null };
}

/** '“Q?” → answer' → { q, a } (falls back to the raw value as the answer). */
function splitFaq(value: string): { q: string; a: string } {
  const i = value.indexOf('→');
  if (i < 0) return { q: value, a: '' };
  return {
    q: value.slice(0, i).trim().replace(/^[“"]|[”"]$/g, ''),
    a: value.slice(i + 1).trim(),
  };
}

/** '23 approved · latest: Tank “quote”' → { count, quote }. */
function splitTestimonial(value: string): { count: string | null; quote: string } {
  const i = value.toLowerCase().indexOf('latest:');
  if (i < 0) return { count: null, quote: value };
  return {
    count: value.slice(0, i).replace(/·\s*$/, '').trim() || null,
    quote: value.slice(i + 'latest:'.length).trim(),
  };
}

export default async function FredLandingPage() {
  const { facts, live } = await getLiveGenomeFacts();
  const fonts = getBrandFonts('auckland-dog-trainer');
  const brandVars = `${fonts.display.variable} ${fonts.body.variable} ${fonts.mono.variable}`;

  const byId = new Map(facts.map((f) => [f.id, f]));
  const fact = (id: string): GenomeFact | undefined => byId.get(id);

  const [businessName, tagline] = (
    fact('g-name')?.value ?? 'Auckland Dog Trainer · Learn To Talk Dog'
  ).split(' · ');
  const area = fact('g-area')?.value;
  const team = fact('g-team')?.value;

  // This page IS the genome's "website" surface — programmes and FAQs render
  // whatever the database holds, including facts added there after ship.
  const services = facts.filter((f) => f.section === 'services');
  const faqs = facts.filter(
    (f) => f.section === 'knowledge' && f.readBy.includes('website'),
  );
  const testimonial = fact('g-testimonials')
    ? splitTestimonial(fact('g-testimonials')!.value)
    : null;

  return (
    <div
      className={brandVars}
      style={{
        background: BLUSH,
        color: NAVY,
        fontFamily: 'var(--font-brand-body), system-ui, sans-serif',
        minHeight: '100vh',
      }}
    >
      {/* ── demo strip — honest about what this is ─────────────────────── */}
      <div style={{ background: NAVY, color: '#fff' }}>
        <div
          style={{
            ...inner,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px clamp(16px, 4vw, 32px)',
          }}
        >
          <p style={{ margin: 0, fontSize: 11.5, letterSpacing: '0.04em' }}>
            sample business · this page is generated from Fred&apos;s Business Genome
            {live ? ' — reading live from the database' : ' — sample data'}
          </p>
          <Link
            href="/living-site"
            style={{ color: PINK, fontSize: 11.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            see how it works →
          </Link>
        </div>
      </div>

      {/* ── header ─────────────────────────────────────────────────────── */}
      <header style={{ ...inner, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'baseline', justifyContent: 'space-between', padding: '26px clamp(16px, 4vw, 32px) 0' }}>
        <p style={{ margin: 0, fontFamily: display, fontSize: 22 }}>
          {businessName}
          <span aria-hidden style={{ color: PINK_DEEP }}>
            .
          </span>
        </p>
        <a
          href="#enquire"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '9px 16px',
            borderRadius: 999,
            background: NAVY,
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          book an assessment
        </a>
      </header>

      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section style={{ ...inner, padding: 'clamp(36px, 7vw, 72px) clamp(16px, 4vw, 32px) clamp(28px, 5vw, 48px)' }}>
        <p style={eyebrow}>{tagline ?? 'learn to talk dog'}</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: display, fontSize: 'clamp(32px, 6vw, 54px)', lineHeight: 1.08, maxWidth: 640, fontWeight: 500 }}>
          Your dog isn&apos;t being difficult. They&apos;re talking — let&apos;s learn the language.
        </h1>
        <p style={{ margin: '16px 0 0', fontSize: 16, color: MUTED, lineHeight: 1.6, maxWidth: 520 }}>
          Calm, method-first training for reactive dogs, unreliable recalls and brand-new chaos
          machines{area ? ` — ${area.toLowerCase()}` : ''}.
        </p>
        {area ? (
          <p style={{ margin: '18px 0 0', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999, background: `${NAVY}0C` }}>
              {area}
            </span>
            <GenomeTag factId="g-area" />
          </p>
        ) : null}
      </section>

      {/* ── programmes — straight from the genome ──────────────────────── */}
      <section style={{ background: CREAM, borderTop: `1px solid ${NAVY}10`, borderBottom: `1px solid ${NAVY}10` }}>
        <div style={{ ...inner, padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 32px)' }}>
          <p style={eyebrow}>programmes &amp; pricing</p>
          <h2 style={{ margin: '10px 0 0', fontFamily: display, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 500 }}>
            One path per problem — no upsells, no mystery.
          </h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {services.map((s) => {
              const { price, detail } = splitService(s.value);
              const launching = !price.startsWith('$');
              return (
                <article key={s.id} style={{ ...card, padding: 18, background: launching ? BLUSH : CREAM, borderColor: launching ? `${PINK}88` : `${NAVY}14`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, fontWeight: 500 }}>{s.label}</h3>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: launching ? PINK_DEEP : NAVY }}>
                    {launching ? s.value : price}
                  </p>
                  {!launching && detail ? (
                    <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{detail}</p>
                  ) : null}
                  <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                    <GenomeTag factId={s.id} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── faq + proof ────────────────────────────────────────────────── */}
      <section style={{ ...inner, padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 32px)', display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div>
          <p style={eyebrow}>owners ask</p>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            {faqs.map((f) => {
              const { q, a } = splitFaq(f.value);
              return (
                <div key={f.id} style={{ ...card, padding: 16 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5 }}>{q}</p>
                  {a ? (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{a}</p>
                  ) : null}
                  <div style={{ marginTop: 8 }}>
                    <GenomeTag factId={f.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p style={eyebrow}>results</p>
          {testimonial ? (
            <figure style={{ ...card, margin: '14px 0 0', padding: 20, background: `linear-gradient(180deg, ${CREAM}, ${BLUSH})` }}>
              <blockquote style={{ margin: 0, fontFamily: display, fontSize: 20, lineHeight: 1.4 }}>
                {testimonial.quote}
              </blockquote>
              {testimonial.count ? (
                <figcaption style={{ margin: '12px 0 0', fontSize: 12.5, color: GOLD, fontWeight: 700 }}>
                  {testimonial.count} testimonials
                </figcaption>
              ) : null}
              <div style={{ marginTop: 10 }}>
                <GenomeTag factId="g-testimonials" />
              </div>
            </figure>
          ) : null}
          {team ? (
            <div style={{ ...card, marginTop: 12, padding: 16 }}>
              <p style={{ ...eyebrow, color: MUTED }}>who you&apos;ll meet</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55 }}>{team}</p>
              <div style={{ marginTop: 8 }}>
                <GenomeTag factId="g-team" />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── enquiry ────────────────────────────────────────────────────── */}
      <section id="enquire" style={{ background: CREAM, borderTop: `1px solid ${NAVY}10` }}>
        <div style={{ ...inner, padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 32px)', maxWidth: 760 }}>
          <p style={eyebrow}>start here</p>
          <h2 style={{ margin: '10px 0 0', fontFamily: display, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 500 }}>
            Tell Fred about your dog.
          </h2>
          <p style={{ margin: '10px 0 22px', fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
            Every enquiry gets a personal recommendation — which programme fits, what it costs,
            and what the first session looks like.
          </p>
          <EnquiryForm />
        </div>
      </section>

      {/* ── footer — the reveal ────────────────────────────────────────── */}
      <footer style={{ background: NAVY, color: '#fff' }}>
        <div style={{ ...inner, padding: '28px clamp(16px, 4vw, 32px)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontFamily: display, fontSize: 18 }}>
              {businessName}
              <span aria-hidden style={{ color: PINK }}>
                .
              </span>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, maxWidth: 460 }}>
              Every price, FAQ and quote on this page is read{' '}
              {live ? 'live from the database' : 'from sample data'} — one source of truth, no
              page builder. Edit the genome and this site rewrites itself.
            </p>
          </div>
          <Link
            href="/living-site"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '11px 18px',
              borderRadius: 999,
              background: PINK,
              color: NAVY,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            this is a living site →
          </Link>
        </div>
      </footer>
    </div>
  );
}
