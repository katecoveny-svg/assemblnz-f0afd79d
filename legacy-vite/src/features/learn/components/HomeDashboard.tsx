import { Flame, Trophy, ArrowRight, Sparkles, BookOpen, Users } from "lucide-react";
import GlassCard from "./GlassCard";
import ProgressRing from "./ProgressRing";
import { TOPICS } from "../data/equations";

const HomeDashboard = ({
  childName,
  streak,
  completed,
  total,
  rewards,
  onContinue,
  onParentView,
}: {
  childName: string;
  streak: number;
  completed: number;
  total: number;
  rewards: number;
  onContinue: () => void;
  onParentView: () => void;
}) => {
  const pct = total ? (completed / total) * 100 : 0;

  return (
    <div className="grid gap-5 sm:gap-6">
      {/* welcome + streak */}
      <GlassCard className="p-6 sm:p-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: "#7A8E83" }}>
            Welcome back
          </div>
          <h1
            className="font-light tracking-tight"
            style={{
              color: "#1F3A2C",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            Kia ora, {childName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A8E83" }}>
            Ready to free another letter?
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: "rgba(217,188,122,0.16)", color: "#7A5C20" }}
        >
          <Flame size={16} />
          <span className="font-medium text-sm">{streak}-day streak</span>
        </div>
      </GlassCard>

      {/* progress + continue */}
      <div className="grid sm:grid-cols-3 gap-5">
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <ProgressRing value={pct} sublabel="Mastered" />
          <div className="mt-3 text-xs" style={{ color: "#7A8E83" }}>
            {completed} of {total} missions
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:col-span-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: "#7A8E83" }}>
              Today's mission
            </div>
            <h2
              className="font-light tracking-tight mb-1"
              style={{ color: "#1F3A2C", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontFamily: "'Cormorant Garamond', serif" }}
            >
              Free the Letter
            </h2>
            <p className="text-sm" style={{ color: "#5A6B62" }}>
              Solve one-step equations using the three-question method. Calm, careful, correct.
            </p>
          </div>
          <button
            onClick={onContinue}
            className="self-start mt-5 rounded-full px-5 py-3 flex items-center gap-2 text-white font-medium transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #2FCB89, #1FA66E)",
              boxShadow: "0 10px 28px -10px rgba(47,203,137,0.55)",
            }}
          >
            Continue mission <ArrowRight size={16} />
          </button>
        </GlassCard>
      </div>

      {/* topic cards */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] mb-3 px-1" style={{ color: "#7A8E83" }}>
          Topics
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TOPICS.map((t) => (
            <GlassCard key={t.id} className="p-4 hover:scale-[1.02] cursor-pointer">
              <BookOpen size={16} style={{ color: "#2FCB89" }} />
              <div className="text-sm font-medium mt-2" style={{ color: "#1F3A2C" }}>
                {t.label}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: "#7A8E83" }}>
                {t.level} · {t.count}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* reward + parent quick view */}
      <div className="grid sm:grid-cols-2 gap-5">
        <GlassCard className="p-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(217,188,122,0.18)" }}
          >
            <Trophy size={20} style={{ color: "#A8862C" }} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#7A8E83" }}>
              Reward tracker
            </div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#1F3A2C" }}>
              {rewards} stars · {Math.max(0, 10 - rewards)} until next badge
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(47,73,55,0.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (rewards / 10) * 100)}%`,
                  background: "linear-gradient(90deg, #D9BC7A, #E8CB91)",
                }}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 cursor-pointer hover:scale-[1.01]" onClick={onParentView}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(47,203,137,0.10)" }}
          >
            <Users size={20} style={{ color: "#1FA66E" }} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#7A8E83" }}>
              For parents
            </div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#1F3A2C" }}>
              See progress, accuracy & printables
            </div>
          </div>
          <Sparkles size={16} style={{ color: "#7A8E83" }} />
        </GlassCard>
      </div>
    </div>
  );
};

export default HomeDashboard;
