'use client';

import Link from 'next/link';
import { useState } from 'react';
import { canHunt, compareOffers, offerBook, researchHref, watchHref, OFFER_FRESH_DAYS, type OfferBook, type OfferComparison } from '@/apps/do/finance/offers';
import { SERVICE_LABEL, yearlyServiceTotals, type HouseholdService } from '@/apps/do/finance/services';
import { moneyText } from '@/apps/do/finance/model';
import { SolarOutlookCard } from './SolarOutlookCard';
import styles from './bills-workspace.module.css';

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Pacific/Auckland' }).format(new Date(value));
}
const CADENCE: Record<HouseholdService['cadence'], string> = { weekly: 'paid weekly', fortnightly: 'paid fortnightly', monthly: 'paid monthly', uncertain: 'irregular timing' };
type Hunt = { status: 'idle' } | { status: 'busy' } | { status: 'done'; book: OfferBook; rows: OfferComparison[] } | { status: 'error'; message: string };

/**
 * What the household appears to pay, by service, and a hunt for cheaper public offers.
 * Detection is a suggestion to confirm against the bill. Offers are dated advertised prices
 * with a source, never a quote or a promised saving. Nothing switches, cancels or signs.
 */
export function WhatYouPay({ services, demo, busy }: { services: HouseholdService[]; demo: boolean; busy: boolean }) {
  const [hunts, setHunts] = useState<Record<string, Hunt>>({});
  const [threshold, setThreshold] = useState('5');
  const totals = yearlyServiceTotals(services);
  const thresholdCents = Math.round(Math.max(0, Math.min(10000, Number(threshold) || 0)) * 100);
  async function hunt(service: HouseholdService) {
    setHunts(current => ({ ...current, [service.id]: { status: 'busy' } }));
    try {
      const response = await fetch('/api/do/bills/offers?category=' + encodeURIComponent(service.category));
      if (!response.ok) throw new Error('Offers are unavailable right now.');
      const book = offerBook.parse(await response.json());
      setHunts(current => ({ ...current, [service.id]: { status: 'done', book, rows: compareOffers(service, book, thresholdCents) } }));
    } catch (cause) {
      setHunts(current => ({ ...current, [service.id]: { status: 'error', message: cause instanceof Error ? cause.message : 'Offers could not be checked.' } }));
    }
  }
  return <section className={styles.payPanel} aria-labelledby="pay-title">
    <div className={styles.sectionHead}>
      <div><p className={styles.kicker}>00 · KNOW</p><h2 id="pay-title">What you pay</h2></div>
      <label className={styles.threshold}>Worth my time from<span><input inputMode="decimal" aria-label="Minimum monthly difference in NZD" value={threshold} maxLength={6} onChange={event => setThreshold(event.target.value)} /> a month</span></label>
    </div>
    <p>{demo ? 'Fictional services, detected from the example payments.' : 'Detected from the recurring payments in your records.'} Provider names are matched from public statement wording; confirm the plan against the actual bill before acting.</p>
    {services.length === 0 ? <div className={styles.empty}>No service detected yet. Three payments to the same power, broadband, mobile, insurance or streaming provider establish one.</div> : <>
      <p className={styles.payTotal}>
        <strong>{totals.totals.length ? totals.totals.map(moneyText).join(' + ') : 'Not established'}</strong>
        <span className={styles.small}>a year across {services.length - totals.uncertain} {services.length - totals.uncertain === 1 ? 'service' : 'services'} with a known rhythm{totals.uncertain ? ` · ${totals.uncertain} with irregular timing not counted` : ''}</span>
      </p>
      <div className={styles.payGrid}>{services.map(service => {
        const state = hunts[service.id] || { status: 'idle' };
        const research = researchHref(service);
        return <article key={service.id} className={styles.payCard}>
          <p className={styles.kicker}>{SERVICE_LABEL[service.category].toUpperCase()}{service.confidence === 'category-words' ? ' · PROVIDER NOT MATCHED' : ''}</p>
          <h3>{service.provider}</h3>
          <p className={styles.payAmount}><strong>{service.monthlyEquivalent ? moneyText(service.monthlyEquivalent) : moneyText(service.latest)}</strong><span>{service.monthlyEquivalent ? 'a month' : 'latest payment'}</span></p>
          <p className={styles.small}>{CADENCE[service.cadence]} · last paid {service.lastPaidOn}{service.monthlyEquivalent && service.cadence !== 'monthly' ? ' · monthly equivalent shown' : ''}</p>
          {service.increase && <p className={styles.callout}>Latest payment is {service.increase.percent}% above the earlier median. Usage or fees may explain it.</p>}
          <div className={styles.buttons}>
            {canHunt(service) && <button disabled={busy || state.status === 'busy'} onClick={() => void hunt(service)}>{state.status === 'busy' ? 'Checking public offers…' : state.status === 'done' ? 'Check again' : 'Hunt for a better deal'}</button>}
            {research && <Link className={styles.linkButton} href={research}>Research with sources ↗</Link>}
            <Link className={styles.linkButton} href={watchHref(service)} prefetch={false}>Ask DO to watch this</Link>
          </div>
          {service.category === 'electricity' && service.monthlyEquivalent?.currency === 'NZD' && <SolarOutlookCard monthlyCents={service.monthlyEquivalent.amount} />}
          {state.status === 'error' && <p className={styles.small} role="alert">{state.message}</p>}
          {state.status === 'done' && <div className={styles.offers}>
            {!state.book.live && <p className={styles.small}>No current public offers are held for {SERVICE_LABEL[service.category].toLocaleLowerCase('en-NZ')}. Use the sourced research instead.</p>}
            {state.book.live && state.rows.length === 0 && <p className={styles.small}>No advertised offer in the price book is at least {moneyText({ amount: thresholdCents, currency: 'NZD' })} a month cheaper than this. Checked {state.book.offers.length} {state.book.offers.length === 1 ? 'offer' : 'offers'}{state.book.lastVerified ? ', last verified ' + dateLabel(state.book.lastVerified) : ''}.</p>}
            {state.rows.slice(0, 3).map(row => <div key={row.offer.id} className={styles.offer}>
              <div className={styles.sectionHead}><h4>{row.offer.provider} · {row.offer.planName}</h4><strong>{moneyText({ amount: Math.round((row.offer.monthlyCost ?? 0) * 100), currency: 'NZD' })} a month</strong></div>
              <p>Possible saving of up to {moneyText({ amount: row.possibleYearlySaving, currency: 'NZD' })} a year before joining or exit fees. Advertised price, not a quote for this address or usage.</p>
              {row.offer.features.length > 0 && <p className={styles.small}>{row.offer.features.slice(0, 3).join(' · ')}</p>}
              {row.offer.eligibilityNotes && <p className={styles.small}>{row.offer.eligibilityNotes}</p>}
              <p className={styles.evidenceLine}>source {row.offer.sourceHost} · verified {dateLabel(row.offer.lastVerified)}{row.stale ? ` · older than ${OFFER_FRESH_DAYS} days, check before acting` : ''} · <a href={row.offer.sourceUrl} target="_blank" rel="noopener noreferrer">open source ↗</a></p>
            </div>)}
            {state.rows.length > 3 && <p className={styles.small}>{state.rows.length - 3} more cheaper {state.rows.length - 3 === 1 ? 'offer' : 'offers'} not shown. Use the sourced research for the full picture.</p>}
          </div>}
        </article>;
      })}</div>
      <p className={styles.small}>Fuel is a bill too: <Link href="/do/fuel">DO fuel watch</Link> says whether to fill up today from the weekly national price and your own tank. Hunting compares a monthly equivalent against assembl&rsquo;s public price book, where every row has a source and a verification date. Electricity depends on the supply address and tariffs, so a quote is still needed. DO will not switch, cancel or contact a provider; &ldquo;Ask DO to watch this&rdquo; shows the request for your review first, and you set the schedule in Personal DO.</p>
    </>}
  </section>;
}
