/**
 * AppSlotMock — a live mock of the Everyday Rewards app home screen with
 * assembl's Assembling appearing as a NATIVE PARTNER SLOT beside ASB, and
 * Olive — Woolworths' real AI assistant (agentic upgrade rolling out from
 * July 2026) — untouched in her own slot. Companion, never a replacement.
 *
 * Mostly white like the real EDR app; orange appears as small accents only
 * (the r-leaf badge, the earn pulse). Pure JSX/CSS — no real app screenshots
 * are shipped. Concept demo.
 */

const ORANGE = '#fd6400';
const INK = '#22303c';

export function EdrAppSlotMock() {
  return (
    <div
      style={{
        width: 300,
        borderRadius: 34,
        border: `6px solid ${INK}`,
        background: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 18px 44px rgba(34,48,60,0.25)',
        fontFamily: 'var(--edr-body, Roboto, system-ui), sans-serif',
      }}
    >
      {/* app header — white, orange accent only on the r-leaf */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9AA0A0' }}>
          <span>11:04</span>
          <span>•••</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
          <span
            aria-hidden
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              background: ORANGE,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            r
          </span>
          <span style={{ fontWeight: 700, fontSize: 14, color: INK }}>Everyday Rewards</span>
        </div>
      </div>

      {/* points balance */}
      <div style={{ padding: '12px 12px 0' }}>
        <div
          style={{
            border: '1px solid #EAEAEA',
            borderRadius: 14,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6E71' }}>
              your points
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 2, color: INK }}>
              1,847 <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6E71' }}>pts</span>
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: '#6B6E71', textAlign: 'right' }}>
            153 to your next
            <br />
            $15 reward
          </div>
        </div>
      </div>

      {/* Olive — their assistant, untouched */}
      <div style={{ padding: '10px 12px 0' }}>
        <div
          style={{
            border: '1px solid #EAEAEA',
            borderRadius: 12,
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: '#5C7A54',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            O
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: INK }}>Ask Olive</div>
            <div style={{ fontSize: 10, color: '#6B6E71' }}>Meal plans, swaps, specials</div>
          </div>
        </div>
      </div>

      {/* partner slots — ASB and assembl side by side */}
      <div style={{ padding: '10px 12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9AA0A0', margin: '0 2px 6px' }}>
          partners
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, border: '1px solid #EAEAEA', borderRadius: 12, padding: '10px 10px 9px' }}>
            <div
              aria-hidden
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: '#FFCC00',
                color: INK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              ASB
            </div>
            <div style={{ fontWeight: 700, fontSize: 12, marginTop: 6, color: INK }}>ASB</div>
            <div style={{ fontSize: 10, color: '#6B6E71', marginTop: 2, lineHeight: 1.35 }}>
              Everyday banking rewards
            </div>
          </div>
          <div
            style={{
              flex: 1,
              border: `1px solid ${ORANGE}`,
              borderRadius: 12,
              padding: '10px 10px 9px',
              background: 'rgba(253,100,0,0.05)',
            }}
          >
            <div
              aria-hidden
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: ORANGE,
                color: '#fff',
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
            <div style={{ fontSize: 10, color: '#c65100', marginTop: 2, lineHeight: 1.35 }}>
              Earn in the wait · +12 pts this hour
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
