// ═══════════════════════════════════════════════════════════════
// AAAIP — Live Demo Dashboard
// Single-page demo: a clinic-scheduling agent and a human-robot
// collaboration agent, both running against digital-twin
// simulators under live policy governance, with a human approval
// queue and metrics charts. Domain switcher swaps the live view
// while reusing the chrome.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cloud,
  Cpu,
  Download,
  FlaskConical,
  MessagesSquare,
  Pause,
  Play,
  RefreshCw,
  Shield,
  SkipForward,
  Stethoscope,
  Upload,
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

import {
  useAaaipRuntime,
  useRobotRuntime,
  useScienceRuntime,
  useCommunityRuntime,
  type AaaipRuntime,
  type AuditEntry,
  type CommunityRuntime,
  type RobotRuntime,
  type ScienceRuntime,
  type ZoneId,
} from "@/aaaip";

type DomainKey = "clinic" | "robot" | "science" | "community";

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

const DOMAIN_META: Record<DomainKey, {
  title: string;
  pilotLabel: string;
  description: string;
  policyPrefix: string;
}> = {
  clinic: {
    title: "Clinic Scheduling Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 01",
    description:
      "A policy-governed autonomous agent scheduling appointments inside a simulated clinic. Every decision is checked against AAAIP-aligned policies; uncertain cases are escalated to a human in the loop.",
    policyPrefix: "clinic.",
  },
  robot: {
    title: "Human-Robot Collaboration Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 02",
    description:
      "A collaborative robot working alongside a human operator in a manufacturing cell. Sensors, intent classification, force limits and zone occupancy are all gated by ISO/TS 15066-aligned policies.",
    policyPrefix: "robot.",
  },
  science: {
    title: "Drug Screening Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 03",
    description:
      "An autonomous drug-screening agent dispatching compounds to a 96-well plate. Every assay is gated by data-provenance, IRB, dosage and reproducibility policies before it can run.",
    policyPrefix: "science.",
  },
  community: {
    title: "Community Portal Moderation",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 04",
    description:
      "An autonomous moderation agent for an AAAIP community portal. Posts are gated by harm, te reo respect, Māori data sovereignty, PII leak and misinformation review policies before publishing.",
    policyPrefix: "community.",
  },
};

