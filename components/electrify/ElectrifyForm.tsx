'use client';

/**
 * Route-aware Electrify calculator form.
 *
 * Renders different field groups per route (Business / Household / Landlord /
 * New build). The underlying Machine Count maths is the same engine — Rewiring
 * Aotearoa's frame applies in all four contexts — but the form questions and
 * result framing are tuned for the audience.
 *
 * Submit posts to /api/calculate which reads routeType and produces a tuned
 * result snapshot. The results page renders route-specific copy.
 */

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, BatteryCharging, Building2, Car, Home, KeyRound, PlugZap, SunMedium } from 'lucide-react';

type RouteId = 'business' | 'household' | 'landlord' | 'new-build';

const ROUTES: Array<{ id: RouteId; label: string; title: string; body: string; icon: LucideIcon }> = [
  { id: 'business', label: 'Business', title: 'SME switch sequence', body: 'Vehicles, heat, power, and solar for small NZ operators.', icon: Building2 },
  { id: 'household', label: 'Household', title: 'Home energy path', body: 'Cars, hot water, heating, and solar in one household estimate.', icon: Home },
  { id: 'landlord', label: 'Landlord', title: 'Rental property route', body: 'Split incentives, tenancy length, and heat-pump first moves.', icon: KeyRound },
  { id: 'new-build', label: 'New build', title: 'Do not connect gas', body: 'Design-stage choices before gas, generators, or diesel enter the plan.', icon: PlugZap },
];

const BUSINESS_TYPES: Array<{ value: string; label: string }> = [
  { value: 'hospitality', label: 'Hospitality (cafe, restaurant, accommodation)' },
  { value: 'construction', label: 'Construction / trades' },
  { value: 'freight', label: 'Freight & logistics' },
  { value: 'retail', label: 'Retail' },
  { value: 'automotive_fleet', label: 'Automotive / fleet' },
  { value: 'creative', label: 'Creative / professional services' },
  { value: 'ece', label: 'Early childhood / education' },
  { value: 'professional_other', label: 'Other professional' },
];

const REGIONS = ['Auckland', 'Waikato', 'Bay of Plenty', 'Wellington', 'Canterbury', 'Otago', 'Southland', 'Northland', 'Other'];
const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'lpg', label: 'LPG' },
  { value: 'natural_gas', label: 'Natural gas' },
  { value: 'coal', label: 'Coal' },
];

const inputClass =
  'h-11 w-full rounded-[10px] border border-white/45 bg-white/62 px-3 text-sm text-[#23211F] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition backdrop-blur-xl focus:border-[#2B6B57] focus:ring-2 focus:ring-[#2B6B57]/18';

const ROUTE_COPY: Record<RouteId, { eyebrow: string; title: string; sub: string; cta: string }> = {
  business: {
    eyebrow: 'route board · sme calculator',
    title: 'Your Machine Count.',
    sub: 'Count the fossil machines in your business. The result ranks the switches by savings and payback.',
    cta: 'Calculate my savings',
  },
  household: {
    eyebrow: 'route board · home energy path',
    title: "Your home's Machine Count.",
    sub: 'Count the fossil machines in your home — cars, hot water, heating. The result ranks what to switch first.',
    cta: 'Calculate my home path',
  },
  landlord: {
    eyebrow: 'route board · rental property route',
    title: 'Your portfolio Machine Count.',
    sub: 'Heat pumps, hot water, insulation — and a clear view of what you pay vs what tenants save.',
    cta: 'Calculate my portfolio path',
  },
  'new-build': {
    eyebrow: 'route board · do not connect gas',
    title: 'Avoid the gas connection.',
    sub: 'Design-stage choices before gas, generators, or diesel enter the plan. The result shows avoided costs and the all-electric alternative.',
    cta: 'Calculate my avoided cost',
  },
};

