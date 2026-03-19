import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, BarChart3, FileText, Building2, ChevronRight, ArrowLeft, Copy, Check, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";

const APEX_COLOR = "#FF6B35";

const ESG_QUESTIONS = {
  environmental: [
    { id: "carbon", q: "Do you measure your carbon footprint?", options: ["Not yet", "Starting to", "Annually measured", "Independently verified"] },
    { id: "waste", q: "What % of construction waste is diverted from landfill?", options: ["<25%", "25-50%", "50-75%", ">75%"] },
    { id: "energy", q: "Energy efficiency in operations?", options: ["No measures", "Basic measures", "Active programme", "Net zero target set"] },
    { id: "materials", q: "Sustainable material sourcing?", options: ["No policy", "Informal", "Formal policy", "Third-party certified supply chain"] },
    { id: "water", q: "Water management on sites?", options: ["No measures", "Basic compliance", "Active management", "Best practice"] },
    { id: "biodiversity", q: "Biodiversity impact management?", options: ["Not considered", "Aware", "Mitigation plans", "Net positive approach"] },
  ],
  social: [
    { id: "hs_performance", q: "H&S performance (TRIFR, LTI rate)?", options: ["Above industry average", "At average", "Below average", "Zero harm achieved"] },
    { id: "mental_health", q: "Mental health & wellbeing programmes?", options: ["None", "Basic EAP", "Active programme", "MATES partnership + comprehensive"] },
    { id: "diversity", q: "Diversity & inclusion metrics?", options: ["Not tracked", "Tracked", "Targets set", "Externally reported"] },
    { id: "nawic", q: "Women in leadership %?", options: ["<5%", "5-15%", "15-30%", ">30%"] },
    { id: "maori_pasifika", q: "Māori & Pasifika workforce development?", options: ["No programme", "Informal", "Formal programme", "Partnership with iwi/Pasifika orgs"] },
    { id: "community", q: "Community engagement & social procurement?", options: ["Minimal", "Occasional", "Regular programme", "Strategic with KPIs"] },
    { id: "training", q: "Training & apprenticeship investment?", options: ["Minimal", "Some", "Active programme", "Industry-leading"] },
  ],
  governance: [
    { id: "board_diversity", q: "Board diversity?", options: ["No diversity", "Some diversity", "Diverse with targets", "Industry-leading diversity"] },
    { id: "esg_reporting", q: "ESG reporting frequency?", options: ["None", "Ad hoc", "Annual", "Quarterly + annual"] },
    { id: "sustainability_strategy", q: "Sustainability strategy & targets?", options: ["None", "Informal goals", "Formal strategy", "Science-based targets"] },
    { id: "ethics", q: "Ethical business practices policy?", options: ["None", "Basic code of conduct", "Comprehensive policy", "Third-party audited"] },
  ],
};

type SubView = "menu" | "assessment" | "action_plan" | "report" | "alignment";

interface Props { isPaid: boolean; userRole?: string; }

