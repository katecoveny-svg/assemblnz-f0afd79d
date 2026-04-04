import { Link } from "react-router-dom";

const PLANS = [
  { name: "Kete Tīmatanga", price: "From $750", period: "/mo" },
  { name: "Kete Tupu", price: "From $1,500", period: "/mo" },
  { name: "Kete Rangatira", price: "From $4,000", period: "/mo" },
];

const ContentHubCTA = () => (
  <section className="px-4 sm:px-8 py-20">
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <h2
        className="font-display font-light text-2xl sm:text-4xl halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        78 specialist agents. 9 industry kete. One platform.
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="rounded-xl p-6 space-y-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="font-display font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>
              {plan.name}
            </p>
            <p>
              <span className="font-display font-light text-2xl" style={{ color: "hsl(var(--foreground))" }}>
                {plan.price}
              </span>
              <span className="font-body text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                {plan.period}
              </span>
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-body font-semibold transition-all"
              style={{
                background: "rgba(0,255,136,0.1)",
                color: "#5AADA0",
                border: "1px solid rgba(0,255,136,0.2)",
              }}
            >
              Book a Launch Sprint →
            </Link>
          </div>
        ))}
      </div>
      <p className="font-body text-xs" style={{ color: "#5AADA0" }}>
        All prices NZ$ + GST · Starts with a Launch Sprint
      </p>
    </div>
  </section>
);

export default ContentHubCTA;
