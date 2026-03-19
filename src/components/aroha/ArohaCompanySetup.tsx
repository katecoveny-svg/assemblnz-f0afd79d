import { useState } from "react";
import { Building2, ChevronRight, CheckCircle, AlertTriangle, Edit2 } from "lucide-react";
import { NeonBuilding2, NeonSiren, NeonClipboard, NeonWarning, NeonBulb, NeonCheckmark, NeonTarget, NeonHeart, NeonPen, NeonCalendar, NeonStar } from "@/components/NeonIcons";

const AROHA_COLOR = "#FF6F91";

type Step = 1 | 2 | 3 | 4 | 5;

interface CompanyProfile {
  name: string; industry: string; location: string; employees: string; website: string;
  employmentTypes: string[]; collectiveAgreement: boolean; trialPeriodEligible: boolean;
  hasHR: boolean; hrSoftware: string; hasHandbook: boolean; hasAgreements: boolean;
  painPoints: string[];
}

const INDUSTRIES = ["Construction", "Retail", "Hospitality", "Technology", "Healthcare", "Education", "Agriculture", "Manufacturing", "Professional Services", "Government", "Non-Profit", "Other"];
const EMPLOYEE_SIZES = ["1-5", "6-19", "20-49", "50-99", "100+"];
const EMP_TYPES = ["Permanent Full-Time", "Permanent Part-Time", "Fixed-Term", "Casual", "Contractors"];
const HR_SOFTWARE = ["Employment Hero", "MyHR", "PayHero", "BambooHR", "Xero Payroll", "MYOB", "Other", "None"];
const PAIN_POINTS = ["Recruitment", "Retention", "Compliance", "Payroll", "Leave management", "Performance management", "Conflict", "Culture", "Training"];

const COMPLIANCE_ITEMS = [
  "Employment agreements for all staff",
  "Employee handbook",
  "H&S policy",
  "Privacy policy (employee data)",
  "Anti-harassment policy",
  "Leave tracking system",
  "KiwiSaver compliance",
  "Trial period clauses correct",
  "Minimum wage compliance",
  "Pay equity assessment done",
];

