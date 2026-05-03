import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import AISLiveTracker from "./AISLiveTracker";
import { AGENT_LIVE_DATA_MAP, AIS_AGENTS } from "@/data/agentLiveDataMap";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  onSendToChat?: (msg: string) => void;
}

export default function LiveDataPanel({ agentId, agentName, agentColor, onSendToChat }: Props) {
  const [feeds, setFeeds] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sources = AGENT_LIVE_DATA_MAP[agentId] || [];
  const showAIS = AIS_AGENTS.includes(agentId);

  const fetchFeed = async (idx: number) => {
    const src = sources[idx];
    if (!src) return;
    setLoading(p => ({ ...p, [idx]: true }));
    setErrors(p => ({ ...p, [idx]: "" }));
    try {
      const { data, error } = await supabase.functions.invoke(src.fn, { body: src.defaultBody });
      if (error) throw error;
      setFeeds(p => ({ ...p, [idx]: data }));
    } catch (e: any) {
      setErrors(p => ({ ...p, [idx]: e.message || "Failed to fetch" }));
    } finally {
      setLoading(p => ({ ...p, [idx]: false }));
    }
  };

  useEffect(() => {
    sources.forEach((_, i) => fetchFeed(i));
  }, [agentId]);

  if (sources.length === 0 && !showAIS) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">No live data feeds configured for {agentName}.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Radio size={16} style={{ color: agentColor }} />
        <h2 className="text-sm font-bold text-foreground">Live Data Feeds</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${agentColor}20`, color: agentColor }}>
          {sources.length + (showAIS ? 1 : 0)} source{(sources.length + (showAIS ? 1 : 0)) > 1 ? "s" : ""}
        </span>
      </div>

      {/* AIS Live Tracker for maritime/pm agents */}
      {showAIS && (
        <AISLiveTracker agentColor={agentColor} onSendToChat={onSendToChat} />
      )}

      {sources.map((src, idx) => (
        <div key={idx} className="rounded-xl border border-border bg-card p-4" style={{ borderColor: `${agentColor}15` }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-foreground">{src.label}</h3>
            <button
              onClick={() => fetchFeed(idx)}
              disabled={loading[idx]}
              className="p-1.5 rounded-lg transition-colors hover:bg-muted"
              style={{ color: agentColor }}
            >
              {loading[idx] ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          </div>

          {errors[idx] && (
            <div className="flex items-center gap-2 text-xs text-destructive mb-2">
              <AlertTriangle size={12} /> {errors[idx]}
            </div>
          )}

          {feeds[idx] ? (
            <div className="space-y-2">
              {feeds[idx].demo && (
                <p className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground">
                  Demo data - configure API key for live feed
                </p>
              )}
              {feeds[idx].setup && (
                <p className="text-[10px] text-muted-foreground">{feeds[idx].setup}</p>
              )}
              <pre className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify(feeds[idx], null, 2).slice(0, 2000)}
              </pre>
              {onSendToChat && (
                <button
                  onClick={() => onSendToChat(`Analyse this live data from ${src.label}: ${JSON.stringify(feeds[idx]).slice(0, 500)}`)}
                  className="text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-[0.98]"
                  style={{ background: `${agentColor}15`, color: agentColor, border: `1px solid ${agentColor}25` }}
                >
                  Analyse in Chat
                </button>
              )}
            </div>
          ) : loading[idx] ? (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 size={14} className="animate-spin" style={{ color: agentColor }} />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}