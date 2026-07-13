'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';
import {
  AGENT_MESH,
  APPLICANTS,
  CHALLENGES,
  COURSE_MODULES,
  COURSE_STUDIO_DRAFT,
  DOGS,
  FAQ_VIDEOS,
  LEADS,
  OFFERS,
  PROGRAMMES,
  QUIZ,
  REVENUE_SAMPLE,
  SUPPORT_INBOX,
  TIME_COCKPIT,
  WEEK_BLOCKS,
  type Lead,
  type OfferSlug,
  type Urgency,
} from '@/lib/customers/auckland-dog-trainer/demo-data';
import {
  FRED_TABS,
  type FredTabKey,
} from '@/lib/customers/auckland-dog-trainer/tabs';
import { SessionNotesEngine } from '@/components/ops/fred/SessionNotesEngine';
import { InstagramLeadCapture } from '@/components/ops/fred/InstagramLeadCapture';
import { BusinessGenome } from '@/components/ops/fred/BusinessGenome';
import { MorningBrief } from '@/components/ops/fred/MorningBrief';
import { SocialStudio } from '@/components/ops/shared/SocialStudio';
import { OsHoverLift, OsReveal, OsScrollReveal, OsStagger, osStaggerItem } from '@/components/ops/shared/OsMotion';
import { motion } from 'framer-motion';

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
    <nav aria-label="Harbourside Dog Training sections" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {FRED_TABS.map((t) => {
        const on = t.key === active;
        return (
          <motion.div key={t.key} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={`/customers/auckland-dog-trainer/ops?tab=${t.key}`}
              scroll={false}
              aria-current={on ? 'page' : undefined}
              style={{
                display: 'inline-block',
                fontSize: 12.5,
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: 999,
                textDecoration: 'none',
                color: on ? '#fff' : NAVY,
                background: on ? NAVY : CREAM,
                border: `1.5px solid ${on ? NAVY : `${NAVY}22`}`,
                boxShadow: on ? '0 8px 20px rgba(27,42,74,0.22)' : '0 1px 0 rgba(255,255,255,0.8) inset',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              {t.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

/** Quiet intro under the editorial photo hero — one line, no competing banner. */
function Hero() {
  return (
    <section style={{ padding: '4px 2px 0' }}>
      <p style={{ ...eyebrow, color: PINK_DEEP }}>Sam&apos;s operating system</p>
      <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.55, color: MUTED, maxWidth: 520 }}>
        One genome. Every surface. Nothing sends without your yes.
      </p>
    </section>
  );
}


function LandingTab() {
  const [answers, setAnswers] = useState<Record<string, OfferSlug>>({});
  const recommendation = useMemo(() => {
    const votes = Object.values(answers);
    if (votes.length < QUIZ.length) return null;
    const tally = votes.reduce<Partial<Record<OfferSlug, number>>>((acc, v) => {
      acc[v] = (acc[v] ?? 0) + 1;
      return acc;
    }, {});
    return (Object.entries(tally).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as OfferSlug) ?? 'private';
  }, [answers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...glass, padding: 18, background: `linear-gradient(135deg, ${NAVY}, #2a3d5c)` }}>
        <p style={{ ...eyebrow, color: PINK }}>public landing hub · self-service</p>
        <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 26, color: '#fff' }}>
          Not sure what your dog needs? Find the right training path.
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 14, color: '#D8DEE9', maxWidth: 480 }}>
          Visual programme chooser — replaces the explanations you repeat every week.
        </p>
      </div>

      <p style={eyebrow}>choose your challenge</p>
      <OsStagger style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {CHALLENGES.map((c) => (
          <motion.div key={c.id} variants={osStaggerItem}>
            <OsHoverLift accent={PINK} style={{ ...glass, padding: 14, minHeight: 120 }}>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 18, color: NAVY }}>{c.title}</h3>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.45 }}>{c.blurb}</p>
              <p style={{ margin: '10px 0 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: PINK_DEEP }}>
                → {OFFERS[c.mapsTo].short}
              </p>
            </OsHoverLift>
          </motion.div>
        ))}
      </OsStagger>

      <p style={{ ...eyebrow, marginTop: 6 }}>programme cards</p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {(['private', 'recall', 'reactivity', 'board-train'] as OfferSlug[]).map((slug) => {
          const p = PROGRAMMES.find((x) => x.slug === slug)!;
          return (
            <article key={slug} style={{ ...glass, padding: 16 }}>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 18, color: NAVY }}>{p.name}</h3>
              <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700, color: PINK_DEEP }}>{p.priceSample}</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.45 }}>{p.blurb}</p>
            </article>
          );
        })}
      </div>

      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>video-first FAQ</p>
        <div style={{ display: 'grid', gap: 8, marginTop: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {FAQ_VIDEOS.map((f) => (
            <div key={f.id} style={{ padding: 12, borderRadius: 12, background: BLUSH }}>
              <div style={{ height: 64, borderRadius: 8, background: `${NAVY}18`, display: 'grid', placeItems: 'center', color: NAVY, fontSize: 12, fontWeight: 700 }}>
                ▶ {f.dur}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: NAVY }}>{f.q}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>dog fit quiz · 3 of 8–10 shown</p>
        <p style={{ margin: '6px 0 12px', fontSize: 13, color: MUTED }}>
          Owner answers → Pathway Agent recommends the next step and creates a CRM lead.
        </p>
        {QUIZ.map((q) => (
          <div key={q.id} style={{ marginBottom: 14 }}>
            <p style={{ margin: 0, fontWeight: 600, color: NAVY, fontSize: 14 }}>{q.prompt}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {q.options.map((o) => {
                const on = answers[q.id] === o.weight;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.weight }))}
                    style={{
                      fontSize: 12.5,
                      padding: '7px 12px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      border: `1.5px solid ${on ? NAVY : `${NAVY}22`}`,
                      background: on ? NAVY : CREAM,
                      color: on ? '#fff' : NAVY,
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {recommendation ? (
          <div style={{ marginTop: 8, padding: 14, borderRadius: 12, background: BLUSH }}>
            <p style={eyebrow}>recommended path</p>
            <p style={{ margin: '6px 0 0', fontFamily: display, fontSize: 20, color: NAVY }}>
              {OFFERS[recommendation].label}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED }}>
              {OFFERS[recommendation].priceSample} · lead drafted into CRM · you confirm before anything sends
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LeadsTab({ liveEnquiries = [] }: { liveEnquiries?: LiveEnquiry[] }) {
  const [captured, setCaptured] = useState<Lead | null>(null);
  const leads = captured ? [captured, ...LEADS] : LEADS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <InstagramLeadCapture onCaptured={setCaptured} />
      {liveEnquiries.length > 0 ? (
        <div style={{ ...glass, padding: 16, borderColor: `${GOLD}88` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={{ ...eyebrow, color: GOLD }}>from your public website · live</p>
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
              {liveEnquiries.length} on your desk — intake agent drafts a reply for each, you approve every send
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {liveEnquiries.map((e) => (
              <article key={e.id} style={{ padding: 12, borderRadius: 12, background: BLUSH }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: NAVY, fontSize: 14 }}>
                    {e.name}
                    {e.dog ? (
                      <span style={{ fontWeight: 400, color: MUTED, marginLeft: 8, fontSize: 13 }}>{e.dog}</span>
                    ) : null}
                  </p>
                  <span style={{ ...eyebrow, color: e.source === 'seed' ? MUTED : GOLD }}>
                    {e.source === 'seed' ? 'sample' : e.source} · {e.when}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 13.5, color: NAVY, lineHeight: 1.5 }}>{e.message}</p>
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: MUTED }}>{e.email}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>lead triage · Intake + Pathway + Risk agents</p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
          Dog profile, issue type, urgency, risk level, recommended offer — sorted before Sam replies.
        </p>
      </div>
      {leads.map((lead) => (
        <article key={lead.id} style={{ ...glass, padding: 16, borderColor: lead.id === 'lead-killer' || lead.id === captured?.id ? `${PINK}88` : undefined }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, color: NAVY }}>
                {lead.dog}
                <span style={{ fontFamily: 'var(--font-brand-body)', fontSize: 13, color: MUTED, marginLeft: 8 }}>
                  {lead.breed} · {lead.age} · {lead.suburb}
                </span>
                {lead.id === captured?.id ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: PINK_DEEP,
                      color: '#fff',
                      verticalAlign: 'middle',
                    }}
                  >
                    new · from instagram
                  </span>
                ) : null}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
                {lead.owner} · {lead.source} · {lead.receivedAt}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, background: `${urgencyTone(lead.urgency)}18`, color: urgencyTone(lead.urgency) }}>
                {lead.urgency}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: `${NAVY}10`, color: NAVY }}>
                risk {lead.riskLevel}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: `${PINK}33`, color: NAVY }}>
                → {offerLabel(lead.recommended)}
              </span>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: NAVY, lineHeight: 1.5 }}>{lead.triage}</p>
          {lead.draftReply ? (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5, padding: 12, background: BLUSH, borderRadius: 10 }}>
              <span style={eyebrow}>draft reply · </span>
              {lead.draftReply}
            </p>
          ) : null}
          {lead.explainerVideo ? (
            <p style={{ margin: '8px 0 0', fontSize: 12.5, color: PINK_DEEP }}>Explainer · {lead.explainerVideo}</p>
          ) : null}
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
            <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: `${NAVY}12`, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: PINK_DEEP, borderRadius: 999 }} />
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
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
                  Homework {dog.homeworkDone ? '✓' : '○'} · Videos {dog.videosPending} · Next: {dog.nextSession}
                </p>
              </div>
              <div>
                <p style={eyebrow}>time · revenue</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: NAVY }}>
                  {dog.timeSpentHrs}h · {dog.revenueSample} · {dog.paymentStatus}
                </p>
              </div>
            </div>
            {dog.riskNotes.length > 0 ? (
              <p style={{ margin: '12px 0 0', fontSize: 12.5, color: '#B54A4A' }}>Risk · {dog.riskNotes.join(' · ')}</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {PROGRAMMES.filter((p) => p.curriculum.length > 0).map((p) => (
        <article key={p.slug} style={{ ...glass, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, color: NAVY }}>{p.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: PINK_DEEP }}>{p.priceSample}</p>
            </div>
            <span style={eyebrow}>{p.activeDogs} active · indicative</span>
          </div>
          <p style={{ margin: '8px 0 12px', fontSize: 13.5, color: MUTED }}>{p.blurb}</p>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {p.curriculum.map((w) => (
              <div key={w.week} style={{ padding: 12, borderRadius: 12, background: BLUSH, borderLeft: `3px solid ${PINK_DEEP}` }}>
                <p style={eyebrow}>week {w.week}</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: NAVY }}>{w.title}</p>
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: MUTED }}>Owner · {w.ownerTask}</p>
                {w.video ? <p style={{ margin: '4px 0 0', fontSize: 12, color: PINK_DEEP }}>Video · {w.video}</p> : null}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function CourseTab() {
  const d = COURSE_STUDIO_DRAFT;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...glass, padding: 16, borderColor: `${PINK}66` }}>
        <p style={eyebrow}>course studio · Course Agent</p>
        <h3 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: NAVY }}>{d.module}</h3>
        <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 600, color: PINK_DEEP }}>{d.lessonTitle}</p>
        <ol style={{ margin: '12px 0 0', paddingLeft: 18, color: NAVY, fontSize: 13.5, lineHeight: 1.5 }}>
          {d.outline.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
        <p style={{ margin: '12px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5, padding: 12, background: BLUSH, borderRadius: 10 }}>
          <span style={eyebrow}>script · </span>
          {d.script}
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: NAVY }}>Owner task · {d.ownerTask}</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: NAVY }}>Worksheet · {d.worksheet}</p>
        <p style={{ margin: '10px 0 0', fontSize: 12.5, color: MUTED, lineHeight: 1.45 }}>
          Google Vids prompt · {d.googleVidsPrompt}
        </p>
      </div>
      {COURSE_MODULES.map((m) => (
        <article key={m.id} style={{ ...glass, padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, color: NAVY }}>{m.title}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: MUTED }}>
              {m.lessons > 0 ? `${m.lessons} lessons` : 'content gap'}
              {m.fromSession ? ` · ${m.fromSession}` : ''}
              {m.scriptReady ? ' · script ready for Vids' : ''}
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, background: m.status === 'live' ? `${GOLD}33` : m.status === 'draft' ? `${PINK}33` : `${NAVY}10`, color: NAVY }}>
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
    'needs-fred': 'needs Sam',
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
      {SUPPORT_INBOX.map((m) => (
        <article key={m.id} style={{ ...glass, padding: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              {m.from} · {m.dog} · {m.at}
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: bucketColor[m.bucket] }}>
              {bucketLabel[m.bucket]}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: NAVY, lineHeight: 1.5 }}>{m.preview}</p>
        </article>
      ))}
    </div>
  );
}

function TimeTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>capacity meter</p>
        <div style={{ marginTop: 10, height: 14, borderRadius: 999, background: `${NAVY}12`, overflow: 'hidden' }}>
          <div style={{ width: `${TIME_COCKPIT.capacityPct}%`, height: '100%', background: `linear-gradient(90deg, ${PINK}, ${PINK_DEEP})`, borderRadius: 999 }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: NAVY }}>
          Sam at {TIME_COCKPIT.capacityPct}% · travel {TIME_COCKPIT.travelMins}m · admin debt {TIME_COCKPIT.adminDebtMins}m · unpaid support {TIME_COCKPIT.unpaidSupportMins}m
        </p>
      </div>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>week blocks</p>
        <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WEEK_BLOCKS.map((b) => (
            <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13.5, color: NAVY, padding: '8px 10px', background: BLUSH, borderRadius: 10 }}>
              <span>
                <strong>{b.when}</strong> · {b.kind} · {b.title}
              </span>
              <span style={{ color: MUTED }}>{b.mins}m</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>time leakage → course opportunities</p>
        {TIME_COCKPIT.timeLeakage.map((t) => (
          <div key={t.label} style={{ marginTop: 10, fontSize: 13.5, color: NAVY }}>
            <strong>{t.mins}m</strong> · {t.label}
            <div style={{ color: PINK_DEEP, fontSize: 12.5 }}>→ {t.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HiringTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...glass, padding: 16, background: BLUSH }}>
        <p style={eyebrow}>draft job ad · indicative</p>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
          Harbourside Dog Training is hiring a second trainer who can harbourside dog training the Sam way —
          clear communication, ethical tools, calm handling, and zero ego with reactive cases.
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
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: NAVY }}>{a.methodFit}</p>
          <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: PINK_DEEP }}>
            stage · {a.stage}
          </p>
        </article>
      ))}
    </div>
  );
}