export default function ArohaCompanySetup() {
  const [profile, setProfile] = useState<CompanyProfile | null>(() => {
    const saved = sessionStorage.getItem("aroha_company_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [step, setStep] = useState<Step>(1);
  const [editing, setEditing] = useState(!profile);
  const [complianceChecks, setComplianceChecks] = useState<boolean[]>(() => {
    const saved = sessionStorage.getItem("aroha_compliance");
    return saved ? JSON.parse(saved) : new Array(10).fill(false);
  });

  // Form state
  const [name, setName] = useState(profile?.name || "");
  const [industry, setIndustry] = useState(profile?.industry || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [employees, setEmployees] = useState(profile?.employees || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [empTypes, setEmpTypes] = useState<string[]>(profile?.employmentTypes || []);
  const [collective, setCollective] = useState(profile?.collectiveAgreement || false);
  const [hasHR, setHasHR] = useState(profile?.hasHR || false);
  const [hrSoftware, setHrSoftware] = useState(profile?.hrSoftware || "None");
  const [hasHandbook, setHasHandbook] = useState(profile?.hasHandbook || false);
  const [hasAgreements, setHasAgreements] = useState(profile?.hasAgreements || false);
  const [painPoints, setPainPoints] = useState<string[]>(profile?.painPoints || []);

  const trialEligible = employees === "1-5" || employees === "6-19";
  const score = complianceChecks.filter(Boolean).length;

  const toggleArr = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const saveProfile = () => {
    const p: CompanyProfile = {
      name, industry, location, employees, website, employmentTypes: empTypes,
      collectiveAgreement: collective, trialPeriodEligible: trialEligible,
      hasHR, hrSoftware, hasHandbook, hasAgreements, painPoints,
    };
    setProfile(p);
    sessionStorage.setItem("aroha_company_profile", JSON.stringify(p));
    setEditing(false);
  };

  const toggleCompliance = (i: number) => {
    const next = [...complianceChecks];
    next[i] = !next[i];
    setComplianceChecks(next);
    sessionStorage.setItem("aroha_compliance", JSON.stringify(next));
  };

  const generatePriorities = () => {
    const priorities: string[] = [];
    if (!hasAgreements) priorities.push("URGENT: You need employment agreements for all staff. This is a legal requirement. Use AROHA's Contracts tab to generate them now.");
    if (!hasHandbook) priorities.push("Priority 1: Generate an employee handbook. This is your single source of truth for policies and expectations.");
    if (empTypes.includes("Casual")) priorities.push("Review casual agreements — the Employment Leave Bill 2026 proposes 12.5% compensation for casuals (currently 8%).");
    if (!hasHR) priorities.push("You don't have a dedicated HR person — AROHA is your HR team. Start with contracts and compliance.");
    if (painPoints.includes("Compliance")) priorities.push("Run through the compliance checklist below and address any gaps.");
    if (painPoints.includes("Recruitment")) priorities.push("Use AROHA's Recruitment tab to generate compliant job ads and track your pipeline.");
    if (painPoints.includes("Retention")) priorities.push("Check the People & Culture tab for retention strategies and employee incentives.");
    if (employees === "20-49" || employees === "50-99" || employees === "100+") priorities.push("With 20+ employees, trial periods are NOT available. Ensure you use probation periods instead.");
    if (painPoints.includes("Leave management")) priorities.push("Use the Payroll tab's leave calculator to track entitlements accurately.");
    if (priorities.length < 5) priorities.push("Set up regular engagement surveys using the People & Culture tab to keep your finger on the pulse.");
    return priorities.slice(0, 5);
  };

  if (!editing && profile) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><NeonBuilding2 size={20} color="#FF6F91" /> Company Setup</h2>
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground">
            <Edit2 size={10} /> Edit Profile
          </button>
        </div>

        {/* Company Card */}
        <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: AROHA_COLOR + "20" }}>
              <Building2 size={20} style={{ color: AROHA_COLOR }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{profile.name}</h3>
              <p className="text-[10px] text-muted-foreground">{profile.industry} · {profile.location} · {profile.employees} employees</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {profile.employmentTypes.map(t => (
              <span key={t} className="text-[8px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">{t}</span>
            ))}
            {profile.trialPeriodEligible && <span className="text-[8px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>Trial period eligible</span>}
            {!profile.trialPeriodEligible && <span className="text-[8px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F59E0B20", color: "#F59E0B" }}>Probation only (20+ staff)</span>}
          </div>
        </div>

        {/* Compliance Score */}
        <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-foreground">HR Compliance Score</h3>
            <span className="text-lg font-bold" style={{ color: score >= 8 ? "#22C55E" : score >= 5 ? "#F59E0B" : AROHA_COLOR }}>{score}/10</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted mb-3">
            <div className="h-2 rounded-full transition-all" style={{ width: `${score * 10}%`, backgroundColor: score >= 8 ? "#22C55E" : score >= 5 ? "#F59E0B" : AROHA_COLOR }} />
          </div>
          <div className="space-y-1.5">
            {COMPLIANCE_ITEMS.map((item, i) => (
              <label key={item} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="checkbox" checked={complianceChecks[i]} onChange={() => toggleCompliance(i)} style={{ accentColor: AROHA_COLOR }} className="rounded" />
                <span className={`text-[10px] ${complianceChecks[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
          <h3 className="text-xs font-bold text-foreground mb-2">Your Top Priorities This Month</h3>
          <div className="space-y-2">
            {generatePriorities().map((p, i) => (
              <div key={i} className="text-[10px] text-foreground/80 p-2 rounded-lg bg-muted/50">{p}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><NeonBuilding2 size={20} color="#FF6F91" /> Company Setup</h2>
      <p className="text-[10px] text-muted-foreground">Set up your company profile so AROHA can tailor advice, auto-populate documents, and track your compliance.</p>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {([1,2,3,4,5] as Step[]).map(s => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: step >= s ? AROHA_COLOR : "hsl(var(--muted))", color: step >= s ? "#0A0A14" : "hsl(var(--muted-foreground))" }}>{s}</div>
            {s < 5 && <ChevronRight size={10} className="text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Company Basics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><label className="text-[10px] text-muted-foreground">Company Name</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Industry</label>
              <select className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">Select...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div><label className="text-[10px] text-muted-foreground">Location</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Auckland" /></div>
            <div><label className="text-[10px] text-muted-foreground">Number of Employees</label>
              <div className="flex gap-1 mt-0.5 flex-wrap">{EMPLOYEE_SIZES.map(s => <button key={s} onClick={() => setEmployees(s)} className="px-2.5 py-1.5 rounded-lg text-[9px] border" style={{ borderColor: employees === s ? AROHA_COLOR : "hsl(var(--border))", color: employees === s ? AROHA_COLOR : "hsl(var(--muted-foreground))" }}>{s}</button>)}</div>
            </div>
            <div><label className="text-[10px] text-muted-foreground">Website URL (optional)</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" /></div>
          </div>
          <button onClick={() => setStep(2)} disabled={!name || !employees} className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Next →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Employment Types</h3>
          <div className="space-y-1.5">
            {EMP_TYPES.map(t => (
              <label key={t} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer">
                <input type="checkbox" checked={empTypes.includes(t)} onChange={() => toggleArr(empTypes, t, setEmpTypes)} style={{ accentColor: AROHA_COLOR }} />
                <span className="text-[10px] text-foreground">{t}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer">
            <input type="checkbox" checked={collective} onChange={e => setCollective(e.target.checked)} style={{ accentColor: AROHA_COLOR }} />
            <span className="text-[10px] text-foreground">We have a collective agreement</span>
          </label>
          {trialEligible && <p className="text-[9px] p-2 rounded-lg" style={{ backgroundColor: "#22C55E15", color: "#22C55E" }}>✅ With fewer than 20 employees, you're eligible for 90-day trial periods.</p>}
          {!trialEligible && employees && <p className="text-[9px] p-2 rounded-lg" style={{ backgroundColor: "#F59E0B15", color: "#F59E0B" }}>⚠️ With 20+ employees, trial periods are NOT available. Use probation periods instead.</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-xs font-medium border border-border text-foreground">← Back</button>
            <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Current HR Setup</h3>
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer">
            <input type="checkbox" checked={hasHR} onChange={e => setHasHR(e.target.checked)} style={{ accentColor: AROHA_COLOR }} />
            <span className="text-[10px] text-foreground">We have a dedicated HR person</span>
          </label>
          <div><label className="text-[10px] text-muted-foreground">HR Software</label>
            <div className="flex flex-wrap gap-1 mt-0.5">{HR_SOFTWARE.map(s => <button key={s} onClick={() => setHrSoftware(s)} className="px-2.5 py-1.5 rounded-lg text-[9px] border" style={{ borderColor: hrSoftware === s ? AROHA_COLOR : "hsl(var(--border))", color: hrSoftware === s ? AROHA_COLOR : "hsl(var(--muted-foreground))" }}>{s}</button>)}</div>
          </div>
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer">
            <input type="checkbox" checked={hasHandbook} onChange={e => setHasHandbook(e.target.checked)} style={{ accentColor: AROHA_COLOR }} />
            <span className="text-[10px] text-foreground">We have an employee handbook</span>
          </label>
          {!hasHandbook && <p className="text-[9px] p-2 rounded-lg flex items-center gap-1" style={{ backgroundColor: AROHA_COLOR + "15", color: AROHA_COLOR }}><AlertTriangle size={10} /> Priority: Generate a handbook using AROHA's Onboarding tab</p>}
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer">
            <input type="checkbox" checked={hasAgreements} onChange={e => setHasAgreements(e.target.checked)} style={{ accentColor: AROHA_COLOR }} />
            <span className="text-[10px] text-foreground">We have employment agreements for all staff</span>
          </label>
          {!hasAgreements && <p className="text-[9px] p-2 rounded-lg flex items-center gap-1" style={{ backgroundColor: "#EF444415", color: "#EF4444" }}><AlertTriangle size={10} /> URGENT: All employees must have a written employment agreement (s 65, Employment Relations Act 2000)</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-xs font-medium border border-border text-foreground">← Back</button>
            <button onClick={() => setStep(4)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Next →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Your HR Pain Points</h3>
          <p className="text-[10px] text-muted-foreground">Select all that apply — this helps AROHA prioritise your action plan.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PAIN_POINTS.map(p => (
              <label key={p} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer">
                <input type="checkbox" checked={painPoints.includes(p)} onChange={() => toggleArr(painPoints, p, setPainPoints)} style={{ accentColor: AROHA_COLOR }} />
                <span className="text-[10px] text-foreground">{p}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg text-xs font-medium border border-border text-foreground">← Back</button>
            <button onClick={() => setStep(5)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Next →</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Review & Save</h3>
          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
            <p className="text-[10px] text-foreground"><strong>{name}</strong> · {industry} · {location} · {employees} employees</p>
            <p className="text-[9px] text-muted-foreground mt-1">Types: {empTypes.join(", ") || "None selected"}</p>
            <p className="text-[9px] text-muted-foreground">HR: {hasHR ? "Yes" : "No"} · Software: {hrSoftware} · Handbook: {hasHandbook ? "Yes" : "No"} · Agreements: {hasAgreements ? "Yes" : "No"}</p>
            <p className="text-[9px] text-muted-foreground">Pain points: {painPoints.join(", ") || "None"}</p>
            {trialEligible ? <p className="text-[9px] mt-1" style={{ color: "#22C55E" }}>✅ Trial period eligible</p> : <p className="text-[9px] mt-1" style={{ color: "#F59E0B" }}>⚠️ Probation only (20+ staff)</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(4)} className="px-4 py-2 rounded-lg text-xs font-medium border border-border text-foreground">← Back</button>
            <button onClick={saveProfile} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>
              <CheckCircle size={12} className="inline mr-1" /> Save Company Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
