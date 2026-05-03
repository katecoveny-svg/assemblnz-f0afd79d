import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Layers, ShieldCheck, AlertTriangle, Clock } from "lucide-react";

const STATS = [
  { label: "Project Value", value: "$42.5M", color: "hsl(42 78% 60%)", sub: "On budget", icon: DollarSign },
  { label: "Design Phase", value: "3 / 5", color: "hsl(164 37% 45%)", sub: "Detailed Design", icon: Layers },
  { label: "Compliance Score", value: "87%", color: "hsl(142 50% 50%)", sub: "+12% this month", icon: ShieldCheck },
  { label: "Active Risks", value: "4", color: "hsl(30 80% 55%)", sub: "2 critical", icon: AlertTriangle },
];

const DETAILS = [
  ["Client", "Tahi Development Ltd"],
  ["Architect", "Warren & Mahoney"],
  ["Site", "14-22 Ponsonby Rd, Auckland"],
  ["Consent", "Auckland Council RC"],
  ["GFA", "8,450 m²"],
  ["Budget", "$38M – $45M"],
  ["Start", "15 Jan 2026"],
  ["Target PC", "30 Nov 2027"],
];

const ACTIVITY = [
  { text: "Structural engineering review completed", color: "hsl(164 37% 45%)", time: "2 hours ago" },
  { text: "Fire report uploaded", color: "hsl(42 78% 60%)", time: "Yesterday" },
  { text: "ARAI flagged geotechnical risk", color: "hsl(30 80% 55%)", time: "2 days ago" },
  { text: "Resource consent pre-application meeting", color: "hsl(142 50% 50%)", time: "3 days ago" },
];

const PHASES = [
  { name: "Concept Design", date: "Jan 2026", status: "completed" },
  { name: "Developed Design", date: "Mar 2026", status: "completed" },
  { name: "Detailed Design", date: "Current", status: "current" },
  { name: "Consent Docs", date: "Jul 2026", status: "pending" },
  { name: "Construction Docs", date: "Sep 2026", status: "pending" },
];

export default function WorkflowOverview() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project details + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Project Details</CardTitle>
            <p className="text-xs text-muted-foreground">Kaitiaki House — 6-Storey Mixed-Use Development, Ponsonby, Auckland</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {DETAILS.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground font-medium">{v}</span>
              </div>
            ))}
            <div className="pt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="text-foreground">58%</span>
              </div>
              <Progress value={58} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                  <div>
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock size={10} /> {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design Phase Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Design Phase Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {PHASES.map((p, i) => (
              <div key={p.name} className="flex-1">
                <div
                  className="h-3 rounded-full"
                  style={{
                    background:
                      p.status === "completed" ? "hsl(164 37% 35%)"
                      : p.status === "current" ? "linear-gradient(90deg, hsl(164 37% 35%), hsl(42 78% 60%))"
                      : "hsl(220 16% 16%)",
                  }}
                />
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">{p.name}</p>
                <p className="text-[9px] text-muted-foreground text-center">{p.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
