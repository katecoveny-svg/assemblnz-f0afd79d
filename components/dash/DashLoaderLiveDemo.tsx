'use client';

/**
 * DashLoaderLiveDemo — a working, self-cycling consumer-mode loader for the
 * /dash landing. Opted in, donating to SPCA NZ, looping processing → success so
 * visitors see the real component (dog fill, sponsor line, Sponsored label,
 * destination chip) in action. Pure presentation; the sponsor line is passed in
 * so no network call is needed. Honours reduced-motion via the loader itself.
 */
import { useEffect, useState } from 'react';
import { DashLoader } from '@/components/dash';
import type { ConsumerSettings, DashStatus } from '@/components/dash';

const settings: ConsumerSettings = {
  optedIn: true,
  destination: { kind: 'charity', charityId: 'spca-nz' },
  hasConsentedToDisclosure: true,
};

const LOOP: DashStatus[] = ['processing', 'processing', 'success'];

export function DashLoaderLiveDemo() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % LOOP.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <DashLoader
      mode={{ kind: 'consumer', userSettings: settings }}
      status={LOOP[i]}
      displayMessages={['Crunching the numbers…', 'Fetching your matches…', 'Almost there…']}
      sponsorLine={{ text: 'Westpac Small Biz', advertiserId: 'westpac-small-biz' }}
      errorMessage="Something went wrong. Your wait still counted."
    />
  );
}
