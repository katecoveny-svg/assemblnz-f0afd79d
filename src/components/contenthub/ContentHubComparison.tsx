import { COMPARISONS } from "@/data/contentHubData";

const ContentHubComparison = () => (
  <section className="px-4 sm:px-8 py-16">
    <div className="max-w-6xl mx-auto">
      <h2
        className="font-syne font-extrabold text-2xl sm:text-3xl text-center mb-10 halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        What Assembl replaces
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPARISONS.map((c) => (
          <div
            key={c.agent}
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="h-1" style={{ background: `${c.agentColor}40` }} />
            <div className="p-5 space-y-3">
              <p
                className="font-mono-jb text-[10px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Replaces
              </p>
              <p className="font-jakarta text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
                {c.replaces}
              </p>
              <p className="font-jakarta text-lg font-bold line-through" style={{ color: "rgba(255,255,255,0.25)" }}>
                {c.theirCost}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: c.agentColor }}
                />
                <span className="font-syne font-bold text-xs" style={{ color: c.agentColor }}>
                  {c.agent}
                </span>
                <span className="font-jakarta text-sm font-bold" style={{ color: "#5AADA0" }}>
                  Included from {c.assemblCost}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ContentHubComparison;
