import { Trophy, Flame, Sparkles, ArrowRight } from "lucide-react";
import GlassCard from "./GlassCard";

const CompletionScreen = ({
  score,
  total,
  streak,
  badge,
  onContinue,
}: {
  score: number;
  total: number;
  streak: number;
  badge: string;
  onContinue: () => void;
}) => (
  <GlassCard className="p-8 sm:p-12 max-w-lg mx-auto text-center">
    <div
      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
      style={{
        background: "linear-gradient(135deg, rgba(217,188,122,0.25), rgba(47,203,137,0.18))",
        boxShadow: "0 12px 32px -12px rgba(217,188,122,0.5)",
      }}
    >
      <Trophy size={32} style={{ color: "#A8862C" }} />
    </div>

    <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: "#7A8E83" }}>
      Mission complete
    </div>
    <h2
      className="font-light tracking-tight mb-2"
      style={{ color: "#1F3A2C", fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontFamily: "'Cormorant Garamond', serif" }}
    >
      Tino pai, ākonga
    </h2>
    <p className="text-sm mb-8" style={{ color: "#5A6B62" }}>
      Every letter you free makes the next equation easier.
    </p>

    <div className="grid grid-cols-3 gap-3 mb-8">
      <Tile label="Score" value={`${score}/${total}`} />
      <Tile label="Streak" value={`${streak}d`} icon={<Flame size={14} />} />
      <Tile label="Badge" value={badge} icon={<Sparkles size={14} />} />
    </div>

    <button
      onClick={onContinue}
      className="rounded-full px-6 py-3 inline-flex items-center gap-2 text-white font-medium transition-transform hover:scale-[1.02]"
      style={{
        background: "linear-gradient(135deg, #2FCB89, #1FA66E)",
        boxShadow: "0 12px 30px -10px rgba(47,203,137,0.55)",
      }}
    >
      Continue learning <ArrowRight size={16} />
    </button>
  </GlassCard>
);

const Tile = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div
    className="rounded-2xl p-3"
    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(47,73,55,0.06)" }}
  >
    <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-[0.18em] mb-1" style={{ color: "#7A8E83" }}>
      {icon} {label}
    </div>
    <div className="text-base font-medium" style={{ color: "#1F3A2C" }}>
      {value}
    </div>
  </div>
);

export default CompletionScreen;
