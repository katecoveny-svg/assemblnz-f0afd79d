import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Truck, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const HELM_COLOR = "#3A6A9C";

interface Child { id: string; name: string; school: string | null; }
interface Delivery { id: string; child_id: string | null; item_description: string; status: string; created_at: string; tracking_url: string | null; dropoff_address: string; }

export default function HelmRescue() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [item, setItem] = useState("");
  const [pickup, setPickup] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        setFamilyId(fm.family_id);
        const [kids, dels] = await Promise.all([
          supabase.from("children").select("*").eq("family_id", fm.family_id),
          supabase.from("delivery_requests").select("*").eq("family_id", fm.family_id).order("created_at", { ascending: false }).limit(20),
        ]);
        setChildren(kids.data || []);
        setDeliveries(dels.data || []);
      }
    })();
  }, [user]);

  const submit = async () => {
    if (!familyId || !item.trim() || !pickup.trim()) return;
    const child = children.find(c => c.id === selectedChild);
    setSubmitting(true);
    try {
      const { data } = await supabase.from("delivery_requests").insert({
        family_id: familyId,
        child_id: selectedChild || null,
        item_description: item,
        pickup_address: pickup,
        dropoff_address: child?.school || "School",
        status: "requested",
      }).select().single();
      if (data) setDeliveries([data, ...deliveries]);
      setItem("");
      setPickup("");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: any; color: string; bg: string }> = {
      requested: { icon: Clock, color: "text-[#4AA5A8]", bg: "bg-amber-500/10" },
      picked_up: { icon: Truck, color: "text-blue-400", bg: "bg-[#1A3A5C]/10" },
      delivered: { icon: CheckCircle, color: "text-[#5AADA0]", bg: "bg-[#5AADA0]/10" },
    };
    const s = map[status] || map.requested;
    const Icon = s.icon;
    return <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${s.bg} ${s.color} flex items-center gap-1`}><Icon size={9} />{status}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#FAFBFC" }}>
      <div className="flex items-center gap-2">
        <Truck size={16} style={{ color: HELM_COLOR }} />
        <h2 className="text-sm font-semibold text-white/90">Rescue Delivery</h2>
      </div>

      <div className="rounded-lg p-3" style={{ background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.15)" }}>
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-[#C85A54] mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/60">Forgot something at home? TORO can arrange delivery to school. Currently in demo mode — Uber Direct integration coming soon.</p>
        </div>
      </div>

      {/* New Request */}
      <div className="rounded-lg p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="text-xs font-semibold text-white/70">New Rescue Request</h3>
        {children.length > 0 && (
          <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}
            className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80">
            <option value="">Select child</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.name} — {c.school || "No school set"}</option>)}
          </select>
        )}
        <input value={item} onChange={e => setItem(e.target.value)} placeholder="What was forgotten? e.g. Swimming togs, lunch box"
          className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-gray-300" />
        <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Pickup address (home)"
          className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-gray-300" />
        <button onClick={submit} disabled={submitting || !item.trim() || !pickup.trim()}
          className="w-full py-2 rounded-lg text-xs font-medium transition disabled:opacity-30"
          style={{ background: HELM_COLOR + "20", color: HELM_COLOR, border: `1px solid ${HELM_COLOR}30` }}>
          {submitting ? "Requesting..." : " Request Rescue Delivery"}
        </button>
      </div>

      {/* Delivery History */}
      {deliveries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white/60">Recent Deliveries</h3>
          {deliveries.map(d => (
            <div key={d.id} className="rounded-lg p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex-1">
                <p className="text-xs text-white/80">{d.item_description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">→ {d.dropoff_address}</p>
              </div>
              {statusBadge(d.status)}
              {d.tracking_url && <a href={d.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[10px] underline" style={{ color: HELM_COLOR }}>Track</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
