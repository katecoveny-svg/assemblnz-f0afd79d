import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Shield, X } from "lucide-react";
import { nzCauses, causeTypes, locationOptions, valueOptions } from "@/data/nzCauses";

const KINDLE_COLOR = "#CE93D8";

const ScoreBadge = ({ score }: { score: number }) => {
  const bg = score >= 8 ? `${KINDLE_COLOR}20` : score >= 5 ? "rgba(0,255,136,0.1)" : "rgba(239,68,68,0.1)";
  const color = score >= 8 ? KINDLE_COLOR : score >= 5 ? "#5AADA0" : "#EF4444";
  return (
    <div className="w-8 h-8 rounded-full grid place-items-center text-[10px] font-bold tabular-nums" style={{ background: bg, color }}>{score}</div>
  );
};

interface Props {
  onSendToChat?: (msg: string) => void;
}

const KindleMarketplace = ({ onSendToChat }: Props) => {
  const [search, setSearch] = useState("");
  const [causeFilter, setCauseFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleValue = (v: string) => setSelectedValues(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const filtered = nzCauses.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.campaign.toLowerCase().includes(search.toLowerCase());
    const matchCause = causeFilter === "All" || l.type === causeFilter;
    const matchLocation = locationFilter === "All" || l.location === locationFilter;
    const matchValues = selectedValues.length === 0 || selectedValues.some(v => l.values.includes(v));
    return matchSearch && matchCause && matchLocation && matchValues;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-foreground">Impact Marketplace</h2>
        <p className="text-xs text-muted-foreground">Discover and fund verified community causes across New Zealand.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search causes..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-background/50 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-pounamu" />
        </div>
        <select value={causeFilter} onChange={e => setCauseFilter(e.target.value)} className="px-2.5 py-2 rounded-lg text-xs bg-background/50 border border-white/10 text-foreground">
          {causeTypes.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="px-2.5 py-2 rounded-lg text-xs bg-background/50 border border-white/10 text-foreground">
          {locationOptions.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Value chips */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Filter by value alignment:</p>
        <div className="flex flex-wrap gap-1.5">
          {valueOptions.map(v => {
            const active = selectedValues.includes(v);
            return (
              <button key={v} onClick={() => toggleValue(v)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors"
                style={{
                  background: active ? `${KINDLE_COLOR}15` : "transparent",
                  color: active ? KINDLE_COLOR : "hsl(var(--muted-foreground))",
                  borderColor: active ? `${KINDLE_COLOR}40` : "rgba(255,255,255,0.1)",
                }}>
                {v}{active && <X className="w-2.5 h-2.5 inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">{filtered.length} causes found</p>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((l, i) => {
          const progress = (parseFloat(l.raised.replace(/[$,]/g, "")) / parseFloat(l.goal.replace(/[$,]/g, ""))) * 100;
          return (
            <motion.div key={`${l.slug}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-transform"
              style={{ background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
              onClick={() => onSendToChat?.(`Tell me more about ${l.name} and their "${l.campaign}" campaign. How can I support them?`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${KINDLE_COLOR}20`, color: KINDLE_COLOR }}>
                  {l.name.charAt(0)}
                </div>
                <ScoreBadge score={l.impactScore} />
              </div>
              <h3 className="text-xs font-semibold text-foreground">{l.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{l.campaign}</p>

              {l.values.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {l.values.slice(0, 2).map(v => (
                    <span key={v} className="text-[8px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${KINDLE_COLOR}15`, color: KINDLE_COLOR }}>{v}</span>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Raised: <span className="font-medium text-foreground tabular-nums">{l.raised}</span></span>
                  <span className="text-muted-foreground tabular-nums">{l.goal}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, background: KINDLE_COLOR }} />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin size={10} /> {l.location}
                </div>
                {l.verified && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: KINDLE_COLOR }}>
                    <Shield size={10} /> Verified
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default KindleMarketplace;
