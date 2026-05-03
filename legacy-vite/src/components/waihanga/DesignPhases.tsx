import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, AlertTriangle } from "lucide-react";

const PHASES = [
  { id: 0, name: "Concept Design", date: "Jan 2026", pct: 100, status: "completed" as const },
  { id: 1, name: "Developed Design", date: "Mar 2026", pct: 100, status: "completed" as const },
  { id: 2, name: "Detailed Design", date: "Current", pct: 62, status: "current" as const },
  { id: 3, name: "Consent Docs", date: "Jul 2026", pct: 0, status: "pending" as const },
  { id: 4, name: "Construction Docs", date: "Sep 2026", pct: 0, status: "pending" as const },
];

const TASKS: Record<number, { label: string; status: "done"|"progress"|"pending"; pct?: number }[]> = {
  2: [
    { label: "Structural system design", status: "done" },
    { label: "Mechanical services layout", status: "done" },
    { label: "Electrical services single-line diagram", status: "done" },
    { label: "Hydraulic services design", status: "progress", pct: 70 },
    { label: "Fire engineering report", status: "progress", pct: 50 },
    { label: "Facade engineering specs", status: "pending" },
    { label: "Acoustic design STC/IIC ratings", status: "pending" },
  ],
};

const DELIVERABLES = [
  { name: "Architectural drawings set 1:50", status: "Uploaded" },
  { name: "Structural calculations NZS 3101", status: "Uploaded" },
  { name: "BIM model LOD 300", status: "In Progress" },
  { name: "Specifications NZS 3910 format", status: "Pending" },
  { name: "Cost estimate QS report", status: "In Progress" },
  { name: "Energy model H1/AS1 compliance", status: "Pending" },
];

const DEPS = [
  { text: "Geotechnical report must be finalised before foundation sign-off", color: "hsl(0 60% 55%)" },
  { text: "Fire report required before consent phase", color: "hsl(30 80% 55%)" },
  { text: "BIM coordination clash detection 18 Apr", color: "hsl(164 37% 45%)" },
  { text: "Peer review with Beca 25 Apr", color: "hsl(164 37% 45%)" },
];

export default function DesignPhases() {
  const [active, setActive] = useState(2);
  const phase = PHASES[active];
  const tasks = TASKS[active] || [];

  return (
    <div className="space-y-6">
      {/* Phase bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-1">
            {PHASES.map((p) => (
              <button key={p.id} onClick={() => setActive(p.id)} className="flex-1 group cursor-pointer">
                <div className={`h-3 rounded-full transition-all ${active === p.id ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                  style={{
                    background: p.status === "completed" ? "hsl(164 37% 35%)" : p.status === "current" ? "linear-gradient(90deg, hsl(164 37% 35%), hsl(42 78% 60%))" : "hsl(220 16% 16%)",
                  }} />
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center group-hover:text-foreground transition-colors">{p.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{phase.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{phase.pct}% complete</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={phase.pct} className="h-2" />
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map(t => (
                  <li key={t.label} className="flex items-center gap-2 text-sm">
                    {t.status === "done" ? <Check size={14} className="text-primary" /> : t.status === "progress" ? <Clock size={14} className="text-[hsl(42,78%,60%)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />}
                    <span className="text-foreground flex-1">{t.label}</span>
                    {t.pct !== undefined && <span className="text-[10px] text-muted-foreground">{t.pct}%</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">{phase.status === "completed" ? "All tasks completed." : "Tasks not yet assigned."}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Key Deliverables</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {DELIVERABLES.map(d => (
                  <li key={d.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{d.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${d.status === "Uploaded" ? "bg-primary/10 text-primary" : d.status === "In Progress" ? "bg-[hsl(42,78%,60%)]/10 text-[hsl(42,78%,60%)]" : "bg-muted text-muted-foreground"}`}>{d.status}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Phase Dependencies</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {DEPS.map(d => (
                  <li key={d.text} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: d.color }} />
                    <span className="text-foreground">{d.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
