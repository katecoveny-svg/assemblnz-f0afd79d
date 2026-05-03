import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { MessageSquare, Calendar, FileText, GraduationCap, BookOpen, RefreshCw, Star, Newspaper, Copy, Check, Lock, ArrowLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const UNIVERSAL_TOOLS = [
  { id: "announcement", icon: MessageSquare, label: "Team Announcement", desc: "Policy updates, new hires, events, achievements" },
  { id: "agenda", icon: Calendar, label: "Meeting Agenda", desc: "Standups, board meetings, project reviews, H&S meetings" },
  { id: "policy", icon: FileText, label: "Policy Document", desc: "NZ-compliant policies for your sector" },
  { id: "training", icon: GraduationCap, label: "Staff Training Plan", desc: "12-month training plan with NZ certifications" },
  { id: "handbook", icon: BookOpen, label: "Employee Handbook Section", desc: "Aligned with NZ employment law" },
  { id: "change_mgmt", icon: RefreshCw, label: "Change Management Comms", desc: "Phased communication plan for change" },
  { id: "perf_review", icon: Star, label: "Performance Review Template", desc: "Annual, probation, 360, development plans" },
  { id: "newsletter", icon: Newspaper, label: "Internal Newsletter", desc: "CEO message, updates, team spotlight, dates" },
];

const AGENT_SPECIFIC: Record<string, { label: string; items: string[] }> = {
  construction: { label: "APEX Construction", items: ["Toolbox talk generator", "Site induction template", "Subcontractor comms template", "Project milestone announcement", "Safety alert notification", "Weather event site closure notice"] },
  hospitality: { label: "AURA Hospitality", items: ["Shift briefing template", "Menu change announcement", "Health inspection prep comms", "Seasonal staff onboarding", "Customer complaint review"] },
  accounting: { label: "LEDGER Accounting", items: ["Tax deadline reminder for staff/clients", "Regulatory change alert", "Client communication template", "Audit preparation checklist"] },
  legal: { label: "ANCHOR Legal", items: ["Case update template", "Compliance alert template", "Client letter template", "Court date reminder"] },
  property: { label: "HAVEN Property", items: ["Tenant communication template", "Maintenance notification", "Rent review letter", "Property inspection notification"] },
  customs: { label: "NEXUS Customs", items: ["Shipment status update", "Regulatory change alert", "Broker team briefing template"] },
  marketing: { label: "PRISM Marketing", items: ["Campaign brief template", "Content approval workflow", "Brand guideline distribution", "Social media policy"] },
};

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  isPaid: boolean;
  userRole?: string;
}

