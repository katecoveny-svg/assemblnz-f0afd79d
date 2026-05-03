import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, FolderPlus, Layers, ShieldCheck, Box, AlertTriangle, FileText, Menu, X, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showWorkflowToast } from "@/components/waihanga/WorkflowToast";
import SEO from "@/components/SEO";
import KeteDashboardLiveRow from "@/components/kete/KeteDashboardLiveRow";

import WorkflowOverview from "@/components/waihanga/WorkflowOverview";
import ProjectIntake from "@/components/waihanga/ProjectIntake";
import DesignPhases from "@/components/waihanga/DesignPhases";
import ComplianceChecklist from "@/components/waihanga/ComplianceChecklist";
import BIMViewer from "@/components/waihanga/BIMViewer";
import RiskRegister from "@/components/waihanga/RiskRegister";
import EvidencePacks from "@/components/waihanga/EvidencePacks";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "intake", label: "Project Intake", icon: FolderPlus },
  { id: "design", label: "Design Phases", icon: Layers },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "bim", label: "BIM Viewer", icon: Box },
  { id: "risk", label: "Risk Register", icon: AlertTriangle },
  { id: "evidence", label: "Evidence Packs", icon: FileText },
];

const CONTENT: Record<string, React.FC> = {
  overview: WorkflowOverview,
  intake: ProjectIntake,
  design: DesignPhases,
  compliance: ComplianceChecklist,
  bim: BIMViewer,
  risk: RiskRegister,
  evidence: EvidencePacks,
};

export default function WaihangaWorkflow() {
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const ActiveContent = CONTENT[active];
  const activeSection = SECTIONS.find(s => s.id === active)!;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SEO title="Construction Workflow Dashboard | assembl" description="Architecture workflow dashboard for NZ construction — compliance, BIM, risk register, and evidence packs." />

      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        {/* Back link */}
        <Link to="/waihanga" className="flex items-center gap-2 px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors border-b border-border">
          <ArrowLeft size={14} /> Back to Assembl
        </Link>

        {/* Brand */}
        <div className="px-5 py-5 border-b border-border">
          <h2 className="text-lg font-light uppercase tracking-[0.12em] bg-gradient-to-r from-primary to-[hsl(42,78%,60%)] bg-clip-text text-transparent">
            Waihanga
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[3px] mt-0.5">Construction Kete</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Project avatar */}
        <div className="px-5 py-4 border-t border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">KH</div>
          <div>
            <p className="text-sm text-foreground font-medium">Kaitiaki House</p>
            <p className="text-[10px] text-muted-foreground font-mono">PRJ-2026-0047</p>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-lg font-light uppercase tracking-[0.12em] bg-gradient-to-r from-primary to-[hsl(42,78%,60%)] bg-clip-text text-transparent">Waihanga</h2>
              <button onClick={() => setMobileOpen(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <nav className="flex-1 py-3 px-3 space-y-0.5">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => { setActive(s.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                  <s.icon size={16} />{s.label}
                </button>
              ))}
            </nav>
            <Link to="/waihanga" className="flex items-center gap-2 px-5 py-3 text-xs text-muted-foreground border-t border-border"><ArrowLeft size={14} /> Back to Assembl</Link>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} className="text-foreground" /></button>
            <h1 className="text-base sm:text-lg font-medium text-foreground">{activeSection.label}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-primary/30 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> ARAI Connected
            </span>
            <span className="hidden sm:inline text-[10px] px-2.5 py-1 rounded-full border border-[hsl(42,78%,60%)]/30 text-[hsl(42,78%,60%)]">Demo Mode</span>
            <Button size="sm" className="text-xs gap-1.5" onClick={() => showWorkflowToast("AI compliance scan initiated...", "Scanning project against Building Code requirements")}>
              <Scan size={14} /> Run AI Scan
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <KeteDashboardLiveRow kete="waihanga" />
          </div>
          <ActiveContent />
        </main>
      </div>
    </div>
  );
}
