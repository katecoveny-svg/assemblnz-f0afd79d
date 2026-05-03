import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Layers, Search, AlertTriangle, Download, ToggleLeft } from "lucide-react";
import { showWorkflowToast } from "./WorkflowToast";

const FLOORS = [
  { level: 5, label: "Level 5 — Residential (Penthouse)", color: "hsl(42 78% 50%)" },
  { level: 4, label: "Level 4 — Residential", color: "hsl(220 40% 40%)" },
  { level: 3, label: "Level 3 — Residential", color: "hsl(220 40% 40%)" },
  { level: 2, label: "Level 2 — Commercial Office", color: "hsl(220 40% 45%)" },
  { level: 1, label: "Level 1 — Commercial Office", color: "hsl(220 40% 45%)" },
  { level: 0, label: "Ground Floor — Retail / Lobby", color: "hsl(164 37% 35%)" },
];

const LABELS = [
  { text: "Solar PV", pos: "top-4 left-4" },
  { text: "Structure", pos: "top-4 right-4" },
  { text: "HVAC", pos: "top-1/2 left-4 -translate-y-1/2" },
  { text: "Fire", pos: "bottom-16 right-4" },
  { text: "Foundation", pos: "bottom-4 left-4" },
];

const TOOLS = [
  { icon: Box, label: "3D View", active: true },
  { icon: ToggleLeft, label: "Wireframe", active: false },
  { icon: Layers, label: "Layers", active: false },
  { icon: AlertTriangle, label: "Clashes", active: false },
  { icon: Search, label: "Measure", active: false },
  { icon: Download, label: "Export IFC", active: false },
];

const CLASHES = [
  { text: "HVAC duct vs beam Level 2", severity: "Critical" },
  { text: "Sprinkler vs ceiling Level 3", severity: "High" },
  { text: "Stormwater pipe vs footing Ground", severity: "Medium" },
];

export default function BIMViewer() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px] gap-4">
        {/* 3D Viewer */}
        <Card className="bg-card border-border relative overflow-hidden" style={{ minHeight: 420 }}>
          <CardContent className="p-0 h-full relative">
            {/* Labels */}
            {LABELS.map(l => (
              <button key={l.text} className={`absolute ${l.pos} z-10 text-[10px] px-2 py-1 rounded-full border border-primary/30 bg-card/80 text-primary hover:bg-primary/10 transition-colors cursor-pointer`}
                onClick={() => showWorkflowToast(l.text, `${l.text} system details`)}>
                {l.text}
              </button>
            ))}

            {/* Building */}
            <div className="flex items-center justify-center h-full" style={{ perspective: "800px" }}>
              <div className="relative" style={{ transformStyle: "preserve-3d", animation: "bimRotate 8s ease-in-out infinite alternate" }}>
                <style>{`@keyframes bimRotate { from { transform: rotateX(15deg) rotateY(-15deg); } to { transform: rotateX(15deg) rotateY(-35deg); } }`}</style>
                {FLOORS.map((f, i) => (
                  <button key={f.level}
                    onClick={() => setSelectedFloor(f.level)}
                    className="block w-48 sm:w-56 transition-all duration-300 cursor-pointer"
                    style={{
                      height: 48,
                      marginBottom: 3,
                      background: wireframe ? "transparent" : f.color,
                      border: wireframe ? `1px solid ${f.color}` : selectedFloor === f.level ? "2px solid hsl(42 78% 60%)" : "1px solid rgba(255,255,255,0.1)",
                      opacity: wireframe ? 0.6 : selectedFloor === f.level ? 1 : 0.85,
                      transform: selectedFloor === f.level ? "translateZ(20px) scale(1.05)" : "translateZ(0)",
                      borderRadius: 4,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <span className="text-[10px] text-white/70 font-mono">L{f.level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected floor info */}
            {selectedFloor !== null && (
              <div className="absolute bottom-4 left-4 bg-card/90 border border-border rounded-lg p-3 text-sm z-10">
                <p className="font-medium text-foreground">{FLOORS.find(f => f.level === selectedFloor)?.label}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toolbar */}
        <div className="flex lg:flex-col gap-2">
          {TOOLS.map((t, i) => (
            <Button key={t.label} variant={t.active ? "default" : "outline"} size="icon" className="w-10 h-10"
              onClick={() => {
                if (t.label === "Wireframe") setWireframe(!wireframe);
                else if (t.label === "Export IFC") showWorkflowToast("Exporting IFC 4.0...");
                else if (t.label === "Clashes") showWorkflowToast("3 active clashes detected");
              }}
              title={t.label}>
              <t.icon size={16} />
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Model Statistics</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-1 text-muted-foreground">
            <p>Total Elements: <span className="text-foreground">14,207</span></p>
            <p>Architectural: <span className="text-foreground">6,340</span></p>
            <p>Structural: <span className="text-foreground">3,812</span></p>
            <p>MEP: <span className="text-foreground">4,055</span></p>
            <p>LOD: <span className="text-foreground">300</span> · IFC: <span className="text-foreground">4.0</span></p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Clash Detection</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {CLASHES.map(c => (
              <div key={c.text} className="flex items-start gap-2 text-xs">
                <AlertTriangle size={12} className={c.severity === "Critical" ? "text-destructive" : c.severity === "High" ? "text-[hsl(30,80%,55%)]" : "text-[hsl(42,78%,60%)]"} />
                <span className="text-foreground">{c.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Model Coordination</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-1 text-muted-foreground">
            <p>Last Sync: <span className="text-foreground">2h ago</span></p>
            <p>Architect Model: <span className="text-primary">Current</span></p>
            <p>Structural Model: <span className="text-primary">Current</span></p>
            <p>MEP Model: <span className="text-[hsl(30,80%,55%)]">1 day behind</span></p>
            <p>Next Coordination: <span className="text-foreground">18 Apr 2026</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
