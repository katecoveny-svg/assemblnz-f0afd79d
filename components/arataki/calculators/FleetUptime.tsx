'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { PercentSlider } from '../PercentSlider';
import { ResultCard } from '../ResultCard';
import { fleetUptime } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

export function FleetUptime() {
  const [fleetSize, setFleetSize] = useState(() => readNumberParam('fleet', 25));
  const [downtimeHours, setDowntimeHours] = useState(() => readNumberParam('downtime', 80));
  const [costPerHour, setCostPerHour] = useState(() => readNumberParam('cost', 35));
  const [reductionPct, setReductionPct] = useState(() => readNumberParam('reduction', 30));
  const result = useMemo(
    () => fleetUptime({ fleetSize, downtimeHours, costPerHour, reductionPct }),
    [fleetSize, downtimeHours, costPerHour, reductionPct],
  );
  const params = { fleet: fleetSize, downtime: downtimeHours, cost: costPerHour, reduction: reductionPct };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Fleet size" value={fleetSize} onChange={setFleetSize} max={5000} />
          <NumberInput label="Downtime hours per vehicle per year" value={downtimeHours} onChange={setDowntimeHours} max={5000} />
          <NumberInput label="Revenue loss per downtime hour" value={costPerHour} onChange={setCostPerHour} max={5000} prefix="$" />
          <PercentSlider label="Target downtime reduction" value={reductionPct} onChange={setReductionPct} max={60} />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params}><CalculatorCta href="/w/fleet-uptime">Try the Fleet Uptime Agent</CalculatorCta></ResultCard>}
    />
  );
}
