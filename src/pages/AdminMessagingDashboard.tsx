import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Phone, Send, Clock, Users, BarChart3, Smartphone, Settings2, Activity, ArrowUpDown, Filter } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { motion } from "framer-motion";

const GOLD = "#4AA5A8";
const BG = "#FAFBFC";
const CARD_BG = "#FFFFFF";

interface Conversation {
  id: string;
  phone_number: string;
  contact_name: string | null;
  channel: string;
  status: string;
  assigned_agent: string | null;
  assigned_pack: string | null;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: string;
  body: string;
  channel: string;
  status: string;
  agent_used: string | null;
  response_time_ms: number | null;
  created_at: string;
}

interface KeteChannelConfig {
  id?: string;
  kete_code: string;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
}

const KETE_LIST = [
  { code: "manaaki", label: "Manaaki", subtitle: "Hospitality", color: "#F59E0B" },
  { code: "waihanga", label: "Waihanga", subtitle: "Construction", color: "#3B82F6" },
  { code: "auaha", label: "Auaha", subtitle: "Creative", color: "#EAB308" },
  { code: "arataki", label: "Arataki", subtitle: "Automotive", color: "#EF4444" },
  { code: "pikau", label: "Pikau", subtitle: "Freight", color: "#8B5CF6" },
  { code: "toro", label: "Tōro", subtitle: "Agriculture", color: "#22C55E" },
  { code: "whenua", label: "Whenua", subtitle: "Property", color: "#06B6D4" },
  { code: "toroa", label: "Tōro", subtitle: "Family", color: "#10B981" },
];

const AGENT_COLOURS: Record<string, string> = {
  aura: "bg-amber-600", cellar: "bg-amber-700", concierge: "bg-amber-500",
  arai: "bg-blue-600", kaupapa: "bg-blue-700", whakaae: "bg-blue-500", forge: "bg-blue-400",
  echo: "bg-yellow-600", prism: "bg-yellow-500", pixel: "bg-yellow-700",
  motor: "bg-red-600", transit: "bg-red-500",
  navigator: "bg-purple-600", gateway: "bg-purple-500",
  terra: "bg-green-600", reef: "bg-green-500",
  aroha: "bg-rose-600", iho: "bg-gray-600", kahu: "bg-gray-500",
};

const CHANNEL_ICON: Record<string, typeof Phone> = {
  sms: Phone,
  whatsapp: Smartphone,
  rcs: MessageSquare,
};

