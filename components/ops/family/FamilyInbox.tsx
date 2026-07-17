import type { CSSProperties } from 'react';
import type { InboxStatus } from '@/lib/family/inbox-status';
import { FamilyDropzone } from '@/components/ops/family/FamilyDropzone';

/**
 * Inbox (Echo) — the always-on email spoke.
 *
 * Echo scans the family inbox on a 15-minute cloud schedule, categorises what
 * lands (newsletter / sports / bill / school-admin / event) and turns it into
 * proposed items — draft-only, nothing replied, RSVP'd or paid. Until a real
 * inbox is connected it shows a labelled sample; once the cron runs, the status
 * strip reflects the live sync.
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const SAGE = '#7A8B6F';
const CORAL = '#E08A6B';
const BLUE = '#6E93A6';

type InboxItem = { sender: string; subject: string; category: string; note: string; person?: string };

const CATEGORY_TONE: Record<string, string> = {
  newsletter: CORAL, sports: BLUE, bill: '#B06A4F', 'school-admin': GOLD, event: SAGE, other: MUTED,
};

// Labelled sample — a realistic week of family email (placeholder data).
const SAMPLE: InboxItem[] = [
  { sender: 'Mangawhai Beach School', subject: 'Week 6 Pānui', category: 'newsletter', note: '5 items proposed — disco, shared lunch, cross country, camp deposit, mufti. In “This week”.' },
  { sender: 'Kahawai Netball', subject: 'Team photo day — Wednesday', category: 'sports', note: 'Straight after training. Added to the week; red top reminder set.', person: 'Mila' },
  { sender: 'Watercare', subject: 'Your bill is ready — $142.30', category: 'bill', note: 'Due the 22nd. Echo drafted a reminder — waiting in Approvals. It never pays.' },
  { sender: 'Sacred Heart College', subject: 'Year 9 enrolment information evening', category: 'school-admin', note: 'Calendar hold drafted for Jack’s college enrolment evening. Your call to confirm.', person: 'Jack' },
];

const card: CSSProperties = {
  borderRadius: 14, border: `1px solid ${GOLD}33`,
  background: 'linear-gradient(180deg,#ffffff,#fbfcfb)', padding: '11px 13px',
};

function Dot({ on }: { on: boolean }) {
  return <span style={{ width: 7, height: 7, borderRadius: 999, background: on ? SAGE : GOLD, display: 'inline-block' }} />;
}

/**
 * Explains what happened after Kate clicks Connect Gmail / Connect Outlook.
 * Values match the ?connect=… codes the OAuth route redirects back with, so a
 * silent bounce becomes a legible line of prose instead of the same screen.
 */
export type ConnectState =
  | 'needs-setup'         // OAuth client id/secret not configured for this env
  | 'connected'           // callback stored a refresh token
  | 'error'               // provider returned an OAuth error
  | 'unknown-provider'
  | null;

const CONNECT_MESSAGES: Record<Exclude<ConnectState, null>, { tone: 'ok' | 'wait' | 'bad'; text: string }> = {
  connected:          { tone: 'ok',   text: 'Inbox connected — Echo will start its 15-minute sweep on the next tick. Drafts land in Approvals.' },
  'needs-setup':      { tone: 'wait', text: "Almost there — the OAuth app isn't wired for this environment yet (missing GMAIL_OAUTH_CLIENT_ID / MS_OAUTH_CLIENT_ID on Vercel). The button, callback and sync are all deployed and waiting on those env vars." },
  error:              { tone: 'bad',  text: "The provider returned an error before authorising Echo. Nothing was stored — try again, or check the browser wasn't blocking the popup." },
  'unknown-provider': { tone: 'bad',  text: 'That inbox provider isn\'t supported yet — Gmail and Outlook only for now.' },
};

function ConnectBanner({ state }: { state: Exclude<ConnectState, null> }) {
  const { tone, text } = CONNECT_MESSAGES[state];
  const stripe = tone === 'ok' ? SAGE : tone === 'wait' ? GOLD : CORAL;
  const bg     = tone === 'ok' ? '#F4F7F0' : tone === 'wait' ? '#FBF5E9' : '#FBECE4';
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10,
      border: `1px solid ${stripe}55`, background: bg, borderRadius: 12, padding: '10px 13px',
    }}>
      <span style={{ marginTop: 5, width: 8, height: 8, borderRadius: 999, background: stripe, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: INK, lineHeight: 1.55 }}>{text}</span>
    </div>
  );
}

export function FamilyInbox({ status, connectState = null }: { status: InboxStatus | null; connectState?: ConnectState }) {
  const connected = Boolean(status?.connected);
  return (
    <div>
      {connectState ? <ConnectBanner state={connectState} /> : null}

      {/* status strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', border: `1px solid ${GOLD}44`, background: '#fbfcfb', borderRadius: 12, padding: '9px 13px' }}>
        <Dot on={connected} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>Echo · always-on inbox</span>
        <span style={{ fontSize: 11.5, color: MUTED }}>scans every 15 min · draft-only</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED }}>
          {connected
            ? `Connected${status?.provider ? ` · ${status.provider}` : ''}${status?.lastSyncLabel ? ` · last synced ${status.lastSyncLabel}` : ''}`
            : 'Not connected yet — showing a sample. Connect your inbox to go live.'}
        </span>
      </div>

      {!connected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{ fontSize: 11, color: MUTED }}>Connect your inbox so newsletters + bills parse automatically:</span>
          <a href="/api/family/inbox/connect/outlook" style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', background: '#0F6CBD', textDecoration: 'none', borderRadius: 999, padding: '6px 12px' }}>Connect Outlook</a>
          <a href="/api/family/inbox/connect/gmail" style={{ fontSize: 11.5, fontWeight: 600, color: INK, background: 'transparent', textDecoration: 'none', border: `1px solid ${GOLD}66`, borderRadius: 999, padding: '6px 12px' }}>Connect Gmail</a>
          <span style={{ fontSize: 10, color: MUTED }}>authorise once — the sync’s deployed &amp; waiting</span>
        </div>
      ) : null}

      <div style={{ marginTop: 10 }}>
        <FamilyDropzone
          kinds={[{ key: 'newsletter', label: 'Newsletter / notice' }]}
          defaultKind="newsletter"
          accept="image/*,application/pdf"
          hint="Sacred Heart / Baradene PDFs, sports fixtures, Kindo forms, or a photo of what came home in the bag — read on-device, draft-only, auto-deleted after 30 days"
        />
      </div>

      <p style={{ fontSize: 11, color: MUTED, marginTop: 12 }}>
        {connected ? 'Latest from your inbox' : '4 new · 1 newsletter · 1 sports · 1 bill · 1 enrolment'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {SAMPLE.map((it) => (
          <div key={it.subject} style={card}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: CATEGORY_TONE[it.category] ?? MUTED, fontWeight: 700 }}>{it.category}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{it.sender}</span>
              {it.person ? <span style={{ fontSize: 11, color: MUTED }}>· {it.person}</span> : null}
            </div>
            <div style={{ fontSize: 12.5, color: INK, marginTop: 3 }}>{it.subject}</div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{it.note}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: MUTED, marginTop: 10, lineHeight: 1.5 }}>
        Echo reads, sorts and drafts. Anything with money, transport, messaging or shopping lands in
        <strong style={{ color: INK }}> Approvals</strong> — it never replies, RSVPs or pays on its own.
      </p>
    </div>
  );
}
