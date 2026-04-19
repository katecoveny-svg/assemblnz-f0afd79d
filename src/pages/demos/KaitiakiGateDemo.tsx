import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Play } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import DemoGlassShell from "@/components/demos/DemoGlassShell";
import PoweredByAssembl from "@/components/demos/PoweredByAssembl";
import { DemoBreadcrumb, DemoProvesCard, DemoBottomNav } from "@/components/demos/DemoNavFooter";

const PROMPTS = [
  {
    label: "Draft a Māori business greeting for our website's 'About' page.",
    type: "safe",
    before: "Kia ora, nau mai haere mai ki to matou wahi.",
    after: "Kia ora, nau mai haere mai ki tō mātou wāhi.",
    corrections: [
      { from: "to", to: "tō", reason: "Possessive pronoun requires macron" },
      { from: "matou", to: "mātou", reason: "First-person plural exclusive" },
      { from: "wahi", to: "wāhi", reason: "Place/space — long vowel" },
    ],
  },
  {
    label: "Generate a whaikōrero for our staff meeting opening.",
    type: "sacred",
  },
];

const MEADS_TESTS = [
  { name: "Tika", desc: "Is it correct and appropriate?" },
  { name: "Pono", desc: "Is it true and genuine?" },
  { name: "Aroha", desc: "Is it done with care and respect?" },
  { name: "Tikanga", desc: "Does it follow correct custom and protocol?" },
  { name: "Mana", desc: "Does it uphold and enhance mana?" },
];

const NGA_POU = [
  { name: "Rangatiratanga", desc: "Self-determination — Māori control over Māori data" },
  { name: "Kaitiakitanga", desc: "Guardianship — responsible stewardship of data" },
  { name: "Manaakitanga", desc: "Reciprocity — data use that benefits whānau" },
  { name: "Whanaungatanga", desc: "Relationships — maintaining connections through data" },
];

