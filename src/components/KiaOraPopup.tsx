import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#5AADA0";
const FONT = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const PAIN_AREAS = [
  "Admin & paperwork is drowning us",
  "Compliance keeps us up at night",
  "Quoting takes too long — we lose jobs",
  "Staff are using ChatGPT with no controls",
  "We need better reporting & visibility",
  "Onboarding new team members is painful",
  "Other",
];

const INTERESTS = [
  "Manaaki — Hospitality",
  "Waihanga — Construction",
  "Auaha — Creative",
  "Arataki — Automotive",
  "Pikau — Freight & Customs",
  "Not sure yet — help me decide",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function KiaOraPopup({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [painArea, setPainArea] = useState("");
  const [interest, setInterest] = useState("");
  const [explanation, setExplanation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setStep(0); setPainArea(""); setInterest(""); setExplanation("");
    setName(""); setEmail(""); setPhone(""); setWebsite("");
    setSending(false); setDone(false);
  };

  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    try {
      const message = `Pain area: ${painArea}\nInterest: ${interest}\nExplanation: ${explanation}\nPhone: ${phone}\nWebsite: ${website}`.trim();
      // ECHO auto-reply (persists lead + emails visitor + notifies admin)
      supabase.functions.invoke("echo-respond", {
        body: {
          name: name.trim(),
          email: email.trim(),
          business_name: website.trim() || "",
          industry: painArea || "",
          interest: interest || "",
          message,
          source: "kia-ora-popup",
        },
      }).catch(console.error);
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!painArea;
    if (step === 1) return !!interest;
    if (step === 2) return true;
    if (step === 3) return !!name.trim() && !!email.trim();
    return false;
  };

  const chipClass = (selected: boolean) =>
    `block w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer border ${
      selected
        ? "border-[rgba(58,125,110,0.5)] bg-[rgba(58,125,110,0.12)]"
        : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
    }`;

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT.body,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(8px)",
  };

  const steps = [
    // Step 0 — Pain area
    <div key="pain" className="space-y-2.5">
      <p className="text-xs mb-4" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.5)" }}>
        What's the biggest thing slowing your business down right now?
      </p>
      {PAIN_AREAS.map((p) => (
        <button key={p} onClick={() => setPainArea(p)} className={chipClass(painArea === p)}
          style={{ fontFamily: FONT.body, color: painArea === p ? POUNAMU_LIGHT : "rgba(255,255,255,0.7)" }}>
          {p}
        </button>
      ))}
    </div>,

    // Step 1 — Interest area
    <div key="interest" className="space-y-2.5">
      <p className="text-xs mb-4" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.5)" }}>
        Which industry kete sounds like the best fit?
      </p>
      {INTERESTS.map((i) => (
        <button key={i} onClick={() => setInterest(i)} className={chipClass(interest === i)}
          style={{ fontFamily: FONT.body, color: interest === i ? POUNAMU_LIGHT : "rgba(255,255,255,0.7)" }}>
          {i}
        </button>
      ))}
    </div>,

    // Step 2 — Explanation
    <div key="explain" className="space-y-3">
      <p className="text-xs mb-2" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.5)" }}>
        Tell us a bit more so Kate's ready when she replies. (Optional)
      </p>
      <textarea
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        rows={5}
        placeholder="What does your business do? What would you love to automate?"
        className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary/30"
        style={inputStyle}
      />
    </div>,

    // Step 3 — Contact details
    <div key="details" className="space-y-3">
      <p className="text-xs mb-2" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.5)" }}>
        How can Kate get back to you?
      </p>
      {[
        { val: name, set: setName, ph: "Your name *", type: "text" },
        { val: email, set: setEmail, ph: "Email address *", type: "email" },
        { val: phone, set: setPhone, ph: "Phone number (optional)", type: "tel" },
        { val: website, set: setWebsite, ph: "Website (optional)", type: "url" },
      ].map((f) => (
        <input
          key={f.ph}
          value={f.val}
          onChange={(e) => f.set(e.target.value)}
          type={f.type}
          placeholder={f.ph}
          className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary/30"
          style={inputStyle}
        />
      ))}
    </div>,
  ];

  const STEP_LABELS = ["Pain point", "Industry", "Details", "Contact"];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden relative"
              style={{
                background: "#0D0D15",
                border: "1px solid rgba(58,125,110,0.2)",
                boxShadow: "0 0 80px rgba(58,125,110,0.08), 0 24px 64px rgba(0,0,0,0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${POUNAMU}, transparent)` }} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <div>
                  <h2 className="text-xl" style={{ fontFamily: FONT.heading, fontWeight: 300, color: "#FFFFFF" }}>
                    Kia ora 👋
                  </h2>
                  <p className="text-xs mt-1" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.4)" }}>
                    {done ? "We'll be in touch!" : `Step ${step + 1} of ${STEP_LABELS.length}`}
                  </p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <X size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
                </button>
              </div>

              {/* Progress dots */}
              {!done && (
                <div className="flex gap-1.5 px-6 pb-4">
                  {STEP_LABELS.map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= step ? POUNAMU : "rgba(255,255,255,0.06)" }} />
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="px-6 pb-6 min-h-[280px]">
                {done ? (
                  <motion.div className="flex flex-col items-center justify-center py-10 text-center"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <CheckCircle size={48} style={{ color: POUNAMU_LIGHT }} className="mb-4" />
                    <h3 className="text-lg mb-2" style={{ fontFamily: FONT.heading, fontWeight: 300, color: "#FFFFFF" }}>
                      Ngā mihi, {name.split(" ")[0]}!
                    </h3>
                    <p className="text-sm max-w-xs" style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.5)" }}>
                      Kate will get back to you within one business day at{" "}
                      <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: POUNAMU_LIGHT }}>
                        assembl@assembl.co.nz
                      </a>
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {steps[step]}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Footer nav */}
              {!done && (
                <div className="flex items-center justify-between px-6 pb-6">
                  {step > 0 ? (
                    <button onClick={() => setStep(step - 1)}
                      className="text-xs px-4 py-2.5 rounded-xl border transition-all"
                      style={{ fontFamily: FONT.body, color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.08)" }}>
                      Back
                    </button>
                  ) : <div />}

                  {step < 3 ? (
                    <button onClick={() => setStep(step + 1)} disabled={!canNext()}
                      className="flex items-center gap-2 text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-30"
                      style={{
                        fontFamily: FONT.body, fontWeight: 600,
                        background: POUNAMU, color: "#FFFFFF",
                      }}>
                      Next <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={!canNext() || sending}
                      className="flex items-center gap-2 text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-30"
                      style={{
                        fontFamily: FONT.body, fontWeight: 600,
                        background: POUNAMU, color: "#FFFFFF",
                      }}>
                      <Send size={14} /> {sending ? "Sending…" : "Send to Kate"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
