'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EDR_BRAND,
  EDR_TENANT,
  WAIT_MOMENTS,
  type WaitMoment,
} from '@/lib/customers/everyday-rewards/config';
import { PhoneFrame } from '@/components/customers/everyday-rewards/PhoneFrame';
import { TrolleyMascot } from '@/components/customers/everyday-rewards/marks';

const START_BALANCE = 1517;
type Phase = 'idle' | 'spinner' | 'earn';

function Spinner() {
  return (
    <span
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: `4px solid ${EDR_BRAND.orangeLight}`,
        borderTopColor: EDR_BRAND.orange,
        display: 'inline-block',
        animation: 'edrspin 0.8s linear infinite',
      }}
    />
  );
}

export function WaitStatesDemo() {
  const [activeId, setActiveId] = useState<string>(WAIT_MOMENTS[0].id);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sessionPoints, setSessionPoints] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showReceipt, setShowReceipt] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const active: WaitMoment =
    WAIT_MOMENTS.find((m) => m.id === activeId) ?? WAIT_MOMENTS[0];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback((moment: WaitMoment) => {
    clearTimers();
    setActiveId(moment.id);
    setShowReceipt(false);
    setPhase('spinner');
    // Compress the real wait into a demo-friendly ~1.4s.
    timers.current.push(
      setTimeout(() => {
        setPhase('earn');
        setSessionPoints((p) => p + moment.pointsEarned);
        setVisited((prev) => {
          const next = new Set(prev);
          next.add(moment.id);
          return next;
        });
      }, 1400)
    );
  }, []);

  useEffect(() => () => clearTimers(), []);

  const allVisited = visited.size === WAIT_MOMENTS.length;
  const balance = START_BALANCE + sessionPoints;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 44, alignItems: 'start' }}>
      <style>{`@keyframes edrspin{to{transform:rotate(360deg)}}
        @keyframes edrslide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* selectors + tally */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 18px',
            borderRadius: 16,
            background: EDR_BRAND.navy,
            color: EDR_BRAND.white,
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--edr-mono), monospace',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              session points · this visit
            </div>
            <div
              style={{
                fontFamily: 'var(--edr-body), Roboto, sans-serif',
                fontWeight: 700,
                fontSize: 30,
                color: EDR_BRAND.canary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              +{sessionPoints}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--edr-mono), monospace',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              moments seen
            </div>
            <div
              style={{
                fontFamily: 'var(--edr-body), Roboto, sans-serif',
                fontWeight: 700,
                fontSize: 30,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {visited.size}/{WAIT_MOMENTS.length}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {WAIT_MOMENTS.map((m) => {
            const isActive = m.id === activeId;
            const seen = visited.has(m.id);
            return (
              <button
                key={m.id}
                onClick={() => play(m)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: isActive ? EDR_BRAND.orangeLight : EDR_BRAND.white,
                  border: isActive
                    ? `1.5px solid ${EDR_BRAND.orange}`
                    : `1px solid ${EDR_BRAND.greyLight}`,
                  transition: 'border 120ms, background 120ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: 'var(--edr-mono), monospace',
                      fontSize: 12,
                      color: EDR_BRAND.greyMid,
                    }}
                  >
                    {String(m.index).padStart(2, '0')}
                  </span>
                  {seen ? (
                    <span
                      style={{
                        fontFamily: 'var(--edr-mono), monospace',
                        fontSize: 12,
                        color: EDR_BRAND.successGreen,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      ✓ +{m.pointsEarned}
                    </span>
                  ) : null}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: EDR_BRAND.navy }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: EDR_BRAND.greyMid, marginTop: 2 }}>
                  {m.screen} · ~{m.waitSeconds}s
                </div>
              </button>
            );
          })}
        </div>

        {allVisited ? (
          <button
            onClick={() => setShowReceipt(true)}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: EDR_BRAND.orange,
              color: EDR_BRAND.white,
              fontWeight: 700,
              fontSize: 15,
              boxShadow: '0 6px 14px rgba(198,81,0,0.3)',
            }}
          >
            View the Mana Receipt →
          </button>
        ) : (
          <p style={{ marginTop: 14, fontSize: 12.5, color: EDR_BRAND.greyMid }}>
            Tap each moment to see the earn interaction. Once you’ve seen all six,
            the Mana Receipt unlocks.
          </p>
        )}
      </div>

      {/* phone */}
      <PhoneFrame width={340} balance={balance}>
        {showReceipt ? (
          <ReceiptView sessionPoints={sessionPoints} balance={balance} visited={visited} />
        ) : (
          <div style={{ padding: '8px 18px 18px', minHeight: 440 }}>
            <div
              style={{
                fontFamily: 'var(--edr-mono), monospace',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: EDR_BRAND.greyMid,
                marginBottom: 4,
              }}
            >
              {active.screen}
            </div>
            <h3
              style={{
                fontFamily: 'var(--edr-display), Georgia, serif',
                fontWeight: 600,
                fontSize: 21,
                color: EDR_BRAND.navy,
                margin: '2px 0 18px',
              }}
            >
              {active.label}
            </h3>

            {phase === 'idle' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  padding: '40px 0',
                  textAlign: 'center',
                }}
              >
                <TrolleyMascot frame="idle" width={200} />
                <p style={{ fontSize: 13.5, color: EDR_BRAND.greyMid, maxWidth: 220 }}>
                  {active.todayState}. Tap the moment to play it.
                </p>
              </div>
            ) : null}

            {phase === 'spinner' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                  padding: '44px 0',
                  textAlign: 'center',
                }}
              >
                <Spinner />
                <div style={{ fontWeight: 500, fontSize: 15, color: EDR_BRAND.charcoal }}>
                  {active.todayState}…
                </div>
                <div
                  style={{
                    fontFamily: 'var(--edr-mono), monospace',
                    fontSize: 12,
                    color: EDR_BRAND.greyMid,
                    letterSpacing: '0.08em',
                  }}
                >
                  a real wait · ~{active.waitSeconds}s
                </div>
              </div>
            ) : null}

            {phase === 'earn' ? (
              <div style={{ animation: 'edrslide 320ms ease-out' }}>
                <div
                  style={{
                    background: EDR_BRAND.orange,
                    borderRadius: 18,
                    padding: '20px 18px',
                    color: EDR_BRAND.white,
                    textAlign: 'center',
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--edr-mono), monospace',
                      fontSize: 12,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.85)',
                      marginBottom: 8,
                    }}
                  >
                    ◊ sponsored earn moment
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 30, fontVariantNumeric: 'tabular-nums' }}>
                    +{active.pointsEarned} points
                  </div>
                  <TrolleyMascot frame="filling" width={210} />
                  <p style={{ fontSize: 13, lineHeight: 1.45, margin: '10px 6px 0', color: 'rgba(255,255,255,0.94)' }}>
                    {active.earnCopy}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    background: EDR_BRAND.orangeLight,
                    borderRadius: 12,
                    fontSize: 12.5,
                    color: EDR_BRAND.charcoal,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: EDR_BRAND.orange,
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    Earned via{' '}
                    <strong
                      style={{
                        fontFamily: 'var(--edr-display), Georgia, serif',
                        fontWeight: 600,
                        color: EDR_BRAND.navy,
                      }}
                    >
                      assembl
                    </strong>{' '}
                    · attributed to {active.sponsor} · same voucher rail
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </PhoneFrame>
    </div>
  );
}

function ReceiptView({
  sessionPoints,
  balance,
  visited,
}: {
  sessionPoints: number;
  balance: number;
  visited: Set<string>;
}) {
  const seen = WAIT_MOMENTS.filter((m) => visited.has(m.id));
  return (
    <div style={{ padding: '8px 18px 18px' }}>
      <div
        style={{
          background: EDR_BRAND.orange,
          margin: '0 -18px 16px',
          padding: '20px 18px 22px',
          color: EDR_BRAND.white,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--edr-mono), monospace',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 6,
          }}
        >
          ◊ mana receipt
        </div>
        <div style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontWeight: 600, fontSize: 24 }}>
          Your wait moments,
          <br />
          <span style={{ fontStyle: 'italic', color: EDR_BRAND.canary }}>fully itemised</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {seen.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13.5,
              paddingBottom: 8,
              borderBottom: `1px dashed ${EDR_BRAND.greyLight}`,
            }}
          >
            <span style={{ color: EDR_BRAND.charcoal }}>
              {m.label}
              <span style={{ color: EDR_BRAND.greyMid, fontSize: 12 }}> · {m.sponsor}</span>
            </span>
            <span style={{ fontWeight: 700, color: EDR_BRAND.orange, fontVariantNumeric: 'tabular-nums' }}>
              +{m.pointsEarned}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          padding: '12px 0',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--edr-mono), monospace',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: EDR_BRAND.orange,
          }}
        >
          earned via assembl
        </span>
        <span
          style={{
            fontFamily: 'var(--edr-display), Georgia, serif',
            fontWeight: 600,
            fontSize: 30,
            color: EDR_BRAND.orange,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          +{sessionPoints}
        </span>
      </div>

      <div style={{ marginTop: 6 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12.5,
            color: EDR_BRAND.charcoal,
            marginBottom: 6,
          }}
        >
          <span>Voucher progress</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {balance.toLocaleString('en-NZ')} / {EDR_TENANT.voucherThreshold.toLocaleString('en-NZ')} pts
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: EDR_BRAND.orangeLight, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (balance / EDR_TENANT.voucherThreshold) * 100)}%`,
              background: EDR_BRAND.orange,
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '12px 14px',
          borderRadius: 12,
          background: EDR_BRAND.greyLight,
          fontSize: 12,
          lineHeight: 1.5,
          color: EDR_BRAND.greyMid,
        }}
      >
        Every earn moment is signed and auditable. No live points are minted —
        this is a concept demonstration.
      </div>
    </div>
  );
}
