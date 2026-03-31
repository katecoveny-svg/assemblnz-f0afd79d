import { useState } from "react";
import { Copy, Briefcase, Users, AlertTriangle } from "lucide-react";
import { NeonTarget } from "@/components/NeonIcons";
import { AgentFunnelChart, AgentPieChart } from "@/components/shared/AgentCharts";

const AROHA_COLOR = "#FF6F91";
const PLATFORMS = ["SEEK NZ", "TradeMe Jobs", "LinkedIn", "Company Website", "Internal Posting"];
const STAGES = ["Applied", "Screening", "First Interview", "Second Interview", "Reference Check", "Offer Made", "Accepted", "Onboarding"];

interface Candidate {
  id: string; name: string; role: string; email: string;
  stage: string; applied: string; notes: string; source: string;
}

const DEMO_CANDIDATES: Candidate[] = [
  { id: "1", name: "Emma Thompson", role: "Marketing Manager", email: "emma@email.com", stage: "Second Interview", applied: "2026-03-10", notes: "Strong portfolio, NZ experience", source: "SEEK" },
  { id: "2", name: "Rawiri Manu", role: "Marketing Manager", email: "rawiri@email.com", stage: "First Interview", applied: "2026-03-12", notes: "Internal candidate, knows the business", source: "Internal" },
  { id: "3", name: "Priya Sharma", role: "Marketing Manager", email: "priya@email.com", stage: "Applied", applied: "2026-03-15", notes: "International experience, NZ PR", source: "LinkedIn" },
  { id: "4", name: "Jake Wilson", role: "Sales Executive", email: "jake@email.com", stage: "Reference Check", applied: "2026-03-05", notes: "Two strong references received", source: "TradeMe" },
  { id: "5", name: "Aroha Patel", role: "Sales Executive", email: "aroha@email.com", stage: "Offer Made", applied: "2026-03-01", notes: "Accepted verbally, awaiting written", source: "SEEK" },
];

