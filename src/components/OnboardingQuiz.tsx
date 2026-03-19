import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { agents } from "@/data/agents";
import RobotIcon from "@/components/RobotIcon";
import AssemblLogo from "@/components/AssemblLogo";
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
  NeonWave,
} from "@/components/NeonIcons";

type Step = "welcome" | "who" | "pain" | "results";

interface QuizResult {
  agentIds: string[];
  filter?: string;
}

const PAIN_MAP: Record<string, string[]> = {
  compliance: ["legal", "accounting", "property"],
  paperwork: ["nexus", "accounting", "axis"],
  marketing: ["marketing", "flux"],
  staff: ["legal", "aura"],
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
    <div className="min-h-screen star-field flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {step === "welcome" && (
          <div className="text-center space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <AssemblLogo size={56} />
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Assembl <NeonWave size={28} />
              </h1>
              <p className="text-muted-foreground text-sm">Let's find the right AI agent for you in 30 seconds.</p>
            </div>
            <button
              onClick={() => setStep("who")}
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-all bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
            >
              Get started
            </button>
          </div>
        )}

        {step === "who" && (
          <div className="space-y-5 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <h2 className="text-xl font-bold text-foreground text-center">What best describes you?</h2>
            <div className="grid grid-cols-1 gap-3">
              {WHO_OPTIONS.map((opt, i) => (
                <button
                  key={opt.key}
                  onClick={() => handleWho(opt.key)}
                  className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 opacity-0 animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
                >
                  {opt.icon}
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "pain" && (
          <div className="space-y-5 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <h2 className="text-xl font-bold text-foreground text-center">What's your biggest time drain?</h2>
            <div className="grid grid-cols-1 gap-3">
              {PAIN_OPTIONS.map((opt, i) => (
                <button
                  key={opt.key}
                  onClick={() => handlePain(opt.key)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 opacity-0 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
                >
                  {opt.icon}
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <h2 className="text-xl font-bold text-foreground text-center">We recommend these agents for you:</h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendedAgents.map((agent, i) =>
                agent ? (
                  <button
                    key={agent.id}
                    onClick={() => navigate(`/chat/${agent.id}`)}
                    className="flex items-center gap-4 p-5 rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 opacity-0 animate-fade-up"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationFillMode: "forwards",
                      borderColor: agent.color + "30",
                    }}
                  >
                    <RobotIcon color={agent.color} size={40} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground">{agent.name}</h3>
                      <p className="text-xs mb-1" style={{ color: agent.color }}>{agent.role}</p>
                      <p className="text-xs text-muted-foreground italic truncate">"{agent.tagline}"</p>
                    </div>
                    <span className="text-xs font-medium shrink-0 px-3 py-1.5 rounded-lg" style={{ backgroundColor: agent.color + "15", color: agent.color }}>
                      Start chatting →
                    </span>
                  </button>
                ) : null
              )}
            </div>
            <button
              onClick={() => onComplete()}
              className="w-full text-center text-sm text-primary hover:underline py-2"
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
