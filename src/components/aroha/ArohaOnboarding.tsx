import { useState } from "react";
import { Copy, Download, CheckSquare, BookOpen, GraduationCap } from "lucide-react";
import { NeonClipboard } from "@/components/NeonIcons";

const AROHA_COLOR = "#FF6F91";

const HANDBOOK_SECTIONS = [
  "Welcome and company values", "Employment type and terms", "Hours of work and timekeeping",
  "Remuneration and payroll", "Leave entitlements", "KiwiSaver", "Health and safety",
  "Equal employment opportunities", "Harassment and bullying policy", "Drug and alcohol policy",
  "Social media policy", "Dress code", "Use of company property and IT", "Confidentiality",
  "Conflicts of interest", "Performance management", "Disciplinary process",
  "Complaints and grievance process", "Flexible working", "Redundancy",
  "Termination and resignation", "Privacy (employee records)", "Emergency procedures",
];

const TRAINING_ITEMS = [
  { name: "H&S Induction", mandatory: true, ref: "HSWA 2015" },
  { name: "First Aid Training", mandatory: false, ref: "Recommended" },
  { name: "Fire Warden Training", mandatory: false, ref: "HSWA Regs" },
  { name: "Privacy Act Obligations", mandatory: true, ref: "Privacy Act 2020" },
  { name: "Anti-Harassment & Bullying", mandatory: true, ref: "ERA 2000" },
  { name: "Drug & Alcohol Awareness", mandatory: false, ref: "Company policy" },
  { name: "Manager: Performance Reviews", mandatory: false, ref: "Best practice" },
  { name: "Manager: Disciplinary Process", mandatory: false, ref: "ERA 2000" },
];

