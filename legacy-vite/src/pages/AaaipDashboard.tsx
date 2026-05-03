// ═══════════════════════════════════════════════════════════════
// AAAIP — Live Demo Dashboard
// Single-page demo: a clinic-scheduling agent and a human-robot
// collaboration agent, both running against digital-twin
// simulators under live policy governance, with a human approval
// queue and metrics charts. Domain switcher swaps the live view
// while reusing the chrome.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthSafe } from "@/hooks/useAuth";
import {
  Activity,
  AlertTriangle,
  Anchor,
  ArrowLeft,
  Bird,
  Briefcase,
  Car,
  CheckCircle2,
  Clock,
  Cloud,
  Cpu,
  Download,
  Fuel,
  FlaskConical,
  HardHat,
  MessagesSquare,
  Palette,
  Pause,
  Play,
  RefreshCw,
  Shield,
  Ship,
  SkipForward,
  Stethoscope,
  Truck,
  UtensilsCrossed,
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
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import KeteIcon from "@/components/kete/KeteIcon";
import ParticleField from "@/components/ParticleField";
import AgentTestToggle from "@/components/aaaip/AgentTestToggle";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  useAaaipRuntime,
  useArataikiRuntime,
  useAuahaRuntime,
  useManaakiRuntime,
  useCommunityRuntime,
  useWaihangaRuntime,
  usePikauRuntime,
  useRobotRuntime,
  useScienceRuntime,
  useToroRuntime,
  type AaaipRuntime,
  type ArataikiRuntime,
  type AuahaRuntime,
  type AuditEntry,
  type ManaakiRuntime,
  type CommunityRuntime,
  type WaihangaRuntime,
  type PikauRuntime,
  type RobotRuntime,
  type ScienceRuntime,
  type ToroRuntime,
  type ZoneId,
} from "@/aaaip";

type DomainKey =
  | "clinic"
  | "robot"
  | "science"
  | "community"
  | "waihanga"
  | "pikau"
  | "manaaki"
  | "auaha"
  | "arataki"
  | "toro";

const VERDICT_LABEL: Record<string, string> = {
  allow: "Auto-approved",
  needs_human: "Needs human",
  block: "Blocked",
};

const VERDICT_COLOUR: Record<string, string> = {
  allow: "#3A7D6E",
  needs_human: "#4AA5A8",
  block: "#B83A3A",
};

interface DomainMeta {
  title: string;
  pilotLabel: string;
  description: string;
  policyPrefix: string;
  group: "foundation" | "industry";
  accentColor: string;
  accentLight: string;
  keteVariant: "standard" | "dense" | "organic" | "tricolor" | "warm";
}

