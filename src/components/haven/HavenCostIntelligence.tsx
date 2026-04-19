import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";
import { AgentBarChart, AgentPieChart } from "@/components/shared/AgentCharts";

const HAVEN_PINK = "#D4A843";

interface CategoryData {
  category: string; count: number; total: number; avg: number; min: number; max: number;
}

const HavenCostIntelligence = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quoteCategory, setQuoteCategory] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteResult, setQuoteResult] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("maintenance_jobs").select("category, invoice_amount").not("invoice_amount", "is", null);
      if (data) {
        const map: Record<string, number[]> = {};
        let total = 0;
        data.forEach(j => {
          const cat = j.category || "Uncategorised";
          if (!map[cat]) map[cat] = [];
          map[cat].push(Number(j.invoice_amount));
          total += Number(j.invoice_amount);
        });
        const cats = Object.entries(map).map(([category, amounts]) => ({
          category, count: amounts.length, total: amounts.reduce((s, a) => s + a, 0),
          avg: amounts.reduce((s, a) => s + a, 0) / amounts.length,
          min: Math.min(...amounts), max: Math.max(...amounts),
        })).sort((a, b) => b.total - a.total);
        setCategories(cats);
        setTotalSpend(total);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const checkQuote = () => {
    const amount = parseFloat(quoteAmount);
    if (!quoteCategory || isNaN(amount)) return;
    const cat = categories.find(c => c.category.toLowerCase() === quoteCategory.toLowerCase());
    if (!cat) { setQuoteResult("No data for this category yet. Add more completed jobs to build your cost intelligence."); return; }
    const diff = ((amount - cat.avg) / cat.avg) * 100;
    if (diff > 20) setQuoteResult(` This quote is ${diff.toFixed(0)}% above your portfolio average of $${cat.avg.toFixed(0)} for ${cat.category}.`);
    else if (diff < -10) setQuoteResult(` Great deal — ${Math.abs(diff).toFixed(0)}% below your portfolio average of $${cat.avg.toFixed(0)}.`);
    else setQuoteResult(` Fair price — within range of your portfolio average of $${cat.avg.toFixed(0)}.`);
  };

  if (loading) return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}</div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div>
        <h2 className="font-display font-bold text-base text-foreground">Cost Intelligence</h2>
        <p className="text-[11px] font-body text-muted-foreground">Spend analysis across your portfolio</p>
      </div>

      <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-[10px] text-muted-foreground font-body">Total Portfolio Spend</p>
        <p className="font-display font-bold text-2xl text-foreground">${totalSpend.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}<span className="text-xs text-muted-foreground ml-1">NZD</span></p>
      </div>

      {/* Quote Checker */}
      <div className="rounded-xl p-3 border space-y-2" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: HAVEN_PINK + "20" }}>
        <h3 className="flex items-center gap-1.5 font-display font-bold text-xs" style={{ color: HAVEN_PINK }}>
          <Calculator size={12} /> Quote Checker
        </h3>
        <div className="flex gap-2 flex-wrap">
          <input value={quoteCategory} onChange={e => setQuoteCategory(e.target.value)} placeholder="Category (e.g. Plumbing)"
            className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
          <input value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)} placeholder="Quote $ NZD"
            className="w-24 px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" type="number" />
          <button onClick={checkQuote} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK }}>Check</button>
        </div>
        {quoteResult && <p className="text-[11px] font-body text-foreground">{quoteResult}</p>}
      </div>

      {/* Category Breakdown with Charts */}
      {categories.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">No completed jobs with invoices yet. Complete jobs to build cost data.</p>
      ) : (
        <>
          <AgentBarChart
            title="Spend by Category"
            data={categories.slice(0, 8).map(c => ({ name: c.category.length > 10 ? c.category.slice(0, 10) + "…" : c.category, total: Math.round(c.total) }))}
            dataKey="total"
            color={HAVEN_PINK}
            prefix="$"
            height={180}
          />
          <AgentPieChart
            title="Spend Distribution"
            data={categories.map(c => ({ name: c.category, value: Math.round(c.total) }))}
            height={180}
          />
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.category} className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-xs text-foreground">{c.category}</span>
                  <span className="text-xs font-mono-jb" style={{ color: "#66BB6A" }}>${c.total.toLocaleString("en-NZ", { minimumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-body">
                  <span>{c.count} {c.count === 1 ? "job" : "jobs"}</span>
                  <span>Avg: ${c.avg.toFixed(0)}</span>
                  <span>Range: ${c.min.toFixed(0)} – ${c.max.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HavenCostIntelligence;