export default function ArohaOnboarding() {
  const [tab, setTab] = useState<"onboarding" | "handbook" | "training">("onboarding");
  const [empName, setEmpName] = useState(""); const [empRole, setEmpRole] = useState("");
  const [empStart, setEmpStart] = useState(""); const [empDept, setEmpDept] = useState("");
  const [empManager, setEmpManager] = useState(""); const [generated, setGenerated] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [activeHandbook, setActiveHandbook] = useState<string[]>(HANDBOOK_SECTIONS);
  const [trainingChecks, setTrainingChecks] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggle = (key: string) => setChecks(p => ({ ...p, [key]: !p[key] }));
  const toggleTraining = (key: string) => setTrainingChecks(p => ({ ...p, [key]: !p[key] }));

  const onboardingChecklist = [
    { phase: "Pre-Start (Before Day 1)", items: [
      "Employment agreement signed and returned", "Tax code declaration (IR330) completed",
      "KiwiSaver selection form", "Bank account details collected",
      "Proof of right to work in NZ (if applicable)", "Workstation / equipment prepared",
      "IT accounts created (email, systems)", "Welcome email sent with first day details",
      "Buddy/mentor assigned", "H&S induction materials prepared",
    ]},
    { phase: "Day 1", items: [
      "Welcome and introductions", "Office/site tour",
      "H&S induction (emergency exits, first aid, fire warden, hazard register)",
      "IT setup and systems login", "Company handbook provided",
      "KiwiSaver explained", "Employee Assistance Programme (EAP) introduced",
      "First week schedule provided",
    ]},
    { phase: "Week 1", items: [
      "Role-specific training schedule", "Meet key stakeholders",
      "Systems training", "First check-in with manager (end of week 1)",
    ]},
    { phase: "Month 1", items: [
      "Complete all mandatory compliance training", "30-day check-in meeting",
      "Feedback gathered from new employee", "Probation/trial period goals set",
    ]},
    { phase: "Month 3 (Probation/Trial Review)", items: [
      "90-day review meeting", "Trial period confirmation (if applicable) — MUST be done before day 90",
      "Performance goals for next quarter set",
    ]},
  ];

  const tabs = [
    { id: "onboarding" as const, label: "Onboarding Flow", icon: <CheckSquare size={10} /> },
    { id: "handbook" as const, label: "Handbook Generator", icon: <BookOpen size={10} /> },
    { id: "training" as const, label: "Training Tracker", icon: <GraduationCap size={10} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">📋 Onboarding & Training</h2>
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: tab === t.id ? AROHA_COLOR + "20" : "transparent", color: tab === t.id ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "onboarding" && !generated && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Enter new employee details to generate a complete onboarding programme.</p>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Employee Name</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={empName} onChange={e => setEmpName(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Role</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={empRole} onChange={e => setEmpRole(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Start Date</label><input type="date" className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={empStart} onChange={e => setEmpStart(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Department</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={empDept} onChange={e => setEmpDept(e.target.value)} /></div>
            <div className="col-span-2"><label className="text-[10px] text-muted-foreground">Manager Name</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={empManager} onChange={e => setEmpManager(e.target.value)} /></div>
          </div>
          <button onClick={() => setGenerated(true)} disabled={!empName} className="px-4 py-2.5 rounded-lg text-xs font-bold disabled:opacity-40" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>
            Generate Onboarding Plan
          </button>
        </div>
      )}

      {tab === "onboarding" && generated && (
        <div className="space-y-4">
          <button onClick={() => setGenerated(false)} className="text-xs text-muted-foreground hover:text-foreground">← Edit details</button>
          <div className="p-3 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
            <h3 className="text-sm font-bold text-foreground">Onboarding: {empName}</h3>
            <p className="text-[10px] text-muted-foreground">{empRole} · {empDept} · Starting {empStart} · Manager: {empManager}</p>
          </div>
          {onboardingChecklist.map(phase => (
            <div key={phase.phase} className="p-3 rounded-xl border border-border bg-card">
              <h4 className="text-xs font-bold text-foreground mb-2">{phase.phase}</h4>
              {phase.items.map(item => {
                const key = `${phase.phase}-${item}`;
                return (
                  <label key={key} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={!!checks[key]} onChange={() => toggle(key)} style={{ accentColor: AROHA_COLOR }} className="rounded" />
                    <span className={`text-[10px] ${checks[key] ? "line-through text-muted-foreground" : "text-foreground/80"}`}>{item}</span>
                  </label>
                );
              })}
              <p className="text-[8px] text-muted-foreground mt-1">{phase.items.filter(i => checks[`${phase.phase}-${i}`]).length}/{phase.items.length} complete</p>
            </div>
          ))}
          <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold border border-border text-foreground"><Download size={12} /> Export as PDF</button>
        </div>
      )}

      {tab === "handbook" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Toggle sections on/off to build a customised employee handbook. All sections reference NZ legislation.</p>
          <div className="space-y-1">
            {HANDBOOK_SECTIONS.map(s => (
              <label key={s} className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-border bg-card cursor-pointer">
                <input type="checkbox" checked={activeHandbook.includes(s)} onChange={e => setActiveHandbook(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))} style={{ accentColor: AROHA_COLOR }} className="rounded" />
                <span className="text-[10px] text-foreground">{s}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>
              <BookOpen size={12} /> Generate Handbook ({activeHandbook.length} sections)
            </button>
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold border border-border text-foreground"><Download size={12} /> Download</button>
          </div>
        </div>
      )}

      {tab === "training" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Track mandatory and recommended training per employee.</p>
          <div className="space-y-1.5">
            {TRAINING_ITEMS.map(t => (
              <label key={t.name} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card cursor-pointer">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!trainingChecks[t.name]} onChange={() => toggleTraining(t.name)} style={{ accentColor: AROHA_COLOR }} className="rounded" />
                  <div>
                    <span className="text-[10px] text-foreground">{t.name}</span>
                    {t.mandatory && <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: AROHA_COLOR + "20", color: AROHA_COLOR }}>Mandatory</span>}
                  </div>
                </div>
                <span className="text-[8px] text-muted-foreground">{t.ref}</span>
              </label>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-muted text-[10px] text-muted-foreground">
            Completed: {Object.values(trainingChecks).filter(Boolean).length}/{TRAINING_ITEMS.length} · Mandatory remaining: {TRAINING_ITEMS.filter(t => t.mandatory && !trainingChecks[t.name]).length}
          </div>
        </div>
      )}
    </div>
  );
}
