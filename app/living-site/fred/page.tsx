import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { EnquiryForm } from '@/components/customers/fred-landing/EnquiryForm';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { getBrandFonts } from '@/lib/brand/fonts';
import { getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';
import {
  FRED_AGENT_GREETING,
  FRED_AGENT_NAME,
  FRED_TRY_ME,
} from '@/lib/customers/auckland-dog-trainer/agent';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

// Every fact on this page reads from the Business Genome on each request —
// edit the genome and the website updates. That's the Living Site.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Auckland Dog Trainer — Learn To Talk Dog',
  description:
    'Premium balanced dog training across greater Auckland: private sessions, Reactivity Rewired, Recall Mastery, and Board & Train. Book a consultation — Fred reads every enquiry.',
  robots: { index: false, follow: false },
};

const NAVY = '#1B2A4A';
const PINK = '#D4A5B0';
const PINK_DEEP = '#B87A8A';
const BLUSH = '#F7EEF1';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';
const GOLD = '#C4A574';

const display = "var(--font-brand-display), 'Playfair Display', Georgia, serif";
const body = 'var(--font-brand-body), system-ui, sans-serif';

const card: React.CSSProperties = {
  background: CREAM,
  border: `1px solid ${NAVY}14`,
  borderRadius: 18,
  padding: 22,
  boxShadow: '0 14px 36px rgba(27,42,74,0.07)',
};

const eyebrow: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: PINK_DEEP,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
};

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

