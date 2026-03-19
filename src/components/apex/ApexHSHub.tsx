import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Heart, Award, AlertTriangle, ChevronRight, ArrowLeft, Copy, Check, Lock, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

const APEX_COLOR = "#FF6B35";

const SAFETY_PLAN_SECTIONS = [
  "Hazard identification and risk register",
  "Emergency procedures and evacuation plan",
  "PPE requirements by task",
  "Site-specific traffic management",
  "Working at heights procedures",
  "Excavation and trenching protocols",
  "Hazardous substances management",
  "Hot works permit process",
  "Confined spaces procedures",
  "Seismic event response (NZ-specific)",
  "Weather event protocols",
  "First aid requirements and nearest hospital/ED",
  "WorkSafe notification requirements",
  "Contractor and subcontractor H&S requirements",
];

const TOOLBOX_TALKS = [
  "It's OK to not be OK — recognising signs in yourself and mates",
  "Managing stress on site",
  "Work-life balance in construction",
  "Supporting a mate who's struggling",
  "Returning to work after time off for mental health",
  "Seasonal affective disorder (NZ winters)",
  "Financial stress management",
];

const WELLBEING_RESOURCES = [
  { name: "1737 — Need to Talk?", url: "https://1737.org.nz", desc: "Free call or text 1737" },
  { name: "MATES in Construction", url: "https://mates.net.nz", desc: "Construction-specific mental health" },
  { name: "Working Well (Site Safe)", url: "https://sitesafe.org.nz", desc: "Wellbeing programme for sites" },
  { name: "Lifeline", url: "tel:0800543354", desc: "0800 543 354 — 24/7 crisis support" },
  { name: "Depression.org.nz", url: "https://depression.org.nz", desc: "The Lowdown / Sparx" },
];

const CERT_ITEMS = [
  { name: "Site Safe membership", desc: "Training requirements and membership levels" },
  { name: "Tōtika prequalification", desc: "Replacing SiteWise — new prequalification scheme" },
  { name: "ACC WSMP audit", desc: "Workplace Safety Management Practices preparation" },
  { name: "ISO 45001 implementation", desc: "OH&S management system checklist" },
  { name: "IQP requirements", desc: "Independently Qualified Person obligations" },
  { name: "WorkSafe engagement", desc: "Notification and engagement guidance" },
  { name: "H&S representative election", desc: "HSWA Section 61-64 requirements" },
];

const INCIDENT_TEMPLATES = [
  "Incident investigation report (ICAM methodology)",
  "Near-miss report template",
  "Monthly H&S statistics report",
  "Board/executive H&S reporting template",
  "Notifiable event notification checklist (WorkSafe)",
];

type SubView = "menu" | "safety_plan" | "wellbeing" | "certs" | "incidents";

interface Props { isPaid: boolean; userRole?: string; }

