import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { Trophy, Bell, BellOff, ChevronRight, Copy, Check, ArrowLeft, Plus, Image, Lock, Calendar, ExternalLink } from "lucide-react";
import { NeonTrophy } from "@/components/NeonIcons";
import ReactMarkdown from "react-markdown";

const APEX_COLOR = "#5AADA0";

const AWARDS = [
  { name: "House of the Year", org: "Registered Master Builders", entry: "Jan–Feb", event: "Nov", url: "houseoftheyear.co.nz", criteria: "craftsmanship, design innovation, build quality" },
  { name: "NZ Commercial Project Awards", org: "Registered Master Builders", entry: "Varies", event: "Oct", url: "commercialprojectawards.co.nz", criteria: "whole-team collaboration, project delivery excellence" },
  { name: "Property Industry Awards", org: "Property Council NZ", entry: "Feb–Mar", event: "12 Jun 2026", url: "propertynz.co.nz", criteria: "design excellence, innovation, sustainability, community impact" },
  { name: "NAWIC Excellence Awards", org: "NAWIC NZ", entry: "Mar–Apr", event: "24 Jul 2026", url: "nawic.org.nz", criteria: "women's leadership, mentoring, career development" },
  { name: "NZ Architecture Awards", org: "NZIA", entry: "Varies", event: "Varies", url: "nzia.co.nz", criteria: "architectural excellence, innovation" },
  { name: "Safeguard NZ Workplace H&S Awards", org: "Safeguard", entry: "Mid year", event: "Oct", url: "safeguard.co.nz", criteria: "workplace health and safety excellence" },
  { name: "NZ Green Building Awards", org: "NZGBC", entry: "Varies", event: "Varies", url: "nzgbc.org.nz", criteria: "sustainability, green building innovation" },
  { name: "Regional Business Awards", org: "Various chambers", entry: "Varies", event: "Varies", url: "Various", criteria: "business excellence, innovation, community contribution" },
  { name: "Sustainable Business Awards", org: "SBN", entry: "Varies", event: "Varies", url: "sustainable.org.nz", criteria: "sustainability leadership" },
  { name: "Site Safe Awards", org: "Site Safe", entry: "Varies", event: "Varies", url: "sitesafe.org.nz", criteria: "health and safety excellence in construction" },
  { name: "CCNZ Hirepool Awards", org: "Civil Contractors NZ", entry: "Varies", event: "Aug", url: "civilcontractors.co.nz", criteria: "civil construction excellence" },
  { name: "Women in Infrastructure Awards", org: "Infrastructure NZ", entry: "Varies", event: "Varies", url: "infrastructure.org.nz", criteria: "women's leadership in infrastructure" },
];

interface Project {
  name: string;
  location: string;
  value: string;
  client: string;
  completion: string;
  description: string;
  awards: string;
}

type SubView = "menu" | "calendar" | "nominate" | "portfolio";

interface Props {
  isPaid: boolean;
  userRole?: string;
}

const ApexAwardsTracker = ({ isPaid, userRole }: Props) => {
  const [subView, setSubView] = useState<SubView>("menu");
  const [alerts, setAlerts] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("apex_award_alerts") || "[]")); } catch { return new Set(); }
  });
  const [selectedAward, setSelectedAward] = useState<typeof AWARDS[0] | null>(null);
  const [nomForm, setNomForm] = useState({ projectName: "", description: "", teamMembers: "", value: "", completion: "", special: "" });
  const [nomResult, setNomResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem("apex_portfolio") || "[]"); } catch { return []; }
  });
  const [newProject, setNewProject] = useState<Project>({ name: "", location: "", value: "", client: "", completion: "", description: "", awards: "" });
  const [showAddProject, setShowAddProject] = useState(false);

  const isPro = userRole === "pro" || userRole === "business" || userRole === "admin";

  if (!isPro) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${APEX_COLOR}15`, border: `1px solid ${APEX_COLOR}30` }}>
            <Lock size={28} style={{ color: APEX_COLOR }} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Awards & Recognition</h3>
          <p className="text-sm text-muted-foreground mb-4">Track awards, generate nominations, and build your project portfolio. Pro and Business plans.</p>
          <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold" style={{ background: APEX_COLOR, color: "#0A0A14" }}>Upgrade to Pro</a>
        </div>
      </div>
    );
  }

  const toggleAlert = (name: string) => {
    const next = new Set(alerts);
    next.has(name) ? next.delete(name) : next.add(name);
    setAlerts(next);
    localStorage.setItem("apex_award_alerts", JSON.stringify([...next]));
  };

  const generateNomination = async () => {
    if (!selectedAward) return;
    setIsGenerating(true);
    const companyProfile = localStorage.getItem("apex_company_profile") || "";
    const portfolioContext = projects.length > 0 ? `\nPROJECT PORTFOLIO:\n${projects.map(p => `- ${p.name}: ${p.description} (${p.value}, ${p.location})`).join("\n")}` : "";
    const prompt = `You are APEX, NZ construction award nomination specialist. Generate a complete award nomination/entry for the "${selectedAward.name}" (${selectedAward.org}).

