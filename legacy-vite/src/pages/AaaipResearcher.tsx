// ═══════════════════════════════════════════════════════════════
// AAAIP — Researcher admin view
// Read-only dashboard listing every audit-log export submitted by
// the AAAIP demo dashboard. Designed for AAAIP partners (Gill
// Dobbie, AAAIP investigators) to inspect agent decisions across
// every pilot and every simulation run.
//
// Authenticated reads only — Supabase RLS on aaaip_audit_exports
// blocks anon SELECT. Researchers should be logged in as an
// authenticated user before opening this page.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  FlaskConical,
  Loader2,
  MessagesSquare,
  Shield,
  Stethoscope,
} from "lucide-react";

import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
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
  listAuditExports,
  PILOT_COVERAGE,
  coverageSummary,
  type AuditExportRow,
} from "@/aaaip";

const DOMAIN_LABEL: Record<string, string> = {
  clinic: "Clinic scheduling",
  robot: "Human-robot",
  science: "Drug screening",
  community: "Community portal",
};

const DOMAIN_ICON: Record<string, React.ReactNode> = {
  clinic: <Stethoscope className="h-4 w-4" />,
  robot: <Cpu className="h-4 w-4" />,
  science: <FlaskConical className="h-4 w-4" />,
  community: <MessagesSquare className="h-4 w-4" />,
};

export default function AaaipResearcher() {
  const [rows, setRows] = useState<AuditExportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await listAuditExports({
        domain: filter === "all" ? undefined : filter,
        limit: 100,
      });
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
        setRows([]);
      } else {
        setError(null);
        setRows(result.rows);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const summary = useMemo(() => coverageSummary(), []);

  const totals = useMemo(() => {
    const t = {
      total: rows.length,
      decisions: 0,
      allowed: 0,
      needsHuman: 0,
      blocked: 0,
      applied: 0,
    };
    for (const r of rows) {
      t.decisions += r.total_decisions;
      t.allowed += r.allowed;
      t.needsHuman += r.needs_human;
      t.blocked += r.blocked;
      t.applied += r.applied;
    }
    return t;
  }, [rows]);

  return (
    <LightPageShell>
    <div className="min-h-screen" style={{ background: "transparent", color: "#3D4250" }}>
      <SEO
        title="AAAIP Researcher Console · Assembl"
        description="Read-only researcher view over every audit-log export submitted by the AAAIP demo dashboard."
      />
      <BrandNav />
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.5)" }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5AADA0" }}>
              Aotearoa Agentic AI Platform · Researcher console
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "#F5F0E8" }}>
              Audit-log archive
            </h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: "#6B7280" }}>
              Every audit-log export submitted by the AAAIP demo dashboard,
              across every pilot. Filter by domain, expand a row to see policy
              hits and the full decision list.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/aaaip">
              <ArrowLeft className="mr-1" />
              Back to demo
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* KPI row */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Exports" value={totals.total} icon={<Database className="h-4 w-4" />} />
          <KpiCard label="Total decisions" value={totals.decisions} icon={<Shield className="h-4 w-4" />} />
          <KpiCard label="Pilots wired" value={`${summary.wired}/${summary.total}`} icon={<Stethoscope className="h-4 w-4" />} />
          <KpiCard
            label="Coverage"
            value={`${Math.round(summary.coverageRate * 100)}%`}
            icon={<Shield className="h-4 w-4" />}
          />
        </section>

        <Tabs defaultValue="exports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="coverage">Pilot coverage</TabsTrigger>
          </TabsList>

          <TabsContent value="exports" className="space-y-4">
            <DomainFilter value={filter} onChange={setFilter} />

            {error && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="flex items-start gap-3 pt-6 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">
                      Could not load exports
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      You may need to be signed in as an authenticated user.
                      Anon reads are blocked by RLS on aaaip_audit_exports.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  No audit exports yet. Run a simulation in the{" "}
                  <Link to="/aaaip" className="underline">
                    demo dashboard
                  </Link>{" "}
                  and click "Send to AAAIP" to populate this table.
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {rows.map((row) => (
                <ExportRow
                  key={row.id}
                  row={row}
                  expanded={!!expanded[row.id]}
                  onToggle={() =>
                    setExpanded((e) => ({ ...e, [row.id]: !e[row.id] }))
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pilot ↔ AAAIP policy coverage</CardTitle>
                <CardDescription>
                  Every Assembl production pilot mapped to the AAAIP policy
                  families that should govern it. "Wired" pilots are live
                  inside the AAAIP runtime; "Ready" pilots can plug in with
                  one-day work; "Planned" pilots need new policy files.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PILOT_COVERAGE.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-md border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{p.name}</h3>
                      <Badge
                        variant={
                          p.status === "wired"
                            ? "default"
                            : p.status === "ready"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                      <Badge variant="outline">{p.domain.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.note}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.policies.map((f) => (
                        <Badge key={f} variant="outline">
                          {f.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Module: <code>{p.module}</code>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BrandFooter />
    </div>
    </LightPageShell>
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

function DomainFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { key: "all", label: "All" },
    { key: "clinic", label: "Clinic" },
    { key: "robot", label: "Human-robot" },
    { key: "science", label: "Drug screening" },
    { key: "community", label: "Community" },
  ];
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-md border bg-background p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ExportRow({
  row,
  expanded,
  onToggle,
}: {
  row: AuditExportRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 text-muted-foreground">
            {DOMAIN_ICON[row.domain]}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{DOMAIN_LABEL[row.domain] ?? row.domain}</p>
              <Badge variant="outline">{row.entry_count} decisions</Badge>
              <Badge variant="outline">
                {Math.round((row.compliance_rate ?? 0) * 100)}% compliance
              </Badge>
            </div>
            {row.pilot_label && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {row.pilot_label}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString()} · id {row.id.slice(0, 8)}…
            </p>
          </div>
        </div>
        <span className="text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>
      {expanded && (
        <CardContent className="border-t pt-4">
          <div className="grid gap-3 text-xs sm:grid-cols-4">
            <Stat label="Allowed" value={row.allowed} />
            <Stat label="Needs human" value={row.needs_human} />
            <Stat label="Blocked" value={row.blocked} />
            <Stat label="Applied" value={row.applied} />
          </div>

          {Object.keys(row.policy_hits).length > 0 && (
            <>
              <Separator className="my-4" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Policy hits
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(row.policy_hits).map(([id, count]) => (
                  <Badge key={id} variant="secondary">
                    {id} · {count}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {Array.isArray(row.entries) && row.entries.length > 0 && (
            <>
              <Separator className="my-4" />
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Decision sample (first 10)
              </p>
              <ScrollArea className="mt-2 h-48 rounded border bg-muted/30">
                <pre className="p-3 text-[10px] leading-tight">
                  {JSON.stringify(row.entries.slice(0, 10), null, 2)}
                </pre>
              </ScrollArea>
            </>
          )}
        </CardContent>
      )}
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
