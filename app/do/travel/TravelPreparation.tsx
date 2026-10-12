'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { manualFields, manualIssues, type ManualFlight } from '@/lib/do/travel/manual-input';
import { acknowledgeTravel, prepareReviewedTravel, travelTimeline, type FlightInput, type TravelDraft } from '@/lib/do/travel/preparation';
import { budgetSummary, fingerprint, receipt, type PreparedReceipt } from '@/lib/do/preparation/contracts';
import '../preparation.css';
const sample: ManualFlight = { marketingFlight: 'ZZ101', operatingFlight: 'ZZ101', origin: 'AKL', destination: 'WLG', 'departure.local': '2026-11-02T09:00', 'departure.offset': '+13:00', 'departure.zone': 'Pacific/Auckland', 'arrival.local': '2026-11-02T10:10', 'arrival.offset': '+13:00', 'arrival.zone': 'Pacific/Auckland' };
const labels = { marketingFlight: 'Marketing flight', operatingFlight: 'Operating flight', origin: 'Origin airport', destination: 'Destination airport', 'departure.local': 'Departure date and time', 'departure.offset': 'Departure UTC offset', 'departure.zone': 'Departure IANA timezone', 'arrival.local': 'Arrival date and time', 'arrival.offset': 'Arrival UTC offset', 'arrival.zone': 'Arrival IANA timezone' };
export default function TravelPreparation() {
  const [flight, setFlight] = useState(sample);
  const [revision, setRevision] = useState(1);
  const [draft, setDraft] = useState<TravelDraft | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<PreparedReceipt | null>(null);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState(500);
  const [flightEstimate, setFlightEstimate] = useState(180);
  const [hotelEstimate, setHotelEstimate] = useState(150);
  const [nights, setNights] = useState(1);
  const lock = useRef(false);
  const value = { revision, flight, budget, flightEstimate, hotelEstimate, nights };
  function invalidate() { setRevision(r => r + 1); setDraft(null); setReview(null); setPrepared(null); setError(''); }
  const validBudget = [budget, flightEstimate, hotelEstimate].every(n => Number.isFinite(n) && n >= 0) && budget > 0 && Number.isInteger(nights) && nights >= 0 && nights <= 30;
  const estimated = flightEstimate + hotelEstimate * nights;
  function prepare() {
    if (lock.current) return;
    lock.current = true;
    try {
      const issues = manualIssues(flight);
      if (issues.length) throw new Error(issues.map(i => `${labels[i.field as keyof typeof labels] ?? 'Segment'}: ${i.message}`).join(' '));
      if (!validBudget) throw new Error('Correct the NZD estimates, nights or budget before preparing');
      const allowance = budgetSummary({ currency: 'NZD', limitMinor: Math.round(budget * 100), feeMinor: null }, [Math.round(flightEstimate * 100), Math.round(hotelEstimate * nights * 100)]);
      if (allowance.exceedsBudget) throw new Error('Correct the NZD estimates, nights or budget before preparing');
      const now = new Date().toISOString();
      const segment: FlightInput = { marketingFlight: flight.marketingFlight.trim().toUpperCase(), operatingFlight: flight.operatingFlight.trim().toUpperCase(), origin: flight.origin.trim().toUpperCase(), destination: flight.destination.trim().toUpperCase(), departure: { local: flight['departure.local'], offset: flight['departure.offset'], zone: flight['departure.zone'] }, arrival: { local: flight['arrival.local'], offset: flight['arrival.offset'], zone: flight['arrival.zone'] } };
      setDraft(prepareReviewedTravel({ source: { id: 'sample-manual-itinerary', kind: 'user_manual', observedAt: now, verifiedAt: now, expiresAt: new Date(Date.parse(now) + 86400000).toISOString() }, flights: [segment] }, { responsibilityId: 'fictional-traveller', runId: 'travel-session', revision, completedAt: now }));
      setReview(null); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Preparation failed'); }
    finally { lock.current = false; }
  }
  function finish() {
    if (lock.current || prepared || !draft) return;
    lock.current = true;
    try {
      if (Date.parse(draft.source.expiresAt) <= Date.now() || draft.revision !== revision) throw new Error('Itinerary is stale; prepare and review again');
      const acknowledged = acknowledgeTravel(draft, revision);
      setPrepared(receipt({ ownerId: 'fictional-traveller', taskId: 'travel-session', revision }, review, value, new Date().toISOString()));
      setDraft(acknowledged);
    } catch (e) { setReview(null); setError(e instanceof Error ? e.message : 'Review required'); }
    finally { lock.current = false; }
  }
  return <div className="prep-page"><header className="prep-header"><GlassIdentity kind="do" size={54} /><Link href="/do">DO</Link><nav><Link href="/do/shop">Shop</Link><Link href="/do/travel" aria-current="page">Travel</Link></nav></header><p className="prep-eyebrow">Fictional traveller · session only · revision {revision}</p><h1>A clear itinerary before you book.</h1><p className="prep-lead">Review a manually entered flight and accommodation allowance. The starting itinerary is fictional; flight status and availability are unknown.</p><p className="prep-notice">No provider connection. Flight and hotel booking remain disabled until provider access and servicing are verified. No booking references or passenger documents are collected. Refreshing clears this session.</p>
  <div className="prep-grid"><section className="prep-card"><h2>1. Check each flight detail</h2><p>One segment per bounded preparation. Confirm the operating airline, explicit dates, UTC offsets and timezone.</p>{manualFields.map(field => <label key={field}>{labels[field]}<input type={field.endsWith('.local') ? 'datetime-local' : 'text'} maxLength={80} value={flight[field]} onChange={e => { setFlight({ ...flight, [field]: e.target.value }); invalidate(); }} /></label>)}<button type="button" onClick={prepare}>Prepare itinerary</button></section><section className="prep-card"><h2>2. Check the travel allowance</h2><p>Manually entered fictional NZD estimates. No quoted fare or room offer.</p>{[{ label: 'Budget (NZD)', value: budget, set: setBudget }, { label: 'Flight estimate (NZD)', value: flightEstimate, set: setFlightEstimate }, { label: 'Room estimate per night (NZD)', value: hotelEstimate, set: setHotelEstimate }, { label: 'Nights', value: nights, set: setNights }].map(f => <label key={f.label}>{f.label}<input type="number" min="0" step={f.label === 'Nights' ? '1' : '0.01'} value={f.value} onChange={e => { f.set(Number(e.target.value)); invalidate(); }} /></label>)}<p><strong>Estimated NZ${estimated.toFixed(2)} against NZ${budget.toFixed(2)}</strong></p><p>Taxes, baggage, transfers, cancellation terms and fees are unknown. Full budget coverage cannot be confirmed. No accommodation is reserved.</p></section></div>
  {error && <p role="alert" className="prep-notice">{error}</p>}{draft && <section className="prep-card"><h2>3. Review the timeline</h2><ul>{travelTimeline(draft, new Date().toISOString()).map(t => <li key={t.kind}>{t.kind}: {t.airport} · {t.time.local} {t.time.offset} [{t.time.zone}] · {t.flight} operated as {t.operatingFlight} · {t.evidence} · status unknown</li>)}</ul><p>Source: manual entry · reviewed by you, not verified by an airline. Evidence expires {draft.source.expiresAt}.</p><label className="prep-check"><input type="checkbox" checked={!!review} disabled={!!prepared} onChange={e => setReview(e.target.checked ? fingerprint(value) : null)} />I reviewed every itinerary field, estimate and unknown fee</label><button type="button" disabled={!review || !!prepared} onClick={finish}>Save prepared receipt</button><p>Flight and hotel booking disabled.</p></section>}{prepared && <section className="prep-card" role="status"><h2>Prepared — nothing booked</h2><p>{prepared.id} · {prepared.preparedAt} · external action: none</p><p>Session-only receipt. Material edits invalidate review. No airline, hotel, payment or loyalty request was sent.</p></section>}
  </div>;
}
