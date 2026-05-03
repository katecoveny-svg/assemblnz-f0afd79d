import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bus } from "lucide-react";

interface Route { id: string; route_number: string; route_name: string; status: string; delay_minutes: number | null; next_departure: string | null; child_stop: string | null; stops_json: unknown; }
interface Alert { id: string; route_id: string | null; message: string; created_at: string; }

const STATUS_BG: Record<string, string> = {
  on_time: "bg-green-100 text-green-700",
  delayed: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = { on_time: "On time", delayed: "Delayed", cancelled: "Cancelled" };

export default function ToroaTransportPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("transport_routes").select("*").eq("user_id", user.id),
      supabase.from("transport_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]).then(([r, a]) => {
      if (r.data) setRoutes(r.data as Route[]);
      if (a.data) setAlerts(a.data as Alert[]);
    });
  }, [user]);

  const detail = routes.find((r) => r.id === activeRoute);
  const stops = (detail?.stops_json as { name: string; scheduled: string; estimated?: string }[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        <div className="flex items-center gap-2 mb-2">
          <Bus size={20} className="text-[#C7D9E8]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Live status</span>
        </div>
        <h1 className="font-display text-2xl text-[#6F6158] mb-5">Transport</h1>

        <h2 className="font-mono text-xs uppercase tracking-wider text-[#9D8C7D] mb-3">Your routes</h2>
        <div className="flex gap-3 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
          {routes.length === 0 && <div className="text-sm font-body text-[#9D8C7D]">No routes yet.</div>}
          {routes.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoute(r.id === activeRoute ? null : r.id)}
              className={`bg-white rounded-2xl shadow-[0_4px_16px_rgba(111,97,88,0.06)] border p-4 min-w-[200px] text-left transition-all ${
                activeRoute === r.id ? "border-[#C7D9E8]" : "border-[#EEE7DE]"
              }`}
            >
              <div className="font-display text-2xl text-[#6F6158]">#{r.route_number}</div>
              <div className="font-body text-sm text-[#6F6158] mt-1">{r.route_name}</div>
              <div className="font-mono text-xs text-[#9D8C7D] mt-1">Next: {r.next_departure ?? "—"}</div>
              <div className="mt-2">
                <span className={`rounded-full px-3 py-1 text-xs font-body ${STATUS_BG[r.status] ?? STATUS_BG.on_time}`}>
                  {STATUS_LABEL[r.status] ?? r.status}{r.status === "delayed" && r.delay_minutes ? ` ~${r.delay_minutes}m` : ""}
                </span>
              </div>
            </button>
          ))}
        </div>

        {detail && stops.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(111,97,88,0.06)] border border-[#EEE7DE] p-4 mb-6">
            <h3 className="font-body text-sm font-medium text-[#6F6158] mb-3">Route #{detail.route_number} stops</h3>
            <div className="space-y-2">
              {stops.map((stop, i) => {
                const isChild = stop.name === detail.child_stop;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl ${isChild ? "bg-[#C7D9E8]/20 border-l-4 border-[#C7D9E8]" : ""}`}
                  >
                    <div className="font-body text-sm text-[#6F6158]">{stop.name}</div>
                    <div className="font-mono text-xs text-[#9D8C7D]">
                      {stop.scheduled} {stop.estimated && stop.estimated !== stop.scheduled ? `→ ${stop.estimated}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <h2 className="font-mono text-xs uppercase tracking-wider text-[#9D8C7D] mb-3">Recent alerts</h2>
        <div className="space-y-2">
          {alerts.length === 0 && <div className="text-sm font-body text-[#9D8C7D]">No alerts.</div>}
          {alerts.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(111,97,88,0.06)] border border-[#EEE7DE] p-3">
              <div className="font-body text-sm text-[#6F6158]">{a.message}</div>
              <div className="font-mono text-[10px] text-[#9D8C7D] mt-1">{new Date(a.created_at).toLocaleString("en-NZ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
