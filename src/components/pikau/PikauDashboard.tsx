import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Ship, FileText, Shield, Globe, AlertTriangle, Check, Plus, X, Loader2 } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import SovereigntySimulator from "@/components/sovereignty/SovereigntySimulator";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";
import { LiquidPanel, LiquidButton, GlowBadge } from "@/components/marama";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";

const ACCENT = "#5AADA0";
const ACCENT_LIGHT = "#A8E6DA";
const POUNAMU = "#1F4D47";
const INK = "#0F2A26";
const MUTED = "#7A8B82";
const PEARL_BG = "rgba(250,246,239,0.55)";
const PEARL_INPUT = "rgba(255,255,255,0.7)";
const OPAL_BORDER = "rgba(31,77,71,0.12)";

const STATUS_COLORS: Record<string, string> = {
  draft: "#4AA5A8",
  declared: "#5B8FA8",
  cleared: "#1F4D47",
  held: "#C85A54",
};

const INCOTERMS = ["EXW","FCA","CPT","CIP","DAP","DPU","DDP","FAS","FOB","CFR","CIF"];

function useShipments() {
  return useQuery({
    queryKey: ["pikau-shipments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });
}

const inputClass =
  "rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none";
const inputStyle: React.CSSProperties = {
  background: PEARL_INPUT,
  border: `1px solid ${OPAL_BORDER}`,
  color: INK,
  fontFamily: "'Inter', sans-serif",
};

export default function PikauDashboard() {
  const queryClient = useQueryClient();
  const { data: shipments = [], isLoading } = useShipments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "", origin: "", destination: "", hs_code: "", value_nzd: "",
    incoterm: "FOB", dangerous_goods: false, carrier: "", tracking_code: "",
    broker_code: "", country_of_origin: "", notes: "",
  });

  const selectedShipment = shipments.find(s => s.id === selectedId);

  const addShipment = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("shipments").insert({
        user_id: user.id,
        description: form.description,
        origin: form.origin,
        destination: form.destination,
        hs_code: form.hs_code || null,
        value_nzd: form.value_nzd ? parseFloat(form.value_nzd) : 0,
        incoterm: form.incoterm || null,
        dangerous_goods: form.dangerous_goods,
        carrier: form.carrier || null,
        tracking_code: form.tracking_code || null,
        broker_code: form.broker_code || null,
        country_of_origin: form.country_of_origin || null,
        notes: form.notes || null,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pikau-shipments"] });
      toast.success("Shipment created");
      setShowForm(false);
      setForm({ description: "", origin: "", destination: "", hs_code: "", value_nzd: "", incoterm: "FOB", dangerous_goods: false, carrier: "", tracking_code: "", broker_code: "", country_of_origin: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("shipments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pikau-shipments"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generateCustomsPack = useMutation({
    mutationFn: async (shipment: typeof shipments[0]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const pack = {
        type: "customs-declaration-pack",
        shipment_id: shipment.id,
        description: shipment.description,
        route: `${shipment.origin} → ${shipment.destination}`,
        hs_code: shipment.hs_code,
        value_nzd: shipment.value_nzd,
        incoterm: shipment.incoterm,
        dangerous_goods: shipment.dangerous_goods,
        compliance_checks: [
          { check: "Customs and Excise Act 2018 — declaration validated", status: "pass" },
          { check: "MPI biosecurity — clearance status checked", status: shipment.dangerous_goods ? "review" : "pass" },
          { check: "Dangerous Goods Act — classification", status: shipment.dangerous_goods ? "flagged" : "n/a" },
          { check: "Privacy Act 2020 — importer data governed", status: "pass" },
          { check: "HS code validation — tariff classification", status: "pass" },
        ],
        estimated_duty: Math.round(Number(shipment.value_nzd || 0) * 0.05),
        generated_at: new Date().toISOString(),
      };
      await supabase.from("exported_outputs").insert({
        user_id: user.id,
        output_type: "evidence_pack",
        title: `Customs Pack — ${shipment.description}`,
        content_preview: JSON.stringify(pack).slice(0, 500),
        agent_id: "pikau",
        agent_name: "GATEWAY",
      });
      await supabase.from("shipments").update({ status: "declared" }).eq("id", shipment.id);
      return pack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pikau-shipments"] });
      toast.success("Customs declaration pack generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusData = Object.entries(
    shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const valueData = shipments.slice(0, 8).map((s, i) => ({
    id: `#${i + 1}`,
    value: Number(s.value_nzd || 0) / 1000,
  }));

  return (
    <KeteDashboardShell name="Pikau" subtitle="Freight & Customs Operations" accentColor={ACCENT} accentLight={ACCENT_LIGHT} variant="standard">
      {/* Metrics — Mārama Liquid 3D */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Shipments", value: shipments.length, icon: Ship, accent: ACCENT, tone: "teal" as const },
          { label: "Cleared", value: shipments.filter(s => s.status === "cleared").length, icon: Check, accent: POUNAMU, tone: "success" as const },
          { label: "Held", value: shipments.filter(s => s.status === "held").length, icon: AlertTriangle, accent: "#C85A54", tone: "error" as const },
          { label: "Total Value", value: `$${Math.round(shipments.reduce((s, x) => s + Number(x.value_nzd || 0), 0) / 1000)}k`, icon: Globe, accent: "#5A7A9C", tone: "info" as const },
        ].map((m, i) => (
          <LiquidPanel key={m.label} accent={m.accent} delay={i * 0.06} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                style={{
                  background: `linear-gradient(145deg, ${m.accent}22, ${m.accent}0d)`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px ${m.accent}33`,
                }}
              >
                <m.icon size={16} style={{ color: m.accent }} />
              </div>
              <GlowBadge tone={m.tone} size="sm">{m.label}</GlowBadge>
            </div>
            <div
              className="text-3xl font-light tracking-tight"
              style={{ color: INK, fontFamily: "'Cormorant Garamond', serif" }}
            >
              {m.value}
            </div>
          </LiquidPanel>
        ))}
      </div>

      {/* Add Shipment */}
      <div className="flex justify-end">
        <LiquidButton
          variant={showForm ? "ghost" : "teal"}
          size="md"
          icon={showForm ? <X size={14} /> : <Plus size={14} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "New Shipment"}
        </LiquidButton>
      </div>

      {showForm && (
        <DashboardGlassCard accentColor={ACCENT} glow className="p-5">
          <h3 className="text-sm font-medium mb-4" style={{ color: INK, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
            New Shipment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="Origin *" value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="Destination *" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="HS Code (e.g. 8708.30)" value={form.hs_code} onChange={e => setForm(f => ({ ...f, hs_code: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="Value (NZD)" type="number" value={form.value_nzd} onChange={e => setForm(f => ({ ...f, value_nzd: e.target.value }))} className={inputClass} style={inputStyle} />
            <select value={form.incoterm} onChange={e => setForm(f => ({ ...f, incoterm: e.target.value }))} className={inputClass} style={inputStyle}>
              {INCOTERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Carrier" value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="Tracking Code" value={form.tracking_code} onChange={e => setForm(f => ({ ...f, tracking_code: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="Broker Code" value={form.broker_code} onChange={e => setForm(f => ({ ...f, broker_code: e.target.value }))} className={inputClass} style={inputStyle} />
            <input placeholder="Country of Origin (ISO2)" value={form.country_of_origin} onChange={e => setForm(f => ({ ...f, country_of_origin: e.target.value }))} className={inputClass} style={inputStyle} />
            <label className="flex items-center gap-2 text-sm col-span-full" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              <input
                type="checkbox"
                checked={form.dangerous_goods}
                onChange={e => setForm(f => ({ ...f, dangerous_goods: e.target.checked }))}
                style={{ accentColor: "#C85A54" }}
              />
              Contains Dangerous Goods
            </label>
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputClass} col-span-full`} style={inputStyle} rows={2} />
          </div>
          <button
            onClick={() => addShipment.mutate()}
            disabled={!form.description || !form.origin || !form.destination || addShipment.isPending}
            className="mt-4 flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-shadow hover:shadow-md"
            style={{ background: POUNAMU, color: "#FAF6EF", fontFamily: "'Inter', sans-serif" }}
          >
            {addShipment.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create Shipment
          </button>
        </DashboardGlassCard>
      )}

      {/* Charts */}
      {shipments.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardGlassCard accentColor={ACCENT} className="p-4">
            <h3 className="text-xs font-semibold mb-3" style={{ color: MUTED, fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Shipment Status
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name }) => name}>
                  {statusData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name] || "#7A8B82"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(250,246,239,0.98)", color: INK, border: `1px solid ${OPAL_BORDER}`, borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </DashboardGlassCard>
          <DashboardGlassCard accentColor={ACCENT} className="p-4">
            <h3 className="text-xs font-semibold mb-3" style={{ color: MUTED, fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Shipment Values ($k NZD)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={valueData}>
                <XAxis dataKey="id" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(250,246,239,0.98)", color: INK, border: `1px solid ${OPAL_BORDER}`, borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardGlassCard>
        </div>
      )}

      {/* Shipment Detail */}
      {selectedShipment && (
        <DashboardGlassCard accentColor={POUNAMU} glow className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium" style={{ color: INK, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
              {selectedShipment.description}
            </h3>
            <button onClick={() => setSelectedId(null)} className="text-xs transition-colors" style={{ color: MUTED }}>
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div><span style={{ color: MUTED }}>Route:</span> <span style={{ color: INK }}>{selectedShipment.origin} → {selectedShipment.destination}</span></div>
            <div><span style={{ color: MUTED }}>HS Code:</span> <span className="font-mono" style={{ color: INK }}>{selectedShipment.hs_code || "—"}</span></div>
            <div><span style={{ color: MUTED }}>Value:</span> <span style={{ color: INK }}>${Number(selectedShipment.value_nzd || 0).toLocaleString()} NZD</span></div>
            <div><span style={{ color: MUTED }}>Incoterm:</span> <span style={{ color: INK }}>{selectedShipment.incoterm || "—"}</span></div>
            <div><span style={{ color: MUTED }}>Status:</span> <span style={{ color: STATUS_COLORS[selectedShipment.status] }}>{selectedShipment.status}</span></div>
            <div><span style={{ color: MUTED }}>DG:</span> <span style={{ color: selectedShipment.dangerous_goods ? "#C85A54" : POUNAMU }}>{selectedShipment.dangerous_goods ? "Yes — requires review" : "No"}</span></div>
            {selectedShipment.carrier && <div><span style={{ color: MUTED }}>Carrier:</span> <span style={{ color: INK }}>{selectedShipment.carrier}</span></div>}
            {selectedShipment.tracking_code && <div><span style={{ color: MUTED }}>Tracking:</span> <span className="font-mono" style={{ color: INK }}>{selectedShipment.tracking_code}</span></div>}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => generateCustomsPack.mutate(selectedShipment)}
              disabled={generateCustomsPack.isPending}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-shadow hover:shadow-md"
              style={{ background: POUNAMU, color: "#FAF6EF", fontFamily: "'Inter', sans-serif" }}
            >
              {generateCustomsPack.isPending ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />} Generate Declaration Pack
            </button>
            {selectedShipment.status !== "cleared" && (
              <button
                onClick={() => updateStatus.mutate({ id: selectedShipment.id, status: "cleared" })}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ background: PEARL_BG, color: INK, border: `1px solid ${OPAL_BORDER}`, fontFamily: "'Inter', sans-serif" }}
              >
                Mark Cleared
              </button>
            )}
          </div>
        </DashboardGlassCard>
      )}

      {/* Shipments List */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold mb-3" style={{ color: MUTED, fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {isLoading ? "Loading shipments…" : shipments.length === 0 ? "No shipments yet — create your first one above" : "Active Shipments"}
        </h3>
        <div className="space-y-2">
          {shipments.map(s => {
            const isSelected = selectedId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors"
                style={{
                  background: isSelected ? `${ACCENT}12` : PEARL_BG,
                  border: `1px solid ${isSelected ? ACCENT + "40" : OPAL_BORDER}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {s.dangerous_goods && <AlertTriangle size={14} style={{ color: "#C85A54" }} />}
                  <div>
                    <p className="text-sm font-medium" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{s.description}</p>
                    <p className="text-[10px]" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
                      {s.origin} → {s.destination} {s.hs_code ? `· HS ${s.hs_code}` : ""} {s.incoterm ? `· ${s.incoterm}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: MUTED }}>${(Number(s.value_nzd || 0) / 1000).toFixed(1)}k</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider"
                    style={{ background: `${STATUS_COLORS[s.status] || "#7A8B82"}22`, color: STATUS_COLORS[s.status] || "#7A8B82" }}
                  >
                    {s.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </DashboardGlassCard>

      {/* Compliance */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: MUTED, fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <Shield size={14} style={{ color: POUNAMU }} /> Border Compliance
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "CEA 2018", desc: "Declarations validated" },
            { label: "MPI Biosecurity", desc: "Clearance tracked" },
            { label: "Dangerous Goods Act", desc: "Classification enforced" },
            { label: "Privacy Act 2020", desc: "Importer data governed" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-lg" style={{ background: `${POUNAMU}0c`, border: `1px solid ${POUNAMU}1f` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{c.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${POUNAMU}22`, color: POUNAMU }}>Active</span>
              </div>
              <p className="text-[10px]" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      <SovereigntySimulator kete="pikau" accentColor={ACCENT} />

      <KeteEvidencePackPanel
        keteSlug="pikau"
        keteName="Pikau — Freight & Customs"
        accentColor={ACCENT}
        agentId="gateway"
        agentName="GATEWAY"
        packTemplates={[
          { label: "Customs Declaration Pack", description: "CEA 2018 · declaration evidence", packType: "customs-declaration-pack", complianceChecks: [
            { check: "CEA 2018 — declaration validated", status: "pass" },
            { check: "HS code classification verified", status: "pass" },
            { check: "Duty/GST calculation documented", status: "pass" },
          ]},
          { label: "Biosecurity Clearance Pack", description: "MPI biosecurity compliance", packType: "biosecurity-clearance-pack", complianceChecks: [
            { check: "Biosecurity Act 1993 — clearance", status: "pass" },
            { check: "MPI import health standards", status: "pass" },
            { check: "Treatment certificates verified", status: "pass" },
          ]},
          { label: "Trade Compliance Pack", description: "Full import/export compliance trail", packType: "trade-compliance-pack", complianceChecks: [
            { check: "Sanctions screening complete", status: "pass" },
            { check: "Country of origin documented", status: "pass" },
            { check: "Incoterms verified", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload keteSlug="pikau" keteColor={ACCENT} keteName="Pikau — Freight & Customs"
        docContext="Expect customs declarations, commercial invoices, bills of lading, packing lists, certificates of origin, biosecurity certificates, and HS code schedules. Flag NZ Customs compliance issues." />

      <KeteAgentChat keteName="Pikau" keteLabel="Freight & Customs" accentColor={ACCENT} defaultAgentId="gateway" packId="pikau"
        starterPrompts={["Validate an HS code", "Generate a customs declaration", "Check biosecurity requirements", "Calculate landed costs for an import"]} />
    </KeteDashboardShell>
  );
}
