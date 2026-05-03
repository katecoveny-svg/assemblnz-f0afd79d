import { useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import HomeDashboard from "@/features/learn/components/HomeDashboard";
import MissionCard from "@/features/learn/components/MissionCard";
import ParentDashboard from "@/features/learn/components/ParentDashboard";
import CompletionScreen from "@/features/learn/components/CompletionScreen";
import { EQUATIONS } from "@/features/learn/data/equations";
import { saveGameResult, type QuestionOutcome } from "@/features/learn/lib/gameResults";
import AccountDropdown from "@/components/AccountDropdown";
import { toast } from "sonner";

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

  // Track per-question outcomes for backend save
  const outcomesRef = useRef<QuestionOutcome[]>([]);
  const startedAtRef = useRef<number>(Date.now());
  const savedRef = useRef(false);

  const badge = useMemo(() => {
    if (score >= total) return "Pounamu";
    if (score >= Math.ceil(total * 0.7)) return "Kōwhai";
    return "Harakeke";
  }, [score, total]);

  const recordOutcome = (correct: boolean, given: string | null) => {
    outcomesRef.current.push({
      index,
      prompt: equation.display,
      expected: String(equation.answer),
      given,
      correct,
      kind: equation.level,
    });
  };

  const handleCorrect = (given: string | null = null) => {
    setScore((s) => s + 1);
    setAttempts((a) => a + 1);
    setCorrect((c) => c + 1);
    setCompletedMissions((m) => m + 1);
    setRewards((r) => r + 1);
    recordOutcome(true, given);
  };
  const handleIncorrect = (given: string | null = null) => {
    setAttempts((a) => a + 1);
    recordOutcome(false, given);
  };

  const persistResult = async (finalScore: number) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const res = await saveGameResult({
      gameSource: "assembl_learn",
      childName: CHILD_NAME,
      subject: "Maths",
      yearLevel: null,
      nzcLevel: null,
      topic: "Free the Letter — one-step equations",
      score: finalScore,
      totalQuestions: total,
      durationSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
      questionOutcomes: outcomesRef.current,
      metadata: { streak, badge },
    });
    if (!res.saved) {
      toast.error("Couldn't save your progress this time.");
    }
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      void persistResult(score);
      setView("complete");
    } else {
      setIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    outcomesRef.current = [];
    startedAtRef.current = Date.now();
    savedRef.current = false;
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
        <div className="flex items-center justify-between mb-8 gap-3">
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
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-[10px] uppercase tracking-[0.28em] hidden sm:block" style={{ color: "#7A8E83" }}>
              Assembl Learn · Free the Letter
            </div>
            <AccountDropdown />
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
