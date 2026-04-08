import { useEffect, useState } from "react";
import AssemblHeroAgent from "@/components/AssemblHeroAgent";

const ContentHubHero = () => {
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    const target = 9;
    const duration = 2000;
    const step = duration / target;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setAgentCount(current);
      if (current >= target) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative px-4 sm:px-8 pt-20 pb-8 text-center">
      <div className="flex justify-center mb-6">
        <AssemblHeroAgent size={260} />
      </div>
      <h1
        className="font-display font-light text-2xl sm:text-4xl lg:text-5xl tracking-tight halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        See what your workflows produce
      </h1>
      <p
        className="mt-3 font-body text-sm sm:text-base max-w-xl mx-auto"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Real outputs from Assembl's specialist workflows — checks, reminders, approvals
      </p>
      <div
        className="mt-4 font-mono-jb text-xs tracking-widest"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        <span className="text-emerald-glow">{agentCount}</span> industry kete ·{" "}
        <span className="text-glow-cyan">Policy-gated</span> ·{" "}
        <span className="text-glow-purple">Built for NZ</span>
      </div>
    </section>
  );
};

export default ContentHubHero;