function AgentsTab() {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      {AGENT_MESH.map((a) => (
        <div key={a.id} style={{ ...glass, padding: 14 }}>
          <p style={{ ...eyebrow, color: a.status === 'live' ? GOLD : a.status === 'drafting' ? PINK_DEEP : MUTED }}>{a.status}</p>
          <h3 style={{ margin: '6px 0 0', fontSize: 15, color: NAVY }}>{a.name}</h3>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.45 }}>{a.job}</p>
        </div>
      ))}
    </div>
  );
}

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import type { LiveEnquiry } from '@/lib/customers/auckland-dog-trainer/genome-store';
import type { WorkView } from '@/lib/os/work-view';
import type { ConnectionsView } from '@/lib/os/connections';
import { WorkProofTab } from './WorkProofTab';
import { ConnectionsTab } from './ConnectionsTab';

export function FredDashboard({
  tab,
  genomeFacts,
  genomeLive = false,
  liveEnquiries,
  liveEnquiryCount,
  work,
  connections,
}: {
  tab: FredTabKey;
  genomeFacts?: GenomeFact[];
  genomeLive?: boolean;
  liveEnquiries?: LiveEnquiry[];
  liveEnquiryCount?: number | null;
  work?: WorkView | null;
  connections?: ConnectionsView | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-brand-body), system-ui, sans-serif', color: NAVY }}>
      <OsScrollReveal>
        <Hero />
      </OsScrollReveal>
      <TabBar active={tab} />
      <OsScrollReveal key={tab} delay={0.04}>
        {tab === 'brief' ? <MorningBrief liveEnquiryCount={liveEnquiryCount} /> : null}
        {tab === 'genome' ? <BusinessGenome facts={genomeFacts} live={genomeLive} editable /> : null}
        {tab === 'work' && work ? <WorkProofTab work={work} /> : null}
        {tab === 'connections' && connections ? <ConnectionsTab connections={connections} /> : null}
        {tab === 'landing' ? <LandingTab /> : null}
        {tab === 'leads' ? <LeadsTab liveEnquiries={liveEnquiries} /> : null}
        {tab === 'dogs' ? <DogsTab /> : null}
        {tab === 'programmes' ? <ProgrammesTab /> : null}
        {tab === 'notes' ? <SessionNotesEngine /> : null}
        {tab === 'course' ? <CourseTab /> : null}
        {tab === 'social' ? <SocialStudio pilot="auckland-dog-trainer" /> : null}
        {tab === 'support' ? <SupportTab /> : null}
        {tab === 'time' ? <TimeTab /> : null}
        {tab === 'hiring' ? <HiringTab /> : null}
        {tab === 'agents' ? <AgentsTab /> : null}
      </OsScrollReveal>
    </div>
  );
}
