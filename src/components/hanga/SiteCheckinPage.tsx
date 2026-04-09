import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, QrCode, AlertOctagon, Clock, CheckCircle2, XCircle, Search, CloudRain, Wind, Thermometer, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAaaipGuard, AaaipGuardBadge } from "@/aaaip";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

interface Worker {
  id: string; name: string; trade: string; company: string; checkInTime: string; status: "on-site" | "checked-out";
}

const WORKERS: Worker[] = [
  { id: "1", name: "Manu Henare", trade: "Foreman", company: "Henare Construction", checkInTime: "06:32", status: "on-site" },
  { id: "2", name: "Tama Ngata", trade: "Civil Engineer", company: "Ngata Civil", checkInTime: "06:45", status: "on-site" },
  { id: "3", name: "Raj Patel", trade: "Electrician", company: "Patel Plumbing & Electrical", checkInTime: "06:50", status: "on-site" },
  { id: "4", name: "Sarah Williams", trade: "Scaffolder", company: "Heights NZ", checkInTime: "07:00", status: "on-site" },
  { id: "5", name: "Keoni Brown", trade: "Crane Operator", company: "LiftCo NZ", checkInTime: "07:10", status: "on-site" },
  { id: "6", name: "Aroha Moana", trade: "H&S Officer", company: "Henare Construction", checkInTime: "06:28", status: "on-site" },
  { id: "7", name: "Dave Thompson", trade: "Plumber", company: "Patel Plumbing & Electrical", checkInTime: "07:15", status: "checked-out" },
  { id: "8", name: "Li Wei Chen", trade: "Structural Steel", company: "SteelPro NZ", checkInTime: "07:20", status: "on-site" },
];

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
    borderColor: "rgba(255,255,255,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  }}>{children}</div>
);

interface SiteConditions {
  current: { temp: number; humidity: number; wind_speed: number; wind_gusts: number; precipitation: number };
  construction_alerts: string[];
  safe_to_work: boolean;
}

