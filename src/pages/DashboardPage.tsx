import { Link } from "react-router-dom";
import { MessageSquare, FileText, Upload, Clock } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const SAMPLE_AGENTS = [
  { name: "APEX", color: "#FF6B35", messages: 120 },
  { name: "LEDGER", color: "#4FC3F7", messages: 89 },
  { name: "ANCHOR", color: "#FF7043", messages: 45 },
  { name: "HELM", color: "#B388FF", messages: 38 },
  { name: "NEXUS", color: "#5B8CFF", messages: 28 },
  { name: "PRISM", color: "#E040FB", messages: 22 },
];

const SAMPLE_TEMPLATES = [
  { agent: "APEX", agentColor: "#FF6B35", type: "Site Safety Plan", date: "15 Mar 2026" },
  { agent: "LEDGER", agentColor: "#4FC3F7", type: "GST Calculator", date: "14 Mar 2026" },
  { agent: "ANCHOR", agentColor: "#FF7043", type: "Employment Agreement", date: "13 Mar 2026" },
  { agent: "HELM", agentColor: "#B388FF", type: "Meal Plan", date: "12 Mar 2026" },
  { agent: "NEXUS", agentColor: "#5B8CFF", type: "Import Entry Processor", date: "11 Mar 2026" },
];

const TIME_SAVED = [
  { template: "Site Safety Plan", count: 7, hoursEach: 3, total: 21 },
  { template: "Employment Agreement", count: 4, hoursEach: 2, total: 8 },
  { template: "GST Calculator", count: 12, hoursEach: 0.33, total: 4 },
  { template: "Meal Plan", count: 8, hoursEach: 0.5, total: 4 },
];

const maxMessages = Math.max(...SAMPLE_AGENTS.map((a) => a.messages));

const DashboardPage = () => {
  return (
    <div className="min-h-screen star-field flex flex-col">
      <BrandNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        <h2 className="text-xl font-extrabold text-foreground tracking-[2.5px] uppercase">Your Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: "Messages this month", value: "342", color: "hsl(var(--primary))" },
            { icon: FileText, label: "Templates generated", value: "14", color: "hsl(var(--secondary))" },
            { icon: Upload, label: "Documents processed", value: "8", color: "hsl(var(--accent))" },
            { icon: Clock, label: "Estimated time saved", value: "23.5 hrs", color: "#FFB800", highlight: true },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-5 opacity-0 animate-fade-up"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: "forwards",
                borderColor: stat.highlight ? "#FFB80040" : "hsl(var(--border))",
                boxShadow: stat.highlight ? "0 0 20px #FFB80015" : undefined,
              }}
            >
              <stat.icon size={18} style={{ color: stat.color }} className="mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] mt-1" style={{ color: '#ffffff38' }}>{stat.label}</p>
              {stat.label === "Messages this month" && (
                <div className="flex items-end gap-0.5 mt-3 h-6">
                  {[18, 24, 12, 30, 22, 28, 35, 42, 38, 45, 32, 37].map((v, j) => (
                    <div key={j} className="flex-1 rounded-sm bg-primary/30" style={{ height: `${(v / 45) * 100}%` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agent Activity */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Agent activity</h2>
          <div className="space-y-3">
            {SAMPLE_AGENTS.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3">
                <span className="text-xs font-mono-jb w-16 text-foreground/60 shrink-0">{agent.name}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(agent.messages / maxMessages) * 100}%`,
                      background: `linear-gradient(90deg, ${agent.color}60, ${agent.color})`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono-jb text-foreground/50 w-8 text-right">{agent.messages}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Templates */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Recent templates</h2>
          <div className="space-y-2">
            {SAMPLE_TEMPLATES.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: t.agentColor + "15", color: t.agentColor }}>{t.agent}</span>
                  <span className="text-xs text-foreground">{t.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: '#ffffff38' }}>{t.date}</span>
                  <button className="text-[11px] text-primary hover:underline">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Saved Breakdown */}
        <div className="rounded-xl border bg-card p-6" style={{ borderColor: "#FFB80025" }}>
          <h2 className="text-sm font-bold text-foreground mb-1">Time saved breakdown</h2>
          <p className="text-[11px] mb-4" style={{ color: '#ffffff38' }}>This is the number that justifies your subscription</p>
          <div className="space-y-3">
            {TIME_SAVED.map((t) => (
              <div key={t.template} className="flex items-center justify-between">
                <span className="text-xs text-foreground/70">{t.count} × {t.template}</span>
                <span className="text-xs font-bold" style={{ color: "#FFB800" }}>{t.total} hours saved</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs font-bold text-foreground">Total estimated time saved</span>
              <span className="text-sm font-bold" style={{ color: "#FFB800" }}>23.5 hours</span>
            </div>
          </div>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default DashboardPage;
