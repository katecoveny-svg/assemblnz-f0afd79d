'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { PercentSlider } from '../PercentSlider';
import { ResultCard } from '../ResultCard';
import { serviceLaneTradeIn } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

export function ServiceLaneTradeIn() {
  const [serviced, setServiced] = useState(() => readNumberParam('serviced', 400));
  const [windowPct, setWindowPct] = useState(() => readNumberParam('window', 25));
  const [currentIdentification, setCurrentIdentification] = useState(() => readNumberParam('current', 5));
  const [targetIdentification, setTargetIdentification] = useState(() => readNumberParam('target', 40));
  const [salesConversion, setSalesConversion] = useState(() => readNumberParam('conversion', 12));
  const [gpPerSale, setGpPerSale] = useState(() => readNumberParam('gp', 2800));
  const result = useMemo(
    () => serviceLaneTradeIn({ serviced, windowPct, currentIdentification, targetIdentification: Math.max(targetIdentification, currentIdentification), salesConversion, gpPerSale }),
    [serviced, windowPct, currentIdentification, targetIdentification, salesConversion, gpPerSale],
  );
  const params = { serviced, window: windowPct, current: currentIdentification, target: targetIdentification, conversion: salesConversion, gp: gpPerSale };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Vehicles serviced per month" value={serviced} onChange={setServiced} max={10000} />
          <PercentSlider label="Customers in 3-5 year window" value={windowPct} onChange={setWindowPct} max={50} />
          <PercentSlider label="Current sales follow-up identification" value={currentIdentification} onChange={setCurrentIdentification} />
          <PercentSlider label="Target identification" value={targetIdentification} onChange={setTargetIdentification} />
          <PercentSlider label="Sales conversion on identified opportunities" value={salesConversion} onChange={setSalesConversion} max={30} />
          <NumberInput label="Average GP per car sale" value={gpPerSale} onChange={setGpPerSale} max={50000} prefix="$" />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params}><CalculatorCta href="/w/service-to-sales-match">Try the Service-to-Sales Matcher</CalculatorCta></ResultCard>}
    />
  );
}
