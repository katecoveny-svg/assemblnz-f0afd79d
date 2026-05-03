import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Compass, Sparkles, Calendar, Users, Wallet } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { agentChatStream } from "@/lib/agentChat";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const TEAL = "#4AA5A8";
const CHARCOAL = "#3D4250";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  intent?: "plan_trip";
}

const TORO_SYSTEM = `You are Tōro — Assembl's family life navigator agent. You help NZ whānau with:
- Family calendar coordination, school terms, NZ public holidays
- Meal planning aligned with NZ Ministry of Health dietary guidelines
- Multi-family trip planning (delegate to Voyage agent when user wants a real itinerary)
- School enrolment, term dates, after-school logistics
- Household budgeting and bill tracking

When the user clearly wants to PLAN A TRIP (mentions "plan a trip", "holiday", "vacation", "itinerary", "Italy", "South Island", "Coromandel", "long weekend" with destinations and dates), end your response with the exact tag <PLAN_TRIP/> on its own line so the UI can offer the trip planner form. Do not explain the tag.

You operate in DRAFT-ONLY mode — every output requires guardian approval. You never autonomously enrol children, book trips, or move money. Keep responses warm, practical, and Aotearoa-grounded.`;

const STARTERS = [
  { icon: Compass, label: "Plan a trip for two whānau", prompt: "Help me plan a long weekend trip for two families with kids 6–10. Coromandel area, easy driving from Auckland." },
  { icon: Calendar, label: "What's on this term?", prompt: "What are the NZ school term dates for 2026 and any public holidays falling in Term 2?" },
  { icon: Users, label: "Coordinate after-school", prompt: "I have three kids at different schools — help me think through after-school pickup logistics across the week." },
  { icon: Wallet, label: "Family meal plan", prompt: "Plan a week of family dinners — budget conscious, NZ seasonal produce, two kids who hate green vegetables." },
];

const detectsTripIntent = (text: string) => /<PLAN_TRIP\/>/i.test(text);

