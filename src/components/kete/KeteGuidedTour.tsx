import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, Check } from "lucide-react";

interface Step {
  title: string;
  body: string;
  selector: string;
  /** Hint shown to user about how to engage with the highlighted element. */
  hint: string;
}

interface KeteGuidedTourProps {
  keteName: string;
  accentColor: string;
  /** Stable id used in the localStorage key — defaults to keteName lowercased. */
  storageKey?: string;
  /** Override the default 3 steps if a kete needs a different walkthrough. */
  steps?: Step[];
}

const STORAGE_PREFIX = "assembl.kete-tour.v1.";

/**
 * Floating coach card that walks new users through:
 *  1. Live data ribbon — see which specialist agents are active for this kete.
 *  2. Chat FAB — open the kete conversation.
 *  3. Starter prompts — filter the chat to a focused workflow.
 *
 * Designed to be unobtrusive: bottom-left card, dismissible, shown once per kete
 * per browser. Uses data-tour attributes on the target elements (no DOM coupling
 * beyond a CSS selector).
 */
export default function KeteGuidedTour({
  keteName,
  accentColor,
  storageKey,
  steps,
}: KeteGuidedTourProps) {
  const key = useMemo(
    () => STORAGE_PREFIX + (storageKey ?? keteName.toLowerCase()),
    [keteName, storageKey]
  );

  const defaultSteps = useMemo<Step[]>(
    () => [
      {
        title: "Find the right specialist",
        body: `${keteName} routes your question to the right specialist agent automatically. The live ribbon shows which streams are active right now.`,
        selector: "[data-tour='live-ribbon']",
        hint: "Scan the ribbon to see what's live.",
      },
      {
        title: "Open the chat",
        body: `Tap the "Talk to ${keteName}" button to open a conversation. You can voice-call too.`,
        selector: "[data-tour='chat-fab']",
        hint: "Bottom-right of the screen.",
      },
      {
        title: "Filter with a starter prompt",
        body: "Pick a starter prompt to jump straight into a focused workflow — or type your own. Every reply is draft-only and evidence-packed.",
        selector: "[data-tour='chat-fab']",
        hint: "Starter prompts appear inside the chat.",
      },
    ],
    [keteName]
  );

  const tourSteps = steps ?? defaultSteps;

  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Show on first visit only
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const seen = window.localStorage.getItem(key);
      if (!seen) {
        const t = window.setTimeout(() => setOpen(true), 900);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* localStorage blocked — silently skip tour */
    }
  }, [key]);

  // Track the highlighted target so we can draw a soft halo around it
  useEffect(() => {
    if (!open) {
      setHighlightRect(null);
      return;
    }
    const step = tourSteps[stepIdx];
    if (!step) return;

    const update = () => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (!el) {
        setHighlightRect(null);
        return;
      }
      // Bring target into view (smooth) on step change
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightRect(el.getBoundingClientRect());
    };

    update();
    const id = window.setInterval(update, 250);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, stepIdx, tourSteps]);

  const dismiss = (markSeen = true) => {
    setOpen(false);
    setStepIdx(0);
    if (markSeen) {
      try {
        window.localStorage.setItem(key, new Date().toISOString());
      } catch {
        /* ignore */
      }
    }
  };

  const next = () => {
    if (stepIdx >= tourSteps.length - 1) {
      dismiss(true);
      return;
    }
    setStepIdx((i) => i + 1);
  };

  if (!open) return null;
  const step = tourSteps[stepIdx];
  if (!step) return null;

  return (
    <>
      {/* Soft halo around the active target — never blocks interaction */}
      {highlightRect && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed pointer-events-none z-[60] rounded-2xl"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: `0 0 0 2px ${accentColor}, 0 0 0 8px ${accentColor}26, 0 0 40px ${accentColor}55`,
            transition: "all 240ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}

      {/* Floating coach card — bottom-left so it never collides with the chat FAB */}
      <AnimatePresence>
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label={`${keteName} guided tour`}
          className="fixed bottom-6 left-6 z-[70] w-[320px] sm:w-[360px] rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.94)",
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.14), 0 0 60px ${accentColor}18`,
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: `${accentColor}1A`, color: accentColor }}
              >
                <Sparkles size={14} />
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-[2px]"
                  style={{ color: accentColor, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Quick tour · {stepIdx + 1}/{tourSteps.length}
                </p>
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
                >
                  {step.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismiss(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: "#9CA3AF" }}
              aria-label="Skip tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-2">
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250CC" }}
            >
              {step.body}
            </p>
            <p
              className="text-[10px] uppercase tracking-[1.5px]"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: accentColor }}
            >
              ↳ {step.hint}
            </p>
          </div>

          {/* Progress + Actions */}
          <div
            className="flex items-center justify-between gap-3 px-5 py-3"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.015)" }}
          >
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === stepIdx ? 18 : 6,
                    height: 6,
                    background: i <= stepIdx ? accentColor : `${accentColor}33`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dismiss(true)}
                className="text-[11px] px-2 py-1 rounded-md transition-colors hover:bg-black/5"
                style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif" }}
              >
                Skip
              </button>
              <button
                onClick={next}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-transform hover:scale-[1.02]"
                style={{
                  background: accentColor,
                  color: "#0B1020",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: `0 4px 14px ${accentColor}55`,
                }}
              >
                {stepIdx === tourSteps.length - 1 ? (
                  <>
                    Got it <Check size={12} />
                  </>
                ) : (
                  <>
                    Next <ArrowRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
