import Link from 'next/link';
import { SampleEnquiryForm } from '@/components/living-site/SampleEnquiryForm';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { Reveal } from '@/components/site/Reveal';
import art from '@/components/living-site/sample.module.css';
import { getBrandFonts } from '@/lib/brand/fonts';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { SAMPLE_VERTICALS, type SampleVertical } from '@/lib/living-site/verticals';

function factsIn(facts: GenomeFact[], section: GenomeFact['section']): GenomeFact[] {
  return facts.filter((f) => f.section === section);
}
function fact(facts: GenomeFact[], id: string): GenomeFact | undefined {
  return facts.find((f) => f.id === id);
}

/** Split "$2,200 + GST · 6 weeks" into price + detail for the service cards. */
function splitValue(value: string): { lead: string; rest: string | null } {
  const idx = value.indexOf('·');
  if (idx < 0) return { lead: value, rest: null };
  return { lead: value.slice(0, idx).trim(), rest: value.slice(idx + 1).trim() };
}

/**
 * A Living Site, rendered from a Business Genome — shared by the fictional
 * sample verticals (/living-site/[vertical]) and by visitor-generated
 * installs (/living-site/install/[id]), which pass `install` so the demo
 * strip and footer say what this actually is.
 */
export function SampleSite({
  v,
  facts,
  live,
  install,
}: {
  v: SampleVertical;
  facts: GenomeFact[];
  live: boolean;
  /** Present when this is a visitor-generated install, not a sample. */
  install?: { id: string };
}) {
  const fonts = getBrandFonts(v.fontSlug);
  const brandVars = `${fonts.display.variable} ${fonts.body.variable} ${fonts.mono.variable}`;
  const p = v.palette;

  const display = 'var(--font-brand-display), Georgia, serif';
  const bodyFont = 'var(--font-brand-body), system-ui, sans-serif';

  const card: React.CSSProperties = {
    background: p.card,
    border: `1px solid ${p.ink}14`,
    borderRadius: 18,
    padding: 22,
    boxShadow: `0 14px 36px ${p.ink}12`,
  };

  const eyebrow: React.CSSProperties = {
    fontSize: 10.5,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: p.accent,
    fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
  };

  const services = factsIn(facts, 'services');
  const knowledge = factsIn(facts, 'knowledge');
  const area = fact(facts, 'g-area')?.value;
  const team = fact(facts, 'g-team')?.value;
  const testimonials = fact(facts, 'g-testimonials')?.value;
  const bookingRules = fact(facts, 'g-booking-rules')?.value;
  const [wordmark] = (fact(facts, 'g-name')?.value ?? v.businessName).split(' · ');
  const osHref = install ? `/living-site/install/${install.id}/os` : `/living-site/${v.slug}/os`;

  return (
    <div className={brandVars} style={{ background: p.bg, color: p.ink, fontFamily: bodyFont, minHeight: '100vh' }}>
      {/* ── demo strip — what this page actually is ──────────────────── */}
      <div style={{ background: p.ink, color: '#fff' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px clamp(18px, 5vw, 56px)',
          }}
        >
          <p style={{ margin: 0, fontSize: 11.5, letterSpacing: '0.04em' }}>
            {install
              ? 'your living site — generated from your ten answers'
              : 'sample business — details fictional · generated from a Business Genome'}
            {live ? ', reading live from the database' : ''}
          </p>
          <span style={{ display: 'flex', gap: 16, whiteSpace: 'nowrap' }}>
            <Link
              href={osHref}
              style={{ color: '#fff', fontSize: 11.5, fontWeight: 700, textDecoration: 'underline' }}
            >
              the OS behind this site →
            </Link>
            <Link
              href="/living-site"
              style={{ color: '#fff', fontSize: 11.5, fontWeight: 700, textDecoration: 'underline' }}
            >
              how it works →
            </Link>
          </span>
        </div>
      </div>

      {/* ── header ─────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px clamp(18px, 5vw, 56px)',
          borderBottom: `1px solid ${p.ink}12`,
          background: p.card,
        }}
      >
        <div>
          <p style={{ margin: 0, fontFamily: display, fontSize: 18, lineHeight: 1.1 }}>{wordmark}</p>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: p.muted }}>
            {v.tagline}
          </p>
        </div>
        <a
          href="#book"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '10px 18px',
            borderRadius: 999,
            background: p.ink,
            color: '#fff',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          get in touch
        </a>
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(18px, 5vw, 56px) 64px' }}>
        {/* ── hero — copy + generative art in the business's palette ──── */}
        <section className={art.heroGrid}>
          <div>
            {area ? <p style={eyebrow}>{area.toLowerCase()}</p> : null}
            <h1 style={{ margin: '14px 0 0', fontFamily: display, fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.08 }}>
              {v.heroHeadline}
            </h1>
            <p style={{ margin: '16px 0 0', fontSize: 16, lineHeight: 1.6, color: p.muted, maxWidth: 540 }}>
              {v.heroLede}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              <a
                href="#book"
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '12px 22px',
                  borderRadius: 999,
                  background: p.ink,
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                get in touch
              </a>
              <a
                href="#services"
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '12px 22px',
                  borderRadius: 999,
                  border: `1.5px solid ${p.ink}33`,
                  color: p.ink,
                  textDecoration: 'none',
                  background: p.card,
                }}
              >
                services &amp; pricing
              </a>
            </div>
          </div>
          <div
            aria-hidden
            className={art.heroArt}
            style={{
              background: `radial-gradient(130% 130% at 32% 22%, #ffffff 0%, ${p.card} 40%, ${p.bg} 62%, ${p.accent}66 92%, ${p.accent}99 100%)`,
              boxShadow: `0 30px 70px ${p.ink}22, inset 0 1px 0 rgba(255,255,255,0.9)`,
              border: `1px solid ${p.ink}10`,
            }}
          >
            <span className={art.heroArtRing} style={{ width: '68%', aspectRatio: '1', left: '-18%', top: '-22%', borderColor: `${p.accent}33` }} />
            <span className={art.heroArtRing} style={{ width: '46%', aspectRatio: '1', right: '-12%', bottom: '-16%', borderColor: `${p.accent}2b` }} />
            <span className={art.heroArtGlint} />
            <span className={art.heroArtLetter} style={{ color: p.accent }}>
              {v.businessName.charAt(0)}
            </span>
          </div>
        </section>

        {/* ── about ──────────────────────────────────────────────────── */}
        {team || bookingRules ? (
          <Reveal><section style={{ ...card, display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div>
              <p style={eyebrow}>about {v.owner.toLowerCase()}</p>
              <p style={{ margin: '10px 0 0', fontFamily: display, fontSize: 24, lineHeight: 1.3 }}>
                {fact(facts, 'g-voice')?.value ?? v.tagline}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              {team ? (
                <p style={{ margin: 0, fontSize: 13.5 }}>
                  <strong>The team ·</strong> {team}
                </p>
              ) : null}
              {bookingRules ? (
                <p style={{ margin: 0, fontSize: 13.5 }}>
                  <strong>How it runs ·</strong> {bookingRules}
                </p>
              ) : null}
            </div>
          </section></Reveal>
        ) : null}

        {/* ── services & pricing — straight from the genome ─────────── */}
        <section id="services" style={{ paddingTop: 44 }}>
          <p style={eyebrow}>services &amp; pricing</p>
          <h2 style={{ margin: '10px 0 18px', fontFamily: display, fontSize: 30 }}>
            What we do, plainly priced
          </h2>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {services.map((s) => {
              const { lead, rest } = splitValue(s.value);
              return (
                <article key={s.id} className={art.card} style={card}>
                  <h3 style={{ margin: 0, fontFamily: display, fontSize: 20 }}>{s.label}</h3>
                  <p style={{ margin: '10px 0 0', fontSize: 15, fontWeight: 700, color: p.accent }}>{lead}</p>
                  {rest ? (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: p.muted, lineHeight: 1.5 }}>{rest}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        {/* ── faqs & policies ────────────────────────────────────────── */}
        {knowledge.length > 0 ? (
          <section style={{ paddingTop: 44 }}>
            <p style={eyebrow}>good to know</p>
            <h2 style={{ margin: '10px 0 18px', fontFamily: display, fontSize: 30 }}>
              Straight answers
            </h2>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {knowledge.map((k) => (
                <article key={k.id} className={art.card} style={{ ...card, borderLeft: `3px solid ${p.accent}` }}>
                  <p style={{ ...eyebrow, color: p.muted }}>{k.label.toLowerCase()}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.55 }}>{k.value}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── testimonials ───────────────────────────────────────────── */}
        {testimonials ? (
          <section style={{ paddingTop: 44 }}>
            <p style={eyebrow}>results</p>
            <h2 style={{ margin: '10px 0 18px', fontFamily: display, fontSize: 30 }}>
              What clients say
            </h2>
            <div style={{ ...card, background: p.ink, color: '#fff' }}>
              <p style={{ margin: 0, fontFamily: display, fontSize: 22, lineHeight: 1.45, maxWidth: 640 }}>
                {testimonials}
              </p>
            </div>
          </section>
        ) : null}

        {/* ── book ───────────────────────────────────────────────────── */}
        <section id="book" style={{ paddingTop: 44 }}>
          <p style={eyebrow}>start here</p>
          <h2 style={{ margin: '10px 0 6px', fontFamily: display, fontSize: 30 }}>
            {v.enquiry.heading}
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: p.muted, maxWidth: 560, lineHeight: 1.55 }}>
            {v.enquiry.lede}
          </p>
          <div style={card}>
            <SampleEnquiryForm
              tenant={install ? `install-${install.id}` : v.tenant}
              owner={v.owner}
              palette={p}
              detailLabel={v.enquiry.detailLabel}
              detailPlaceholder={v.enquiry.detailPlaceholder}
              messagePlaceholder={v.enquiry.messagePlaceholder}
            />
          </div>
        </section>

        {/* ── the resident agent — voice & chat, installed ───────────── */}
        {v.chat ? (
          <section style={{ paddingTop: 44 }}>
            <p style={eyebrow}>ask us anything · voice &amp; chat agent</p>
            <h2 style={{ margin: '10px 0 6px', fontFamily: display, fontSize: 30 }}>
              The site answers for itself
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: p.muted, maxWidth: 560, lineHeight: 1.55 }}>
              This agent reads the same genome as the rest of the page — services, prices,
              policies. Ask a question, or tap the mic and just say it.
            </p>
            <div style={card}>
              <PilotAgentChat
                apiPath={v.chat.apiPath}
                agentName={v.chat.agentName}
                greeting={v.chat.greeting}
                tryMe={v.chat.tryMe}
                accent={p.accent}
                draftNote={v.chat.draftNote}
              />
            </div>
          </section>
        ) : null}
      </main>

      {/* ── footer — the living site attribution ─────────────────────── */}
      <footer style={{ borderTop: `1px solid ${p.ink}12`, background: p.card, padding: '26px clamp(18px, 5vw, 56px)' }}>
        <p style={{ margin: 0, fontSize: 12.5, color: p.muted, lineHeight: 1.6, maxWidth: 720 }}>
          {install ? (
            <>
              {v.businessName} was generated by the{' '}
              <Link href="/install" style={{ color: p.accent, fontWeight: 700 }}>
                assembl installer
              </Link>{' '}
              from ten answers — a real Business Genome the page reads on every load
              {live ? ' (live from the database)' : ''}. Demo install: unlisted, and cleared
              periodically. For the real thing,{' '}
              <a href="mailto:assembl@assembl.co.nz" style={{ color: p.accent, fontWeight: 700 }}>
                assembl@assembl.co.nz
              </a>
              .
            </>
          ) : (
            <>
              {v.businessName} is a fictional sample {v.industryLabel} business — a{' '}
              <Link href="/living-site" style={{ color: p.accent, fontWeight: 700 }}>
                Living Site
              </Link>{' '}
              by assembl. Every fact on this page reads from its Business Genome
              {live ? ' (live from the database)' : ''} — change it once and the website, agents,
              and emails all update. More samples:{' '}
              {SAMPLE_VERTICALS.filter((o) => o.slug !== v.slug)
                .slice(0, 3)
                .map((o, i) => (
                  <span key={o.slug}>
                    {i > 0 ? ' · ' : ''}
                    <Link href={`/living-site/${o.slug}`} style={{ color: p.accent }}>
                      {o.industryLabel}
                    </Link>
                  </span>
                ))}
              .
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
