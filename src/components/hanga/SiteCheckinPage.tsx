import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, QrCode, AlertOctagon, Clock, CheckCircle2, XCircle, Search, CloudRain, Wind, Thermometer, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAaaipGuard, AaaipGuardBadge } from "@/aaaip";

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
  <div className={`rounded-2xl border border-white/[0.06] backdrop-blur-xl ${className}`} style={{
    background: "linear-gradient(135deg, hsl(var(--card) / 0.85), hsl(var(--card) / 0.65))",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
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

  const guard = useAaaipGuard("waihanga");
  const HEADCOUNT_CAP = 40;

  const toggleStatus = (id: string) => {
    const worker = workers.find((w) => w.id === id);
    if (!worker) return;
    const isCheckingIn = worker.status !== "on-site";

    if (isCheckingIn) {
      const ppeConfirmed = !/scaffold|crane/i.test(worker.trade) || Math.random() > 0.1;
      const decision = guard.check({
        kind: "site_checkin",
        payload: { workerId: worker.id, zone: "gate", ppeConfirmed },
        world: { headcount: onSite, headcountCap: HEADCOUNT_CAP, criticalHazardZones: [] },
        rationale: `Check in ${worker.name} (${worker.trade})`,
      });

      if (decision.blocked) {
        toast.error("Check-in blocked", { description: decision.explanation });
        return;
      }
      if (decision.requiresHuman) {
        toast.warning("Supervisor approval needed", { description: decision.explanation });
        return;
      }
    }

    setWorkers((ws) =>
      ws.map((w) =>
        w.id === id
          ? {
              ...w,
              status: w.status === "on-site" ? "checked-out" : "on-site",
              checkInTime: w.status === "checked-out"
                ? new Date().toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Pacific/Auckland" })
                : w.checkInTime,
            }
          : w,
      ),
    );
    if (isCheckingIn) {
      toast.success("Checked in", { description: `${worker.name} cleared by AAAIP Waihanga policies` });
    }
  };

  useEffect(() => {
    async function fetchConditions() {
      try {
        const { data, error } = await supabase.functions.invoke("iot-construction", {
          body: { action: "site_conditions", lat: -43.5321, lon: 172.6362 },
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
    const interval = setInterval(fetchConditions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = workers.filter(w =>
    search === "" || w.name.toLowerCase().includes(search.toLowerCase()) || w.trade.toLowerCase().includes(search.toLowerCase())
  );

  const handleMuster = () => {
    toast.error("🚨 EMERGENCY MUSTER TRIGGERED — All workers report to Assembly Point A", { duration: 10000 });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
            Site Check-in — <span className="text-pounamu">Tae Mai</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Christchurch Metro Sports Facility</p>
        </div>
        <AaaipGuardBadge domain="waihanga" accentColor="hsl(var(--pounamu))" subtitle="Every check-in is policy-gated" />
      </motion.div>

      {/* Live Site Conditions */}
      <Glass className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <CloudRain size={16} className="text-pounamu" />
          <span className="text-sm font-medium text-foreground/70">Live Site Conditions</span>
          <span className="text-[9px] text-muted-foreground">— from iot-construction</span>
          {loadingConditions && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
        </div>
        {siteConditions ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <ConditionCard icon={<Thermometer size={14} className="text-kowhai" />} value={`${siteConditions.current.temp}°C`} label="Temperature" />
              <ConditionCard icon={<Wind size={14} className="text-kowhai" />} value={`${siteConditions.current.wind_speed} km/h`} label={`Wind (gusts ${siteConditions.current.wind_gusts})`} />
              <ConditionCard icon={<CloudRain size={14} className="text-kowhai" />} value={`${siteConditions.current.precipitation} mm`} label="Precipitation" />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full shrink-0 ${siteConditions.safe_to_work ? "bg-pounamu" : "bg-destructive"}`} />
                <div>
                  <div className={`text-sm font-bold ${siteConditions.safe_to_work ? "text-pounamu" : "text-destructive"}`}>
                    {siteConditions.safe_to_work ? "Āhei Mahi" : "Conditions Alert"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{siteConditions.safe_to_work ? "Safe to work" : "Āhei mahi"}</div>
                </div>
              </div>
            </div>
            {siteConditions.construction_alerts.length > 0 && (
              <div className="space-y-1.5">
                {siteConditions.construction_alerts.map((alert, i) => (
                  <div key={i} className="text-[11px] px-3 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                    ⚠️ {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !loadingConditions ? (
          <div className="text-xs text-muted-foreground">Unable to load conditions</div>
        ) : null}
      </Glass>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Headcount */}
        <Glass className="p-5 sm:p-6 text-center">
          <Users size={24} className="text-pounamu mx-auto mb-3" />
          <div className="text-5xl font-display font-bold text-foreground">{onSite}</div>
          <div className="text-sm text-muted-foreground mt-1">Workers On-Site</div>
          <div className="text-[11px] text-muted-foreground/50 mt-0.5 italic">Kaimahi i te wāhi</div>
        </Glass>

        {/* QR Code */}
        <Glass className="p-5 sm:p-6 text-center">
          <QrCode size={24} className="text-kowhai mx-auto mb-3" />
          <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-xl flex items-center justify-center bg-white">
            <div className="grid grid-cols-5 gap-0.5 p-2">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[1px] ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? "bg-[#F5F5F7]" : "bg-white"}`} />
              ))}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-3">Scan to check in</div>
        </Glass>

        {/* Emergency Muster */}
        <Glass className="p-5 sm:p-6 flex flex-col items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMuster}
            className="w-full py-5 sm:py-6 rounded-2xl text-foreground font-display font-bold text-base sm:text-lg flex flex-col items-center gap-2 bg-destructive hover:bg-destructive/90 transition-colors"
            style={{ boxShadow: "0 0 30px hsl(var(--destructive) / 0.3)" }}
          >
            <AlertOctagon size={28} />
            EMERGENCY MUSTER
          </motion.button>
          <span className="text-[10px] text-muted-foreground mt-2">Ōhorere — triggers all-site alert</span>
        </Glass>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search workers..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-foreground bg-card/40 border border-border focus:outline-none focus:border-pounamu/50 focus:ring-1 focus:ring-pounamu/20 placeholder:text-muted-foreground transition-all"
        />
      </div>

      {/* Worker Table */}
      <Glass className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Trade", "Company", "Check-in", "Status", "Action"].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-3 text-[11px] font-display font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-3 sm:px-4 py-3 text-xs text-foreground/80 font-medium">{w.name}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-foreground/60">{w.trade}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground">{w.company}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-foreground/60 font-mono">{w.checkInTime}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      w.status === "on-site"
                        ? "bg-pounamu/15 text-pounamu"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {w.status === "on-site" ? "On-Site" : "Checked Out"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <button
                      onClick={() => toggleStatus(w.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        w.status === "on-site"
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-pounamu/10 text-pounamu hover:bg-pounamu/20"
                      }`}
                    >
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

function ConditionCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="text-base sm:text-lg font-bold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
