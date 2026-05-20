'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { PercentSlider } from '../PercentSlider';
import { ResultCard } from '../ResultCard';
import { missedServiceCallRevenue } from '@/lib/arataki/calculators';
import { readNumberParam } from './shared';
import { CalculatorCta } from './CalculatorCta';

export function MissedServiceCallRevenue() {
  const [bookingsPerMonth, setBookingsPerMonth] = useState(() => readNumberParam('bookings', 200));
  const [revenuePerService, setRevenuePerService] = useState(() => readNumberParam('revenue', 380));
  const [voicemailPct, setVoicemailPct] = useState(() => readNumberParam('voicemail', 15));
  const [voicemailConversionPct, setVoicemailConversionPct] = useState(() => readNumberParam('conversion', 30));
  const result = useMemo(
    () => missedServiceCallRevenue({ bookingsPerMonth, revenuePerService, voicemailPct, voicemailConversionPct }),
    [bookingsPerMonth, revenuePerService, voicemailPct, voicemailConversionPct],
  );
  const params = { bookings: bookingsPerMonth, revenue: revenuePerService, voicemail: voicemailPct, conversion: voicemailConversionPct };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Average service bookings per month" value={bookingsPerMonth} onChange={setBookingsPerMonth} max={5000} />
          <NumberInput label="Average revenue per service" value={revenuePerService} onChange={setRevenuePerService} max={10000} prefix="$" />
          <PercentSlider label="Calls that go to voicemail" value={voicemailPct} onChange={setVoicemailPct} max={50} />
          <PercentSlider label="Voicemail conversion to bookings" value={voicemailConversionPct} onChange={setVoicemailConversionPct} />
        </>
      }
      result={<ResultCard headline={result.headline} rows={result.rows} params={params} tone="amber"><CalculatorCta href="/w/missed-call-rescue">Try the Missed-Call Rescue workflow</CalculatorCta></ResultCard>}
    />
  );
}

export function CalculatorLayout({ form, result }: { form: React.ReactNode; result: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
      <section className="min-w-0 rounded-[8px] border border-[#C8BBA9]/70 bg-white/64 p-5">
        <div className="grid gap-5">{form}</div>
      </section>
      {result}
    </div>
  );
}
