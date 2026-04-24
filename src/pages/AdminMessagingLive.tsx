/**
 * AdminMessagingLive — realtime stream of every inbound + outbound message
 * Light-glass theme.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Activity, ArrowLeft, ArrowDownLeft, ArrowUpRight, Image as ImageIcon, Pause, Play, Radio, Filter } from "lucide-react";

interface LiveMessage {
  id: string;
  conversation_id: string | null;
  direction: string;
  from_number: string | null;
  to_number: string | null;
  body: string | null;
  channel: string;
  status: string;
  agent_used: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  tenant_id: string | null;
}

const TEAL = "#4AA5A8";
const POUNAMU = "#3A8A8D";
const TEXT = "#1A1D29";
const MUTED = "#6B7280";
const SUBTLE = "#4A5160";

const CHANNEL_TINT: Record<string, string> = {
  sms: "#3A8A8D",
  whatsapp: "#25D366",
  rcs: "#5B9BD5",
};

const GLASS_CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(74,165,168,0.18)",
  boxShadow: "0 4px 20px rgba(26,29,41,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
};

export default function AdminMessagingLive() {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [paused, setPaused] = useState(false);
  const [channelFilter, setChannelFilter] = useState<"all" | "sms" | "whatsapp" | "rcs">("all");
  const [directionFilter, setDirectionFilter] = useState<"all" | "inbound" | "outbound">("all");
  const [counts, setCounts] = useState({ total: 0, in: 0, out: 0 });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("messaging_messages")
        .select("id, conversation_id, direction, from_number, to_number, body, channel, status, agent_used, media_url, media_type, created_at, tenant_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setMessages(data as LiveMessage[]);
    })();
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel("admin-messaging-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messaging_messages" },
        (payload) => {
          if (pausedRef.current) return;
          const m = payload.new as LiveMessage;
          setMessages((prev) => [m, ...prev].slice(0, 200));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (channelFilter !== "all" && m.channel !== channelFilter) return false;
      if (directionFilter !== "all" && m.direction !== directionFilter) return false;
      return true;
    });
  }, [messages, channelFilter, directionFilter]);

  useEffect(() => {
    setCounts({
      total: filtered.length,
      in: filtered.filter((m) => m.direction === "inbound").length,
      out: filtered.filter((m) => m.direction === "outbound").length,
    });
  }, [filtered]);

  return (
    <div className="min-h-screen" style={{ color: TEXT }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin/messaging" className="inline-flex items-center gap-1 text-xs mb-2" style={{ color: MUTED }}>
              <ArrowLeft className="w-3 h-3" /> Back to Messaging Hub
            </Link>
            <div className="flex items-center gap-3">
              <Radio className={`w-5 h-5 ${paused ? "" : "animate-pulse"}`} style={{ color: paused ? MUTED : POUNAMU }} />
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight" style={{ color: TEXT, fontFamily: "'Inter', sans-serif" }}>
                Live Messaging Stream
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              All inbound + outbound across SMS, WhatsApp, RCS — real-time.
            </p>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2"
            style={{
              background: paused ? TEAL : "rgba(255,255,255,0.7)",
              color: paused ? "#FFFFFF" : SUBTLE,
              border: "1px solid rgba(74,165,168,0.20)",
              boxShadow: "0 2px 8px rgba(26,29,41,0.04)",
            }}
          >
            {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Visible", value: counts.total, color: TEXT },
            { label: "Inbound", value: counts.in, color: "#5B9BD5" },
            { label: "Outbound", value: counts.out, color: POUNAMU },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4" style={GLASS_CARD}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{s.label}</div>
              <div className="text-2xl font-light mt-1" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <Filter className="w-3.5 h-3.5" style={{ color: MUTED }} />
          {(["all", "sms", "whatsapp", "rcs"] as const).map((c) => (
            <button key={c} onClick={() => setChannelFilter(c)}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: channelFilter === c ? CHANNEL_TINT[c] || POUNAMU : "rgba(255,255,255,0.7)",
                color: channelFilter === c ? "#FFFFFF" : SUBTLE,
                border: "1px solid rgba(74,165,168,0.18)",
              }}>
              {c.toUpperCase()}
            </button>
          ))}
          <span className="mx-2 text-xs" style={{ color: "#D0D5DD" }}>|</span>
          {(["all", "inbound", "outbound"] as const).map((d) => (
            <button key={d} onClick={() => setDirectionFilter(d)}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: directionFilter === d ? TEAL : "rgba(255,255,255,0.7)",
                color: directionFilter === d ? "#FFFFFF" : SUBTLE,
                border: "1px solid rgba(74,165,168,0.18)",
              }}>
              {d}
            </button>
          ))}
        </div>

        {/* Stream */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((m) => {
              const isIn = m.direction === "inbound";
              const tint = CHANNEL_TINT[m.channel] || MUTED;
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-xl p-4 flex gap-3"
                  style={{
                    ...GLASS_CARD,
                    borderLeftWidth: 3,
                    borderLeftColor: isIn ? "#5B9BD5" : POUNAMU,
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isIn ? <ArrowDownLeft className="w-4 h-4" style={{ color: "#5B9BD5" }} /> : <ArrowUpRight className="w-4 h-4" style={{ color: POUNAMU }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[11px] mb-1" style={{ color: MUTED }}>
                      <span className="px-1.5 py-0.5 rounded" style={{ background: `${tint}1A`, color: tint }}>{m.channel.toUpperCase()}</span>
                      {m.agent_used && (
                        <span className="px-1.5 py-0.5 rounded" style={{ background: "rgba(74,165,168,0.12)", color: POUNAMU }}>
                          {m.agent_used}
                        </span>
                      )}
                      <span>{isIn ? "from" : "to"} {isIn ? m.from_number : m.to_number}</span>
                      <span className="ml-auto">{new Date(m.created_at).toLocaleTimeString("en-NZ")}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words" style={{ color: TEXT }}>
                      {m.body || <span className="italic" style={{ color: MUTED }}>(no text)</span>}
                    </div>
                    {m.media_url && (
                      <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: TEAL }}>
                        <ImageIcon className="w-3 h-3" />
                        <a href={m.media_url} target="_blank" rel="noreferrer" className="underline truncate max-w-md">
                          {m.media_type || "media"} attachment
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-xl p-12 text-center" style={GLASS_CARD}>
              <Activity className="w-6 h-6 mx-auto mb-3" style={{ color: MUTED }} />
              <p className="text-sm" style={{ color: SUBTLE }}>
                Waiting for messages… new traffic will appear here in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
