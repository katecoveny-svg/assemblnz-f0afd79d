import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import '../birdie.css';

/**
 * /dash/sdk — the SDK Reference, a faithful build of the design handoff
 * ("Dash - SDK Reference.dc.html"): a centred white "paper" doc on a warm grey
 * surround, canary header, numbered dark code blocks with syntax highlighting,
 * an options table, surfaces/theming columns, trust pills and a dark footer.
 *
 * Sits inside the /dash Birdie chrome (marquee + nav + footer). Palette locked:
 * white + canary #FFD42A + charcoal #3a3832. See docs/dash-design-system.md.
 */

export const metadata: Metadata = {
  title: 'dash. SDK Reference — @assembl/dash',
  description:
    'Add a reward layer to your agent’s working state in one call. Install, init, show, drive the session, events, surfaces, white-label theming and signed webhooks.',
  alternates: { canonical: '/dash/sdk' },
};

const mono: CSSProperties = { fontFamily: 'var(--font-dash-mono), "Space Mono", monospace' };

// syntax-highlight palette from the handoff
const HL = {
  c: '#8a8678', // comment
  s: '#FFD42A', // string / method / identifier
  k: '#7fc8a0', // keyword
  n: '#9ec1ff', // number
  t: '#e8e6dd', // default text
} as const;

type Tok = '\n' | [string] | [string, keyof typeof HL];

