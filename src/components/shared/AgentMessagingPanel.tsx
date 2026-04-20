import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Clock, ArrowDown, ArrowUp, Phone, Power } from "lucide-react";
import { toast } from "sonner";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  channel: "sms" | "whatsapp";
}

interface MsgConfig {
  id: string;
  user_id: string;
  agent_id: string;
  enabled: boolean;
  channel: string;
  twilio_phone_number: string | null;
  greeting: string;
}

interface MsgRow {
  id: string;
  phone_number: string;
  direction: string;
  body: string;
  created_at: string;
  channel: string;
}

/**
 * Light-glass messaging panel — works for SMS or WhatsApp.
 * Pulls and writes to agent_sms_config + agent_sms_messages, keyed by channel.
 */
export default function AgentMessagingPanel({ agentId, agentName, agentColor, channel }: Props) {
  const { user } = useAuth();
  const [config, setConfig] = useState<MsgConfig | null>(null);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const [sending, setSending] = useState(false);

  const channelLabel = channel === "whatsapp" ? "WhatsApp" : "SMS";
  const accent = channel === "whatsapp" ? "#25D366" : agentColor;

  useEffect(() => {
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, agentId, channel]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [configRes, msgsRes] = await Promise.all([
        supabase
          .from("agent_sms_config")
          .select("*")
          .eq("user_id", user.id)
          .eq("agent_id", agentId)
          .eq("channel", channel)
          .maybeSingle(),
        supabase
          .from("agent_sms_messages")
          .select("*")
          .eq("user_id", user.id)
          .eq("agent_id", agentId)
          .eq("channel", channel)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setConfig(configRes.data as MsgConfig | null);
      setMessages((msgsRes.data || []) as MsgRow[]);
    } catch (e) {
      console.error(`[Agent ${channelLabel}] Load error:`, e);
    }
    setLoading(false);
  };

  const enableChannel = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("agent_sms_config")
      .upsert(
        {
          user_id: user.id,
          agent_id: agentId,
          channel,
          enabled: true,
          twilio_phone_number: null,
          greeting: `Kia ora! You've reached ${agentName} by Assembl on ${channelLabel}. How can I help?`,
        },
        { onConflict: "user_id,agent_id,channel" }
      )
      .select()
      .single();

    if (error) {
      toast.error(`Failed to enable ${channelLabel}: ${error.message}`);
      return;
    }
    setConfig(data as MsgConfig);
    toast.success(`${channelLabel} enabled for ${agentName}!`);
  };

  const toggleEnabled = async () => {
    if (!config) return;
    const { error } = await supabase
      .from("agent_sms_config")
      .update({ enabled: !config.enabled, updated_at: new Date().toISOString() })
      .eq("id", config.id);
    if (error) {
      toast.error("Failed to toggle: " + error.message);
      return;
    }
    setConfig({ ...config, enabled: !config.enabled });
  };

  const sendTest = async () => {
    if (!testMessage.trim() || !user) return;
    setSending(true);
    try {
      const { error: insertErr } = await supabase.from("agent_sms_messages").insert({
        user_id: user.id,
        agent_id: agentId,
        channel,
        phone_number: "test:admin-console",
        direction: "inbound",
        body: testMessage,
        status: "test",
      });
      if (insertErr) throw insertErr;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message: testMessage, agentId, packId: agentId, messages: [] }),
      });
      if (!resp.ok) throw new Error(`Agent error: ${resp.status}`);

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) result += c;
            } catch {}
          }
        }
      }

      if (result) {
        await supabase.from("agent_sms_messages").insert({
          user_id: user.id,
          agent_id: agentId,
          channel,
          phone_number: "test:admin-console",
          direction: "outbound",
          body: result.slice(0, 1600),
          status: "test",
        });
      }

      toast.success("Test complete — check messages below!");
      setTestMessage("");
      loadData();
    } catch (e: any) {
      toast.error("Test failed: " + (e.message || "Unknown error"));
    }
    setSending(false);
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: "transparent" }}>
        <p className="text-sm" style={{ color: "#6B7280" }}>Sign in to use {channelLabel}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: "transparent" }}>
        <p className="text-sm" style={{ color: "#6B7280" }}>Loading {channelLabel}...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "transparent", maxHeight: "50vh" }}>
      <div className="flex items-center gap-2">
        <MessageSquare size={14} style={{ color: accent }} />
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#1A1D29" }}>
          {agentName} {channelLabel}
        </h2>
      </div>
      <p className="text-[11px]" style={{ color: "#6B7280" }}>
        Customers can {channel === "whatsapp" ? "message" : "text"} {agentName} directly and get instant AI-powered responses via {channelLabel}.
      </p>

      {!config?.enabled ? (
        <div
          className="rounded-xl p-5 text-center space-y-3"
          style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${accent}30`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <MessageSquare size={28} style={{ color: accent }} className="mx-auto" />
          <div>
            <p className="text-sm font-medium" style={{ color: "#1A1D29" }}>Enable {channelLabel} for {agentName}</p>
            <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
              NZ-native delivery is pre-configured — just hit enable.
            </p>
          </div>
          <button
            onClick={enableChannel}
            className="mx-auto px-6 py-2.5 rounded-lg text-sm font-medium transition hover:scale-105"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}
          >
            <Power size={14} className="inline mr-1.5 -mt-0.5" />
            Enable {channelLabel}
          </button>
        </div>
      ) : (
        <>
          <div
            className="rounded-xl p-3 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(74,165,168,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <Phone size={12} style={{ color: accent }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "#1A1D29" }}>{channelLabel} {config.enabled ? "Active" : "Paused"}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#6B7280" }}>NZ delivery connected</p>
              </div>
            </div>
            <button
              onClick={toggleEnabled}
              className="w-10 h-5 rounded-full transition-all relative"
              style={{ background: config.enabled ? `${accent}50` : "rgba(0,0,0,0.08)" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  left: config.enabled ? "22px" : "2px",
                  background: config.enabled ? accent : "rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(74,165,168,0.15)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#3D4250" }}>
              <Send size={10} className="inline mr-1" />
              Test {channelLabel}
            </p>
            <div className="flex gap-2">
              <input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message..."
                className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "#1A1D29",
                }}
                onKeyDown={(e) => { if (e.key === "Enter") sendTest(); }}
              />
              <button
                onClick={sendTest}
                disabled={!testMessage.trim() || sending}
                className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30"
                style={{ background: `${accent}20`, color: accent }}
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(74,165,168,0.15)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#3D4250" }}>
              <Clock size={10} className="inline mr-1" />
              Recent Messages
            </p>
            {messages.length === 0 ? (
              <p className="text-xs py-3 text-center" style={{ color: "#9CA3AF" }}>
                No messages yet. Conversations will appear here.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {messages.map((m) => (
                  <div key={m.id} className="flex items-start gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                    {m.direction === "inbound" ? (
                      <ArrowDown size={10} style={{ color: "#5A7A9C" }} className="mt-0.5 shrink-0" />
                    ) : (
                      <ArrowUp size={10} style={{ color: accent }} className="mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] truncate" style={{ color: "#3D4250" }}>{m.body}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: "#9CA3AF" }}>
                        {m.phone_number} ·{" "}
                        {new Date(m.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
