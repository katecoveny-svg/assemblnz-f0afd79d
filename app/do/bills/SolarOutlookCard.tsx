'use client';

import { useState } from 'react';
import { SOLAR_ASSUMPTIONS, SOLAR_COST_PATHS, solarOutlook } from '@/apps/do/finance/solar';
import styles from './bills-workspace.module.css';

const nz = (value: number) => 'NZ$' + Math.round(value).toLocaleString('en-NZ');
/** Whether solar is worth a quote for this electricity spend. An estimate from stated assumptions, never a quote. */
export function SolarOutlookCard({ monthlyCents }: { monthlyCents: number }) {
  const [region, setRegion] = useState('');
  const [kwh, setKwh] = useState('');
  const annualKwh = /^\d{3,6}$/.test(kwh.trim()) ? Number(kwh) : null;
  const outlook = solarOutlook({ monthlyCents, region: region || null, annualKwh });
  return <details className={styles.details}>
    <summary>Consider solar?</summary>
    <p>{outlook.worthAQuote ? 'On this spend, solar is worth a quote.' : 'On this spend, solar is a marginal case; a quote may still be worth it if the roof is good and daytime use is high.'} The figures below are an estimate from stated assumptions, not a quote or a design.</p>
    <div className={styles.form}>
      <label>Region<select value={region} onChange={event => setRegion(event.target.value)}><option value="">Not stated (national default)</option>{Object.keys(SOLAR_ASSUMPTIONS.yieldPerKw).map(name => <option key={name}>{name}</option>)}</select></label>
      <label>Yearly use from your bills, kWh (optional)<input inputMode="numeric" value={kwh} placeholder={`About ${outlook.annualKwh.toLocaleString('en-NZ')} estimated from spend`} onChange={event => setKwh(event.target.value)} /></label>
    </div>
    <dl className={styles.solarFacts}>
      <div><dt>System</dt><dd>{outlook.systemKw} kW</dd></div>
      <div><dt>Installed cost</dt><dd>{nz(outlook.capex.low)} to {nz(outlook.capex.high)}</dd></div>
      <div><dt>Possible saving a year</dt><dd>{nz(outlook.annualSaving.low)} to {nz(outlook.annualSaving.high)}</dd></div>
      <div><dt>Payback</dt><dd>{outlook.paybackYears ? `${outlook.paybackYears.low} to ${outlook.paybackYears.high} years` : 'Not established'}</dd></div>
    </dl>
    <ul>{outlook.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
    <p className={styles.small}><strong>Doing it cost-effectively.</strong></p>
    <ul>{SOLAR_COST_PATHS.map(path => <li key={path.title}><strong>{path.title}.</strong> {path.note} <a href={path.url} target="_blank" rel="noopener noreferrer">{new URL(path.url).hostname} ↗</a></li>)}</ul>
    <p className={styles.evidenceLine}>assumptions {outlook.version} · {outlook.kwhSource === 'bills' ? 'usage from your bills' : 'usage estimated from spend'} · {outlook.assumptions.join(' · ')}</p>
  </details>;
}
