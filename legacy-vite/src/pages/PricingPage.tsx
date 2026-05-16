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
  {
    eyebrow: "WHĀNAU",
    name: "Tōro Family",
    price: "NZ$29/mo",
    setup: "$0 setup",
    body: "The whānau navigator for school, money, routines, and the week ahead.",
    features: ["Tōro whānau navigator", "Reviewed family actions and records", "Cancel any time"],
    cta: "Start Tōro",
    to: "/toro",
    highlight: false,
  },
  {
    eyebrow: "TRY BEFORE YOU BUY",
    name: "Pilot Sprint",
    price: "NZ$5,000 once-off",
    setup: "No subscription required",
    body: "Two weeks. One workflow. One evidence pack. Money-back if no time saved by week two.",
    features: ["Scope and draft", "Review and ship", "Evidence pack delivered"],
    cta: "Book a Pilot Sprint",
    to: "/pilot-sprint",
    highlight: false,
  },
  {
    eyebrow: "FLAT-RATE OPERATIONS",
    name: "Industry Pack",
    price: "NZ$5,000/mo",
    setup: "$0 setup",
    body: "Six to eight specialist agents sequenced into one operating loop for one industry kete.",
    features: ["Pick one of the 8 industry kete", "Switch kete any time", "No usage limits", "Cancel any time"],
    cta: "See Industry Pack",
    to: "/industry-pack",
    highlight: true,
  },
  {
    eyebrow: "BESPOKE",
    name: "Outcome",
    price: "from NZ$5,000",
    setup: "Scoped engagement",
    body: "Custom engagements for high-value workflows where the scope, evidence pack, and commercial model are agreed up front.",
    features: ["Custom workflow map", "Named engagement team", "Evidence-pack contract"],
    cta: "Talk to us",
    to: "/contact",
    highlight: false,
  },
];

const PricingPage = () => (
  <div className="min-h-screen" style={{ background: C.paper, color: C.text }}>
    <SEO
      title="Pricing — NZD, GST exclusive | Assembl"
      description="Tōro Family NZ$29/mo · Industry Pack NZ$5,000/mo · Pilot Sprint NZ$5,000 once-off · Outcome from NZ$5,000."
      path="/pricing"
    />
    <BrandNav />

    <main>
      <section className="px-6 pb-14 pt-32 text-center">
        <div className="mx-auto max-w-4xl">
          <p
            className="mb-6 font-mono text-eyebrow uppercase"
            style={{ color: C.secondary }}
          >
            PRICING · NZD, GST EXCLUSIVE
          </p>
          <h1 className="font-display text-display-xl font-light">
            One flat industry pack. One pilot to prove it.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-body-lg" style={{ color: C.secondary }}>
            Start with a Pilot Sprint, then decide whether the monthly Industry Pack is right for
            your team. Use code ANNUAL12 for 12% off annual.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <Link
          to="/industry-pack"
          className="group mx-auto grid max-w-6xl gap-6 p-8 transition duration-200 hover:-translate-y-0.5 md:grid-cols-[1fr_auto] md:items-center md:p-10"
          style={{
            background: "rgba(255,255,255,0.52)",
            border: `1px solid ${C.gold}72`,
          }}
        >
          <div>
            <p className="font-mono text-eyebrow uppercase" style={{ color: C.pounamu }}>
              INDUSTRY PACK
            </p>
            <h2 className="mt-3 font-display text-display-md font-light">
              NZ$5,000 a month. Pick one kete, switch any time.
            </h2>
            <p className="mt-4 max-w-2xl text-body-md" style={{ color: C.secondary }}>
              Six to eight specialist agents sequenced into one operating loop: find work, quote it,
              run it, close the books.
            </p>
          </div>
          <span
            className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
            style={{ background: C.pounamu }}
          >
            See what&apos;s inside
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      <section className="px-6 pb-24">
        <div
          className="mx-auto grid max-w-6xl gap-px border md:grid-cols-2 lg:grid-cols-4"
          style={{ background: `${C.gold}55`, borderColor: `${C.gold}55` }}
        >
          {OFFERS.map((offer) => (
            <article key={offer.name} className="flex min-h-[430px] flex-col p-8" style={{ background: C.paper }}>
              <p className="font-mono text-eyebrow uppercase" style={{ color: C.secondary }}>
                {offer.eyebrow}
              </p>
              <h2 className="mt-5 font-display text-display-md font-light">{offer.name}</h2>
              <p className="mt-8 font-display text-display-md font-light">{offer.price}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: C.secondary }}>
                {offer.setup}
              </p>
              <p className="mt-6 text-sm leading-relaxed" style={{ color: C.secondary }}>
                {offer.body}
              </p>
              <ul className="mt-8 space-y-3 text-sm" style={{ color: C.secondary }}>
                {offer.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 h-px w-4 shrink-0" style={{ background: C.gold }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={offer.to}
                className="mt-auto inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                style={{
                  background: offer.highlight ? C.pounamu : "transparent",
                  border: offer.highlight ? "none" : `1px solid ${C.pounamu}55`,
                  color: offer.highlight ? "#FFFFFF" : C.pounamu,
                }}
              >
                {offer.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-24" style={{ borderTop: `1px solid ${C.gold}55` }}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-eyebrow uppercase" style={{ color: C.secondary }}>
              THE CLEAN PATH
            </p>
            <h2 className="mt-5 font-display text-display-lg font-light">
              Try it for two weeks. Keep it if the time comes back.
            </h2>
          </div>
          <div>
            <p className="text-body-lg" style={{ color: C.secondary }}>
              Pilot Sprint proves one workflow with one evidence pack. Industry Pack turns the
              whole operator&apos;s loop into a monthly fleet. Outcome stays available when the work
              is bespoke.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/pilot-sprint"
                className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold text-white"
                style={{ background: C.pounamu }}
              >
                Book a Pilot Sprint
              </Link>
              <Link
                to="/industry-pack"
                className="inline-flex h-12 items-center justify-center rounded-full border px-8 text-sm font-semibold"
                style={{ borderColor: `${C.pounamu}55`, color: C.pounamu }}
              >
                See Industry Pack
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>

    <BrandFooter />
  </div>
);

export default PricingPage;
