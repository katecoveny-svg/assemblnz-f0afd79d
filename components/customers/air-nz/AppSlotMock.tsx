/**
 * AppSlotMock — a live mock of the Air New Zealand app home screen with
 * Assembling appearing as a NATIVE SLOT beside Oscar, Air NZ's real in-app
 * virtual assistant (launched 2017 — airnewzealand.co.nz/oscar-chatbot-
 * virtual-assistant). Companion slot, never a replacement.
 *
 * Pure JSX/CSS phone frame (no screenshots of the real app are shipped).
 * Concept demo — this is what the slot WOULD look like inside their UI.
 */

const TEAL = '#00B0B9';
const TEAL_DEEP = '#06242C';
const INK = '#1A1918';

const WAIT_ROWS = [
  { at: '04:52 · booking', label: 'Seat confirmed', earn: '+A$0.20' },
  { at: '06:10 · check-in', label: 'Boarding pass ready', earn: '+A$0.12' },
  { at: '07:04 · gate 22', label: 'Boarding call wait', earn: '+A$0.60' },
];

export function AirNzAppSlotMock() {
  return (
    <div
      style={{
        width: 300,
        borderRadius: 34,
        border: `6px solid ${INK}`,
        background: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 18px 44px rgba(6,36,44,0.35)',
        fontFamily: 'var(--airnz-body, system-ui), sans-serif',
      }}
    >
      {/* app header */}
      <div style={{ background: TEAL_DEEP, color: '#fff', padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.75 }}>
          <span>11:04</span>
          <span>•••</span>
        </div>
        <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>
          Air New Zealand
        </div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Kia ora, Alex</div>
      </div>

      {/* boarding card */}
      <div style={{ padding: '12px 12px 0' }}>
        <div
          style={{
            border: '1px solid #E4E6E6',
            borderRadius: 14,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6E71' }}>
              today · NZ 645
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2, color: INK }}>WLG → ZQN</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#3E3C36' }}>
            boards 10:05
            <br />
            seat 14C
          </div>
        </div>
      </div>

      {/* the two companion slots — Oscar (theirs) + Assembling (ours) */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px 0' }}>
        <div
          style={{
            flex: 1,
            border: '1px solid #E4E6E6',
            borderRadius: 12,
            padding: '10px 10px 9px',
          }}
        >
          <div
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: TEAL,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            O
          </div>
          <div style={{ fontWeight: 700, fontSize: 12, marginTop: 6, color: INK }}>Oscar</div>
          <div style={{ fontSize: 10, color: '#6B6E71', marginTop: 2, lineHeight: 1.35 }}>
            Ask a travel question
          </div>
        </div>
        <div
          style={{
            flex: 1,
            border: `1px solid ${TEAL}`,
            borderRadius: 12,
            padding: '10px 10px 9px',
            background: 'rgba(0,176,185,0.06)',
          }}
        >
          <div
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: '#F5C64B',
              color: INK,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            a
          </div>
          <div style={{ fontWeight: 700, fontSize: 12, marginTop: 6, color: INK }}>Assembling</div>
          <div style={{ fontSize: 10, color: '#046A70', marginTop: 2, lineHeight: 1.35 }}>
            Earning in the wait · +A$1.20 today
          </div>
        </div>
      </div>

      {/* wait-state earn rows */}
      <div style={{ padding: '10px 12px 14px' }}>
        {WAIT_ROWS.map((r) => (
          <div
            key={r.at}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '7px 2px',
              borderBottom: '1px solid #F0F1F1',
            }}
          >
            <div>
              <div style={{ fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9AA0A0' }}>
                {r.at}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: INK, marginTop: 1 }}>{r.label}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#046A70' }}>{r.earn}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 9 }}>
          <span style={{ fontSize: 10.5, color: '#6B6E71' }}>Total earned today</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#046A70' }}>+A$4.20</span>
        </div>
      </div>
    </div>
  );
}
