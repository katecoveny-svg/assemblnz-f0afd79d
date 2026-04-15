import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { FileText, Globe, ClipboardList, Building2, ChevronRight, Copy, Check, Sparkles, Upload, Edit3, Download, Lock, ArrowLeft } from "lucide-react";
import { ICON_MAP, NeonClipboard, NeonDocument, NeonWarning, NeonSafetyVest, NeonCheckmark, NeonSeedling, NeonHandshake, NeonCoin, NeonPaperclip, NeonTrophy, NeonStar, NeonWrench, NeonShield, NeonCalendar } from "@/components/NeonIcons";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";

const APEX_COLOR = "#5AADA0";

const TENDER_SECTIONS = [
  { id: "executive_summary", label: "Executive Summary", iconKey: "clipboard" },
  { id: "capability_statement", label: "Company Capability Statement", iconKey: "building" },
  { id: "methodology", label: "Methodology & Approach", iconKey: "wrench" },
  { id: "project_team", label: "Project Team & Key Personnel", iconKey: "team" },
  { id: "experience", label: "Relevant Experience & Case Studies", iconKey: "document" },
  { id: "programme", label: "Programme / Timeline", iconKey: "calendar" },
  { id: "risk_management", label: "Risk Management Approach", iconKey: "warning" },
  { id: "health_safety", label: "Health & Safety Management Plan", iconKey: "safetyVest" },
  { id: "quality_assurance", label: "Quality Assurance Plan", iconKey: "checkmark" },
  { id: "sustainability", label: "Sustainability & Environmental Management", iconKey: "seedling" },
  { id: "maori_engagement", label: "Māori Engagement & Social Procurement", iconKey: "handshake" },
  { id: "pricing_schedule", label: "Pricing Schedule Structure", iconKey: "coin" },
  { id: "appendices", label: "Appendices Checklist", iconKey: "paperclip" },
];

const PRIVATE_SECTIONS = [
  { id: "value_proposition", label: "Value Proposition", iconKey: "sparkle" },
  { id: "competitive_diff", label: "Competitive Differentiators", iconKey: "trophy" },
  { id: "client_testimonials", label: "Client Testimonials", iconKey: "star" },
  { id: "warranty_defects", label: "Warranty & Defects Period", iconKey: "wrench" },
  { id: "insurance_bonding", label: "Insurance & Bonding Details", iconKey: "shield" },
  ...TENDER_SECTIONS.slice(0, 10),
];

const PQQ_FIELDS = [
  { id: "company_name", label: "Company Name", type: "text" },
  { id: "nzbn", label: "NZBN", type: "text" },
  { id: "years_trading", label: "Years Trading", type: "text" },
  { id: "annual_turnover", label: "Annual Turnover (NZD)", type: "text" },
  { id: "employee_count", label: "Number of Employees", type: "text" },
  { id: "hs_record", label: "H&S Record (LTI rate, notifiable events)", type: "textarea" },
  { id: "insurance_details", label: "Insurance Details (PI, PL, Contract Works)", type: "textarea" },
  { id: "quality_systems", label: "Quality Management Systems (ISO 9001 etc.)", type: "textarea" },
  { id: "environmental_policy", label: "Environmental Policy Summary", type: "textarea" },
  { id: "relevant_experience", label: "3 Key Relevant Projects", type: "textarea" },
  { id: "site_safe", label: "Site Safe / Tōtika Status", type: "text" },
  { id: "financial_refs", label: "Financial Referees (bank, accountant)", type: "textarea" },
];

type SubView = "menu" | "gets" | "private" | "scraper" | "pqq";

interface Props {
  isPaid: boolean;
  userRole?: string;
  onSendMessage: (msg: string) => void;
}

