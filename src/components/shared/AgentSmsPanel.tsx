import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Clock, ArrowDown, ArrowUp, Phone, Power } from "lucide-react";
import { toast } from "sonner";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
}

interface SmsConfig {
  id: string;
  user_id: string;
  agent_id: string;
  enabled: boolean;
  twilio_phone_number: string | null;
  greeting: string;
}

interface SmsMessage {
  id: string;
  phone_number: string;
  direction: string;
  body: string;
  created_at: string;
}

export default function AgentSmsPanel({ agentId, agentName, agentColor }: Props) {
  const { user } = useAuth();
  const [config, setConfig] = useState<SmsConfig | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user, agentId]);

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
          .single(),
        supabase
          .from("agent_sms_messages")
          .select("*")
          .eq("user_id", user.id)
          .eq("agent_id", agentId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setConfig(configRes.data as SmsConfig | null);
      setMessages((msgsRes.data || []) as SmsMessage[]);
    } catch (e) {
      console.error("[Agent SMS] Load error:", e);
    }
    setLoading(false);
  };

  const enableSms = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("agent_sms_config")
      .upsert(
        {
          user_id: user.id,
          agent_id: agentId,
          enabled: true,
          twilio_phone_number: null,
          greeting: `Kia ora! You've reached ${agentName} by Assembl. How can I help?`,
        },
        { onConflict: "user_id,agent_id" }
      )
      .select()
      .single();

    if (error) {
      toast.error("Failed to enable SMS: " + error.message);
      return;
    }
    setConfig(data as SmsConfig);
    toast.success(`SMS enabled for ${agentName}!`);
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

  const sendTestSms = async () => {
    if (!testMessage.trim() || !user) return;
    setSending(true);
    try {
      // Insert a test inbound message to show in the history
      const { error: insertErr } = await supabase.from("agent_sms_messages").insert({
        user_id: user.id,
        agent_id: agentId,
        phone_number: "+64210000000",
        direction: "inbound",
        body: testMessage,
        status: "test",
      });
      if (insertErr) throw insertErr;

      // Call the agent router for a response
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: testMessage,
          agentId,
          packId: agentId,
          messages: [],
        }),
      });

      if (!resp.ok) throw new Error(`Agent error: ${resp.status}`);

      // Read SSE stream
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

      // Save the AI response as an outbound test message
      if (result) {
        await supabase.from("agent_sms_messages").insert({
          user_id: user.id,
          agent_id: agentId,
          phone_number: "+64210000000",
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
      <div className="flex-1 flex items-center justify-center" style={{ background: "transparent" }}>
        <p className="text-sm text-white/40">Sign in to use SMS</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "transparent" }}>
        <p className="text-sm text-gray-400">Loading SMS...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "transparent" }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={16} style={{ color: agentColor }} />
        <h2 className="text-sm font-semibold text-white/90">{agentName} SMS</h2>
      </div>
      <p className="text-xs text-white/40">
        Customers can text {agentName} directly and get instant AI-powered responses via SMS.
      </p>

      {!config?.enabled ? (
        <div
          className="rounded-lg p-5 text-center space-y-4"
          style={{ background: agentColor + "08", border: `1px solid ${agentColor}15` }}
        >
          <MessageSquare size={28} style={{ color: agentColor }} className="mx-auto" />
          <div>
            <p className="text-sm text-white/80 font-medium">Enable SMS for {agentName}</p>
            <p className="text-[10px] text-white/40 mt-1">
              Activate SMS so customers can text {agentName} and get instant AI responses. 
              NZ-native SMS delivery is pre-configured — just hit enable.
            </p>
          </div>
          <button
            onClick={enableSms}
            className="mx-auto px-6 py-2.5 rounded-lg text-sm font-medium transition hover:scale-105"
            style={{ background: agentColor + "20", color: agentColor, border: `1px solid ${agentColor}30` }}
          >
            <Power size={14} className="inline mr-1.5 -mt-0.5" />
            Enable SMS
          </button>
        </div>
      ) : (
        <>
          {/* Status */}
          <div
            className="rounded-lg p-3 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-2">
              <Phone size={12} style={{ color: agentColor }} />
              <div>
                <p className="text-xs text-white/70 font-medium">SMS {config.enabled ? "Active" : "Paused"}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">NZ SMS delivery connected</p>
              </div>
            </div>
            <button
              onClick={toggleEnabled}
              className="w-10 h-5 rounded-full transition-all relative"
              style={{
                background: config.enabled ? agentColor + "60" : "rgba(255,255,255,0.1)",
              }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  left: config.enabled ? "22px" : "2px",
                  background: config.enabled ? agentColor : "rgba(255,255,255,0.3)",
                }}
              />
            </button>
          </div>

          {/* Test */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
              <Send size={10} className="inline mr-1" />
              Test SMS
            </p>
            <div className="flex gap-2">
              <input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message..."
                className="flex-1 bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendTestSms();
                }}
              />
              <button
                onClick={sendTestSms}
                disabled={!testMessage.trim() || sending}
                className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30"
                style={{ background: agentColor + "20", color: agentColor }}
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>

          {/* Recent Messages */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
              <Clock size={10} className="inline mr-1" />
              Recent Messages
            </p>
            {messages.length === 0 ? (
              <p className="text-xs text-white/25 py-4 text-center">
                No messages yet. SMS conversations will appear here.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-2 py-1.5 border-b border-white/3 last:border-0"
                  >
                    {m.direction === "inbound" ? (
                      <ArrowDown size={10} className="text-blue-400/50 mt-0.5 shrink-0" />
                    ) : (
                      <ArrowUp size={10} style={{ color: agentColor + "80" }} className="mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 truncate">{m.body}</p>
                      <p className="text-[8px] text-white/20 mt-0.5">
                        {m.phone_number} &middot;{" "}
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
