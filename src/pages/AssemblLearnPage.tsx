import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import HomeDashboard from "@/features/learn/components/HomeDashboard";
import MissionCard from "@/features/learn/components/MissionCard";
import ParentDashboard from "@/features/learn/components/ParentDashboard";
import CompletionScreen from "@/features/learn/components/CompletionScreen";
import { EQUATIONS } from "@/features/learn/data/equations";

type View = "home" | "mission" | "complete" | "parent";

const CHILD_NAME = "Mia";

const AssemblLearnPage = () => {
  const [view, setView] = useState<View>("home");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [completedMissions, setCompletedMissions] = useState(0);
  const [rewards, setRewards] = useState(3);
  const [streak] = useState(4);

  const total = EQUATIONS.length;
  const equation = EQUATIONS[index];

  const badge = useMemo(() => {
    if (score >= total) return "Pounamu";
    if (score >= Math.ceil(total * 0.7)) return "Kōwhai";
    return "Harakeke";
  }, [score, total]);

  const handleCorrect = () => {
    setScore((s) => s + 1);
    setAttempts((a) => a + 1);
    setCorrect((c) => c + 1);
    setCompletedMissions((m) => m + 1);
    setRewards((r) => r + 1);
  };
  const handleIncorrect = () => setAttempts((a) => a + 1);

  const handleNext = () => {
    if (index + 1 >= total) {
      setView("complete");
    } else {
      setIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setView("home");
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8 sm:py-12"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, rgba(168,221,219,0.18), transparent 60%), radial-gradient(100% 70% at 100% 100%, rgba(217,188,122,0.10), transparent 55%), #FAFBFC",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* brand bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {view !== "home" && view !== "parent" && (
              <button
                onClick={() => setView("home")}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors hover:bg-white/60"
                style={{ color: "#5A6B62" }}
              >
                <ArrowLeft size={12} /> Home
              </button>
            )}
          </div>
          <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "#7A8E83" }}>
            Assembl Learn · Free the Letter
          </div>
        </div>

        {view === "home" && (
          <HomeDashboard
            childName={CHILD_NAME}
            streak={streak}
            completed={completedMissions}
            total={total}
            rewards={rewards}
            onContinue={() => setView("mission")}
            onParentView={() => setView("parent")}
          />
        )}

        {view === "mission" && (
          <MissionCard
            equation={equation}
            index={index}
            total={total}
            score={score}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            onNext={handleNext}
          />
        )}

        {view === "complete" && (
          <CompletionScreen score={score} total={total} streak={streak} badge={badge} onContinue={restart} />
        )}

        {view === "parent" && (
          <ParentDashboard
            childName={CHILD_NAME}
            completed={completedMissions}
            attempts={attempts}
            correct={correct}
            streak={streak}
            rewards={rewards}
            onBack={() => setView("home")}
          />
        )}
      </div>
    </div>
  );
};

export default AssemblLearnPage;