const ApexTenderWriter = ({ isPaid, userRole, onSendMessage }: Props) => {
  const [subView, setSubView] = useState<SubView>("menu");
  const [tenderDoc, setTenderDoc] = useState("");
  const [framework, setFramework] = useState<string | null>(null);
  const [sectionResults, setSectionResults] = useState<Record<string, string>>({});
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [scraperUrl, setScraperUrl] = useState("");
  const [companyProfile, setCompanyProfile] = useState<string | null>(
    () => localStorage.getItem("apex_company_profile")
  );
  const [isScanning, setIsScanning] = useState(false);
  const [pqqData, setPqqData] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("apex_pqq_data") || "{}"); } catch { return {}; }
  });
  const [pqqResult, setPqqResult] = useState<string | null>(null);
  const [isGeneratingPqq, setIsGeneratingPqq] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const isPro = userRole === "pro" || userRole === "business" || userRole === "admin";

  if (!isPro) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${APEX_COLOR}15`, border: `1px solid ${APEX_COLOR}30` }}>
            <Lock size={28} style={{ color: APEX_COLOR }} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Tender Writer</h3>
          <p className="text-sm text-muted-foreground mb-4">Professional tender & proposal engine. Available on Pro and Business plans.</p>
          <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all" style={{ background: APEX_COLOR, color: "#0A0A14" }}>Upgrade to Pro</a>
        </div>
      </div>
    );
  }

  const generateSection = async (sectionId: string, sectionLabel: string, isPrivate = false) => {
    setGeneratingSection(sectionId);
    const profileContext = companyProfile ? `\n\nCOMPANY PROFILE DATA:\n${companyProfile}` : "";
    const prompt = `You are APEX, NZ construction tender writing specialist. Generate the "${sectionLabel}" section for a ${isPrivate ? "private sector proposal" : "GETS government tender response"}.${profileContext}

TENDER/RFP CONTEXT:
${tenderDoc || "[No specific tender document provided — generate a strong template]"}

Write in professional, confident, third-person NZ English. Reference NZ Standards (NZS 3910, NZS 3916, NZS 4223) where relevant. Use placeholders like [YOUR COMPANY NAME], [PROJECT VALUE] for company-specific data. Position the company as a premium NZ construction operator.${isPrivate ? " Tone should be premium, confident, and outcomes-focused." : ""}

