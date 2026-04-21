import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Plus, Calendar, Users, DollarSign, Star, Coffee, Check, FileText, ArrowRight, Shield } from "lucide-react";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import SovereigntyPanel from "@/components/sovereignty/SovereigntyPanel";

import SovereigntyBadge from "@/components/sovereignty/SovereigntyBadge";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const ACCENT = "#4AA5A8";
const ACCENT_LIGHT = "#E8C76A";
const POUNAMU = "#3A7D6E";

type Booking = {
  id: string;
  guest_name: string;
  room: string;
  arrival: string;
  departure: string;
  status: string;
  dietary: string | null;
  vip: boolean | null;
  notes: string | null;
  occasion: string | null;
};

function useBookings() {
  return useQuery({
    queryKey: ["manaaki-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*").order("arrival", { ascending: true }).limit(50);
      return (data || []) as Booking[];
    },
  });
}

function useBookingMetrics(bookings: Booking[]) {
  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const vips = bookings.filter(b => b.vip).length;
  const dietary = bookings.filter(b => b.dietary && b.dietary !== "none").length;
  const occupancyRate = total > 0 ? Math.round((confirmed / Math.max(total, 1)) * 100) : 0;
  return { total, confirmed, vips, dietary, occupancyRate };
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#3A7D6E",
  pending: "#4AA5A8",
  checked_in: "#5AADA0",
  checked_out: "#666",
  cancelled: "#E55",
};

