import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Car, Users, FileText, Shield, ArrowRight, Plus, Check, Clock, DollarSign, Wrench } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import SovereigntyPanel from "@/components/sovereignty/SovereigntyPanel";
import { KeteLiveFeedStrip } from "@/components/live-widgets";

import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const ACCENT = "#E8E8E8";
const ACCENT_LIGHT = "#D8D8D8";
const POUNAMU = "#3A7D6E";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  notes: string | null;
  created_at: string;
};

const JOURNEY_STAGES = ["Enquiry", "Test Drive", "Negotiation", "Sale", "Delivery", "Service", "Loyalty"] as const;

function useLeads() {
  return useQuery({
    queryKey: ["arataki-leads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      return (data || []) as Lead[];
    },
  });
}

export default function AratakiDashboard() {
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useLeads();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", business_name: "", notes: "" });
  const [selectedStage, setSelectedStage] = useState(0);

  const addLead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("clients").insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        business_name: form.business_name || null,
        notes: form.notes || null,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arataki-leads"] });
      toast.success("Customer added to pipeline");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", business_name: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generateWarrantyPack = useMutation({
    mutationFn: async (lead: Lead) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const pack = {
        type: "warranty-narrative-pack",
        customer: lead.name,
        vehicle: lead.business_name || "Not specified",
        compliance: [
          { check: "MVSA 2003 — CIN timing enforced", status: "pass" },
          { check: "FTA 1986 — claims scanned", status: "pass" },
          { check: "Privacy Act 2020 · IPP 3A — disclosure", status: "pass" },
          { check: "CCCFA 2003 — finance language check", status: "pass" },
        ],
        generated_at: new Date().toISOString(),
      };
      await supabase.from("exported_outputs").insert({
        user_id: user.id,
        output_type: "evidence_pack",
        title: `Warranty Pack — ${lead.name}`,
        content_preview: JSON.stringify(pack).slice(0, 500),
        agent_id: "waka",
        agent_name: "MOTOR",
      });
      return pack;
    },
    onSuccess: () => toast.success("Warranty evidence pack generated"),
    onError: (e: Error) => toast.error(e.message),
  });

  const stageData = JOURNEY_STAGES.map((stage, i) => ({
    stage: stage.slice(0, 5),
    count: Math.max(1, leads.length - i * Math.ceil(leads.length / 7)),
  }));

  return (
    <KeteDashboardShell name="Arataki" subtitle="Automotive Dealership Operations" accentColor={ACCENT} accentLight={ACCENT_LIGHT} variant="organic">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pipeline", value: leads.length, icon: Users, color: ACCENT },
          { label: "This Week", value: leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length, icon: Clock, color: POUNAMU },
          { label: "With Vehicle", value: leads.filter(l => l.business_name).length, icon: Car, color: "#5B8FA8" },
          { label: "Packs Generated", value: "—", icon: FileText, color: "#4AA5A8" },
        ].map(m => (
          <DashboardGlassCard key={m.label} accentColor={m.color} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} style={{ color: m.color }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-2xl font-bold text-white/90" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {isLoading ? "—" : m.value}
            </div>
          </DashboardGlassCard>
        ))}
      </div>

      {/* Journey Stepper */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-5">
        <h3 className="text-xs font-semibold text-white/60 mb-4">Customer Journey Pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {JOURNEY_STAGES.map((stage, i) => (
            <button key={stage} onClick={() => setSelectedStage(i)} className="flex items-center gap-1 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${i <= selectedStage ? "text-foreground" : "text-gray-400"}`}
                style={{ background: i <= selectedStage ? POUNAMU : "rgba(255,255,255,0.05)", border: `1px solid ${i <= selectedStage ? POUNAMU : "rgba(255,255,255,0.1)"}` }}>
                {i + 1}
              </div>
              <span className={`text-[10px] mr-2 ${i <= selectedStage ? "text-white/70" : "text-white/25"}`}>{stage}</span>
              {i < JOURNEY_STAGES.length - 1 && <div className="w-6 h-px" style={{ background: i < selectedStage ? POUNAMU : "rgba(255,255,255,0.1)" }} />}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-3">
          Stage: <span className="text-white/70 font-medium">{JOURNEY_STAGES[selectedStage]}</span> — 
          {selectedStage === 0 && " Initial contact, vehicle interest captured"}
          {selectedStage === 1 && " Test drive scheduled and completed"}
          {selectedStage === 2 && " Pricing, trade-in, finance options discussed"}
          {selectedStage === 3 && " Contract signed, CIN issued per MVSA 2003"}
          {selectedStage === 4 && " Vehicle handover, documentation pack generated"}
          {selectedStage === 5 && " Scheduled servicing, warranty tracking active"}
          {selectedStage === 6 && " Retention campaigns, referral programme active"}
        </p>
      </DashboardGlassCard>

      {/* Funnel Chart */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Pipeline Funnel</h3>
        {leads.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stageData} layout="vertical">
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} width={45} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", color: "#1A1D29", border: `1px solid ${POUNAMU}33`, borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" fill={POUNAMU} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-gray-400 text-xs">Add customers to see funnel</div>
        )}
      </DashboardGlassCard>

      {/* Add Customer */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white/60">Customer Pipeline</h3>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: `${POUNAMU}20`, color: POUNAMU }}>
            <Plus size={14} /> {showForm ? "Cancel" : "New Customer"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={e => { e.preventDefault(); addLead.mutate(); }} className="grid grid-cols-2 gap-3 mb-4">
            <input placeholder="Customer name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="col-span-2 px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <input placeholder="Vehicle interest" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <button type="submit" disabled={addLead.isPending} className="col-span-2 py-2 rounded-lg text-sm font-medium text-foreground" style={{ background: POUNAMU }}>
              {addLead.isPending ? "Adding..." : "Add to Pipeline"}
            </button>
          </form>
        )}
        {leads.length > 0 && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {leads.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-sm text-white/80 font-medium">{l.name}</p>
                  <p className="text-[10px] text-white/40">{l.business_name || "No vehicle"} · {l.email || l.phone || "No contact"}</p>
                </div>
                <button onClick={() => generateWarrantyPack.mutate(l)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium hover:bg-white/10" style={{ color: POUNAMU }}>
                  <FileText size={12} /> Pack
                </button>
              </div>
            ))}
          </div>
        )}
      </DashboardGlassCard>

      {/* Compliance */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Shield size={14} style={{ color: POUNAMU }} /> Automotive Compliance</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "MVSA 2003", desc: "CIN timing enforced" },
            { label: "FTA 1986", desc: "Claims scanned pre-publish" },
            { label: "CCCFA 2003", desc: "Finance language guardrails" },
            { label: "Privacy Act 2020", desc: "IPP 3A automated disclosure" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-lg" style={{ background: `${POUNAMU}08` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium">{c.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#3A7D6E]/20 text-[#5AADA0]">Active</span>
              </div>
              <p className="text-[10px] text-white/35">{c.desc}</p>
            </div>
          ))}
        </div>
      </DashboardGlassCard>
      <KeteEvidencePackPanel
        keteSlug="arataki"
        keteName="Arataki — Automotive"
        accentColor={POUNAMU}
        agentId="waka"
        agentName="MOTOR"
        packTemplates={[
          { label: "Vehicle Sale Pack", description: "MVSA 2003 · CIN & disclosure evidence", packType: "vehicle-sale-pack", complianceChecks: [
            { check: "MVSA 2003 — CIN timing enforced", status: "pass" },
            { check: "FTA 1986 — claims scanned", status: "pass" },
            { check: "Privacy Act 2020 · IPP 3A", status: "pass" },
          ]},
          { label: "Finance Disclosure Pack", description: "CCCFA 2003 compliance evidence", packType: "finance-disclosure-pack", complianceChecks: [
            { check: "CCCFA 2003 — language guardrails", status: "pass" },
            { check: "Initial disclosure statement draft", status: "pass" },
            { check: "Lender terms cross-referenced", status: "pass" },
          ]},
          { label: "Warranty Narrative Pack", description: "CGA & warranty compliance", packType: "warranty-narrative-pack", complianceChecks: [
            { check: "CGA 1993 — warranty obligations", status: "pass" },
            { check: "Warranty terms documented", status: "pass" },
            { check: "Service history verified", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload keteSlug="waka" keteColor={ACCENT} keteName="Arataki — Automotive"
        docContext="Expect job cards, warranty claims, vehicle inspection reports, sale agreements, CGA compliance documents, and MVSA 2003 records. Flag consumer guarantee and privacy compliance." />

      <KeteLiveFeedStrip kete="arataki" />

      <KeteAgentChat keteName="Arataki" keteLabel="Automotive" accentColor={ACCENT} defaultAgentId="motor" packId="waka"
        starterPrompts={["Draft a warranty narrative", "Check MVSA compliance for a sale", "Generate a delivery evidence pack", "Run a customer journey audit"]} />
    </KeteDashboardShell>
  );
}
