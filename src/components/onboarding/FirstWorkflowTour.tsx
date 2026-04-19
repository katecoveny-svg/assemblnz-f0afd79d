import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ArrowRight, Sparkles, Plug, Play, FileCheck } from "lucide-react";

const TOUR_KEY = "assembl_first_workflow_tour_done_v1";

interface Step {
  icon: typeof Sparkles;
  title: string;
  body: string;
  cta: string;
  href: string;
}

const STEPS: Step[] = [
  {
    icon: Plug,
    title: "Step 1 — Connect a tool",
    body: "Hook up Xero, Google Calendar, or your inbox. Your agents work better with real context — and we never share data outside your workspace.",
    cta: "Open Connections",
    href: "/workspace/connections",
  },
  {
    icon: Play,
    title: "Step 2 — Run your first workflow",
    body: "Pick a pre-built workflow from your kete (e.g. 'Daily compliance scan' or 'Draft customer reply'). It runs in seconds and produces a Proof-of-Life draft.",
    cta: "Browse workflows",
    href: "/workflows",
  },
  {
    icon: FileCheck,
    title: "Step 3 — Approve an evidence pack",
    body: "Every workflow ends with a branded evidence pack. Review the findings, sign off, and you've got an auditable record. That's the whole loop.",
    cta: "See sample evidence pack",
    href: "/evidence",
  },
];

interface Props {
  accent?: string;
  /** force-open from a button on the page */
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function FirstWorkflowTour({ accent = "#4AA5A8", forceOpen, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setStep(0);
      return;
    }
    // Auto-show once per user
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [forceOpen]);

  const close = () => {
    setOpen(false);
    localStorage.setItem(TOUR_KEY, "1");
    onClose?.();
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  };

  if (!open) return null;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: "rgba(20,30,40,0.55)", backdropFilter: "blur(8px)" }}
        onClick={close}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="relative w-full max-w-md rounded-3xl p-7"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 24px 80px -20px rgba(74,165,168,0.35), 0 8px 24px rgba(0,0,0,0.08)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <X size={16} style={{ color: "#3D4250" }} />
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === step ? 28 : 12,
                  background: i <= step ? accent : "rgba(0,0,0,0.08)",
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
          >
            <Icon size={22} style={{ color: accent }} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-light tracking-tight mb-2" style={{ color: "#1A1D29" }}>
            {current.title}
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#3D4250" }}>
            {current.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to={current.href}
              onClick={close}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              style={{ background: accent, color: "#fff" }}
            >
              {current.cta}
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={next}
              className="px-4 py-2.5 rounded-xl text-sm transition-colors hover:bg-black/5"
              style={{ color: "#3D4250", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {step === STEPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>

          <p className="text-[10px] mt-4 text-center" style={{ color: "#9CA3AF" }}>
            You can re-open this guide anytime from your workspace.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export { TOUR_KEY };
