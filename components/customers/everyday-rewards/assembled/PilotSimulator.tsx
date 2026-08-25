'use client';

import { useState } from 'react';
import { Card, Eyebrow, DisplayHeading, OrangeButton } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

type PilotConfig = {
  eligibleCustomers: number;
  journeyType: string;
  weeks: number;
  autonomy: string;
  dataSource: string;
  approval: string;
  primaryMeasure: string;
};

const DEFAULTS: PilotConfig = {
  eligibleCustomers: 500,
  journeyType: 'Budget rescue',
  weeks: 6,
  autonomy: 'Recommend only',
  dataSource: 'Sandbox catalogue',
  approval: 'Customer required',
  primaryMeasure: 'Basket completion',
};

const OPTIONS = {
  journeyType: ['Budget rescue', 'Weekly shop assembly', 'Dietary-specific shop'],
  autonomy: ['Recommend only', 'Act with approval'],
  dataSource: ['Sandbox catalogue', 'Read-only catalogue feed'],
  approval: ['Customer required', 'Staff required'],
  primaryMeasure: ['Basket completion', 'Approved substitution rate', 'Repeat use within 30 days'],
};

export function PilotSimulator() {
  const [cfg, setCfg] = useState<PilotConfig>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof PilotConfig>(k: K, v: PilotConfig[K]) => {
    setCfg((c) => ({ ...c, [k]: v }));
    setSaved(false);
  };

  return (
    <div>
      <Eyebrow>The smallest credible pilot</Eyebrow>
      <DisplayHeading size={30}>Configure a pilot, not a contact form</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 24px' }}>
        Set the scope you would actually test. assembl drafts the pilot architecture around it —
        scope, authority, measures and risks — ready to take into a real conversation.
      </p>

      <div className={styles.grid2}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label className={styles.field}>
              Eligible customers
              <input
                type="number"
                min={100}
                max={5000}
                step={100}
                value={cfg.eligibleCustomers}
                onChange={(e) => set('eligibleCustomers', Number(e.target.value))}
              />
            </label>
            <label className={styles.field}>
              Duration (weeks)
              <input
                type="number"
                min={2}
                max={12}
                value={cfg.weeks}
                onChange={(e) => set('weeks', Number(e.target.value))}
              />
            </label>
            {(Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]).map((k) => (
              <label key={k} className={styles.field} style={{ gridColumn: k === 'journeyType' || k === 'primaryMeasure' ? '1 / -1' : 'auto' }}>
                {labelFor(k)}
                <select value={cfg[k]} onChange={(e) => set(k, e.target.value)}>
                  {OPTIONS[k].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <OrangeButton onClick={() => setSaved(true)}>Save this pilot architecture</OrangeButton>
            {saved ? (
              <span style={{ marginLeft: 14, fontSize: 13, color: '#2e7d32' }}>
                Draft saved — nothing sent. Yours to review.
              </span>
            ) : null}
          </div>
        </Card>

        <Card style={{ background: '#fbfaf7' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY, marginBottom: 12 }}>
            Draft pilot architecture
          </div>
          <Line label="Scope" value={`${cfg.eligibleCustomers.toLocaleString('en-NZ')} customers · ${cfg.journeyType.toLowerCase()} · ${cfg.weeks} weeks`} />
          <Line label="Agent authority" value={cfg.autonomy} />
          <Line label="Data source" value={cfg.dataSource} />
          <Line label="Approval" value={cfg.approval} />
          <Line label="Primary measure" value={cfg.primaryMeasure} />
          <Line label="Required integrations" value={cfg.dataSource.includes('feed') ? 'Read-only catalogue + availability' : 'None — sandbox only'} />
          <Line label="Operating risks" value="Substitution acceptance, budget-edge cases, escalation volume" />
          <Line label="Hypothesis to validate" value={hypothesis(cfg)} last />
        </Card>
      </div>
    </div>
  );
}

function hypothesis(c: PilotConfig): string {
  return `Assembling the shop lifts ${c.primaryMeasure.toLowerCase()} for ${c.journeyType.toLowerCase()} over ${c.weeks} weeks, with the customer approving every prepared basket.`;
}

function labelFor(k: string): string {
  return {
    journeyType: 'Journey type',
    autonomy: 'Autonomy',
    dataSource: 'Data source',
    approval: 'Approval',
    primaryMeasure: 'Primary measure',
  }[k] ?? k;
}

function Line({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: last ? 'none' : '1px solid rgba(34,48,60,0.08)' }}>
      <div style={{ fontSize: 12, color: GREY }}>{label}</div>
      <div style={{ fontSize: 14, color: NAVY, marginTop: 2, lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}