export default function AdminMessagingDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [keteFilter, setKeteFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [keteConfigs, setKeteConfigs] = useState<KeteChannelConfig[]>([]);
  const [activeTab, setActiveTab] = useState("conversations");

  // Stats
  const totalMessages = messages.length;
  const activeConvos = conversations.filter((c) => c.status === "active").length;
  const avgResponseTime = messages.filter((m) => m.response_time_ms).reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / (messages.filter((m) => m.response_time_ms).length || 1);
  const smsCount = conversations.filter((c) => c.channel === "sms").length;
  const waCount = conversations.filter((c) => c.channel === "whatsapp").length;

  const filteredConversations = conversations.filter((c) => {
    if (keteFilter !== "all" && c.assigned_pack !== keteFilter) return false;
    return true;
  });

  useEffect(() => {
    fetchConversations();
    fetchKeteConfigs();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [channelFilter]);

  useEffect(() => {
    if (!selectedConvo) return;
    fetchMessages(selectedConvo);

    const channel = supabase
      .channel(`msg-${selectedConvo}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messaging_messages", filter: `conversation_id=eq.${selectedConvo}` }, () => {
        fetchMessages(selectedConvo);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo]);

  async function fetchConversations() {
    let query = supabase.from("messaging_conversations").select("*").order("updated_at", { ascending: false }).limit(100);
    if (channelFilter !== "all") {
      query = query.eq("channel", channelFilter);
    }
    const { data } = await query;
    if (data) setConversations(data as unknown as Conversation[]);
  }

  async function fetchMessages(convoId: string) {
    const { data } = await supabase
      .from("messaging_messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as unknown as Message[]);
  }

  async function fetchKeteConfigs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("kete_channel_config").select("*").eq("user_id", user.id);
    const configs: KeteChannelConfig[] = KETE_LIST.map((k) => {
      const existing = (data || []).find((d: any) => d.kete_code === k.code);
      return existing
        ? { id: existing.id, kete_code: existing.kete_code, sms_enabled: existing.sms_enabled, whatsapp_enabled: existing.whatsapp_enabled }
        : { kete_code: k.code, sms_enabled: true, whatsapp_enabled: true };
    });
    setKeteConfigs(configs);
  }

  async function toggleKeteChannel(keteCode: string, channel: "sms" | "whatsapp", enabled: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = keteConfigs.find((c) => c.kete_code === keteCode);
    const update = channel === "sms" ? { sms_enabled: enabled } : { whatsapp_enabled: enabled };

    if (existing?.id) {
      await supabase.from("kete_channel_config").update({ ...update, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("kete_channel_config").insert({
        user_id: user.id,
        kete_code: keteCode,
        sms_enabled: channel === "sms" ? enabled : true,
        whatsapp_enabled: channel === "whatsapp" ? enabled : true,
      } as any);
    }

    setKeteConfigs((prev) =>
      prev.map((c) => c.kete_code === keteCode ? { ...c, [channel === "sms" ? "sms_enabled" : "whatsapp_enabled"]: enabled } : c)
    );
  }

  async function updateStatus(convoId: string, status: string) {
    await supabase.from("messaging_conversations").update({ status }).eq("id", convoId);
    fetchConversations();
  }

  async function sendManualReply() {
    if (!replyText.trim() || !selectedConvo) return;
    setSending(true);
    const convo = conversations.find((c) => c.id === selectedConvo);
    if (!convo) { setSending(false); return; }

    try {
      const { error } = await supabase.functions.invoke("tnz-send", {
        body: { channel: convo.channel, to: convo.phone_number, message: replyText, conversationId: convo.id },
      });
      if (!error) { setReplyText(""); fetchMessages(selectedConvo); }
    } catch (e) {
      console.error("Send failed:", e);
    }
    setSending(false);
  }

  return (
    <AdminShell
      title="Messaging Hub"
      subtitle="SMS & WhatsApp across all kete • TNZ Group Gateway"
      icon={<MessageSquare size={18} style={{ color: GOLD }} />}
      backTo="/admin/dashboard"
      actions={
        <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
          <Activity className="w-3 h-3 mr-1" /> LIVE
        </Badge>
      }
    >

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Messages" value={totalMessages} />
          <StatCard icon={<Users className="w-4 h-4" />} label="Active" value={activeConvos} />
          <StatCard icon={<Clock className="w-4 h-4" />} label="Avg Response" value={`${Math.round(avgResponseTime)}ms`} />
          <StatCard icon={<Phone className="w-4 h-4" />} label="SMS" value={smsCount} accent="#3B82F6" />
          <StatCard icon={<Smartphone className="w-4 h-4" />} label="WhatsApp" value={waCount} accent="#22C55E" />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#FAFBFC] border border-gray-200">
            <TabsTrigger value="conversations" className="data-[state=active]:bg-[#4AA5A8]/20 data-[state=active]:text-[#4AA5A8]">
              <MessageSquare className="w-4 h-4 mr-1" /> Conversations
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-[#4AA5A8]/20 data-[state=active]:text-[#4AA5A8]">
              <Settings2 className="w-4 h-4 mr-1" /> Channel Config
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-[#4AA5A8]/20 data-[state=active]:text-[#4AA5A8]">
              <BarChart3 className="w-4 h-4 mr-1" /> Message Logs
            </TabsTrigger>
          </TabsList>

          {/* ═══ CONVERSATIONS TAB ═══ */}
          <TabsContent value="conversations">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/40" />
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-[#F5F5F7] border-gray-200">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={keteFilter} onValueChange={setKeteFilter}>
                <SelectTrigger className="w-36 h-8 text-xs bg-[#F5F5F7] border-gray-200">
                  <SelectValue placeholder="Kete" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Kete</SelectItem>
                  {KETE_LIST.map((k) => (
                    <SelectItem key={k.code} value={k.code}>{k.label} — {k.subtitle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversation List */}
              <Card className="bg-[#FAFBFC] border-gray-200 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-white/60 flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" /> Conversations ({filteredConversations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    {filteredConversations.map((c) => {
                      const ChannelIcon = CHANNEL_ICON[c.channel] || MessageSquare;
                      const kete = KETE_LIST.find((k) => k.code === c.assigned_pack);
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedConvo(c.id)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-white/5 transition ${selectedConvo === c.id ? "bg-white/10 border-l-2 border-l-[#4AA5A8]" : ""}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <ChannelIcon className="w-4 h-4 text-white/40" />
                            <span className="text-sm font-medium text-foreground truncate">{c.contact_name || c.phone_number}</span>
                            <Badge className={`text-[10px] ml-auto ${c.channel === "whatsapp" ? "bg-green-700/50 text-green-300" : "bg-blue-700/50 text-blue-300"}`}>
                              {c.channel.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {kete && (
                              <Badge className="text-[10px] py-0" style={{ backgroundColor: kete.color + "30", color: kete.color }}>
                                {kete.label}
                              </Badge>
                            )}
                            {c.assigned_agent && (
                              <Badge className={`text-[9px] py-0 ${AGENT_COLOURS[c.assigned_agent] || "bg-gray-600"}`}>
                                {c.assigned_agent.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-[10px] text-gray-400 ml-auto">
                              {new Date(c.updated_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    {filteredConversations.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Message Thread */}
              <Card className="bg-[#FAFBFC] border-gray-200 lg:col-span-2">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-wider text-white/60">
                    {selectedConvo ? "Thread" : "Select a conversation"}
                  </CardTitle>
                  {selectedConvo && (
                    <Select
                      value={conversations.find((c) => c.id === selectedConvo)?.status || "active"}
                      onValueChange={(v) => updateStatus(selectedConvo, v)}
                    >
                      <SelectTrigger className="w-28 h-7 text-xs bg-[#F5F5F7] border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] px-4">
                    {messages.map((m) => (
                      <div key={m.id} className={`mb-3 flex ${m.direction === "inbound" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.direction === "inbound" ? "bg-[#1A3A5C] text-foreground" : "bg-[#3A7D6E] text-foreground"}`}>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-white/40">
                              {new Date(m.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {m.agent_used && (
                              <Badge className={`text-[9px] py-0 ${AGENT_COLOURS[m.agent_used] || "bg-gray-600"}`}>
                                {m.agent_used.toUpperCase()}
                              </Badge>
                            )}
                            {m.response_time_ms && (
                              <span className="text-[9px] text-gray-400">{m.response_time_ms}ms</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!selectedConvo && (
                      <div className="flex items-center justify-center h-full text-gray-300 text-sm pt-40">
                        Select a conversation to view messages
                      </div>
                    )}
                  </ScrollArea>

                  {/* Manual reply */}
                  {selectedConvo && (
                    <div className="p-4 border-t border-gray-200 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendManualReply()}
                        placeholder="Type a manual reply..."
                        className="flex-1 bg-[#F5F5F7] border border-gray-200 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:border-[#4AA5A8]/50"
                      />
                      <Button
                        onClick={sendManualReply}
                        disabled={sending || !replyText.trim()}
                        size="sm"
                        className="bg-[#4AA5A8] hover:bg-[#4AA5A8]/80 text-black"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ CHANNEL CONFIG TAB ═══ */}
          <TabsContent value="channels">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {KETE_LIST.map((kete) => {
                const config = keteConfigs.find((c) => c.kete_code === kete.code);
                const smsOn = config?.sms_enabled ?? true;
                const waOn = config?.whatsapp_enabled ?? true;

                return (
                  <motion.div
                    key={kete.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: KETE_LIST.indexOf(kete) * 0.05 }}
                  >
                    <Card className="bg-[#FAFBFC] border-gray-200 hover:border-gray-300 transition">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-semibold" style={{ color: kete.color }}>
                              {kete.label}
                            </CardTitle>
                            <p className="text-[10px] text-white/40 font-mono">{kete.subtitle}</p>
                          </div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: smsOn || waOn ? "#22C55E" : "#EF4444" }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-white/70">SMS</span>
                          </div>
                          <Switch
                            checked={smsOn}
                            onCheckedChange={(v) => toggleKeteChannel(kete.code, "sms", v)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-white/70">WhatsApp</span>
                          </div>
                          <Switch
                            checked={waOn}
                            onCheckedChange={(v) => toggleKeteChannel(kete.code, "whatsapp", v)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400">
                            {smsOn && waOn ? "All channels active" : smsOn ? "SMS only" : waOn ? "WhatsApp only" : "All channels paused"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ MESSAGE LOGS TAB ═══ */}
          <TabsContent value="logs">
            <MessageLogsTable />
          </TabsContent>
        </Tabs>
    </AdminShell>
  );
}

function MessageLogsTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from("messaging_messages")
        .select("id, direction, channel, body, agent_used, status, response_time_ms, created_at, from_number, to_number, tnz_reference")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center text-gray-400 py-12">Loading logs...</div>;

  return (
    <Card className="bg-[#FAFBFC] border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-wider text-white/60">
          Recent Message Log ({logs.length} entries)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#FAFBFC] border-b border-gray-200">
              <tr className="text-assembl-text/40 uppercase tracking-wider">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Dir</th>
                <th className="text-left p-3">Channel</th>
                <th className="text-left p-3">From / To</th>
                <th className="text-left p-3">Agent</th>
                <th className="text-left p-3">Body</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Speed</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-white/5 transition">
                  <td className="p-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-3">
                    <Badge className={`text-[9px] ${log.direction === "inbound" ? "bg-blue-700/30 text-blue-300" : "bg-green-700/30 text-green-300"}`}>
                      {log.direction === "inbound" ? "IN" : "OUT"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={`text-[9px] ${log.channel === "whatsapp" ? "bg-green-700/30 text-green-300" : "bg-blue-700/30 text-blue-300"}`}>
                      {log.channel?.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3 text-white/60 font-mono text-[10px]">
                    {log.direction === "inbound" ? log.from_number : log.to_number}
                  </td>
                  <td className="p-3">
                    {log.agent_used && (
                      <Badge className={`text-[9px] ${AGENT_COLOURS[log.agent_used] || "bg-gray-600"}`}>
                        {log.agent_used.toUpperCase()}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-white/70 max-w-[300px] truncate">{log.body}</td>
                  <td className="p-3">
                    <Badge className={`text-[9px] ${log.status === "sent" || log.status === "delivered" ? "bg-emerald-700/30 text-emerald-300" : log.status === "failed" ? "bg-red-700/30 text-red-300" : "bg-gray-700/30 text-gray-300"}`}>
                      {log.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right text-white/40">
                    {log.response_time_ms ? `${log.response_time_ms}ms` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-12 text-center text-gray-400">No message logs yet</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <Card className="bg-[#FAFBFC] border-gray-200">
      <CardContent className="p-3 flex items-center gap-3">
        <div style={{ color: accent || GOLD }}>{icon}</div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
