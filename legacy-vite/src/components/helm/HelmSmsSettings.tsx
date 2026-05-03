import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Phone, Plus, X, Clock, Bell, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const HELM_COLOR = "#3A6A9C";

interface SmsConfig {
  id: string;
  family_id: string;
  enabled: boolean;
  twilio_phone_number: string | null;
  morning_briefing: boolean;
  briefing_time: string;
  reminder_notifications: boolean;
}

interface SmsConversation {
  id: string;
  phone_number: string;
  display_name: string | null;
  verified: boolean;
  opted_in: boolean;
}

interface Props {
  familyId: string | null;
}

export default function HelmSmsSettings({ familyId }: Props) {
  const { user } = useAuth();
  const [config, setConfig] = useState<SmsConfig | null>(null);
  const [conversations, setConversations] = useState<SmsConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (familyId) loadSmsData();
  }, [familyId]);

  const loadSmsData = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const [configRes, convosRes] = await Promise.all([
        supabase.from("helm_sms_config").select("*").eq("family_id", familyId).single(),
        supabase.from("helm_sms_conversations").select("*").eq("family_id", familyId).order("created_at", { ascending: false }),
      ]);
      setConfig(configRes.data as SmsConfig | null);
      setConversations((convosRes.data || []) as SmsConversation[]);
    } catch (e) {
      console.error("[TORO SMS] Load error:", e);
    }
    setLoading(false);
  };

  const enableSms = async () => {
    if (!familyId) return;
    const { data, error } = await supabase
      .from("helm_sms_config")
      .upsert({ family_id: familyId, enabled: true }, { onConflict: "family_id" })
      .select()
      .single();
    if (error) {
      toast.error("Failed to enable SMS: " + error.message);
      return;
    }
    setConfig(data as SmsConfig);
    toast.success("SMS enabled for your family!");
  };

  const toggleConfig = async (field: string, value: boolean) => {
    if (!config) return;
    const { error } = await supabase
      .from("helm_sms_config")
      .update({ [field]: value, updated_at: new Date().toISOString() } as any)
      .eq("id", config.id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    setConfig({ ...config, [field]: value });
  };

  const addPhoneNumber = async () => {
    if (!familyId || !newPhone.trim()) return;
    // Normalise NZ phone numbers
    let phone = newPhone.trim().replace(/\s/g, "");
    if (phone.startsWith("0")) phone = "+64" + phone.slice(1);
    if (!phone.startsWith("+")) phone = "+64" + phone;

    const { error } = await supabase.from("helm_sms_conversations").upsert(
      {
        family_id: familyId,
        phone_number: phone,
        display_name: newName.trim() || phone,
        verified: true,
        opted_in: true,
      },
      { onConflict: "phone_number" }
    );
    if (error) {
      toast.error("Failed to add number: " + error.message);
      return;
    }
    toast.success(`${newName || phone} added!`);
    setNewPhone("");
    setNewName("");
    setShowAddPhone(false);
    loadSmsData();
  };

  const removePhone = async (id: string) => {
    const { error } = await supabase.from("helm_sms_conversations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove: " + error.message);
      return;
    }
    setConversations(conversations.filter((c) => c.id !== id));
  };

  const webhookUrl = `${window.location.origin.replace("localhost:8080", "<your-supabase-project>.supabase.co")}/functions/v1/helm-sms`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Webhook URL copied!");
  };

  if (loading) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-gray-400">Loading SMS settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={16} style={{ color: HELM_COLOR }} />
        <h3 className="text-xs font-semibold text-white/60">Text Messaging (SMS)</h3>
      </div>

      {/* Enable SMS */}
      {!config?.enabled ? (
        <div
          className="rounded-lg p-4 text-center space-y-3"
          style={{ background: HELM_COLOR + "08", border: `1px solid ${HELM_COLOR}15` }}
        >
          <MessageSquare size={24} style={{ color: HELM_COLOR }} className="mx-auto" />
          <div>
            <p className="text-sm text-white/80 font-medium">Text TORO from your phone</p>
            <p className="text-[10px] text-white/40 mt-1">
              Get morning briefings, set reminders, ask about dinner — all via text message. Just like texting a
              super-organised friend.
            </p>
          </div>
          <button
            onClick={enableSms}
            className="px-4 py-2 rounded-lg text-xs font-medium transition"
            style={{ background: HELM_COLOR + "20", color: HELM_COLOR, border: `1px solid ${HELM_COLOR}30` }}
          >
            Enable SMS
          </button>
        </div>
      ) : (
        <>
          {/* Twilio Setup Instructions */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Twilio Webhook URL</p>
            <div className="flex items-center gap-2">
              <code className="text-[10px] px-2 py-1.5 rounded bg-white/5 text-gray-500 font-mono flex-1 truncate">
                {webhookUrl}
              </code>
              <button onClick={copyWebhook} className="p-1.5 rounded hover:bg-white/5 transition">
                {copied ? (
                  <Check size={12} style={{ color: HELM_COLOR }} />
                ) : (
                  <Copy size={12} className="text-white/40" />
                )}
              </button>
            </div>
            <p className="text-[9px] text-white/20">
              Set this as the webhook URL for incoming messages on your Twilio phone number.
            </p>
          </div>

          {/* Preferences */}
          <div
            className="rounded-lg p-3 space-y-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Preferences</p>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs text-white/70">
                <Clock size={12} style={{ color: HELM_COLOR }} />
                Morning briefing
              </span>
              <button
                onClick={() => toggleConfig("morning_briefing", !config.morning_briefing)}
                className="w-8 h-4 rounded-full transition-all relative"
                style={{
                  background: config.morning_briefing ? HELM_COLOR + "60" : "rgba(255,255,255,0.1)",
                }}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{
                    left: config.morning_briefing ? "17px" : "2px",
                    background: config.morning_briefing ? HELM_COLOR : "rgba(255,255,255,0.3)",
                  }}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs text-white/70">
                <Bell size={12} style={{ color: HELM_COLOR }} />
                Reminder notifications
              </span>
              <button
                onClick={() => toggleConfig("reminder_notifications", !config.reminder_notifications)}
                className="w-8 h-4 rounded-full transition-all relative"
                style={{
                  background: config.reminder_notifications ? HELM_COLOR + "60" : "rgba(255,255,255,0.1)",
                }}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{
                    left: config.reminder_notifications ? "17px" : "2px",
                    background: config.reminder_notifications ? HELM_COLOR : "rgba(255,255,255,0.3)",
                  }}
                />
              </button>
            </label>
          </div>

          {/* Family Phone Numbers */}
          <div
            className="rounded-lg p-3 space-y-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                <Phone size={10} className="inline mr-1" />
                Family Phone Numbers
              </p>
              <button
                onClick={() => setShowAddPhone(true)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg hover:bg-white/5"
                style={{ color: HELM_COLOR }}
              >
                <Plus size={10} /> Add
              </button>
            </div>

            {showAddPhone && (
              <div
                className="rounded-lg p-3 space-y-2"
                style={{ background: HELM_COLOR + "08", border: `1px solid ${HELM_COLOR}15` }}
              >
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name (e.g. Mum, Dad)"
                  className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none"
                />
                <input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone (e.g. 021 123 4567)"
                  className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addPhoneNumber}
                    disabled={!newPhone.trim()}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                    style={{ background: HELM_COLOR + "20", color: HELM_COLOR }}
                  >
                    Add Number
                  </button>
                  <button
                    onClick={() => setShowAddPhone(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg p-3 flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ background: HELM_COLOR }}
                  >
                    {(c.display_name || c.phone_number)[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white/80">{c.display_name || c.phone_number}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{c.phone_number}</p>
                    <div className="flex gap-2 mt-0.5">
                      {c.verified && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#5AADA0]/10 text-[#5AADA0]/60">
                          Verified
                        </span>
                      )}
                      {c.opted_in ? (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#1A3A5C]/10 text-blue-400/60">
                          Active
                        </span>
                      ) : (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#C85A54]/10 text-[#C85A54]/60">
                          Opted out
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removePhone(c.id)}
                    className="p-1 rounded hover:bg-[#C85A54]/20 transition"
                  >
                    <X size={12} className="text-[#C85A54]/50" />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-white/25 py-3 text-center">
                  No phone numbers added yet. Add family members' numbers to let them text TORO.
                </p>
              )}
            </div>
          </div>

          {/* How it works */}
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2">How it works</p>
            <div className="space-y-1.5 text-[10px] text-white/35">
              <p>1. Add your family's phone numbers above</p>
              <p>2. Family members text the TORO number</p>
              <p>3. TORO responds like a super-organised family assistant</p>
              <p>4. Try: "What's for dinner?" or "Remind me to pack lunches at 7am"</p>
            </div>
            <div className="mt-3 p-2 rounded bg-white/3">
              <p className="text-[9px] text-white/20">
                Text STOP to unsubscribe, START to re-subscribe. Standard SMS rates apply.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
