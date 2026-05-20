'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { ResultCard } from '../ResultCard';
import { workflowRoi } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

export function WorkflowRoi() {
  const [hoursPerWeek, setHoursPerWeek] = useState(() => readNumberParam('hours', 5));
  const [hourlyCost, setHourlyCost] = useState(() => readNumberParam('hourly', 45));
  const [additionalRevenue, setAdditionalRevenue] = useState(() => readNumberParam('revenue', 800));
  const [evalMonths, setEvalMonths] = useState(() => readNumberParam('months', 12));
  const [monthlyCost, setMonthlyCost] = useState(() => readNumberParam('cost', 299));
  const result = useMemo(
    () => workflowRoi({ hoursPerWeek, hourlyCost, additionalRevenue, evalMonths, assemblMonthly: monthlyCost }),
    [hoursPerWeek, hourlyCost, additionalRevenue, evalMonths, monthlyCost],
  );
  const params = { hours: hoursPerWeek, hourly: hourlyCost, revenue: additionalRevenue, months: evalMonths, cost: monthlyCost };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Hours saved per week" value={hoursPerWeek} onChange={setHoursPerWeek} max={168} step={0.5} />
          <NumberInput label="Hourly cost of current work" value={hourlyCost} onChange={setHourlyCost} max={1000} prefix="$" />
          <NumberInput label="Additional revenue unlocked per month" value={additionalRevenue} onChange={setAdditionalRevenue} max={1000000} prefix="$" />
          <NumberInput label="Months until evaluation" value={evalMonths} onChange={setEvalMonths} min={1} max={60} />
          <NumberInput label="assembl monthly cost" value={monthlyCost} onChange={setMonthlyCost} min={1} max={100000} prefix="$" />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params}><CalculatorCta href="/w/workflow-roi-template">Run the workflow template</CalculatorCta></ResultCard>}
    />
  );
}