const DOMAIN_META: Record<DomainKey, DomainMeta> = {
  clinic: {
    title: "Clinic Scheduling Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 01",
    description:
      "A policy-governed autonomous agent scheduling appointments inside a simulated clinic. Every decision is checked against AAAIP-aligned policies; uncertain cases are escalated to a human in the loop.",
    policyPrefix: "clinic.",
    group: "foundation",
    accentColor: "#3A6A9C",
    accentLight: "#5AADA0",
    keteVariant: "organic",
  },
  robot: {
    title: "Human-Robot Collaboration Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 02",
    description:
      "A collaborative robot working alongside a human operator in a manufacturing cell. Sensors, intent classification, force limits and zone occupancy are all gated by ISO/TS 15066-aligned policies.",
    policyPrefix: "robot.",
    group: "foundation",
    accentColor: "#1A3A5C",
    accentLight: "#3A6A9C",
    keteVariant: "dense",
  },
  science: {
    title: "Drug Screening Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 03",
    description:
      "An autonomous drug-screening agent dispatching compounds to a 96-well plate. Every assay is gated by data-provenance, IRB, dosage and reproducibility policies before it can run.",
    policyPrefix: "science.",
    group: "foundation",
    accentColor: "#5AADA0",
    accentLight: "#3A7D6E",
    keteVariant: "tricolor",
  },
  community: {
    title: "Community Portal Moderation",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 04",
    description:
      "An autonomous moderation agent for an AAAIP community portal. Posts are gated by harm, te reo respect, Māori data sovereignty, PII leak and misinformation review policies before publishing.",
    policyPrefix: "community.",
    group: "foundation",
    accentColor: "#4AA5A8",
    accentLight: "#A8DDDB",
    keteVariant: "standard",
  },
  waihanga: {
    title: "Waihanga — Construction Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 05",
    description:
      "A construction site agent managing worker check-ins, photo documentation, hazard escalations and tender submissions. Gated by NZ Health & Safety at Work Act, WorkSafe PPE guidance and Privacy Act IPP 1 & 3.",
    policyPrefix: "waihanga.",
    group: "industry",
    accentColor: "#3A7D6E",
    accentLight: "#5AADA0",
    keteVariant: "dense",
  },
  pikau: {
    title: "Pikau — Freight & Customs Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 06",
    description:
      "A fleet / cold-chain agent reading telemetry from trucks and reefer containers. Driver-hours, cold-chain, sensor health, eco-driving and data residency policies gate every dispatch.",
    policyPrefix: "pikau.",
    group: "industry",
    accentColor: "#1A3A5C",
    accentLight: "#3A6A9C",
    keteVariant: "standard",
  },
  manaaki: {
    title: "Manaaki — Hospitality Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 07",
    description:
      "A reservations and guest-experience agent. Allergen safety, guest consent, accessibility, overbooking and data residency policies keep the property safe and compliant.",
    policyPrefix: "manaaki.",
    group: "industry",
    accentColor: "#4AA5A8",
    accentLight: "#A8DDDB",
    keteVariant: "organic",
  },
  auaha: {
    title: "Auaha — Creative & Media Studio",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 08 — Auaha (creative & media)",
    description:
      "A coordinated studio of nine specialist agents — Rautaki (strategy), Kōrero (content), Mana Kupu (compliance), Toi (creative), Whakahaere (campaigns), Whaikōrero-Ā-Hoko (lead gen), Aro (analytics), Reo Whare (internal comms) and Studio Director (orchestrator). Every output is gated by the claim register, Fair Trading Act, Privacy Act + IPP 3A, UEMA, and tikanga-compliance before a human signs it off. No autonomous publishing — ever.",
    policyPrefix: "auaha.",
    group: "industry",
    accentColor: "#A8DDDB",
    accentLight: "#4AA5A8",
    keteVariant: "tricolor",
  },
  arataki: {
    title: "Arataki — Automotive Digital Twin",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 10",
    description:
      "A dealer intelligence agent handling customer enquiries, finance quotes, test drives, trade-ins and live fuel-price economics. CCCFA disclosure, Fair Trading Act economy claims, Motor Vehicle Sales Act licensing, odometer integrity and Consumer Guarantees policies gate every outbound response. Includes a live ICE-vs-EV total-cost-of-ownership calculator driven by the shared FuelOracle.",
    policyPrefix: "arataki.",
    group: "industry",
    accentColor: "#C65D4E",
    accentLight: "#E88072",
    keteVariant: "standard",
  },
  toro: {
    title: "Toro — Whānau Family Navigator",
    pilotLabel: "Aotearoa Agentic AI Platform · Pilot 09",
    description:
      "An SMS-first whānau family navigator sending school notices, meal ideas, budget alerts, learning prompts and reminders. Parental-consent, age-appropriate, financial-harm, wellbeing-crisis and te reo integrity policies gate every outbound message.",
    policyPrefix: "toro.",
    group: "industry",
    accentColor: "#4AA5A8",
    accentLight: "#A8DDDB",
    keteVariant: "warm",
  },
};

