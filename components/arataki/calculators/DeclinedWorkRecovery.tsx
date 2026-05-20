'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { PercentSlider } from '../PercentSlider';
import { ResultCard } from '../ResultCard';
import { declinedWorkRecovery } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

export function DeclinedWorkRecovery() {
  const [declinedQuotes, setDeclinedQuotes] = useState(() => readNumberParam('declined', 60));
  const [ticketValue, setTicketValue] = useState(() => readNumberParam('ticket', 480));
  const [currentFollowup, setCurrentFollowup] = useState(() => readNumberParam('current', 10));
  const [targetFollowup, setTargetFollowup] = useState(() => readNumberParam('target', 80));
  const [recoveryConversion, setRecoveryConversion] = useState(() => readNumberParam('recovery', 40));
  const result = useMemo(
    () => declinedWorkRecovery({ declinedQuotes, ticketValue, currentFollowup, targetFollowup: Math.max(targetFollowup, currentFollowup), recoveryConversion }),
    [declinedQuotes, ticketValue, currentFollowup, targetFollowup, recoveryConversion],
  );
  const params = { declined: declinedQuotes, ticket: ticketValue, current: currentFollowup, target: targetFollowup, recovery: recoveryConversion };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Declined service quotes per month" value={declinedQuotes} onChange={setDeclinedQuotes} max={5000} />
          <NumberInput label="Average declined ticket value" value={ticketValue} onChange={setTicketValue} max={50000} prefix="$" />
          <PercentSlider label="Current follow-up rate" value={currentFollowup} onChange={setCurrentFollowup} />
          <PercentSlider label="Target follow-up rate" value={targetFollowup} onChange={setTargetFollowup} />
          <PercentSlider label="Recovery conversion on followed-up jobs" value={recoveryConversion} onChange={setRecoveryConversion} max={80} />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params} tone="amber"><CalculatorCta href="/w/declined-work-recovery">Try the Declined-Work Recovery workflow</CalculatorCta></ResultCard>}
    />
  );
}
