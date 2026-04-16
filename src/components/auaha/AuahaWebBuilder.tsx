import React, { useState, useRef } from "react";
import { Globe, Sparkles, Code, FileText, Palette, Layers, Layout, Monitor, Smartphone, Tablet, ArrowRight, ChevronRight, Eye, Download, Wand2, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#F0D078";
const TEAL = "#5AADA0";
const POUNAMU = "#00A86B";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" } }),
};

function GlassCard({ children, className = "", onClick, glow = false }: { children: React.ReactNode; className?: string; onClick?: () => void; glow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };
  return (
    <div ref={ref} onClick={onClick} onMouseMove={handleMouseMove}
      className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-300 group/gc ${onClick ? "cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl" : "hover:-translate-y-0.5"} ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(22, 22, 38, 0.85), rgba(18, 18, 30, 0.7))",
        borderColor: glow ? `${ACCENT}30` : "rgba(255,255,255,0.08)",
        boxShadow: glow ? `0 0 40px ${ACCENT}0A, 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)` : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full opacity-30 group-hover/gc:opacity-70 transition-opacity duration-500"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
      {glow && <div className="absolute top-0 left-4 right-4 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}60, transparent)` }} />}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/gc:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), ${ACCENT}0A, transparent 40%)` }} />
      {children}
    </div>
  );
}

const PIPELINE_STEPS = [
  { key: "brief", label: "Brief", desc: "Describe your website concept", icon: FileText, agent: "PIXEL", color: ACCENT },
  { key: "structure", label: "Structure", desc: "AI generates sitemap & pages", icon: Layers, agent: "PIXEL", color: "#D4A843" },
  { key: "design", label: "Design", desc: "Brand-aligned design system", icon: Palette, agent: "CHROMATIC", color: TEAL },
  { key: "build", label: "Build", desc: "Component generation & layout", icon: Code, agent: "MUSE", color: POUNAMU },
  { key: "preview", label: "Preview", desc: "Live preview across devices", icon: Eye, agent: "TOI", color: "#3A6A9C" },
  { key: "export", label: "Export", desc: "Download or push to GitHub", icon: Download, agent: "STUDIO DIR.", color: "#F0D078" },
];

