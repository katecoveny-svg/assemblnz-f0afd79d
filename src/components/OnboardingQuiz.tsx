import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { agents } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import { assemblMark } from "@/assets/brand";
import ParticleField from "@/components/ParticleField";

const NexusHero3D = lazy(() => import("@/components/NexusHero3D"));
import {
  NeonBuilding,
  NeonFamily,
  NeonHammer,
  NeonSeedling,
  NeonClipboard,
  NeonDocument,
  NeonMegaphone,
  NeonTeam,
  NeonCoin,
  NeonFactory,
} from "@/components/NeonIcons";

type Step = "welcome" | "who" | "pain" | "results";

interface QuizResult {
  agentIds: string[];
  filter?: string;
}

const PAIN_MAP: Record<string, string[]> = {
  compliance: ["legal", "accounting", "property"],
  paperwork: ["customs", "accounting", "pm"],
  marketing: ["marketing", "sales"],
  staff: ["legal", "hospitality"],
  tax: ["accounting"],
  industry: [],
};

const WHO_OPTIONS = [
  { key: "business", icon: <NeonBuilding size={28} />, label: "I run a business" },
  { key: "household", icon: <NeonFamily size={28} />, label: "I'm managing a household" },
  { key: "trade", icon: <NeonHammer size={28} />, label: "I work in a specific trade or industry" },
  { key: "explore", icon: <NeonSeedling size={28} />, label: "I just want to explore" },
];

const PAIN_OPTIONS = [
  { key: "compliance", icon: <NeonClipboard size={24} />, label: "Compliance and regulations" },
  { key: "paperwork", icon: <NeonDocument size={24} />, label: "Paperwork and data entry" },
  { key: "marketing", icon: <NeonMegaphone size={24} />, label: "Marketing and sales" },
  { key: "staff", icon: <NeonTeam size={24} />, label: "Staff and HR" },
  { key: "tax", icon: <NeonCoin size={24} />, label: "Tax and finances" },
  { key: "industry", icon: <NeonFactory size={24} />, label: "Industry-specific questions" },
];

/* Floating ambient orb */
const FloatingOrb = ({ color, size, top, left, delay }: { color: string; size: number; top: string; left: string; delay: string }) => (
  <div
    className="absolute rounded-full animate-float-orb pointer-events-none"
    style={{
      width: size,
      height: size,
      top,
      left,
      background: `radial-gradient(circle, ${color}18, transparent 70%)`,
      filter: `blur(${size / 3}px)`,
      animationDelay: delay,
    }}
  />
);

