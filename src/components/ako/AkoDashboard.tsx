import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Baby, Shield, FileText, Gauge, FileSearch } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const ACCENT = "#7BA7C7";
const ACCENT_LIGHT = "#A8C8DD";
const POUNAMU = "#3A7D6E";
const INK = "#3D4250";
const MUTED = "#7A8B82";

type EvidencePackRow = {
  id: string;
  action_type: string;
  created_at: string | null;
  watermark: string;
  signed_by: string | null;
};

type GateRow = {
  id: string;
  status: string;
  gate_type: string;
  purpose: string;
  created_at: string;
};

type SweepSnapshot = {
  swept_for: string;
  green_count: number;
  amber_count: number;
  red_count: number;
  readiness_score: number;
  pending_gates: number;
  approved_gates: number;
};

function useAkoEvidence() {
  return useQuery({
    queryKey: ["ako-evidence"],
    queryFn: async (): Promise<EvidencePackRow[]> => {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select("id, action_type, created_at, watermark, signed_by")
        .eq("kete", "AKO")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as EvidencePackRow[];
    },
  });
}

function useAkoGates() {
  return useQuery({
    queryKey: ["ako-gates"],
    queryFn: async (): Promise<GateRow[]> => {
      const { data, error } = await supabase
        .from("governance_gates")
        .select("id, status, gate_type, purpose, created_at")
        .eq("kete", "AKO")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as GateRow[];
    },
  });
}

function useAkoSweep() {
  return useQuery({
    queryKey: ["ako-evidence-sweep"],
    queryFn: async (): Promise<SweepSnapshot | null> => {
      const { data, error } = await supabase
        .from("evidence_sweep_snapshots")
        .select("swept_for, green_count, amber_count, red_count, readiness_score, pending_gates, approved_gates")
        .eq("kete", "AKO")
        .order("swept_for", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SweepSnapshot | null) ?? null;
    },
  });
}

