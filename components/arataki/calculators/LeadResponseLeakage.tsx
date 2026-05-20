'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { PercentSlider } from '../PercentSlider';
import { ResultCard } from '../ResultCard';
import { leadResponseLeakage } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

export function LeadResponseLeakage() {
  const [enquiries, setEnquiries] = useState(() => readNumberParam('enquiries', 80));
  const [gpPerSale, setGpPerSale] = useState(() => readNumberParam('gp', 2800));
  const [currentPct5Min, setCurrentPct5Min] = useState(() => readNumberParam('current', 35));
  const [targetPct5Min, setTargetPct5Min] = useState(() => readNumberParam('target', 90));
  const result = useMemo(
    () => leadResponseLeakage({ enquiries, gpPerSale, currentPct5Min, targetPct5Min: Math.max(targetPct5Min, currentPct5Min) }),
    [enquiries, gpPerSale, currentPct5Min, targetPct5Min],
  );
  const params = { enquiries, gp: gpPerSale, current: currentPct5Min, target: targetPct5Min };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Sales enquiries per month" value={enquiries} onChange={setEnquiries} max={5000} />
          <NumberInput label="Average GP per car sold" value={gpPerSale} onChange={setGpPerSale} max={50000} prefix="$" />
          <PercentSlider label="Current leads inside 5 minutes" value={currentPct5Min} onChange={setCurrentPct5Min} />
          <PercentSlider label="Target inside 5 minutes" value={targetPct5Min} onChange={setTargetPct5Min} />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params}><CalculatorCta href="/w/after-hours-lead">Try the After-Hours Lead Agent</CalculatorCta></ResultCard>}
    />
  );
}