function Code({ tokens, style }: { tokens: Tok[]; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: '#2a2823',
        borderRadius: 14,
        padding: '18px 20px',
        fontSize: 13,
        lineHeight: 1.7,
        color: HL.t,
        overflowX: 'auto',
        ...mono,
        ...style,
      }}
    >
      {tokens.map((tk, i) =>
        tk === '\n' ? (
          <br key={i} />
        ) : (
          <span key={i} style={{ color: tk[1] ? HL[tk[1]] : HL.t }}>
            {tk[0]}
          </span>
        ),
      )}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div
      style={{
        ...mono,
        fontSize: 11,
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: '#c79b1f',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

const OPTIONS: [string, ReactNode][] = [
  ['context', <><b style={mono}>&apos;agent&apos; | &apos;host&apos; | &apos;inline&apos;</b> — surface type. Sets sizing &amp; density.</>],
  ['status', <>String shown above the loader. Update live with <span style={mono}>session.setStatus()</span>.</>],
  ['steps', <><span style={mono}>{'{ current, total }'}</span> — drives the fill-the-dog height.</>],
  ['progress', <>0–1 float. Use instead of steps for continuous fill.</>],
  ['mount', <>Selector / element to render into. Omit for a managed overlay.</>],
  ['onComplete', <>Callback <span style={mono}>{'({ earned, reward }) => …'}</span></>],
];

const SURFACES: [string, string][] = [
  ['agent', "Under an agent's live status. Full loader."],
  ['host', 'Full-screen loading takeover. White-label.'],
  ['inline', 'Compact one-line bar for tight UIs.'],
];

const TRUST = ['Opt-in only', 'NZ data residency', 'No under-16 targeting', 'Signed webhooks', 'Assembl-governed'];

export default function DashSdkPage() {
  return (
    <div style={{ background: '#EDEAE2', padding: '40px 0' }}>
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          background: '#fff',
          boxShadow: '0 20px 60px rgba(120,100,40,.12)',
          color: '#3a3832',
        }}
      >
        {/* header */}
        <div
          className="sdk-head"
          style={{
            background: '#FFD42A',
            padding: '40px 48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
              <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: '-.05em', color: '#3a3832', lineHeight: 0.8 }}>
                dash
              </div>
              <div style={{ width: 28, height: 9, borderRadius: 5, background: '#3a3832', marginBottom: 7 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-.02em', color: '#3a3832' }}>
              SDK Reference
            </div>
          </div>
          <div style={{ ...mono, fontSize: 11, color: '#5a4a00', textAlign: 'right', lineHeight: 1.7 }}>
            for AI builders &amp; hosts
            <br />
            v0.1 · @assembl/dash
          </div>
        </div>

        {/* intro */}
        <div className="sdk-pad" style={{ padding: '34px 48px 10px' }}>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#56544b' }}>
            Add a reward layer to your agent&apos;s working state in one call. Dash renders a
            sponsored line + the fill-the-dog loader beneath your own status, banks value to the
            user, and fires events you can react to. Drop-in <span style={mono}>&lt;script&gt;</span>{' '}
            or npm.
          </p>
        </div>

        {/* 01 install */}
        <div className="sdk-pad" style={{ padding: '24px 48px 8px' }}>
          <Eyebrow>01 — Install</Eyebrow>
          <Code
            tokens={[
              ['# npm', 'c'], '\n',
              ['npm install '], ['@assembl/dash', 's'], '\n', '\n',
              ['<!-- or script tag -->', 'c'], '\n',
              ['<script src='], ['"https://cdn.dash.assembl.co.nz/v0/dash.js"', 's'], ['></script>'],
            ]}
          />
        </div>

        {/* 02 init */}
        <div className="sdk-pad" style={{ padding: '24px 48px 8px' }}>
          <Eyebrow>02 — Initialize</Eyebrow>
          <Code
            tokens={[
              ['import', 'k'], [' Dash '], ['from', 'k'], [' '], ["'@assembl/dash'", 's'], [';'], '\n', '\n',
              ['Dash.'], ['init', 's'], ['({'], '\n',
              ['  publishableKey: '], ["'pk_live_…'", 's'], [','], '\n',
              ['  region: '], ["'nz'", 's'], [','], [' // data residency', 'c'], '\n',
              ['  theme: '], ["'auto'", 's'], [' '], ["// 'light' | 'dark' | 'auto'", 'c'], '\n',
              ['});'],
            ]}
          />
        </div>

        {/* 03 show */}
        <div className="sdk-pad" style={{ padding: '24px 48px 8px' }}>
          <Eyebrow>03 — Show it while the agent works</Eyebrow>
          <Code
            style={{ marginBottom: 18 }}
            tokens={[
              ['// call when your agent starts a long task', 'c'], '\n',
              ['const', 'k'], [' session = Dash.'], ['show', 's'], ['({'], '\n',
              ['  context: '], ["'agent'", 's'], [','], '\n',
              ['  status:  '], ["'Reconciling June invoices'", 's'], [','], '\n',
              ['  steps:   { current: '], ['4', 'n'], [', total: '], ['6', 'n'], [' },'], '\n',
              ['  mount:   '], ["'#agent-status'", 's'], [' '], ['// selector or el', 'c'], '\n',
              ['});'],
            ]}
          />
          <div
            style={{
              ...mono,
              fontSize: 11,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#bdb592',
              marginBottom: 10,
            }}
          >
            show() options
          </div>
          <div style={{ border: '1px solid #EFEADC', borderRadius: 12, overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: 1,
                background: '#EFEADC',
                fontSize: 13.5,
              }}
            >
              {OPTIONS.map(([key, desc]) => (
                <Row key={key} k={key} desc={desc} />
              ))}
            </div>
          </div>
        </div>

        {/* 04 session */}
        <div className="sdk-pad" style={{ padding: '24px 48px 8px' }}>
          <Eyebrow>04 — Drive &amp; finish the session</Eyebrow>
          <Code
            tokens={[
              ['session.'], ['update', 's'], ['({ current: '], ['5', 'n'], [' });'], [" // advance the dog's fill", 'c'], '\n',
              ['session.'], ['setStatus', 's'], ['('], ["'Almost there…'", 's'], [');'], '\n',
              ['session.'], ['complete', 's'], ['();'], [' // shows "you earned $X" + banks it', 'c'], '\n',
              ['session.'], ['dismiss', 's'], ['();'], [' // cancel, no payout', 'c'],
            ]}
          />
        </div>

        {/* 05 events */}
        <div className="sdk-pad" style={{ padding: '24px 48px 8px' }}>
          <Eyebrow>05 — Events</Eyebrow>
          <Code
            tokens={[
              ['Dash.'], ['on', 's'], ['('], ["'earned'", 's'], [',  ({ amount, reward }) => {});'], '\n',
              ['Dash.'], ['on', 's'], ['('], ["'optin'", 's'], [',   ({ userId }) => {});'], '\n',
              ['Dash.'], ['on', 's'], ['('], ["'optout'", 's'], [',  () => {});'], '\n',
              ['Dash.'], ['on', 's'], ['('], ["'error'", 's'], [',   (err) => {});'],
            ]}
          />
        </div>

        {/* 06 surfaces + 07 theming */}
        <div className="sdk-pad sdk-cols" style={{ padding: '24px 48px 8px' }}>
          <div style={{ flex: 1 }}>
            <Eyebrow>06 — Surfaces</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {SURFACES.map(([name, desc]) => (
                <div key={name} style={{ background: '#FFF7EC', borderRadius: 10, padding: '12px 14px' }}>
                  <b style={{ ...mono, fontSize: 13, color: '#3a3832' }}>{name}</b>
                  <div style={{ fontSize: 13, color: '#56544b' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Eyebrow>07 — White-label theming</Eyebrow>
            <Code
              style={{ fontSize: 12.5, padding: '16px 18px' }}
              tokens={[
                ['Dash.'], ['theme', 's'], ['({'], '\n',
                ['  accent: '], ["'#FFD42A'", 's'], [','], '\n',
                ['  ink:    '], ["'#3A3832'", 's'], [','], '\n',
                ['  radius: '], ['26', 'n'], [','], '\n',
                ['  mascot: '], ['true', 's'], [' '], ['// show dog', 'c'], '\n',
                ['});'],
              ]}
            />
          </div>
        </div>

        {/* 08 webhook + trust */}
        <div className="sdk-pad" style={{ padding: '24px 48px 10px' }}>
          <Eyebrow>08 — Server webhook &amp; trust</Eyebrow>
          <Code
            style={{ marginBottom: 14 }}
            tokens={[
              ['POST /your/webhook  (signed: Dash-Signature)', 'c'], '\n',
              ['{ event: '], ["'reward.banked'", 's'], [', userId, amount, reward, ts }'],
            ]}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TRUST.map((t) => (
              <div
                key={t}
                style={{
                  background: '#fff',
                  border: '1px solid #E7E1D2',
                  borderRadius: 99,
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#3a3832',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* doc footer */}
        <div
          className="sdk-head"
          style={{
            background: '#3a3832',
            padding: '24px 48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-.05em', color: '#FFD42A' }}>dash</div>
            <div style={{ width: 18, height: 6, borderRadius: 4, background: '#FFD42A', marginBottom: 4 }} />
          </div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '.08em', color: '#8a8678' }}>
            SDK v0.1 · docs.dash.assembl.co.nz
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, desc }: { k: string; desc: ReactNode }) {
  return (
    <>
      <div style={{ background: '#FFF7EC', padding: '11px 14px', ...mono, color: '#3a3832' }}>{k}</div>
      <div style={{ background: '#fff', padding: '11px 14px', color: '#56544b' }}>{desc}</div>
    </>
  );
}
