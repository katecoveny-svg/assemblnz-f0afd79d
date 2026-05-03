import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminShell from "@/components/admin/AdminShell";
import { Phone, MessageSquare, Plus, ToggleLeft, ToggleRight, Send, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { agents, echoAgent, pilotAgent } from "@/data/agents";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const ALL_AGENTS = [echoAgent, pilotAgent, ...agents];

interface PhoneNumber {
  id: string;
  twilio_number: string;
  agent_id: string;
  agent_name: string;
  is_active: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  phone_number: string;
  agent_id: string;
  is_active: boolean;
  last_message_at: string;
  created_at: string;
  message_count?: number;
}

interface SmsMessage {
  id: string;
  direction: string;
  body: string;
  created_at: string;
  status: string;
}

const AdminSmsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"numbers" | "conversations">("numbers");
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Add number form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTwilioNumber, setNewTwilioNumber] = useState("");
  const [newAgentId, setNewAgentId] = useState("");

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    if (tab === "numbers") {
      const { data } = await supabase.from("sms_phone_numbers" as any).select("*").order("created_at", { ascending: false });
      setPhoneNumbers((data as any) || []);
    } else {
      const { data } = await supabase.from("sms_conversations" as any).select("*").order("last_message_at", { ascending: false });
      setConversations((data as any) || []);
    }
    setLoading(false);
  };

  const addPhoneNumber = async () => {
    if (!newTwilioNumber || !newAgentId) {
      toast.error("Please fill in all fields");
      return;
    }
    const agent = ALL_AGENTS.find(a => a.id === newAgentId);
    const { error } = await supabase.from("sms_phone_numbers" as any).insert({
      twilio_number: newTwilioNumber,
      agent_id: newAgentId,
      agent_name: agent?.name || newAgentId.toUpperCase(),
    } as any);
    if (error) {
      toast.error("Failed to add number: " + error.message);
    } else {
      toast.success("Phone number added");
      setShowAddForm(false);
      setNewTwilioNumber("");
      setNewAgentId("");
      loadData();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase.from("sms_phone_numbers" as any).update({ is_active: !currentState } as any).eq("id", id);
    loadData();
  };

  const loadMessages = async (convo: Conversation) => {
    setSelectedConvo(convo);
    const { data } = await supabase
      .from("sms_messages" as any)
      .select("*")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });
    setMessages((data as any) || []);
  };

  const maskPhone = (phone: string) => {
    if (phone.length < 6) return phone;
    return phone.slice(0, 4) + "****" + phone.slice(-3);
  };

  const agentForId = (id: string) => ALL_AGENTS.find(a => a.id === id);

  return (
    <AdminShell
      title="SMS Management"
      subtitle="Phone number routing & conversation management"
      icon={<Phone size={18} className="text-primary" />}
      backTo="/admin/dashboard"
    >

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-full border border-border bg-card p-1 w-fit">
          <button
            onClick={() => { setTab("numbers"); setSelectedConvo(null); }}
            className="px-5 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all"
            style={{
              background: tab === "numbers" ? "hsl(var(--primary))" : "transparent",
              color: tab === "numbers" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}
          >
            Phone Numbers
          </button>
          <button
            onClick={() => { setTab("conversations"); setSelectedConvo(null); }}
            className="px-5 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all"
            style={{
              background: tab === "conversations" ? "hsl(var(--primary))" : "transparent",
              color: tab === "conversations" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}
          >
            Conversations
          </button>
        </div>

        {/* Phone Numbers Tab */}
        {tab === "numbers" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <Plus size={14} /> Add Number
            </button>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-border bg-card p-5 space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">Twilio Number</label>
                      <input
                        type="text"
                        placeholder="+6421234567"
                        value={newTwilioNumber}
                        onChange={(e) => setNewTwilioNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">Agent</label>
                      <select
                        value={newAgentId}
                        onChange={(e) => setNewAgentId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground focus:border-primary/40 outline-none"
                      >
                        <option value="">Select agent...</option>
                        {ALL_AGENTS.map(a => (
                          <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button onClick={addPhoneNumber} className="cta-glass-gold px-5 py-2 text-xs">Save</button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : phoneNumbers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No phone numbers configured yet.</div>
            ) : (
              <div className="space-y-2">
                {phoneNumbers.map((pn) => {
                  const agent = agentForId(pn.agent_id);
                  return (
                    <div key={pn.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: agent?.color ? `${agent.color}20` : "hsl(var(--muted))" }}>
                        <Phone size={14} style={{ color: agent?.color || "hsl(var(--foreground))" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-bold text-foreground">{pn.twilio_number}</p>
                        <p className="text-[11px] font-body text-muted-foreground">{pn.agent_name} ({pn.agent_id})</p>
                      </div>
                      <button onClick={() => toggleActive(pn.id, pn.is_active)}>
                        {pn.is_active ? (
                          <ToggleRight size={24} className="text-primary" />
                        ) : (
                          <ToggleLeft size={24} className="text-muted-foreground/40" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Conversations Tab */}
        {tab === "conversations" && !selectedConvo && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No conversations yet.</div>
            ) : (
              <div className="space-y-2">
                {conversations.map((convo) => {
                  const agent = agentForId(convo.agent_id);
                  return (
                    <button
                      key={convo.id}
                      onClick={() => loadMessages(convo)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: agent?.color ? `${agent.color}20` : "hsl(var(--muted))" }}>
                        <MessageSquare size={14} style={{ color: agent?.color || "hsl(var(--foreground))" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-bold text-foreground">{maskPhone(convo.phone_number)}</p>
                        <p className="text-[11px] font-body text-muted-foreground">
                          {agent?.name || convo.agent_id} · Last active {new Date(convo.last_message_at).toLocaleDateString("en-NZ")}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Conversation Thread */}
        {tab === "conversations" && selectedConvo && (
          <div>
            <button
              onClick={() => setSelectedConvo(null)}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={12} /> Back to conversations
            </button>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <MessageSquare size={16} className="text-primary" />
                <div>
                  <p className="text-sm font-display font-bold text-foreground">{maskPhone(selectedConvo.phone_number)}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {agentForId(selectedConvo.agent_id)?.name || selectedConvo.agent_id} · {messages.length} messages
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[80%] rounded-2xl px-4 py-2.5"
                      style={{
                        background: msg.direction === "outbound"
                          ? "hsl(var(--primary) / 0.15)"
                          : "hsl(var(--muted))",
                        borderBottomRightRadius: msg.direction === "outbound" ? "4px" : undefined,
                        borderBottomLeftRadius: msg.direction === "inbound" ? "4px" : undefined,
                      }}
                    >
                      <p className="text-xs font-body text-foreground whitespace-pre-wrap">{msg.body}</p>
                      <p className="text-[9px] font-mono text-muted-foreground mt-1">
                        {new Date(msg.created_at).toLocaleString("en-NZ", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </AdminShell>
  );
};

export default AdminSmsPage;
