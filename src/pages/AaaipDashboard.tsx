// ═══════════════════════════════════════════════════════════════
// AAAIP — Live Demo Dashboard
// Single-page demo for Gill Dobbie: a clinic-scheduling agent
// running against a digital-twin simulator under live policy
// governance, with a human approval queue and metrics charts.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Pause,
  Play,
  RefreshCw,
  Shield,
  SkipForward,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useAaaipRuntime } from "@/aaaip";

const VERDICT_LABEL: Record<string, string> = {
  allow: "Auto-approved",
  needs_human: "Needs human",
  block: "Blocked",
};

const VERDICT_COLOUR: Record<string, string> = {
  allow: "#3A7D6E",
  needs_human: "#D4A843",
  block: "#B83A3A",
};

export default function AaaipDashboard() {
  const rt = useAaaipRuntime();

  const policyHitData = useMemo(
    () =>
      Object.entries(rt.metrics.policyHits)
        .map(([id, count]) => ({
          id,
          name: id.replace("clinic.", ""),
          count,
        }))
        .sort((a, b) => b.count - a.count),
    [rt.metrics.policyHits],
  );

  const verdictData = useMemo(
    () => [
      { name: "Auto-approved", value: rt.metrics.allowed, fill: VERDICT_COLOUR.allow },
      { name: "Needs human", value: rt.metrics.needsHuman, fill: VERDICT_COLOUR.needs_human },
      { name: "Blocked", value: rt.metrics.blocked, fill: VERDICT_COLOUR.block },
    ],
    [rt.metrics],
  );

  const downloadExport = () => {
    const json = rt.exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aaaip-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="AAAIP Live Demo · Assembl"
        description="A simulation-tested, policy-governed autonomous clinic scheduling agent built for the Aotearoa Agentic AI Platform."
      />
      <header className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Aotearoa Agentic AI Platform · Pilot 01
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Clinic Scheduling Digital Twin
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A policy-governed autonomous agent scheduling appointments inside a
              simulated clinic. Every decision is checked against AAAIP-aligned
              policies; uncertain cases are escalated to a human in the loop.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rt.isRunning ? (
              <Button onClick={rt.pause} variant="outline">
                <Pause className="mr-1" />
                Pause
              </Button>
            ) : (
              <Button onClick={rt.start}>
                <Play className="mr-1" />
                Run sim
              </Button>
            )}
            <Button onClick={() => rt.step()} variant="outline">
              <SkipForward className="mr-1" />
              Step
            </Button>
            <Button onClick={rt.injectEmergency} variant="outline">
              <AlertTriangle className="mr-1" />
              Inject emergency
            </Button>
            <Button onClick={rt.reset} variant="ghost">
              <RefreshCw className="mr-1" />
              Reset
            </Button>
            <Button onClick={downloadExport} variant="ghost">
              <Download className="mr-1" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* KPI row */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            label="Decisions made"
            value={rt.metrics.total}
            icon={<Stethoscope className="h-4 w-4" />}
          />
          <KpiCard
            label="Compliance rate"
            value={`${Math.round(rt.metrics.complianceRate * 100)}%`}
            icon={<Shield className="h-4 w-4" />}
          />
          <KpiCard
            label="Awaiting human"
            value={rt.pendingApprovals.length}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="Sim ticks"
            value={rt.tickCount}
            icon={<Clock className="h-4 w-4" />}
          />
        </section>

        <Tabs defaultValue="live" className="space-y-4">
          <TabsList>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals
              {rt.pendingApprovals.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {rt.pendingApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          {/* ── Live tab ────────────────────────────────────── */}
          <TabsContent value="live" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Simulator state</CardTitle>
                  <CardDescription>
                    Tick {rt.world.now} · {rt.world.bookings.length}/
                    {rt.world.slots.length} slots booked
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Patient inbox ({rt.world.inbox.length})
                    </p>
                    <div className="mt-2 space-y-1">
                      {rt.world.inbox.length === 0 && (
                        <p className="text-sm text-muted-foreground">— empty —</p>
                      )}
                      {rt.world.inbox.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
                        >
                          <span>{p.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={p.acuity <= 2 ? "destructive" : "secondary"}>
                              acuity {p.acuity}
                            </Badge>
                            {!p.consentOnFile && (
                              <Badge variant="outline">no consent</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Slot grid
                    </p>
                    <div className="mt-2 grid grid-cols-8 gap-1 text-[10px]">
                      {rt.world.slots.map((s) => {
                        const taken = rt.world.occupiedSlots.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            className={`flex h-10 items-center justify-center rounded ${
                              taken
                                ? "bg-primary/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                            title={`${s.id} · ${s.clinicianId}`}
                          >
                            {s.id.replace("slot-", "")}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {rt.world.pendingEmergency && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Pending emergency — agent will escalate routine bookings.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent decision feed</CardTitle>
                  <CardDescription>
                    Most recent decisions, newest first.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[420px]">
                    <div className="divide-y">
                      {rt.audit.length === 0 && (
                        <p className="p-4 text-sm text-muted-foreground">
                          No decisions yet. Press <strong>Run sim</strong> or{" "}
                          <strong>Step</strong>.
                        </p>
                      )}
                      {rt.audit.slice(0, 30).map((entry) => (
                        <DecisionRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Approvals tab ───────────────────────────────── */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Human-in-the-loop queue</CardTitle>
                <CardDescription>
                  Decisions the agent flagged as uncertain or warning-level.
                  Approve to apply, reject to drop the patient back to a clinician.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rt.pendingApprovals.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Queue is empty. The agent is operating autonomously within policy.
                  </p>
                )}
                {rt.pendingApprovals.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-md border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {entry.decision.action.rationale}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.decision.explanation}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => rt.approve(entry.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rt.reject(entry.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Metrics tab ─────────────────────────────────── */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Verdict mix</CardTitle>
                  <CardDescription>
                    How decisions were resolved by the compliance engine.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verdictData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {verdictData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policy-violation hits</CardTitle>
                  <CardDescription>
                    Which policies are firing most often.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {policyHitData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No policy violations recorded yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={policyHitData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3A6A9C" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Headline metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <Stat label="Allowed" value={rt.metrics.allowed} />
                <Stat label="Needs human" value={rt.metrics.needsHuman} />
                <Stat label="Blocked" value={rt.metrics.blocked} />
                <Stat label="Applied" value={rt.metrics.applied} />
                <Stat
                  label="Compliance rate"
                  value={`${Math.round(rt.metrics.complianceRate * 100)}%`}
                />
                <Stat
                  label="Human approval rate"
                  value={`${Math.round(rt.metrics.humanApprovalRate * 100)}%`}
                />
                <Stat
                  label="Fairness drift"
                  value={rt.world.fairnessDriftScore.toFixed(2)}
                />
                <Stat
                  label="Pending emergency"
                  value={rt.world.pendingEmergency ? "yes" : "no"}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Policies tab ────────────────────────────────── */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy library</CardTitle>
                <CardDescription>
                  Every rule the runtime enforces. Adding a new policy is one
                  predicate function plus an entry in <code>library.ts</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rt.policies.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-md border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{p.name}</h3>
                      <Badge
                        variant={p.severity === "block" ? "destructive" : "secondary"}
                      >
                        {p.severity}
                      </Badge>
                      <Badge variant="outline">{p.oversight.replace("_", " ")}</Badge>
                      {p.tags.map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {p.rationale}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Source: {p.source}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function DecisionRow({
  entry,
}: {
  entry: ReturnType<typeof useAaaipRuntime>["audit"][number];
}) {
  const v = entry.decision.verdict;
  const colour = VERDICT_COLOUR[v];
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className="mt-1 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: colour }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" style={{ borderColor: colour, color: colour }}>
            {VERDICT_LABEL[v]}
          </Badge>
          {entry.humanOverride && (
            <Badge variant="secondary">human {entry.humanOverride}</Badge>
          )}
          {entry.applied && (
            <span className="inline-flex items-center text-xs text-emerald-600">
              <CheckCircle2 className="mr-1 h-3 w-3" /> applied
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm">
          {entry.decision.action.rationale}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {entry.decision.explanation}
        </p>
      </div>
    </div>
  );
}
