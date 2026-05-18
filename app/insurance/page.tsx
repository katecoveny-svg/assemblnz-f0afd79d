import type { Metadata } from "next";
import { ArrowRight, Car, Home, ShieldCheck, WalletCards } from "lucide-react";

export const metadata: Metadata = {
  title: "Insurance gap analysis",
  description:
    "Five traffic lights for house, contents, vehicles, life, and income protection. Indicative NZ insurance gap analysis.",
};

const regions = [
  ["auckland", "Auckland"],
  ["wellington", "Wellington"],
  ["canterbury", "Canterbury"],
  ["waikato", "Waikato"],
  ["bay-of-plenty", "Bay of Plenty"],
  ["otago", "Otago"],
  ["northland", "Northland"],
  ["other", "Other"],
] as const;

const CONTROL =
  "min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pounamu-500";

export default function InsurancePage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
              insurance gap analysis
            </p>
            <h1
              className="mt-6 font-display italic leading-[0.9] text-[color:var(--assembl-pounamu)]"
              style={{ fontWeight: 300, fontSize: "clamp(3.4rem, 7vw, 6.6rem)" }}
            >
              Five questions. Five traffic lights.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              A fast, indicative NZ check across house, contents, vehicles, life,
              and income protection. No broker recommendation, no signup gate,
              no personal data stored by default.
            </p>
            <a href="#insurance-form" className="mt-8 cta-primary inline-flex h-12 items-center px-6">
              Check my cover <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </a>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <Signal icon={Home} title="House + contents" body="Rebuild buffer, contents estimate, dependants, and work-from-home equipment." />
            <Signal icon={Car} title="Vehicles" body="Cover type compared with vehicle value thresholds." />
            <Signal icon={WalletCards} title="Life + income" body="Income, mortgage, savings, KiwiSaver, and sole-earner risk." />
            <Signal icon={ShieldCheck} title="Adviser next" body="Indicative only. The next step is an independent adviser." />
          </div>
        </div>
      </section>

      <section id="insurance-form" className="px-6 py-12 lg:px-10 lg:py-16">
        <form
          action="/api/insurance/calculate"
          method="POST"
          className="mx-auto max-w-5xl rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_20px_70px_rgba(35,33,31,0.06)] md:p-8"
        >
          <Section title="House">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Do you own or rent?">
                <select name="tenure" className={CONTROL} defaultValue="own">
                  <option value="own">Own</option>
                  <option value="rent">Rent</option>
                </select>
              </Field>
              <Field label="Region">
                <select name="region" className={CONTROL} defaultValue="auckland">
                  {regions.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Approx floor area">
                <NumberInput name="floorAreaSqm" defaultValue={160} suffix="sqm" />
              </Field>
              <Field label="Current house sum insured">
                <MoneyInput name="houseSumInsured" defaultValue={650000} />
              </Field>
            </div>
          </Section>

          <Section title="Contents">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Contents sum insured">
                <MoneyInput name="contentsSumInsured" defaultValue={90000} />
              </Field>
              <Field label="Dependent children">
                <NumberInput name="dependants" defaultValue={1} />
              </Field>
              <label className="mt-7 flex min-h-11 items-center gap-3 rounded-md border border-taupe-300 bg-mist-50 px-3 text-sm">
                <input type="checkbox" name="workFromHome" value="yes" className="h-4 w-4 accent-pounamu-700" />
                Work-from-home equipment
              </label>
            </div>
          </Section>

          <Section title="Vehicles">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Number of vehicles">
                <NumberInput name="vehicleCount" defaultValue={1} />
              </Field>
              <Field label="Main daily-driver value">
                <MoneyInput name="vehicleValue" defaultValue={14000} />
              </Field>
              <Field label="Current cover">
                <select name="vehicleCover" className={CONTROL} defaultValue="third_party_fire_theft">
                  <option value="none">None</option>
                  <option value="third_party">Third-party only</option>
                  <option value="third_party_fire_theft">Third-party fire + theft</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Life + income">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Annual household income">
                <MoneyInput name="annualIncome" defaultValue={95000} />
              </Field>
              <Field label="Mortgage balance">
                <MoneyInput name="mortgageBalance" defaultValue={520000} />
              </Field>
              <Field label="Existing life cover">
                <MoneyInput name="lifeCover" defaultValue={400000} />
              </Field>
              <Field label="Savings buffer">
                <MoneyInput name="savings" defaultValue={25000} />
              </Field>
              <Field label="KiwiSaver balance">
                <MoneyInput name="kiwiSaverBalance" defaultValue={45000} />
              </Field>
              <Field label="Income protection monthly benefit">
                <MoneyInput name="incomeProtectionMonthly" defaultValue={0} />
              </Field>
              <label className="flex min-h-11 items-center gap-3 rounded-md border border-taupe-300 bg-mist-50 px-3 text-sm md:col-span-2">
                <input type="checkbox" name="soleEarner" value="yes" className="h-4 w-4 accent-pounamu-700" />
                Sole earner or income most of the household depends on
              </label>
            </div>
          </Section>

          <button type="submit" className="mt-8 cta-primary inline-flex h-12 items-center px-7">
            Show my traffic lights <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </button>
        </form>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-taupe-200 py-6 first:pt-0">
      <h2 className="mb-5 font-display text-3xl italic text-[color:var(--assembl-pounamu)]">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function MoneyInput({ name, defaultValue }: { name: string; defaultValue: number }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-taupe-500">$</span>
      <input name={name} type="number" min={0} step={1000} defaultValue={defaultValue} className={`${CONTROL} pl-7`} />
    </div>
  );
}

function NumberInput({ name, defaultValue, suffix }: { name: string; defaultValue: number; suffix?: string }) {
  return (
    <div className="relative">
      <input name={name} type="number" min={0} step={1} defaultValue={defaultValue} className={`${CONTROL} ${suffix ? "pr-14" : ""}`} />
      {suffix ? <span className="absolute right-3 top-2.5 text-sm text-taupe-500">{suffix}</span> : null}
    </div>
  );
}

function Signal({ icon: Icon, title, body }: { icon: typeof Home; title: string; body: string }) {
  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <h2 className="mt-4 font-display text-3xl italic leading-none text-[color:var(--assembl-pounamu)]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
    </article>
  );
}