export default function AaaipDashboard() {
  const [domain, setDomain] = useState<DomainKey>("clinic");
  const clinic = useAaaipRuntime();
  const robot = useRobotRuntime();
  const science = useScienceRuntime();
  const community = useCommunityRuntime();
  const rt =
    domain === "clinic"
      ? clinic
      : domain === "robot"
        ? robot
        : domain === "science"
          ? science
          : community;
  const meta = DOMAIN_META[domain];

  const policyHitData = useMemo(
    () =>
      Object.entries(rt.metrics.policyHits)
        .map(([id, count]) => ({
          id,
          name: id.replace(meta.policyPrefix, ""),
          count,
        }))
        .sort((a, b) => b.count - a.count),
    [rt.metrics.policyHits, meta.policyPrefix],
  );

  const verdictData = useMemo(
    () => [
      { name: "Auto-approved", value: rt.metrics.allowed, fill: VERDICT_COLOUR.allow },
      { name: "Needs human", value: rt.metrics.needsHuman, fill: VERDICT_COLOUR.needs_human },
      { name: "Blocked", value: rt.metrics.blocked, fill: VERDICT_COLOUR.block },
    ],
    [rt.metrics],
  );

  const [submitting, setSubmitting] = useState(false);

  const downloadExport = () => {
    const json = rt.exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aaaip-${domain}-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendToAaaip = async () => {
    if (rt.audit.length === 0) {
      toast.warning("Nothing to send", {
        description: "Run the simulator first so there's something to export.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const result = await rt.submitToAaaip();
      if (result.ok === true) {
        toast.success("Sent to AAAIP archive", {
          description: `${result.stored_entries} decisions stored · id ${result.id.slice(0, 8)}…`,
        });
      } else {
        toast.error("AAAIP export failed", {
          description: result.detail ?? result.error,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="AAAIP Live Demo · Assembl"
        description="Simulation-tested, policy-governed autonomous agents for clinic scheduling and human-robot collaboration, built for the Aotearoa Agentic AI Platform."
      />
      <header className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {meta.pilotLabel}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                {meta.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {meta.description}
              </p>
            </div>
            <DomainSwitcher value={domain} onChange={setDomain} />
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
            {rt.scenarioActions.map((sa) => (
              <Button key={sa.id} onClick={sa.onTrigger} variant="outline">
                <AlertTriangle className="mr-1" />
                {sa.label}
              </Button>
            ))}
            <Button onClick={rt.reset} variant="ghost">
              <RefreshCw className="mr-1" />
              Reset
            </Button>
            <Button onClick={downloadExport} variant="ghost">
              <Download className="mr-1" />
              Download JSON
            </Button>
            <Button onClick={sendToAaaip} disabled={submitting}>
              {submitting ? (
                <Cloud className="mr-1 animate-pulse" />
              ) : (
                <Upload className="mr-1" />
              )}
              {submitting ? "Sending…" : "Send to AAAIP"}
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
            icon={
              domain === "clinic" ? (
                <Stethoscope className="h-4 w-4" />
              ) : domain === "robot" ? (
                <Cpu className="h-4 w-4" />
              ) : domain === "science" ? (
                <FlaskConical className="h-4 w-4" />
              ) : (
                <MessagesSquare className="h-4 w-4" />
              )
            }
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
              {domain === "clinic" && <ClinicLiveView rt={clinic} />}
              {domain === "robot" && <RobotLiveView rt={robot} />}
              {domain === "science" && <ScienceLiveView rt={science} />}
              {domain === "community" && <CommunityLiveView rt={community} />}

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
                  {domain === "clinic" &&
                    "Decisions the agent flagged as uncertain or warning-level. Approve to apply, reject to drop the patient back to a clinician."}
                  {domain === "robot" &&
                    "Motion plans the robot agent flagged as uncertain. Approve to execute, reject to drop the task back to the operator."}
                  {domain === "science" &&
                    "Screening proposals the science agent flagged as uncertain. Approve to dispatch the assay, reject to drop the compound back to the investigator."}
                  {domain === "community" &&
                    "Posts the moderation agent flagged as uncertain. Approve to publish, reject to hide the post."}
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
                        <Button size="sm" onClick={() => rt.approve(entry.id)}>
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
                {domain === "clinic" && (
                  <>
                    <Stat
                      label="Fairness drift"
                      value={clinic.world.fairnessDriftScore.toFixed(2)}
                    />
                    <Stat
                      label="Pending emergency"
                      value={clinic.world.pendingEmergency ? "yes" : "no"}
                    />
                  </>
                )}
                {domain === "robot" && (
                  <>
                    <Stat
                      label="Sensor reliability"
                      value={robot.world.sensorReliability.toFixed(2)}
                    />
                    <Stat
                      label="Operator intent"
                      value={`${robot.world.humanIntent} (${robot.world.humanIntentConfidence.toFixed(2)})`}
                    />
                  </>
                )}
                {domain === "science" && (
                  <>
                    <Stat label="Plate hits" value={science.world.hits} />
                    <Stat
                      label="Wells used"
                      value={`${science.world.completed.length}/${
                        science.world.wells.length - science.world.controlWells.length
                      }`}
                    />
                  </>
                )}
                {domain === "community" && (
                  <>
                    <Stat label="Published" value={community.world.published.length} />
                    <Stat label="Rejected" value={community.world.rejected.length} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Policies tab ────────────────────────────────── */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy library</CardTitle>
                <CardDescription>
                  Every rule the runtime enforces for this domain. Adding a new
                  policy is one predicate function plus an entry in the domain's
                  library file.
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

// ── Domain switcher ──────────────────────────────────────────

function DomainSwitcher({
  value,
  onChange,
}: {
  value: DomainKey;
  onChange: (v: DomainKey) => void;
}) {
  const options: Array<{ key: DomainKey; label: string; icon: React.ReactNode }> = [
    { key: "clinic", label: "Clinic", icon: <Stethoscope className="h-4 w-4" /> },
    { key: "robot", label: "Human-robot", icon: <Cpu className="h-4 w-4" /> },
    { key: "science", label: "Drug screening", icon: <FlaskConical className="h-4 w-4" /> },
    { key: "community", label: "Community", icon: <MessagesSquare className="h-4 w-4" /> },
  ];
  return (
    <div className="inline-flex rounded-md border bg-background p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Clinic live view ─────────────────────────────────────────

function ClinicLiveView({ rt }: { rt: AaaipRuntime }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulator state</CardTitle>
        <CardDescription>
          Tick {rt.world.now} · {rt.world.bookings.length}/{rt.world.slots.length}{" "}
          slots booked
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
                  {!p.consentOnFile && <Badge variant="outline">no consent</Badge>}
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
  );
}

// ── Robot live view ──────────────────────────────────────────

const ZONE_LABEL: Record<ZoneId, string> = {
  safe: "Safe",
  shared: "Shared",
  workbench: "Workbench",
  restricted: "Restricted",
};

function RobotLiveView({ rt }: { rt: RobotRuntime }) {
  const w = rt.world;
  const zones: ZoneId[] = ["safe", "shared", "workbench", "restricted"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace state</CardTitle>
        <CardDescription>
          Tick {w.now} · robot in {ZONE_LABEL[w.robotZone]} · tool {w.currentTool}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Zones
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {zones.map((z) => {
              const human = w.humanZones.includes(z);
              const robotHere = w.robotZone === z;
              return (
                <div
                  key={z}
                  className={`rounded-md border p-3 text-center text-xs ${
                    human
                      ? "border-destructive/60 bg-destructive/10"
                      : "bg-muted/30"
                  }`}
                >
                  <p className="font-semibold uppercase">{ZONE_LABEL[z]}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
                    {human && <Badge variant="destructive">Human</Badge>}
                    {robotHere && <Badge>Robot</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Stat
            label="Operator intent"
            value={`${w.humanIntent} (${w.humanIntentConfidence.toFixed(2)})`}
          />
          <Stat
            label="Sensor reliability"
            value={w.sensorReliability.toFixed(2)}
          />
          <Stat label="Force limit" value={`${w.forceLimitN} N`} />
          <Stat label="Speed limit" value={`${w.collaborativeSpeedMmS} mm/s`} />
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Task queue ({w.taskQueue.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.taskQueue.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.taskQueue.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <span className="truncate">{t.label}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{t.forceN} N</Badge>
                  <Badge variant="outline">{ZONE_LABEL[t.targetZone]}</Badge>
                  {t.toolChange && <Badge variant="secondary">tool</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {w.sensorReliability < 0.75 && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <Activity className="h-4 w-4" />
            Sensor reliability degraded — autonomous motion blocked.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Science live view ────────────────────────────────────────

function ScienceLiveView({ rt }: { rt: ScienceRuntime }) {
  const w = rt.world;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plate state</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.completed.length} screenings · {w.hits} hits ·{" "}
          {w.pipelineVersion}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Compound inbox ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <span className="truncate">{c.name}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{c.doseMicromolar} µM</Badge>
                  <Badge
                    variant={c.toxicityScore > 0.7 ? "destructive" : "outline"}
                  >
                    tox {c.toxicityScore.toFixed(2)}
                  </Badge>
                  {!c.provenance && <Badge variant="destructive">no prov</Badge>}
                  {c.usesHumanTissue && !c.irbApprovalId && (
                    <Badge variant="destructive">no IRB</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            96-well plate
          </p>
          <div className="mt-2 grid grid-cols-12 gap-1 text-[9px]">
            {w.wells.map((well) => {
              let cls = "bg-muted text-muted-foreground";
              if (well.isControl) cls = "bg-amber-500/20 text-amber-700";
              else if (well.occupiedBy) cls = "bg-emerald-500/30 text-emerald-800";
              return (
                <div
                  key={well.id}
                  className={`flex h-7 items-center justify-center rounded ${cls}`}
                  title={`${well.id}${well.isControl ? " · control" : well.occupiedBy ? " · " + well.occupiedBy : ""}`}
                >
                  {well.id.replace("well-", "")}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded bg-amber-500/60" />
              control
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded bg-emerald-500/60" />
              screened
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded bg-muted-foreground/30" />
              free
            </span>
          </div>
        </div>

        {w.inbox.some((c) => !c.provenance || (c.usesHumanTissue && !c.irbApprovalId)) && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            One or more compounds are missing provenance or IRB approval — they
            will be blocked by the engine.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Community live view ──────────────────────────────────────

function CommunityLiveView({ rt }: { rt: CommunityRuntime }) {
  const w = rt.world;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation queue</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.published.length} published · {w.rejected.length} rejected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Pending posts ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.author} · {p.kind}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={p.harmScore > 0.5 ? "destructive" : "outline"}>
                    harm {p.harmScore.toFixed(2)}
                  </Badge>
                  {p.containsTaonga && !p.iwiConsent && (
                    <Badge variant="destructive">no iwi consent</Badge>
                  )}
                  {p.containsPii && !p.authorPiiOptIn && (
                    <Badge variant="destructive">PII</Badge>
                  )}
                  {p.teReoConcernFlag && (
                    <Badge variant="secondary">te reo flag</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Stat label="Te reo flags" value={w.totals.teReoFlags} />
          <Stat label="Taonga flags" value={w.totals.taongaFlags} />
          <Stat label="PII flags" value={w.totals.piiFlags} />
          <Stat label="Harm flags" value={w.totals.harmFlags} />
        </div>

        {w.inbox.some((p) => p.harmScore >= 0.8) && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            One or more posts exceed the harm threshold — they will be hard-blocked.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Shared sub-components ────────────────────────────────────

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

function DecisionRow({ entry }: { entry: AuditEntry }) {
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
        <p className="mt-1 truncate text-sm">{entry.decision.action.rationale}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {entry.decision.explanation}
        </p>
      </div>
    </div>
  );
}
