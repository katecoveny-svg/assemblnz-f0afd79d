'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  APPLICANTS,
  COURSE_MODULES,
  DOGS,
  LEADS,
  OFFERS,
  PROGRAMMES,
  REVENUE_SAMPLE,
  SUPPORT_INBOX,
  type OfferSlug,
  type Urgency,
} from '@/lib/customers/auckland-dog-trainer/demo-data';
import {
  FRED_TABS,
  type FredTabKey,
} from '@/lib/customers/auckland-dog-trainer/tabs';
import { SessionNotesEngine } from '@/components/ops/fred/SessionNotesEngine';

export type { FredTabKey };

const NAVY = '#1B2A4A';
const PINK = '#D4A5B0';
const PINK_DEEP = '#B87A8A';
const BLUSH = '#F7EEF1';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';
const GOLD = '#C4A574';

const glass: CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${NAVY}14`,
  background: CREAM,
  boxShadow: '0 10px 28px rgba(27,42,74,0.06)',
};

const eyebrow: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
};

const display = 'var(--font-brand-display), Georgia, serif';

function urgencyTone(u: Urgency): string {
  if (u === 'safety' || u === 'urgent') return '#B54A4A';
  if (u === 'soon') return PINK_DEEP;
  return MUTED;
}

function offerLabel(slug: OfferSlug): string {
  return OFFERS[slug]?.short ?? slug;
}

function TabBar({ active }: { active: FredTabKey }) {
  return (
    <nav aria-label="Fred OS sections" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {FRED_TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/customers/auckland-dog-trainer/ops?tab=${t.key}`}
            scroll={false}
            aria-current={on ? 'page' : undefined}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 14px',
              borderRadius: 999,
              textDecoration: 'none',
              color: on ? '#fff' : NAVY,
              background: on ? NAVY : CREAM,
              border: `1.5px solid ${on ? NAVY : `${NAVY}22`}`,
              boxShadow: on ? '0 6px 16px rgba(27,42,74,0.18)' : 'none',
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 20,
        minHeight: 220,
        padding: '28px 24px 24px',
        background: `linear-gradient(135deg, ${NAVY} 0%, #243656 55%, #3A2A38 100%)`,
        color: '#fff',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 85% 20%, ${PINK}55 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, ${GOLD}33 0%, transparent 45%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 560 }}>
        <p
          style={{
            ...eyebrow,
            color: PINK,
          }}
        >
          auckland dog trainer · learn to talk dog
        </p>
        <h1
          style={{
            margin: '10px 0 0',
            fontFamily: display,
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '0.01em',
          }}
        >
          Fred OS
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55, color: '#D8DEE9', maxWidth: 440 }}>
          Scale Fred&apos;s method without losing Fred&apos;s standards — intake, session notes,
          weekly homework, course content, and trainer onboarding in one operating system.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <Link
            href="/customers/auckland-dog-trainer/ops?tab=notes"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: 999,
              background: PINK,
              color: NAVY,
            }}
          >
            Open notes engine
          </Link>
          <Link
            href="/customers/auckland-dog-trainer/ops?tab=leads"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: 999,
              border: `1.5px solid ${PINK}88`,
              color: '#fff',
            }}
          >
            Triage leads
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatStrip() {
  const items = [
    { k: 'leads', v: String(REVENUE_SAMPLE.leadsThisWeek), s: 'this week' },
    { k: 'bookings', v: String(REVENUE_SAMPLE.bookingsPending), s: 'pending' },
    { k: 'programmes', v: String(REVENUE_SAMPLE.activeProgrammes), s: 'active dogs' },
    { k: 'course', v: String(REVENUE_SAMPLE.courseWaitlist), s: 'waitlist · SAMPLE' },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 10,
      }}
    >
      {items.map((i) => (
        <div key={i.k} style={{ ...glass, padding: '14px 16px', background: BLUSH }}>
          <p style={eyebrow}>{i.k}</p>
          <p style={{ margin: '6px 0 0', fontFamily: display, fontSize: 28, color: NAVY }}>{i.v}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: MUTED }}>{i.s}</p>
        </div>
      ))}
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StatStrip />
      <div style={{ ...glass, padding: 18 }}>
        <p style={eyebrow}>capacity</p>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: NAVY, lineHeight: 1.5 }}>
          {REVENUE_SAMPLE.trainerCapacity}. Repeat clients {REVENUE_SAMPLE.repeatClients} · SAMPLE.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>
          The OS watches enquiries, session notes, homework uploads, and support messages — then
          drafts the next client plan, course lesson, or hiring step for Fred&apos;s yes.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          {
            t: 'Intake + triage',
            b: 'Sort enquiries into private, obedience, recall, reactivity, board & train, or course.',
          },
          {
            t: 'Notes → homework',
            b: 'Two-minute voice note becomes client summary, CRM, follow-up, and trainer handover.',
          },
          {
            t: 'Course + hiring',
            b: 'Turn methods into modules; screen and onboard a second trainer in Fred’s method.',
          },
        ].map((c) => (
          <div key={c.t} style={{ ...glass, padding: 16 }}>
            <p style={{ ...eyebrow, color: PINK_DEEP }}>{c.t}</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: NAVY, lineHeight: 1.5 }}>{c.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>dog intake + triage</p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
          Owners answer age, breed, behaviour, bite history, recall, leash, reactivity, home life,
          goals. assembl recommends the path — Fred confirms.
        </p>
      </div>
      {LEADS.map((lead) => (
        <article key={lead.id} style={{ ...glass, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, color: NAVY }}>
                {lead.dog}
                <span style={{ fontFamily: 'var(--font-brand-body)', fontSize: 13, color: MUTED, marginLeft: 8 }}>
                  {lead.breed} · {lead.age} · {lead.suburb}
                </span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
                {lead.owner} · {lead.source} · {lead.receivedAt}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: `${urgencyTone(lead.urgency)}18`,
                  color: urgencyTone(lead.urgency),
                }}
              >
                {lead.urgency}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: `${PINK}33`,
                  color: NAVY,
                }}
              >
                → {offerLabel(lead.recommended)}
              </span>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: NAVY, lineHeight: 1.5 }}>{lead.triage}</p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: MUTED }}>
            Issues: {lead.issues.join(' · ')}
          </p>
        </article>
      ))}
    </div>
  );
}

function DogsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {DOGS.map((dog) => {
        const pct = Math.round((dog.week / dog.weeksTotal) * 100);
        return (
          <article key={dog.id} style={{ ...glass, padding: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: display, fontSize: 22, color: NAVY }}>{dog.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
                  {dog.breed} · {dog.age} · {dog.owner} · {dog.suburb}
                </p>
              </div>
              <span style={{ ...eyebrow, color: PINK_DEEP }}>
                {OFFERS[dog.programme].label} · week {dog.week}/{dog.weeksTotal}
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                height: 6,
                borderRadius: 999,
                background: `${NAVY}12`,
                overflow: 'hidden',
              }}
            >
              <div style={{ width: `${pct}%`, height: '100%', background: PINK_DEEP, borderRadius: 999 }} />
            </div>
            <div
              style={{
                display: 'grid',
                gap: 10,
                marginTop: 14,
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              }}
            >
              <div>
                <p style={eyebrow}>triggers</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: NAVY }}>{dog.triggers.join(' · ') || '—'}</p>
              </div>
              <div>
                <p style={eyebrow}>goals</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: NAVY }}>{dog.goals.join(' · ')}</p>
              </div>
              <div>
                <p style={eyebrow}>this week</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: NAVY }}>
                  Homework {dog.homeworkDone ? '✓ done' : '○ pending'} · Next: {dog.nextSession}
                </p>
              </div>
            </div>
            {dog.riskNotes.length > 0 ? (
              <p style={{ margin: '12px 0 0', fontSize: 12.5, color: '#B54A4A', lineHeight: 1.45 }}>
                Risk · {dog.riskNotes.join(' · ')}
              </p>
            ) : null}
            <p style={{ margin: '8px 0 0', fontSize: 13, color: MUTED }}>Last win · {dog.lastWin}</p>
          </article>
        );
      })}
    </div>
  );
}