const KaitiakiGateDemo = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<"safe" | "sacred" | null>(null);

  const prompt = PROMPTS[selectedPrompt];

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setResult(prompt.type as "safe" | "sacred");
      setRunning(false);
    }, 1200);
  };

  const handleSwitch = (i: number) => {
    setSelectedPrompt(i);
    setResult(null);
    setRunning(false);
  };

  return (
    <DemoGlassShell>
      <SEO title="Kaitiaki Gate Demo | assembl" description="See the sacred content guardrail and Kaitiaki Review escalation path in action." path="/demos/kaitiaki-gate" image="/og/demos-kaitiaki-gate.png" />
      <BrandNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <DemoBreadcrumb title="Kaitiaki gate" />
        <DemoProvesCard slug="kaitiaki-gate" />

        <div className="liquid-glass liquid-glass-gold rounded-xl px-4 py-2 text-center mb-10">
          <p className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A8DDDB" }}>
            Demo mode — no real data leaves this page
          </p>
        </div>

        <h1 className="text-2xl sm:text-4xl mb-2 text-center" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Kaitiaki Gate
        </h1>
        <p className="text-center text-sm mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.6)" }}>
          Human-in-the-loop for cultural content — sacred content is never AI-generated
        </p>

        {/* Prompt selector — liquid glass */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => handleSwitch(i)}
              className={`liquid-glass text-left p-5 rounded-2xl transition-all text-xs group`}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderColor: selectedPrompt === i ? (p.type === "sacred" ? "rgba(232,116,97,0.3)" : "rgba(58,125,110,0.4)") : undefined,
                boxShadow: selectedPrompt === i ? `0 0 30px ${p.type === "sacred" ? "rgba(232,116,97,0.08)" : "rgba(58,125,110,0.1)"}` : undefined,
              }}>
              <span className="text-[9px] tracking-[2px] uppercase block mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: p.type === "sacred" ? "#E87461" : "#4FE4A7" }}>
                {p.type === "sacred" ? "Sacred content" : "Standard te reo"}
              </span>
              <span style={{ color: "rgba(245,240,232,0.75)" }}>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="text-center mb-10">
          <button onClick={handleRun} disabled={running}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all liquid-glass liquid-glass-gold"
            style={{
              color: running ? "rgba(245,240,232,0.4)" : "#A8DDDB",
              borderColor: running ? "rgba(255,255,255,0.06)" : "rgba(212,168,83,0.3)",
            }}>
            <Play size={14} /> {running ? "Processing..." : "Submit"}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result === "safe" && prompt.type === "safe" && (
            <motion.div key="safe" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="liquid-glass liquid-glass-pounamu rounded-2xl p-6 mb-6" style={{ borderColor: "rgba(79,228,167,0.2)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(79,228,167,0.12)", border: "1px solid rgba(79,228,167,0.2)" }}>
                    <Check size={16} style={{ color: "#4FE4A7" }} />
                  </div>
                  <span className="text-[10px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4FE4A7" }}>PASS — Macron auto-correction applied</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="liquid-glass rounded-xl p-4" style={{ borderColor: "rgba(232,116,97,0.15)" }}>
                    <p className="text-[9px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E87461" }}>Before</p>
                    <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.6)" }}>
                      {(prompt as typeof PROMPTS[0]).before}
                    </p>
                  </div>
                  <div className="liquid-glass rounded-xl p-4" style={{ borderColor: "rgba(79,228,167,0.15)" }}>
                    <p className="text-[9px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4FE4A7" }}>After</p>
                    <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.8)" }}>
                      {(prompt as typeof PROMPTS[0]).after}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {(prompt as typeof PROMPTS[0]).corrections?.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", color: "rgba(245,240,232,0.5)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E87461", textDecoration: "line-through" }}>{c.from}</span>
                      <span>→</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4FE4A7" }}>{c.to}</span>
                      <span style={{ color: "rgba(245,240,232,0.35)" }}>— {c.reason}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[10px] italic" style={{ color: "rgba(245,240,232,0.35)" }}>
                  AI-generated te reo Māori — requires review by a competent speaker before use.
                </p>
                <PoweredByAssembl />
              </div>
            </motion.div>
          )}

          {result === "sacred" && (
            <motion.div key="sacred" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Block — red glass */}
              <div className="liquid-glass rounded-2xl p-8 mb-6" style={{ borderColor: "rgba(232,116,97,0.25)", boxShadow: "0 0 40px rgba(232,116,97,0.06), 0 8px 40px rgba(0,0,0,0.4)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(232,116,97,0.12)", border: "1px solid rgba(232,116,97,0.2)" }}>
                    <X size={20} style={{ color: "#E87461" }} />
                  </div>
                  <div>
                    <h3 className="text-base" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#F5F0E8" }}>Sacred content — escalated to Kaitiaki Review</h3>
                  </div>
                </div>
                <p className="text-sm mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.65)" }}>
                  Whaikōrero, karakia, and waiata cannot be AI-generated. This request has been routed to a named kaitiaki for human-led support.
                </p>

                {/* Mead's Five Tests — nested glass */}
                <div className="liquid-glass rounded-xl p-5 mb-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(245,240,232,0.4)" }}>Mead's Five Tests</p>
                  <div className="space-y-3">
                    {MEADS_TESTS.map(t => (
                      <label key={t.name} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                        <input type="checkbox" disabled className="rounded" />
                        <span className="text-xs" style={{ color: "rgba(245,240,232,0.6)" }}>
                          <strong style={{ color: "rgba(245,240,232,0.8)" }}>{t.name}</strong> — {t.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium liquid-glass liquid-glass-gold"
                  style={{ color: "#A8DDDB", borderColor: "rgba(212,168,83,0.3)" }}>
                  Contact kaitiaki team
                </button>
                <PoweredByAssembl />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ngā Pou e Whā — glass surface */}
        <div className="liquid-glass liquid-glass-gold rounded-2xl p-6 mt-8">
          <p className="text-[10px] tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A853" }}>
            Ngā Pou e Whā
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NGA_POU.map(p => (
              <div key={p.name} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(212,168,83,0.04)", border: "1px solid rgba(212,168,83,0.1)" }}>
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: "#D4A853", boxShadow: "0 0 8px rgba(212,168,83,0.3)" }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.8)" }}>{p.name}</p>
                  <p className="text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DemoBottomNav />
      <BrandFooter />
    </DemoGlassShell>
  );
};

export default KaitiakiGateDemo;
