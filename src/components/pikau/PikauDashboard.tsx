import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Ship, FileText, Shield, Package, Globe, AlertTriangle, Check, ArrowRight, Anchor } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import SovereigntyPanel from "@/components/sovereignty/SovereigntyPanel";
import SovereigntySimulator from "@/components/sovereignty/SovereigntySimulator";

const ACCENT = "#7ECFC2";
const ACCENT_LIGHT = "#A8E6DA";
const POUNAMU = "#3A7D6E";

type Shipment = {
  id: string;
  description: string;
  origin: string;
  destination: string;
  hsCode: string;
  value: number;
  status: "draft" | "declared" | "cleared" | "held";
  incoterm: string;
  dangerousGoods: boolean;
};

const DEMO_SHIPMENTS: Shipment[] = [
  { id: "PKU-001", description: "Automotive parts — brake pads", origin: "Yokohama, JP", destination: "Auckland, NZ", hsCode: "8708.30", value: 12400, status: "cleared", incoterm: "CIF", dangerousGoods: false },
  { id: "PKU-002", description: "Wine — Sauvignon Blanc (palletised)", origin: "Marlborough, NZ", destination: "London, UK", hsCode: "2204.21", value: 45000, status: "declared", incoterm: "FOB", dangerousGoods: false },
  { id: "PKU-003", description: "Industrial chemicals — cleaning agents", origin: "Shanghai, CN", destination: "Tauranga, NZ", hsCode: "3402.90", value: 8200, status: "held", incoterm: "DAP", dangerousGoods: true },
  { id: "PKU-004", description: "Timber — radiata pine (rough sawn)", origin: "Rotorua, NZ", destination: "Sydney, AU", hsCode: "4407.10", value: 32000, status: "draft", incoterm: "FOB", dangerousGoods: false },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "#D4A843",
  declared: "#5B8FA8",
  cleared: "#3A7D6E",
  held: "#E55",
};

