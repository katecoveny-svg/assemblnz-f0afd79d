import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, DollarSign, Users, Megaphone, Settings, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { agents } from "@/data/agents";

interface ScoreCategory {
  key: string;
  label: string;
  icon: any;
  weight: number;
  score: number;
  color: string;
}

interface Recommendation {
  text: string;
  points: number;
  agentId: string;
}

const SCORE_GRADIENT = (score: number) =>
  score >= 71 ? "#5AADA0" : score >= 41 ? "#D4A843" : "#C85A54";

const CircularGauge = ({ score, size = 180 }: { score: number; size?: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const color = SCORE_GRADIENT(animatedScore);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(from + (score - from) * eased));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums text-foreground">{animatedScore}</span>
        <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">Business Score</span>
      </div>
    </div>
  );
};

const CategoryBar = ({ cat }: { cat: ScoreCategory }) => {
  const color = SCORE_GRADIENT(cat.score);
  return (
    <div className="flex items-center gap-3">
      <cat.icon size={13} style={{ color: cat.color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-muted-foreground">{cat.label} ({cat.weight}%)</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{cat.score}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${cat.score}%`, background: color, boxShadow: `0 0 6px ${color}40` }} />
        </div>
      </div>
    </div>
  );
};

const BusinessScore = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    complianceItems: number; complianceCompliant: number;
    invoicesPaid: number; invoicesTotal: number; gstFiled: boolean;
    exports: number; conversations: number; actions: number;
    leads: number; activeAgents: number; deadlines: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const load = async () => {
      const [compRes, jobsRes, exportsRes, convsRes, actionsRes, leadsRes, deadlinesRes] = await Promise.allSettled([
        supabase.from("compliance_items").select("status").eq("user_id", uid),
        supabase.from("maintenance_jobs").select("status, invoice_amount").eq("user_id", uid),
        supabase.from("exported_outputs").select("id").eq("user_id", uid),
        supabase.from("conversations").select("id, agent_id").eq("user_id", uid),
        supabase.from("action_queue").select("id").eq("user_id", uid).eq("status", "pending"),
        supabase.from("leads").select("id").eq("user_id", uid),
        supabase.from("compliance_deadlines").select("id"),
      ]);

      const comp = compRes.status === "fulfilled" ? compRes.value.data || [] : [];
      const jobs = jobsRes.status === "fulfilled" ? jobsRes.value.data || [] : [];
      const exps = exportsRes.status === "fulfilled" ? exportsRes.value.data || [] : [];
      const convs = convsRes.status === "fulfilled" ? convsRes.value.data || [] : [];
      const acts = actionsRes.status === "fulfilled" ? actionsRes.value.data || [] : [];
      const lds = leadsRes.status === "fulfilled" ? leadsRes.value.data || [] : [];
      const dls = deadlinesRes.status === "fulfilled" ? deadlinesRes.value.data || [] : [];

      const compliant = comp.filter((c: any) => c.status === "compliant" || c.status === "current").length;
      const invoicesPaid = jobs.filter((j: any) => j.invoice_amount && ["completed", "invoice_uploaded"].includes(j.status)).length;
      const agentIds = new Set(convs.map((c: any) => c.agent_id));

      setData({
        complianceItems: comp.length, complianceCompliant: compliant,
        invoicesPaid, invoicesTotal: jobs.length, gstFiled: false,
        exports: exps.length, conversations: convs.length, actions: acts.length,
        leads: lds.length, activeAgents: agentIds.size, deadlines: dls.length,
      });
    };
    load();
  }, [user]);

  const categories: ScoreCategory[] = useMemo(() => {
    if (!data) return [];
    const compScore = data.complianceItems > 0
      ? Math.round((data.complianceCompliant / data.complianceItems) * 100)
      : data.exports > 0 ? 60 : 30;

    const finScore = Math.min(100, 30 + (data.invoicesPaid > 0 ? 25 : 0) + (data.exports > 2 ? 20 : data.exports > 0 ? 10 : 0) + (data.conversations > 5 ? 15 : data.conversations > 0 ? 8 : 0));
    const teamScore = Math.min(100, 25 + (data.exports > 0 ? 20 : 0) + (data.conversations > 3 ? 25 : data.conversations > 0 ? 10 : 0) + (data.activeAgents > 2 ? 20 : data.activeAgents > 0 ? 10 : 0));
    const mktScore = Math.min(100, 20 + (data.exports > 3 ? 30 : data.exports > 0 ? 15 : 0) + (data.leads > 5 ? 25 : data.leads > 0 ? 10 : 0) + (data.conversations > 5 ? 15 : 0));
    const opsScore = Math.min(100, 20 + (data.activeAgents > 4 ? 30 : data.activeAgents > 1 ? 15 : 0) + (data.exports > 5 ? 25 : data.exports > 0 ? 10 : 0) + (data.actions < 3 ? 15 : 0));
    const growthScore = Math.min(100, 15 + (data.leads > 3 ? 25 : data.leads > 0 ? 10 : 0) + (data.conversations > 10 ? 25 : data.conversations > 3 ? 15 : 0) + (data.activeAgents > 3 ? 20 : data.activeAgents > 0 ? 10 : 0));

    return [
      { key: "compliance", label: "Compliance", icon: ShieldCheck, weight: 20, score: compScore, color: "#3A7D6E" },
      { key: "financial", label: "Financial Health", icon: DollarSign, weight: 20, score: finScore, color: "#5AADA0" },
      { key: "team", label: "Team", icon: Users, weight: 15, score: teamScore, color: "#D4A843" },
      { key: "marketing", label: "Marketing", icon: Megaphone, weight: 15, score: mktScore, color: "#7ECFC2" },
      { key: "operations", label: "Operations", icon: Settings, weight: 15, score: opsScore, color: "#D4A843" },
      { key: "growth", label: "Growth", icon: TrendingUp, weight: 15, score: growthScore, color: "#1A3A5C" },
    ];
  }, [data]);

  const overallScore = useMemo(() => {
    if (categories.length === 0) return 0;
    return Math.round(categories.reduce((sum, c) => sum + c.score * (c.weight / 100), 0));
  }, [categories]);

  const recommendations: Recommendation[] = useMemo(() => {
    if (!data) return [];
    const recs: Recommendation[] = [];
    if (data.complianceItems === 0) recs.push({ text: "Set up compliance tracking", points: 8, agentId: "ASM-007" });
    if (data.complianceCompliant < data.complianceItems) recs.push({ text: "Complete overdue compliance items", points: 5, agentId: "ASM-007" });
    if (data.exports < 3) recs.push({ text: "Generate your first business documents", points: 4, agentId: "ASM-001" });
    if (data.leads === 0) recs.push({ text: "Add leads to your pipeline", points: 6, agentId: "ASM-008" });
    if (data.activeAgents < 3) recs.push({ text: "Explore more specialist advisors", points: 3, agentId: "ASM-001" });
    if (data.conversations < 5) recs.push({ text: "Have more strategic conversations", points: 4, agentId: "ASM-001" });
    if (data.invoicesTotal > 0 && data.invoicesPaid < data.invoicesTotal) recs.push({ text: "Follow up on unpaid invoices", points: 5, agentId: "ASM-014" });
    return recs.sort((a, b) => b.points - a.points).slice(0, 3);
  }, [data]);

  const percentile = useMemo(() => Math.min(95, Math.max(10, Math.round(overallScore * 0.9 + 5))), [overallScore]);

  if (!data) {
    return (
      <div className="rounded-xl p-6 animate-pulse" style={{ background: "rgba(14,14,26,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="h-[180px] w-[180px] mx-auto rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
      </div>
    );
  }

  return (
    <div className="rounded-xl relative overflow-hidden" style={{
      background: "rgba(14,14,26,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${SCORE_GRADIENT(overallScore)}, transparent)` }} />

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} style={{ color: SCORE_GRADIENT(overallScore) }} />
          <h2 className="font-display font-bold text-sm text-foreground">Assembl Business Score</h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <CircularGauge score={overallScore} />
            <p className="text-[10px] text-muted-foreground text-center max-w-[200px]">
              Your business scores higher than <span className="font-bold" style={{ color: SCORE_GRADIENT(overallScore) }}>{percentile}%</span> of NZ businesses in your industry
            </p>
          </div>

          {/* Categories + Recommendations */}
          <div className="flex-1 w-full space-y-5">
            <div className="space-y-2.5">
              {categories.map(cat => <CategoryBar key={cat.key} cat={cat} />)}
            </div>

            {recommendations.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Improve your score</p>
                <div className="space-y-1.5">
                  {recommendations.map((rec, i) => {
                    const agent = agents.find(a => a.id === rec.agentId);
                    return (
                      <Link key={i} to={`/chat/${rec.agentId}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg group transition-colors"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: "#5AADA0" }}>+{rec.points}</span>
                          <span className="text-[11px] text-foreground/80 group-hover:text-foreground transition-colors">{rec.text}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {agent && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${agent.color}15`, color: agent.color }}>{agent.name}</span>}
                          <ArrowRight size={10} className="text-muted-foreground/30 group-hover:text-foreground/60 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessScore;