Generate comprehensive, detailed content for this section. Include specific frameworks, methodologies, and NZ regulatory references.`;

    try {
      const content = await agentChat({ agentId: "construction", message: prompt, packId: "waihanga" });
      setSectionResults(prev => ({ ...prev, [sectionId]: content }));
    } catch (err) {
      console.error("Section generation error:", err);
      setSectionResults(prev => ({ ...prev, [sectionId]: "Error generating section. Please try again." }));
    } finally {
      setGeneratingSection(null);
    }
  };

  const analyseFramework = async () => {
    if (!tenderDoc.trim()) return;
    setIsAnalysing(true);
    const prompt = `You are APEX, NZ construction tender specialist. Analyse this tender document/RFP and produce a STRUCTURED RESPONSE FRAMEWORK. List every section needed with brief notes on what the evaluator is looking for. Identify key evaluation criteria, mandatory requirements, and any compliance traps.\n\nTENDER DOCUMENT:\n${tenderDoc}`;
    try {
      const content = await agentChat({ agentId: "construction", message: prompt, packId: "waihanga" });
      setFramework(content);
    } catch { setFramework("Error analysing tender. Please try again."); }
    finally { setIsAnalysing(false); }
  };

  const scanWebsite = async () => {
    if (!scraperUrl.trim()) return;
    setIsScanning(true);
    const prompt = `You are APEX. The user wants to build a Company Profile from their website. Analyse this website URL and extract: company name, services offered, project portfolio/case studies, team members, certifications & awards, locations, years in business, and any notable achievements. Present as a structured company profile that can be used to auto-populate tenders and proposals.\n\nWebsite URL: ${scraperUrl}\n\nNote: Extract what you can infer from a typical NZ construction company website. If you cannot access the URL, generate a template profile structure the user can fill in.`;
    try {
      const content = await agentChat({ agentId: "construction", message: prompt, packId: "waihanga" });
      setCompanyProfile(content);
      localStorage.setItem("apex_company_profile", content);
    } catch { setCompanyProfile("Error scanning website. Please try again."); }
    finally { setIsScanning(false); }
  };

  const generatePQQ = async () => {
    setIsGeneratingPqq(true);
    localStorage.setItem("apex_pqq_data", JSON.stringify(pqqData));
    const profileContext = companyProfile ? `\nCOMPANY PROFILE:\n${companyProfile}` : "";
    const fields = Object.entries(pqqData).filter(([_, v]) => v?.trim()).map(([k, v]) => `${k}: ${v}`).join("\n");
    const prompt = `You are APEX, NZ construction prequalification specialist. Generate comprehensive PQQ (Prequalification Questionnaire) responses using this data:${profileContext}\n\nUSER DATA:\n${fields || "[No data provided — generate template responses]"}\n\nGenerate professional responses for each standard PQQ category: H&S record, financial stability, environmental policy, quality systems, insurance details, relevant experience. Write in confident third-person NZ English. Reference Tōtika, Site Safe, ISO standards, WorkSafe. Use NZD.`;
    try {
      const content = await agentChat({ agentId: "construction", message: prompt, packId: "waihanga" });
      setPqqResult(content);
    } catch { setPqqResult("Error generating PQQ responses. Please try again."); }
    finally { setIsGeneratingPqq(false); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = subView === "private" ? PRIVATE_SECTIONS : TENDER_SECTIONS;

  if (subView === "menu") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
              <FileText size={20} style={{ color: APEX_COLOR }} /> Tender Writer
            </h2>
            <p className="text-xs text-muted-foreground">Professional tender & proposal engine powered by APEX</p>
          </div>

          {[
            { id: "gets" as SubView, icon: Building2, title: "GETS Government Tender", desc: "Structured response for government RFPs via GETS portal", badge: "NZS 3910" },
            { id: "private" as SubView, icon: FileText, title: "Private Sector Proposal", desc: "Premium proposals for private clients — outcomes-focused", badge: "Premium" },
            { id: "scraper" as SubView, icon: Globe, title: "Website Scraper — Company Profile", desc: "Extract your company data to auto-populate all documents", badge: companyProfile ? " Profile saved" : "Setup" },
            { id: "pqq" as SubView, icon: ClipboardList, title: "Prequalification Questionnaire", desc: "Generate PQQ responses — fill once, reuse everywhere", badge: "PQQ" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSubView(item.id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
              style={{ background: `linear-gradient(135deg, ${APEX_COLOR}08, ${APEX_COLOR}04)`, border: `1px solid ${APEX_COLOR}20` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${APEX_COLOR}15` }}>
                <item.icon size={22} style={{ color: APEX_COLOR }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{item.title}</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${APEX_COLOR}20`, color: APEX_COLOR }}>{item.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Website Scraper view
  if (subView === "scraper") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe size={20} style={{ color: APEX_COLOR }} /> Company Profile Builder
          </h2>
          <p className="text-xs text-muted-foreground">Enter your company website — APEX will extract key data for auto-populating tenders and proposals.</p>

          <div className="flex gap-2">
            <input
              value={scraperUrl}
              onChange={(e) => setScraperUrl(e.target.value)}
              placeholder="https://yourcompany.co.nz"
              className="flex-1 bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={scanWebsite}
              disabled={!scraperUrl.trim() || isScanning}
              className="px-4 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: APEX_COLOR, color: "#0A0A14" }}
            >
              {isScanning ? "Scanning..." : "Scan"}
            </button>
          </div>

          {companyProfile && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: APEX_COLOR }}>Company Profile</span>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(companyProfile, "profile")} className="text-[10px] px-2 py-1 rounded-md" style={{ background: `${APEX_COLOR}15`, color: APEX_COLOR }}>
                    {copied === "profile" ? <Check size={10} /> : <Copy size={10} />} {copied === "profile" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-foreground/80">
                <ReactMarkdown>{companyProfile}</ReactMarkdown>
              </div>
              <p className="text-[9px] text-muted-foreground">This profile is saved and will auto-populate your tenders and proposals.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PQQ view
  if (subView === "pqq") {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => setSubView("menu")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardList size={20} style={{ color: APEX_COLOR }} /> Prequalification Questionnaire
          </h2>
          <p className="text-xs text-muted-foreground">Fill in your details once — APEX saves and reuses them across all prequalifications.</p>

          <div className="space-y-3">
            {PQQ_FIELDS.map((field) => (
              <div key={field.id}>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    value={pqqData[field.id] || ""}
                    onChange={(e) => setPqqData(prev => ({ ...prev, [field.id]: e.target.value }))}
                    rows={3}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                ) : (
                  <input
                    value={pqqData[field.id] || ""}
                    onChange={(e) => setPqqData(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={generatePQQ}
            disabled={isGeneratingPqq}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${APEX_COLOR}, ${APEX_COLOR}CC)`, color: "#0A0A14" }}
          >
            {isGeneratingPqq ? "Generating PQQ Responses..." : "Generate PQQ Responses"}
          </button>

          {pqqResult && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: APEX_COLOR }}>PQQ Responses</span>
                <button onClick={() => handleCopy(pqqResult, "pqq")} className="text-[10px] px-2 py-1 rounded-md flex items-center gap-1" style={{ background: `${APEX_COLOR}15`, color: APEX_COLOR }}>
                  {copied === "pqq" ? <Check size={10} /> : <Copy size={10} />} {copied === "pqq" ? "Copied" : "Copy all"}
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{pqqResult}</ReactMarkdown></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GETS / Private Sector tender views
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => { setSubView("menu"); setFramework(null); setSectionResults({}); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText size={20} style={{ color: APEX_COLOR }} />
          {subView === "gets" ? "GETS Government Tender" : "Private Sector Proposal"}
        </h2>

        {/* Tender doc input */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Paste tender document / RFP (or describe the project)
          </label>
          <textarea
            value={tenderDoc}
            onChange={(e) => setTenderDoc(e.target.value)}
            rows={6}
            placeholder="Paste the tender document, RFP requirements, or describe the project scope..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <button
            onClick={analyseFramework}
            disabled={!tenderDoc.trim() || isAnalysing}
            className="mt-2 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: `${APEX_COLOR}20`, color: APEX_COLOR, border: `1px solid ${APEX_COLOR}30` }}
          >
            {isAnalysing ? "Analysing..." : "Analyse & Generate Framework"}
          </button>
        </div>

        {framework && (
          <div className="rounded-xl p-4" style={{ background: `${APEX_COLOR}08`, border: `1px solid ${APEX_COLOR}20` }}>
            <span className="text-xs font-bold" style={{ color: APEX_COLOR }}>Response Framework</span>
            <div className="prose prose-invert prose-sm max-w-none mt-2"><ReactMarkdown>{framework}</ReactMarkdown></div>
          </div>
        )}

        {/* Section generators */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Generate Sections</label>
          <div className="space-y-2">
            {sections.map((s) => (
              <div key={s.id} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${APEX_COLOR}15` }}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1.5">{(() => { const Icon = ICON_MAP[s.iconKey]; return Icon ? <Icon size={14} color={APEX_COLOR} /> : null; })()} {s.label}</span>
                  <button
                    onClick={() => generateSection(s.id, s.label, subView === "private")}
                    disabled={generatingSection === s.id}
                    className="px-3 py-1 rounded-md text-[10px] font-bold transition-all disabled:opacity-40"
                    style={{ background: APEX_COLOR, color: "#0A0A14" }}
                  >
                    {generatingSection === s.id ? "Generating..." : sectionResults[s.id] ? "Regenerate" : "Generate"}
                  </button>
                </div>
                {sectionResults[s.id] && (
                  <div className="px-3 pb-3 border-t" style={{ borderColor: `${APEX_COLOR}10` }}>
                    <div className="flex justify-end mt-2 mb-1">
                      <button onClick={() => handleCopy(sectionResults[s.id], s.id)} className="text-[9px] px-2 py-0.5 rounded flex items-center gap-1" style={{ color: APEX_COLOR }}>
                        {copied === s.id ? <Check size={8} /> : <Copy size={8} />} {copied === s.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="prose prose-invert prose-xs max-w-none text-foreground/80"><ReactMarkdown>{sectionResults[s.id]}</ReactMarkdown></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApexTenderWriter;
