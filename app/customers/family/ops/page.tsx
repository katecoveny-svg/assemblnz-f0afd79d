import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { listFamily, group } from '@/lib/family/store';
import type { FamilyItem } from '@/lib/family/types';
import { SAMPLE_NEWSLETTER } from '@/lib/family/sample';
import { googleCalendarLink, mapsDirections, uberDeepLink, woolworthsSearch } from '@/lib/family/connectors';
import {
  parseNewsletterAction,
  loadSampleAction,
  approveAction,
  dismissAction,
  assignPickupAction,
  clearAllProposedAction,
  emailDigestAction,
} from './actions';

export const dynamic = 'force-dynamic';

/**
 * Family OS — the whānau operating system dashboard.
 *
 * Forward a school newsletter → the agent PROPOSES the family week (events,
 * tasks, pickups, shopping, approvals, memory). The family approves; approved
 * items become handoffs (add-to-calendar, maps/Uber deep link, Woolworths
 * search, an emailed brief). Draft-and-suggest only — nothing books, pays or
 * sends. Server-rendered with server actions, so the core works with no JS.
 */

const CREAM = '#FBF6EE';
const INK = '#2A2620';
const MUTED = '#8A8272';
const GOLD = '#BFA37A';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';
const BLUE = '#6E93A6';

const glass: CSSProperties = {
  borderRadius: 18,
  border: `1px solid ${GOLD}55`,
  background: 'linear-gradient(180deg, #ffffff, #fffdf9)',
  boxShadow: '0 12px 34px rgba(154,123,58,0.10), inset 0 1px 0 rgba(255,255,255,0.8)',
};
const eyebrow: CSSProperties = { fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED };
const display = 'var(--font-brand-display)';

function btn(bg: string, filled = true): CSSProperties {
  return {
    fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
    color: filled ? '#fff' : bg, background: filled ? bg : 'transparent', border: `1.5px solid ${bg}`,
  };
}
function linkPill(color: string): CSSProperties {
  return { fontSize: 11.5, fontWeight: 600, color, textDecoration: 'none', border: `1px solid ${color}66`, borderRadius: 999, padding: '5px 11px', background: `${color}12` };
}
const kindTone: Record<string, string> = { money: CORAL, transport: BLUE, shopping: SAGE, messaging: GOLD, other: MUTED };

