import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, QrCode, AlertOctagon, Clock, CheckCircle2, XCircle, Search } from "lucide-react";

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

export default function SiteCheckinPage() {
  const [search, setSearch] = useState("");
  const [workers, setWorkers] = useState(WORKERS);
  const onSite = workers.filter(w => w.status === "on-site").length;

  const toggleStatus = (id: string) => setWorkers(ws => ws.map(w => w.id === id ? { ...w, status: w.status === "on-site" ? "checked-out" : "on-site" } : w));

  const filtered = workers.filter(w => search === "" || w.name.toLowerCase().includes(search.toLowerCase()) || w.trade.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white">Site Check-in — Tae Mai</h1>
        <p className="text-xs text-white/40">Christchurch Metro Sports Facility</p>
      </motion.div>

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
                <div key={i} className={`w-4 h-4 ${Math.random() > 0.4 ? "bg-black" : "bg-white"}`} />
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
