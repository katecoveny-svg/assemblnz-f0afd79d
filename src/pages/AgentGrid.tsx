import { useState } from "react";
import { Link } from "react-router-dom";
import { agents, sectors } from "@/data/agents";
import AssemblLogo from "@/components/AssemblLogo";
import RobotIcon from "@/components/RobotIcon";

const AgentGrid = () => {
  const [activeSector, setActiveSector] = useState("All");

  const filtered = activeSector === "All" ? agents : agents.filter(a => a.sector === activeSector);

  return (
    <div className="min-h-screen star-field">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <AssemblLogo size={36} />
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold tracking-[0.2em] text-foreground">ASSEMBL</span>
          <span className="font-mono-jb text-xs text-muted-foreground">.co.nz</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-foreground">
            Your AI <span className="text-gradient-hero">workforce</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Hyper-specialised AI agents for NZ industries. Tap any agent to chat live.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                activeSector === sector
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/10 hover:text-foreground"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Agent Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((agent, i) => (
            <Link
              key={agent.id}
              to={`/chat/${agent.id}`}
              className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 opacity-0 animate-fade-up"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: "forwards",
                borderColor: "hsl(0 0% 100% / 0.03)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = agent.color + "30";
                e.currentTarget.style.boxShadow = `0 0 20px ${agent.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.03)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Top glow line */}
              <div
                className="absolute top-0 left-4 right-4 h-px opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
              />

              <div className="flex items-start justify-between mb-3">
                <RobotIcon color={agent.color} size={40} />
                <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
              </div>

              <h3 className="text-base font-bold text-foreground tracking-wide">{agent.name}</h3>
              <p className="text-xs font-medium mb-1" style={{ color: agent.color }}>{agent.role}</p>
              <p className="text-xs italic text-muted-foreground mb-3">"{agent.tagline}"</p>

              {/* Traits */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {agent.traits.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-foreground/60">{t}</span>
                ))}
              </div>

              {/* Expertise */}
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.expertise.map(e => (
                  <span key={e} className="font-mono-jb text-[9px] px-1.5 py-0.5 rounded bg-muted text-foreground/50">{e}</span>
                ))}
              </div>

              {/* Chat CTA */}
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: agent.color }}>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
                  style={{ backgroundColor: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
                />
                Chat now →
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AssemblLogo size={24} />
              <span className="font-bold tracking-[0.2em] text-foreground">ASSEMBL</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Hyper-specialised AI agents built for New Zealand industries.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Links</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="https://assembl.co.nz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">assembl.co.nz</a></li>
              <li><a href="mailto:hello@assembl.co.nz" className="hover:text-primary transition-colors">hello@assembl.co.nz</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Social</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="https://instagram.com/assemblnz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Assembl. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AgentGrid;
