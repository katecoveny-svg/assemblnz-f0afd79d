import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Send, Phone, Check, CheckCheck, AlertCircle,
  Image as ImageIcon, FileText, Search, Filter,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  body: string;
  direction: string;
  channel: string;
  created_at: string;
  phone_number: string;
  agent_id: string;
  media_url?: string | null;
  media_type?: string | null;
  image_description?: string | null;
  whatsapp_status?: string | null;
  whatsapp_message_id?: string | null;
}

interface ConversationGroup {
  phone_number: string;
  channel: string;
  agent_id: string;
  last_message_at: string;
  last_body: string;
  message_count: number;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(74,165,168,0.15)",
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const StatusIcon = ({ status }: { status?: string | null }) => {
  switch (status) {
    case "read": return <CheckCheck className="w-3.5 h-3.5 text-[#3A6A9C]" />;
    case "delivered": return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
    case "sent": return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
    case "failed": return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
    default: return null;
  }
};

export default function AdminMessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [channelFilter, setChannelFilter] = useState<"all" | "sms" | "whatsapp">("all");
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin");
  }, [user, authLoading, navigate]);

  // Fetch grouped conversations
  useEffect(() => {
    const fetchConversations = async () => {
      let query = supabase
        .from("agent_sms_messages")
        .select("phone_number, channel, agent_id, body, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (channelFilter !== "all") {
        query = query.eq("channel", channelFilter);
      }

      const { data } = await query;
      if (!data) return;

      // Group by phone_number + channel
      const groups: Record<string, ConversationGroup> = {};
      for (const m of data) {
        const key = `${m.phone_number}__${m.channel}`;
        if (!groups[key]) {
          groups[key] = {
            phone_number: m.phone_number,
            channel: m.channel || "sms",
            agent_id: m.agent_id,
            last_message_at: m.created_at,
            last_body: m.body,
            message_count: 1,
          };
        } else {
          groups[key].message_count++;
        }
      }

      const sorted = Object.values(groups).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setConversations(sorted);
    };

    fetchConversations();

    const channel = supabase
      .channel("admin-messages-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_sms_messages" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [channelFilter]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedPhone || !selectedChannel) { setMessages([]); return; }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("agent_sms_messages")
        .select("*")
        .eq("phone_number", selectedPhone)
        .eq("channel", selectedChannel)
        .order("created_at", { ascending: true })
        .limit(200);

      setMessages((data as Message[]) || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(`msgs-${selectedPhone}-${selectedChannel}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "agent_sms_messages",
      }, () => { fetchMessages(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedPhone, selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedPhone || !selectedChannel) return;
    setSending(true);

    try {
      const fnName = selectedChannel === "whatsapp" ? "send-whatsapp" : "agent-sms";
      const { error } = await supabase.functions.invoke(fnName, {
        body: {
          phoneNumber: selectedPhone,
          message: replyText,
          agentId: conversations.find(c => c.phone_number === selectedPhone && c.channel === selectedChannel)?.agent_id || "echo",
        },
      });
      if (!error) setReplyText("");
    } catch (e) {
      console.error("Send error:", e);
    }
    setSending(false);
  };

  const filtered = searchTerm
    ? conversations.filter(c => c.phone_number.includes(searchTerm) || c.last_body.toLowerCase().includes(searchTerm.toLowerCase()))
    : conversations;

  if (authLoading) return null;

  return (
    <AdminShell
      title="Messages"
      subtitle={`${conversations.length} conversations`}
      icon={<MessageSquare size={18} style={{ color: "#3A7D6E" }} />}
      backTo="/admin/dashboard"
    >

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar — conversation list */}
        <div className="w-80 border-r border-border/40 flex flex-col" style={glassStyle}>
          {/* Filters */}
          <div className="p-3 border-b border-border/40 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-muted/30 border border-border/40 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Tabs value={channelFilter} onValueChange={v => setChannelFilter(v as typeof channelFilter)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
                <TabsTrigger value="sms" className="flex-1 text-xs">
                  <Phone className="w-3 h-3 mr-1" />SMS
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex-1 text-xs">
                  <WhatsAppIcon />
                  <span className="ml-1">WhatsApp</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No conversations found</div>
            ) : (
              filtered.map((conv) => {
                const isActive = selectedPhone === conv.phone_number && selectedChannel === conv.channel;
                return (
                  <button
                    key={`${conv.phone_number}__${conv.channel}`}
                    onClick={() => { setSelectedPhone(conv.phone_number); setSelectedChannel(conv.channel); }}
                    className={`w-full p-3 text-left border-b border-border/20 hover:bg-accent/5 transition-colors ${isActive ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {conv.channel === "whatsapp" ? <WhatsAppIcon /> : <Phone className="w-4 h-4 text-primary" />}
                        <span className="font-medium text-sm">{conv.phone_number}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.last_message_at).toLocaleDateString("en-NZ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.last_body}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{conv.agent_id.toUpperCase()}</Badge>
                      <span className="text-[10px] text-muted-foreground">{conv.message_count} msgs</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {selectedPhone && selectedChannel ? (
            <>
              {/* Thread header */}
              <div className="p-4 border-b border-border/40 flex items-center gap-3" style={glassStyle}>
                {selectedChannel === "whatsapp" ? <WhatsAppIcon /> : <Phone className="w-5 h-5 text-primary" />}
                <div>
                  <span className="font-bold">{selectedPhone}</span>
                  <span className="ml-2 text-xs text-muted-foreground uppercase">{selectedChannel}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.direction === "outbound"
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-muted/40 border border-border/30"
                    }`}>
                      {msg.media_url && msg.media_type === "image" && (
                        <div className="mb-2">
                          <img src={msg.media_url} alt="Shared" className="rounded-lg max-w-full max-h-48 object-cover" >
                          {msg.image_description && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">
                              AI: {msg.image_description}
                            </p>
                          )}
                        </div>
                      )}
                      {msg.media_url && msg.media_type && msg.media_type !== "image" && (
                        <div className="flex items-center gap-1 mb-1 text-xs text-accent">
                          <FileText className="w-3 h-3" />
                          <span>{msg.media_type}</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {msg.direction === "outbound" && msg.channel === "whatsapp" && (
                          <StatusIcon status={msg.whatsapp_status} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="p-4 border-t border-border/40" style={glassStyle}>
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendReply()}
                    placeholder={`Reply via ${selectedChannel === "whatsapp" ? "WhatsApp" : "SMS"}...`}
                    className="flex-1 bg-muted/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose an SMS or WhatsApp conversation from the sidebar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
