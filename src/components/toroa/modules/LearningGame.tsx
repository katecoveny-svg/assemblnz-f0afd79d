// ═══════════════════════════════════════════════════════════════
// Tōro — Inline Learning Game
// Renders a fun, age-appropriate, NZC-aligned mini-game generated
// by the toro-learning-game edge function.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Trophy, RefreshCw, X, Check, ChevronRight, Camera, CloudUpload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveGameResult, type QuestionOutcome } from "@/features/learn/lib/gameResults";
import { isAnswerCorrect } from "@/features/learn/lib/answerCheck";

const POUNAMU = "#3A7D6E";
const TANGAROA = "#1A3A5C";
const SOFT_GOLD = "#D9BC7A";

const glass = {
  background: "rgba(255,255,255,0.7)",
  border: `1px solid ${TANGAROA}25`,
  backdropFilter: "blur(14px)",
};

interface Question {
  kind: "multiple_choice" | "fill_blank" | "true_false";
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  /** Legacy single hint — kept for backward compat with older payloads. */
  hint: string;
  /** Preferred: 3 progressive hints from gentle → strong scaffold. */
  hints?: string[];
}

/**
 * Normalize whatever the model returned into 1–3 progressive hints.
 * Always returns a non-empty array (falls back to legacy `hint`).
 */
function getHintList(q: Question): string[] {
  const list = (q.hints ?? []).map((h) => (h ?? "").trim()).filter(Boolean);
  if (list.length > 0) return list.slice(0, 3);
  return q.hint ? [q.hint.trim()] : [];
}

interface Game {
  title: string;
  intro: string;
  skill_focus: string;
  nzc_level: string;
  questions: Question[];
  celebration: string;
}

interface Props {
  childName?: string;
  yearLevel?: string;
  subject?: string;
  nzcLevel?: string;
  /** Optional context — e.g. last user message or a worksheet topic. */
  topicHint?: string;
  /** Optional photo of the homework. */
  imageDataUrl?: string | null;
  onClose: () => void;
}

// Match wrapper kept tolerant of formatting and synonyms.
const matches = (given: string, expected: string, kind: Question["kind"]) =>
  isAnswerCorrect(given, expected, kind);