const ApexESGDashboard = ({ isPaid, userRole }: Props) => {
  const [subView, setSubView] = useState<SubView>("menu");
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("apex_esg_answers") || "{}"); } catch { return {}; }
  });
  const [score, setScore] = useState<{ total: number; env: number; social: number; gov: number } | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const isPro = userRole === "pro" || userRole === "business" || userRole === "admin";

  if (!isPro) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${APEX_COLOR}15`, border: `1px solid ${APEX_COLOR}30` }}><Lock size={28} style={{ color: APEX_COLOR }} /></div>
          <h3 className="text-lg font-bold text-foreground mb-2">ESG Dashboard</h3>
          <p className="text-sm text-muted-foreground mb-4">Environmental, Social & Governance assessment and reporting. Pro and Business plans.</p>
          <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold" style={{ background: APEX_COLOR, color: "#0A0A14" }}>Upgrade to Pro</a>
        </div>
      </div>
    );
  }

  const calculateScore = () => {
    localStorage.setItem("apex_esg_answers", JSON.stringify(answers));
    const cats = { env: ESG_QUESTIONS.environmental, social: ESG_QUESTIONS.social, gov: ESG_QUESTIONS.governance };
    const calcCat = (qs: typeof ESG_QUESTIONS.environmental) => {
      const max = qs.length * 3;
      const actual = qs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      return Math.round((actual / max) * 100);
    };
    const env = calcCat(cats.env);
    const social = calcCat(cats.social);
    const gov = calcCat(cats.gov);
    const total = Math.round((env + social + gov) / 3);
    setScore({ total, env, social, gov });
  };

  const getColor = (val: number) => val >= 75 ? "#00FF88" : val >= 50 ? "#FFB800" : "#FF4D6A";

  const generate = async (key: string, prompt: string) => {
    setGenerating(key);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: "construction", messages: [{ role: "user", content: prompt }] },
      });
      if (error) throw error;
      setGeneratedContent(prev => ({ ...prev, [key]: data.content }));
    } catch { setGeneratedContent(prev => ({ ...prev, [key]: "Error generating. Please try again." })); }
    finally { setGenerating(null); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (subView === "menu") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2"><Leaf size={20} style={{ color: APEX_COLOR }} /> ESG Dashboard</h2>
            <p className="text-xs text-muted-foreground">Environmental, Social & Governance for NZ construction</p>
          </div>
          {[
            { id: "assessment" as SubView, icon: BarChart3, title: "ESG Score Assessment", desc: "Answer questions to get your ESG scorecard with traffic lights", badge: score ? `${score.total}/100` : "Assess" },
            { id: "action_plan" as SubView, icon: Leaf, title: "ESG Improvement Action Plan", desc: "Prioritised quick wins, medium-term and long-term actions" },
            { id: "report" as SubView, icon: FileText, title: "ESG Report Generator", desc: "Annual ESG report template — GRI-aligned, NZ-specific" },
            { id: "alignment" as SubView, icon: Building2, title: "Industry Alignment", desc: "Construction Accord, NZGBC, UN SDGs, Toitū alignment" },
          ].map(item => (
            <button key={item.id} onClick={() => setSubView(item.id)} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${APEX_COLOR}15` }}><item.icon size={22} style={{ color: APEX_COLOR }} /></div>
              <div className="flex-1"><span className="font-bold text-sm text-foreground">{item.title}</span><p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p></div>
              {"badge" in item && item.badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${APEX_COLOR}20`, color: APEX_COLOR }}>{item.badge}</span>}
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (subView === "assessment") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-lg font-bold text-foreground">ESG Score Assessment</h2>

          {(["environmental", "social", "governance"] as const).map(cat => (
            <div key={cat}>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-2" style={{ color: APEX_COLOR }}>
                {cat === "environmental" ? "🌿 Environmental" : cat === "social" ? "👥 Social" : "⚖️ Governance"}
              </h3>
              <div className="space-y-3">
                {ESG_QUESTIONS[cat].map(q => (
                  <div key={q.id}>
                    <p className="text-xs text-foreground mb-1.5">{q.q}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((opt, i) => (
                        <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))} className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all border"
                          style={{ background: answers[q.id] === i ? `${APEX_COLOR}20` : "transparent", borderColor: answers[q.id] === i ? `${APEX_COLOR}50` : "hsl(var(--border))", color: answers[q.id] === i ? APEX_COLOR : "hsl(var(--foreground) / 0.7)" }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={calculateScore} className="w-full py-3 rounded-xl text-sm font-bold" style={{ background: `linear-gradient(135deg, ${APEX_COLOR}, ${APEX_COLOR}CC)`, color: "#0A0A14" }}>Calculate ESG Score</button>

          {score && (
            <div className="rounded-xl p-5 space-y-4" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}25` }}>
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: getColor(score.total) }}>{score.total}<span className="text-lg text-muted-foreground">/100</span></div>
                <p className="text-xs text-muted-foreground mt-1">{score.total >= 75 ? "Strong performer" : score.total >= 50 ? "Good foundation — room to improve" : "Early stage — significant opportunity"}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: "Environmental", val: score.env }, { label: "Social", val: score.social }, { label: "Governance", val: score.gov }].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-card">
                    <div className="text-lg font-bold" style={{ color: getColor(s.val) }}>{s.val}</div>
                    <div className="text-[9px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Action plan, report, alignment — all use generate
  const viewConfig: Record<string, { title: string; icon: any; prompt: string }> = {
    action_plan: {
      title: "ESG Improvement Action Plan",
      icon: Leaf,
      prompt: `You are APEX, NZ construction ESG specialist. Based on this ESG assessment data: ${JSON.stringify(answers)}, Score: ${score?.total || "not assessed"}/100 (Env: ${score?.env}, Social: ${score?.social}, Gov: ${score?.gov}). Generate a prioritised ESG improvement action plan: Quick wins (this week), Medium-term (this quarter), Long-term (this year). Each action: what to do, estimated cost, expected impact, which ESG framework it aligns with. Reference NZ-specific frameworks.`,
    },
    report: {
      title: "ESG Report Generator",
      icon: FileText,
      prompt: `You are APEX. Generate a comprehensive annual ESG report template for a NZ construction company. Include: CEO statement, company overview, Environmental performance (emissions, waste, energy), Social performance (safety, people, community), Governance (ethics, risk, compliance), Goals and targets. Reference Climate Change Response Act, Building for Climate Change, NZ ETS. GRI-aligned where possible.`,
    },
    alignment: {
      title: "Industry Alignment",
      icon: Building2,
      prompt: `You are APEX. Show how a NZ construction company's ESG efforts align with: Construction Sector Accord goals (thriving, fair, sustainable), Property Council NZ sustainability strategy, NZGBC Green Star / Homestar, BRANZ environment roadmap, NZ Infrastructure Commission sustainability goals, UN SDGs (9, 11, 12, 13), Toitū Envirocare carbon programmes. For each, explain what it is, how to align, and practical steps.`,
    },
  };

  const cfg = viewConfig[subView];
  if (!cfg) return null;
  const key = `esg_${subView}`;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><cfg.icon size={20} style={{ color: APEX_COLOR }} /> {cfg.title}</h2>
        {!generatedContent[key] && (
          <button onClick={() => generate(key, cfg.prompt)} disabled={generating === key} className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${APEX_COLOR}, ${APEX_COLOR}CC)`, color: "#0A0A14" }}>
            {generating === key ? "Generating..." : `Generate ${cfg.title}`}
          </button>
        )}
        {generatedContent[key] && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
            <div className="flex justify-end">
              <button onClick={() => handleCopy(generatedContent[key], key)} className="text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ color: APEX_COLOR }}>
                {copied === key ? <Check size={10} /> : <Copy size={10} />} {copied === key ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{generatedContent[key]}</ReactMarkdown></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApexESGDashboard;