export function ElectrifyForm() {
  const [routeType, setRouteType] = useState<RouteId>('business');
  const copy = ROUTE_COPY[routeType];

  return (
    <form
      id="calculator"
      action="/api/calculate"
      method="POST"
      className="glass-card-elevated scroll-mt-24 p-5 shadow-[0_30px_100px_rgba(35,33,31,0.14)] md:p-6 xl:sticky xl:top-24"
    >
      <input type="hidden" name="routeType" value={routeType} />

      <div className="border-b border-[rgba(35,33,31,0.10)] pb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-4xl font-light leading-none">{copy.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">{copy.sub}</p>
      </div>

      <div className="mt-5 grid gap-4">
        {/* ROUTE PICKER */}
        <fieldset>
          <legend className="text-sm font-medium text-[color:var(--text-primary)]">Choose your route</legend>
          <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-secondary)]">
            All four routes use Rewiring Aotearoa's Machine Count frame. The questions are tuned for each context.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ROUTES.map((route) => {
              const Icon = route.icon;
              const active = route.id === routeType;
              return (
                <label
                  key={route.id}
                  className={[
                    'group flex cursor-pointer gap-3 rounded-[14px] border p-3 shadow-[0_14px_34px_rgba(35,33,31,0.07)] backdrop-blur-xl transition',
                    active
                      ? 'border-[#2B6B57] bg-white/90'
                      : 'border-white/48 bg-white/54 hover:-translate-y-0.5 hover:border-[#2B6B57]/34 hover:bg-white/78',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="routeTypeRadio"
                    value={route.id}
                    checked={active}
                    onChange={() => setRouteType(route.id)}
                    className="mt-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {route.label}
                    </span>
                    <span className="mt-1 block font-display text-xl leading-none">{route.title}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* PER-ROUTE FIELDS */}
        {routeType === 'business' && <BusinessFields />}
        {routeType === 'household' && <HouseholdFields />}
        {routeType === 'landlord' && <LandlordFields />}
        {routeType === 'new-build' && <NewBuildFields />}
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 text-sm font-medium text-[#FAF7F2] shadow-[0_18px_36px_rgba(43,107,87,0.24)] transition hover:-translate-y-0.5 hover:bg-[#245746]"
      >
        {copy.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

// ─── BUSINESS FIELDS ──────────────────────────────────────────────────────
function BusinessFields() {
  return (
    <>
      <Field label="What does your business do?" name="businessType" required>
        <select name="businessType" required defaultValue="" className={inputClass}>
          <option value="">Choose one</option>
          {BUSINESS_TYPES.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Which region are you based in?" name="region" required>
        <select name="region" required defaultValue="" className={inputClass}>
          <option value="">Choose one</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Average monthly fuel spend" name="monthlyFuelSpendNzd" required hint="Petrol, diesel, LPG, gas. Best guess.">
          <DollarInput name="monthlyFuelSpendNzd" max={50000} placeholder="800" />
        </Field>
        <Field label="Monthly electricity spend" name="monthlyElectricitySpendNzd" required hint="Power bill total.">
          <DollarInput name="monthlyElectricitySpendNzd" max={20000} placeholder="600" />
        </Field>
      </div>
      <FuelsField />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="How many vehicles?" name="vehicleCount" required>
          <input type="number" name="vehicleCount" required min={0} max={50} step={1} defaultValue={0} className={inputClass} />
        </Field>
        <Field label="What kind of vehicles?" name="vehicleType">
          <select name="vehicleType" defaultValue="" className={inputClass}>
            <option value="">N/A — no vehicles</option>
            <option value="passenger">Passenger</option>
            <option value="light_commercial">Light commercial</option>
            <option value="heavy_commercial">Heavy commercial</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>
      </div>
      <Field label="Where are your premises?" name="premisesType" required>
        <select name="premisesType" required defaultValue="" className={inputClass}>
          <option value="">Choose one</option>
          <option value="own_freehold">We own freehold</option>
          <option value="lease_long_term">Long-term lease (3+ years)</option>
          <option value="lease_short_term">Short-term lease (under 3 years)</option>
        </select>
      </Field>
      <SolarField />
    </>
  );
}

// ─── HOUSEHOLD FIELDS ─────────────────────────────────────────────────────
function HouseholdFields() {
  return (
    <>
      <input type="hidden" name="businessType" value="professional_other" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="How many people in your home?" name="householdSize" required>
          <select name="householdSize" required defaultValue="" className={inputClass}>
            <option value="">Choose one</option>
            <option value="1">Just me</option>
            <option value="2">2 people</option>
            <option value="3-4">3–4 people</option>
            <option value="5+">5 or more</option>
          </select>
        </Field>
        <Field label="Region" name="region" required>
          <select name="region" required defaultValue="" className={inputClass}>
            <option value="">Choose one</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Average monthly fuel spend" name="monthlyFuelSpendNzd" required hint="Petrol or diesel for your cars.">
          <DollarInput name="monthlyFuelSpendNzd" max={5000} placeholder="350" />
        </Field>
        <Field label="Monthly power bill" name="monthlyElectricitySpendNzd" required hint="Your usual home power bill.">
          <DollarInput name="monthlyElectricitySpendNzd" max={2000} placeholder="220" />
        </Field>
      </div>
      <Field label="What heats your home?" name="fuelTypes" required hint="Tick all that apply.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: 'natural_gas', label: 'Gas central / hob' },
            { value: 'lpg', label: 'LPG bottles' },
            { value: 'petrol', label: 'Petrol cars' },
            { value: 'diesel', label: 'Diesel car' },
            { value: 'coal', label: 'Wood / coal fire' },
          ].map((fuel) => (
            <label key={fuel.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-white/45 bg-white/58 px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:border-[#2B6B57]/45 hover:bg-white">
              <input type="checkbox" name="fuelTypes" value={fuel.value} className="rounded" />
              <span>{fuel.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="How many cars in the household?" name="vehicleCount" required>
          <input type="number" name="vehicleCount" required min={0} max={6} step={1} defaultValue={1} className={inputClass} />
        </Field>
        <Field label="What kind?" name="vehicleType">
          <select name="vehicleType" defaultValue="passenger" className={inputClass}>
            <option value="">N/A — no cars</option>
            <option value="passenger">Passenger</option>
            <option value="light_commercial">Ute / van</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>
      </div>
      <Field label="Do you own or rent?" name="premisesType" required>
        <select name="premisesType" required defaultValue="" className={inputClass}>
          <option value="">Choose one</option>
          <option value="own_freehold">Own (freehold or mortgaged)</option>
          <option value="lease_long_term">Renting long-term (2+ years)</option>
          <option value="lease_short_term">Renting short-term (under 2 years)</option>
        </select>
      </Field>
      <SolarField />
    </>
  );
}

// ─── LANDLORD FIELDS ──────────────────────────────────────────────────────
function LandlordFields() {
  return (
    <>
      <input type="hidden" name="businessType" value="professional_other" />
      <input type="hidden" name="premisesType" value="own_freehold" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="How many rental properties?" name="rentalCount" required>
          <input type="number" name="rentalCount" required min={1} max={50} step={1} defaultValue={1} className={inputClass} />
        </Field>
        <Field label="Region (your largest cluster)" name="region" required>
          <select name="region" required defaultValue="" className={inputClass}>
            <option value="">Choose one</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Typical tenancy length" name="tenancyLength" required hint="Drives the split-incentive analysis.">
        <select name="tenancyLength" required defaultValue="" className={inputClass}>
          <option value="">Choose one</option>
          <option value="under_1_year">Under 12 months</option>
          <option value="1_2_years">1–2 years</option>
          <option value="3_plus_years">3+ years</option>
          <option value="lifetime">Long-term / lifetime</option>
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Average tenant fuel spend (per property)" name="monthlyFuelSpendNzd" required hint="Best guess — petrol + gas combined.">
          <DollarInput name="monthlyFuelSpendNzd" max={3000} placeholder="280" />
        </Field>
        <Field label="Average tenant power bill (per property)" name="monthlyElectricitySpendNzd" required>
          <DollarInput name="monthlyElectricitySpendNzd" max={1500} placeholder="180" />
        </Field>
      </div>
      <Field label="What heating do most properties have?" name="fuelTypes" required hint="Tick all that are common across the portfolio.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: 'natural_gas', label: 'Gas central / califonts' },
            { value: 'lpg', label: 'LPG bottles' },
            { value: 'coal', label: 'Wood / coal fire' },
            { value: 'petrol', label: 'No central heat' },
          ].map((fuel) => (
            <label key={fuel.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-white/45 bg-white/58 px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:border-[#2B6B57]/45 hover:bg-white">
              <input type="checkbox" name="fuelTypes" value={fuel.value} className="rounded" />
              <span>{fuel.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <input type="hidden" name="vehicleCount" value="0" />
      <SolarField />
    </>
  );
}

// ─── NEW BUILD FIELDS ─────────────────────────────────────────────────────
function NewBuildFields() {
  return (
    <>
      <input type="hidden" name="businessType" value="construction" />
      <input type="hidden" name="premisesType" value="own_freehold" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="What are you building?" name="buildType" required>
          <select name="buildType" required defaultValue="" className={inputClass}>
            <option value="">Choose one</option>
            <option value="residential_single">Residential — single home</option>
            <option value="residential_multi">Residential — multi-unit / townhouses</option>
            <option value="commercial_small">Commercial — small (under 500m²)</option>
            <option value="commercial_large">Commercial — large (500m²+)</option>
            <option value="mixed">Mixed use</option>
          </select>
        </Field>
        <Field label="Region" name="region" required>
          <select name="region" required defaultValue="" className={inputClass}>
            <option value="">Choose one</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      <Field label="What heating choice is currently on the plans?" name="fuelTypes" required hint="Tick everything currently in the design.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: 'natural_gas', label: 'Gas connection planned' },
            { value: 'lpg', label: 'LPG planned' },
            { value: 'petrol', label: 'Generator (backup)' },
            { value: 'diesel', label: 'Diesel boiler' },
            { value: 'coal', label: 'Wood / pellet' },
          ].map((fuel) => (
            <label key={fuel.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-white/45 bg-white/58 px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:border-[#2B6B57]/45 hover:bg-white">
              <input type="checkbox" name="fuelTypes" value={fuel.value} className="rounded" />
              <span>{fuel.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estimated monthly fuel cost once occupied" name="monthlyFuelSpendNzd" required hint="What gas/LPG would cost if connected.">
          <DollarInput name="monthlyFuelSpendNzd" max={20000} placeholder="450" />
        </Field>
        <Field label="Estimated monthly electricity cost" name="monthlyElectricitySpendNzd" required hint="Based on planned use.">
          <DollarInput name="monthlyElectricitySpendNzd" max={20000} placeholder="380" />
        </Field>
      </div>
      <Field label="How many vehicles will use the site?" name="vehicleCount">
        <input type="number" name="vehicleCount" min={0} max={50} step={1} defaultValue={0} className={inputClass} />
      </Field>
      <SolarField />
    </>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────
function FuelsField() {
  return (
    <Field label="Which fuels?" name="fuelTypes" required hint="Tick all that apply.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FUEL_TYPES.map((fuel) => (
          <label key={fuel.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-white/45 bg-white/58 px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:border-[#2B6B57]/45 hover:bg-white">
            <input type="checkbox" name="fuelTypes" value={fuel.value} className="rounded" />
            <span>{fuel.label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

function SolarField() {
  return (
    <Field label="Is the rooftop suitable for solar?" name="rooftopSolarSuitable" required>
      <select name="rooftopSolarSuitable" required defaultValue="" className={inputClass}>
        <option value="">Choose one</option>
        <option value="yes">Yes — sunny, structurally sound</option>
        <option value="no">No — shaded or structurally constrained</option>
        <option value="unsure">Unsure — needs assessment</option>
      </select>
    </Field>
  );
}

function DollarInput({ name, max, placeholder }: { name: string; max: number; placeholder: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--text-secondary)]">$</span>
      <input
        type="number"
        name={name}
        required
        min={0}
        max={max}
        step={10}
        className={`${inputClass} pl-7`}
        placeholder={placeholder}
      />
    </div>
  );
}

function Field({
  label,
  name,
  required,
  hint,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--text-primary)]">
        {label}
        {required && <span className="ml-1 text-[#2B6B57]">*</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-[color:var(--text-secondary)]">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
