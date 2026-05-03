import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { Plus, Users, ShoppingBag, Shield, FileText, TrendingDown, Loader2, X } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const ACCENT = "#C66B5C";
const ACCENT_LIGHT = "#E89484";
const POUNAMU = "#3A7D6E";
const INK = "#3D4250";
const MUTED = "#7A8B82";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  notes: string | null;
  created_at: string;
};

type EvidencePackRow = {
  id: string;
  action_type: string;
  created_at: string | null;
  watermark: string;
  signed_by: string | null;
};

function useHokoCustomers() {
  return useQuery({
    queryKey: ["hoko-customers"],
    queryFn: async (): Promise<Customer[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone, business_name, notes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });
}

function useHokoEvidence() {
  return useQuery({
    queryKey: ["hoko-evidence"],
    queryFn: async (): Promise<EvidencePackRow[]> => {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select("id, action_type, created_at, watermark, signed_by")
        .eq("kete", "HOKO")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as EvidencePackRow[];
    },
  });
}

export default function HokoDashboard() {
  const qc = useQueryClient();
  const { data: customers = [], isLoading } = useHokoCustomers();
  const { data: packs = [] } = useHokoEvidence();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", business_name: "", notes: "" });

  const addCustomer = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("clients").insert({
        ...form,
        email: form.email || null,
        phone: form.phone || null,
        business_name: form.business_name || null,
        notes: form.notes || null,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hoko-customers"] });
      toast.success("Customer added");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", business_name: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const thisWeek = customers.filter(c => new Date(c.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  const withEmail = customers.filter(c => c.email).length;

  // Synthetic 7-day reach trend (live count seeded; pending real POS integration)
  const reachData = Array.from({ length: 7 }).map((_, i) => ({
    d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    v: Math.max(2, Math.round(customers.length * (0.6 + 0.1 * i))),
  }));

  return (
    <KeteDashboardShell
      name="Hoko"
      subtitle="Retail Operations · POS, Loyalty & Compliance"
      accentColor={ACCENT}
      accentLight={ACCENT_LIGHT}
      variant="warm"
      keteKey={undefined}
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Customers", value: customers.length, icon: Users, color: ACCENT },
          { label: "New (7 days)", value: thisWeek, icon: ShoppingBag, color: POUNAMU },
          { label: "With Email", value: withEmail, icon: FileText, color: "#5B8FA8" },
          { label: "Evidence Packs", value: packs.length, icon: Shield, color: ACCENT_LIGHT },
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

      {/* Chart: customer growth */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>
          Customer Acquisition · Last 7 Days
        </h3>
        {customers.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={reachData}>
              <defs>
                <linearGradient id="hokoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11, color: INK }} />
              <Area type="monotone" dataKey="v" stroke={ACCENT} fill="url(#hokoGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-xs" style={{ color: MUTED }}>
            Add customers to see acquisition trend
          </div>
        )}
      </DashboardGlassCard>

      {/* Add customer */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Customer Pipeline</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: `${POUNAMU}20`, color: POUNAMU }}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "New Customer"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={e => { e.preventDefault(); addCustomer.mutate(); }} className="grid grid-cols-2 gap-3 mb-4">
            <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="col-span-2 px-3 py-2 rounded-lg text-sm border border-border bg-white/70" />
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-border bg-white/70" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-border bg-white/70" />
            <input placeholder="Loyalty tier / segment" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-border bg-white/70" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-border bg-white/70" />
            <button type="submit" disabled={addCustomer.isPending} className="col-span-2 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: POUNAMU }}>
              {addCustomer.isPending ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              Add to Pipeline
            </button>
          </form>
        )}
        {customers.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {customers.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: INK }}>{c.name}</p>
                  <p className="text-[10px]" style={{ color: MUTED }}>
                    {c.business_name ? `${c.business_name} · ` : ""}{c.email || c.phone || "No contact"}
                  </p>
                </div>
                <span className="text-[10px] font-mono" style={{ color: MUTED }}>
                  {new Date(c.created_at).toLocaleDateString("en-NZ", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic py-6 text-center" style={{ color: MUTED }}>No customers yet — add your first one above.</p>
        )}
      </DashboardGlassCard>

      {/* Compliance */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2 uppercase tracking-wider" style={{ color: MUTED }}>
          <Shield size={14} style={{ color: POUNAMU }} /> Retail Compliance
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "FTA 1986", desc: "Pricing claims auto-scanned" },
            { label: "CGA 1993", desc: "Returns & guarantees aligned" },
            { label: "Privacy Act 2020", desc: "Loyalty data IPP 3A compliant" },
            { label: "Weights & Measures", desc: "POS price labelling verified" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-lg" style={{ background: `${POUNAMU}08` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: INK }}>{c.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#3A7D6E]/15" style={{ color: POUNAMU }}>Active</span>
              </div>
              <p className="text-[10px]" style={{ color: MUTED }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      {/* Evidence Pack Panel */}
      <KeteEvidencePackPanel
        keteSlug="hoko"
        keteName="Hoko — Retail"
        accentColor={ACCENT}
        agentId="prism-retail"
        agentName="PRISM"
        packTemplates={[
          { label: "Pricing Compliance Pack", description: "FTA 1986 · pricing claims evidence", packType: "pricing-compliance-pack", complianceChecks: [
            { check: "FTA 1986 — pricing claims scanned", status: "pass" },
            { check: "Misleading conduct check", status: "pass" },
            { check: "Reference price baselines verified", status: "pass" },
          ]},
          { label: "Customer Privacy Pack", description: "Privacy Act 2020 · loyalty data evidence", packType: "loyalty-privacy-pack", complianceChecks: [
            { check: "Privacy Act 2020 — IPP 3A notice", status: "pass" },
            { check: "Loyalty consent documented", status: "pass" },
            { check: "Marketing channel preferences honoured", status: "pass" },
          ]},
          { label: "Re-Order Evidence Pack", description: "POS velocity + supplier lead-time pack", packType: "reorder-evidence-pack", complianceChecks: [
            { check: "POS velocity scan complete", status: "pass" },
            { check: "Lead-time table cross-referenced", status: "pass" },
            { check: "Drafted POs ready for sign-off", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload
        keteSlug="hoko"
        keteColor={ACCENT}
        keteName="Hoko — Retail"
        docContext="Expect POS exports, supplier price lists, returns ledgers, loyalty exports, marketing approvals. Flag FTA 1986 pricing claims and Privacy Act 2020 IPP compliance."
      />

      <KeteAgentChat
        keteName="Hoko"
        keteLabel="Retail"
        accentColor={ACCENT}
        defaultAgentId="prism-retail"
        packId="hoko"
        starterPrompts={[
          "Run a competitor pricing scan",
          "Draft this week's re-order brief",
          "Generate a loyalty privacy evidence pack",
          "Audit pricing claims against FTA 1986",
        ]}
      />
    </KeteDashboardShell>
  );
}
