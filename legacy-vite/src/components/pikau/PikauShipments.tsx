import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Ship, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Shipment {
  id: string;
  shipment_ref: string | null;
  origin: string | null;
  destination: string | null;
  carrier: string | null;
  status: string | null;
  eta: string | null;
  value_nzd: number | null;
}

const STATUS_BG: Record<string, string> = {
  in_transit: "bg-[#C7D9E8]/30 text-[#6F6158]",
  customs_hold: "bg-[#D9BC7A]/20 text-[#6F6158]",
  cleared: "bg-[#C9D8D0]/30 text-[#6F6158]",
  delayed: "bg-red-50 text-red-700",
  draft: "bg-[#EEE7DE] text-[#9D8C7D]",
};

const STATUS_LABEL: Record<string, string> = {
  in_transit: "In transit",
  customs_hold: "Customs hold",
  cleared: "Cleared",
  delayed: "Delayed",
  draft: "Draft",
};

export default function PikauShipments() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ shipment_ref: "", origin: "", destination: "", carrier: "", value_nzd: "", eta: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("shipments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setShipments(data as Shipment[]));
  }, [user]);

  const addShipment = async () => {
    if (!user || !form.shipment_ref.trim()) return;
    const { data, error } = await (supabase as any).from("shipments").insert({
      user_id: user.id,
      shipment_ref: form.shipment_ref,
      origin: form.origin,
      destination: form.destination,
      description: form.shipment_ref,
      carrier: form.carrier,
      value_nzd: form.value_nzd ? parseFloat(form.value_nzd) : null,
      eta: form.eta || null,
      status: "draft",
    }).select().single();
    if (error) return toast.error("Failed to add");
    setShipments((p) => [data as Shipment, ...p]);
    setShowAdd(false);
    setForm({ shipment_ref: "", origin: "", destination: "", carrier: "", value_nzd: "", eta: "" });
    toast.success("Shipment added");
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-20 lg:pt-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ship size={18} className="text-[#B8C7B1]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Freight</span>
          </div>
          <h1 className="font-display text-3xl text-[#6F6158]">Shipments</h1>
          <p className="font-body text-sm text-[#9D8C7D] mt-1">Track inbound and outbound consignments.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
        >
          <Plus size={16} /> Add shipment
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#D8C8B4]/30">
              <tr>
                {["Ref", "Origin", "Destination", "Carrier", "Status", "ETA", "Value"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-mono text-xs uppercase tracking-wider text-[#9D8C7D]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center font-body text-sm text-[#9D8C7D]">No shipments yet.</td></tr>
              ) : shipments.map((s) => (
                <tr key={s.id} className="border-b border-[#EEE7DE] hover:bg-[#F7F3EE]/50">
                  <td className="px-5 py-4 font-mono text-sm text-[#6F6158]">{s.shipment_ref ?? s.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 font-body text-sm text-[#6F6158]">{s.origin ?? "—"}</td>
                  <td className="px-5 py-4 font-body text-sm text-[#6F6158]">{s.destination ?? "—"}</td>
                  <td className="px-5 py-4 font-body text-sm text-[#9D8C7D]">{s.carrier ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BG[s.status ?? "draft"] ?? STATUS_BG.draft}`}>
                      {STATUS_LABEL[s.status ?? "draft"] ?? s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#9D8C7D]">{s.eta ?? "—"}</td>
                  <td className="px-5 py-4 font-mono text-sm text-[#6F6158]">
                    {s.value_nzd ? `$${Number(s.value_nzd).toLocaleString("en-NZ")}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6F6158]/30 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-[#6F6158]">Add shipment</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#9D8C7D]"><X size={18} /></button>
            </div>
            {[
              { k: "shipment_ref", l: "Reference *" },
              { k: "origin", l: "Origin port" },
              { k: "destination", l: "Destination port" },
              { k: "carrier", l: "Carrier" },
              { k: "value_nzd", l: "Value (NZD)" },
              { k: "eta", l: "ETA", type: "date" },
            ].map((f) => (
              <div key={f.k}>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">{f.l}</label>
                <input
                  type={f.type ?? "text"}
                  value={(form as Record<string, string>)[f.k]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
                />
              </div>
            ))}
            <button onClick={addShipment} className="w-full py-2.5 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body font-medium text-sm transition-colors">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
