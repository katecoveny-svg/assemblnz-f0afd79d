import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Phone, Send, Clock, Users, BarChart3, Smartphone } from "lucide-react";
import BrandNav from "@/components/BrandNav";

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

const AGENT_COLOURS: Record<string, string> = {
  toroa: "bg-emerald-600",
  aroha: "bg-rose-600",
  aura: "bg-amber-600",
  hanga: "bg-blue-600",
  waihanga: "bg-blue-600",
  manaaki: "bg-amber-600",
  auaha: "bg-yellow-600",
};

const AGENT_LABELS: Record<string, string> = {
  toroa: "Tōroa",
  aroha: "AROHA",
  aura: "AURA",
  hanga: "Waihanga",
  waihanga: "Waihanga",
  manaaki: "Manaaki",
  auaha: "Auaha",
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
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // Stats
  const totalMessages = messages.length;
  const activeConvos = conversations.filter((c) => c.status === "active").length;
  const avgResponseTime = messages.filter((m) => m.response_time_ms).reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / (messages.filter((m) => m.response_time_ms).length || 1);
  const smsCount = conversations.filter((c) => c.channel === "sms").length;
  const waCount = conversations.filter((c) => c.channel === "whatsapp").length;

  useEffect(() => {
    fetchConversations();
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
      if (!error) setReplyText("");
    } catch (e) {
      console.error("Send failed:", e);
    }
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-[#09090F] text-white">
      <BrandNav />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-light uppercase tracking-[6px] text-[#D4A843] mb-8">
          Messaging Dashboard
        </h1>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<MessageSquare className="w-5 h-5" />} label="Total Messages" value={totalMessages} />
          <StatCard icon={<Users className="w-5 h-5" />} label="Active Conversations" value={activeConvos} />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Avg Response" value={`${Math.round(avgResponseTime)}ms`} />
          <StatCard icon={<BarChart3 className="w-5 h-5" />} label="SMS / WhatsApp" value={`${smsCount} / ${waCount}`} />
        </div>

        {/* Channel Filter */}
        <Tabs value={channelFilter} onValueChange={setChannelFilter} className="mb-6">
          <TabsList className="bg-[#0F0F1A] border border-white/10">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="rcs">RCS</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <Card className="bg-[#0F0F1A] border-white/10 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-white/60">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {conversations.map((c) => {
                  const ChannelIcon = CHANNEL_ICON[c.channel] || MessageSquare;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConvo(c.id)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${selectedConvo === c.id ? "bg-white/10" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ChannelIcon className="w-4 h-4 text-white/40" />
                        <span className="text-sm font-medium text-white">{c.contact_name || c.phone_number}</span>
                        <Badge className={`text-[10px] ml-auto ${c.channel === "whatsapp" ? "bg-green-700" : c.channel === "rcs" ? "bg-cyan-700" : "bg-[#1A3A5C]"}`}>
                          {c.channel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.assigned_agent && (
                          <Badge className={`text-[10px] ${AGENT_COLOURS[c.assigned_agent] || "bg-gray-600"}`}>
                            {AGENT_LABELS[c.assigned_agent] || c.assigned_agent}
                          </Badge>
                        )}
                        <span className="text-[10px] text-white/30 ml-auto">
                          {new Date(c.updated_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {conversations.length === 0 && (
                  <div className="p-8 text-center text-white/30 text-sm">No conversations yet</div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="bg-[#0F0F1A] border-white/10 lg:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-wider text-white/60">
                {selectedConvo ? "Thread" : "Select a conversation"}
              </CardTitle>
              {selectedConvo && (
                <Select
                  value={conversations.find((c) => c.id === selectedConvo)?.status || "active"}
                  onValueChange={(v) => updateStatus(selectedConvo, v)}
                >
                  <SelectTrigger className="w-32 h-8 text-xs bg-[#09090F] border-white/10">
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
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.direction === "inbound" ? "bg-[#1A3A5C] text-white" : "bg-[#3A7D6E] text-white"}`}>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/40">
                          {new Date(m.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {m.agent_used && (
                          <Badge className={`text-[9px] py-0 ${AGENT_COLOURS[m.agent_used] || "bg-gray-600"}`}>
                            {AGENT_LABELS[m.agent_used] || m.agent_used}
                          </Badge>
                        )}
                        {m.response_time_ms && (
                          <span className="text-[9px] text-white/30">{m.response_time_ms}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>

              {/* Manual reply */}
              {selectedConvo && (
                <div className="p-4 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendManualReply()}
                    placeholder="Type a manual reply..."
                    className="flex-1 bg-[#09090F] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A843]/50"
                  />
                  <Button
                    onClick={sendManualReply}
                    disabled={sending || !replyText.trim()}
                    size="sm"
                    className="bg-[#D4A843] hover:bg-[#D4A843]/80 text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="bg-[#0F0F1A] border-white/10">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="text-[#D4A843]">{icon}</div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
