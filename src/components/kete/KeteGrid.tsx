import React from "react";
import { useNavigate } from "react-router-dom";
import { KETE_DATA, SHARED_CORE_AGENTS, TOTAL_AGENTS } from "./keteData";
import KeteCard from "./KeteCard";
import SEO from "@/components/SEO";

const KeteGrid: React.FC = () => {
  const navigate = useNavigate();
  const industry = KETE_DATA.filter(k => k.category === "industry");
  const specialist = KETE_DATA.filter(k => k.category === "specialist");
  const whanau = KETE_DATA.filter(k => k.category === "whanau");

  const Section = ({ title, kete }: { title: string; kete: typeof KETE_DATA }) => (
    <section className="mb-20 md:mb-24">
      <h2
        className="text-2xl tracking-[4px] uppercase mb-10"
        style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 300,
          color: "rgba(255,255,255,0.8)",
        }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {kete.map((k, i) => (
          <KeteCard
            key={k.slug}
            name={k.name}
            englishName={k.englishName}
            description={k.description}
            agentCount={k.agentCount}
            accentColor={k.accentColor}
            accentLight={k.accentLight}
            variant={k.variant}
            badge={k.badge}
            index={i}
            onClick={() => navigate(`/kete/${k.slug}`)}
          />
        ))}
      </div>
    </section>
  );

  return (
    <>
      <SEO
        title="The Kete Collection | assembl"
        description="Five industry-specific kete plus a shared core platform — built in Aotearoa, grounded in NZ legislation."
      />
      <div className="kete-grid-wrapper relative w-full max-w-[1400px] mx-auto px-6 md:px-8 py-16 md:py-20">
        {/* Starfield */}
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage:
              "radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.2), transparent)," +
              "radial-gradient(2px 2px at 60px 70px, rgba(255,255,255,0.15), transparent)," +
              "radial-gradient(1px 1px at 50px 50px, rgba(255,255,255,0.25), transparent)," +
              "radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.2), transparent)," +
              "radial-gradient(2px 2px at 90px 10px, rgba(255,255,255,0.1), transparent)",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Header */}
        <header className="text-center mb-20">
          <p
            className="text-xs tracking-[6px] uppercase mb-3"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            He Kete Mātauranga
          </p>
          <h1
            className="text-4xl md:text-[56px] tracking-[2px] uppercase mb-4"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              background: "linear-gradient(135deg, #3A7D6E 0%, #7ECFC2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Kete Collection
          </h1>
          <p
            className="text-base max-w-[600px] mx-auto leading-relaxed"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Five industry kete plus a shared core platform, built for Aotearoa. Each kete brings together specialist workflows, templates, and policy guidance for its domain.
          </p>
        </header>

        <Section title="Industry Kete" kete={industry} />
        <Section title="Specialist Kete" kete={specialist} />
        <Section title="Whānau Kete" kete={whanau} />

        {/* Footer stat line */}
        <div
          className="flex justify-center items-center gap-3 mt-24 pt-10 border-t border-white/[0.05] text-sm tracking-[3px] uppercase"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>8 KETE</span>
          <span>·</span>
          <span>{SHARED_CORE_AGENTS.length} CORE</span>
          <span>·</span>
          <span>1 SHARED INTELLIGENCE</span>
        </div>
      </div>
    </>
  );
};

export default KeteGrid;
