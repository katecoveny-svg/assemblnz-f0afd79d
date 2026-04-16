import { useParams, useNavigate } from "react-router-dom";
import { KETE_DATA } from "@/components/kete/keteData";
import KeteIcon from "@/components/kete/KeteIcon";
import SEO from "@/components/SEO";
import GlowIcon from "@/components/GlowIcon";
import TextUsButton from "@/components/kete/TextUsButton";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

const SLUG_TO_PACK: Record<string, { packId: string; agentId: string }> = {
  manaaki: { packId: "manaaki", agentId: "aura" },
  waihanga: { packId: "waihanga", agentId: "kaupapa" },
  auaha: { packId: "auaha", agentId: "prism" },
  arataki: { packId: "waka", agentId: "motor" },
  pikau: { packId: "pikau", agentId: "gateway" },
  contracts: { packId: "contracts", agentId: "accord" },
};

const KeteDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const kete = KETE_DATA.find(k => k.slug === slug);

  if (!kete) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFBFC" }}>
        <div className="text-center">
          <h1 className="text-2xl text-white/80 mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>Kete not found</h1>
          <button onClick={() => navigate("/kete")} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#D4A843", border: "1px solid #D4A84330", background: "#D4A84310" }}>
            Back to collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${kete.name} — ${kete.englishName} | Assembl`} description={kete.description} />
      <div className="min-h-screen" style={{ background: "#FAFBFC" }}>
        {/* Hero */}
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
          <button onClick={() => navigate("/kete")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 mb-10 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <GlowIcon name="ArrowLeft" size={14} color="rgba(255,255,255,0.4)" />
            Back to Kete Collection
          </button>

          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-[200px] h-[220px] shrink-0">
              <KeteIcon name={kete.name} accentColor={kete.accentColor} accentLight={kete.accentLight} variant={kete.variant} size="large" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl text-white/95 tracking-[5px] uppercase mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                {kete.name}
              </h1>
              <p className="text-base tracking-[2px] uppercase mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: kete.accentColor }}>
                {kete.englishName}
              </p>
              <p className="text-base text-white/65 leading-relaxed max-w-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {kete.description}
              </p>
              <div className="flex items-center gap-4 mt-6">
                <span className="text-xs tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: kete.accentColor }}>
                  {kete.agentCount} agents
                </span>
                {kete.badge && (
                  <span className="text-[11px] tracking-[1px] uppercase text-gray-500 px-3 py-1 rounded" style={{ fontFamily: "'JetBrains Mono', monospace", background: `${kete.accentColor}15` }}>
                    {kete.badge}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Agents grid */}
          {kete.agents && kete.agents.length > 0 && (
            <section>
              <h2 className="text-lg text-white/70 tracking-[3px] uppercase mb-8" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                Specialist Agents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kete.agents.map(agent => (
                  <div key={agent.name} className="p-4 rounded-xl border transition-all duration-200 hover:border-gray-300"
                    style={{ background: "rgba(15,15,26,0.7)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kete.accentColor}15` }}>
                        <span className="text-[10px] font-bold" style={{ color: kete.accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
                          {agent.name.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/85 tracking-wider uppercase">{agent.name}</p>
                        <p className="text-[11px] text-white/40" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{agent.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <button onClick={() => navigate("/contact")} className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: `${kete.accentColor}20`, color: kete.accentColor, border: `1px solid ${kete.accentColor}30`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Get started
            </button>
            <TextUsButton keteName={kete.name} accentColor={kete.accentColor} />
          </div>
        </div>
      </div>
      {(() => {
        const pack = SLUG_TO_PACK[kete.slug] || { packId: "assembl", agentId: "echo" };
        return (
          <KeteAgentChat
            keteName={kete.name}
            keteLabel={kete.englishName}
            accentColor={kete.accentColor}
            defaultAgentId={pack.agentId}
            packId={pack.packId}
            starterPrompts={[
              `What can ${kete.name} agents do for my business?`,
              `How does onboarding work for ${kete.englishName}?`,
              "What compliance is covered?",
            ]}
          />
        );
      })()}
    </>
  );
};

export default KeteDetailPage;
