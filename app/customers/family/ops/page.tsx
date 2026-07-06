import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { listFamily, group } from '@/lib/family/store';
import type { FamilyItem } from '@/lib/family/types';
import { googleCalendarLink, mapsDirections, uberDeepLink, woolworthsSearch } from '@/lib/family/connectors';
import { FamilyHeroPanel } from '@/components/ops/family/FamilyHeroPanel';
import { FamilyChat } from '@/components/ops/family/FamilyChat';
import { ThrowItIn } from '@/components/ops/family/ThrowItIn';
import { FamilyRides } from '@/components/ops/family/FamilyRides';
import { FamilyKitchen } from '@/components/ops/family/FamilyKitchen';
import { FamilyMoney } from '@/components/ops/family/FamilyMoney';
import { FamilyInbox } from '@/components/ops/family/FamilyInbox';
import { FamilyProfiles } from '@/components/ops/family/FamilyProfiles';
import { FamilyPacking } from '@/components/ops/family/FamilyPacking';
import { FamilyMoanaChat } from '@/components/ops/family/FamilyMoanaChat';
import { FamilyHomeworkChat } from '@/components/ops/family/FamilyHomeworkChat';
import { FamilyQuest } from '@/components/ops/family/FamilyQuest';
import { familyOpsVisuals } from './visuals/manifest';
import { getInboxStatus } from '@/lib/family/inbox-status';
import { getFamilyViewer } from '@/lib/family/viewer';
import { WHANAU, WHANAU_DEMO, custodyThisWeek, DEMO_MODE_COOKIE, type Person } from '@/lib/family/profiles';
import { cookies } from 'next/headers';
import { approveAction, dismissAction, assignPickupAction, emailDigestAction } from './actions';

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

