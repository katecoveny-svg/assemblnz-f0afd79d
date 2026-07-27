'use client';

import { useState } from 'react';

/**
 * The tier × industry playground — ported from Hermes's monetisation-roadmap
 * concept at Kate's direction, with one correction: the demonstrators are
 * generic (a grocer, an airline, a power company, a bank). Real company names
 * as sponsors on assembl's own site assert relationships that don't exist.
 * Every screen is labelled simulated; every partner slot is a placeholder.
 */

const INDUSTRIES = [
  { id: 'grocer', label: 'A grocer', hint: 'the delivery-slot wait' },
  { id: 'airline', label: 'An airline', hint: 'the disruption wait' },
  { id: 'power', label: 'A power company', hint: 'the switch wait' },
  { id: 'bank', label: 'A bank', hint: 'the approval wait' },
] as const;

const TIERS = [
  { id: 'loader', n: '01', label: 'The assembling loader', friction: 'low friction · the wait itself' },
  { id: 'chat', n: '02', label: 'The sponsored chat line', friction: 'medium integration · a co-pilot steps forward' },
  { id: 'jv', n: '03', label: 'The joint-venture UI', friction: 'high utility · a shared surface' },
] as const;

type Ind = (typeof INDUSTRIES)[number]['id'];
type Tier = (typeof TIERS)[number]['id'];

const LOADER: Record<Ind, { title: string; steps: [string, string][]; partner: string }> = {
  grocer: {
    title: 'Your order, being picked',
    steps: [['Aisle 4', 'your usuals, scanned'], ['Substitution', 'one swap — your call'], ['Chilled', 'packed last, coldest']],
    partner: 'partner slot · a recipe using what’s in your trolley',
  },
  airline: {
    title: 'Rebooking options, assembling',
    steps: [['Seats held', 'three candidate flights'], ['Group kept', 'four seats together'], ['Bags', 'transfer confirmed']],
    partner: 'partner slot · lounge access while you decide',
  },
  power: {
    title: 'Your switch, in motion',
    steps: [['Meter read', 'requested from the old retailer'], ['Plan match', 'against your actual usage'], ['Start date', 'confirmed, no overlap']],
    partner: 'partner slot · an off-peak plan for your EV',
  },
  bank: {
    title: 'Your application, being read',
    steps: [['Statements', 'read, sorted into lanes'], ['Serviceability', 'tested at the real rate'], ['Valuation', 'ordered — the diary, not the queue']],
    partner: 'partner slot · an insurer quote for the new home',
  },
};

const CHAT: Record<Ind, { journey: string; copilot: string }> = {
  grocer: {
    journey: 'Your delivery is being picked now — about 25 minutes to the van.',
    copilot: 'Co-pilot: two of tonight’s items pair with a 15-minute recipe. Want it added to the order notes?',
  },
  airline: {
    journey: 'Your 6:40 is cancelled. Three alternatives are being held while you look.',
    copilot: 'Co-pilot: the 8:15 lands in time for your connection — and your car hire can shift automatically. Move both?',
  },
  power: {
    journey: 'Your switch completes Thursday. The final read is booked.',
    copilot: 'Co-pilot: your usage pattern fits a free off-peak hour. Choose the hour once and it applies from day one.',
  },
  bank: {
    journey: 'Your application is with a human assessor — drafted decision by Friday.',
    copilot: 'Co-pilot: a first-home valuation guide is ready for the address you applied with. One tap to read while you wait.',
  },
};

const JV: Record<Ind, { left: string; right: string; rows: [string, string][] }> = {
  grocer: {
    left: 'your grocer', right: 'reward partner',
    rows: [['Redeem', 'points against tonight’s order'], ['Optimise', 'the cheapest equivalent basket'], ['Give', 'round up to a food-rescue charity']],
  },
  airline: {
    left: 'your airline', right: 'travel partner',
    rows: [['Book', 'the hotel beside the new arrival time'], ['Move', 'the car hire with one approval'], ['Earn', 'points for the disruption minutes']],
  },
  power: {
    left: 'your retailer', right: 'energy partner',
    rows: [['Shift', 'the dryer to the free hour'], ['Charge', 'the EV on the night curve'], ['Track', 'the saving against last winter']],
  },
  bank: {
    left: 'your bank', right: 'home partner',
    rows: [['Value', 'the address, updated live'], ['Insure', 'quote held until settlement'], ['Move', 'utilities switched on one screen']],
  },
};

export function TierPlayground() {
  const [ind, setInd] = useState<Ind>('grocer');
  const [tier, setTier] = useState<Tier>('loader');
  const industry = INDUSTRIES.find((i) => i.id === ind)!;

  return (
    <div className="tp">
      <div className="tp-controls">
        <div>
          <span className="mono">01 · pick a demonstrator</span>
          <div className="tp-row">
            {INDUSTRIES.map((i) => (
              <button key={i.id} type="button" className={`tp-chip${i.id === ind ? ' on' : ''}`} onClick={() => setInd(i.id)}>
                {i.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mono">02 · pick a tier</span>
          <div className="tp-row">
            {TIERS.map((t) => (
              <button key={t.id} type="button" className={`tp-chip${t.id === tier ? ' on' : ''}`} onClick={() => setTier(t.id)}>
                {t.n} · {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tp-stage" aria-live="polite">
        <div className="tp-stage-head">
          <b>{industry.label}</b>
          <span>{industry.hint} · {TIERS.find((t) => t.id === tier)!.friction}</span>
        </div>

        {tier === 'loader' && (
          <div className="tp-loader">
            <b>{LOADER[ind].title}</b>
            {LOADER[ind].steps.map(([a, b]) => (
              <div key={a} className="tp-step"><i /><span><em>{a}</em> — {b}</span></div>
            ))}
            <div className="tp-partner">{LOADER[ind].partner}</div>
          </div>
        )}

        {tier === 'chat' && (
          <div className="tp-chat">
            <div className="tp-bubble">{CHAT[ind].journey}</div>
            <div className="tp-bubble copilot">
              {CHAT[ind].copilot}
              <i>sponsored co-pilot · labelled, skippable, never pretends to be the journey</i>
            </div>
          </div>
        )}

        {tier === 'jv' && (
          <div className="tp-jv">
            <div className="tp-jv-head"><span>{JV[ind].left}</span><i>×</i><span>{JV[ind].right}</span></div>
            {JV[ind].rows.map(([a, b]) => (
              <div key={a} className="tp-jv-row"><b>{a}</b><span>{b}</span></div>
            ))}
            <div className="tp-partner">every action above still ends in a human approval</div>
          </div>
        )}
      </div>

      <p className="tp-fine">
        Simulated screens. Partner slots are placeholders — no partnership is claimed, and in a
        live journey every sponsored element is labelled as one.
      </p>
    </div>
  );
}