export default async function FredLandingPage() {
  const { facts, live } = await getLiveGenomeFacts();
  const fonts = getBrandFonts('auckland-dog-trainer');
  const brandVars = `${fonts.display.variable} ${fonts.body.variable} ${fonts.mono.variable}`;

  const services = factsIn(facts, 'services');
  const knowledge = factsIn(facts, 'knowledge');
  const area = fact(facts, 'g-area')?.value ?? 'Greater Auckland';
  const team = fact(facts, 'g-team')?.value ?? 'Fred (method lead)';
  const testimonials = fact(facts, 'g-testimonials')?.value ?? '';
  const bookingRules = fact(facts, 'g-booking-rules')?.value ?? '';

  return (
    <div className={brandVars} style={{ background: BLUSH, color: NAVY, fontFamily: body, minHeight: '100vh' }}>
      {/* ── header ─────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px clamp(18px, 5vw, 56px)',
          borderBottom: `1px solid ${NAVY}12`,
          background: CREAM,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            src="/brand/auckland-dog-trainer/logo-adt-pink.png"
            alt="ADT — Auckland Dog Trainer"
            width={44}
            height={44}
            style={{ objectFit: 'contain' }}
          />
          <div>
            <p style={{ margin: 0, fontFamily: display, fontSize: 18, lineHeight: 1.1 }}>
              Auckland Dog Trainer
            </p>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED }}>
              learn to talk dog
            </p>
          </div>
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
            background: NAVY,
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Book a consultation
        </a>
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(18px, 5vw, 56px) 64px' }}>
        {/* ── hero ───────────────────────────────────────────────────── */}
        <section
          style={{
            display: 'grid',
            gap: 28,
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            alignItems: 'center',
            padding: '52px 0 40px',
          }}
        >
          <div>
            <p style={eyebrow}>{area.toLowerCase()}</p>
            <h1 style={{ margin: '14px 0 0', fontFamily: display, fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.08 }}>
              Learn to talk dog.
            </h1>
            <p style={{ margin: '16px 0 0', fontSize: 16, lineHeight: 1.6, color: MUTED, maxWidth: 460 }}>
              Clear communication, calm handling, and walks you both enjoy. Fred works with the
              dogs other trainers turn away — reactivity, recall, manners — and coaches you, not
              just your dog.
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
                  background: NAVY,
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Book a consultation
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
                  border: `1.5px solid ${NAVY}33`,
                  color: NAVY,
                  textDecoration: 'none',
                  background: CREAM,
                }}
              >
                Programmes
              </a>
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', minHeight: 320, boxShadow: '0 24px 60px rgba(27,42,74,0.16)' }}>
            <Image
              src="/brand/auckland-dog-trainer/heroes/studio-sit-profile.webp"
              alt="A dog sitting calmly in profile — Learn To Talk Dog"
              fill
              sizes="(max-width: 800px) 100vw, 520px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </section>

        {/* ── about ──────────────────────────────────────────────────── */}
        <section style={{ ...card, display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div>
            <p style={eyebrow}>about fred</p>
            <p style={{ margin: '10px 0 0', fontFamily: display, fontSize: 24, lineHeight: 1.3 }}>
              Communication first. Ego never.
            </p>
            <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.6, color: MUTED }}>
              Fred&apos;s method is built on how dogs actually communicate — body language, play,
              tonality, and pressure/release. No shame, no shouting, no shortcuts. You learn the
              language; your dog learns the standard.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            <p style={{ margin: 0, fontSize: 13.5, color: NAVY }}>
              <strong>The team ·</strong> {team}
            </p>
            <p style={{ margin: 0, fontSize: 13.5, color: NAVY }}>
              <strong>How sessions run ·</strong> {bookingRules}
            </p>
          </div>
        </section>

        {/* ── services & pricing — straight from the genome ─────────── */}
        <section id="services" style={{ paddingTop: 44 }}>
          <p style={eyebrow}>programmes & pricing</p>
          <h2 style={{ margin: '10px 0 18px', fontFamily: display, fontSize: 30 }}>
            Find the right path for your dog
          </h2>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {services.map((s) => {
              const { lead, rest } = splitValue(s.value);
              return (
                <article key={s.id} style={card}>
                  <h3 style={{ margin: 0, fontFamily: display, fontSize: 20 }}>{s.label}</h3>
                  <p style={{ margin: '10px 0 0', fontSize: 15, fontWeight: 700, color: PINK_DEEP }}>{lead}</p>
                  {rest ? (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{rest}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        {/* ── faqs & policies ────────────────────────────────────────── */}
        <section style={{ paddingTop: 44 }}>
          <p style={eyebrow}>good to know</p>
          <h2 style={{ margin: '10px 0 18px', fontFamily: display, fontSize: 30 }}>
            Straight answers
          </h2>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {knowledge.map((k) => (
              <article key={k.id} style={{ ...card, borderLeft: `3px solid ${PINK_DEEP}` }}>
                <p style={{ ...eyebrow, color: MUTED }}>{k.label.toLowerCase()}</p>
                <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.55 }}>{k.value}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── testimonials ───────────────────────────────────────────── */}
        <section style={{ paddingTop: 44 }}>
          <p style={eyebrow}>results</p>
          <h2 style={{ margin: '10px 0 18px', fontFamily: display, fontSize: 30 }}>
            What owners say
          </h2>
          <div style={{ ...card, background: `linear-gradient(135deg, ${NAVY}, #2a3d5c)`, color: '#fff' }}>
            <p style={{ margin: 0, fontFamily: display, fontSize: 22, lineHeight: 1.45, maxWidth: 640 }}>
              “A reliable house dog in 4 weeks.” — Tank&apos;s family
            </p>
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#D8DEE9' }}>{testimonials}</p>
          </div>
        </section>

        {/* ── book ───────────────────────────────────────────────────── */}
        <section id="book" style={{ paddingTop: 44 }}>
          <p style={eyebrow}>book a consultation</p>
          <h2 style={{ margin: '10px 0 6px', fontFamily: display, fontSize: 30 }}>
            Tell Fred about your dog
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: MUTED, maxWidth: 560, lineHeight: 1.55 }}>
            Every enquiry lands in the CRM, gets triaged by the intake agent, and Fred reads it
            personally. Bite history or safety worries? Say so — those go to the top of the pile.
          </p>
          <div style={card}>
            <EnquiryForm />
          </div>
        </section>

        {/* ── the resident agent — voice & chat, installed ───────────── */}
        <section style={{ paddingTop: 44 }}>
          <p style={eyebrow}>ask us anything · voice & chat agent</p>
          <h2 style={{ margin: '10px 0 6px', fontFamily: display, fontSize: 30 }}>
            The site answers for itself
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: MUTED, maxWidth: 560, lineHeight: 1.55 }}>
            This agent reads the same genome as the rest of the page — programmes, prices,
            policies. Ask about your dog and it will point you at the right path.
          </p>
          <div style={card}>
            <PilotAgentChat
              apiPath="/api/customers/auckland-dog-trainer/chat"
              agentName={FRED_AGENT_NAME}
              greeting={FRED_AGENT_GREETING}
              tryMe={FRED_TRY_ME}
              accent={PINK}
              draftNote="Draft-only: the agent never books a session or emails anyone without Fred's yes."
            />
          </div>
        </section>
      </main>

      {/* ── footer — the living site attribution ─────────────────────── */}
      <footer style={{ borderTop: `1px solid ${NAVY}12`, background: CREAM, padding: '26px clamp(18px, 5vw, 56px)' }}>
        <p style={{ margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.6, maxWidth: 720 }}>
          Auckland Dog Trainer · Learn To Talk Dog — a{' '}
          <Link href="/living-site" style={{ color: PINK_DEEP, fontWeight: 700 }}>
            Living Site
          </Link>{' '}
          by assembl. Every fact on this page reads from the Business Genome
          {live ? ' (live from the database)' : ''} — change it once and the website, agents, and
          emails all update. Demo · sample business data
          {live ? '' : ' · offline fallback'}.
          <span aria-hidden style={{ color: GOLD }}> ●</span>
        </p>
      </footer>
    </div>
  );
}