export default function AkoDashboard() {
  const { data: packs = [], isLoading } = useAkoEvidence();
  const { data: gates = [] } = useAkoGates();
  const { data: sweep } = useAkoSweep();

  const pendingGates = gates.filter(g => g.status === "pending").length;
  const approvedGates = gates.filter(g => g.status === "approved" || g.status === "approved_with_conditions").length;

  const readinessData = sweep
    ? [
        { cat: "GREEN", count: sweep.green_count, color: "#3A7D6E" },
        { cat: "AMBER", count: sweep.amber_count, color: "#D9BC7A" },
        { cat: "RED", count: sweep.red_count, color: "#C85A54" },
      ]
    : [
        { cat: "GREEN", count: 0, color: "#3A7D6E" },
        { cat: "AMBER", count: 0, color: "#D9BC7A" },
        { cat: "RED", count: 0, color: "#C85A54" },
      ];

  const sweptForLabel = sweep?.swept_for
    ? new Date(sweep.swept_for).toLocaleDateString("en-NZ", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <KeteDashboardShell
      name="Ako"
      subtitle="Early Childhood Education · Compliance & Transparency"
      accentColor={ACCENT}
      accentLight={ACCENT_LIGHT}
      variant="standard"
    >
      {/* HIGH-RISK banner */}
      <DashboardGlassCard accentColor="#C85A54" className="p-3" glow>
        <p className="text-xs italic" style={{ color: MUTED }}>
          <strong style={{ color: "#C85A54" }}>HIGH-RISK kete.</strong> Ako provides admin & compliance assistance only —
          it never replaces sleep checks, ratio checks, or sight supervision. Every output is sign-off ready, not auto-applied.
        </p>
      </DashboardGlassCard>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Evidence Packs", value: packs.length, icon: FileText, color: ACCENT },
          { label: "Gates Pending", value: pendingGates, icon: Shield, color: "#D9BC7A" },
          { label: "Gates Approved", value: approvedGates, icon: Gauge, color: POUNAMU },
          { label: "Readiness Score", value: sweep ? `${sweep.readiness_score}%` : "—", icon: Baby, color: ACCENT_LIGHT },
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

      {/* Readiness chart */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
            Graduated Enforcement Readiness
          </h3>
          <span className="text-[10px] font-mono" style={{ color: MUTED }}>
            {sweptForLabel ? `Swept ${sweptForLabel}` : "Awaiting first sweep"}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={readinessData} layout="vertical">
            <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
            <YAxis dataKey="cat" type="category" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} width={70} />
            <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11, color: INK }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {readinessData.map(r => <rect key={r.cat} fill={r.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] mt-3 italic" style={{ color: MUTED }}>
          {sweep
            ? `Recalculated daily at 5:30am NZST across the last 90 days of evidence packs and governance gates.`
            : `Daily evidence sweep runs at 5:30am NZST. The first snapshot will appear here once it has run.`}
        </p>
      </DashboardGlassCard>

      {/* Gates list */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>
          Recent Governance Gates
        </h3>
        {gates.length === 0 ? (
          <p className="text-xs italic py-6 text-center" style={{ color: MUTED }}>
            No gates triggered yet — Tā and Mana rules will surface here as they fire on live traffic.
          </p>
        ) : (
          <div className="space-y-2">
            {gates.slice(0, 6).map(g => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div>
                  <p className="text-xs font-medium" style={{ color: INK }}>{g.gate_type}</p>
                  <p className="text-[10px] line-clamp-1" style={{ color: MUTED }}>{g.purpose}</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase" style={{
                  background: g.status === "approved" ? `${POUNAMU}20` : g.status === "pending" ? "#D9BC7A20" : "#C85A5420",
                  color: g.status === "approved" ? POUNAMU : g.status === "pending" ? "#7A5A1F" : "#7A2E2A",
                }}>
                  {g.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </DashboardGlassCard>

      {/* Evidence Pack Panel */}
      <KeteEvidencePackPanel
        keteSlug="ako"
        keteName="Ako — Early Childhood Education"
        accentColor={ACCENT}
        agentId="nova-ako"
        agentName="NOVA-AKO"
        packTemplates={[
          { label: "Transparency Pack", description: "Whānau-facing transparency documents · Education and Training Act 2020", packType: "transparency-pack", complianceChecks: [
            { check: "Complaints procedure — plain English", status: "pass" },
            { check: "ERO report access — current", status: "pass" },
            { check: "Licensing status statement — current", status: "pass" },
            { check: "Operational document summary — current", status: "pass" },
          ]},
          { label: "Readiness Report", description: "Graduated enforcement readiness snapshot", packType: "readiness-report", complianceChecks: [
            { check: "Sleep-check log evidence ≥95%", status: "review" },
            { check: "Ratio snapshots — pick-up + drop-off", status: "review" },
            { check: "Staff register up-to-date", status: "pass" },
          ]},
          { label: "Criteria Match Pack", description: "Centre-specific criteria evidence pack", packType: "criteria-match-pack", complianceChecks: [
            { check: "Licensing criteria mapped to evidence", status: "pass" },
            { check: "Diff-marked changes since last review", status: "pass" },
            { check: "Director of Regulation sign-off ready", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload
        keteSlug="ako"
        keteColor={ACCENT}
        keteName="Ako — Early Childhood Education"
        docContext="Expect ECE policies, sleep-check logs, ratio captures, staff registers, licensing criteria, ERO reports. Flag Education and Training Act 2020 compliance and graduated enforcement readiness."
      />

      <KeteAgentChat
        keteName="Ako"
        keteLabel="Early Childhood"
        accentColor={ACCENT}
        defaultAgentId="nova-ako"
        packId="ako"
        starterPrompts={[
          "Generate today's readiness snapshot",
          "Refresh transparency pack documents",
          "Match licensing criteria against my evidence",
          "Draft a complaints procedure in plain English",
        ]}
      />
    </KeteDashboardShell>
  );
}
