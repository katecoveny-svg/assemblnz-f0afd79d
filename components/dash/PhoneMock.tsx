/**
 * PhoneMock — a phone frame showing Assembling inside a real-looking NZ-app wait.
 * Slottable: pass the host name, the sponsored line, the reward, and a fill %.
 * Presentational; reuse on Home / How-it-works. See the components brief.
 */
import { DashDog } from './DashDog';

interface PhoneMockProps {
  hostName?: string;
  adLine?: string;
  rewardText?: string;
  fillPct?: number;
}

export function PhoneMock({
  hostName = 'an NZ app',
  adLine = 'Air New Zealand Business — fly the main centres for less.',
  rewardText = '+$0.04 → your KiwiSaver',
  fillPct = 64,
}: PhoneMockProps) {
  return (
    <div
      style={{
        width: 'min(300px, 80vw)',
        background: 'var(--surface)',
        border: '3px solid var(--accent)',
        borderRadius: 36,
        padding: 14,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* status bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--ff-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          padding: '2px 8px 12px',
        }}
      >
        <span>9:41</span>
        <span>{hostName}</span>
      </div>

      {/* the wait screen */}
      <div
        style={{
          background: 'var(--surface-2)',
          borderRadius: 24,
          padding: '26px 18px',
          display: 'grid',
          placeItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ width: 150 }}>
          <DashDog title="Assembling loader" />
        </div>

        {/* progress */}
        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: 999,
            background: 'rgba(58, 56, 50,0.08)',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'block',
              height: '100%',
              width: `${fillPct}%`,
              background: 'var(--hivis)',
            }}
          />
        </div>

        {/* sponsored line */}
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            alignSelf: 'flex-start',
          }}
        >
          Sponsored
        </span>
        <p
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: 12.5,
            lineHeight: 1.45,
            margin: 0,
            color: 'var(--fg)',
          }}
        >
          {adLine}
        </p>
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 12,
            fontWeight: 800,
            padding: '5px 11px',
            borderRadius: 999,
            background: 'var(--surface)',
            border: '2px solid var(--accent)',
          }}
        >
          {rewardText}
        </span>
      </div>
    </div>
  );
}