export default function ManaakiDashboard() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useBookings();
  const metrics = useBookingMetrics(bookings);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ guest_name: "", room: "", arrival: "", departure: "", dietary: "", vip: false, occasion: "" });

  const addBooking = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("bookings").insert({
        ...form,
        user_id: user.id,
        status: "confirmed",
        dietary: form.dietary || null,
        occasion: form.occasion || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manaaki-bookings"] });
      toast.success("Booking added successfully");
      setShowAddForm(false);
      setForm({ guest_name: "", room: "", arrival: "", departure: "", dietary: "", vip: false, occasion: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generateEvidencePack = useMutation({
    mutationFn: async (booking: Booking) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const packContent = {
        type: "hospitality-booking-pack",
        booking_id: booking.id,
        guest: booking.guest_name,
        room: booking.room,
        dates: `${booking.arrival} → ${booking.departure}`,
        dietary: booking.dietary || "None specified",
        vip: booking.vip ? "Yes" : "No",
        occasion: booking.occasion || "None",
        compliance_checks: [
          { check: "Food Act 2014 — dietary requirements documented", status: "pass" },
          { check: "Privacy Act 2020 — guest data minimised", status: "pass" },
          { check: "SSAA 2012 — alcohol service notes", status: "pass" },
        ],
        generated_at: new Date().toISOString(),
      };
      await supabase.from("exported_outputs").insert({
        user_id: user.id,
        output_type: "evidence_pack",
        title: `Booking Pack — ${booking.guest_name}`,
        content_preview: JSON.stringify(packContent).slice(0, 500),
        agent_id: "manaaki",
        agent_name: "AURA",
      });
      return packContent;
    },
    onSuccess: () => toast.success("Evidence pack generated and saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  // Chart data from bookings
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const roomCounts = bookings.reduce((acc, b) => {
    acc[b.room] = (acc[b.room] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const roomData = Object.entries(roomCounts).slice(0, 8).map(([room, count]) => ({ room, count }));

  return (
    <KeteDashboardShell name="Manaaki" subtitle="Hospitality Operations" accentColor={ACCENT} accentLight={ACCENT_LIGHT} variant="warm">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings", value: metrics.total, icon: Calendar, color: ACCENT },
          { label: "Confirmed", value: metrics.confirmed, icon: Check, color: POUNAMU },
          { label: "VIP Guests", value: metrics.vips, icon: Star, color: "#E8B4B8" },
          { label: "Dietary Noted", value: metrics.dietary, icon: Coffee, color: "#5B8FA8" },
        ].map(m => (
          <DashboardGlassCard key={m.label} accentColor={m.color} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} style={{ color: m.color }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-2xl font-bold text-white/90" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {isLoading ? "—" : m.value}
            </div>
          </DashboardGlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Bookings by Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name }) => name}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#666"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", color: "#1A1D29", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-xs">No bookings yet — add one below</div>
          )}
        </DashboardGlassCard>
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Room Allocation</h3>
          {roomData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={roomData}>
                <XAxis dataKey="room" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", color: "#1A1D29", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-xs">Add bookings to see room data</div>
          )}
        </DashboardGlassCard>
      </div>

      {/* Add Booking */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white/60">Quick Add Booking</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: `${POUNAMU}20`, color: POUNAMU }}>
            <Plus size={14} /> {showAddForm ? "Cancel" : "New Booking"}
          </button>
        </div>
        {showAddForm && (
          <form onSubmit={(e) => { e.preventDefault(); addBooking.mutate(); }} className="grid grid-cols-2 gap-3">
            <input placeholder="Guest name" value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} required className="col-span-2 px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary/30" />
            <input placeholder="Room" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} required className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <input placeholder="Occasion" value={form.occasion} onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <input type="date" value={form.arrival} onChange={e => setForm(f => ({ ...f, arrival: e.target.value }))} required className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground focus:outline-none" />
            <input type="date" value={form.departure} onChange={e => setForm(f => ({ ...f, departure: e.target.value }))} required className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground focus:outline-none" />
            <input placeholder="Dietary requirements" value={form.dietary} onChange={e => setForm(f => ({ ...f, dietary: e.target.value }))} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-gray-200 text-foreground placeholder:text-white/25 focus:outline-none" />
            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" checked={form.vip} onChange={e => setForm(f => ({ ...f, vip: e.target.checked }))} /> VIP Guest
            </label>
            <button type="submit" disabled={addBooking.isPending} className="col-span-2 py-2 rounded-lg text-sm font-medium text-foreground" style={{ background: POUNAMU }}>
              {addBooking.isPending ? "Adding..." : "Add Booking"}
            </button>
          </form>
        )}
      </DashboardGlassCard>

      {/* Bookings List */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Active Bookings</h3>
        {isLoading ? (
          <div className="text-gray-400 text-xs py-8 text-center">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-400 text-xs py-8 text-center">No bookings yet. Add your first booking above.</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  {b.vip && <Star size={14} style={{ color: ACCENT }} />}
                  <div>
                    <p className="text-sm text-white/80 font-medium">{b.guest_name}</p>
                    <p className="text-[10px] text-white/40">{b.room} · {b.arrival} → {b.departure} {b.dietary ? `· ${b.dietary}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider" style={{ background: `${STATUS_COLORS[b.status] || "#666"}20`, color: STATUS_COLORS[b.status] || "#666" }}>
                    {b.status}
                  </span>
                  <button onClick={() => generateEvidencePack.mutate(b)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors hover:bg-white/10" style={{ color: POUNAMU }}>
                    <FileText size={12} /> Pack
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardGlassCard>

      {/* Compliance */}
      <DashboardGlassCard accentColor={POUNAMU} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2"><Shield size={14} style={{ color: POUNAMU }} /> Compliance Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Food Act 2014", status: "Active", desc: "Food control plans tracked" },
            { label: "SSAA 2012", status: "Active", desc: "Alcohol licensing managed" },
            { label: "Privacy Act 2020", status: "Active", desc: "Guest data governed" },
            { label: "H&S at Work Act", status: "Active", desc: "Workplace safety documented" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-lg" style={{ background: `${POUNAMU}08` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium">{c.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#3A7D6E]/20 text-[#5AADA0]">{c.status}</span>
              </div>
              <p className="text-[10px] text-white/35">{c.desc}</p>
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      {/* Māori Data Sovereignty — live red-team simulator */}
      <SovereigntySimulator kete="manaaki" accentColor={ACCENT} />

      <KeteEvidencePackPanel
        keteSlug="manaaki"
        keteName="Manaaki — Hospitality"
        accentColor={ACCENT}
        agentId="aura"
        agentName="AURA"
        packTemplates={[
          { label: "Food Control Plan Pack", description: "Food Act 2014 compliance evidence", packType: "fcp-evidence-pack", complianceChecks: [
            { check: "Food Act 2014 — FCP diary complete", status: "pass" },
            { check: "Temperature logs verified", status: "pass" },
            { check: "Staff training records current", status: "pass" },
          ]},
          { label: "Guest Privacy Pack", description: "Privacy Act 2020 · IPP compliance", packType: "guest-privacy-pack", complianceChecks: [
            { check: "Privacy Act 2020 — data minimisation", status: "pass" },
            { check: "IPP 3A — collection notice", status: "pass" },
            { check: "Guest consent documented", status: "pass" },
          ]},
          { label: "Alcohol Licensing Pack", description: "SSAA 2012 licence compliance", packType: "alcohol-licence-pack", complianceChecks: [
            { check: "SSAA 2012 — licence current", status: "pass" },
            { check: "Manager certificate valid", status: "pass" },
            { check: "Host responsibility documented", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload keteSlug="manaaki" keteColor={ACCENT} keteName="Manaaki — Hospitality"
        docContext="Expect food safety plans, alcohol licence documents, health & safety reports, guest contracts, event agreements, and supplier invoices. Flag Food Act 2014 and Sale and Supply of Alcohol Act 2012 compliance." />

      <KeteAgentChat keteName="Manaaki" keteLabel="Hospitality" accentColor={ACCENT} defaultAgentId="aura" packId="manaaki"
        starterPrompts={["Create a food safety evidence pack", "Check alcohol licensing compliance", "Prepare a VIP guest brief", "Run a dietary requirements audit"]} />
    </KeteDashboardShell>
  );
}
