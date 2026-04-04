import React from "react";
import { useNavigate } from "react-router-dom";
import { KETE_DATA } from "./keteData";
import KeteCard from "./KeteCard";
import SEO from "@/components/SEO";

const KeteGrid: React.FC = () => {
  const navigate = useNavigate();
  const industry = KETE_DATA.filter(k => k.category === "industry");
  const specialist = KETE_DATA.filter(k => k.category === "specialist");
  const whanau = KETE_DATA.filter(k => k.category === "whanau");
  const totalAgents = KETE_DATA.reduce((s, k) => s + k.agentCount, 0);

  const Section = ({ title, kete }: { title: string; kete: typeof KETE_DATA }) => (
    <section className="mb-20 md:mb-24">
      <h2 className="text-2xl text-white/80 tracking-[4px] uppercase mb-10" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {kete.map(k => (
          <KeteCard
            key={k.slug}
            {...k}
            onClick={() => navigate(`/kete/${k.slug}`)}
          />
        ))}
      </div>
    </section>
  );

  return (
    <>
      <SEO title="The Kete Collection | Assembl" description="Nine industry-specific agent packs for Aotearoa. Industry Kete, Specialist Kete, and Whānau Kete." />
      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-8 py-16 md:py-20" style={{ background: "linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)" }}>
        {/* Starfield */}
        <div className="fixed inset-0 pointer-events-none -z-10" style={{
          backgroundImage: "radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.15), transparent), radial-gradient(1px 1px at 60px 70px, rgba(255,255,255,0.1), transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.12), transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }} />

        {/* Header */}
        <header className="text-center mb-20">
          <p className="text-xs text-white/50 tracking-[6px] uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            He Kete Mātauranga
          </p>
          <h1 className="text-4xl md:text-[56px] tracking-[2px] uppercase mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, background: "linear-gradient(135deg, #D4A843 0%, #F0D078 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Kete Collection
          </h1>
          <p className="text-base text-white/65 max-w-[600px] mx-auto leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Nine industry-specific agent packs, built for Aotearoa. Each kete brings together agents, templates, and workflows for their domain.
          </p>
        </header>

        <Section title="Industry Kete" kete={industry} />
        <Section title="Specialist Kete" kete={specialist} />
        <Section title="Whānau Kete" kete={whanau} />

        {/* Footer stat line */}
        <div className="flex justify-center items-center gap-3 mt-24 pt-10 border-t border-white/[0.05] text-sm tracking-[3px] uppercase text-white/50" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span>{KETE_DATA.length} KETE</span>
          <span>·</span>
          <span>{totalAgents} AGENTS</span>
          <span>·</span>
          <span>1 BRAIN</span>
        </div>
      </div>
    </>
  );
};

export default KeteGrid;
