'use client';

import { useState } from 'react';
import {
  EDR_BRAND,
  EDR_TENANT,
  JOURNEY_STEPS,
} from '@/lib/customers/everyday-rewards/config';
import { PhoneFrame } from '@/components/customers/everyday-rewards/PhoneFrame';
import { TrolleyMascot } from '@/components/customers/everyday-rewards/marks';

export function JourneyPlayer() {
  const [step, setStep] = useState(0);
  const s = JOURNEY_STEPS[step];
  const isRedeem = s.id === 'redeem';
  const balance = isRedeem ? EDR_TENANT.voucherThreshold : s.balanceAfter;
  const frame: 'idle' | 'filling' | 'rolling' = isRedeem
    ? 'rolling'
    : s.delta > 0
      ? 'filling'
      : 'idle';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 44, alignItems: 'start' }}>
      {/* stepper */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {JOURNEY_STEPS.map((j, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <button
                key={j.id}
                onClick={() => setStep(i)}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: active ? EDR_BRAND.orangeLight : EDR_BRAND.white,
                  border: active
                    ? `1.5px solid ${EDR_BRAND.orange}`
                    : `1px solid ${EDR_BRAND.greyLight}`,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--edr-body), Roboto, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    background: active || done ? EDR_BRAND.orange : EDR_BRAND.greyLight,
                    color: active || done ? EDR_BRAND.white : EDR_BRAND.greyMid,
                  }}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 15, color: EDR_BRAND.navy }}>
                    {j.label}
                  </span>
                  <span style={{ display: 'block', fontSize: 12.5, color: EDR_BRAND.greyMid, marginTop: 2 }}>
                    {j.source}
                  </span>
                </span>
                {j.delta > 0 ? (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 700,
                      fontSize: 14,
                      color: EDR_BRAND.orange,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    +{j.delta}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: `2px solid ${EDR_BRAND.orange}`,
              background: EDR_BRAND.white,
              color: EDR_BRAND.orange,
              fontWeight: 700,
              fontSize: 14,
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              opacity: step === 0 ? 0.4 : 1,
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => setStep((v) => Math.min(JOURNEY_STEPS.length - 1, v + 1))}
            disabled={step === JOURNEY_STEPS.length - 1}
            style={{
              padding: '12px 22px',
              borderRadius: 12,
              border: 'none',
              background: EDR_BRAND.orange,
              color: EDR_BRAND.white,
              fontWeight: 700,
              fontSize: 14,
              cursor: step === JOURNEY_STEPS.length - 1 ? 'not-allowed' : 'pointer',
              opacity: step === JOURNEY_STEPS.length - 1 ? 0.4 : 1,
              boxShadow: '0 6px 14px rgba(198,81,0,0.3)',
            }}
          >
            Next step →
          </button>
        </div>
      </div>

      {/* phone */}
      <PhoneFrame width={340} balance={isRedeem ? undefined : balance}>
        <div style={{ padding: '8px 18px 20px', minHeight: 460 }}>
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
            step {step + 1} of {JOURNEY_STEPS.length}
          </div>
          <h3
            style={{
              fontFamily: 'var(--edr-display), Georgia, serif',
              fontWeight: 600,
              fontSize: 24,
              color: EDR_BRAND.navy,
              margin: '2px 0 14px',
            }}
          >
            {s.headline}
          </h3>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 14px' }}>
            <TrolleyMascot frame={frame} width={220} />
          </div>

          {s.delta > 0 ? (
            <div
              style={{
                textAlign: 'center',
                marginBottom: 14,
                fontFamily: 'var(--edr-body), Roboto, sans-serif',
                fontWeight: 700,
                fontSize: 26,
                color: EDR_BRAND.orange,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              +{s.delta} points
            </div>
          ) : null}

          <p style={{ fontSize: 14, lineHeight: 1.6, color: EDR_BRAND.charcoal, margin: '0 0 14px' }}>
            {s.body}
          </p>

          {s.id === 'threshold' || isRedeem ? (
            <div style={{ margin: '4px 0 14px' }}>
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
                  {EDR_TENANT.voucherThreshold.toLocaleString('en-NZ')} /{' '}
                  {EDR_TENANT.voucherThreshold.toLocaleString('en-NZ')} pts
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: EDR_BRAND.orangeLight, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: EDR_BRAND.orange }} />
              </div>
            </div>
          ) : null}

          {isRedeem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: EDR_BRAND.orange,
                  color: EDR_BRAND.white,
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: 'center',
                }}
              >
                Redeem ${EDR_TENANT.voucherValueNzd} voucher
              </div>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: EDR_BRAND.white,
                  color: EDR_BRAND.orange,
                  border: `2px solid ${EDR_BRAND.orange}`,
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: 'center',
                }}
              >
                Convert to a travel reward
              </div>
            </div>
          ) : null}
        </div>
      </PhoneFrame>
    </div>
  );
}
