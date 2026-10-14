'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { DoPresence } from '@/components/do/DoPresence';
import { DoProductFrame } from '@/components/do/DoProductFrame';
import { FUEL_LABEL, FUEL_TYPES, fuelAdvice, fuelObservation, fuelTank, fuelWatchAsk, type FuelObservation, type FuelType } from '@/lib/do/fuel/watch';
import type { FuelPrices } from '@/lib/do/fuel/server';
import styles from './fuel.module.css';

const REGIONS = ['Auckland', 'Northland', 'Waikato', 'Bay of Plenty', 'Gisborne', 'Hawkes Bay', 'Taranaki', 'Manawatu-Whanganui', 'Wellington', 'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury', 'Otago', 'Southland'];
const ACTION: Record<ReturnType<typeof fuelAdvice>['action'], string> = { 'fill-now': 'Fill up today', 'top-up': 'Top up now', wait: 'Wait', 'no-price': 'No price yet' };
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' }).format(new Date());

/**
 * Fuel watch: the weekly national price from MBIE with its date, the pump prices the person
 * records, their own tank, and a plain answer on whether to fill up today. Everything stays in
 * this open page; nothing is bought, tracked or sent.
 */
export function FuelWatch() {
  const [fuel, setFuel] = useState<FuelType>('91');
  const [region, setRegion] = useState('');
  const [tankLitres, setTankLitres] = useState('50');
  const [litresLeft, setLitresLeft] = useState('20');
  const [weeklyLitres, setWeeklyLitres] = useState('30');
  const [target, setTarget] = useState('');
  const [weekly, setWeekly] = useState<FuelPrices | null | 'unavailable'>(null);
  const [seen, setSeen] = useState<FuelObservation[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    fetch('/api/do/fuel').then(async response => { if (!active) return; setWeekly(response.ok ? await response.json() : 'unavailable'); }).catch(() => { if (active) setWeekly('unavailable'); });
    return () => { active = false; };
  }, []);
  const tank = useMemo(() => {
    const parsed = fuelTank.safeParse({ fuel, tankLitres: Number(tankLitres), litresLeft: Number(litresLeft), weeklyLitres: Number(weeklyLitres), targetPrice: target.trim() ? Number(target) : null });
    return parsed.success ? parsed.data : null;
  }, [fuel, tankLitres, litresLeft, weeklyLitres, target]);
  const observations = useMemo<FuelObservation[]>(() => {
    const rows = seen.filter(row => row.label.endsWith(FUEL_LABEL[fuel]));
    if (weekly && weekly !== 'unavailable') rows.push({ date: weekly.publishedDate, price: weekly.prices[fuel], source: weekly.source, label: weekly.source === 'mbie_weekly' ? 'MBIE weekly national average' : 'MBIE fallback figure, not this week' });
    return rows;
  }, [seen, weekly, fuel]);
  const advice = useMemo(() => { try { return tank ? fuelAdvice(tank, observations) : null; } catch { return null; } }, [tank, observations]);
  function addSeen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = fuelObservation.safeParse({ date: String(data.get('date') || ''), price: Number(data.get('price')), source: 'station', label: `Pump price I saw · ${FUEL_LABEL[fuel]}` });
    if (!parsed.success || parsed.data.date > today()) { setError('Enter a price between $0.50 and $10.00 a litre and a date that is not in the future.'); return; }
    if (seen.length >= 60) { setError('Keep up to 60 pump prices in this page.'); return; }
    setError(''); setSeen(rows => [...rows, parsed.data]); event.currentTarget.reset();
  }
  const ask = fuelWatchAsk({ fuel, targetPrice: tank?.targetPrice ?? null }, region || null);
  return <DoProductFrame product="fuel">
    <div className={styles.page}>
      <section className={styles.hero}>
        <div><p className={styles.kicker}>DO FUEL WATCH</p><h1>Fill up, or wait?</h1><p>The weekly national price with its date, the pump prices you record, and your own tank. DO says whether today is a good day to fill, and why.</p></div>
        <DoPresence className={styles.presence} working={weekly === null} />
      </section>

      <section className={styles.answer} aria-live="polite">
        <p className={styles.kicker}>TODAY</p>
        <h2>{advice ? ACTION[advice.action] : 'Check the figures'}</h2>
        <p>{advice ? advice.reason : 'Enter a tank size, litres left and weekly use between the limits to get an answer.'}</p>
        {advice && advice.current && <dl className={styles.facts}>
          <div><dt>Price used</dt><dd>${advice.current.price.toFixed(2)}/L</dd></div>
          <div><dt>Recent median</dt><dd>{advice.recentMedian === null ? 'Not enough history' : `$${advice.recentMedian.toFixed(2)}/L`}</dd></div>
          <div><dt>Trend</dt><dd>{advice.trend}</dd></div>
          <div><dt>Fuel left</dt><dd>about {advice.daysOfFuel} days</dd></div>
          <div><dt>Full fill today</dt><dd>{advice.fillCost === null ? '—' : `$${advice.fillCost.toFixed(2)}`}</dd></div>
          <div><dt>A week of driving</dt><dd>{advice.weeklyCost === null ? '—' : `$${advice.weeklyCost.toFixed(2)}`}</dd></div>
        </dl>}
        <p className={styles.evidence}>{weekly === null ? 'checking the weekly national price…' : weekly === 'unavailable' ? 'weekly national price unavailable · record a pump price below' : `${weekly.source === 'mbie_weekly' ? 'MBIE weekly national average' : 'MBIE fallback figure, not this week'} · published ${weekly.publishedDate} · 91 $${weekly.prices['91'].toFixed(2)} · 95 $${weekly.prices['95'].toFixed(2)} · diesel $${weekly.prices.diesel.toFixed(2)}`}</p>
      </section>

      <div className={styles.columns}>
        <section className={styles.panel} aria-labelledby="tank-title">
          <p className={styles.kicker}>YOUR TANK · THIS PAGE ONLY</p><h2 id="tank-title">Your car</h2>
          <div className={styles.form}>
            <label>Fuel<select value={fuel} onChange={event => setFuel(event.target.value as FuelType)}>{FUEL_TYPES.map(value => <option key={value} value={value}>{FUEL_LABEL[value]}</option>)}</select></label>
            <label>Region, for the watch request only<select value={region} onChange={event => setRegion(event.target.value)}><option value="">Not stated</option>{REGIONS.map(value => <option key={value}>{value}</option>)}</select></label>
            <label>Tank size (litres)<input inputMode="decimal" value={tankLitres} onChange={event => setTankLitres(event.target.value)} /></label>
            <label>Litres left, from the gauge<input inputMode="decimal" value={litresLeft} onChange={event => setLitresLeft(event.target.value)} /></label>
            <label>Litres used in a typical week<input inputMode="decimal" value={weeklyLitres} onChange={event => setWeeklyLitres(event.target.value)} /></label>
            <label>Price you would be happy to pay ($/L, optional)<input inputMode="decimal" value={target} placeholder="Leave blank to use the recent median" onChange={event => setTarget(event.target.value)} /></label>
          </div>
          <p className={styles.small}>Nothing here is saved or sent. No number plate, address or location is asked for.</p>
        </section>

        <section className={styles.panel} aria-labelledby="seen-title">
          <p className={styles.kicker}>PUMP PRICES YOU SAW</p><h2 id="seen-title">Station prices</h2>
          <p className={styles.small}>The national figure is an average. The price that matters is the one on the sign. Record it when you drive past and DO uses it ahead of the average.</p>
          <form className={styles.form} onSubmit={addSeen}>
            <label>Price for {FUEL_LABEL[fuel]} ($/L)<input name="price" inputMode="decimal" placeholder="2.89" required /></label>
            <label>Date<input name="date" type="date" defaultValue={today()} max={today()} required /></label>
            <button className={styles.primary}>Add this price</button>
          </form>
          <p className={styles.feedback} role={error ? 'alert' : 'status'}>{error}</p>
          {observations.length > 0 && <ul className={styles.list}>{[...observations].reverse().map((row, index) => <li key={row.date + row.label + index}><span>{row.date}</span><strong>${row.price.toFixed(2)}/L</strong><span className={styles.small}>{row.label}</span></li>)}</ul>}
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="watch-title">
        <p className={styles.kicker}>EVERY MORNING</p><h2 id="watch-title">Ask DO to watch fuel</h2>
        <p>DO shows you this request before anything is kept, and you set the schedule in Personal DO. It prepares a short note each morning; it never buys.</p>
        <blockquote className={styles.quote}>{ask}</blockquote>
        <div className={styles.buttons}><Link className={styles.linkButton} href={'/do/ask?' + new URLSearchParams({ q: ask, title: 'Watch fuel prices' }).toString()} prefetch={false}>Ask DO to watch fuel</Link><Link className={styles.linkButton} href="/do/bills">Back to Bills</Link></div>
        <p className={styles.small}>Station-level prices across the country are not read automatically yet: the crowd-sourced apps have no public feed, and retailer sites each differ. That is the next adapter, labelled when it exists.</p>
      </section>
    </div>
  </DoProductFrame>;
}
