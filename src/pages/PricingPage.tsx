import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

/* ── Mārama Whenua palette (locked) ── */
const C = {
  bg: "#F7F3EE",          // Mist
  cloud: "#EEE7DE",       // Cloud
  sand: "#D8C8B4",        // Sand
  taupe: "#9D8C7D",       // Taupe (headings)
  taupeDeep: "#6F6158",   // Taupe Deep (body text)
  gold: "#D9BC7A",        // Soft Gold (CTA)
  goldDeep: "#C9A862",
};

type Tier = {
  key: string;
  name: string;
  badge: string;
  price: string;
  cadence?: string;
  setup?: string;
  descriptor: string;
  features: string[];
  bestFor: string;
  cta: { label: string; to: string };
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    key: "grow",
    name: "Grow",
    badge: "Two kete",
    price: "$1,990",
    cadence: "/mo",
    setup: "+ $1,290 setup",
    descriptor:
      "Two specialist kete working across your operations — compliance, scheduling, reporting, creative. 40+ hours of operational work, handled every week.",
    features: [
      "Two kete of your choice",
      "Full platform access",
      "Xero, Deputy & Google integrations",
      "Evidence packs for every workflow",
      "Email support",
    ],
    bestFor:
      "Owner-operators with a team. One site or two, enough moving parts that the admin is eating your evenings.",
    cta: { label: "Request access", to: "/contact?plan=grow" },
  },
  {
    key: "enterprise",
    name: "Enterprise",
    badge: "All 7 kete",
    price: "$2,990",
    cadence: "/mo",
    setup: "+ $2,890 setup",
    descriptor:
      "Every kete, every workflow. Compliance, HR, scheduling, creative, logistics — quietly running while you focus on the work that grows the business.",
    features: [
      "All 7 kete, unlimited",
      "Full platform access",
      "Priority integrations (Xero, Deputy, Google, MYOB, Tanda)",
      "Named success manager",
      "Quarterly compliance review",
      "99.9% uptime SLA",
      "NZ data residency",
    ],
    bestFor:
      "Multi-site businesses, companies with 15+ staff, anyone who's outgrown spreadsheets and sticky notes but isn't ready to hire a compliance team.",
    cta: { label: "Request access", to: "/contact?plan=enterprise" },
    highlight: true,
  },
  {
    key: "outcome",
    name: "Outcome",
    badge: "Custom",
    price: "from $5,000",
    descriptor:
      "Bespoke engagement. When the work is bespoke and the evidence pack is the contract. We embed alongside your team, map your workflows, and build the agents that handle them. Pricing tied to the time we give back — typically 10–20% of measured savings.",
    features: [
      "Everything in Enterprise",
      "Custom workflow mapping",
      "Dedicated onboarding (we run it for the first month)",
      "Custom agent configuration",
      "Outcome-based pricing",
    ],
    bestFor:
      "Companies with high-value workflows — freight route optimisation, building maintenance scheduling, multi-site compliance — where getting it right saves tens of thousands.",
    cta: { label: "Talk to us", to: "/contact?plan=outcome" },
  },
];

const FAQS = [
  {
    q: "What's a kete?",
    a: "A kete is an industry-specific toolkit. Each one comes with specialist agents trained on NZ legislation, workflows, and operational patterns for that industry. MANAAKI covers hospitality. WAIHANGA covers construction. AUAHA covers creative. You pick the kete that match your business.",
  },
  {
    q: "What happens during setup?",
    a: "We connect Assembl to the tools you already use — Xero, Deputy, Google Workspace. We map your key workflows and configure the agents for your specific business. You'll be operational within a week, and we check in after 30 days to tune things.",
  },
  {
    q: "Can I start with one kete and add more later?",
    a: "Yes. Most customers start with Grow (two kete) and add more as they see the value. Moving to Enterprise is a plan change, not a migration — your data and workflows carry over.",
  },
  {
    q: "Do I need to change how my team works?",
    a: "No. Assembl connects to the tools your team already uses. Your staff keep using Xero, Deputy, Google — the agents work behind the scenes, pulling data in and pushing outputs back. Most of the value arrives through channels your team already checks: email, SMS, or the dashboard.",
  },
  {
    q: "What about my data?",
    a: "Your data stays in New Zealand on enterprise plans. We use Supabase with row-level security — your data is yours, isolated from every other customer. We never train models on your data.",
  },
  {
    q: "Is there a contract?",
    a: "Month to month. No lock-in. The setup fee covers onboarding and configuration. If you leave, we export your data and evidence packs.",
  },
];

