import { useState, useEffect, useRef } from "react";
import { Lightbulb, Check, X, ArrowRight } from "lucide-react";
import GlassCard from "./GlassCard";
import type { Equation } from "../data/equations";

const MissionCard = ({
  equation,
  index,
  total,
  score,
  onCorrect,
  onIncorrect,
  onNext,
}: {
  equation: Equation;
  index: number;
  total: number;
  score: number;
  onCorrect: (given?: string) => void;
  onIncorrect: (given?: string) => void;
  onNext: () => void;
}) => {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [hintLevel, setHintLevel] = useState(0); // 0 → none, 1 → ask first, 2 → then this, 3 → hint
  const inputRef = useRef<HTMLInputElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue("");
    setState("idle");
    setHintLevel(0);
    // auto-focus the answer input each new question
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [equation.id]);

  // when answer is correct, move focus to Next so Enter advances
  useEffect(() => {
    if (state === "correct") {
      requestAnimationFrame(() => nextBtnRef.current?.focus());
    }
  }, [state]);

  // global keyboard shortcuts: H = reveal hint, Esc = clear input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (e.key === "Escape" && tag === "INPUT") {
        setValue("");
        setState("idle");
      }
      if ((e.key === "h" || e.key === "H") && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setHintLevel((h) => Math.min(3, h + 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const submit = () => {
    if (value.trim() === "") return;
    const num = Number(value);
    if (Number.isFinite(num) && num === equation.answer) {
      setState("correct");
      onCorrect();
    } else {
      setState("incorrect");
      onIncorrect();
    }
  };

  const levelTone =
    equation.level === "Signals"
      ? { bg: "rgba(47,203,137,0.10)", text: "#1F7A52" }
      : equation.level === "Unlock"
      ? { bg: "rgba(122,142,131,0.12)", text: "#3F5A4B" }
      : { bg: "rgba(217,188,122,0.18)", text: "#7A5C20" };

  return (
    <section role="region" aria-label={`Mission, question ${index + 1} of ${total}`}>
      <GlassCard className="p-6 sm:p-10 w-full max-w-xl mx-auto">
        {/* screen-reader live region for feedback */}
        <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only">
          {state === "correct" && "Correct. The letter is free."}
          {state === "incorrect" && "Not quite. Try a helper card."}
        </div>

      {/* progress + level */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full font-medium"
          style={{ background: levelTone.bg, color: levelTone.text }}
        >
          {equation.level}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full font-medium"
            style={{ background: "rgba(47,203,137,0.10)", color: "#1F7A52" }}
          >
            Score {score}
          </span>
          <span className="text-[11px] font-mono" style={{ color: "#7A8E83" }}>
            Question {index + 1} of {total}
          </span>
        </div>
      </div>

      {/* progress bar */}
      <div className="mb-7">
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "rgba(47,73,55,0.06)" }}
          role="progressbar"
          aria-label="Mission progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + (state === "correct" ? 1 : 0)}
          aria-valuetext={`Question ${index + 1} of ${total}, score ${score}`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((index + (score > index ? 1 : 0)) / total) * 100}%`,
              background: "linear-gradient(90deg, #2FCB89, #1FA66E)",
            }}
          />
        </div>
      </div>

      {/* prompt */}
      <p className="text-center text-sm mb-3" style={{ color: "#7A8E83" }}>
        What is the value of the letter?
      </p>

      {/* equation */}
      <div className="text-center mb-8">
        <span
          className="font-light tracking-tight"
          style={{
            color: "#1F3A2C",
            fontSize: "clamp(2.4rem, 8vw, 3.8rem)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {equation.display}
        </span>
      </div>

      {/* answer input */}
      <label htmlFor="mission-answer" className="sr-only">
        Your answer for {equation.letter}
      </label>
      <div className="flex gap-3 mb-4">
        <input
          id="mission-answer"
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && state === "idle") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`${equation.letter} = ?`}
          disabled={state === "correct"}
          aria-label={`Enter the value of ${equation.letter}`}
          aria-invalid={state === "incorrect"}
          aria-describedby="mission-feedback mission-shortcuts"
          className="flex-1 rounded-2xl px-5 py-4 text-lg font-light text-center bg-white/70 border outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            color: "#1F3A2C",
            borderColor:
              state === "correct"
                ? "rgba(47,203,137,0.6)"
                : state === "incorrect"
                ? "rgba(200,90,84,0.5)"
                : "rgba(47,73,55,0.10)",
            boxShadow:
              state === "correct"
                ? "0 0 0 4px rgba(47,203,137,0.15)"
                : state === "incorrect"
                ? "0 0 0 4px rgba(200,90,84,0.12)"
                : "inset 0 2px 4px rgba(47,73,55,0.04)",
          }}
        />
        {state === "correct" ? (
          <button
            ref={nextBtnRef}
            onClick={onNext}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNext();
              }
            }}
            aria-label={index + 1 >= total ? "Finish mission" : "Go to next question"}
            className="rounded-2xl px-5 flex items-center gap-2 font-medium text-white transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(135deg, #2FCB89, #1FA66E)",
              boxShadow: "0 8px 24px -8px rgba(47,203,137,0.5)",
            }}
          >
            Next <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!value.trim()}
            aria-label="Submit answer"
            className="rounded-2xl px-6 font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(135deg, #2FCB89, #1FA66E)",
              boxShadow: "0 8px 24px -8px rgba(47,203,137,0.5)",
            }}
          >
            Submit
          </button>
        )}
      </div>
      <p id="mission-shortcuts" className="sr-only">
        Press Enter to submit. Press H to reveal a hint. Press Escape to clear your answer.
      </p>

      {/* feedback */}
      <div id="mission-feedback">
        {state === "correct" && (
          <div
            role="status"
            className="flex items-center gap-2 text-sm mb-4 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(47,203,137,0.10)", color: "#1F7A52" }}
          >
            <Check size={16} aria-hidden="true" /> Ka pai! The letter is free.
          </div>
        )}
        {state === "incorrect" && (
          <div
            role="alert"
            className="flex items-center gap-2 text-sm mb-4 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(200,90,84,0.10)", color: "#9A4540" }}
          >
            <X size={16} aria-hidden="true" /> Not quite — try the helper cards below.
          </div>
        )}
      </div>

      {/* helper cards / hint zone */}
      <div className="flex items-center justify-between mb-3">
        <span
          id="helpers-heading"
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "#7A8E83" }}
        >
          Helpers
        </span>
        <button
          onClick={() => setHintLevel((h) => Math.min(3, h + 1))}
          disabled={hintLevel >= 3}
          aria-label={`Reveal next hint (shortcut H). ${hintLevel} of 3 revealed.`}
          className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ background: "rgba(217,188,122,0.18)", color: "#7A5C20" }}
        >
          <Lightbulb size={12} aria-hidden="true" /> Reveal a hint
        </button>
      </div>

      <ul
        className="grid gap-2.5 list-none p-0 m-0"
        aria-labelledby="helpers-heading"
      >
        <HelperCard label="Ask this first" body={equation.askFirst} revealed={hintLevel >= 1} />
        <HelperCard label="Then this" body={equation.thenThis} revealed={hintLevel >= 2} />
        <HelperCard label="Hint zone" body={equation.hint} revealed={hintLevel >= 3} accent />
      </ul>
      </GlassCard>
    </section>
  );
};

const HelperCard = ({
  label,
  body,
  revealed,
  accent = false,
}: {
  label: string;
  body: string;
  revealed: boolean;
  accent?: boolean;
}) => (
  <li
    className="rounded-2xl px-4 py-3 transition-all"
    aria-label={`${label} helper: ${revealed ? body : "locked, reveal to unlock"}`}
    style={{
      background: revealed
        ? accent
          ? "rgba(217,188,122,0.10)"
          : "rgba(47,203,137,0.06)"
        : "rgba(47,73,55,0.03)",
      border: `1px solid ${revealed ? "rgba(47,203,137,0.18)" : "rgba(47,73,55,0.06)"}`,
    }}
  >
    <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#7A8E83" }}>
      {label}
    </div>
    <div className="text-sm font-light" style={{ color: revealed ? "#1F3A2C" : "rgba(31,58,44,0.35)" }}>
      {revealed ? body : "Tap reveal to unlock this helper."}
    </div>
  </li>
);

export default MissionCard;