export default function AaaipDashboard() {
  const auth = useAuthSafe();
  const isAdmin = auth?.isAdmin ?? false;
  const authLoading = auth?.loading ?? true;
  const [domain, setDomain] = useState<DomainKey>("clinic");
  const clinic = useAaaipRuntime();
  const robot = useRobotRuntime();
  const science = useScienceRuntime();
  const community = useCommunityRuntime();
  const waihanga = useWaihangaRuntime();
  const pikau = usePikauRuntime();
  const manaaki = useManaakiRuntime();
  const arataki = useArataikiRuntime();
  const auaha = useAuahaRuntime();
  const toro = useToroRuntime();
  const rt =
    domain === "clinic" ? clinic :
    domain === "robot" ? robot :
    domain === "science" ? science :
    domain === "community" ? community :
    domain === "waihanga" ? waihanga :
    domain === "pikau" ? pikau :
    domain === "manaaki" ? manaaki :
    domain === "auaha" ? auaha :
    domain === "arataki" ? arataki :
    toro;
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

  if (!authLoading && !isAdmin) return <Navigate to="/" replace />;

  return (
    <LightPageShell>
    <div className="relative min-h-screen" style={{ background: "transparent", color: "#3D4250" }}>
      <SEO
        title="AAAIP Live Demo · Assembl"
        description="Simulation-tested, policy-governed autonomous agents across every Assembl industry Kete — Waihanga, Pikau, Manaaki, Auaha, Toro — plus clinical, robotics, drug-screening and community-moderation pilots."
      />
      <BrandNav />
      <div className="relative z-10">
      <header
        className="border-b border-border/40 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${meta.accentColor}12 0%, ${meta.accentLight}08 50%, transparent 100%)`,
        }}
      >
        {/* Accent top bar */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${meta.accentColor}, ${meta.accentLight}, transparent)` }} />
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="hidden sm:flex items-center justify-center rounded-2xl p-3" style={{ background: `${meta.accentColor}12`, border: `1px solid ${meta.accentColor}20` }}>
                <KeteIcon
                  name={meta.title}
                  accentColor={meta.accentColor}
                  accentLight={meta.accentLight}
                  variant={meta.keteVariant}
                  size="small"
                  animated
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: `${meta.accentColor}15`, color: meta.accentColor, border: `1px solid ${meta.accentColor}25` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.accentColor }} />
                    {meta.pilotLabel}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {meta.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                  {meta.description}
                </p>
              </div>
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
              <Button onClick={rt.start} variant="outline">
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
            icon={<DomainIcon domain={domain} />}
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

        {/* Constellation decision feed — each decision is a pulsing star */}
        <ConstellationFeed
          audit={rt.audit}
          accentColor={meta.accentColor}
          accentLight={meta.accentLight}
        />

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
            <TabsTrigger value="agent-test">Agent Test</TabsTrigger>
          </TabsList>

          {/* ── Live tab ────────────────────────────────────── */}
          <TabsContent value="live" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {domain === "clinic" && <ClinicLiveView rt={clinic} />}
              {domain === "robot" && <RobotLiveView rt={robot} />}
              {domain === "science" && <ScienceLiveView rt={science} />}
              {domain === "community" && <CommunityLiveView rt={community} />}
              {domain === "waihanga" && <WaihangaLiveView rt={waihanga} />}
              {domain === "pikau" && <PikauLiveView rt={pikau} />}
              {domain === "manaaki" && <ManaakiLiveView rt={manaaki} />}
              {domain === "auaha" && <AuahaLiveView rt={auaha} />}
              {domain === "arataki" && <ArataikiLiveView rt={arataki} />}
              {domain === "toro" && <ToroLiveView rt={toro} />}

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
                  {domain === "waihanga" &&
                    "Construction tasks flagged for supervisor review — check-ins, photos and tender drafts. Approve to apply, reject to drop."}
                  {domain === "pikau" &&
                    "Freight dispatch decisions flagged for controller review. Approve to execute, reject to return to queue."}
                  {domain === "manaaki" &&
                    "Front-of-house decisions flagged for manager review. Approve to apply, reject to drop."}
                  {domain === "auaha" &&
                    "Creative assets flagged for brand-manager / kaitiaki review. Approve to publish, reject to hide."}
                  {domain === "arataki" &&
                    "Dealer actions flagged for sales-manager review — finance quotes, fuel-economy claims, trade-ins. Approve to send, reject to drop."}
                  {domain === "toro" &&
                    "Whānau messages flagged for kaiāwhina review — child data, high-risk budget advice, te reo content. Approve to send, reject to hold."}
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
                {domain === "waihanga" && (
                  <>
                    <Stat
                      label="Headcount"
                      value={`${waihanga.world.headcount}/${waihanga.world.headcountCap}`}
                    />
                    <Stat
                      label="Critical hazards"
                      value={waihanga.world.criticalHazardZones.length}
                    />
                  </>
                )}
                {domain === "pikau" && (
                  <>
                    <Stat
                      label="Sensor reliability"
                      value={pikau.world.sensorReliability.toFixed(2)}
                    />
                    <Stat
                      label="Fatigue blocks"
                      value={pikau.world.alerts.fatigueBlocks}
                    />
                  </>
                )}
                {domain === "manaaki" && (
                  <>
                    <Stat
                      label="Property occupancy"
                      value={`${manaaki.world.confirmedCount}/${manaaki.world.propertyCapacity}`}
                    />
                    <Stat
                      label="Allergen conflicts"
                      value={manaaki.world.alerts.allergenConflicts}
                    />
                  </>
                )}
                {domain === "auaha" && (
                  <>
                    <Stat label="Published" value={auaha.world.published.length} />
                    <Stat label="Te reo flags" value={auaha.world.alerts.teReoFlags} />
                  </>
                )}
                {domain === "arataki" && (
                  <>
                    <Stat
                      label="Petrol 91"
                      value={`$${arataki.world.fuel.petrol91.toFixed(2)}/L`}
                    />
                    <Stat
                      label="Diesel"
                      value={`$${arataki.world.fuel.diesel.toFixed(2)}/L`}
                    />
                  </>
                )}
                {domain === "toro" && (
                  <>
                    <Stat
                      label="Crisis handoffs"
                      value={toro.world.alerts.crisisHandoffs}
                    />
                    <Stat
                      label="Messages sent"
                      value={toro.world.sent.length}
                    />
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

          {/* ── Agent Test tab ─────────────────────────────── */}
          <TabsContent value="agent-test" className="space-y-4">
            <AgentTestToggle />
          </TabsContent>
        </Tabs>
      </main>
      <BrandFooter />
      </div>
    </div>
    </LightPageShell>
  );
}

// ── Domain switcher ──────────────────────────────────────────

const DOMAIN_OPTIONS: Array<{ key: DomainKey; label: string; group: "foundation" | "industry" }> = [
  { key: "clinic", label: "Clinic scheduling", group: "foundation" },
  { key: "robot", label: "Human-robot", group: "foundation" },
  { key: "science", label: "Drug screening", group: "foundation" },
  { key: "community", label: "Community portal", group: "foundation" },
  { key: "waihanga", label: "Waihanga — construction", group: "industry" },
  { key: "pikau", label: "Pikau — freight & customs", group: "industry" },
  { key: "manaaki", label: "Manaaki — hospitality", group: "industry" },
  { key: "auaha", label: "Auaha — creative", group: "industry" },
  { key: "arataki", label: "Arataki — automotive", group: "industry" },
  { key: "toro", label: "Toro — whānau navigator", group: "industry" },
];

function DomainIcon({ domain }: { domain: DomainKey }) {
  const cls = "h-4 w-4";
  switch (domain) {
    case "clinic":
      return <Stethoscope className={cls} />;
    case "robot":
      return <Cpu className={cls} />;
    case "science":
      return <FlaskConical className={cls} />;
    case "community":
      return <MessagesSquare className={cls} />;
    case "waihanga":
      return <HardHat className={cls} />;
    case "pikau":
      return <Truck className={cls} />;
    case "manaaki":
      return <UtensilsCrossed className={cls} />;
    case "auaha":
      return <Palette className={cls} />;
    case "arataki":
      return <Car className={cls} />;
    case "toro":
      return <Bird className={cls} />;
    default:
      return <Briefcase className={cls} />;
  }
}

function DomainSwitcher({
  value,
  onChange,
}: {
  value: DomainKey;
  onChange: (v: DomainKey) => void;
}) {
  const foundation = DOMAIN_OPTIONS.filter((o) => o.group === "foundation");
  const industry = DOMAIN_OPTIONS.filter((o) => o.group === "industry");
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DomainKey)}>
      <SelectTrigger className="w-[260px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Foundation pilots</SelectLabel>
          {foundation.map((o) => (
            <SelectItem key={o.key} value={o.key}>
              <span className="flex items-center gap-2">
                <DomainIcon domain={o.key} />
                {o.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Industry pilots</SelectLabel>
          {industry.map((o) => (
            <SelectItem key={o.key} value={o.key}>
              <span className="flex items-center gap-2">
                <DomainIcon domain={o.key} />
                {o.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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

// ── Hanga (construction) live view ───────────────────────────

function WaihangaLiveView({ rt }: { rt: WaihangaRuntime }) {
  const w = rt.world;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site state</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.headcount}/{w.headcountCap} workers on site ·{" "}
          {w.criticalHazardZones.length} critical hazards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Zones
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {w.zones.map((z) => {
              const hazard = w.criticalHazardZones.includes(z);
              return (
                <div
                  key={z}
                  className={`rounded-md border p-2 text-center text-[10px] uppercase ${
                    hazard ? "border-destructive/60 bg-destructive/10 text-destructive" : "bg-muted/30"
                  }`}
                >
                  {z}
                  {hazard && (
                    <div className="mt-0.5 font-semibold">hazard</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Inbox ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <span className="truncate">{t.label}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{t.kind.replace("_", " ")}</Badge>
                  {t.kind === "site_checkin" && t.ppeConfirmed === false && (
                    <Badge variant="destructive">no PPE</Badge>
                  )}
                  {t.kind === "upload_photo" && t.containsWorkers && !t.workerConsent && (
                    <Badge variant="destructive">no consent</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Hangarau (freight IoT) live view ─────────────────────────

function PikauLiveView({ rt }: { rt: PikauRuntime }) {
  const w = rt.world;
  const fuelShocked = w.fuel.events.includes("strait_of_hormuz_shock");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet telemetry</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.fleetSize} vehicles · sensor reliability{" "}
          {w.sensorReliability.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fuel price strip */}
        <div className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${fuelShocked ? "border-destructive/40 bg-destructive/5" : ""}`}>
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Live diesel price
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium">NZ${w.fuel.diesel.toFixed(2)}/L</span>
            {fuelShocked && (
              <Badge variant="destructive" className="text-[10px]">Fuel shock active</Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Stat label="Fatigue blocks" value={w.alerts.fatigueBlocks} />
          <Stat label="Cold chain breaks" value={w.alerts.coldChainBreaks} />
          <Stat label="Sensor failures" value={w.alerts.sensorFailures} />
          <Stat label="Cost overruns" value={w.alerts.fuelCostOverruns} />
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Inbox ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <span className="truncate">{t.label}</span>
                <div className="flex shrink-0 items-center gap-2">
                  {t.kind === "assign_route" && t.fuelCostNzdEstimate !== undefined && (
                    <Badge
                      variant={
                        t.fuelCostNzdEstimate > (t.fuelCostBudgetNzd ?? 200)
                          ? "destructive"
                          : "outline"
                      }
                    >
                      NZ${t.fuelCostNzdEstimate.toFixed(0)}
                    </Badge>
                  )}
                  {t.kind === "assign_route" && t.fuelCostNzdEstimate === undefined && (
                    <Badge variant={(t.driverMinutesRemaining ?? 999) < 30 ? "destructive" : "outline"}>
                      {t.driverMinutesRemaining}m left
                    </Badge>
                  )}
                  {t.kind === "clear_delivery" && (
                    <Badge variant={Math.abs((t.reeferTempC ?? 0) - (t.targetTempC ?? 0)) > 2 ? "destructive" : "outline"}>
                      {t.reeferTempC?.toFixed(1)}°C
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {w.sensorReliability < 0.75 && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <Activity className="h-4 w-4" />
            Sensor reliability degraded — autonomous dispatch blocked.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Aura (hospitality) live view ─────────────────────────────

function ManaakiLiveView({ rt }: { rt: ManaakiRuntime }) {
  const w = rt.world;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property state</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.confirmedCount}/{w.propertyCapacity} rooms confirmed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <Stat label="Allergen conflicts" value={w.alerts.allergenConflicts} />
          <Stat label="Overbook attempts" value={w.alerts.overbookAttempts} />
          <Stat label="Accessibility gaps" value={w.alerts.missingAccessibility} />
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Inbox ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <span className="truncate">{t.label}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{t.kind.replace("_", " ")}</Badge>
                  {t.allergenConflict && <Badge variant="destructive">allergen</Badge>}
                  {t.kind === "share_guest_profile" && !t.marketingOptIn && (
                    <Badge variant="destructive">no opt-in</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Auaha (creative) live view ───────────────────────────────

function AuahaLiveView({ rt }: { rt: AuahaRuntime }) {
  const w = rt.world;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creative queue</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.published.length} published · {w.rejected.length} rejected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Stat label="Licence gaps" value={w.alerts.licenceGaps} />
          <Stat label="Likeness gaps" value={w.alerts.likenessGaps} />
          <Stat label="Te reo flags" value={w.alerts.teReoFlags} />
          <Stat label="Brand risks" value={w.alerts.brandRisks} />
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Pending assets ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{a.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{a.kind}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={a.brandRisk > 0.6 ? "destructive" : "outline"}>
                    risk {a.brandRisk.toFixed(2)}
                  </Badge>
                  {a.usesThirdPartyAsset && !a.licenceRef && (
                    <Badge variant="destructive">no licence</Badge>
                  )}
                  {a.containsLikeness && !a.likenessConsent && (
                    <Badge variant="destructive">no consent</Badge>
                  )}
                  {a.containsTeReo && !a.kaitiakiReview && (
                    <Badge variant="secondary">kaitiaki?</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Arataki (automotive) live view ───────────────────────────

function ArataikiLiveView({ rt }: { rt: ArataikiRuntime }) {
  const w = rt.world;
  const tco = rt.lastTco;
  const fuelShock = w.fuel.events.length > 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Dealer state
        </CardTitle>
        <CardDescription>
          Tick {w.now} · {w.inventory.length} vehicles listed · MVTR{" "}
          {w.mvtrNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live fuel price oracle */}
        <div className="rounded-lg border bg-card/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Fuel className="h-3.5 w-3.5" /> Live NZ fuel prices
            {fuelShock && (
              <Badge variant="destructive" className="ml-auto">
                {w.fuel.events[0]}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">91</p>
              <p className="mt-1 font-semibold">${w.fuel.petrol91.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">NZD / L</p>
            </div>
            <div className="rounded border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">95</p>
              <p className="mt-1 font-semibold">${w.fuel.petrol95.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">NZD / L</p>
            </div>
            <div className="rounded border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Diesel</p>
              <p className="mt-1 font-semibold">${w.fuel.diesel.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">NZD / L</p>
            </div>
            <div className="rounded border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">EV</p>
              <p className="mt-1 font-semibold">${w.fuel.ev.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">NZD / kWh</p>
            </div>
          </div>
        </div>

        {/* ICE-vs-EV TCO comparison — last quote */}
        {tco && (
          <div className="rounded-lg border bg-card/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Last 5-year total cost of ownership (14,000 km/yr)
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-amber-500/30 bg-amber-500/5 p-2">
                <p className="text-[10px] uppercase text-amber-700">ICE</p>
                <p className="mt-1 text-lg font-semibold">
                  ${tco.ice.totalNzd.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  fuel ${tco.ice.fuelNzd.toLocaleString()} · ${tco.ice.perKmNzd}/km
                </p>
              </div>
              <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-2">
                <p className="text-[10px] uppercase text-emerald-700">EV</p>
                <p className="mt-1 text-lg font-semibold">
                  ${tco.ev.totalNzd.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  fuel ${tco.ev.fuelNzd.toLocaleString()} · ${tco.ev.perKmNzd}/km
                </p>
              </div>
            </div>
            <p className="mt-2 text-center text-xs font-medium">
              EV saves{" "}
              <span
                className={
                  tco.savingsNzd > 0 ? "text-emerald-600" : "text-destructive"
                }
              >
                ${tco.savingsNzd.toLocaleString()}
              </span>{" "}
              over 5 years at today's prices
            </p>
          </div>
        )}

        <Separator />

        {/* Inbox */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Customer inbox ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((e) => {
              const veh = w.inventory.find((v) => v.id === e.vehicleId);
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate">
                      {e.name} · {veh?.make} {veh?.model}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {e.kind.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {e.kind === "quote_finance" && e.cccfaDisclosuresAttached !== true && (
                      <Badge variant="destructive">no CCCFA</Badge>
                    )}
                    {veh?.odometerTamperFlag && (
                      <Badge variant="destructive">odometer</Badge>
                    )}
                    {e.kind === "share_with_partner" && e.customerOptIn !== true && (
                      <Badge variant="destructive">no opt-in</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Stat label="Handled" value={w.handled.length} />
          <Stat label="Rejected" value={w.rejected.length} />
          <Stat label="CCCFA blocks" value={w.alerts.cccfaBlocks} />
          <Stat label="Odometer" value={w.alerts.odometerBlocks} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Toroa (shipping) live view ───────────────────────────────

function ToroLiveView({ rt }: { rt: ToroRuntime }) {
  const w = rt.world;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Whānau state</CardTitle>
        <CardDescription>
          Tick {w.now} · {w.childCount} tamariki ·{" "}
          {w.vulnerableHousehold ? "vulnerable household" : "steady household"}{" "}
          · {w.sent.length} messages sent · {w.escalated.length} escalated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Stat label="Crisis handoffs" value={w.alerts.crisisHandoffs} />
          <Stat label="Consent blocks" value={w.alerts.consentBlocks} />
          <Stat label="Financial blocks" value={w.alerts.financialBlocks} />
          <Stat label="Te reo reviews" value={w.alerts.teReoReviews} />
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Pending messages ({w.inbox.length})
          </p>
          <div className="mt-2 space-y-1">
            {w.inbox.length === 0 && (
              <p className="text-sm text-muted-foreground">— empty —</p>
            )}
            {w.inbox.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{m.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {m.kind.replace("send_", "").replace("_", " ")} → {m.recipientType}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {m.crisisFlag && <Badge variant="destructive">crisis</Badge>}
                  {m.referencesChild && !m.parentalConsent && (
                    <Badge variant="destructive">no consent</Badge>
                  )}
                  {m.kind === "send_budget_alert" && m.recommendationRisk === "high" && (
                    <Badge variant="destructive">risk</Badge>
                  )}
                  {m.containsTeReo && !m.teReoValidated && (
                    <Badge variant="secondary">te reo</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {w.vulnerableHousehold && (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700">
            <Users className="h-4 w-4" />
            Household flagged vulnerable — financial-harm policy is extra
            strict and any crisis signal triggers mandatory handoff.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Constellation decision feed ──────────────────────────────
// Renders the last 24 decisions as pulsing stars connected by
// faint lines — a Matariki-style constellation showing how the
// agent's recent actions hang together. Colours match each
// pilot's Kete accent; verdict colours dominate.

function ConstellationFeed({
  audit,
  accentColor,
  accentLight,
}: {
  audit: AuditEntry[];
  accentColor: string;
  accentLight: string;
}) {
  const recent = audit.slice(0, 24);
  // Lay out stars in a quasi-constellation: rows with slight jitter.
  const width = 1200;
  const height = 160;
  const cols = 12;
  const padding = 40;
  const colWidth = (width - padding * 2) / (cols - 1);
  const rowHeight = 44;
  const nodes = recent.map((entry, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = ((entry.id.charCodeAt(entry.id.length - 1) || 0) % 11) - 5;
    const jitterY = ((entry.id.charCodeAt(0) || 0) % 9) - 4;
    return {
      entry,
      x: padding + col * colWidth + jitterX,
      y: padding + row * rowHeight + jitterY,
    };
  });

  const verdictColour = (v: string) => VERDICT_COLOUR[v] ?? accentColor;

  return (
    <Card className="overflow-hidden bg-background/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Constellation decision feed
        </CardTitle>
        <CardDescription className="text-xs">
          Each star is one agent decision — colour = verdict, connecting
          lines show the flow of recent actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {nodes.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
            No decisions yet — press <strong className="mx-1">Run sim</strong>{" "}
            to light up the sky.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-40 w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="starGlow">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor={accentLight} stopOpacity="0.5" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Connecting lines between adjacent stars */}
            {nodes.slice(1).map((n, i) => {
              const prev = nodes[i];
              return (
                <line
                  key={`line-${n.entry.id}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={n.x}
                  y2={n.y}
                  stroke={accentColor}
                  strokeOpacity={0.18}
                  strokeWidth={0.6}
                />
              );
            })}
            {/* Stars */}
            {nodes.map((n, i) => {
              const colour = verdictColour(n.entry.decision.verdict);
              const r = n.entry.applied ? 4.5 : n.entry.decision.verdict === "block" ? 3.2 : 3.8;
              return (
                <g key={`star-${n.entry.id}`}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r * 3}
                    fill="url(#starGlow)"
                    opacity={0.7}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.7;0.3"
                      dur={`${2 + (i % 4) * 0.4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx={n.x} cy={n.y} r={r} fill={colour}>
                    <animate
                      attributeName="r"
                      values={`${r};${r + 0.6};${r}`}
                      dur={`${1.5 + (i % 3) * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  {n.entry.humanOverride && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r + 3}
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity={0.4}
                      strokeWidth={0.8}
                    />
                  )}
                </g>
              );
            })}
          </svg>
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