const PricingPage = () => (
  <div className="min-h-screen" style={{ background: C.bg, color: C.taupeDeep }}>
    <SEO
      title="Pricing — Time returned. Capacity gained. | Assembl"
      description="Grow $1,990/mo · Enterprise $2,990/mo · Outcome from $5,000. Specialist kete that handle the operational work keeping your team from the work that matters."
      path="/pricing"
    />
    <BrandNav />

    {/* ═══ HEADER ═══ */}
    <section className="pt-32 pb-12 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <p
          className="text-[10px] tracking-[5px] uppercase mb-6 font-mono font-bold"
          style={{ color: C.taupe }}
        >
          — Pricing · NZD ex GST —
        </p>
        <h1
          className="font-display mb-6"
          style={{
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            lineHeight: 1.1,
            color: C.taupe,
            letterSpacing: "-0.01em",
          }}
        >
          Time returned. <em style={{ fontStyle: "italic", color: C.goldDeep }}>Capacity gained.</em>
        </h1>
        <p
          className="font-body text-[17px] leading-[1.7] max-w-2xl mx-auto"
          style={{ color: C.taupeDeep }}
        >
          Every kete handles the operational work that keeps your team from the work that matters.
          Pick the capacity your business needs.
        </p>
      </div>
    </section>

    {/* ═══ VALUE ANCHOR ═══ */}
    <section className="px-6 pb-14">
      <div
        className="max-w-2xl mx-auto rounded-3xl px-8 py-6 text-center backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: `1px solid ${C.sand}40`,
          boxShadow: "0 8px 30px rgba(111,97,88,0.06)",
        }}
      >
        <p className="font-body text-[14px] leading-[1.75]" style={{ color: C.taupeDeep }}>
          Most NZ businesses spend <strong style={{ color: C.taupe }}>$50,000+ a year</strong> on
          admin, compliance paperwork, and scheduling. That's a person's salary, spent on work that
          doesn't grow the business. Assembl gives you that capacity back.
        </p>
      </div>
    </section>

    {/* ═══ TIER CARDS ═══ */}
    <section className="px-6 pb-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className="relative rounded-3xl backdrop-blur-xl flex flex-col overflow-hidden"
            style={{
              background: tier.highlight ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.78)",
              border: tier.highlight
                ? `2px solid ${C.gold}`
                : `1px solid ${C.sand}50`,
              boxShadow: tier.highlight
                ? "0 16px 50px rgba(217,188,122,0.18), 0 8px 30px rgba(111,97,88,0.08)"
                : "0 8px 30px rgba(111,97,88,0.08)",
            }}
          >
            {tier.highlight && (
              <div
                className="absolute top-5 right-5 px-3 py-1 rounded-full font-mono text-[10px] tracking-[2px] uppercase font-bold"
                style={{ background: C.gold, color: "#FFFFFF" }}
              >
                Most popular
              </div>
            )}

            <div className="p-8 flex flex-col flex-1">
              {/* Tier name */}
              <h3
                className="font-display mb-2"
                style={{
                  fontWeight: 400,
                  fontSize: "28px",
                  color: C.taupe,
                  letterSpacing: "0.02em",
                }}
              >
                {tier.name}
              </h3>

              {/* Badge */}
              <p
                className="font-mono text-[10px] tracking-[3px] uppercase mb-6"
                style={{ color: C.taupeDeep, opacity: 0.7 }}
              >
                {tier.badge}
              </p>

              {/* Price */}
              <div className="mb-2 flex items-baseline gap-1">
                <span
                  className="font-display"
                  style={{ fontWeight: 400, fontSize: "44px", color: C.taupe, lineHeight: 1 }}
                >
                  {tier.price}
                </span>
                {tier.cadence && (
                  <span
                    className="font-body text-[15px]"
                    style={{ color: C.taupeDeep, opacity: 0.7 }}
                  >
                    {tier.cadence}
                  </span>
                )}
              </div>

              {tier.setup && (
                <p
                  className="font-mono text-[12px] mb-6"
                  style={{ color: C.goldDeep, fontWeight: 600 }}
                >
                  {tier.setup}
                </p>
              )}
              {!tier.setup && <div className="mb-6" />}

              {/* Descriptor */}
              <p
                className="font-body text-[14px] leading-[1.7] mb-7 pb-7"
                style={{
                  color: C.taupeDeep,
                  borderBottom: `1px solid ${C.sand}50`,
                }}
              >
                {tier.descriptor}
              </p>

              {/* Includes */}
              <p
                className="font-mono text-[10px] tracking-[2.5px] uppercase mb-4"
                style={{ color: C.taupe, fontWeight: 700 }}
              >
                Includes
              </p>
              <ul className="space-y-3 mb-7 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: `${C.gold}25`,
                        border: `1px solid ${C.gold}50`,
                      }}
                    >
                      <Check size={11} style={{ color: C.goldDeep }} strokeWidth={2.5} />
                    </div>
                    <span
                      className="font-body text-[14px] leading-[1.55]"
                      style={{ color: C.taupeDeep }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Best for */}
              <div
                className="rounded-2xl px-4 py-3 mb-6"
                style={{ background: C.cloud, border: `1px solid ${C.sand}40` }}
              >
                <p
                  className="font-mono text-[9px] tracking-[2.5px] uppercase mb-2"
                  style={{ color: C.taupe, fontWeight: 700 }}
                >
                  Best for
                </p>
                <p
                  className="font-body text-[13px] leading-[1.6]"
                  style={{ color: C.taupeDeep }}
                >
                  {tier.bestFor}
                </p>
              </div>

              {/* CTA */}
              <Link
                to={tier.cta.to}
                className="block text-center w-full py-3.5 rounded-full font-body text-[13px] tracking-[1.5px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: tier.highlight
                    ? `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`
                    : "transparent",
                  color: tier.highlight ? "#FFFFFF" : C.goldDeep,
                  border: tier.highlight ? "none" : `1.5px solid ${C.gold}`,
                  boxShadow: tier.highlight
                    ? "0 6px 20px rgba(217,188,122,0.35)"
                    : "none",
                }}
              >
                {tier.cta.label}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ═══ THE MATHS ═══ */}
    <section className="px-6 pb-24">
      <div
        className="max-w-3xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl p-10"
        style={{
          border: `1px solid ${C.sand}50`,
          boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
        }}
      >
        <h2
          className="font-display mb-6"
          style={{
            fontWeight: 400,
            fontSize: "30px",
            color: C.taupe,
            lineHeight: 1.2,
          }}
        >
          What does $1,990 a month actually buy?
        </h2>
        <div className="space-y-5 font-body text-[15px] leading-[1.75]" style={{ color: C.taupeDeep }}>
          <p>
            A part-time operations coordinator costs around{" "}
            <strong style={{ color: C.taupe }}>$35,000 a year</strong>. That's $2,900 a month
            before KiwiSaver, ACC, leave, and training. Assembl does the same operational work —
            compliance checks, scheduling, reporting, evidence packs — for $1,990. No sick days, no
            holidays, no recruitment costs. And it works at 2am when the morning shift roster needs
            adjusting.
          </p>
          <p>
            The enterprise tier? A compliance officer costs $75,000+. A marketing coordinator
            another $55,000. Assembl's enterprise plan gives you both capabilities for{" "}
            <strong style={{ color: C.taupe }}>$35,880 a year</strong>. That's less than one salary
            covering the work of several roles.
          </p>
        </div>
      </div>
    </section>

    {/* ═══ FAQ ═══ */}
    <section className="px-6 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p
            className="font-mono text-[10px] tracking-[5px] uppercase mb-4 font-bold"
            style={{ color: C.taupe }}
          >
            — Common questions —
          </p>
          <h2
            className="font-display"
            style={{
              fontWeight: 300,
              fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
              color: C.taupe,
              lineHeight: 1.15,
            }}
          >
            Things people ask before signing up.
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-3xl bg-white/80 backdrop-blur-xl px-6"
          style={{
            border: `1px solid ${C.sand}50`,
            boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
          }}
        >
          {FAQS.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`faq-${i}`}
              className={i === FAQS.length - 1 ? "border-b-0" : ""}
              style={{ borderColor: `${C.sand}40` }}
            >
              <AccordionTrigger
                className="font-display text-left hover:no-underline py-5"
                style={{
                  fontWeight: 400,
                  fontSize: "18px",
                  color: C.taupe,
                }}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent
                className="font-body text-[15px] leading-[1.75] pb-5"
                style={{ color: C.taupeDeep }}
              >
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default PricingPage;