const InternalComms = ({ agentId, agentName, agentColor, isPaid, userRole }: Props) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPro = userRole === "pro" || userRole === "business" || userRole === "admin";

  if (!isPro) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${agentColor}15`, border: `1px solid ${agentColor}30` }}><Lock size={28} style={{ color: agentColor }} /></div>
          <h3 className="text-lg font-bold text-foreground mb-2">Internal Comms</h3>
          <p className="text-sm text-muted-foreground mb-4">Professional internal communication tools. Pro and Business plans.</p>
          <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold" style={{ background: agentColor, color: "#0A0A14" }}>Upgrade to Pro</a>
        </div>
      </div>
    );
  }

  const agentSpecific = AGENT_SPECIFIC[agentId];

  const getFormFields = (toolId: string) => {
    switch (toolId) {
      case "announcement": return [
        { id: "type", label: "Type", placeholder: "Policy update, new hire, event, achievement, reminder, change management" },
        { id: "channel", label: "Channel", placeholder: "Email, Slack, Teams, intranet, notice board, all-staff meeting" },
        { id: "tone", label: "Tone", placeholder: "Formal, friendly, urgent" },
        { id: "details", label: "Key Details", placeholder: "What do you need to announce?", multiline: true },
      ];
      case "agenda": return [
        { id: "type", label: "Meeting Type", placeholder: "Standup, weekly, board, project review, H&S, client" },
        { id: "topics", label: "Key Topics", placeholder: "List the main topics to cover", multiline: true },
        { id: "duration", label: "Duration", placeholder: "30 min, 1 hour, etc." },
      ];
      case "policy": return [
        { id: "policy_type", label: "Policy Type", placeholder: "e.g. Leave, H&S, IT, code of conduct, dress code" },
        { id: "context", label: "Additional Context", placeholder: "Any specific requirements or context", multiline: true },
      ];
      case "training": return [
        { id: "team_size", label: "Team Size", placeholder: "Number of staff" },
        { id: "roles", label: "Roles", placeholder: "e.g. Site managers, tradies, office staff" },
        { id: "budget", label: "Annual Training Budget (NZD)", placeholder: "$5,000" },
        { id: "requirements", label: "Industry Requirements", placeholder: "Mandatory certifications, licenses", multiline: true },
      ];
      case "handbook": return [
        { id: "sections", label: "Sections Needed", placeholder: "Welcome, values, leave, H&S, code of conduct, IT policy, dress code, complaints, disciplinary" },
      ];
      case "change_mgmt": return [
        { id: "change", label: "What's Changing", placeholder: "Describe the change", multiline: true },
        { id: "affected", label: "Who's Affected", placeholder: "Teams, departments, roles" },
        { id: "timeline", label: "Timeline", placeholder: "When does this happen?" },
      ];
      case "perf_review": return [
        { id: "type", label: "Review Type", placeholder: "Annual, probation, 360, development plan" },
        { id: "role", label: "Role Being Reviewed", placeholder: "e.g. Site manager, project coordinator" },
      ];
      case "newsletter": return [
        { id: "updates", label: "Key Updates", placeholder: "What's new?", multiline: true },
        { id: "wins", label: "Wins & Achievements", placeholder: "Team achievements, project completions" },
        { id: "events", label: "Upcoming Events", placeholder: "Dates and events coming up" },
        { id: "spotlight", label: "Team Spotlight", placeholder: "Feature a team member (optional)" },
      ];
      default: return [{ id: "details", label: "Details", placeholder: "Describe what you need", multiline: true }];
    }
  };

  const generateContent = async (toolLabel: string, isCustom = false) => {
    setIsGenerating(true);
    setResult(null);
    const fields = Object.entries(formData).filter(([_, v]) => v?.trim()).map(([k, v]) => `${k}: ${v}`).join("\n");
    const prompt = `You are ${agentName}, specialist in the ${agentId} sector. Generate a professional "${toolLabel}" for internal team communication. Use NZ English. Align with NZ employment law (Employment Relations Act 2000, Holidays Act 2003, Privacy Act 2020, HSWA 2015). Be practical and ready to use.\n\nUser input:\n${fields || "[Generate a comprehensive template]"}`;

    try {
      const content = await agentChat({ agentId, message: prompt });
      setResult(content);
    } catch { setResult("Error generating content. Please try again."); }
    finally { setIsGenerating(false); }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (selectedTool) {
    const tool = UNIVERSAL_TOOLS.find(t => t.id === selectedTool);
    const isCustom = !tool;
    const label = tool?.label || selectedTool;
    const fields = tool ? getFormFields(tool.id) : [{ id: "details", label: "Details", placeholder: "Describe what you need", multiline: true }];

    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => { setSelectedTool(null); setResult(null); setFormData({}); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Back</button>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            {tool && <tool.icon size={16} style={{ color: agentColor }} />}
            {label}
          </h2>

          <div className="space-y-3">
            {fields.map(f => (
              <div key={f.id}>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">{f.label}</label>
                {"multiline" in f && f.multiline ? (
                  <textarea value={formData[f.id] || ""} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} rows={3} placeholder={f.placeholder} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <input value={formData[f.id] || ""} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                )}
              </div>
            ))}
          </div>

          <button onClick={() => generateContent(label, isCustom)} disabled={isGenerating} className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${agentColor}, ${agentColor}CC)`, color: "#0A0A14" }}>
            {isGenerating ? "Generating..." : `Generate with ${agentName}`}
          </button>

          {result && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: `${agentColor}08`, border: `1px solid ${agentColor}20` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: agentColor }}>Generated Content</span>
                <button onClick={handleCopy} className="text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ background: `${agentColor}15`, color: agentColor }}>
                  {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="prose prose-sm max-w-none [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]"><ReactMarkdown>{result}</ReactMarkdown></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2"><MessageSquare size={20} style={{ color: agentColor }} /> Internal Comms</h2>
          <p className="text-xs text-muted-foreground">Professional internal communication tools for {agentName}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {UNIVERSAL_TOOLS.map(tool => (
            <button key={tool.id} onClick={() => setSelectedTool(tool.id)} className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all hover:scale-[1.01]" style={{ background: `${agentColor}06`, border: `1px solid ${agentColor}15` }}>
              <tool.icon size={16} style={{ color: agentColor }} className="mt-0.5 shrink-0" />
              <div><div className="text-xs font-bold text-foreground">{tool.label}</div><div className="text-[9px] text-muted-foreground mt-0.5">{tool.desc}</div></div>
            </button>
          ))}
        </div>

        {agentSpecific && (
          <>
            <div className="pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: agentColor }}>{agentSpecific.label} — Specific Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {agentSpecific.items.map(item => (
                  <button key={item} onClick={() => setSelectedTool(item)} className="p-3 rounded-xl text-left text-xs font-medium text-foreground transition-all hover:scale-[1.01]" style={{ background: `${agentColor}08`, border: `1px solid ${agentColor}15` }}>
                    <Sparkles size={10} style={{ color: agentColor }} className="inline mr-1" />{item}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InternalComms;
