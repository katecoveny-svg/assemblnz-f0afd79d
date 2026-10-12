import { expect, it } from 'vitest';
import { manualIssues, projectManualFlight } from './manual-input';
import { prepareReviewedTravel } from './preparation';
it('uses the same trimmed projection for manual validation and actual preparation', () => {
  const fields = { marketingFlight: ' zz101 ', operatingFlight: ' zz101 ', origin: ' akl ', destination: ' wlg ', 'departure.local': ' 2026-11-02T09:00 ', 'departure.offset': ' +13:00 ', 'departure.zone': ' Pacific/Auckland ', 'arrival.local': ' 2026-11-02T10:10 ', 'arrival.offset': ' +13:00 ', 'arrival.zone': ' Pacific/Auckland ' };
  expect(manualIssues(fields)).toEqual([]);
  const draft = prepareReviewedTravel({ flights: [projectManualFlight(fields)], source: { id: 'manual-fixture', kind: 'user_manual', observedAt: '2026-10-12T12:00:00Z', verifiedAt: '2026-10-12T12:00:00Z', expiresAt: '2026-10-13T12:00:00Z' } }, { responsibilityId: 'fictional', runId: 'travel', revision: 1, completedAt: '2026-10-12T12:00:00Z' });
  expect(draft.flights[0].departure).toEqual({ local: '2026-11-02T09:00', offset: '+13:00', zone: 'Pacific/Auckland' });
});
