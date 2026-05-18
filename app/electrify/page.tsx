/**
 * /electrify — switch-to-electric calculator form
 *
 * Public lead-magnet tool. The form posts to /api/calculate and redirects to
 * /electrify/results/[id].
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  Car,
  Home,
  KeyRound,
  PlugZap,
  SunMedium,
} from "lucide-react";
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
  { value: "hospitality", label: "Hospitality (cafe, restaurant, accommodation)" },
  { value: "construction", label: "Construction / trades" },
  { value: "freight", label: "Freight & logistics" },
  { value: "retail", label: "Retail" },
  { value: "automotive_fleet", label: "Automotive / fleet" },
  { value: "creative", label: "Creative / professional services" },
  { value: "ece", label: "Early childhood / education" },
  { value: "professional_other", label: "Other professional" },
];

const REGIONS = [
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Wellington",
  "Canterbury",
  "Otago",
  "Southland",
  "Northland",
  "Other",
];

const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "lpg", label: "LPG" },
  { value: "natural_gas", label: "Natural gas" },
  { value: "coal", label: "Coal" },
];

const ROUTES: Array<{
  id: string;
  label: string;
  title: string;
  status: "live" | "next";
  icon: LucideIcon;
}> = [
  {
    id: "business",
    label: "Business",
    title: "SME switch sequence",
    status: "live",
    icon: Building2,
  },
  {
    id: "household",
    label: "Household",
    title: "Home energy path",
    status: "next",
    icon: Home,
  },
  {
    id: "landlord",
    label: "Landlord",
    title: "Rental property route",
    status: "next",
    icon: KeyRound,
  },
  {
    id: "new-build",
    label: "New build",
    title: "Do not connect gas",
    status: "next",
    icon: PlugZap,
  },
];

const inputClass =
  "h-11 w-full rounded-[6px] border border-[rgba(35,33,31,0.16)] bg-[#FAF7F2] px-3 text-sm text-[#23211F] outline-none transition focus:border-[#2B6B57] focus:ring-2 focus:ring-[#2B6B57]/18";

export default function ElectrifyFormPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto grid max-w-[1500px] gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(460px,0.78fr)] xl:items-start">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              electrify · machine count for aotearoa
            </p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(280px,0.52fr)] lg:items-end">
              <div>
                <h1 className="max-w-4xl font-display text-[clamp(3.6rem,8vw,7.2rem)] font-light leading-[0.86]">
                  Count the machines. Find the first switch.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                  A practical NZ electrification calculator for vehicles, heat,
                  power, rooftops, savings, payback, and the next machine to
                  replace.
                </p>
              </div>

              <div className="relative min-h-[280px] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#23211F] shadow-[0_22px_60px_rgba(35,33,31,0.12)]">
                <Image
                  src="/img/hapai/tools/electrify-vessel.jpg"
                  alt="Sculptural vessel representing electrification planning"
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover object-[50%_38%]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23211F]/76 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-[#FAF7F2]">
                  <HeroChip icon={Car} label="Fleet" />
                  <HeroChip icon={BatteryCharging} label="Heat" />
                  <HeroChip icon={SunMedium} label="Solar" />
                </div>
              </div>
            </div>

          </div>

          <form
            id="calculator"
            action="/api/calculate"
            method="POST"
            className="scroll-mt-24 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/72 p-5 shadow-[0_22px_70px_rgba(35,33,31,0.08)] md:p-6 xl:sticky xl:top-24"
          >
            <div className="border-b border-[rgba(35,33,31,0.10)] pb-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
                business · live calculator
              </p>
              <h2 className="mt-2 font-display text-4xl font-light leading-none">
                Your Machine Count.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                Start with the fossil machines in the business. The result ranks
                the switches by savings and payback.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <Field label="What does your business do?" name="businessType" required>
                <select name="businessType" required className={inputClass}>
                  <option value="">Choose one</option>
                  {BUSINESS_TYPES.map((business) => (
                    <option key={business.value} value={business.value}>
                      {business.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Which region are you based in?" name="region" required>
                <select name="region" required className={inputClass}>
                  <option value="">Choose one</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Average monthly fuel spend"
                  name="monthlyFuelSpendNzd"
                  required
                  hint="Petrol, diesel, LPG, gas. Best guess."
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--text-secondary)]">
                      $
                    </span>
                    <input
                      type="number"
                      name="monthlyFuelSpendNzd"
                      required
                      min={0}
                      max={50000}
                      step={10}
                      className={`${inputClass} pl-7`}
                      placeholder="800"
                    />
                  </div>
                </Field>

                <Field
                  label="Monthly electricity spend"
                  name="monthlyElectricitySpendNzd"
                  required
                  hint="Power bill total."
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--text-secondary)]">
                      $
                    </span>
                    <input
                      type="number"
                      name="monthlyElectricitySpendNzd"
                      required
                      min={0}
                      max={20000}
                      step={10}
                      className={`${inputClass} pl-7`}
                      placeholder="600"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Which fuels?" name="fuelTypes" required hint="Tick all that apply.">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FUEL_TYPES.map((fuel) => (
                    <label
                      key={fuel.value}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[6px] border border-[rgba(35,33,31,0.14)] bg-[#FAF7F2] px-3 py-2 text-sm transition hover:border-[#2B6B57]/45 hover:bg-white"
                    >
                      <input type="checkbox" name="fuelTypes" value={fuel.value} className="rounded" />
                      <span>{fuel.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="How many vehicles?" name="vehicleCount" required>
                  <input
                    type="number"
                    name="vehicleCount"
                    required
                    min={0}
                    max={50}
                    step={1}
                    defaultValue={0}
                    className={inputClass}
                  />
                </Field>

                <Field label="What kind of vehicles?" name="vehicleType">
                  <select name="vehicleType" className={inputClass}>
                    <option value="">N/A - no vehicles</option>
                    <option value="passenger">Passenger</option>
                    <option value="light_commercial">Light commercial</option>
                    <option value="heavy_commercial">Heavy commercial</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </Field>
              </div>

              <Field label="Where are your premises?" name="premisesType" required>
                <select name="premisesType" required className={inputClass}>
                  <option value="">Choose one</option>
                  <option value="own_freehold">We own freehold</option>
                  <option value="lease_long_term">Long-term lease (3+ years)</option>
                  <option value="lease_short_term">Short-term lease (under 3 years)</option>
                </select>
              </Field>

              <Field label="Is the rooftop suitable for solar?" name="rooftopSolarSuitable" required>
                <select name="rooftopSolarSuitable" required className={inputClass}>
                  <option value="">Choose one</option>
                  <option value="yes">Yes - sunny, structurally sound</option>
                  <option value="no">No - shaded or structurally constrained</option>
                  <option value="unsure">Unsure - needs assessment</option>
                </select>
              </Field>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#245746]"
            >
              Calculate my savings <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </button>
          </form>

          <div className="xl:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ROUTES.map((route) => (
                <RoutePill key={route.id} {...route} />
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-y border-[rgba(35,33,31,0.10)] py-5 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-3 sm:grid-cols-3">
                <Proof label="Inputs" value="8" />
                <Proof label="Target time" value="90 sec" />
                <Proof label="Result" value="ranked switches" />
              </div>
              <ElectrifyShareButtons
                title="Electrify — count your fossil machines"
                text="A NZ electrification calculator from assembl: count your fossil machines and switch the ones that pay back fastest."
                url="https://www.assembl.co.nz/electrify"
              />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <VisualNote
                icon={PlugZap}
                title="Fuel to electrons"
                body="Compares current fuel spend with EV and heat-pump operating costs."
              />
              <VisualNote
                icon={Building2}
                title="Premises-aware"
                body="Lease length and rooftop suitability change the recommendation."
              />
              <VisualNote
                icon={SunMedium}
                title="Solar signal"
                body="Adds a rooftop sizing estimate when the numbers make sense."
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1500px] px-5 pb-12 pt-4 text-xs leading-relaxed text-[color:var(--text-secondary)] md:px-10">
        <p>
          <strong>Sources:</strong> MBIE Energy Prices Q1 2026, EECA Light
          Vehicle Fuel Economy Database 2026, MfE NZ Greenhouse Gas Inventory
          2024, Rewiring Aotearoa Machine Count Report 2025, NZTA Vehicle Fleet
          Statistics 2025.
        </p>
        <p className="mt-2">
          This calculator is a starting estimate, not a quote. Numbers within
          +/- 15% of a professional fleet or energy audit. Methodology and
          constants:{" "}
          <a
            href="https://github.com/katecoveny-svg/assemblnz-f0afd79d/blob/main/config/electrification-assumptions.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[color:var(--assembl-pounamu)]"
          >
            see the source
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

function RoutePill({ label, title, status, icon: Icon }: (typeof ROUTES)[number]) {
  const isLive = status === "live";

  return (
    <a
      href={isLive ? "#calculator" : undefined}
      aria-disabled={!isLive}
      className="flex min-h-[92px] items-start gap-3 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/56 p-4 transition hover:bg-white"
    >
      <Icon className="mt-0.5 h-5 w-5 flex-none text-[color:var(--assembl-pounamu)]" aria-hidden />
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {label} · {isLive ? "live" : "next"}
        </span>
        <span className="mt-2 block font-display text-2xl leading-none">{title}</span>
      </span>
    </a>
  );
}

function Proof({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl leading-none text-[color:var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function HeroChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-[8px] border border-white/18 bg-white/14 px-3 py-2 backdrop-blur">
      <Icon className="h-4 w-4" aria-hidden />
      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

function VisualNote({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/50 p-4">
      <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <h2 className="mt-3 font-display text-2xl leading-none">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
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
    <label className="block" htmlFor={name}>
      <span className="block text-sm font-medium text-[color:var(--text-primary)]">
        {label} {required && <span className="text-[#AC5838]">*</span>}
      </span>
      {hint && (
        <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-secondary)]">
          {hint}
        </span>
      )}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