const ApexHSHub = ({ isPaid, userRole }: Props) => {
  const [subView, setSubView] = useState<SubView>("menu");
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [projectDesc, setProjectDesc] = useState("");

  const isPro = userRole === "pro" || userRole === "business" || userRole === "admin";

  if (!isPro) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${APEX_COLOR}15`, border: `1px solid ${APEX_COLOR}30` }}><Lock size={28} style={{ color: APEX_COLOR }} /></div>
          <h3 className="text-lg font-bold text-foreground mb-2">H&S Hub</h3>
          <p className="text-sm text-muted-foreground mb-4">Comprehensive health, safety & wellbeing tools. Pro and Business plans.</p>
          <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold" style={{ background: APEX_COLOR, color: "#0A0A14" }}>Upgrade to Pro</a>
        </div>
      </div>
    );
  }

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

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button onClick={() => handleCopy(text, id)} className="text-[9px] px-2 py-0.5 rounded flex items-center gap-1" style={{ color: APEX_COLOR }}>
      {copied === id ? <Check size={8} /> : <Copy size={8} />} {copied === id ? "Copied" : "Copy"}
    </button>
  );

  if (subView === "menu") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2"><Shield size={20} style={{ color: APEX_COLOR }} /> H&S Hub</h2>
            <p className="text-xs text-muted-foreground">Health, safety, mental health & wellbeing for construction</p>
          </div>
          {[
            { id: "safety_plan" as SubView, icon: Shield, title: "Site Safety Plan Generator", desc: "Comprehensive SSSP with all mandatory NZ sections" },
            { id: "wellbeing" as SubView, icon: Heart, title: "Mental Health & Wellbeing", desc: "Toolbox talks, policies, MATES in Construction resources" },
            { id: "certs" as SubView, icon: Award, title: "H&S Certifications & Partnerships", desc: "Site Safe, Tōtika, ACC WSMP, ISO 45001 guidance" },
            { id: "incidents" as SubView, icon: AlertTriangle, title: "Incident & Near-Miss Reporting", desc: "Investigation templates and reporting frameworks" },
          ].map((item) => (
            <button key={item.id} onClick={() => setSubView(item.id)} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${APEX_COLOR}15` }}><item.icon size={22} style={{ color: APEX_COLOR }} /></div>
              <div className="flex-1"><span className="font-bold text-sm text-foreground">{item.title}</span><p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p></div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (subView === "safety_plan") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Shield size={20} style={{ color: APEX_COLOR }} /> Site Safety Plan Generator</h2>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">Project Description (optional)</label>
            <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} rows={3} placeholder="Describe the project, site conditions, type of work..." className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            {SAFETY_PLAN_SECTIONS.map((section) => {
              const key = `safety_${section}`;
              return (
                <div key={section} className="rounded-lg" style={{ border: `1px solid ${APEX_COLOR}15` }}>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs font-medium text-foreground">🦺 {section}</span>
                    <button onClick={() => generate(key, `You are APEX, NZ construction H&S specialist. Generate a comprehensive "${section}" section for a Site-Specific Safety Plan (SSSP). ${projectDesc ? `Project: ${projectDesc}` : ""} Reference HSWA 2015, WorkSafe NZ, relevant NZS standards, and NZ-specific requirements. Be thorough and practical.`)} disabled={generating === key} className="px-3 py-1 rounded-md text-[10px] font-bold disabled:opacity-40" style={{ background: APEX_COLOR, color: "#0A0A14" }}>
                      {generating === key ? "..." : generatedContent[key] ? "Regen" : "Generate"}
                    </button>
                  </div>
                  {generatedContent[key] && (
                    <div className="px-3 pb-3 border-t" style={{ borderColor: `${APEX_COLOR}10` }}>
                      <div className="flex justify-end mt-1"><CopyBtn text={generatedContent[key]} id={key} /></div>
                      <div className="prose prose-invert prose-xs max-w-none"><ReactMarkdown>{generatedContent[key]}</ReactMarkdown></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (subView === "wellbeing") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Heart size={20} style={{ color: APEX_COLOR }} /> Mental Health & Wellbeing</h2>
          <p className="text-[11px] text-muted-foreground">Construction has the highest suicide rate of any NZ industry. These tools help you build a culture of care on your sites.</p>

          {/* Resources */}
          <div className="rounded-xl p-4" style={{ background: "#FF000008", border: "1px solid #FF000020" }}>
            <h3 className="text-xs font-bold text-foreground mb-2">🆘 NZ Support Resources</h3>
            <div className="space-y-2">
              {WELLBEING_RESOURCES.map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-lg bg-card hover:bg-muted transition-colors">
                  <div><div className="text-xs font-bold text-foreground">{r.name}</div><div className="text-[10px] text-muted-foreground">{r.desc}</div></div>
                  <ExternalLink size={12} className="text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Toolbox Talks */}
          <div>
            <h3 className="text-xs font-bold text-foreground mb-2">💬 Toolbox Talk Templates</h3>
            <div className="space-y-2">
              {TOOLBOX_TALKS.map(talk => {
                const key = `talk_${talk}`;
                return (
                  <div key={talk} className="rounded-lg" style={{ border: `1px solid ${APEX_COLOR}15` }}>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs text-foreground">{talk}</span>
                      <button onClick={() => generate(key, `You are APEX. Generate a complete Toolbox Talk template on "${talk}" for NZ construction sites. Include: key messages, discussion points, signs to watch for, what to do/say, local NZ resources. Keep it practical — this will be delivered by a site foreman to a crew of tradies. Use NZ language and cultural context.`)} disabled={generating === key} className="px-2 py-1 rounded text-[9px] font-bold shrink-0 disabled:opacity-40" style={{ background: APEX_COLOR, color: "#0A0A14" }}>
                        {generating === key ? "..." : "Generate"}
                      </button>
                    </div>
                    {generatedContent[key] && (
                      <div className="px-3 pb-3 border-t" style={{ borderColor: `${APEX_COLOR}10` }}>
                        <div className="flex justify-end mt-1"><CopyBtn text={generatedContent[key]} id={key} /></div>
                        <div className="prose prose-invert prose-xs max-w-none"><ReactMarkdown>{generatedContent[key]}</ReactMarkdown></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Policy Generators */}
          <div>
            <h3 className="text-xs font-bold text-foreground mb-2">📋 Policy & Programme Generators</h3>
            {["Mental health and wellbeing policy", "Drug and alcohol policy (NZ legislation aligned)", "Fatigue management plan", "EAP setup guidance", "Wellbeing check-in templates for site managers"].map(item => {
              const key = `policy_${item}`;
              return (
                <div key={item} className="flex items-center justify-between px-3 py-2 rounded-lg mb-1" style={{ border: `1px solid ${APEX_COLOR}10` }}>
                  <span className="text-xs text-foreground">{item}</span>
                  <button onClick={() => generate(key, `You are APEX. Generate a complete "${item}" for a NZ construction business. Align with HSWA 2015, Employment Relations Act 2000, and NZ best practice. Reference MATES in Construction, Site Safe Working Well, and relevant NZ standards.`)} disabled={generating === key} className="px-2 py-1 rounded text-[9px] font-bold shrink-0 disabled:opacity-40" style={{ background: APEX_COLOR, color: "#0A0A14" }}>
                    {generating === key ? "..." : "Generate"}
                  </button>
                </div>
              );
            })}
            {Object.entries(generatedContent).filter(([k]) => k.startsWith("policy_")).map(([k, v]) => (
              <div key={k} className="rounded-lg p-3 mt-2" style={{ background: `${APEX_COLOR}05`, border: `1px solid ${APEX_COLOR}15` }}>
                <div className="flex justify-end mb-1"><CopyBtn text={v} id={k} /></div>
                <div className="prose prose-invert prose-xs max-w-none"><ReactMarkdown>{v}</ReactMarkdown></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (subView === "certs") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Award size={20} style={{ color: APEX_COLOR }} /> H&S Certifications & Partnerships</h2>
          <div className="space-y-2">
            {CERT_ITEMS.map(item => {
              const key = `cert_${item.name}`;
              return (
                <div key={item.name} className="rounded-lg" style={{ border: `1px solid ${APEX_COLOR}15` }}>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div><div className="text-xs font-bold text-foreground">{item.name}</div><div className="text-[10px] text-muted-foreground">{item.desc}</div></div>
                    <button onClick={() => generate(key, `You are APEX. Generate comprehensive guidance for "${item.name}" — ${item.desc}. Include requirements, steps to achieve, costs where relevant, timeline, and NZ-specific references. Reference CHASNZ, WorkSafe, and relevant standards.`)} disabled={generating === key} className="px-3 py-1 rounded text-[9px] font-bold shrink-0 disabled:opacity-40" style={{ background: APEX_COLOR, color: "#0A0A14" }}>
                      {generating === key ? "..." : "Generate"}
                    </button>
                  </div>
                  {generatedContent[key] && (
                    <div className="px-3 pb-3 border-t" style={{ borderColor: `${APEX_COLOR}10` }}>
                      <div className="flex justify-end mt-1"><CopyBtn text={generatedContent[key]} id={key} /></div>
                      <div className="prose prose-invert prose-xs max-w-none"><ReactMarkdown>{generatedContent[key]}</ReactMarkdown></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Incidents
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><AlertTriangle size={20} style={{ color: APEX_COLOR }} /> Incident & Near-Miss Reporting</h2>
        <div className="space-y-2">
          {INCIDENT_TEMPLATES.map(item => {
            const key = `incident_${item}`;
            return (
              <div key={item} className="rounded-lg" style={{ border: `1px solid ${APEX_COLOR}15` }}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-xs font-medium text-foreground">⚠️ {item}</span>
                  <button onClick={() => generate(key, `You are APEX. Generate a complete "${item}" template for NZ construction businesses. Align with ICAM methodology where relevant, HSWA 2015, and WorkSafe NZ requirements. Include all necessary fields and sections. Make it practical and ready to use.`)} disabled={generating === key} className="px-3 py-1 rounded text-[9px] font-bold shrink-0 disabled:opacity-40" style={{ background: APEX_COLOR, color: "#0A0A14" }}>
                    {generating === key ? "..." : "Generate"}
                  </button>
                </div>
                {generatedContent[key] && (
                  <div className="px-3 pb-3 border-t" style={{ borderColor: `${APEX_COLOR}10` }}>
                    <div className="flex justify-end mt-1"><CopyBtn text={generatedContent[key]} id={key} /></div>
                    <div className="prose prose-invert prose-xs max-w-none"><ReactMarkdown>{generatedContent[key]}</ReactMarkdown></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApexHSHub;