Award criteria focus: ${selectedAward.criteria}

PROJECT DETAILS:
- Name: ${nomForm.projectName || "[PROJECT NAME]"}
- Description: ${nomForm.description || "[Describe the project]"}
- Key Team: ${nomForm.teamMembers || "[Team members]"}
- Value: ${nomForm.value || "[Value]"}
- Completion: ${nomForm.completion || "[Date]"}
- What made this special: ${nomForm.special || "[Special aspects]"}
${companyProfile ? `\nCOMPANY PROFILE:\n${companyProfile}` : ""}${portfolioContext}

Generate: project overview, innovation highlights, sustainability measures, challenges overcome, community benefit, team recognition. Write in confident, professional NZ English. Tailor to the specific award's evaluation criteria.`;

    try {
      const content = await agentChat({ agentId: "construction", message: prompt, packId: "waihanga" });
      setNomResult(content);
    } catch { setNomResult("Error generating nomination. Please try again."); }
    finally { setIsGenerating(false); }
  };

  const addProject = () => {
    if (!newProject.name.trim()) return;
    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem("apex_portfolio", JSON.stringify(updated));
    setNewProject({ name: "", location: "", value: "", client: "", completion: "", description: "", awards: "" });
    setShowAddProject(false);
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
            <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2"><Trophy size={20} style={{ color: APEX_COLOR }} /> Awards & Recognition</h2>
            <p className="text-xs text-muted-foreground">Track awards, generate nominations, build your portfolio</p>
          </div>
          {[
            { id: "calendar" as SubView, icon: Calendar, title: "NZ Awards Calendar", desc: "All major construction & property awards with deadlines" },
            { id: "nominate" as SubView, icon: Trophy, title: "Nomination Generator", desc: "AI-generated award entries tailored to each award's criteria" },
            { id: "portfolio" as SubView, icon: Image, title: "Project Portfolio", desc: `${projects.length} project${projects.length !== 1 ? "s" : ""} saved — auto-populate nominations & tenders` },
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

  if (subView === "calendar") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Calendar size={20} style={{ color: APEX_COLOR }} /> NZ Awards Calendar</h2>
          <div className="space-y-2">
            {AWARDS.map((award) => (
              <div key={award.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${APEX_COLOR}05`, border: `1px solid ${APEX_COLOR}12` }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground">{award.name}</div>
                  <div className="text-[10px] text-muted-foreground">{award.org}</div>
                  <div className="flex gap-3 mt-1 text-[9px] text-muted-foreground">
                    <span>Entry: {award.entry}</span><span>Event: {award.event}</span>
                  </div>
                </div>
                <a href={`https://${award.url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted"><ExternalLink size={12} className="text-muted-foreground" /></a>
                <button onClick={() => toggleAlert(award.name)} className="p-1.5 rounded-md transition-colors" style={{ color: alerts.has(award.name) ? APEX_COLOR : "hsl(var(--muted-foreground))" }}>
                  {alerts.has(award.name) ? <Bell size={14} /> : <BellOff size={14} />}
                </button>
                <button onClick={() => { setSelectedAward(award); setSubView("nominate"); }} className="px-2 py-1 rounded-md text-[9px] font-bold" style={{ background: APEX_COLOR, color: "#0A0A14" }}>Nominate</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (subView === "nominate") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Trophy size={20} style={{ color: APEX_COLOR }} /> Generate Nomination</h2>
          {selectedAward && <p className="text-xs px-3 py-1.5 rounded-full inline-block" style={{ background: `${APEX_COLOR}15`, color: APEX_COLOR }}>{selectedAward.name}</p>}
          {!selectedAward && (
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">Select Award</label>
              <select onChange={(e) => setSelectedAward(AWARDS.find(a => a.name === e.target.value) || null)} className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground">
                <option value="">Choose an award...</option>
                {AWARDS.map(a => <option key={a.name} value={a.name}>{a.name} — {a.org}</option>)}
              </select>
            </div>
          )}
          {["projectName:Project Name:text", "description:Project Description:textarea", "teamMembers:Key Team Members:text", "value:Project Value (NZD):text", "completion:Completion Date:text", "special:What Made This Project Special:textarea"].map(f => {
            const [key, label, type] = f.split(":");
            return (
              <div key={key}>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">{label}</label>
                {type === "textarea" ? (
                  <textarea value={(nomForm as any)[key] || ""} onChange={(e) => setNomForm(prev => ({ ...prev, [key]: e.target.value }))} rows={3} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <input value={(nomForm as any)[key] || ""} onChange={(e) => setNomForm(prev => ({ ...prev, [key]: e.target.value }))} className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                )}
              </div>
            );
          })}
          <button onClick={generateNomination} disabled={isGenerating || !selectedAward} className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${APEX_COLOR}, ${APEX_COLOR}CC)`, color: "#0A0A14" }}>
            {isGenerating ? "Generating Nomination..." : "Generate Nomination"}
          </button>
          {nomResult && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: APEX_COLOR }}>Award Nomination</span>
                <button onClick={() => handleCopy(nomResult, "nom")} className="text-[10px] px-2 py-1 rounded-md flex items-center gap-1" style={{ background: `${APEX_COLOR}15`, color: APEX_COLOR }}>
                  {copied === "nom" ? <Check size={10} /> : <Copy size={10} />} {copied === "nom" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="prose prose-sm max-w-none [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]"><ReactMarkdown>{nomResult}</ReactMarkdown></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Portfolio
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Image size={20} style={{ color: APEX_COLOR }} /> Project Portfolio</h2>
          <button onClick={() => setShowAddProject(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: APEX_COLOR, color: "#0A0A14" }}><Plus size={12} /> Add Project</button>
        </div>
        {showAddProject && (
          <div className="rounded-xl p-4 space-y-3" style={{ border: `1px solid ${APEX_COLOR}30` }}>
            {(["name:Project Name", "location:Location", "value:Value (NZD)", "client:Client", "completion:Completion Date", "description:Description", "awards:Awards Won"] as const).map(f => {
              const [key, label] = f.split(":") as [keyof Project, string];
              return (
                <div key={key}><label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">{label}</label>
                <input value={newProject[key]} onChange={(e) => setNewProject(prev => ({ ...prev, [key]: e.target.value }))} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              );
            })}
            <div className="flex gap-2">
              <button onClick={addProject} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: APEX_COLOR, color: "#0A0A14" }}>Save Project</button>
              <button onClick={() => setShowAddProject(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground border border-border">Cancel</button>
            </div>
          </div>
        )}
        {projects.length === 0 && !showAddProject && <p className="text-sm text-muted-foreground text-center py-8">No projects yet. Add your completed projects to auto-populate tenders and nominations.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((p, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: `${APEX_COLOR}06`, border: `1px solid ${APEX_COLOR}15` }}>
              <div className="font-bold text-sm text-foreground">{p.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{p.location} · {p.client}</div>
              <div className="text-[10px] text-muted-foreground">{p.value} · {p.completion}</div>
              {p.awards && <div className="text-[9px] mt-1 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5" style={{ background: `${APEX_COLOR}15`, color: APEX_COLOR }}><NeonTrophy size={10} color={APEX_COLOR} /> {p.awards}</div>}
              <p className="text-xs text-foreground/70 mt-2 line-clamp-2">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApexAwardsTracker;
