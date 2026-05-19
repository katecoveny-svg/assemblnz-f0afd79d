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
    images: ["/img/hapai/tools/electrify-share-card.png"],
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
  status: "live" | "soon";
  body: string;
  icon: LucideIcon;
}> = [
  {
    id: "business",
    label: "Business",
    title: "SME switch sequence",
    status: "live",
    body: "Vehicles, heat, power, and solar for small NZ operators.",
    icon: Building2,
  },
  {
    id: "household",
    label: "Household",
    title: "Home energy path",
    status: "soon",
    body: "Cars, hot water, heating, and solar in one household estimate.",
    icon: Home,
  },
  {
    id: "landlord",
    label: "Landlord",
    title: "Rental property route",
    status: "soon",
    body: "Split incentives, tenancy length, and heat-pump first moves.",
    icon: KeyRound,
  },
  {
    id: "new-build",
    label: "New build",
    title: "Do not connect gas",
    status: "soon",
    body: "Design-stage choices before gas, generators, or diesel enter the plan.",
    icon: PlugZap,
  },
];

const inputClass =
  "h-11 w-full rounded-[10px] border border-white/45 bg-white/62 px-3 text-sm text-[#23211F] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition backdrop-blur-xl focus:border-[#2B6B57] focus:ring-2 focus:ring-[#2B6B57]/18";

export default function ElectrifyFormPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(217,188,122,0.18),transparent_42%),radial-gradient(ellipse_at_78%_18%,rgba(43,107,87,0.14),transparent_46%),var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative px-5 py-8 md:px-10 md:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),transparent)]" />
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

              <div className="relative min-h-[280px] overflow-hidden rounded-[24px] border border-white/45 bg-[#23211F] shadow-[0_28px_90px_rgba(35,33,31,0.18)] [transform:perspective(1100px)_rotateX(1.6deg)_rotateY(-4deg)]">
                <Image
                  src="/img/hapai/tools/electrify-vessel.jpg"
                  alt="Sculptural vessel representing electrification planning"
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover object-[50%_38%]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23211F]/72 via-transparent to-white/10" />
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
            className="glass-card-elevated scroll-mt-24 p-5 shadow-[0_30px_100px_rgba(35,33,31,0.14)] md:p-6 xl:sticky xl:top-24"
          >
            <div className="border-b border-[rgba(35,33,31,0.10)] pb-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
                route board · live calculator
              </p>
              <h2 className="mt-2 font-display text-4xl font-light leading-none">
                Your Machine Count.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                Choose the route, then count the fossil machines. The result
                ranks the switches by savings and payback.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <fieldset>
                <legend className="text-sm font-medium text-[color:var(--text-primary)]">
                  Choose your route
                </legend>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                  The SME route is live with full NZ-data maths today. Household, Landlord, and New build routes ship this month — they share the same Machine Count frame, with EECA / Rewiring Aotearoa data tuned for each context.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {ROUTES.map((route) => {
                    const Icon = route.icon;
                    const isLive = route.status === "live";
                    return (
                      <label
                        key={route.id}
                        className={[
                          "group flex gap-3 rounded-[14px] border p-3 shadow-[0_14px_34px_rgba(35,33,31,0.07)] backdrop-blur-xl transition",
                          isLive
                            ? "cursor-pointer border-white/48 bg-white/54 hover:-translate-y-0.5 hover:border-[#2B6B57]/34 hover:bg-white/78"
                            : "cursor-not-allowed border-white/30 bg-white/35 opacity-65",
                        ].join(" ")}
                        aria-disabled={!isLive}
                      >
                        <input
                          type="radio"
                          name="routeType"
                          value={route.id}
                          defaultChecked={isLive}
                          disabled={!isLive}
                          className="mt-1"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                            {route.label}
                            {!isLive && (
                              <span className="ml-auto rounded-full bg-[rgba(212,168,83,0.18)] px-2 py-0.5 text-[9px] tracking-[0.18em] text-[#8A6E2E]">
                                COMING SOON
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block font-display text-xl leading-none">
                            {route.title}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

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
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-white/45 bg-white/58 px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:border-[#2B6B57]/45 hover:bg-white"
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
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 text-sm font-medium text-[#FAF7F2] shadow-[0_18px_36px_rgba(43,107,87,0.24)] transition hover:-translate-y-0.5 hover:bg-[#245746]"
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

function RoutePill({ label, title, status, body, icon: Icon }: (typeof ROUTES)[number]) {
  const isLive = status === "live";

  return (
    <a
      href={isLive ? "#calculator" : undefined}
      aria-disabled={!isLive}
      className="group flex min-h-[118px] items-start gap-3 rounded-[18px] border border-white/45 bg-white/48 p-4 shadow-[0_18px_46px_rgba(35,33,31,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/72"
    >
      <Icon className="mt-0.5 h-5 w-5 flex-none text-[color:var(--assembl-pounamu)]" aria-hidden />
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {label} · live
        </span>
        <span className="mt-2 block font-display text-2xl leading-none">{title}</span>
        <span className="mt-3 block text-xs leading-relaxed text-[color:var(--text-secondary)]">
          {body}
        </span>
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
    <div className="rounded-[12px] border border-white/24 bg-white/16 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur">
      <Icon className="h-4 w-4" aria-hidden />
      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

function VisualNote({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-white/45 bg-white/48 p-4 shadow-[0_18px_46px_rgba(35,33,31,0.07)] backdrop-blur-xl">
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
