'use client';

import { useMemo, useState } from 'react';
import {
  EDR_BRAND,
  ECONOMICS_DEFAULTS,
  computeEconomics,
} from '@/lib/customers/everyday-rewards/config';
import { Card } from '@/components/customers/everyday-rewards/ui';

function nzd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}m`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, color: EDR_BRAND.charcoal, fontWeight: 500 }}>{label}</span>
        <span
          style={{
            fontFamily: 'var(--edr-body), Roboto, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: EDR_BRAND.orange,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: EDR_BRAND.orange }}
      />
    </div>
  );
}

export function EconomicsModel() {
  const [shopperBase, setShopperBase] = useState<number>(ECONOMICS_DEFAULTS.shopperBase);
  const [weeklyActiveShare, setWeeklyActiveShare] = useState<number>(ECONOMICS_DEFAULTS.weeklyActiveShare);
  const [waitMoments, setWaitMoments] = useState<number>(ECONOMICS_DEFAULTS.waitMomentsPerShopperWeek);
  const [fillRate, setFillRate] = useState<number>(ECONOMICS_DEFAULTS.fillRate);
  const [cpm, setCpm] = useState<number>(ECONOMICS_DEFAULTS.cpmMomentNzd);
  const [shopperPct, setShopperPct] = useState<number>(ECONOMICS_DEFAULTS.shopperSharePct);
  const [edrPct, setEdrPct] = useState<number>(ECONOMICS_DEFAULTS.edrSharePct);

  const assemblPct = Math.max(0, 1 - shopperPct - edrPct);

  const r = useMemo(
    () =>
      computeEconomics({
        shopperBase,
        weeklyActiveShare,
        waitMomentsPerShopperWeek: waitMoments,
        fillRate,
        cpmMomentNzd: cpm,
        shopperSharePct: shopperPct,
        edrSharePct: edrPct,
        assemblSharePct: assemblPct,
      }),
    [shopperBase, weeklyActiveShare, waitMoments, fillRate, cpm, shopperPct, edrPct, assemblPct]
  );

  const reset = () => {
    setShopperBase(ECONOMICS_DEFAULTS.shopperBase);
    setWeeklyActiveShare(ECONOMICS_DEFAULTS.weeklyActiveShare);
    setWaitMoments(ECONOMICS_DEFAULTS.waitMomentsPerShopperWeek);
    setFillRate(ECONOMICS_DEFAULTS.fillRate);
    setCpm(ECONOMICS_DEFAULTS.cpmMomentNzd);
    setShopperPct(ECONOMICS_DEFAULTS.shopperSharePct);
    setEdrPct(ECONOMICS_DEFAULTS.edrSharePct);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 28, alignItems: 'start' }}>
      {/* inputs */}
      <Card>
        <div
          style={{
            fontFamily: 'var(--edr-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: EDR_BRAND.greyMid,
            marginBottom: 18,
          }}
        >
          ◊ inputs · drag to model
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Slider
            label="Everyday Rewards member base"
            value={shopperBase}
            min={500_000}
            max={4_000_000}
            step={100_000}
            onChange={setShopperBase}
            format={(v) => `${(v / 1_000_000).toFixed(1)}m`}
          />
          <Slider
            label="Weekly active share"
            value={weeklyActiveShare}
            min={0.2}
            max={0.9}
            step={0.01}
            onChange={setWeeklyActiveShare}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Wait moments per shopper / week"
            value={waitMoments}
            min={2}
            max={20}
            step={1}
            onChange={setWaitMoments}
            format={(v) => `${v}`}
          />
          <Slider
            label="Advertiser fill rate"
            value={fillRate}
            min={0.05}
            max={0.9}
            step={0.01}
            onChange={setFillRate}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Advertiser pays / sponsored moment"
            value={cpm}
            min={0.005}
            max={0.05}
            step={0.001}
            onChange={setCpm}
            format={(v) => `${(v * 100).toFixed(1)}c`}
          />
          <div style={{ height: 1, background: EDR_BRAND.greyLight }} />
          <Slider
            label="Share to shopper (points)"
            value={shopperPct}
            min={0.2}
            max={0.8}
            step={0.01}
            onChange={setShopperPct}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Share to Everyday Rewards"
            value={edrPct}
            min={0.05}
            max={0.6}
            step={0.01}
            onChange={setEdrPct}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <div style={{ fontSize: 12.5, color: EDR_BRAND.greyMid }}>
            assembl share (attribution + fill):{' '}
            <strong style={{ color: EDR_BRAND.charcoal }}>{Math.round(assemblPct * 100)}%</strong>{' '}
            — the remainder.
          </div>
          <button
            onClick={reset}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: 999,
              border: `1px solid ${EDR_BRAND.greyMid}`,
              background: 'transparent',
              color: EDR_BRAND.charcoal,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset to base case
          </button>
        </div>
      </Card>

      {/* outputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card style={{ background: EDR_BRAND.orange, color: EDR_BRAND.white }}>
          <div
            style={{
              fontFamily: 'var(--edr-mono), monospace',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              marginBottom: 8,
            }}
          >
            annual gross attribution revenue
          </div>
          <div
            style={{
              fontFamily: 'var(--edr-display), Georgia, serif',
              fontWeight: 600,
              fontSize: 54,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {nzd(r.grossAnnual)}
          </div>
          <div style={{ fontSize: 13, marginTop: 10, color: 'rgba(255,255,255,0.9)' }}>
            {Math.round(r.sponsoredPerWeek).toLocaleString('en-NZ')} sponsored
            moments / week · {nzd(r.grossWeekly)} weekly
          </div>
        </Card>

        <Card>
          <div
            style={{
              fontFamily: 'var(--edr-mono), monospace',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: EDR_BRAND.greyMid,
              marginBottom: 16,
            }}
          >
            ◊ revenue split · per year
          </div>
          <SplitRow label="To shoppers (points minted)" value={nzd(r.toShopper)} pct={shopperPct} />
          <SplitRow label="To Everyday Rewards" value={nzd(r.toEdr)} pct={edrPct} accent />
          <SplitRow label="To assembl" value={nzd(r.toAssembl)} pct={assemblPct} muted />
          {/* stacked bar */}
          <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', marginTop: 10 }}>
            <span style={{ width: `${shopperPct * 100}%`, background: EDR_BRAND.orangeLight }} />
            <span style={{ width: `${edrPct * 100}%`, background: EDR_BRAND.orange }} />
            <span style={{ width: `${assemblPct * 100}%`, background: EDR_BRAND.navy }} />
          </div>
        </Card>

        <div style={{ fontSize: 12, color: EDR_BRAND.greyMid, lineHeight: 1.6 }}>
          Directional model for discussion only. Inputs are editable assumptions,
          not committed figures. No real Everyday Rewards revenue data is used.
        </div>
      </div>
    </div>
  );
}

function SplitRow({
  label,
  value,
  pct,
  accent,
  muted,
}: {
  label: string;
  value: string;
  pct: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '10px 0',
        borderBottom: `1px dashed ${EDR_BRAND.greyLight}`,
      }}
    >
      <span style={{ fontSize: 14, color: EDR_BRAND.charcoal }}>
        {label} <span style={{ color: EDR_BRAND.greyMid, fontSize: 12 }}>· {Math.round(pct * 100)}%</span>
      </span>
      <span
        style={{
          fontFamily: 'var(--edr-body), Roboto, sans-serif',
          fontWeight: 700,
          fontSize: 20,
          color: accent ? EDR_BRAND.orange : muted ? EDR_BRAND.navy : EDR_BRAND.charcoal,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}
