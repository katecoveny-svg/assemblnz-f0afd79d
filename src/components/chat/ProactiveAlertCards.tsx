import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { agents, echoAgent, pilotAgent } from "@/data/agents";
import { AlertTriangle, ArrowRight, X, Zap } from "lucide-react";

const ALL_AGENTS = [echoAgent, pilotAgent, ...agents];
const agentMap = new Map(ALL_AGENTS.map(a => [a.id, a]));

// Map agent slugs used in alerts to actual agent IDs
const AGENT_SLUG_TO_ID: Record<string, string> = {
  echo: "echo", finance: "finance", legal: "legal", hr: "hr",
  it: "it", marketing: "marketing", sales: "sales", property: "property",
  sports: "sports", hospitality: "hospitality", construction: "construction",
  pm: "pm", automotive: "automotive", customs: "customs",
};

interface ProactiveAlert {
  id: string;
  source_agent: string;
  target_agent: string;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  currentAgentId: string;
  accentColor: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF4D6A",
  high: "#FFB800",
  standard: "#3A6A9C",
};

const ProactiveAlertCards = ({ currentAgentId, accentColor }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Get alerts targeted at this agent OR sourced from this agent
      const { data } = await supabase
        .from("proactive_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .eq("target_agent", currentAgentId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setAlerts(data as ProactiveAlert[]);
    };

    load();

    // Realtime subscription
    const channel = supabase
      .channel(`alerts-${currentAgentId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "proactive_alerts",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const alert = payload.new as ProactiveAlert;
        if (alert.target_agent === currentAgentId || alert.source_agent === currentAgentId) {
          setAlerts(prev => [alert, ...prev].slice(0, 5));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, currentAgentId]);

  const dismiss = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await supabase.from("proactive_alerts").update({ is_dismissed: true }).eq("id", id);
  };

  const goToAgent = (agentSlug: string) => {
    const agentId = AGENT_SLUG_TO_ID[agentSlug] || agentSlug;
    navigate(`/chat/${agentId}`);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mx-3 mt-2">
      {alerts.map(alert => {
        const sourceAgent = agentMap.get(alert.source_agent) || agentMap.get(AGENT_SLUG_TO_ID[alert.source_agent] || "");
        const targetAgent = agentMap.get(alert.target_agent) || agentMap.get(AGENT_SLUG_TO_ID[alert.target_agent] || "");
        const sevColor = SEVERITY_COLORS[alert.severity] || accentColor;
        const isFromOther = alert.source_agent !== currentAgentId;

        return (
          <div
            key={alert.id}
            className="rounded-xl border p-3 animate-in slide-in-from-top-2"
            style={{
              background: "rgba(14,14,26,0.85)",
              backdropFilter: "blur(12px)",
              borderColor: sevColor + "25",
              borderLeft: `3px solid ${sevColor}`,
            }}
          >
            <div className="flex items-start gap-2">
              <Zap size={13} className="shrink-0 mt-0.5" style={{ color: sevColor }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {sourceAgent && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: (sourceAgent.color || "#888") + "15", color: sourceAgent.color }}>
                      {sourceAgent.name}
                    </span>
                  )}
                  <span className="text-[9px] text-muted-foreground">→</span>
                  {targetAgent && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: (targetAgent.color || "#888") + "15", color: targetAgent.color }}>
                      {targetAgent.name}
                    </span>
                  )}
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium ml-auto" style={{ backgroundColor: sevColor + "15", color: sevColor }}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground mb-0.5">{alert.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.message}</p>
              </div>
              <button onClick={() => dismiss(alert.id)} className="text-muted-foreground/40 hover:text-foreground shrink-0">
                <X size={13} />
              </button>
            </div>
            {isFromOther && targetAgent && (
              <button
                onClick={() => goToAgent(alert.target_agent)}
                className="mt-2 flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80 w-full justify-center"
                style={{ color: targetAgent.color, border: `1px solid ${targetAgent.color}30`, background: `${targetAgent.color}08` }}
              >
                Open {targetAgent.name} <ArrowRight size={10} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProactiveAlertCards;
