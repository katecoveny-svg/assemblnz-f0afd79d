'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { PercentSlider } from '../PercentSlider';
import { ResultCard } from '../ResultCard';
import { firstServiceRetention } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

export function FirstServiceRetention() {
  const [salesPerYear, setSalesPerYear] = useState(() => readNumberParam('sales', 500));
  const [currentRetention, setCurrentRetention] = useState(() => readNumberParam('current', 60));
  const [lifetimeRevenue, setLifetimeRevenue] = useState(() => readNumberParam('lifetime', 8000));
  const [targetRetention, setTargetRetention] = useState(() => readNumberParam('target', 85));
  const result = useMemo(
    () => firstServiceRetention({ salesPerYear, currentRetention, lifetimeRevenue, targetRetention: Math.max(targetRetention, currentRetention) }),
    [salesPerYear, currentRetention, lifetimeRevenue, targetRetention],
  );
  const params = { sales: salesPerYear, current: currentRetention, lifetime: lifetimeRevenue, target: targetRetention };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="New car sales per year" value={salesPerYear} onChange={setSalesPerYear} max={10000} />
          <PercentSlider label="Current first-service return rate" value={currentRetention} onChange={setCurrentRetention} />
          <NumberInput label="Lifetime service revenue per loyal customer" value={lifetimeRevenue} onChange={setLifetimeRevenue} max={100000} prefix="$" />
          <PercentSlider label="Target first-service retention" value={targetRetention} onChange={setTargetRetention} />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params}><CalculatorCta href="/w/first-service-handoff">Try the First-Service Handoff workflow</CalculatorCta></ResultCard>}
    />
  );
}
