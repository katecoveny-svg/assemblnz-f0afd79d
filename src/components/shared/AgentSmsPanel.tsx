import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Phone, Copy, Check, Send, Clock, ArrowDown, ArrowUp } from "lucide-react";
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [copied, setCopied] = useState(false);
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
          twilio_phone_number: phoneNumber.trim() || null,
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

  const updatePhoneNumber = async () => {
    if (!config) return;
    const { error } = await supabase
      .from("agent_sms_config")
      .update({ twilio_phone_number: phoneNumber.trim(), updated_at: new Date().toISOString() })
      .eq("id", config.id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    setConfig({ ...config, twilio_phone_number: phoneNumber.trim() });
    toast.success("Phone number updated!");
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
    if (!testMessage.trim() || !config?.twilio_phone_number) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("tnz-inbound", {
        body: {
          Message: testMessage,
          From: "+64210000000",
          To: config.twilio_phone_number,
          MessageID: `test-${Date.now()}`,
        },
      });
      if (error) throw error;
      toast.success("Test message sent!");
      setTestMessage("");
      loadData();
    } catch (e: any) {
      toast.error("Test failed: " + (e.message || "Unknown error"));
    }
    setSending(false);
  };

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL || window.location.origin}/functions/v1/agent-sms`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Webhook URL copied!");
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#09090F" }}>
        <p className="text-sm text-white/40">Sign in to configure SMS</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#09090F" }}>
        <p className="text-sm text-white/30">Loading SMS settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#09090F" }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={16} style={{ color: agentColor }} />
        <h2 className="text-sm font-semibold text-white/90">{agentName} SMS</h2>
      </div>
      <p className="text-xs text-white/40">
        Let customers text {agentName} directly via SMS. Powered by TNZ Group.
      </p>

      {/* Setup / Enable */}
      {!config?.enabled ? (
        <div
          className="rounded-lg p-5 text-center space-y-4"
          style={{ background: agentColor + "08", border: `1px solid ${agentColor}15` }}
        >
          <MessageSquare size={28} style={{ color: agentColor }} className="mx-auto" />
          <div>
            <p className="text-sm text-white/80 font-medium">Enable SMS for {agentName}</p>
            <p className="text-[10px] text-white/40 mt-1">
              Customers can text a phone number and get instant AI-powered responses from {agentName}.
              Uses TNZ Group for NZ-native SMS delivery.
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="TNZ number (e.g. +6421234567)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20"
            />
            <button
              onClick={enableSms}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition"
              style={{ background: agentColor + "20", color: agentColor, border: `1px solid ${agentColor}30` }}
            >
              Enable SMS
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Status */}
          <div
            className="rounded-lg p-3 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div>
              <p className="text-xs text-white/70 font-medium">SMS Status</p>
              <p className="text-[10px] text-white/30 font-mono mt-0.5">
                {config.twilio_phone_number || "No number set"}
              </p>
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

          {/* Webhook URL */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide">
              TNZ Inbound Webhook URL
            </p>
            <div className="flex items-center gap-2">
              <code className="text-[10px] px-2 py-1.5 rounded bg-white/5 text-white/50 font-mono flex-1 truncate">
                {webhookUrl}
              </code>
              <button onClick={copyWebhook} className="p-1.5 rounded hover:bg-white/5 transition">
                {copied ? (
                  <Check size={12} style={{ color: agentColor }} />
                ) : (
                  <Copy size={12} className="text-white/40" />
                )}
              </button>
            </div>
            <p className="text-[9px] text-white/20">
              In your TNZ dashboard, set this URL as the inbound webhook for your number.
            </p>
          </div>

          {/* Setup Guide */}
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-2">
              Quick Setup Guide
            </p>
            <div className="space-y-1.5 text-[10px] text-white/35">
              <p>1. Sign up at tnz.co.nz and get a NZ phone number</p>
              <p>2. In TNZ dashboard, go to your number settings</p>
              <p>3. Set the inbound webhook URL above for incoming messages</p>
              <p>4. Set format to JSON, method to HTTP POST</p>
              <p>5. TNZ credentials are already configured in your backend</p>
              <p>6. Text your number to test!</p>
            </div>
          </div>

          {/* Phone Number Config */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide">
              <Phone size={10} className="inline mr-1" />
              TNZ Phone Number
            </p>
            <div className="flex gap-2">
              <input
                value={phoneNumber || config.twilio_phone_number || ""}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+6421234567"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none"
              />
              <button
                onClick={updatePhoneNumber}
                className="px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: agentColor + "20", color: agentColor }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Test */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide">
              <Send size={10} className="inline mr-1" />
              Test SMS
            </p>
            <div className="flex gap-2">
              <input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none"
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
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide">
              <Clock size={10} className="inline mr-1" />
              Recent Messages
            </p>
            {messages.length === 0 ? (
              <p className="text-xs text-white/25 py-4 text-center">
                No messages yet. Text your TNZ number to start a conversation.
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
                      <p className="text-[10px] text-white/50 truncate">{m.body}</p>
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