function ProgrammesTab() {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {PROGRAMMES.map((p) => (
        <article key={p.slug} style={{ ...glass, padding: 16 }}>
          <p style={eyebrow}>{p.weeks ? `${p.weeks}-week journey` : 'flexible'}</p>
          <h3 style={{ margin: '6px 0 0', fontFamily: display, fontSize: 20, color: NAVY }}>{p.name}</h3>
          <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 700, color: PINK_DEEP }}>{p.priceSample}</p>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>{p.blurb}</p>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: NAVY }}>
            {p.activeDogs} active dog{p.activeDogs === 1 ? '' : 's'} · SAMPLE
          </p>
        </article>
      ))}
    </div>
  );
}

function CourseTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>course builder</p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
          Upload rough videos, voice notes, or outlines — assembl drafts modules, lesson summaries,
          worksheets, checklists, and student emails. Upsell Agent flags when a student needs private help.
        </p>
      </div>
      {COURSE_MODULES.map((m) => (
        <article key={m.id} style={{ ...glass, padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, color: NAVY }}>{m.title}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: MUTED }}>
              {m.lessons > 0 ? `${m.lessons} lessons` : 'content gap'}
              {m.fromSession ? ` · sourced from ${m.fromSession}` : ''}
            </p>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '5px 10px',
              borderRadius: 999,
              background: m.status === 'live' ? `${GOLD}33` : m.status === 'draft' ? `${PINK}33` : `${NAVY}10`,
              color: NAVY,
            }}
          >
            {m.status}
          </span>
        </article>
      ))}
    </div>
  );
}

function SupportTab() {
  const bucketLabel = {
    urgent: 'urgent / safety',
    'needs-fred': 'needs Fred',
    'course-answer': 'course can answer',
    booking: 'booking opportunity',
  } as const;
  const bucketColor = {
    urgent: '#B54A4A',
    'needs-fred': PINK_DEEP,
    'course-answer': GOLD,
    booking: NAVY,
  } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>remote support inbox</p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
          Owner messages sorted into urgent, needs Fred, answerable from course content, or booking
          opportunity — so Fred only spends brain on what only Fred can do.
        </p>
      </div>
      {SUPPORT_INBOX.map((m) => (
        <article key={m.id} style={{ ...glass, padding: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              {m.from} · {m.dog} · {m.at}
            </p>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: bucketColor[m.bucket],
              }}
            >
              {bucketLabel[m.bucket]}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: NAVY, lineHeight: 1.5 }}>{m.preview}</p>
        </article>
      ))}
    </div>
  );
}

function HiringTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>trainer hiring + onboarding</p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
          Job ad in Fred&apos;s tone, applicant screening, interview tasks, trial-session scorecards,
          onboarding manual, and quality control on client notes — so a second trainer keeps the method.
        </p>
      </div>
      <div style={{ ...glass, padding: 16, background: BLUSH }}>
        <p style={eyebrow}>draft job ad · SAMPLE</p>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
          Auckland Dog Trainer is hiring a second trainer who can learn to talk dog the Fred way —
          clear communication, ethical tools, calm handling, and zero ego with reactive cases. You&apos;ll
          shadow sessions, run homework reviews, and eventually carry programmes under Fred&apos;s
          quality bar.
        </p>
      </div>
      {APPLICANTS.map((a) => (
        <article key={a.id} style={{ ...glass, padding: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 18, color: NAVY }}>{a.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>{a.experience}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontFamily: display, fontSize: 24, color: NAVY }}>{a.score}</p>
              <p style={{ ...eyebrow, margin: 0 }}>method fit</p>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: NAVY, lineHeight: 1.45 }}>{a.methodFit}</p>
          <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: PINK_DEEP }}>
            stage · {a.stage}
          </p>
        </article>
      ))}
    </div>
  );
}

export function FredDashboard({ tab }: { tab: FredTabKey }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-brand-body), system-ui, sans-serif', color: NAVY }}>
      <Hero />
      <TabBar active={tab} />
      {tab === 'overview' ? <OverviewTab /> : null}
      {tab === 'leads' ? <LeadsTab /> : null}
      {tab === 'dogs' ? <DogsTab /> : null}
      {tab === 'programmes' ? <ProgrammesTab /> : null}
      {tab === 'notes' ? <SessionNotesEngine /> : null}
      {tab === 'course' ? <CourseTab /> : null}
      {tab === 'support' ? <SupportTab /> : null}
      {tab === 'hiring' ? <HiringTab /> : null}
    </div>
  );
}