export default function LearningGame({
  childName,
  yearLevel,
  subject,
  nzcLevel,
  topicHint,
  imageDataUrl,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [detectedTopic, setDetectedTopic] = useState<string | null>(null);
  const [topicSource, setTopicSource] = useState<"user" | "image" | "none" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false); // answer fully revealed (after correct OR after giving up)
  const [solved, setSolved] = useState(false); // child got it right (this attempt)
  const [attempts, setAttempts] = useState(0); // wrong attempts on current question
  const [hintStep, setHintStep] = useState(0); // 0 = none shown, 1..N = number of progressive hints revealed
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Per-question outcomes accumulated across the game
  const outcomesRef = useRef<QuestionOutcome[]>([]);
  const startedAtRef = useRef<number>(Date.now());
  const savedRef = useRef(false);
  // Track whether we've already counted this question's outcome for analytics
  const recordedRef = useRef(false);

  // Refs for focus management + screen-reader announcements
  const fillInputRef = useRef<HTMLInputElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");

  // Helper that nudges focus back to the active answer control
  const focusAnswerControl = () => {
    requestAnimationFrame(() => {
      if (fillInputRef.current && !fillInputRef.current.disabled) {
        fillInputRef.current.focus();
        return;
      }
      const firstOption = optionsContainerRef.current?.querySelector<HTMLButtonElement>(
        "button:not(:disabled)"
      );
      firstOption?.focus();
    });
  };

  // Auto-focus the active answer control when each question loads
  useEffect(() => {
    if (!loading && !done && !revealed && !solved) {
      focusAnswerControl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, loading, done]);

  // ── Fetch game on mount ────────────────────────────────
  useMemo(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("toro-learning-game", {
          body: {
            childName,
            yearLevel,
            subject,
            nzcLevel,
            topicHint,
            imageDataUrl: imageDataUrl ?? undefined,
          },
        });
        if (cancelled) return;
        if (fnErr) throw new Error(fnErr.message);
        const payload = data as { game?: Game; detected_topic?: string | null; topic_source?: "user" | "image" | "none" };
        const g = payload?.game;
        if (!g || !Array.isArray(g.questions) || g.questions.length === 0) {
          throw new Error("Tōro couldn't build the game just now — give it another try.");
        }
        setGame(g);
        setDetectedTopic(payload?.detected_topic ?? null);
        setTopicSource(payload?.topic_source ?? null);
      } catch (e) {
        if (cancelled) return;
        const msg = (e as Error).message || "Could not load the game.";
        setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We intentionally only run this once on mount. Inputs don't change while panel is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Question logic ─────────────────────────────────────
  const q = game?.questions[idx];
  const total = game?.questions.length ?? 0;

  const submit = () => {
    if (!q || revealed || solved) return;
    const userAnswer = q.kind === "fill_blank" ? typed : picked ?? "";
    if (!userAnswer.trim()) return;
    const correct = matches(userAnswer, q.answer, q.kind);

    if (correct) {
      // Only count score on the FIRST attempt of this question
      if (!recordedRef.current) {
        setScore((s) => s + 1);
        outcomesRef.current.push({
          index: idx,
          prompt: q.prompt,
          expected: q.answer,
          given: userAnswer,
          correct: true,
          kind: q.kind,
        });
        recordedRef.current = true;
      }
      setSolved(true);
      setRevealed(true);
      setAnnouncement(`Correct. The answer is ${q.answer}.`);
      return;
    }

    // Wrong answer → record only the FIRST miss for analytics, then let them try again
    if (!recordedRef.current) {
      outcomesRef.current.push({
        index: idx,
        prompt: q.prompt,
        expected: q.answer,
        given: userAnswer,
        correct: false,
        kind: q.kind,
      });
      recordedRef.current = true;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    // After the first miss, surface the hint automatically
    const hintWasHidden = !showHint;
    setShowHint(true);
    setAnnouncement(
      hintWasHidden
        ? `Try again. Hint: ${q.hint}`
        : nextAttempts === 1
          ? "Try again."
          : "Still off. Take your time and try once more."
    );
    // Clear the typed answer so the child can retry without manually erasing
    if (q.kind === "fill_blank") setTyped("");
    else setPicked(null);
    focusAnswerControl();
  };

  const revealHint = () => {
    if (!q || revealed || solved) return;
    const wasHidden = !showHint;
    setShowHint(true);
    setAnnouncement(wasHidden ? `Hint revealed: ${q.hint}` : `Hint still showing: ${q.hint}`);
    focusAnswerControl();
  };

  const giveUp = () => {
    if (!q || revealed) return;
    setRevealed(true); // shows the answer + explanation; score not awarded
    setAnnouncement(`Answer revealed. The answer is ${q.answer}.`);
  };

  const persistResult = async (finalScore: number) => {
    if (savedRef.current || !game) return;
    savedRef.current = true;
    setSaveState("saving");
    const res = await saveGameResult({
      gameSource: "toro_homework",
      childName: childName ?? null,
      subject: subject ?? null,
      yearLevel: yearLevel ?? null,
      nzcLevel: game.nzc_level ?? nzcLevel ?? null,
      topic: detectedTopic ?? topicHint ?? null,
      score: finalScore,
      totalQuestions: game.questions.length,
      durationSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
      questionOutcomes: outcomesRef.current,
      metadata: {
        skill_focus: game.skill_focus,
        title: game.title,
        topic_source: topicSource,
      },
    });
    if (res.saved) {
      setSaveState("saved");
    } else {
      setSaveState("error");
      toast.error("Couldn't save this result. Your score is still shown.");
    }
  };

  const next = () => {
    if (!game) return;
    if (idx + 1 >= game.questions.length) {
      setDone(true);
      void persistResult(score);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setTyped("");
    setRevealed(false);
    setSolved(false);
    setAttempts(0);
    setShowHint(false);
    setAnnouncement("");
    recordedRef.current = false;
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setTyped("");
    setRevealed(false);
    setSolved(false);
    setAttempts(0);
    setShowHint(false);
    setScore(0);
    setDone(false);
    setAnnouncement("");
    outcomesRef.current = [];
    startedAtRef.current = Date.now();
    savedRef.current = false;
    recordedRef.current = false;
    setSaveState("idle");
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl p-4 space-y-3"
      style={{ ...glass, borderColor: `${SOFT_GOLD}55`, background: "rgba(255,255,255,0.85)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: SOFT_GOLD }} />
          <p className="font-body text-xs uppercase tracking-wider" style={{ color: POUNAMU }}>
            Tōro Learning Game
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/60 transition-all"
          aria-label="Close game"
          type="button"
        >
          <X size={14} style={{ color: "#6B7280" }} />
        </button>
      </div>

      {/* Screen-reader announcer for try-again, hint reveals, and answer reveals */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <p id="toro-game-shortcuts" className="sr-only">
        Press Enter to check your answer.
      </p>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Loader2 size={18} className="animate-spin" style={{ color: POUNAMU }} />
          <p className="font-body text-xs" style={{ color: "#6B7280" }}>
            Designing a game just for {childName ?? "you"}…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg p-3 text-center space-y-2" style={{ background: "rgba(239,68,68,0.06)" }}>
          <p className="font-body text-xs" style={{ color: "#9B1C1C" }}>
            {error}
          </p>
          <button
            onClick={onClose}
            className="font-body text-[11px] underline"
            style={{ color: POUNAMU }}
            type="button"
          >
            Close
          </button>
        </div>
      )}

      {!loading && !error && game && !done && q && (
        <>
          <div className="space-y-1">
            <p className="font-display text-sm" style={{ color: TANGAROA }}>
              {game.title}
            </p>
            <p className="font-body text-[11px]" style={{ color: "#6B7280" }}>
              {game.intro}
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span
                className="font-mono text-[9px] px-2 py-0.5 rounded"
                style={{ background: `${POUNAMU}15`, color: POUNAMU }}
              >
                NZC {game.nzc_level}
              </span>
              {topicSource === "image" && detectedTopic && (
                <span
                  className="font-mono text-[9px] px-2 py-0.5 rounded inline-flex items-center gap-1"
                  style={{ background: `${SOFT_GOLD}25`, color: "#8A6B2E" }}
                  title="Topic auto-detected from your worksheet photo"
                >
                  <Camera size={9} /> {detectedTopic}
                </span>
              )}
              <span className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>
                Question {idx + 1} of {total}
              </span>
              <span className="font-mono text-[9px] ml-auto" style={{ color: SOFT_GOLD }}>
                ★ {score}
              </span>
            </div>
          </div>

          <div className="rounded-lg p-3 space-y-3" style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${TANGAROA}15` }}>
            <p className="font-body text-sm" style={{ color: "#1A1D29" }}>
              {q.prompt}
            </p>

            {q.kind === "fill_blank" ? (
              <input
                ref={fillInputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !revealed && !solved && typed.trim()) submit();
                }}
                placeholder="Type your answer…"
                disabled={revealed || solved}
                aria-invalid={attempts > 0 && !solved}
                aria-describedby="toro-game-shortcuts"
                className="w-full rounded-lg px-3 py-2 text-sm font-body outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: `1px solid ${
                    solved ? POUNAMU : attempts > 0 && !revealed ? "#EF4444" : `${TANGAROA}25`
                  }`,
                  color: "#1A1D29",
                }}
              />
            ) : (
              <div ref={optionsContainerRef} className="grid grid-cols-1 gap-2" role="group" aria-label="Answer options">
                {(q.options ?? (q.kind === "true_false" ? ["True", "False"] : [])).map((opt, i) => {
                  const isPicked = picked === opt;
                  const isAnswer = matches(opt, q.answer, q.kind);
                  // Show green only when revealed (correct submission or give-up)
                  const showCorrect = (revealed || solved) && isAnswer;
                  const showWrongPick = revealed && isPicked && !isAnswer;
                  return (
                    <button
                      key={i}
                      onClick={() => !revealed && !solved && setPicked(opt)}
                      disabled={revealed || solved}
                      className="rounded-lg px-3 py-2 text-left text-xs font-body flex items-center gap-2 transition-all disabled:cursor-default"
                      style={{
                        background: showCorrect
                          ? "rgba(58,125,110,0.15)"
                          : showWrongPick
                            ? "rgba(239,68,68,0.1)"
                            : isPicked
                              ? `${POUNAMU}15`
                              : "rgba(255,255,255,0.9)",
                        border: `1px solid ${showCorrect ? POUNAMU : showWrongPick ? "#EF4444" : isPicked ? POUNAMU : `${TANGAROA}25`}`,
                        color: "#1A1D29",
                      }}
                      type="button"
                    >
                      {showCorrect && <Check size={12} style={{ color: POUNAMU }} />}
                      {showWrongPick && <X size={12} style={{ color: "#EF4444" }} />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Try-again feedback (after wrong attempt, before reveal) */}
            <AnimatePresence>
              {!revealed && !solved && attempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-md p-2 space-y-1"
                  style={{ background: "rgba(239,68,68,0.06)" }}
                >
                  <p className="font-body text-[11px]" style={{ color: "#9B1C1C" }}>
                    {attempts === 1
                      ? "Not quite — have another go."
                      : "Still off. Take your time and try once more."}
                  </p>
                  {showHint && (
                    <p className="font-body text-[11px] italic" style={{ color: "#6B7280" }}>
                      Hint: {q.hint}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full reveal (after solved or give up) */}
            <AnimatePresence>
              {(revealed || solved) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-md p-2 space-y-1"
                  style={{
                    background: solved ? "rgba(58,125,110,0.08)" : "rgba(217,188,122,0.12)",
                  }}
                >
                  <p className="font-body text-[11px]" style={{ color: TANGAROA }}>
                    <strong>{solved ? "Ka pai!" : "Answer:"}</strong> {q.answer}
                  </p>
                  <p className="font-body text-[11px]" style={{ color: "#6B7280" }}>
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-2">
            {!revealed && !solved ? (
              <>
                {attempts > 0 && (
                  <>
                    <button
                      onClick={revealHint}
                      disabled={showHint}
                      aria-label={showHint ? "Hint already shown" : "Reveal a hint for this question"}
                      className="px-3 py-2 rounded-lg text-xs font-body flex items-center gap-1 transition-all disabled:opacity-40"
                      style={{ background: `${SOFT_GOLD}25`, color: "#8A6B2E" }}
                      type="button"
                    >
                      Show hint
                    </button>
                    <button
                      onClick={giveUp}
                      className="px-3 py-2 rounded-lg text-xs font-body transition-all"
                      style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${TANGAROA}25`, color: "#6B7280" }}
                      type="button"
                    >
                      Show answer
                    </button>
                  </>
                )}
                <button
                  onClick={submit}
                  disabled={q.kind === "fill_blank" ? !typed.trim() : !picked}
                  className="px-4 py-2 rounded-lg text-xs font-body flex items-center gap-1 transition-all disabled:opacity-40"
                  style={{ background: POUNAMU, color: "#FFFFFF" }}
                  type="button"
                >
                  {attempts > 0 ? "Try again" : "Check"} <Check size={12} />
                </button>
              </>
            ) : (
              <button
                onClick={next}
                className="px-4 py-2 rounded-lg text-xs font-body flex items-center gap-1 transition-all"
                style={{ background: POUNAMU, color: "#FFFFFF" }}
                type="button"
              >
                {idx + 1 >= total ? "See score" : "Next"} <ChevronRight size={12} />
              </button>
            )}
          </div>
        </>
      )}

      {!loading && !error && game && done && (
        <div className="text-center space-y-3 py-3">
          <Trophy size={28} style={{ color: SOFT_GOLD }} className="mx-auto" />
          <p className="font-display text-base" style={{ color: TANGAROA }}>
            {score} / {total} — {game.celebration}
          </p>
          <p className="font-body text-[11px]" style={{ color: "#6B7280" }}>
            Skill practised: {game.skill_focus}
          </p>
          <p
            className="font-body text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background:
                saveState === "saved"
                  ? "rgba(58,125,110,0.10)"
                  : saveState === "error"
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(0,0,0,0.04)",
              color:
                saveState === "saved"
                  ? POUNAMU
                  : saveState === "error"
                    ? "#9B1C1C"
                    : "#6B7280",
            }}
            aria-live="polite"
          >
            <CloudUpload size={10} aria-hidden="true" />
            {saveState === "saving" && "Saving result…"}
            {saveState === "saved" && "Saved to your progress"}
            {saveState === "error" && "Couldn't save — score still shown"}
            {saveState === "idle" && "Result ready"}
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={restart}
              className="px-4 py-2 rounded-lg text-xs font-body flex items-center gap-1 transition-all"
              style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${POUNAMU}40`, color: POUNAMU }}
              type="button"
            >
              <RefreshCw size={12} /> Play again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-body transition-all"
              style={{ background: POUNAMU, color: "#FFFFFF" }}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