export default function SiteCheckinPage() {
  const [search, setSearch] = useState("");
  const [workers, setWorkers] = useState(WORKERS);
  const [siteConditions, setSiteConditions] = useState<SiteConditions | null>(null);
  const [loadingConditions, setLoadingConditions] = useState(true);
  const onSite = workers.filter(w => w.status === "on-site").length;

  // AAAIP policy gate — every check-in runs through the Waihanga
  // ComplianceEngine (PPE, headcount cap, hazard escalation …) before
  // it's applied to local state.
  const guard = useAaaipGuard("waihanga");
  const HEADCOUNT_CAP = 40;

  const toggleStatus = (id: string) => {
    const worker = workers.find((w) => w.id === id);
    if (!worker) return;
    const isCheckingIn = worker.status !== "on-site";

    if (isCheckingIn) {
      // Gate the check-in. We model PPE as confirmed unless the worker's
      // trade hints at scaffolding/crane (high-risk) where we'd expect
      // explicit verification. Real implementations would read this
      // from a QR scan or device pairing.
      const ppeConfirmed = !/scaffold|crane/i.test(worker.trade) || Math.random() > 0.1;
      const decision = guard.check({
        kind: "site_checkin",
        payload: {
          workerId: worker.id,
          zone: "gate",
          ppeConfirmed,
        },
        world: {
          headcount: onSite,
          headcountCap: HEADCOUNT_CAP,
          criticalHazardZones: [],
        },
        rationale: `Check in ${worker.name} (${worker.trade})`,
      });

      if (decision.blocked) {
        toast.error("Check-in blocked", { description: decision.explanation });
        return;
      }
      if (decision.requiresHuman) {
        toast.warning("Supervisor approval needed", {
          description: decision.explanation,
        });
        return;
      }
    }

    setWorkers((ws) =>
      ws.map((w) =>
        w.id === id
          ? {
              ...w,
              status: w.status === "on-site" ? "checked-out" : "on-site",
              checkInTime:
                w.status === "checked-out"
                  ? new Date().toLocaleTimeString("en-NZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Pacific/Auckland",
                    })
                  : w.checkInTime,
            }
          : w,
      ),
    );
    if (isCheckingIn) {
      toast.success("Checked in", {
        description: `${worker.name} cleared by AAAIP Waihanga policies`,
      });
    }
  };

  // Fetch live site conditions from iot-construction
  useEffect(() => {
    async function fetchConditions() {
      try {
        const { data, error } = await supabase.functions.invoke("iot-construction", {
          body: { action: "site_conditions", lat: -43.5321, lon: 172.6362 }, // Christchurch
        });
        if (error) throw error;
        setSiteConditions(data);
      } catch (e) {
        console.error("Failed to fetch site conditions:", e);
      } finally {
        setLoadingConditions(false);
      }
    }
    fetchConditions();
    const interval = setInterval(fetchConditions, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const filtered = workers.filter(w => search === "" || w.name.toLowerCase().includes(search.toLowerCase()) || w.trade.toLowerCase().includes(search.toLowerCase()));

  const handleMuster = () => {
    toast.error("🚨 EMERGENCY MUSTER TRIGGERED — All workers report to Assembly Point A", { duration: 10000 });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-white">Site Check-in — Tae Mai</h1>
          <p className="text-xs text-white/40">Christchurch Metro Sports Facility</p>
        </div>
        <AaaipGuardBadge
          domain="waihanga"
          accentColor={POUNAMU}
          subtitle="Every check-in is policy-gated"
        />
      </motion.div>

      {/* Live Site Conditions */}
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CloudRain size={16} style={{ color: POUNAMU }} />
          <span className="text-sm font-medium text-white/70">Live Site Conditions</span>
          <span className="text-[9px] text-white/25">— from iot-construction</span>
          {loadingConditions && <Loader2 size={12} className="animate-spin text-white/30" />}
        </div>
        {siteConditions ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <Thermometer size={14} style={{ color: KOWHAI }} />
                <div>
                  <div className="text-lg font-bold text-white">{siteConditions.current.temp}°C</div>
                  <div className="text-[10px] text-white/30">Temperature</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind size={14} style={{ color: KOWHAI }} />
                <div>
                  <div className="text-lg font-bold text-white">{siteConditions.current.wind_speed} km/h</div>
                  <div className="text-[10px] text-white/30">Wind (gusts {siteConditions.current.wind_gusts})</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain size={14} style={{ color: KOWHAI }} />
                <div>
                  <div className="text-lg font-bold text-white">{siteConditions.current.precipitation} mm</div>
                  <div className="text-[10px] text-white/30">Precipitation</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${siteConditions.safe_to_work ? "bg-green-500" : "bg-red-500"}`} />
                <div>
                  <div className={`text-sm font-bold ${siteConditions.safe_to_work ? "text-green-400" : "text-red-400"}`}>
                    {siteConditions.safe_to_work ? "Safe to Work" : "Conditions Alert"}
                  </div>
                  <div className="text-[10px] text-white/30">Āhei mahi</div>
                </div>
              </div>
            </div>
            {siteConditions.construction_alerts.length > 0 && (
              <div className="space-y-1">
                {siteConditions.construction_alerts.map((alert, i) => (
                  <div key={i} className="text-[11px] px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    ⚠️ {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !loadingConditions ? (
          <div className="text-xs text-white/30">Unable to load conditions</div>
        ) : null}
      </Glass>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Headcount */}
        <Glass className="p-6 text-center" >
          <Users size={24} style={{ color: POUNAMU }} className="mx-auto mb-3" />
          <div className="text-5xl font-bold text-white">{onSite}</div>
          <div className="text-sm text-white/40 mt-1">Workers On-Site</div>
          <div className="text-[11px] text-white/25 mt-1">Kaimahi i te wāhi</div>
        </Glass>

        {/* QR Code */}
        <Glass className="p-6 text-center">
          <QrCode size={24} style={{ color: KOWHAI }} className="mx-auto mb-3" />
          <div className="w-32 h-32 mx-auto rounded-xl flex items-center justify-center" style={{ background: "#fff" }}>
            <div className="grid grid-cols-5 gap-0.5 p-2">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`w-4 h-4 ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? "bg-black" : "bg-white"}`} />
              ))}
            </div>
          </div>
          <div className="text-[11px] text-white/40 mt-3">Scan to check in</div>
        </Glass>

        {/* Emergency Muster */}
        <Glass className="p-6 flex flex-col items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMuster}
            className="w-full py-6 rounded-2xl text-white font-bold text-lg flex flex-col items-center gap-2"
            style={{ background: "linear-gradient(135deg, #E44D4D, #CC3333)", boxShadow: "0 0 30px rgba(228,77,77,0.3)" }}
          >
            <AlertOctagon size={32} />
            EMERGENCY MUSTER
          </motion.button>
          <span className="text-[10px] text-white/30 mt-2">Ōhorere — triggers all-site alert</span>
        </Glass>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workers..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-white/20" />
      </div>

      {/* Worker Table */}
      <Glass className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {["Name", "Trade", "Company", "Check-in", "Status", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
                  <td className="px-4 py-3 text-xs text-white/70 font-medium">{w.name}</td>
                  <td className="px-4 py-3 text-xs text-white/50">{w.trade}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{w.company}</td>
                  <td className="px-4 py-3 text-xs text-white/50 font-mono">{w.checkInTime}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${w.status === "on-site" ? "bg-green-500/15 text-green-400" : "bg-white/5 text-white/30"}`}>
                      {w.status === "on-site" ? "On-Site" : "Checked Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(w.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${w.status === "on-site" ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"}`}>
                      {w.status === "on-site" ? "Check Out" : "Check In"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}
