import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const C = {
  paper: "#FAF7F2",
  pounamu: "#2B6B57",
  gold: "#D4A853",
  text: "#23211F",
  secondary: "#6F6158",
};

const OFFERS = [
  ["WHĀNAU", "Tōro", "$29 / month", "Per whānau. School, money, routines, handovers, and the week ahead.", "Install Tōro", "/toro", false],
  ["HERO OFFER", "Industry Pack", "$5,000 / month", "Per kete. 6-8 specialist agents. Iho governance. Signal monitoring. Unlimited evidence packs.", "See Industry Pack", "/industry-pack", true],
  ["PROOF SPRINT", "Pilot Sprint", "$5,000 once-off", "Two weeks. We run one workflow end-to-end against your own data and ship the evidence pack.", "Book a sprint", "/pilot-sprint", false],
  ["OUTCOME", "Outcome", "Custom", "For operators who want us paid on signed evidence packs delivered, not seats.", "Talk to founder", "/contact", false],
] as const;

const ADD_ONS = [
  ["Extra compliance review", "$750/mo"],
  ["Gamified adoption", "$500/mo"],
  ["Custom voice", "$500/mo"],
  ["Multi-site", "$900/site"],
  ["Dedicated support", "$1,200/mo"],
  ["On-call response", "$2,000/mo"],
] as const;

const PricingPage = () => (
  <div className="min-h-screen" style={{ background: C.paper, color: C.text }}>
    <SEO
      title="Pricing — NZD, GST exclusive | Assembl"
      description="Tōro $29/mo · Industry Pack $5,000/mo · Pilot Sprint $5,000 once-off · Outcome custom."
      path="/pricing"
    />
    <BrandNav />

    <main>
      <section className="px-6 py-24 text-center lg:py-32">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-eyebrow uppercase" style={{ color: C.secondary }}>
            PRICING · NZD, GST EXCLUSIVE
          </p>
          <h1 className="mt-6 font-display text-display-xl font-light">
            <span lang="mi">Mahi</span> that earns its proof.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-body-lg" style={{ color: C.secondary }}>
            Four clean ways in: family, flat-rate industry fleet, two-week proof sprint, or outcome-based work.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-4">
          {OFFERS.map(([eyebrow, name, price, body, cta, to, featured]) => (
            <article
              key={name}
              className="flex min-h-[460px] flex-col rounded-[8px] border p-8"
              style={{
                background: featured ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.45)",
                borderColor: featured ? C.pounamu : "rgba(35,33,31,0.12)",
                boxShadow: featured ? "0 8px 40px rgba(35,33,31,0.12)" : "none",
              }}
            >
              <p className="font-mono text-eyebrow uppercase" style={{ color: C.secondary }}>
                {eyebrow}
              </p>
              <h2 className="mt-5 font-display text-display-md font-light">
                {name === "Tōro" ? <span lang="mi">Tōro</span> : name}
              </h2>
              <p className="mt-8 font-display text-display-md font-light">{price}</p>
              <p className="mt-6 text-body-md" style={{ color: C.secondary }}>{body}</p>
              <Link
                to={to}
                className="mt-auto inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                style={{
                  background: featured ? C.pounamu : "transparent",
                  border: featured ? "none" : `1px solid ${C.pounamu}55`,
                  color: featured ? "#FFFFFF" : C.pounamu,
                }}
              >
                {cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-7xl">
          <p className="font-mono text-eyebrow uppercase" style={{ color: C.secondary }}>
            ADD-ONS
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {ADD_ONS.map(([label, price]) => (
              <span
                key={label}
                className="group relative rounded-full border bg-white/55 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em]"
                style={{ borderColor: `${C.pounamu}55`, color: C.text }}
              >
                {label}
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-[6px] px-3 py-1.5 text-[11px] text-white opacity-0 shadow-card transition group-hover:opacity-100" style={{ background: C.text }}>
                  {price}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>

    <BrandFooter />
  </div>
);

export default PricingPage;

