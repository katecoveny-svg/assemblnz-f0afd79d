import { agentChat } from "@/lib/agentChat";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, MessageCircle, ShoppingCart, Calendar, Bell, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  msg_type: string;
  metadata: Record<string, any>;
  read_by: string[];
  created_at: string;
}

const MSG_ICONS: Record<string, React.ReactNode> = {
  grocery_update: <ShoppingCart className="w-3 h-3" />,
  appointment_update: <Calendar className="w-3 h-3" />,
  reminder: <Bell className="w-3 h-3" />,
  system: <Bot className="w-3 h-3" />,
};

const MSG_COLORS: Record<string, string> = {
  grocery_update: "bg-emerald-500/10 border-emerald-500/20",
  appointment_update: "bg-blue-500/10 border-blue-500/20",
  reminder: "bg-amber-500/10 border-amber-500/20",
  system: "bg-purple-500/10 border-purple-500/20",
};

export default function HelmFamilyChat({ familyId, familyMembers }: { familyId: string | null; familyMembers?: { user_id: string; display_name: string }[] }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    if (!familyId) return;
    const load = async () => {
      const { data } = await supabase
        .from("helm_family_chat" as any)
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages((data || []) as unknown as ChatMessage[]);
      setLoading(false);
    };
    load();

    // Real-time subscription
    const channel = supabase
      .channel(`family-chat-${familyId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "helm_family_chat", filter: `family_id=eq.${familyId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [familyId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !familyId || !user) return;
    const displayName = familyMembers?.find(m => m.user_id === user.id)?.display_name || user.email?.split("@")[0] || "You";

    await supabase.from("helm_family_chat" as any).insert({
      family_id: familyId,
      sender_id: user.id,
      sender_name: displayName,
      content: input.trim(),
      msg_type: "text",
    } as any);

    setInput("");

    // If the message looks like a TŌROA command, also send to TŌROA for processing
    const lc = input.trim().toLowerCase();
    if (lc.startsWith("helm ") || lc.startsWith("@helm") || lc.includes("add to groceries") || lc.includes("book ") || lc.includes("remind ")) {
      // Send to TŌROA agent via chat function
      try {
        await supabase.functions.invoke("chat", {
          body: {
            agentId: "operations",
            messages: [{ role: "user", content: input.trim() }],
            helmContext: { familyId, source: "family_chat" },
          },
        });
      } catch (_) {
        // Non-blocking — TŌROA response will come through the chat channel
      }
    }
  }, [input, familyId, user, familyMembers]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
    return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  // Generate initials and color for avatar
  const getAvatar = (name: string) => {
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const colors = ["bg-cyan-500", "bg-purple-500", "bg-pink-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
    const idx = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
    return { initials, color: colors[idx] };
  };

  if (!familyId) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-10 h-10 text-purple-400/40 mx-auto mb-3" />
        <p className="text-sm text-white/40">Set up your family first to use group chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Family Chat</h2>
        <span className="text-xs text-white/30 ml-auto">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bot className="w-8 h-8 text-purple-400/40 mx-auto mb-3" />
            <p className="text-sm text-white/30">Start your family chat</p>
            <p className="text-xs text-white/20 mt-1">Messages here are shared with all family members</p>
            <p className="text-xs text-purple-400/40 mt-2">Tip: Tag @TŌROA to get assistant help</p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === user?.id;
          const isSystem = !msg.sender_id || msg.msg_type !== "text";
          const avatar = getAvatar(msg.sender_name);

          if (isSystem) {
            const msgColor = MSG_COLORS[msg.msg_type] || "bg-white/5 border-white/10";
            return (
              <div key={msg.id} className={`mx-4 px-3 py-2 rounded-lg border text-xs ${msgColor}`}>
                <div className="flex items-center gap-1.5 text-white/50 mb-0.5">
                  {MSG_ICONS[msg.msg_type] || <Bot className="w-3 h-3" />}
                  <span className="font-medium">{msg.sender_name}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/20">{formatTime(msg.created_at)}</span>
                </div>
                <p className="text-white/60">{msg.content}</p>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex gap-2.5 px-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center`}>
                <span className="text-[10px] font-bold text-white">{avatar.initials}</span>
              </div>
              <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                <div className={`flex items-center gap-2 mb-0.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-[10px] font-medium text-white/40">{msg.sender_name}</span>
                  <span className="text-[9px] text-white/20">{formatTime(msg.created_at)}</span>
                </div>
                <div className={`rounded-2xl px-3.5 py-2 text-sm ${
                  isMe
                    ? "bg-purple-500 text-white rounded-br-sm"
                    : "bg-white/5 text-white/80 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Message your family... (tag @TŌROA for help)"
            className="flex-1 text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="shrink-0 w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center disabled:opacity-30 hover:bg-purple-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-white/20 mt-1.5 text-center">
          Family members also receive updates via SMS
        </p>
      </div>
    </div>
  );
}
