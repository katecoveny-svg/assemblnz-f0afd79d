/**
 * NZ Locale Features — Geothermal Zone, Holiday Surcharge,
 * Currency Converter, Te Reo Dual-Language Toggle
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain, Calendar, DollarSign, Languages,
  ChevronDown, AlertTriangle, Sun, Thermometer,
  CheckCircle2, Info,
} from "lucide-react";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const GOLD = "#4AA5A8";
const POUNAMU = "#00A86B";

// ── Seismic Zone Selector ──────────────────────────────────────────────────
const SEISMIC_ZONES: Record<string, { risk: string; color: string; note: string }> = {
  "Auckland": { risk: "Low", color: POUNAMU, note: "Volcanic field — low seismic, monitor volcanic activity" },
  "Hamilton": { risk: "Low", color: POUNAMU, note: "Stable Waikato basin" },
  "Wellington": { risk: "High", color: "#C85A54", note: "Active fault lines — prioritise Resilience & Safety Standards" },
  "Christchurch": { risk: "High", color: "#C85A54", note: "Post-earthquake rebuild zone — enhanced foundation specs" },
  "Queenstown": { risk: "Moderate", color: GOLD, note: "Alpine Fault proximity — geotechnical assessment required" },
  "Rotorua": { risk: "Moderate-Geothermal", color: "#E879F9", note: "Active geothermal zone — ground stability testing mandatory" },
  "Napier": { risk: "High", color: "#C85A54", note: "Hawke's Bay seismic zone — earthquake-resistant design priority" },
  "Tauranga": { risk: "Moderate", color: GOLD, note: "Volcanic plateau edge — standard NZS 1170.5 compliance" },
  "Dunedin": { risk: "Low-Moderate", color: POUNAMU, note: "Stable geology — standard building code compliance" },
};

export function SeismicZoneToggle({ onZoneSelect }: { onZoneSelect?: (zone: string, data: typeof SEISMIC_ZONES[string]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl p-4 space-y-3" style={GLASS}>
      <div className="flex items-center gap-2">
        <Mountain className="w-4 h-4 text-[#E879F9]" />
        <span className="text-sm font-medium">Geothermal / Seismic Zone</span>
      </div>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left"
        style={GLASS}>
        <span className={selected ? "text-foreground" : "text-white/40"}>
          {selected || "Select region…"}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="space-y-1 overflow-hidden">
            {Object.entries(SEISMIC_ZONES).map(([zone, data]) => (
              <button key={zone} onClick={() => { setSelected(zone); setOpen(false); onZoneSelect?.(zone, data); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-left">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: data.color }} />
                <span className="flex-1">{zone}</span>
                <span className="text-xs text-white/40">{data.risk}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {selected && SEISMIC_ZONES[selected] && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/5">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: SEISMIC_ZONES[selected].color }} />
          <p className="text-xs text-white/60">{SEISMIC_ZONES[selected].note}</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Holiday Surcharge Toggle ───────────────────────────────────────────────
const NZ_HOLIDAYS_2026 = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-02", name: "Day after New Year's Day" },
  { date: "2026-02-06", name: "Waitangi Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-04-27", name: "ANZAC Day (observed)" },
  { date: "2026-06-01", name: "King's Birthday" },
  { date: "2026-06-26", name: "Matariki" },
  { date: "2026-10-26", name: "Labour Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day (observed)" },
];

export function HolidaySurchargeToggle({ onToggle }: { onToggle?: (enabled: boolean, surchargePercent: number) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [percent, setPercent] = useState(15);

  const today = new Date().toISOString().split("T")[0];
  const nextHoliday = NZ_HOLIDAYS_2026.find((h) => h.date >= today);
  const isHolidayToday = NZ_HOLIDAYS_2026.some((h) => h.date === today);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    onToggle?.(next, percent);
  };

  return (
    <div className="rounded-xl p-4 space-y-3" style={GLASS}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-sm font-medium">Public Holiday Surcharge</span>
        </div>
        <button onClick={toggle}
          className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? "bg-[#00A86B]" : "bg-white/10"}`}>
          <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </div>
      {enabled && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Surcharge:</span>
            <input type="range" min="5" max="25" value={percent}
              onChange={(e) => { setPercent(Number(e.target.value)); onToggle?.(true, Number(e.target.value)); }}
              className="flex-1 accent-[#4AA5A8]" />
            <span className="text-sm font-bold" style={{ color: GOLD }}>{percent}%</span>
          </div>
        </motion.div>
      )}
      {nextHoliday && (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Info className="w-3 h-3" />
          {isHolidayToday
            ? <span className="text-[#4AA5A8]">Today is {nextHoliday.name} — surcharge active</span>
            : <span>Next: {nextHoliday.name} ({new Date(nextHoliday.date).toLocaleDateString("en-NZ")})</span>}
        </div>
      )}
    </div>
  );
}

// ── Currency Converter ─────────────────────────────────────────────────────
export function CurrencyConverter() {
  const [amount, setAmount] = useState(1000);
  const [rates] = useState({ USD: 0.58, AUD: 0.91, GBP: 0.46, EUR: 0.53, CNY: 4.22, JPY: 87.5 });

  return (
    <div className="rounded-xl p-4 space-y-3" style={GLASS}>
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" style={{ color: POUNAMU }} />
        <span className="text-sm font-medium">NZD Currency Converter</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">NZD</span>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#00A86B]/50" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(rates).map(([currency, rate]) => (
          <div key={currency} className="rounded-lg p-2 bg-white/5 text-center">
            <p className="text-[10px] text-white/40 uppercase">{currency}</p>
            <p className="text-sm font-bold" style={{ color: GOLD }}>
              {(amount * rate).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/25 text-center">Indicative rates · Not for customs duty calculations</p>
    </div>
  );
}

// ── Te Reo Dual-Language Toggle ────────────────────────────────────────────
const TE_REO_MAP: Record<string, string> = {
  "Dashboard": "Papamahi",
  "Settings": "Whakaritenga",
  "Reports": "Pūrongo",
  "Calendar": "Māramataka",
  "Messages": "Karere",
  "Bookings": "Tāpui",
  "Projects": "Kaupapa",
  "Compliance": "Whakaū Ture",
  "Analytics": "Tātaritanga",
  "Invoices": "Nama",
  "Clients": "Kiritaki",
  "Staff": "Kaimahi",
  "Safety": "Haumarutanga",
  "Documents": "Tuhinga",
  "Search": "Rapunga",
  "Help": "Āwhina",
};

export function TeReoDualLanguageToggle({ onToggle }: { onToggle?: (enabled: boolean) => void }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="rounded-xl p-4 space-y-3" style={GLASS}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4" style={{ color: POUNAMU }} />
          <span className="text-sm font-medium">Te Reo Māori Labels</span>
        </div>
        <button onClick={() => { setEnabled(!enabled); onToggle?.(!enabled); }}
          className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? "bg-[#00A86B]" : "bg-white/10"}`}>
          <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </div>
      {enabled && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
          {Object.entries(TE_REO_MAP).map(([en, mi]) => (
            <div key={en} className="flex items-center gap-2 px-2 py-1 rounded text-xs">
              <span className="text-white/40 w-20">{en}</span>
              <span className="text-white/70">→</span>
              <span style={{ color: POUNAMU }} className="font-medium">{mi}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/** Convenience export of all locale widgets */
export default function NZLocaleFeatures({ onZoneSelect, onHolidayToggle, onTeReoToggle }: {
  onZoneSelect?: (zone: string, data: any) => void;
  onHolidayToggle?: (enabled: boolean, percent: number) => void;
  onTeReoToggle?: (enabled: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <SeismicZoneToggle onZoneSelect={onZoneSelect} />
      <HolidaySurchargeToggle onToggle={onHolidayToggle} />
      <CurrencyConverter />
      <TeReoDualLanguageToggle onToggle={onTeReoToggle} />
    </div>
  );
}
