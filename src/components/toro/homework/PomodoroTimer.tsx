import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen, CheckCircle2 } from "lucide-react";

interface PomodoroTimerProps {
  childName: string;
  subject: string;
  onSessionComplete: (payload: {
    plannedMinutes: number;
    actualMinutes: number;
    sessionType: "focus" | "break";
  }) => void;
}

type Phase = "focus" | "short_break" | "long_break";

const PHASES: Record<Phase, { label: string; minutes: number; icon: typeof BookOpen }> = {
  focus: { label: "Focus", minutes: 25, icon: BookOpen },
  short_break: { label: "Short break", minutes: 5, icon: Coffee },
  long_break: { label: "Long break", minutes: 15, icon: Coffee },
};

export function PomodoroTimer({ childName, subject, onSessionComplete }: PomodoroTimerProps) {
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(PHASES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const total = PHASES[phase].minutes * 60;
  const progress = useMemo(() => ((total - secondsLeft) / total) * 100, [secondsLeft, total]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          handlePhaseComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase]);

  const handlePhaseComplete = () => {
    setIsRunning(false);
    const planned = PHASES[phase].minutes;
    const elapsed = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 60000)
      : planned;
    onSessionComplete({
      plannedMinutes: planned,
      actualMinutes: Math.max(1, elapsed),
      sessionType: phase === "focus" ? "focus" : "break",
    });
    startedAtRef.current = null;

    if (phase === "focus") {
      const next = completedFocus + 1;
      setCompletedFocus(next);
      const nextPhase: Phase = next % 4 === 0 ? "long_break" : "short_break";
      setPhase(nextPhase);
      setSecondsLeft(PHASES[nextPhase].minutes * 60);
    } else {
      setPhase("focus");
      setSecondsLeft(PHASES.focus.minutes * 60);
    }
  };

  const toggle = () => {
    if (!isRunning && startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    setIsRunning((r) => !r);
  };

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(PHASES[phase].minutes * 60);
    startedAtRef.current = null;
  };

  const switchPhase = (next: Phase) => {
    setIsRunning(false);
    setPhase(next);
    setSecondsLeft(PHASES[next].minutes * 60);
    startedAtRef.current = null;
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const PhaseIcon = PHASES[phase].icon;

  return (
    <div className="rounded-3xl border border-[#8E8177]/14 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PhaseIcon size={16} className="text-[#9D8C7D]" />
          <h3 className="font-display text-xl text-[#6F6158]">{PHASES[phase].label}</h3>
        </div>
        <div className="flex gap-1">
          {(Object.keys(PHASES) as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={`text-xs font-body px-3 py-1 rounded-full transition-colors ${
                phase === p
                  ? "bg-[#D9BC7A] text-white"
                  : "bg-[#F7F3EE] text-[#9D8C7D] hover:bg-[#EEE7DE]"
              }`}
            >
              {PHASES[p].label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-6">
        <p className="font-mono text-7xl font-light text-[#6F6158] tabular-nums">
          {mm}:{ss}
        </p>
        <p className="font-body text-sm text-[#9D8C7D] mt-2">
          {childName} · {subject || "study"}
        </p>
      </div>

      <div className="h-2 rounded-full bg-[#F7F3EE] overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-[#C9D8D0] to-[#D9BC7A] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#D9BC7A] text-white font-body text-sm hover:bg-[#C7A86A] transition-colors"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#F7F3EE] text-[#9D8C7D] font-body text-sm hover:bg-[#EEE7DE] transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="mt-5 pt-5 border-t border-[#8E8177]/10 flex items-center justify-between">
        <p className="font-body text-xs text-[#9D8C7D]">Focus sessions today</p>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <CheckCircle2
              key={i}
              size={14}
              className={i < completedFocus ? "text-[#8FB09A]" : "text-[#EEE7DE]"}
              strokeWidth={i < completedFocus ? 2.5 : 1.5}
            />
          ))}
          <span className="font-mono text-xs text-[#9D8C7D] ml-2">{completedFocus}</span>
        </div>
      </div>
    </div>
  );
}