export default function ToroaChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tripFormOpen, setTripFormOpen] = useState(false);
  const [tripPrompt, setTripPrompt] = useState("");
  const [tripSubmitting, setTripSubmitting] = useState(false);
  const [tripStatus, setTripStatus] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Tōro Chat | Assembl";
    const desc = "Tōro — your family life navigator. Calendar, meals, trips, school logistics, all in one chat.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", desc);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput("");
    const newMessages: ChatMsg[] = [...messages, { role: "user", content: message }];
    setMessages(newMessages);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setLoading(true);

    let buffer = "";
    await agentChatStream({
      agentId: "operations",
      packId: "toro",
      message,
      messages: newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      systemPrompt: TORO_SYSTEM,
      onDelta: (chunk) => {
        buffer += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: buffer.replace(/<PLAN_TRIP\/>/gi, "").trim() };
          return copy;
        });
      },
      onDone: () => {
        if (detectsTripIntent(buffer)) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], intent: "plan_trip" };
            return copy;
          });
          setTripPrompt(message);
          setTripFormOpen(true);
        }
        setLoading(false);
      },
      onError: () => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "Sorry — I lost the thread there. Try again?" };
          return copy;
        });
        setLoading(false);
      },
    });
  };

  const submitTrip = async () => {
    if (!tripPrompt.trim() || tripSubmitting) return;
    setTripSubmitting(true);
    setTripStatus("Voyage is reading the brief…");
    try {
      setTimeout(() => setTripStatus("Picking destinations…"), 800);
      setTimeout(() => setTripStatus("Building day-by-day itinerary…"), 2400);
      setTimeout(() => setTripStatus("Plotting families on the map…"), 4200);
      const { data, error } = await supabase.functions.invoke("voyage-agent", {
        body: { mode: "natural", prompt: tripPrompt },
      });
      if (error) throw error;
      if (!data?.trip_id) throw new Error(data?.error || "No trip returned");
      setTripStatus("Trip ready — opening Command Mode…");
      navigate(`/voyage/command?trip=${data.trip_id}`);
    } catch (e) {
      setTripStatus("");
      setTripSubmitting(false);
      alert(e instanceof Error ? e.message : "Voyage couldn't plan that trip.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
      <header className="px-4 sm:px-6 pt-6 pb-4 max-w-3xl mx-auto w-full">
        <Link to="/toro" className="inline-flex items-center gap-2 text-sm hover:opacity-70 mb-6" style={{ color: "#9CA3AF" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Tōro
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}30` }}>
            <Sparkles className="w-5 h-5" style={{ color: TEAL }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: TEAL }}>Tōro Agent</p>
            <h1 className="font-display text-3xl" style={{ fontWeight: 300, color: CHARCOAL }}>Family life, sorted</h1>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 max-w-3xl mx-auto w-full pb-4">
        {messages.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {STARTERS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={() => send(s.prompt)}
                  className="text-left rounded-2xl p-4 hover:shadow-md transition-all group"
                  style={{ background: "white", border: `1px solid ${TEAL}20` }}
                >
                  <Icon className="w-5 h-5 mb-2" style={{ color: TEAL }} />
                  <p className="text-sm font-medium" style={{ color: CHARCOAL }}>{s.label}</p>
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{s.prompt.slice(0, 60)}…</p>
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-4 mt-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                style={{
                  background: m.role === "user" ? TEAL : "white",
                  color: m.role === "user" ? "white" : CHARCOAL,
                  border: m.role === "user" ? "none" : `1px solid ${TEAL}20`,
                }}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none" style={{ color: CHARCOAL }}>
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
                {m.intent === "plan_trip" && (
                  <button
                    onClick={() => setTripFormOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl"
                    style={{ background: `${TEAL}15`, color: TEAL, border: `1px solid ${TEAL}30` }}
                  >
                    <Compass className="w-3.5 h-3.5" /> Open trip planner
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: "white", border: `1px solid ${TEAL}20` }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: TEAL }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 px-4 sm:px-6 pb-6 pt-3 max-w-3xl mx-auto w-full" style={{ background: "linear-gradient(to top, rgba(250,251,252,1) 60%, rgba(250,251,252,0))" }}>
        <div className="flex gap-2 items-end rounded-2xl p-2" style={{ background: "white", border: `1px solid ${TEAL}30` }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Tōro anything — calendars, meals, trips, school…"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none px-3 py-2 text-sm"
            style={{ color: CHARCOAL, maxHeight: 120 }}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
            style={{ background: TEAL, color: "white" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Trip planner modal */}
      {tripFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(61, 66, 80, 0.4)", backdropFilter: "blur(8px)" }}
          onClick={() => !tripSubmitting && setTripFormOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "white", border: `1px solid ${TEAL}30` }}
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Compass className="w-5 h-5" style={{ color: TEAL }} />
                <h2 className="font-display text-xl" style={{ fontWeight: 400, color: CHARCOAL }}>Plan this trip with Voyage</h2>
              </div>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                Voyage will build destinations, a day-by-day itinerary, family convoys and a live map. You'll land in Command Mode.
              </p>
            </div>
            <div className="px-6 pb-4">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: CHARCOAL }}>Trip brief</label>
              <textarea
                value={tripPrompt}
                onChange={(e) => setTripPrompt(e.target.value)}
                rows={5}
                className="w-full mt-2 rounded-2xl p-3 text-sm outline-none resize-none"
                style={{ background: "#FAFBFC", border: `1px solid ${TEAL}20`, color: CHARCOAL }}
                disabled={tripSubmitting}
                placeholder="e.g. 5 days South Island for 2 families with kids 6–10. Queenstown + Wānaka, mid-July, snow-friendly."
              />
            </div>
            {tripStatus && (
              <div className="px-6 pb-4 flex items-center gap-2 text-sm" style={{ color: TEAL }}>
                <Loader2 className="w-4 h-4 animate-spin" /> {tripStatus}
              </div>
            )}
            <div className="px-6 pb-6 flex gap-2 justify-end">
              <button
                onClick={() => setTripFormOpen(false)}
                disabled={tripSubmitting}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                style={{ color: CHARCOAL }}
              >
                Cancel
              </button>
              <button
                onClick={submitTrip}
                disabled={tripSubmitting || !tripPrompt.trim()}
                className="px-5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 disabled:opacity-40"
                style={{ background: TEAL, color: "white" }}
              >
                {tripSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                Build trip
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