function ApproveDismiss({ id }: { id: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      <form action={approveAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" style={btn(CORAL)}>Approve</button>
      </form>
      <form action={dismissAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" style={btn(MUTED, false)}>Dismiss</button>
      </form>
    </div>
  );
}

export default async function FamilyOsHome() {
  const config = getBrandConfig('family');
  if (!config) notFound();

  const items = await listFamily('demo');
  const g = group(items);
  const proposedCount = g.proposed.length;
  const parsed = items.some((i) => i.source === 'newsletter');

  const body: CSSProperties = { fontFamily: 'var(--font-brand-body)', color: INK };

  return (
    <div style={{ ...body, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <DemoRibbon />

      {/* ── Hero: forward the newsletter ─────────────────────────────── */}
      <div style={{ ...glass, padding: 'clamp(22px,3vw,34px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${CORAL}22, transparent 70%)` }} />
        <p style={{ ...eyebrow, color: CORAL }}>family os · concept</p>
        <h1 style={{ fontFamily: display, fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, margin: '8px 0 0', lineHeight: 1.05 }}>
          Life admin, handled<span style={{ color: CORAL }}>.</span>
        </h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#5b5548', margin: '12px 0 0', maxWidth: 560 }}>
          Forward your school newsletter and I&rsquo;ll turn it into the family&rsquo;s week — events, pickups,
          what to buy, what to sign, what to pay. I <strong>draft and suggest</strong>; you approve. Nothing gets
          booked, paid or sent without you.
        </p>

        <form action={parseNewsletterAction} style={{ marginTop: 18 }}>
          <textarea
            name="newsletter"
            defaultValue={parsed ? '' : SAMPLE_NEWSLETTER}
            placeholder="Paste or forward a school newsletter…"
            rows={5}
            style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, border: `1px solid ${GOLD}55`, background: '#fffdf9', padding: '12px 14px', fontSize: 13, lineHeight: 1.5, color: INK, resize: 'vertical', fontFamily: 'var(--font-brand-body)' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit" style={{ ...btn(CORAL), fontSize: 14, padding: '11px 22px' }}>
              ✨ Turn this into our week
            </button>
            <FormButton action={loadSampleAction} label="Use the sample newsletter" tone={GOLD} />
            {parsed ? <FormButton action={clearAllProposedAction} label="Clear" tone={MUTED} outline /> : null}
            <span style={{ ...body, fontSize: 11.5, color: MUTED }}>real agent · claude reads it · draft-only</span>
          </div>
        </form>
      </div>

      {/* ── Approval queue — the trust centre ────────────────────────── */}
      {proposedCount > 0 ? (
        <div style={{ ...glass, border: `1.5px solid ${CORAL}`, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <p style={{ ...eyebrow, color: CORAL }}>waiting for you · {proposedCount}</p>
              <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, margin: '4px 0 0' }}>Here&rsquo;s what I found. Approve the bits you want.</h2>
            </div>
            <FormButton action={emailDigestAction} label="✉︎ Email me the week (draft)" tone={BLUE} outline />
          </div>
          {g.approvals.filter((a) => a.status === 'proposed').length > 0 ? (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))', gap: 12 }}>
              {g.approvals.filter((a) => a.status === 'proposed').map((a) => {
                const k = (a.detail as { kind?: string; reason?: string });
                return (
                  <div key={a.id} style={{ ...glass, padding: 16 }}>
                    <span style={{ ...eyebrow, fontSize: 9.5, color: kindTone[k.kind ?? 'other'] }}>{k.kind ?? 'other'}</span>
                    <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 5 }}>{a.title}</div>
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{k.reason}</div>
                    <ApproveDismiss id={a.id} />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── The grid: week / pickups / shopping / memory ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 16, alignItems: 'start' }}>
        <Section title="This week" accent={CORAL} empty={g.events.length === 0 && 'Events land here once you parse a newsletter.'}>
          {g.events.map((e) => (
            <Row key={e.id} item={e}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{[e.when_label, e.person, e.location].filter(Boolean).join(' · ')}</div>
              {e.status === 'proposed' ? <ApproveDismiss id={e.id} /> : (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <a href={googleCalendarLink(e.title, e.when_label ?? undefined, e.location ?? undefined)} target="_blank" rel="noreferrer" style={linkPill(CORAL)}>add to calendar ↗</a>
                  <Done id={e.id} />
                </div>
              )}
            </Row>
          ))}
          {g.tasks.length > 0 ? (
            <>
              <p style={{ ...eyebrow, marginTop: 14 }}>needs doing</p>
              {g.tasks.map((t) => (
                <Row key={t.id} item={t}>
                  <div style={{ fontSize: 13.5 }}>{t.title}{t.person ? <span style={{ color: MUTED }}> · {t.person}</span> : null}{t.when_label ? <span style={{ color: MUTED }}> · {t.when_label}</span> : null}</div>
                  {t.status === 'proposed' ? <ApproveDismiss id={t.id} /> : <Done id={t.id} />}
                </Row>
              ))}
            </>
          ) : null}
        </Section>

        <Section title="Pickup board" accent={BLUE} empty={g.pickups.length === 0 && 'Who’s collecting whom — appears when a newsletter mentions pickups.'}>
          {g.pickups.map((p) => {
            const d = p.detail as { assigned?: string; backup?: string; note?: string };
            return (
              <Row key={p.id} item={p}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.person}</div>
                <div style={{ fontSize: 12, color: MUTED }}>from {p.location} · {p.when_label}</div>
                {d.note ? <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{d.note}</div> : null}
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  {d.assigned ? <span style={{ color: SAGE, fontWeight: 600 }}>✓ {d.assigned}</span> : <span style={{ color: CORAL }}>unassigned</span>}
                  {d.backup ? <span style={{ color: MUTED }}> · backup {d.backup}</span> : null}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {g.people.map((who) => (
                    <form key={who.id} action={assignPickupAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="who" value={who.title.split(' ')[0]} />
                      <input type="hidden" name="field" value="assigned" />
                      <button type="submit" style={{ ...linkPill(BLUE), cursor: 'pointer' }}>{who.title.split(' ')[0]}</button>
                    </form>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <a href={mapsDirections(p.location ?? '')} target="_blank" rel="noreferrer" style={linkPill(BLUE)}>maps ↗</a>
                  <a href={uberDeepLink(p.location ?? '')} target="_blank" rel="noreferrer" style={linkPill(MUTED)}>Uber (needs approval) ↗</a>
                </div>
              </Row>
            );
          })}
        </Section>

        <Section title="Shopping" accent={SAGE} empty={g.shopping.length === 0 && 'Nut-free plates, sports kit, lunchbox — lists appear from the newsletter.'}>
          {g.shopping.map((s) => {
            const d = s.detail as { items?: string[]; reason?: string };
            return (
              <Row key={s.id} item={s}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                {d.reason ? <div style={{ fontSize: 11.5, color: MUTED }}>{d.reason}</div> : null}
                <ul style={{ margin: '8px 0 0', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {(d.items ?? []).map((it) => (
                    <li key={it} style={{ fontSize: 12.5 }}>
                      <a href={woolworthsSearch(it)} target="_blank" rel="noreferrer" style={{ color: SAGE, textDecoration: 'none' }}>{it}</a>
                    </li>
                  ))}
                </ul>
                {s.status === 'proposed' ? <ApproveDismiss id={s.id} /> : (
                  <div style={{ ...body, fontSize: 11, color: MUTED, marginTop: 8 }}>Tap an item to open Woolworths · budget / healthy / easiest, just ask</div>
                )}
              </Row>
            );
          })}
        </Section>

        <Section title="Family memory" accent={GOLD} empty={false}>
          {g.memory.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${GOLD}22` }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: m.status === 'approved' ? SAGE : CORAL, flex: 'none' }} />
              <span style={{ fontSize: 12.5, flex: 1 }}>{m.title}{m.person ? <span style={{ color: MUTED }}> · {m.person}</span> : null}</span>
              {m.status === 'proposed' ? (
                <form action={approveAction}><input type="hidden" name="id" value={m.id} /><button type="submit" style={{ ...linkPill(GOLD), cursor: 'pointer' }}>remember</button></form>
              ) : null}
            </div>
          ))}
          <p style={{ ...eyebrow, marginTop: 14 }}>the family</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {g.people.map((p) => (
              <span key={p.id} style={{ fontSize: 12, border: `1px solid ${GOLD}44`, borderRadius: 999, padding: '4px 10px', background: '#fffdf9' }}>{p.title}</span>
            ))}
          </div>
        </Section>
      </div>

      <p style={{ ...body, fontSize: 11, color: MUTED, textAlign: 'center' }}>
        Concept demo · the agent proposes, you approve, the app executes (calendar / maps / Uber / Woolworths handoffs).
        Nothing books, pays or sends on its own. Real dates &amp; rules always your call.
      </p>
    </div>
  );
}

/** A server-action-only button (for actions with no form fields). */
function FormButton({ action, label, tone, outline }: { action: () => Promise<void>; label: string; tone: string; outline?: boolean }) {
  return (
    <form action={action}>
      <button type="submit" style={outline ? btn(tone, false) : { ...linkPill(tone), cursor: 'pointer', padding: '8px 14px' }}>{label}</button>
    </form>
  );
}

function Done({ id }: { id: string }) {
  return (
    <form action={approveAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} title="mark handled">done</button>
    </form>
  );
}

function Section({ title, accent, empty, children }: { title: string; accent: string; empty: string | false; children: React.ReactNode }) {
  const hasKids = Array.isArray(children) ? children.some(Boolean) : Boolean(children);
  return (
    <div style={{ ...glass, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
        <p style={{ ...eyebrow, color: accent }}>{title}</p>
      </div>
      <div style={{ marginTop: 12 }}>
        {hasKids ? children : <p style={{ fontSize: 12.5, color: MUTED }}>{empty || 'Nothing yet.'}</p>}
      </div>
    </div>
  );
}

function Row({ item, children }: { item: FamilyItem; children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${GOLD}22`, opacity: item.status === 'proposed' ? 1 : 0.92 }}>
      {children}
    </div>
  );
}