const OnboardingQuiz = ({ onComplete }: { onComplete: (filter?: string) => void }) => {
  const [step, setStep] = useState<Step>("welcome");
  const [result, setResult] = useState<QuizResult | null>(null);
  const navigate = useNavigate();

  const handleWho = (choice: string) => {
    if (choice === "household") {
      navigate("/chat/operations");
      return;
    }
    if (choice === "explore") {
      onComplete();
      return;
    }
    setStep("pain");
  };

  const handlePain = (choice: string) => {
    if (choice === "industry") {
      onComplete();
      return;
    }
    const ids = PAIN_MAP[choice] || [];
    setResult({ agentIds: ids });
    setStep("results");
  };

  const recommendedAgents = result?.agentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean)
    .slice(0, 3) || [];

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Living particle background */}
      <ParticleField />

      {/* Floating ambient orbs */}
      <FloatingOrb color="#5AADA0" size={300} top="-10%" left="-5%" delay="0s" />
      <FloatingOrb color="#C85A54" size={250} top="60%" left="75%" delay="4s" />
      <FloatingOrb color="#3A6A9C" size={200} top="30%" left="50%" delay="8s" />

      <div className="w-full max-w-lg relative z-10">
        {step === "welcome" && (
          <div className="text-center space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            {/* 3D Robot */}
            <Suspense fallback={
              <div className="w-full h-[280px] sm:h-[340px] flex items-center justify-center">
                <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(212,168,67,0.3)]" >
              </div>
            }>
              <NexusHero3D />
            </Suspense>
            <div>
              <h1 className="text-3xl font-display font-light text-foreground mb-2">
                Welcome to{" "}
                <span className="tracking-[3px] text-gradient-hero">ASSEMBL</span>
              </h1>
              <p className="text-muted-foreground text-sm font-body">
                Let's find the right AI agent for you in 30 seconds.
              </p>
            </div>
            <button
              onClick={() => setStep("who")}
              className="group relative px-10 py-3.5 rounded-2xl font-display font-bold text-sm transition-all bg-primary text-primary-foreground overflow-hidden hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5"
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep opacity-0 group-hover:opacity-100" />
              <span className="relative z-10">Get started</span>
            </button>
          </div>
        )}

        {step === "who" && (
          <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <h2 className="text-xl font-display font-bold text-foreground text-center">What best describes you?</h2>
            <div className="grid grid-cols-1 gap-3">
              {WHO_OPTIONS.map((opt, i) => (
                <button
                  key={opt.key}
                  onClick={() => handleWho(opt.key)}
                  className="group relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 opacity-0 animate-fade-up overflow-hidden"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: "forwards",
                    background: 'rgba(14, 14, 26, 0.7)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {/* Top edge glow */}
                  <span className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 group-hover:opacity-50 transition-opacity" />
                  <span className="animate-neon-pulse text-primary">{opt.icon}</span>
                  <span className="text-sm font-body font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "pain" && (
          <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <h2 className="text-xl font-display font-bold text-foreground text-center">What's your biggest time drain?</h2>
            <div className="grid grid-cols-1 gap-3">
              {PAIN_OPTIONS.map((opt, i) => (
                <button
                  key={opt.key}
                  onClick={() => handlePain(opt.key)}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 opacity-0 animate-fade-up overflow-hidden"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: "forwards",
                    background: 'rgba(14, 14, 26, 0.7)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <span className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-20 group-hover:opacity-50 transition-opacity" />
                  <span className="animate-neon-pulse text-accent">{opt.icon}</span>
                  <span className="text-sm font-body font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <h2 className="text-xl font-display font-bold text-foreground text-center">We recommend these agents for you:</h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendedAgents.map((agent, i) =>
                agent ? (
                  <button
                    key={agent.id}
                    onClick={() => navigate(`/chat/${agent.id}`)}
                    className="group relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 opacity-0 animate-fade-up overflow-hidden hover:-translate-y-1 hover:scale-[1.01]"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationFillMode: "forwards",
                      background: 'rgba(14, 14, 26, 0.7)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1px solid ${agent.color}20`,
                      boxShadow: `0 0 20px ${agent.color}08`,
                    }}
                  >
                    {/* Agent-colour top edge glow */}
                    <span
                      className="absolute top-0 left-[15%] right-[15%] h-px opacity-30 group-hover:opacity-60 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
                    />
                    {/* Neon halo ring around avatar */}
                    <div
                      className="relative shrink-0 rounded-full"
                      style={{ boxShadow: `0 0 12px ${agent.color}25` }}
                    >
                      <AgentAvatar agentId={agent.id} color={agent.color} size={40} showGlow={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-foreground">{agent.name}</h3>
                      <p className="text-xs font-body mb-1" style={{ color: agent.color }}>{agent.role}</p>
                      <p className="text-xs text-muted-foreground font-body italic truncate">"{agent.tagline}"</p>
                    </div>
                    <span
                      className="text-xs font-body font-medium shrink-0 px-3 py-1.5 rounded-xl transition-all duration-300 group-hover:shadow-lg"
                      style={{
                        backgroundColor: `${agent.color}12`,
                        color: agent.color,
                        boxShadow: 'none',
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.boxShadow = `0 0 16px ${agent.color}30`; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      Start chatting →
                    </span>
                  </button>
                ) : null
              )}
            </div>
            <button
              onClick={() => onComplete()}
              className="w-full text-center text-sm font-body text-primary hover:underline py-2 transition-all hover:text-primary/80"
            >
              See all {agents.length} agents →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingQuiz;