const CREAM = '#FBFAF6';
const INK = '#1A1918';
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
  const inboxStatus = await getInboxStatus('demo');
  const viewer = await getFamilyViewer();

  const jar = await cookies();
  const demoMode = jar.get(DEMO_MODE_COOKIE)?.value === '1';
  const added: Person[] = g.people
    .filter((p) => (p.detail as { added?: boolean })?.added)
    .map((p) => ({
      id: p.id, name: p.title, mark: p.title.slice(0, 1).toLowerCase(),
      role: String((p.detail as { role?: string })?.role || 'whānau'),
      kind: 'parent' as const,
      details: ((p.detail as { details?: string[] })?.details ?? []),
      accent: '#BFA37A',
    }));
  const people: Person[] = [...(demoMode ? WHANAU_DEMO : WHANAU), ...added];
  const custody = custodyThisWeek();
  const kids = people.filter((p) => p.kind === 'child' && p.year);

  const body: CSSProperties = { fontFamily: 'var(--font-brand-body)', color: INK };

  return (
    <div style={{ ...body, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <DemoRibbon />

      {viewer ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 14px', borderRadius: 999, border: `1px solid ${GOLD}44`, background: '#fffdf9', fontSize: 12.5 }}>
          <span style={{ fontFamily: display, fontSize: 16, color: INK }}>{viewer.greeting}</span>
          <span style={{ color: MUTED }}>
            {viewer.isKid
              ? '— this is your view: your week, your chores, your savings. Kate approves everything.'
              : '— you can see the whole family’s week.'}
          </span>
        </div>
      ) : null}

      {/* ── Hero (illustrated + ambient) + newsletter parse ──────────── */}
      <FamilyHeroPanel parsed={parsed} />

      {/* ── Throw it in — anyone drops a note (typed or spoken) ──────── */}
      <ThrowItIn />

      {/* ── The whānau — profiles, custody, Franklin ─────────────────── */}
      <Section id="whanau" title="The whānau" accent={GOLD} empty={false}>
        <FamilyProfiles people={people} custody={custody} demoMode={demoMode} />
      </Section>

      {/* ── Live family assistant + approval queue, side by side ─────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.05fr) minmax(280px, 0.95fr)', gap: 16, alignItems: 'start' }}>
        <div>
          <p style={{ ...eyebrow, color: CORAL, marginBottom: 8 }}>or just ask</p>
          <FamilyChat />
        </div>
        <div id="approvals" style={{ scrollMarginTop: 80 }}>
          <p style={{ ...eyebrow, color: CORAL, marginBottom: 8 }}>waiting for you {proposedCount > 0 ? `· ${proposedCount}` : ''}</p>
          {proposedCount > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <form action={emailDigestAction}>
                <button type="submit" style={{ ...linkPill(BLUE), cursor: 'pointer', padding: '8px 14px' }}>✉︎ Email me the week (draft)</button>
              </form>
              {g.approvals.filter((a) => a.status === 'proposed').map((a) => {
                const k = a.detail as { kind?: string; reason?: string };
                return (
                  <div key={a.id} style={{ ...glass, padding: 15 }}>
                    <span style={{ ...eyebrow, fontSize: 9.5, color: kindTone[k.kind ?? 'other'] }}>{k.kind ?? 'other'}</span>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{k.reason}</div>
                    <ApproveDismiss id={a.id} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ ...glass, padding: 18 }}>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                Parse a newsletter (or ask me) and anything with <strong style={{ color: INK }}>money, transport, messaging or shopping</strong> lands here for you to approve. Nothing happens without your yes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── The grid: week / pickups / shopping / memory ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 16, alignItems: 'start' }}>
        <Section id="week" title="This week" accent={CORAL} icon={familyOpsVisuals.heroes.week} empty={g.events.length === 0 && 'Events land here once you parse a newsletter.'}>
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

        <Section id="pickups" title="Pickup board" accent={BLUE} empty={g.pickups.length === 0 && 'Who’s collecting whom — appears when a newsletter mentions pickups.'}>
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
      </div>

      {/* ── Rides + logistics (Uber estimates + deep links) ───────────── */}
      <Section id="rides" title="Rides + logistics" accent={BLUE} icon={familyOpsVisuals.heroes.rides} empty={false}>
        <FamilyRides />
      </Section>

      {/* ── Kitchen + groceries (Woolworths + Uber Direct) ────────────── */}
      <Section id="kitchen" title="Kitchen + groceries" accent={SAGE} icon={familyOpsVisuals.heroes.kitchen} empty={false}>
        <FamilyKitchen />
      </Section>

      {/* ── Packing lists — text it to the kids + gear reminders ──────── */}
      <Section id="packing" title="Packing lists" accent={SAGE} empty={false}>
        <FamilyPacking />
      </Section>

      {/* ── Shopping lists (from the newsletter) ──────────────────────── */}
      <Section id="shopping" title="Shopping" accent={SAGE} empty={g.shopping.length === 0 && 'Nut-free plates, sports kit, lunchbox — lists appear from the newsletter.'}>
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

      {/* ── Kids' quest — the interactive game layer ─────────────────── */}
      <Section id="quest" title="Kids’ quest" accent={CORAL} empty={false}>
        <FamilyQuest />
      </Section>

      {/* ── Kids' money · Tōro (chores → allowance → savings) ─────────── */}
      <Section id="money" title="Kids’ money · Tōro" accent={CORAL} empty={false}>
        <FamilyMoney readOnly={viewer?.isKid} />
      </Section>

      {/* ── Boating — Moana, the mariner ─────────────────────────────── */}
      <Section id="boating" title="On the water · Moana" accent={BLUE} empty={false}>
        <FamilyMoanaChat />
      </Section>

      {/* ── Homework help — grounded to each kid's year + school ─────── */}
      <Section id="homework" title="Homework help" accent={CORAL} empty={kids.length === 0 && 'Add the kids’ year + school and homework help appears here.'}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
          {kids.map((k) => (
            <FamilyHomeworkChat key={k.id} child={{ name: k.name, year: k.year ?? 0, school: k.school ?? '', level: k.level ?? 'NZ Curriculum' }} />
          ))}
        </div>
      </Section>

      {/* ── Inbox · Echo (always-on email parsing) ────────────────────── */}
      <Section id="inbox" title="Inbox · Echo" accent={BLUE} icon={familyOpsVisuals.heroes.inbox} empty={false}>
        <FamilyInbox status={inboxStatus} />
      </Section>

      {/* ── Family memory ─────────────────────────────────────────────── */}
      <Section id="memory" title="Family memory" accent={GOLD} empty={false}>
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

      <p style={{ ...body, fontSize: 11, color: MUTED, textAlign: 'center' }}>
        Concept demo · the agent proposes, you approve, the app executes (calendar / maps / Uber / Woolworths handoffs).
        Nothing books, pays or sends on its own. Real dates &amp; rules always your call.
      </p>
    </div>
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

function Section({ id, title, accent, empty, icon, children }: { id?: string; title: string; accent: string; empty: string | false; icon?: string; children: React.ReactNode }) {
  const hasKids = Array.isArray(children) ? children.some(Boolean) : Boolean(children);
  return (
    <div id={id} style={{ ...glass, padding: 18, scrollMarginTop: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
        <p style={{ ...eyebrow, color: accent }}>{title}</p>
        {icon ? <img src={icon} alt="" aria-hidden width={30} height={30} style={{ marginLeft: 'auto', opacity: 0.9 }} /> : null}
      </div>
      <div style={{ marginTop: 12 }}>
        {hasKids ? children : <p style={{ fontSize: 12.5, color: MUTED }}>{empty || 'Nothing yet.'}</p>}
      </div>
    </div>
  );
}

function relTime(iso?: string): string {
  if (!iso) return 'just now';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function Row({ item, children }: { item: FamilyItem; children: React.ReactNode }) {
  const d = item.detail as { from?: string; dropped_at?: string; channel?: string };
  const from = typeof d?.from === 'string' ? d.from : null;
  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${GOLD}22`, opacity: item.status === 'proposed' ? 1 : 0.92 }}>
      {children}
      {from ? (
        <div style={{ fontSize: 10.5, color: MUTED, marginTop: 6 }}>
          {d?.channel === 'voice' ? '🎙 ' : ''}from <strong style={{ color: INK }}>{from}</strong> · {relTime(d?.dropped_at)}
        </div>
      ) : null}
    </div>
  );
}
