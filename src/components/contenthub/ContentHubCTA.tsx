import { Link } from "react-router-dom";

const PLANS = [
  { name: "Starter", price: "$89", period: "/mo" },
  { name: "Pro", price: "$299", period: "/mo" },
  { name: "Business", price: "$599", period: "/mo" },
];

const ContentHubCTA = () => (
  <section className="px-4 sm:px-8 py-20">
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <h2
        className="font-display font-extrabold text-2xl sm:text-4xl halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Every agent. Every output. One subscription.
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
              <span className="font-display font-extrabold text-3xl" style={{ color: "hsl(var(--foreground))" }}>
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
              Start free trial →
            </Link>
          </div>
        ))}
      </div>
      <p className="font-body text-xs" style={{ color: "#5AADA0" }}>
        Launch pricing — locked in for early adopters
      </p>
    </div>
  </section>
);

export default ContentHubCTA;
