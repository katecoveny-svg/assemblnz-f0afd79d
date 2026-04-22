import { useEffect, useState } from "react";
import { Download, Settings, ArrowLeft, Target, Flame, Award, BookOpen, History, Loader2 } from "lucide-react";
import GlassCard from "./GlassCard";
import { TOPICS } from "../data/equations";
import { fetchRecentGameResults, type LearningGameResultRow } from "../lib/gameResults";

const Stat = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <GlassCard className="p-5">
    <div className="flex items-center gap-2 mb-2" style={{ color: "#7A8E83" }}>
      {icon}
      <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
    </div>
    <div
      className="font-light tracking-tight"
      style={{ color: "#1F3A2C", fontSize: "1.8rem", fontFamily: "'Cormorant Garamond', serif" }}
    >
      {value}
    </div>
  </GlassCard>
);

const ParentDashboard = ({
  childName,
  completed,
  attempts,
  correct,
  streak,
  rewards,
  onBack,
}: {
  childName: string;
  completed: number;
  attempts: number;
  correct: number;
  streak: number;
  rewards: number;
  onBack: () => void;
}) => {
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
  const mastered = TOPICS.filter((t) => completed >= t.count).length;

  const [history, setHistory] = useState<LearningGameResultRow[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      const rows = await fetchRecentGameResults(15);
      if (!cancelled) {
        setHistory(rows);
        setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const printSheet = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Free the Letter — Practice Sheet</title>
      <style>
        body{font-family:Georgia,serif;color:#1F3A2C;padding:48px;max-width:680px;margin:0 auto}
        h1{font-weight:300;font-size:32px;margin:0 0 4px}
        .sub{color:#7A8E83;font-size:13px;margin-bottom:32px;text-transform:uppercase;letter-spacing:.18em}
        ol{padding-left:20px;line-height:2.4}
        li{font-size:20px;font-weight:300}
        .method{margin-top:40px;padding:20px;border:1px solid #ddd;border-radius:12px;background:#FAFBFC}
        .method h3{margin:0 0 8px;font-weight:400;font-size:15px}
        .method p{margin:4px 0;font-size:14px;color:#5A6B62}
      </style></head><body>
      <h1>Free the Letter</h1>
      <div class="sub">Practice sheet · ${childName}</div>
      <ol>
        <li>x + 7 = 12</li><li>a − 5 = 9</li><li>4m = 20</li><li>z ÷ 2 = 6</li>
        <li>n + 9 = 17</li><li>3y = 21</li><li>k − 8 = 4</li><li>2x + 3 = 11</li>
      </ol>
      <div class="method">
        <h3>The three questions</h3>
        <p>1. What is happening to the letter?</p>
        <p>2. Do the opposite.</p>
        <p>3. Do it to both sides.</p>
      </div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="grid gap-5">
      <button
        onClick={onBack}
        className="self-start text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors hover:bg-white/60"
        style={{ color: "#5A6B62" }}
      >
        <ArrowLeft size={12} /> Back to dashboard
      </button>

      <GlassCard className="p-6 sm:p-8">
        <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: "#7A8E83" }}>
          Parent view
        </div>
        <h1
          className="font-light tracking-tight"
          style={{
            color: "#1F3A2C",
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {childName}'s progress
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7A8E83" }}>
          Quiet, encouraging practice. No leaderboards, no noise.
        </p>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Missions" value={String(completed)} icon={<Target size={14} />} />
        <Stat label="Accuracy" value={`${accuracy}%`} icon={<Award size={14} />} />
        <Stat label="Streak" value={`${streak}d`} icon={<Flame size={14} />} />
        <Stat label="Topics mastered" value={`${mastered}/${TOPICS.length}`} icon={<BookOpen size={14} />} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3" style={{ color: "#7A8E83" }}>
            <Download size={14} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Printable sheet</span>
          </div>
          <h3 className="text-base font-medium mb-1" style={{ color: "#1F3A2C" }}>
            Practice away from the screen
          </h3>
          <p className="text-sm mb-4" style={{ color: "#5A6B62" }}>
            One A4 page with eight equations and the three-question method.
          </p>
          <button
            onClick={printSheet}
            className="rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #2FCB89, #1FA66E)",
              boxShadow: "0 8px 22px -10px rgba(47,203,137,0.5)",
            }}
          >
            Download PDF
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3" style={{ color: "#7A8E83" }}>
            <Settings size={14} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Reward settings</span>
          </div>
          <h3 className="text-base font-medium mb-1" style={{ color: "#1F3A2C" }}>
            {rewards} stars earned
          </h3>
          <p className="text-sm mb-4" style={{ color: "#5A6B62" }}>
            Set what a milestone means at home — extra reading time, a walk, a treat.
          </p>
          <div className="flex gap-2 flex-wrap">
            {["10 stars", "25 stars", "50 stars"].map((m) => (
              <span
                key={m}
                className="text-[11px] px-3 py-1.5 rounded-full"
                style={{ background: "rgba(47,203,137,0.08)", color: "#1F7A52" }}
              >
                {m}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ParentDashboard;