const TEMPLATES = [
  { name: "Business Landing", desc: "Clean single-page site with hero, features, testimonials", pages: 1, style: "Minimal" },
  { name: "SaaS Platform", desc: "Multi-page product site with pricing, docs, blog", pages: 6, style: "Modern" },
  { name: "Portfolio", desc: "Visual showcase with gallery, case studies, contact", pages: 4, style: "Creative" },
  { name: "E-commerce", desc: "Product catalogue, cart flow, checkout", pages: 8, style: "Commerce" },
  { name: "Restaurant / Café", desc: "Menu, bookings, location, gallery", pages: 5, style: "Hospitality" },
  { name: "Trade Services", desc: "Services, quote form, project gallery, compliance", pages: 4, style: "Professional" },
];

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function AuahaWebBuilder() {
  const [brief, setBrief] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!brief.trim() && !selectedTemplate) {
      toast.error("Enter a brief or select a template first");
      return;
    }
    setIsGenerating(true);
    setActiveStep(1);

    // Simulate pipeline progression
    let step = 1;
    const interval = setInterval(() => {
      step++;
      setActiveStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setIsGenerating(false);
        toast.success("Website structure generated! Preview ready.", { icon: "🎉" });
      }
    }, 1800);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-8 lg:p-10"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(232,169,72,0.06) 50%, rgba(74,165,168,0.05) 100%)",
          border: "1px solid rgba(232,169,72,0.30)",
          boxShadow: "0 12px 40px rgba(26,29,41,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[80px]" style={{ background: ACCENT }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 blur-[60px]" style={{ background: TEAL }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
                <Globe className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <p className="text-[#6B7280] text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>auaha &gt; web builder</p>
            </div>
            <h1 className="text-foreground text-3xl lg:text-4xl font-light uppercase tracking-[5px] mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Website Builder
            </h1>
            <p className="text-[#1A1D29]/45 text-sm max-w-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Brief → Structure → Design → Build → Export. Three agents orchestrate your website from concept to code.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(90,173,160,0.1)", border: "1px solid rgba(90,173,160,0.2)" }}>
              <div className="w-2 h-2 rounded-full bg-[#5AADA0] animate-pulse" />
              <span className="text-[#5AADA0]/80 text-xs font-medium">PIXEL · MUSE · CHROMATIC</span>
            </div>
            <span className="text-[#8B92A0] text-[10px] font-mono">Kahu compliance on all outputs</span>
          </div>
        </div>
      </motion.div>

      {/* Pipeline Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard glow className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-[#2A2F3D] text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>Build Pipeline</h3>
          </div>
          <div className="relative">
            <div className="absolute top-[22px] left-[40px] right-[40px] h-px" style={{ background: `linear-gradient(90deg, ${ACCENT}30, ${TEAL}30, ${ACCENT}30)` }} />
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i === activeStep;
                const isDone = i < activeStep;
                return (
                  <motion.div key={step.key} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                    className="flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-[rgba(74,165,168,0.04)] min-w-[90px] relative cursor-pointer"
                    onClick={() => !isGenerating && setActiveStep(i)}>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${isActive ? 'scale-110' : ''}`}
                      style={{
                        background: isDone ? `${step.color}25` : isActive ? `${step.color}20` : `${step.color}08`,
                        border: `2px solid ${isDone || isActive ? step.color : step.color + '30'}`,
                        boxShadow: isActive ? `0 0 24px ${step.color}25` : isDone ? `0 0 12px ${step.color}10` : 'none',
                      }}>
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: step.color }} />
                      ) : isActive && isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: step.color }} />
                      ) : (
                        <step.icon className="w-4 h-4" style={{ color: isDone || isActive ? step.color : `${step.color}60` }} />
                      )}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-medium transition-colors ${isDone || isActive ? 'text-[#2A2F3D]' : 'text-[#6B7280]'}`}>{step.label}</span>
                    <span className="text-[8px] text-[#8B92A0] font-mono">{step.agent}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Builder Area — 2 columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Brief + Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brief Input */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-4 h-4" style={{ color: ACCENT }} />
                <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>Website Brief</h3>
              </div>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-[#F0D078]/30 min-h-[140px] resize-none transition-colors placeholder:text-[#8B92A0]"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                placeholder="Describe your website…&#10;&#10;e.g. A modern landing page for a Wellington coffee roastery. Hero section with video background, menu section, about page, and contact form. Earthy colour palette."
              />
              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 h-11 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #D4A843)`, color: "#0A0A0A" }}>
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Website</>
                  )}
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Templates */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-4 h-4" style={{ color: TEAL }} />
                <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>Templates</h3>
              </div>
              <div className="space-y-2">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => {
                      setSelectedTemplate(t.name);
                      setBrief(`Build a ${t.name.toLowerCase()} website. ${t.desc}.`);
                    }}
                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-white/[0.04] hover:-translate-y-0.5 ${
                      selectedTemplate === t.name ? 'border-[#F0D078]/30 bg-[#F0D078]/[0.04]' : 'border-white/[0.05] bg-transparent'
                    }`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1A1D29] text-sm font-medium truncate">{t.name}</p>
                      <p className="text-[#6B7280] text-[11px] truncate">{t.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className="text-[#8B92A0] text-[10px] font-mono">{t.pages}p</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1A1D29]/10 group-hover:text-[#6B7280] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right — Preview Area */}
        <div className="lg:col-span-3 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard glow className="p-6 min-h-[500px]">
              {/* Device Toggle */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: ACCENT }} />
                  <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>Preview</h3>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {([
                    { mode: "desktop" as DeviceMode, icon: Monitor },
                    { mode: "tablet" as DeviceMode, icon: Tablet },
                    { mode: "mobile" as DeviceMode, icon: Smartphone },
                  ]).map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setDeviceMode(mode)}
                      className={`p-2 rounded-md transition-all ${deviceMode === mode ? 'bg-[rgba(74,165,168,0.06)]' : 'hover:bg-[rgba(74,165,168,0.04)]'}`}>
                      <Icon className="w-3.5 h-3.5" style={{ color: deviceMode === mode ? ACCENT : 'rgba(255,255,255,0.3)' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="flex items-center justify-center">
                <div
                  className={`rounded-xl border overflow-hidden transition-all duration-500 ${
                    deviceMode === "mobile" ? "w-[320px]" : deviceMode === "tablet" ? "w-[500px]" : "w-full"
                  }`}
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)",
                    borderColor: "rgba(74,165,168,0.14)",
                    boxShadow: "0 8px 28px rgba(26,29,41,0.07)",
                    minHeight: 380,
                  }}>
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(74,165,168,0.10)" }}>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-5 rounded-md flex items-center justify-center text-[10px] text-[#8B92A0] font-mono" style={{ background: "rgba(255,255,255,0.04)" }}>
                        yoursite.co.nz
                      </div>
                    </div>
                  </div>

                  {/* Preview content */}
                  <AnimatePresence mode="wait">
                    {activeStep >= 5 ? (
                      <motion.div key="generated" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
                        {/* Generated preview mockup */}
                        <div className="space-y-4">
                          <div className="h-40 rounded-lg" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${TEAL}10)`, border: `1px solid ${ACCENT}15` }}>
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                                  <Globe className="w-4 h-4" style={{ color: ACCENT }} />
                                </div>
                                <p className="text-[#4A5160] text-sm font-medium">Hero Section</p>
                                <p className="text-[#8B92A0] text-[10px]">Generated from your brief</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {["Features", "About", "Contact"].map((s) => (
                              <div key={s} className="h-20 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <span className="text-[#6B7280] text-[10px]">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                          style={{ background: `linear-gradient(135deg, ${ACCENT}10, ${TEAL}08)`, border: `1px solid ${ACCENT}15` }}>
                          <Globe className="w-7 h-7" style={{ color: `${ACCENT}50` }} />
                        </div>
                        <p className="text-[#6B7280] text-sm mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {isGenerating ? "Building your website…" : "Enter a brief to start"}
                        </p>
                        <p className="text-[#1A1D29]/15 text-xs text-center max-w-xs">
                          {isGenerating
                            ? "PIXEL, MUSE & CHROMATIC are working together to build your site"
                            : "Describe what you need or pick a template. Our agents will handle structure, design, and code."}
                        </p>
                        {isGenerating && (
                          <div className="mt-6 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />
                            <span className="text-[#6B7280] text-xs font-mono">Step {activeStep} of 5</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Export buttons */}
              {activeStep >= 5 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mt-5">
                  <Button onClick={() => toast.success("Code exported!")} className="flex-1 h-10 rounded-xl" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                    <Download className="w-4 h-4 mr-2" /> Export HTML
                  </Button>
                  <Button onClick={() => toast.success("React export ready!")} className="flex-1 h-10 rounded-xl" style={{ background: `${TEAL}15`, color: TEAL, border: `1px solid ${TEAL}25` }}>
                    <Code className="w-4 h-4 mr-2" /> Export React
                  </Button>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Agent roster */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-[#6B7280] text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>Powering this builder</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "PIXEL", role: "Structure & Sitemap", desc: "Analyses your brief, generates page hierarchy and content blocks", color: ACCENT },
              { name: "CHROMATIC", role: "Design System", desc: "Creates brand-aligned colour palette, typography, and components", color: TEAL },
              { name: "MUSE", role: "Code Generation", desc: "Builds responsive layouts in HTML/React with accessibility baked in", color: POUNAMU },
            ].map((agent) => (
              <div key={agent.name} className="p-4 rounded-xl border transition-all hover:bg-white/[0.03] hover:-translate-y-0.5 group"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${agent.color}12`, border: `1px solid ${agent.color}25` }}>
                    <Sparkles className="w-4 h-4" style={{ color: agent.color }} />
                  </div>
                  <div>
                    <p className="text-[#1A1D29] text-xs font-semibold tracking-wider">{agent.name}</p>
                    <p className="text-[#6B7280] text-[10px]">{agent.role}</p>
                  </div>
                </div>
                <p className="text-[#8B92A0] text-[11px] leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
