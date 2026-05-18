/**
 * /electrify — switch-to-electric calculator form
 *
 * 8 questions, mobile-first, 90 second target. Form posts to /api/calculate
 * which returns a result-id. Then we redirect to /electrify/results/[id].
 *
 * No auth required — this is a public lead-magnet tool.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BatteryCharging, Building2, Car, Home, KeyRound, PlugZap, SunMedium } from "lucide-react";
import ElectrifyShareButtons from "@/components/electrify/ElectrifyShareButtons";

export const metadata: Metadata = {
  title: "Electrify — count your fossil machines",
  description:
    "Count your fossil machines and switch the ones that pay back fastest. NZ electrification calculator for businesses, households, landlords, and new builds.",
  openGraph: {
    title: "Electrify — count your fossil machines",
    description:
      "Real NZ prices. Deterministic maths. A 90-second electrification calculator from assembl.",
    images: ["/og/og-assembl.png"],
  },
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

const PERSONAS: Array<{
  id: string;
  label: string;
  title: string;
  body: string;
  status: "live" | "next";
  icon: LucideIcon;
}> = [
  {
    id: "business",
    label: "Business",
    title: "SME switch sequence",
    body: "Vehicles, heat, power, and solar for small NZ operators. Live now.",
    status: "live",
    icon: Building2,
  },
  {
    id: "household",
    label: "Household",
    title: "Home energy path",
    body: "Cars, power bill, gas-in-home, heating, and solar. Coming this week.",
    status: "next",
    icon: Home,
  },
  {
    id: "landlord",
    label: "Landlord",
    title: "Rental property route",
    body: "Split-incentive maths: solar-as-a-service, heat pumps, and chargers.",
    status: "next",
    icon: KeyRound,
  },
  {
    id: "new-build",
    label: "New build",
    title: "Do not connect gas",
    body: "Design-stage choices, 20-year operating cost, and green lending angles.",
    status: "next",
    icon: PlugZap,
  },
];

export default function ElectrifyFormPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] font-inter text-taupe-900">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.10)] px-6 py-14 lg:px-10 lg:py-20">
        <div className="absolute inset-0 opacity-[0.16]">
          <Image
            src="/images/section-bg-texture.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-taupe-600">
              Electrify · machine count for Aotearoa
            </p>
            <h1 className="mt-5 max-w-4xl font-cormorant text-[clamp(3.6rem,8vw,7.25rem)] leading-[0.88] text-pounamu-900">
              Count your fossil machines. Switch the ones that pay back fastest.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-taupe-700">
              Real NZ prices. Deterministic maths. A 90-second calculator for the
              vehicles, heaters, boilers, gas connections, and rooftops that decide
              your energy bill.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calculator" className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                Start with business <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link href="/hapai" className="btn-ghost inline-flex h-12 items-center px-6">
                View all tools
              </Link>
            </div>
            <div className="mt-5">
              <ElectrifyShareButtons
                title="Electrify — count your fossil machines"
                text="A NZ electrification calculator from assembl: count your fossil machines and switch the ones that pay back fastest."
                url="https://www.assembl.co.nz/electrify"
              />
            </div>
          </header>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-4 shadow-[0_20px_70px_rgba(35,33,31,0.10)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-[#23211F]">
              <Image
                src="/img/hapai/tools/electrify-vessel.jpg"
                alt="Sculptural vessel representing fleet electrification"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover opacity-95"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23211F]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-2 p-4 text-mist-50">
                <HeroChip icon={Car} label="Fleet" />
                <HeroChip icon={BatteryCharging} label="Heat" />
                <HeroChip icon={SunMedium} label="Solar" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-taupe-600">
                Choose your route
              </p>
              <h2 className="mt-2 font-cormorant text-4xl leading-none text-pounamu-900 md:text-5xl">
                Four doors into the same maths.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-taupe-700">
              Business is live today. Household, landlord, and new-build flows are
              staged next so the page can be shared now while the extra models land.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {PERSONAS.map((persona) => (
              <PersonaCard key={persona.id} {...persona} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-start">
          <aside className="grid gap-4 sm:grid-cols-3 lg:sticky lg:top-24 lg:grid-cols-1">
            <VisualNote icon={PlugZap} title="Fuel to electrons" body="Compares current fuel spend with EV and heat-pump operating costs." />
            <VisualNote icon={Building2} title="Premises-aware" body="Lease length and rooftop suitability change the recommendations." />
            <VisualNote icon={SunMedium} title="Solar signal" body="Adds a rooftop sizing estimate when the numbers make sense." />
          </aside>

      <form id="calculator" action="/api/calculate" method="POST" className="space-y-6 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_20px_70px_rgba(35,33,31,0.06)] md:p-8">
        <div id="business" className="scroll-mt-28 border-b border-taupe-200 pb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-pounamu-700">
            Business · live calculator
          </p>
          <h2 className="mt-2 font-cormorant text-4xl leading-none text-pounamu-900">
            Your Machine Count.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-taupe-700">
            Start with the fossil machines in the business: vehicles, thermal fuel,
            power load, and rooftop potential. The result ranks the switches by
            savings and payback.
          </p>
        </div>
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
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-12 pt-8 text-xs text-taupe-500 space-y-2 lg:px-10">
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

function PersonaCard({
  id,
  label,
  title,
  body,
  status,
  icon: Icon,
}: (typeof PERSONAS)[number]) {
  const isLive = status === "live";
  const card = (
    <div className="h-full rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 p-5 transition-colors hover:bg-white/80">
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-5 w-5 text-pounamu-700" aria-hidden />
        <span
          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
            isLive ? "bg-pounamu-100 text-pounamu-900" : "bg-taupe-100 text-taupe-700"
          }`}
        >
          {isLive ? "Live" : "Coming this week"}
        </span>
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-taupe-600">{label}</p>
      <h3 className="mt-2 font-cormorant text-3xl leading-none text-pounamu-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-taupe-700">{body}</p>
      <span className="mt-5 inline-flex text-sm font-medium text-pounamu-900">
        {isLive ? "Open calculator →" : "Preview route"}
      </span>
    </div>
  );

  if (isLive) {
    return (
      <a href="#calculator" className="block h-full scroll-mt-28">
        {card}
      </a>
    );
  }

  return (
    <div id={id} className="h-full scroll-mt-28">
      {card}
    </div>
  );
}

function HeroChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-[8px] border border-white/15 bg-white/12 px-3 py-2 backdrop-blur">
      <Icon className="h-4 w-4" aria-hidden />
      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

function VisualNote({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <Icon className="h-5 w-5 text-pounamu-700" aria-hidden />
      <h2 className="mt-4 font-cormorant text-3xl text-pounamu-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-taupe-700">{body}</p>
    </div>
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
