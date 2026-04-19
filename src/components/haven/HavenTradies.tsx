import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Star, Wrench, Phone, Mail, X, Award, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";

const HAVEN_PINK = "#D4A843";

const TRADE_KEYWORDS: Record<string, string[]> = {
  Plumber: ["plumb", "pipe", "leak", "tap", "drain", "toilet", "water", "hot water", "cylinder", "sewage"],
  Electrician: ["electric", "wiring", "switch", "power", "light", "outlet", "fuse", "circuit"],
  Painter: ["paint", "repaint", "wall", "ceiling", "stain"],
  Roofer: ["roof", "gutter", "leak from above", "tiles", "iron"],
  Tiler: ["tile", "grout", "bathroom floor", "shower"],
  "HVAC / Aircon": ["heat pump", "hvac", "aircon", "air conditioning", "ventilation", "heating"],
  Locksmith: ["lock", "key", "deadbolt", "door lock"],
  Carpenter: ["wood", "door", "window frame", "deck", "fence", "timber"],
  Handyman: ["handyman", "general", "odd job", "fix", "repair"],
  Builder: ["build", "renovation", "extension", "wall", "structural"],
  Landscaper: ["garden", "lawn", "landscap", "tree", "hedge"],
  Cleaner: ["clean", "carpet clean", "window clean", "end of tenancy"],
};

interface Tradie {
  id: string; name: string; trade: string; phone: string | null; email: string | null;
  service_area: string | null; rating: number; jobs_completed: number;
  bio: string | null; tagline: string | null; specialties: string[] | null;
  certifications: string[] | null;
}

const HavenTradies = ({ onSendToChat }: { onSendToChat: (msg: string) => void }) => {
  const { user } = useAuth();
  const [tradies, setTradies] = useState<Tradie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [matchQuery, setMatchQuery] = useState("");
  const [matchResults, setMatchResults] = useState<(Tradie & { score: number })[] | null>(null);
  const [form, setForm] = useState({ name: "", trade: "", phone: "", email: "", service_area: "", licence_number: "" });

  const fetchTradies = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("tradies").select("*").order("rating", { ascending: false });
    setTradies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTradies(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name || !form.trade) { toast.error("Name and trade required"); return; }
    const { error } = await supabase.from("tradies").insert({ ...form, user_id: user.id, availability_token: crypto.randomUUID() });
    if (error) toast.error("Failed to add"); else { toast.success("Tradie added"); fetchTradies(); setShowForm(false); setForm({ name: "", trade: "", phone: "", email: "", service_area: "", licence_number: "" }); }
  };

  const runMatch = () => {
    if (!matchQuery.trim()) return;
    const queryLower = matchQuery.toLowerCase();
    // Determine best trades
    const tradeScores: Record<string, number> = {};
    Object.entries(TRADE_KEYWORDS).forEach(([trade, keywords]) => {
      keywords.forEach(kw => { if (queryLower.includes(kw)) tradeScores[trade] = (tradeScores[trade] || 0) + 1; });
    });
    const scored = tradies.map(t => {
      let score = 0;
      const tradeLower = t.trade.toLowerCase();
      Object.entries(tradeScores).forEach(([trade, s]) => { if (tradeLower.includes(trade.toLowerCase())) score += s * 10; });
      score += t.rating * 2;
      score += Math.min(t.jobs_completed, 20);
      return { ...t, score };
    }).filter(t => t.score > 0).sort((a, b) => b.score - a.score);
    setMatchResults(scored.length > 0 ? scored : []);
  };

  const filtered = tradies.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.trade.toLowerCase().includes(search.toLowerCase())
  );

  const getBadge = (t: Tradie) => {
    if (t.jobs_completed >= 20) return { icon: Trophy, label: "Top Performer", color: "#FFB300" };
    if (t.rating >= 4.5) return { icon: Award, label: "Highly Rated", color: "#66BB6A" };
    if (t.jobs_completed >= 10) return { icon: TrendingUp, label: "Reliable", color: "#42A5F5" };
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Tradies</h2>
          <p className="text-[11px] font-body text-muted-foreground">{tradies.length} tradies in directory</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: HAVEN_PINK + "15", color: HAVEN_PINK, border: `1px solid ${HAVEN_PINK}25` }}>
          <Plus size={14} /> Add Tradie
        </button>
      </div>

      {/* Uber-style Matcher */}
      <div className="rounded-xl p-3 border space-y-2" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: HAVEN_PINK + "20" }}>
        <h3 className="font-display font-bold text-xs" style={{ color: HAVEN_PINK }}> Tradie Matcher</h3>
        <p className="text-[10px] text-muted-foreground font-body">Describe the issue and we'll find the right tradie</p>
        <div className="flex gap-2">
          <input value={matchQuery} onChange={e => setMatchQuery(e.target.value)} placeholder="e.g. Leaking hot water cylinder in bathroom"
            className="flex-1 px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground"
            onKeyDown={e => e.key === "Enter" && runMatch()} />
          <button onClick={runMatch}
            className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK }}>Match</button>
        </div>
        {matchResults !== null && (
          <div className="space-y-1.5 pt-1">
            {matchResults.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No matching tradies found. <button onClick={() => onSendToChat(`Find a tradie for: ${matchQuery}`)} className="underline" style={{ color: HAVEN_PINK }}>Ask HAVEN AI</button></p>
            ) : matchResults.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: i === 0 ? HAVEN_PINK + "08" : "rgba(255,255,255,0.01)", borderColor: i === 0 ? HAVEN_PINK + "20" : "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK }}>#{i + 1}</span>
                  <div>
                    <span className="text-xs font-body font-medium text-foreground">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{t.trade}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#FFB300" }}><Star size={9} fill="#FFB300" />{t.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-muted-foreground">{t.jobs_completed} jobs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tradies…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-body bg-card border border-border text-foreground placeholder:text-muted-foreground" />
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-foreground">Add Tradie</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X size={14} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} placeholder="Trade * (e.g. Plumber)" className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.service_area} onChange={e => setForm(f => ({ ...f, service_area: e.target.value }))} placeholder="Service Area" className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.licence_number} onChange={e => setForm(f => ({ ...f, licence_number: e.target.value }))} placeholder="Licence #" className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK, border: `1px solid ${HAVEN_PINK}30` }}>Add Tradie</button>
        </div>
      )}

      {/* Tradie List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => {
            const badge = getBadge(t);
            return (
              <div key={t.id} className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-foreground">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground">{t.trade}</span>
                      {badge && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: badge.color + "15", color: badge.color }}><badge.icon size={8} />{badge.label}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {t.phone && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone size={9} />{t.phone}</span>}
                      {t.email && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Mail size={9} />{t.email}</span>}
                      {t.service_area && <span className="text-[10px] text-muted-foreground"> {t.service_area}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-0.5 text-xs" style={{ color: "#FFB300" }}><Star size={10} fill="#FFB300" />{t.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground">{t.jobs_completed} jobs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HavenTradies;
