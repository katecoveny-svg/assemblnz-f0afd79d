import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ProviderResults, { type ReviewedSelection } from '../../../app/do/travel/ProviderResults';
import type { ResultBatch } from '../../../lib/do/travel/provider-selection';

const start = Date.now();
const fixture: ResultBatch = {
  briefKey: 'synthetic-trip',
  input: { action: 'flights', from: 'AKL', to: 'WLG', depart: '2027-02-03', return_date: '2027-02-07', passengers: [{ type: 'adult' }], cabin_class: 'economy' },
  result: { contract: 'do.travel.search.v2', provider: 'duffel', state: 'results', action: 'flights', observedAt: new Date(start).toISOString(),
    offers: [{ id: 'synthetic-offer', kind: 'flight', title: 'Synthetic return flight', total: { amount: '240.00', currency: 'NZD' }, base: null, tax: null,
      expiresAt: new Date(start + 3600_000).toISOString(), observedAt: new Date(start).toISOString(), createdAt: null, sourceRequestId: 'synthetic-search',
      paymentRequirements: { requiresInstantPayment: null, paymentRequiredBy: null, priceGuaranteeExpiresAt: null }, liveMode: false,
      depart: '2027-02-03', return: '2027-02-07', dueAtAccommodation: null, conditions: null,
      flightEvidence: { requestedPassengers: [{ type: 'adult' }], returnedPassengers: [{ id: 'fixture-person', type: 'adult', age: null }], passengerStatus: 'matched', requestedCabin: 'economy', cabinStatus: 'matched' },
      occupancy: null, rates: [], rateCoverage: 'search_summary_only', segments: [],
    }], suggestions: [], message: '', totalReturned: 1, truncated: false, ordering: 'provider_order_unranked', requestId: 'synthetic-request' },
};
function App() {
  const [batch, setBatch] = useState(fixture);
  const [receipt, setReceipt] = useState<ReviewedSelection | null>(null);
  return <>
    <button onClick={() => setBatch(previous => {
      const next = structuredClone(previous); next.result.offers[0].total!.amount = '999.00'; return next;
    })}>Fixture: change price</button>
    <button onClick={() => setBatch(previous => {
      const next = structuredClone(previous); next.result.offers[0].expiresAt = new Date(Date.now() - 1000).toISOString(); return next;
    })}>Fixture: expire offer</button>
    <output aria-label="Retained receipt">{receipt ? `${receipt.stage}: ${receipt.offer.total?.amount}` : 'none'}</output>
    <ProviderResults batch={batch} briefKey={batch.briefKey} onReviewed={setReceipt} />
  </>;
}
createRoot(document.getElementById('root')!).render(<App />);
