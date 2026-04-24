import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { HardHat, Shield, FileText, AlertTriangle, Layers, CheckCircle } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import { KeteLiveFeedStrip } from "@/components/live-widgets";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const ACCENT = "#3A7D6E";
const ACCENT_LIGHT = "#7ECFC2";
const CLAY = "#CBB8A4";
const INK = "#3D4250";
const MUTED = "#7A8B82";

type ArchRecord = {
  id: string;
  workflow_type: string;
  project_ref: string | null;
  risk_rating: string | null;
  result_summary: string | null;
  created_at: string;
};

type EvidenceRow = {
  id: string;
  action_type: string;
  created_at: string | null;
  watermark: string;
  signed_by: string | null;
};

function useArchitectureRecords() {
  return useQuery({
    queryKey: ["waihanga-architecture-records"],
    queryFn: async (): Promise<ArchRecord[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("architecture_workflow_records")
        .select("id, workflow_type, project_ref, risk_rating, result_summary, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as ArchRecord[];
    },
  });
}

function useWaihangaEvidence() {
  return useQuery({
    queryKey: ["waihanga-evidence"],
    queryFn: async (): Promise<EvidenceRow[]> => {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select("id, action_type, created_at, watermark, signed_by")
        .eq("kete", "WAIHANGA")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as EvidenceRow[];
    },
  });
}

type SweepSnapshot = {
  swept_for: string;
  green_count: number;
  amber_count: number;
  red_count: number;
  readiness_score: number;
  high_risk_records: number;
};

function useWaihangaSweep() {
  return useQuery({
    queryKey: ["waihanga-evidence-sweep"],
    queryFn: async (): Promise<SweepSnapshot | null> => {
      const { data, error } = await supabase
        .from("evidence_sweep_snapshots")
        .select("swept_for, green_count, amber_count, red_count, readiness_score, high_risk_records")
        .eq("kete", "WAIHANGA")
        .order("swept_for", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SweepSnapshot | null) ?? null;
    },
  });
}

export default function WaihangaDashboard() {
  const { data: records = [], isLoading } = useArchitectureRecords();
  const { data: packs = [] } = useWaihangaEvidence();
  const { data: sweep } = useWaihangaSweep();

  // Risk distribution from live records
  const riskCounts = records.reduce((acc, r) => {
    const k = (r.risk_rating ?? "unknown").toLowerCase();
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskData = [
    { rating: "Low", count: riskCounts.low ?? 0, color: ACCENT },
    { rating: "Medium", count: riskCounts.medium ?? 0, color: "#D9BC7A" },
    { rating: "High", count: riskCounts.high ?? 0, color: "#E89484" },
    { rating: "Critical", count: riskCounts.critical ?? 0, color: "#C85A54" },
  ];

  const highRisk = (riskCounts.high ?? 0) + (riskCounts.critical ?? 0);

  // 7-day record activity
  const now = Date.now();
  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const dayStart = now - (6 - i) * 86400000;
    const dayEnd = dayStart + 86400000;
    const count = records.filter(r => {
      const ts = new Date(r.created_at).getTime();
      return ts >= dayStart && ts < dayEnd;
    }).length;
    return {
      d: new Date(dayStart).toLocaleDateString("en-NZ", { weekday: "short" }),
      v: count,
    };
  });

  const sweptForLabel = sweep?.swept_for
    ? new Date(sweep.swept_for).toLocaleDateString("en-NZ", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <KeteDashboardShell
      name="Waihanga"
      subtitle="Construction & Architecture · Building Code, H&S, Evidence"
      accentColor={ACCENT}
      accentLight={ACCENT_LIGHT}
      variant="organic"
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Workflow Records", value: records.length, icon: Layers, color: ACCENT },
          { label: "High-Risk Items", value: highRisk, icon: AlertTriangle, color: "#C85A54" },
          { label: "Evidence Packs", value: packs.length, icon: FileText, color: CLAY },
          {
            label: "Readiness",
            value: sweep ? `${sweep.readiness_score}%` : highRisk === 0 ? "GREEN" : "REVIEW",
            icon: Shield,
            color: sweep && sweep.readiness_score >= 80 ? ACCENT : highRisk === 0 ? ACCENT : "#D9BC7A",
          },
        ].map(m => (
          <DashboardGlassCard key={m.label} accentColor={m.color} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} style={{ color: m.color }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{m.label}</span>
            </div>
            <div className="text-2xl font-light" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
              {isLoading ? "—" : m.value}
            </div>
          </DashboardGlassCard>
        ))}
      </div>

      {/* Daily evidence sweep banner */}
      {sweep && (
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                Daily Evidence Sweep
              </h3>
              <p className="text-[11px] mt-1" style={{ color: INK }}>
                {sweptForLabel} · 90-day window · recalculated automatically at 5:30am NZST
              </p>
            </div>
            <div className="flex gap-3 text-[11px] font-mono" style={{ color: INK }}>
              <span><span style={{ color: ACCENT }}>●</span> Green {sweep.green_count}</span>
              <span><span style={{ color: "#D9BC7A" }}>●</span> Amber {sweep.amber_count}</span>
              <span><span style={{ color: "#C85A54" }}>●</span> Red {sweep.red_count}</span>
            </div>
          </div>
        </DashboardGlassCard>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>
            Risk Profile
          </h3>
          {records.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={riskData}>
                <XAxis dataKey="rating" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11, color: INK }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskData.map(r => <rect key={r.rating} fill={r.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs" style={{ color: MUTED }}>
              No architecture records yet
            </div>
          )}
        </DashboardGlassCard>

        <DashboardGlassCard accentColor={CLAY} className="p-4">
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>
            7-Day Activity
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="waihangaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11, color: INK }} />
              <Area type="monotone" dataKey="v" stroke={ACCENT} fill="url(#waihangaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardGlassCard>
      </div>

      {/* Recent records */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>
          Recent Workflow Records
        </h3>
        {records.length === 0 ? (
          <p className="text-xs italic py-6 text-center" style={{ color: MUTED }}>
            No workflow records yet. Run an APEX safety check, RAWA tender, or ATA BIM audit to begin.
          </p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {records.slice(0, 8).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: INK }}>
                    {r.workflow_type}{r.project_ref ? ` · ${r.project_ref}` : ""}
                  </p>
                  {r.result_summary && (
                    <p className="text-[10px] line-clamp-1" style={{ color: MUTED }}>{r.result_summary}</p>
                  )}
                </div>
                {r.risk_rating && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase ml-2" style={{
                    background: r.risk_rating === "low" ? `${ACCENT}20` : r.risk_rating === "medium" ? "#D9BC7A20" : "#C85A5420",
                    color: r.risk_rating === "low" ? ACCENT : r.risk_rating === "medium" ? "#7A5A1F" : "#7A2E2A",
                  }}>
                    {r.risk_rating}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardGlassCard>

      {/* Compliance grid */}
      <DashboardGlassCard accentColor={CLAY} className="p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider flex items-center gap-2" style={{ color: MUTED }}>
          <Shield size={14} style={{ color: CLAY }} /> Construction Compliance
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "NZ Building Code", desc: "Acceptable solutions cross-referenced" },
            { label: "H&S at Work Act 2015", desc: "Site safety plans tracked" },
            { label: "CCA 2002", desc: "Payment claims & schedules verified" },
            { label: "RMA 1991", desc: "Resource consents documented" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-lg" style={{ background: `${CLAY}15` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: INK }}>{c.label}</span>
                <CheckCircle size={11} style={{ color: ACCENT }} />
              </div>
              <p className="text-[10px]" style={{ color: MUTED }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      {/* Evidence Pack Panel */}
      <KeteEvidencePackPanel
        keteSlug="waihanga"
        keteName="Waihanga — Construction"
        accentColor={ACCENT}
        agentId="apex"
        agentName="APEX"
        packTemplates={[
          { label: "Building Consent Pack", description: "BC evidence with structural, fire, geotech, PS1", packType: "building-consent-pack", complianceChecks: [
            { check: "NZ Building Code clauses cross-referenced", status: "pass" },
            { check: "Producer statements (PS1) attached", status: "pass" },
            { check: "Fire engineering report C/AS7", status: "pass" },
          ]},
          { label: "Resource Consent Pack", description: "RMA s88 RC submission pack", packType: "resource-consent-pack", complianceChecks: [
            { check: "RMA 1991 s88 — AEE complete", status: "pass" },
            { check: "Stormwater management plan", status: "pass" },
            { check: "Cultural impact assessment", status: "review" },
          ]},
          { label: "H&S Site Pack", description: "WorkSafe-ready site safety pack", packType: "hs-site-pack", complianceChecks: [
            { check: "H&S at Work Act 2015 — site plan current", status: "pass" },
            { check: "Site induction register", status: "pass" },
            { check: "Hazard register live", status: "pass" },
          ]},
          { label: "Payment Claim Pack", description: "CCA 2002 compliant payment claim", packType: "payment-claim-pack", complianceChecks: [
            { check: "CCA 2002 — payment claim format", status: "pass" },
            { check: "Schedule of works attached", status: "pass" },
            { check: "Variations cross-referenced", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload
        keteSlug="waihanga"
        keteColor={ACCENT}
        keteName="Waihanga — Construction"
        docContext="Expect architectural drawings, PS1 producer statements, geotech reports, fire engineering reports, BIM models (IFC), site safety plans, payment claims, variations. Flag NZ Building Code, H&S at Work Act 2015, and CCA 2002 compliance."
      />

      <KeteLiveFeedStrip kete="waihanga" />

      <KeteAgentChat
        keteName="Waihanga"
        keteLabel="Construction"
        accentColor={ACCENT}
        defaultAgentId="apex"
        packId="waihanga"
        starterPrompts={[
          "Run an APEX safety check on this site plan",
          "Generate a building consent evidence pack",
          "Review this CCA 2002 payment claim",
          "Audit BIM model against NZBC clauses",
        ]}
      />
    </KeteDashboardShell>
  );
}
