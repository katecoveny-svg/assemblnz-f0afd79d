/**
 * /electrify — SME switch-to-electric calculator form
 *
 * 8 questions, mobile-first, 90 second target. Form posts to /api/calculate
 * which returns a result-id. Then we redirect to /electrify/results/[id].
 *
 * No auth required — this is a public lead-magnet tool.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electrify — SME switch-to-electric calculator",
  description:
    "How much would your small business save by switching to electric? Real prices, real maths, sourced from MBIE / EECA / Rewiring Aotearoa. 90 seconds, no signup.",
};

const BUSINESS_TYPES: Array<{ value: string; label: string }> = [
  { value: "hospitality", label: "Hospitality (café, restaurant, accommodation)" },
  { value: "construction", label: "Construction / trades" },
  { value: "freight", label: "Freight & logistics" },
  { value: "retail", label: "Retail" },
  { value: "automotive_fleet", label: "Automotive / fleet" },
  { value: "creative", label: "Creative / professional services" },
  { value: "ece", label: "Early childhood / education" },
  { value: "professional_other", label: "Other professional" },
];

const REGIONS = [
  "Auckland", "Waikato", "Bay of Plenty", "Wellington",
  "Canterbury", "Otago", "Southland", "Northland", "Other",
];

const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "lpg", label: "LPG" },
  { value: "natural_gas", label: "Natural gas" },
  { value: "coal", label: "Coal" },
];

export default function ElectrifyFormPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 lg:py-16 font-inter text-taupe-900">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-taupe-600 mb-2">
          Electrify · for NZ small businesses
        </p>
        <h1 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight">
          How much would your business save by going electric?
        </h1>
        <p className="mt-4 text-taupe-700 max-w-xl">
          Real NZ prices. Real maths. Sourced from MBIE, EECA, and Rewiring Aotearoa.
          Takes about 90 seconds. No signup — the email comes at the PDF step.
        </p>
      </header>

      <form action="/api/calculate" method="POST" className="space-y-6">
        <Field label="What does your business do?" name="businessType" required>
          <select
            name="businessType"
            required
            className="w-full px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          >
            <option value="">Choose one…</option>
            {BUSINESS_TYPES.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Which region are you based in?" name="region" required>
          <select
            name="region"
            required
            className="w-full px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          >
            <option value="">Choose one…</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field
          label="Average monthly fuel spend (NZD)"
          name="monthlyFuelSpendNzd"
          required
          hint="Petrol, diesel, LPG, gas — total. Best guess."
        >
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-taupe-500">$</span>
            <input
              type="number"
              name="monthlyFuelSpendNzd"
              required
              min={0}
              max={50000}
              step={10}
              className="w-full pl-7 pr-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
              placeholder="800"
            />
          </div>
        </Field>

        <Field label="Which fuels?" name="fuelTypes" required hint="Tick all that apply.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FUEL_TYPES.map((f) => (
              <label key={f.value} className="flex items-center gap-2 px-3 py-2 border border-taupe-300 rounded-md bg-mist-50 cursor-pointer hover:bg-mist-100">
                <input type="checkbox" name="fuelTypes" value={f.value} className="rounded" />
                <span className="text-sm">{f.label}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="How many vehicles in the business?" name="vehicleCount" required>
          <input
            type="number"
            name="vehicleCount"
            required
            min={0}
            max={50}
            step={1}
            defaultValue={0}
            className="w-full px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          />
        </Field>

        <Field label="What kind of vehicles?" name="vehicleType">
          <select
            name="vehicleType"
            className="w-full px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          >
            <option value="">N/A — no vehicles</option>
            <option value="passenger">Passenger (sedan, hatch)</option>
            <option value="light_commercial">Light commercial (ute, small van)</option>
            <option value="heavy_commercial">Heavy commercial (truck, large van)</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>

        <Field label="Where are your premises?" name="premisesType" required>
          <select
            name="premisesType"
            required
            className="w-full px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          >
            <option value="">Choose one…</option>
            <option value="own_freehold">We own freehold</option>
            <option value="lease_long_term">Long-term lease (3+ years)</option>
            <option value="lease_short_term">Short-term lease (under 3 years)</option>
          </select>
        </Field>

        <Field label="Is the rooftop suitable for solar?" name="rooftopSolarSuitable" required>
          <select
            name="rooftopSolarSuitable"
            required
            className="w-full px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          >
            <option value="">Choose one…</option>
            <option value="yes">Yes — sunny, structurally sound</option>
            <option value="no">No — shaded, north-facing constraint, structural issue</option>
            <option value="unsure">Unsure — we'd need an assessment</option>
          </select>
        </Field>

        <Field
          label="Average monthly electricity spend (NZD)"
          name="monthlyElectricitySpendNzd"
          required
          hint="Power bill total. Includes lighting, heating, refrigeration."
        >
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-taupe-500">$</span>
            <input
              type="number"
              name="monthlyElectricitySpendNzd"
              required
              min={0}
              max={20000}
              step={10}
              className="w-full pl-7 pr-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
              placeholder="600"
            />
          </div>
        </Field>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-pounamu-900 text-mist-50 font-medium hover:bg-pounamu-800 transition-colors"
          >
            Calculate my savings →
          </button>
        </div>
      </form>

      <footer className="mt-12 pt-8 border-t border-taupe-200 text-xs text-taupe-500 space-y-2">
        <p>
          <strong>Sources:</strong> MBIE Energy Prices Q1 2026 · EECA Light Vehicle
          Fuel Economy Database 2026 · MfE NZ Greenhouse Gas Inventory 2024 ·
          Rewiring Aotearoa Machine Count Report 2025 · NZTA Vehicle Fleet
          Statistics 2025.
        </p>
        <p>
          This calculator is a starting estimate, not a quote. Numbers within ±15%
          of a professional fleet/energy audit. Methodology and constants:{" "}
          <a
            href="https://github.com/katecoveny-svg/assemblnz-f0afd79d/blob/main/config/electrification-assumptions.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-pounamu-900"
          >
            see the source
          </a>.
        </p>
      </footer>
    </main>
  );
}

function Field({
  label,
  name,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-taupe-900 mb-1">
        {label} {required && <span className="text-kokowai-700">*</span>}
      </span>
      {hint && <span className="block text-xs text-taupe-600 mb-1.5">{hint}</span>}
      {children}
    </label>
  );
}
