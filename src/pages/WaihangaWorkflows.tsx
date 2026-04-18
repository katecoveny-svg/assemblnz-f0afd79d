import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Workflow } from "lucide-react";
import { toast } from "sonner";

type WorkflowType =
  | "retention_compliance_loop"
  | "payment_claim_generator"
  | "daily_site_safety"
  | "consent_readiness_precheck";

const WORKFLOWS: Array<{ id: WorkflowType; title: string; chain: string; example: any }> = [
  {
    id: "retention_compliance_loop",
    title: "Retention Money Compliance Loop",
    chain: "LEDGER → APEX → ANCHOR → AROHA → MANA",
    example: { contract_ref: "CON-2026-014", subcontractor_name: "Pacific Plumbing Ltd", invoice_amount_nzd: 85000, retention_pct: 10, trigger_event: "progress" },
  },
  {
    id: "payment_claim_generator",
    title: "Payment Claim Generator (CCA s.20)",
    chain: "KAUPAPA → APEX → ANCHOR → LEDGER → AROHA",
    example: { contract_ref: "CON-2026-014", principal_name: "Auckland Build Co", principal_email: "accounts@aucklandbuild.co.nz", claim_period: "2026-04", sum_claimed_nzd: 142500, retention_deduction_nzd: 14250 },
  },
  {
    id: "daily_site_safety",
    title: "Daily Site Safety Loop",
    chain: "ĀRAI → PULSE → APEX → MANA",
    example: { toolbox_topic: "Working at heights — scaffold inspection", attendees: ["Sam P.", "Tane H.", "Mei L."], hazards: ["Wet deck"], incidents: [], notifiable: false },
  },
  {
    id: "consent_readiness_precheck",
    title: "Consent Readiness Pre-Check",
    chain: "ARC → APEX → ANCHOR → KAHU",
    example: { council: "Auckland", consent_type: "residential", project_ref: "PRJ-2026-007", drawings_provided: true },
  },
];

export default function WaihangaWorkflows() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<WorkflowType>("retention_compliance_loop");
  const [payload, setPayload] = useState(JSON.stringify(WORKFLOWS[0].example, null, 2));
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ agent: string; output: string }>>([]);
  const [runs, setRuns] = useState<any[]>([]);

  useEffect(() => {
    const wf = WORKFLOWS.find((w) => w.id === selected);
    if (wf) setPayload(JSON.stringify(wf.example, null, 2));
  }, [selected]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("waihanga_workflow_runs")
      .select("id, workflow_type, status, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setRuns(data || []));
  }, [user, transcript]);

  const run = async () => {
    if (!user) {
      toast.error("Sign in first");
      return;
    }
    let parsed: any;
    try { parsed = JSON.parse(payload); } catch { toast.error("Invalid JSON payload"); return; }
    setRunning(true);
    setTranscript([]);
    try {
      const { data, error } = await supabase.functions.invoke("waihanga-orchestrator", {
        body: { workflow: selected, payload: parsed, userId: user.id },
      });
      if (error) throw error;
      setTranscript(data.transcript || []);
      toast.success(`Workflow completed — run ${data.run_id?.slice(0, 8)}`);
    } catch (e: any) {
      toast.error(e?.message || "Workflow failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Workflow className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-light text-foreground">Waihanga End-to-End Workflows</h1>
        </div>
        <p className="text-muted-foreground">Multi-agent orchestrations grounded in CCA 2002, NZS3910, HSWA 2015, MBIE retention regs, and council requirements.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {WORKFLOWS.map((wf) => (
          <Card
            key={wf.id}
            className={`p-4 cursor-pointer transition ${selected === wf.id ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
            onClick={() => setSelected(wf.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-foreground">{wf.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{wf.chain}</p>
              </div>
              {selected === wf.id && <Badge>Selected</Badge>}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Trigger payload (JSON)</label>
        <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={8} className="font-mono text-xs mb-4" />
        <Button onClick={run} disabled={running} size="lg">
          {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running chain…</> : "Run workflow"}
        </Button>
      </Card>

      {transcript.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-medium mb-4 text-foreground">Agent Chain Output</h3>
          <div className="space-y-4">
            {transcript.map((t, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <Badge variant="outline" className="mb-2">{i + 1}. {t.agent}</Badge>
                <pre className="text-sm whitespace-pre-wrap text-foreground/90">{t.output}</pre>
              </div>
            ))}
          </div>
        </Card>
      )}

      {runs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-3 text-foreground">Recent runs</h3>
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{r.id.slice(0, 8)}</span>
                <span className="text-foreground">{r.workflow_type}</span>
                <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(r.started_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