export default function PikauDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>(DEMO_SHIPMENTS);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const generateCustomsPack = useMutation({
    mutationFn: async (shipment: Shipment) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const pack = {
        type: "customs-declaration-pack",
        shipment_id: shipment.id,
        description: shipment.description,
        route: `${shipment.origin} → ${shipment.destination}`,
        hs_code: shipment.hsCode,
        value_nzd: shipment.value,
        incoterm: shipment.incoterm,
        dangerous_goods: shipment.dangerousGoods,
        compliance_checks: [
          { check: "Customs and Excise Act 2018 — declaration validated", status: "pass" },
          { check: "MPI biosecurity — clearance status checked", status: shipment.dangerousGoods ? "review" : "pass" },
          { check: "Dangerous Goods Act — classification", status: shipment.dangerousGoods ? "flagged" : "n/a" },
          { check: "Privacy Act 2020 — importer data governed", status: "pass" },
          { check: "HS code validation — tariff classification", status: "pass" },
        ],
        estimated_duty: Math.round(shipment.value * 0.05),
        generated_at: new Date().toISOString(),
      };
      await supabase.from("exported_outputs").insert({
        user_id: user.id,
        output_type: "evidence_pack",
        title: `Customs Pack — ${shipment.id}`,
        content_preview: JSON.stringify(pack).slice(0, 500),
        agent_id: "pikau",
        agent_name: "GATEWAY",
      });
      // Update local status
      setShipments(prev => prev.map(s => s.id === shipment.id ? { ...s, status: "declared" as const } : s));
      return pack;
    },
    onSuccess: () => toast.success("Customs declaration pack generated"),
    onError: (e: Error) => toast.error(e.message),
  });

  const clearShipment = (id: string) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status: "cleared" as const } : s));
    toast.success("Shipment marked as cleared");
  };

  const statusData = Object.entries(shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));
  const valueData = shipments.map(s => ({ id: s.id.replace("PKU-", ""), value: s.value / 1000 }));

  return (
    <KeteDashboardShell name="Pikau" subtitle="Freight & Customs Operations" accentColor={ACCENT} accentLight={ACCENT_LIGHT} variant="standard">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Shipments", value: shipments.length, icon: Ship, color: ACCENT },
          { label: "Cleared", value: shipments.filter(s => s.status === "cleared").length, icon: Check, color: POUNAMU },
          { label: "Held", value: shipments.filter(s => s.status === "held").length, icon: AlertTriangle, color: "#E55" },
          { label: "Total Value", value: `$${Math.round(shipments.reduce((s, x) => s + x.value, 0) / 1000)}k`, icon: Globe, color: "#5B8FA8" },
        ].map(m => (
          <DashboardGlassCard key={m.label} accentColor={m.color} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} style={{ color: m.color }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-2xl font-bold text-white/90" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
          </DashboardGlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Shipment Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name }) => name}>
                {statusData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name] || "#666"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </DashboardGlassCard>
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Shipment Values ($k NZD)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={valueData}>
              <XAxis dataKey="id" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardGlassCard>
      </div>

      {/* Shipment Detail */}
      {selectedShipment && (
        <DashboardGlassCard accentColor={POUNAMU} glow className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-white/80 font-medium">{selectedShipment.id} — {selectedShipment.description}</h3>
            <button onClick={() => setSelectedShipment(null)} className="text-xs text-white/40 hover:text-white/60">Close</button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-white/40">Route:</span> <span className="text-white/70">{selectedShipment.origin} → {selectedShipment.destination}</span></div>
            <div><span className="text-white/40">HS Code:</span> <span className="text-white/70 font-mono">{selectedShipment.hsCode}</span></div>
            <div><span className="text-white/40">Value:</span> <span className="text-white/70">${selectedShipment.value.toLocaleString()} NZD</span></div>
            <div><span className="text-white/40">Incoterm:</span> <span className="text-white/70">{selectedShipment.incoterm}</span></div>
            <div><span className="text-white/40">Status:</span> <span style={{ color: STATUS_COLORS[selectedShipment.status] }}>{selectedShipment.status}</span></div>
            <div><span className="text-white/40">DG:</span> <span className={selectedShipment.dangerousGoods ? "text-red-400" : "text-emerald-400"}>{selectedShipment.dangerousGoods ? "Yes — requires review" : "No"}</span></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => generateCustomsPack.mutate(selectedShipment)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium text-white" style={{ background: POUNAMU }}>
              <FileText size={13} /> Generate Declaration Pack
            </button>
            {selectedShipment.status !== "cleared" && (
              <button onClick={() => { clearShipment(selectedShipment.id); setSelectedShipment({ ...selectedShipment, status: "cleared" }); }} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Mark Cleared
              </button>
            )}
          </div>
        </DashboardGlassCard>
      )}

      {/* Shipments List */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Active Shipments</h3>
        <div className="space-y-2">
          {shipments.map(s => (
            <button key={s.id} onClick={() => setSelectedShipment(s)} className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors hover:bg-white/5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                {s.dangerousGoods && <AlertTriangle size={14} className="text-red-400" />}
                <div>
                  <p className="text-sm text-white/80 font-medium">{s.id} — {s.description}</p>
                  <p className="text-[10px] text-white/40">{s.origin} → {s.destination} · HS {s.hsCode} · {s.incoterm}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 font-mono">${(s.value / 1000).toFixed(1)}k</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider" style={{ background: `${STATUS_COLORS[s.status]}20`, color: STATUS_COLORS[s.status] }}>
                  {s.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </DashboardGlassCard>

      {/* Compliance */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Shield size={14} style={{ color: POUNAMU }} /> Border Compliance</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "CEA 2018", desc: "Declarations validated" },
            { label: "MPI Biosecurity", desc: "Clearance tracked" },
            { label: "Dangerous Goods Act", desc: "Classification enforced" },
            { label: "Privacy Act 2020", desc: "Importer data governed" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-lg" style={{ background: `${POUNAMU}08` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium">{c.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
              </div>
              <p className="text-[10px] text-white/35">{c.desc}</p>
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        <SovereigntyPanel kete="pikau" accentColor={ACCENT} />
        <SovereigntySimulator kete="pikau" accentColor={ACCENT} />
      </div>

      <KeteAgentChat keteName="Pikau" keteLabel="Freight & Customs" accentColor={ACCENT} defaultAgentId="gateway" packId="pikau"
        starterPrompts={["Validate an HS code", "Generate a customs declaration", "Check biosecurity requirements", "Calculate landed costs for an import"]} />
    </KeteDashboardShell>
  );
}