export default function ArohaRecruitment() {
  const [tab, setTab] = useState<"ads" | "pipeline">("ads");
  const [candidates, setCandidates] = useState<Candidate[]>(DEMO_CANDIDATES);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Job ad form
  const [jobTitle, setJobTitle] = useState(""); const [dept, setDept] = useState("");
  const [responsibilities, setResponsibilities] = useState(""); const [requirements, setRequirements] = useState("");
  const [salaryRange, setSalaryRange] = useState(""); const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [platform, setPlatform] = useState("SEEK NZ");
  const [generatedAd, setGeneratedAd] = useState<string | null>(null);
  const [copied, setCopiedState] = useState(false);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopiedState(true); setTimeout(() => setCopiedState(false), 2000); };

  const moveStage = (id: string, newStage: string) => setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));

  const generateAd = () => {
    const title = jobTitle || "[Job Title]";
    const loc = location || "[Location]";
    const sal = salaryRange || "Competitive";
    const resp = responsibilities || "Key responsibilities to be confirmed";
    const req = requirements || "Requirements to be confirmed";

    const ads: Record<string, string> = {
      "SEEK NZ": `${title} — ${loc}\n${jobType} | ${sal}\n\nAbout the Role\nWe're looking for an exceptional ${title} to join our team in ${loc}. This is an exciting opportunity to make a real impact in a growing NZ business.\n\nWhat You'll Do\n${resp.split(",").map(r => `• ${r.trim()}`).join("\n")}\n\nWhat We're Looking For\n${req.split(",").map(r => `• ${r.trim()}`).join("\n")}\n\nWhat We Offer\n• Competitive salary ${sal !== "Competitive" ? `(${sal})` : ""}\n• Supportive team environment\n• Professional development opportunities\n• Flexible working arrangements\n\nAbout Us\n[Company description — 2-3 sentences about your business, culture, and values]\n\nHow to Apply\nApply via SEEK with your CV and a brief cover letter telling us why you're the right fit.\n\nApplications close: [Date]`,

      "TradeMe Jobs": `${title}\n${loc} | ${jobType} | ${sal}\n\n${resp.split(",").map(r => `- ${r.trim()}`).join("\n")}\n\nYou'll need:\n${req.split(",").map(r => `- ${r.trim()}`).join("\n")}\n\nApply now with your CV. We'd love to hear from you!`,

      "LinkedIn": ` We're Hiring: ${title}\n\nLocation: ${loc}\nType: ${jobType}\n${sal !== "Competitive" ? `Salary: ${sal}\n` : ""}\nWe're growing and looking for a talented ${title} to join our team.\n\nWhat makes this role special:\n${resp.split(",").map(r => ` ${r.trim()}`).join("\n")}\n\nIdeal candidate:\n${req.split(",").map(r => `• ${r.trim()}`).join("\n")}\n\nInterested? Apply via the link below or DM me directly.\n\n#Hiring #NZJobs #${title.replace(/\s/g, "")} #${loc.replace(/\s/g, "")}`,

      "Company Website": `<h1>${title}</h1>\n<p><strong>Location:</strong> ${loc} | <strong>Type:</strong> ${jobType}${sal !== "Competitive" ? ` | <strong>Salary:</strong> ${sal}` : ""}</p>\n\n<h2>About the Role</h2>\n<p>We are seeking a ${title} to join our ${dept || "team"} in ${loc}. This ${jobType.toLowerCase()} role offers the opportunity to [key selling point].</p>\n\n<h2>Responsibilities</h2>\n<ul>\n${resp.split(",").map(r => `<li>${r.trim()}</li>`).join("\n")}\n</ul>\n\n<h2>Requirements</h2>\n<ul>\n${req.split(",").map(r => `<li>${r.trim()}</li>`).join("\n")}\n</ul>\n\n<!-- Schema.org JobPosting markup recommended for SEO -->\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org/",\n  "@type": "JobPosting",\n  "title": "${title}",\n  "jobLocation": { "@type": "Place", "address": "${loc}" },\n  "employmentType": "${jobType.toUpperCase().replace("-","_")}"\n}\n</script>`,

      "Internal Posting": `INTERNAL VACANCY\n\n${title} — ${dept || "[Department]"}\n${loc} | ${jobType}\n\nWe're opening this role to internal candidates first. If you're interested in this opportunity, please speak with your manager and submit your expression of interest by [Date].\n\nRole overview:\n${resp.split(",").map(r => `• ${r.trim()}`).join("\n")}\n\nWhat we're looking for:\n${req.split(",").map(r => `• ${r.trim()}`).join("\n")}\n\nPlease submit: Brief expression of interest + updated CV to [HR email]`,
    };
    setGeneratedAd(ads[platform] || "");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><NeonTarget size={20} color="#FF6F91" /> Recruitment</h2>
      <div className="flex gap-2">
        <button onClick={() => setTab("ads")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ backgroundColor: tab === "ads" ? AROHA_COLOR + "20" : "transparent", color: tab === "ads" ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === "ads" ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
          <Briefcase size={10} /> Job Ads
        </button>
        <button onClick={() => setTab("pipeline")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ backgroundColor: tab === "pipeline" ? AROHA_COLOR + "20" : "transparent", color: tab === "pipeline" ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === "pipeline" ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
          <Users size={10} /> Pipeline
        </button>
      </div>

      {tab === "ads" && !generatedAd && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Job Title</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Marketing Manager" /></div>
            <div><label className="text-[10px] text-muted-foreground">Department</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={dept} onChange={e => setDept(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Location</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Auckland CBD" /></div>
            <div><label className="text-[10px] text-muted-foreground">Salary Range</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. $80,000-$95,000" /></div>
          </div>
          <div><label className="text-[10px] text-muted-foreground">Type</label>
            <div className="flex gap-1 mt-0.5">{["Full-time","Part-time","Contract","Casual"].map(t => <button key={t} onClick={() => setJobType(t)} className="flex-1 py-1.5 rounded-lg text-[9px] border" style={{ borderColor: jobType === t ? AROHA_COLOR : "hsl(var(--border))", color: jobType === t ? AROHA_COLOR : "hsl(var(--muted-foreground))" }}>{t}</button>)}</div>
          </div>
          <div><label className="text-[10px] text-muted-foreground">Key Responsibilities (comma separated)</label><textarea className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground h-16" value={responsibilities} onChange={e => setResponsibilities(e.target.value)} /></div>
          <div><label className="text-[10px] text-muted-foreground">Requirements (comma separated)</label><textarea className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground h-16" value={requirements} onChange={e => setRequirements(e.target.value)} /></div>
          <div className="p-3 rounded-lg bg-muted text-[9px] text-muted-foreground flex items-start gap-1"><AlertTriangle size={10} style={{ color: AROHA_COLOR }} className="shrink-0 mt-0.5" /> Job ads must comply with the Human Rights Act 1993 — do not specify age, gender, ethnicity, marital status, or disability unless it is a genuine occupational qualification.</div>
          <button onClick={generateAd} disabled={!jobTitle} className="px-4 py-2.5 rounded-lg text-xs font-bold disabled:opacity-40" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Generate Job Ads</button>
        </div>
      )}

      {tab === "ads" && generatedAd && (
        <div className="space-y-3">
          <button onClick={() => setGeneratedAd(null)} className="text-xs text-muted-foreground hover:text-foreground">← Edit details</button>
          <div className="flex gap-1 flex-wrap">
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => { setPlatform(p); generateAd(); }} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ backgroundColor: platform === p ? AROHA_COLOR + "20" : "transparent", color: platform === p ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${platform === p ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
                {p}
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">{generatedAd}</pre>
          </div>
          <button onClick={() => copy(generatedAd)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>
            <Copy size={12} /> {copied ? "Copied!" : "Copy Ad"}
          </button>
        </div>
      )}

      {tab === "pipeline" && (
        <>
          {/* Recruitment Funnel & Source Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AgentFunnelChart
              title="Recruitment Funnel"
              color={AROHA_COLOR}
              stages={STAGES.map(s => ({ name: s, value: candidates.filter(c => c.stage === s).length }))}
            />
            <AgentPieChart
              title="Candidates by Source"
              data={Object.entries(candidates.reduce<Record<string, number>>((acc, c) => { acc[c.source] = (acc[c.source] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
              height={180}
              colors={["#FF6F91", "#E040FB", "#5AADA0", "#3A6A9C", "#FFB300"]}
            />
          </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {STAGES.map(stage => {
              const stageCandidates = candidates.filter(c => c.stage === stage);
              return (
                <div key={stage} className="w-48 flex flex-col rounded-xl border border-border bg-card/50 shrink-0"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (draggedId) { moveStage(draggedId, stage); setDraggedId(null); } }}>
                  <div className="p-2 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] font-bold text-foreground">{stage}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{stageCandidates.length}</span>
                  </div>
                  <div className="flex-1 p-1.5 space-y-1.5 max-h-96 overflow-y-auto">
                    {stageCandidates.map(c => (
                      <div key={c.id} draggable onDragStart={() => setDraggedId(c.id)}
                        className="p-2 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing hover:border-foreground/10">
                        <p className="text-[11px] font-bold text-foreground">{c.name}</p>
                        <p className="text-[9px] text-muted-foreground">{c.role}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{c.source}</span>
                          <span className="text-[8px] text-muted-foreground">{c.applied}</span>
                        </div>
                        {c.notes && <p className="text-[8px] mt-1" style={{ color: AROHA_COLOR }}>{c.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
