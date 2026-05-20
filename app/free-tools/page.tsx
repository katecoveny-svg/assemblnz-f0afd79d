import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, Calculator, Car, CheckCircle2, PlugZap, ShieldCheck, Sparkles, ThermometerSun, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free NZ Business Tools',
  description:
    'Free calculators for NZ operators: electrification savings, GST, employment cost, PAYE, minimum wage, and food safety temperature checks.',
};

const tools = [
  {
    name: 'Electrification savings',
    slug: 'nz_sme_electrification_savings',
    description: 'Estimate annual savings, payback, capex, carbon reduction, and the first machines to switch.',
    href: '/electrify',
    icon: PlugZap,
    kete: 'Arataki · Pīkau · Waihanga · Manaaki',
  },
  {
    name: 'HAPAI adoption score',
    slug: 'hapai_agent_adoption_assessment',
    description: 'Run a 60-second gamified agent adoption check and see your team tier, session rhythm, and next play.',
    href: '/hapai#assessment',
    icon: Trophy,
    kete: 'Team enablement',
  },
  {
    name: 'GST calculator',
    slug: 'nz_gst_calculator',
    description: 'Add or remove 15% GST for NZ transactions.',
    href: '#mcp',
    icon: Calculator,
    kete: 'Ledger',
  },
  {
    name: 'Employment cost',
    slug: 'nz_employment_cost',
    description: 'Turn a salary into a fuller annual cost estimate with KiwiSaver, ACC, leave, and hiring cost.',
    href: '#mcp',
    icon: BadgeDollarSign,
    kete: 'Ako · Hoko · Manaaki',
  },
  {
    name: 'PAYE estimate',
    slug: 'nz_paye_calculator',
    description: 'Estimate PAYE and net income from annual gross pay.',
    href: '#mcp',
    icon: ShieldCheck,
    kete: 'Ledger',
  },
  {
    name: 'Minimum wage check',
    slug: 'nz_minimum_wage_check',
    description: 'Check an hourly rate against adult, starting-out, or training wage settings.',
    href: '#mcp',
    icon: CheckCircle2,
    kete: 'Manaaki · Hoko',
  },
  {
    name: 'Food temperature check',
    slug: 'nz_food_safety_temp_check',
    description: 'Check chiller, freezer, cooking, hot holding, and cooling temperatures.',
    href: '#mcp',
    icon: ThermometerSun,
    kete: 'Manaaki',
  },
];

const proofPoints = [
  'Deterministic maths, not guesswork',
  'NZ-specific assumptions and compliance context',
  'Useful without a login',
  'Ready for MCP clients and operator workflows',
];

export default function FreeToolsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              Free NZ business tools
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(4rem,10vw,8.5rem)] font-light leading-[0.85]">
              Work that earns its proof.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              Practical calculators for operators who need a number they can
              explain. Start with the small-business electrification calculator,
              then use the MCP tools anywhere your work already happens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/electrify" className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                Calculate electric savings <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#mcp" className="btn-ghost inline-flex h-12 items-center px-6">
                View MCP tools
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5 shadow-[0_20px_70px_rgba(35,33,31,0.08)]">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[6px]">
              <Image
                src="/img/hapai/tools/electrify-vessel.jpg"
                alt="Sculptural vessel representing the electrification calculator"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#23211F]/65 to-transparent" />
              <Sparkles className="absolute bottom-4 left-4 h-7 w-7 text-[#FAF7F2]" aria-hidden />
            </div>
            <div className="flex items-start justify-between gap-5 border-b border-[rgba(35,33,31,0.10)] pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                  Featured free tool
                </p>
                <h2 className="mt-3 font-display text-4xl font-light">If your business went electric</h2>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-[color:var(--assembl-pounamu)] text-[#FAF7F2]">
                <Car className="h-6 w-6" aria-hidden />
              </div>
            </div>
            <div className="grid gap-4 py-5 sm:grid-cols-2">
              <Metric label="Annual savings" value="fuel + power" />
              <Metric label="Payback" value="years" />
              <Metric label="10-year view" value="NZD" />
              <Metric label="Carbon avoided" value="tCO2e" />
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
              Built from the live `/electrify` calculator model: vehicles, heat
              pumps, rooftop solar, capex, finance rates, and a recommended
              switch sequence. Sources include MBIE, EECA, MfE, NZTA, and
              Rewiring Aotearoa assumptions.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
          {proofPoints.map((point) => (
            <div key={point} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
              <CheckCircle2 className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="mcp" className="border-y border-[rgba(35,33,31,0.10)] bg-white/45 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                assembl-mcp
              </p>
              <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.5rem)] font-light leading-[0.9]">
                Free tools for everyday operator maths.
              </h2>
            </div>
            <div className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] px-4 py-3">
              <p className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                supabase/functions/assembl-mcp
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  href={tool.href}
                  className="group rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-5 transition hover:border-[rgba(43,107,87,0.35)] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <ArrowRight className="h-4 w-4 text-[color:var(--text-secondary)] transition group-hover:translate-x-1 group-hover:text-[color:var(--assembl-pounamu)]" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-light">{tool.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">{tool.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 font-mono text-[10px] text-[color:var(--text-secondary)]">
                      {tool.slug}
                    </span>
                    <span className="rounded-full border border-[rgba(35,33,31,0.10)] px-3 py-1 text-[11px] text-[color:var(--text-secondary)]">
                      {tool.kete}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              How to call it
            </p>
            <h2 className="mt-4 font-display text-5xl font-light leading-[0.9]">
              One server. Useful tools. Clear outputs.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-body)]">
              The MCP endpoint lists the tools with JSON schemas, then returns
              plain structured JSON for each call. The calculators are free
              because they are door-openers: useful first, commercial later.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#23211F] p-5 text-xs leading-relaxed text-[#FAF7F2]">
{`{
  "jsonrpc": "2.0",
  "id": "demo",
  "method": "tools/call",
  "params": {
    "name": "nz_sme_electrification_savings",
    "arguments": {
      "business_type": "construction",
      "region": "Waikato",
      "monthly_fuel_spend_nzd": 1800,
      "fuel_types": ["diesel"],
      "vehicle_count": 3,
      "vehicle_type": "light_commercial",
      "premises_type": "lease_long_term",
      "rooftop_solar_suitable": "unsure",
      "monthly_electricity_spend_nzd": 900
    }
  }
}`}
          </pre>
        </div>
      </section>

      <section className="bg-[color:var(--assembl-pounamu)] px-5 py-12 text-[#FAF7F2] md:px-10 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FAF7F2]/70">
              Start with the electric maths
            </p>
            <h2 className="mt-3 font-display text-5xl font-light leading-[0.9] text-[#FAF7F2]">
              Find the savings hiding in the machines.
            </h2>
          </div>
          <Link href="/electrify" className="inline-flex h-12 items-center justify-center rounded-full bg-[#FAF7F2] px-6 text-sm font-medium text-[color:var(--assembl-pounamu)]">
            Open the calculator
          </Link>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-light">{value}</p>
    </div>
  );
}
