import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertCircle, FileText, Sparkles, Loader2 } from "lucide-react";
import { showWorkflowToast } from "./WorkflowToast";
import { generateAndDownloadEvidencePack } from "@/lib/evidencePackPdf";
import { toast } from "sonner";

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";

const STATS = [
  { label: "Total Documents", value: "47" },
  { label: "Pack Completeness", value: "78%" },
  { label: "AI Verified", value: "34 / 47" },
];

const BC_DOCS = [
  { name: "Architectural Drawing Set", detail: "42 sheets", status: "complete" },
  { name: "Structural Calculations — Holmes", detail: "", status: "complete" },
  { name: "Fire Engineering Report C/AS7", detail: "", status: "review" },
  { name: "Geotechnical Investigation — Tonkin+Taylor", detail: "", status: "addendum" },
  { name: "BIM Model IFC", detail: "", status: "complete" },
  { name: "Producer Statements PS1", detail: "2 of 4 received", status: "progress" },
  { name: "Accessibility Audit NZS 4121", detail: "", status: "complete" },
  { name: "Energy Model H1/AS1", detail: "", status: "pending" },
];

const RC_DOCS = [
  { name: "AEE s88", status: "complete" },
  { name: "Urban Design Assessment", status: "complete" },
  { name: "Transport Assessment", status: "complete" },
  { name: "Cultural Impact Assessment", status: "progress" },
  { name: "Stormwater Management Plan", status: "complete" },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "complete") return <Check size={14} style={{ color: POUNAMU }} />;
  if (status === "review") return <Clock size={14} style={{ color: POUNAMU_LIGHT }} />;
  if (status === "progress") return <Clock size={14} style={{ color: POUNAMU_LIGHT }} />;
  if (status === "addendum") return <AlertCircle size={14} style={{ color: POUNAMU }} />;
  return <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />;
}

export default function EvidencePacks() {
  const [generating, setGenerating] = useState<"bc" | "rc" | null>(null);

  const handleGenerate = async (kind: "bc" | "rc") => {
    setGenerating(kind);
    try {
      const isBC = kind === "bc";
      const result = await generateAndDownloadEvidencePack({
        kete: "waihanga",
        title: isBC ? "Building Consent Evidence Pack" : "Resource Consent Evidence Pack",
        client: "Sample Project — Auckland CBD",
        summary: isBC
          ? "Consolidated Building Consent evidence including architectural, structural, fire, geotechnical, and producer statement records. Cross-referenced against the New Zealand Building Code."
          : "Resource Consent evidence pack covering AEE, urban design, transport, cultural impact, and stormwater management for s88 RMA submission.",
        sections: (isBC ? BC_DOCS : RC_DOCS).map((d) => ({
          agent: "APEX",
          designation: "Building Compliance",
          title: d.name,
          body: `Status: ${d.status.toUpperCase()}${"detail" in d && d.detail ? ` — ${d.detail}` : ""}. Reviewed against NZBC clauses; verification trail recorded in audit log.`,
          status: d.status === "complete" ? ("pass" as const) : d.status === "addendum" ? ("flag" as const) : ("flag" as const),
          legislationRef: isBC ? "Building Act 2004, NZBC" : "Resource Management Act 1991, s88",
        })),
        simulated: true,
      });
      showWorkflowToast("Evidence pack compiled successfully", `${result.filename} downloaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate pack");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Building Consent Evidence Pack</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {BC_DOCS.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-sm">
                  <FileText size={14} className="text-muted-foreground shrink-0" />
                  <StatusIcon status={d.status} />
                  <span className="text-foreground flex-1">{d.name}</span>
                  {d.detail && <span className="text-[10px] text-muted-foreground">{d.detail}</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Resource Consent Evidence Pack</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {RC_DOCS.map((d) => (
                  <li key={d.name} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <StatusIcon status={d.status} />
                    <span className="text-foreground">{d.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border relative overflow-hidden"
            style={{ boxShadow: `0 0 40px ${POUNAMU}14` }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${POUNAMU}0D, transparent 60%)` }}
            />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Sparkles size={16} style={{ color: POUNAMU }} />
                AI Evidence Pack Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <p className="text-xs text-muted-foreground">
                Auto-compiles all project documentation into a branded PDF evidence pack, cross-referenced against the Building Code and consent requirements. Downloads to your device and saves a watermarked record.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="text-xs text-white"
                  style={{ background: POUNAMU }}
                  disabled={generating !== null}
                  onClick={() => handleGenerate("bc")}
                >
                  {generating === "bc" ? <Loader2 size={12} className="animate-spin mr-1.5" /> : null}
                  Generate Building Consent Pack
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  disabled={generating !== null}
                  onClick={() => handleGenerate("rc")}
                >
                  {generating === "rc" ? <Loader2 size={12} className="animate-spin mr-1.5" /> : null}
                  Generate Resource Consent Pack
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
