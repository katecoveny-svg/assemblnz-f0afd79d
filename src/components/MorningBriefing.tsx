import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { agents, echoAgent, pilotAgent } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import { Sun, Moon, CloudSun, Zap, ChevronRight, RefreshCw } from "lucide-react";

const ALL_AGENTS = [echoAgent, pilotAgent, ...agents];

interface BriefingInsight {
  agentId: string;
  agentName: string;
  color: string;
  insights: string[];
}

const getTimeIcon = () => {
  const h = new Date().getHours();
  if (h < 12) return Sun;
  if (h < 17) return CloudSun;
  return Moon;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Morning Briefing";
  if (h < 17) return "Afternoon Update";
  return "Evening Summary";
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const MorningBriefing = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<BriefingInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateBriefing = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const uid = user.id;
      const briefingInsights: BriefingInsight[] = [];

      // Fetch all data in parallel
      const [actionsRes, exportsRes, deadlinesRes, alertsRes, convsRes, leadsRes] = await Promise.allSettled([
        supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").limit(10),
        supabase.from("exported_outputs").select("*").eq("user_id", uid).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).limit(20),
        supabase.from("compliance_deadlines").select("*").gte("due_date", new Date().toISOString().split("T")[0]).order("due_date").limit(10),
        supabase.from("proactive_alerts").select("*").eq("user_id", uid).eq("is_dismissed", false).limit(10),
        supabase.from("conversations").select("agent_id, updated_at").eq("user_id", uid).gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("leads").select("*").eq("user_id", uid).eq("stage", "new").limit(5),
      ]);

      const actions = actionsRes.status === "fulfilled" ? actionsRes.value.data || [] : [];
      const exports24h = exportsRes.status === "fulfilled" ? exportsRes.value.data || [] : [];
      const deadlines = deadlinesRes.status === "fulfilled" ? deadlinesRes.value.data || [] : [];
      const alerts = alertsRes.status === "fulfilled" ? alertsRes.value.data || [] : [];
      const convs = convsRes.status === "fulfilled" ? convsRes.value.data || [] : [];
      const newLeads = leadsRes.status === "fulfilled" ? leadsRes.value.data || [] : [];

      // ECHO insight
      const echoConvs = convs.filter((c: any) => c.agent_id === "echo");
      const echoInsights: string[] = [];
      if (exports24h.filter((e: any) => e.agent_id === "echo").length > 0) {
        echoInsights.push(`${exports24h.filter((e: any) => e.agent_id === "echo").length} content pieces generated in the last 24h.`);
      }
      if (echoConvs.length > 0) echoInsights.push(`${echoConvs.length} conversations today.`);
      if (echoInsights.length === 0) echoInsights.push("Ready to assist — start your day with a task.");
      briefingInsights.push({ agentId: "echo", agentName: "ECHO", color: "#D4A843", insights: echoInsights });

      // LEDGER (finance) insight
      const financeDeadlines = deadlines.filter((d: any) => d.agents?.includes("ledger") || d.category === "tax");
      const ledgerInsights: string[] = [];
      if (financeDeadlines.length > 0) {
        const nearest = financeDeadlines[0];
        const days = Math.ceil((new Date(nearest.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        ledgerInsights.push(`${nearest.title} due in ${days} day${days !== 1 ? "s" : ""}.`);
      }
      const financeActions = actions.filter((a: any) => a.agent_id === "finance");
      if (financeActions.length > 0) ledgerInsights.push(`${financeActions.length} pending financial actions.`);
      if (ledgerInsights.length > 0) {
        briefingInsights.push({ agentId: "finance", agentName: "LEDGER", color: "#1A3A5C", insights: ledgerInsights });
      }

      // FLUX (sales) insight
      const fluxInsights: string[] = [];
      if (newLeads.length > 0) fluxInsights.push(`${newLeads.length} new lead${newLeads.length !== 1 ? "s" : ""} in pipeline.`);
      const fluxActions = actions.filter((a: any) => a.agent_id === "sales");
      if (fluxActions.length > 0) fluxInsights.push(`${fluxActions.length} follow-ups pending.`);
      if (fluxInsights.length > 0) {
        briefingInsights.push({ agentId: "sales", agentName: "FLUX", color: "#D4A843", insights: fluxInsights });
      }

      // Cross-agent alerts
      if (alerts.length > 0) {
        const criticalAlerts = alerts.filter((a: any) => a.severity === "critical" || a.severity === "high");
        if (criticalAlerts.length > 0) {
          briefingInsights.push({
            agentId: "system", agentName: "ASSEMBL", color: "#5AADA0",
            insights: [`${criticalAlerts.length} priority alert${criticalAlerts.length !== 1 ? "s" : ""} need attention.`],
          });
        }
      }

      // Compliance
      const urgentDeadlines = deadlines.filter((d: any) => {
        const days = Math.ceil((new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 14;
      });
      if (urgentDeadlines.length > 0) {
        briefingInsights.push({
          agentId: "legal", agentName: "ANCHOR", color: "#1A3A5C",
          insights: [`${urgentDeadlines.length} compliance deadline${urgentDeadlines.length !== 1 ? "s" : ""} within 14 days.`],
        });
      }

      setInsights(briefingInsights);
      setLastGenerated(new Date());
    } catch (err) {
      console.error("Briefing error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { generateBriefing(); }, [generateBriefing]);

  const TimeIcon = getTimeIcon();

  if (insights.length === 0 && !loading) return null;

  return (
    <div className="rounded-xl relative overflow-hidden p-5" style={{ ...glassCardStyle, boxShadow: "0 0 30px rgba(58,125,110,0.06)" }}>
      <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #5AADA0, transparent)" }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TimeIcon size={16} className="text-[#5AADA0]" />
          <h2 className="font-display font-bold text-sm text-foreground">{getGreeting()}</h2>
          <Zap size={12} className="text-[#5AADA0]" />
        </div>
        <div className="flex items-center gap-2">
          {lastGenerated && (
            <span className="text-[9px] text-muted-foreground">
              {lastGenerated.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={generateBriefing} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading && insights.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <RefreshCw size={16} className="animate-spin text-[#5AADA0]/50" />
          <span className="text-xs text-muted-foreground ml-2">Compiling briefing...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const agent = ALL_AGENTS.find(a => a.id === insight.agentId);
            return (
              <Link
                key={insight.agentId}
                to={agent ? `/chat/${insight.agentId}` : "/agents"}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/[0.03] group"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                {agent ? (
                  <AgentAvatar agentId={agent.id} color={agent.color} size={24} showGlow={false} />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: insight.color + "20" }}>
                    <Zap size={12} style={{ color: insight.color }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold" style={{ color: insight.color }}>{insight.agentName}</span>
                  {insight.insights.map((text, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
                  ))}
                </div>
                <ChevronRight size={12} className="text-muted-foreground/20 mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MorningBriefing;
