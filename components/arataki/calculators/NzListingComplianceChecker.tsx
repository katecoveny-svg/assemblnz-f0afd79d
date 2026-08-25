'use client';

import { useMemo, useState } from 'react';
import { NumberInput } from '../NumberInput';
import { ResultCard } from '../ResultCard';
import { listingCompliance } from '@/lib/arataki/calculators';
import { readBooleanParam, readNumberParam, readStringParam } from './shared';
import { CalculatorCta } from './CalculatorCta';
import { CalculatorLayout } from './MissedServiceCallRevenue';

const wofOptions = ['current', 'expires-soon', 'expired'] as const;
const regOptions = ['current', 'expired'] as const;

export function NzListingComplianceChecker() {
  const [odometerKm, setOdometerKm] = useState(() => readNumberParam('odometer', 82000));
  const [wofStatus, setWofStatus] = useState(() => readStringParam('wof', 'current', wofOptions));
  const [registrationStatus, setRegistrationStatus] = useState(() => readStringParam('rego', 'current', regOptions));
  const [writtenOffHistory, setWrittenOffHistory] = useState(() => readBooleanParam('writtenOff', false));
  const [ppsrNotClear, setPpsrNotClear] = useState(() => readBooleanParam('ppsr', false));
  const [cinAttached, setCinAttached] = useState(() => readBooleanParam('cin', true));
  const [accurateDescription, setAccurateDescription] = useState(() => readBooleanParam('description', true));
  const [actualVehiclePhoto, setActualVehiclePhoto] = useState(() => readBooleanParam('photo', true));
  const [mileageConsistent, setMileageConsistent] = useState(() => readBooleanParam('mileage', true));
  const [importedVehicle, setImportedVehicle] = useState(() => readBooleanParam('imported', false));
  const [importSpecDisclosed, setImportSpecDisclosed] = useState(() => readBooleanParam('importSpec', true));
  const result = useMemo(
    () => listingCompliance({ odometerKm, wofStatus, registrationStatus, writtenOffHistory, ppsrNotClear, cinAttached, accurateDescription, actualVehiclePhoto, mileageConsistent, importedVehicle, importSpecDisclosed }),
    [odometerKm, wofStatus, registrationStatus, writtenOffHistory, ppsrNotClear, cinAttached, accurateDescription, actualVehiclePhoto, mileageConsistent, importedVehicle, importSpecDisclosed],
  );
  const params = { odometer: odometerKm, wof: wofStatus, rego: registrationStatus, writtenOff: writtenOffHistory, ppsr: ppsrNotClear, cin: cinAttached, description: accurateDescription, photo: actualVehiclePhoto, mileage: mileageConsistent, imported: importedVehicle, importSpec: importSpecDisclosed };

  return (
    <CalculatorLayout
      form={
        <>
          <NumberInput label="Claimed odometer reading in km" value={odometerKm} onChange={setOdometerKm} max={1000000} />
          <Select label="WoF currency" value={wofStatus} onChange={(value) => setWofStatus(value as typeof wofStatus)} options={[['current', 'Has current WoF'], ['expires-soon', 'Expires within 30 days'], ['expired', 'Expired']]} />
          <Select label="Registration currency" value={registrationStatus} onChange={(value) => setRegistrationStatus(value as typeof registrationStatus)} options={[['current', 'Current'], ['expired', 'Expired']]} />
          <Toggle label="Vehicle written-off history" value={writtenOffHistory} onChange={setWrittenOffHistory} />
          <Toggle label="PPSR not clear" value={ppsrNotClear} onChange={setPpsrNotClear} />
          <Toggle label="CIN attached to listing" value={cinAttached} onChange={setCinAttached} />
          <Toggle label="Accurate year/make/model/variant" value={accurateDescription} onChange={setAccurateDescription} />
          <Toggle label="Photo of actual vehicle" value={actualVehiclePhoto} onChange={setActualVehiclePhoto} />
          <Toggle label="Mileage consistent with WoF history" value={mileageConsistent} onChange={setMileageConsistent} />
          <Toggle label="Imported vehicle" value={importedVehicle} onChange={setImportedVehicle} />
          {importedVehicle ? <Toggle label="Original specification disclosed" value={importSpecDisclosed} onChange={setImportSpecDisclosed} /> : null}
        </>
      }
      result={<ResultCard eyebrow="Listing readiness" headline={result.headline} rows={result.rows} params={params} tone={result.status === 'fail' || result.status === 'warning' ? 'amber' : 'pounamu'}><CalculatorCta href="/w/listing-compliance">Try the Listing Compliance Agent</CalculatorCta></ResultCard>}
    />
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#5C6273]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-[8px] border border-[#C8BBA9]/70 bg-white/78 px-3 text-[#3D4250] outline-none focus:border-[#3A3832]">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[8px] border border-[#C8BBA9]/70 bg-white/58 px-4 py-3 text-sm text-[#3D4250]">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#3A3832]" />
    </label>
  );
}
