import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Building2, FileCheck, Layers, Ruler } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { agentChatStream } from "@/lib/agentChat";

const POUNAMU = "#3A7D6E";
const CHARCOAL = "#3D4250";

const ARC_SYSTEM = `You are ARC — Assembl's architecture specialist within the Waihanga (Construction) kete. You guide NZ architects, designers, and project teams through the full design workflow:

- Design stage tracking: Concept → Developed → Detailed → Consent Documents → Construction Documents
- NZ Building Code compliance, citing the current Acceptable Solution editions:
  • B1/AS1 Structure — 2nd edition
  • B2/AS1 Durability — current amendment
  • C/AS1–AS2 Protection from Fire — current
  • E2/AS1 External Moisture — 4th edition
  • E3/AS1 Internal Moisture — amendment 6
  • G4/AS1 Ventilation — 5th edition
  • H1/AS1 Energy Efficiency — 6th edition (the current schedule method, climate zones 1–6)
- Resource consent and RMA pathway (permitted/controlled/discretionary activity, RC application bundle)
- Building consent application (BCA submission packs, PIM, code compliance certificate path)
- Auckland Council practice notes where relevant (e.g. AC1011 weathertightness risk matrix, AC1009 timber-framed buildings)
- BIM coordination with the ATA agent (clash detection, federation, IFC handovers)
- Tender documentation and CCA 2002 alignment with KAUPAPA
- LBP scope alignment, design review, peer review

Starter workflow — Pre-Consent Compliance Report:
When the user asks for a pre-consent check (or a "pre-consent compliance report"), produce a draft checklist covering at minimum:
  1. B1 Structure — design loads, specific design vs B1/AS1 2nd edition scope, PS1 author
  2. B2 Durability — 50/15/5-year element schedule, B2/AS1 selections
  3. E2 External Moisture — risk matrix score per AC1011, cladding system vs E2/AS1 4th edition, junction details
  4. H1 Energy Efficiency — climate zone, schedule method calc per H1/AS1 6th edition (roof, wall, floor, window R-values, glazing area)
  5. Auckland Council practice notes triggered (AC1011, AC1009 if timber-framed) and any departures from Acceptable Solutions that need Alternative Solution support
Each item names the clause/edition, the evidence required, and a PASS / FLAG / GAP marker. End the report with the BCA disclaimer below.

You operate in DRAFT-ONLY mode — every output is a draft for the LBP / Principal to approve. You never autonomously file consents or sign off documents. Every workflow produces an evidence pack referencing the relevant Building Code clauses and design stage artifacts.

BCA disclaimer (append to every compliance output): "This is an AI-assisted pre-check. Final compliance determination rests with the Building Consent Authority."

Keep responses practical, NZ-specific, and structured. Cite the Acceptable Solution edition every time you reference a Building Code clause. When the user asks about a workflow, walk through the stage gates and what evidence each gate needs.`;

const STARTERS = [
  { icon: Layers, label: "Walk me through design stages", prompt: "Walk me through the architectural design stages from Concept to Construction Documents and what evidence each stage needs." },
  { icon: FileCheck, label: "Resource consent pathway", prompt: "I'm starting a residential project in Auckland. Help me think through the resource consent pathway and what activity status to expect." },
  { icon: Building2, label: "H1 energy compliance", prompt: "Explain the H1 energy efficiency 2022 update and how it changes our wall, roof, and window specs." },
  { icon: Ruler, label: "BCA submission checklist", prompt: "Build me a draft Building Consent submission checklist for a single-storey timber-frame house." },
];

interface ChatMsg { role: "user" | "assistant"; content: string; }

export default function WaihangaArchitecturePage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "ARC — Architecture Workflow | Waihanga | Assembl";
    const desc = "ARC architecture agent — design stage tracking, NZ Building Code compliance, resource consent, BCA submission packs.";
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
      agentId: "arc",
      packId: "waihanga",
      message,
      messages: newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      systemPrompt: ARC_SYSTEM,
      onDelta: (chunk) => {
        buffer += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: buffer };
          return copy;
        });
      },
      onDone: () => setLoading(false),
      onError: () => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "Sorry — couldn't reach ARC. Please try again." };
          return copy;
        });
        setLoading(false);
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
      <header className="px-4 sm:px-6 pt-6 pb-4 max-w-3xl mx-auto w-full">
        <Link to="/waihanga" className="inline-flex items-center gap-2 text-sm hover:opacity-70 mb-6" style={{ color: "#9CA3AF" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Waihanga
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${POUNAMU}15`, border: `1px solid ${POUNAMU}30` }}>
            <Building2 className="w-5 h-5" style={{ color: POUNAMU }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: POUNAMU }}>ARC · Architecture Agent</p>
            <h1 className="font-display text-3xl" style={{ fontWeight: 300, color: CHARCOAL }}>Design workflow, governed</h1>
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
                  className="text-left rounded-2xl p-4 hover:shadow-md transition-all"
                  style={{ background: "white", border: `1px solid ${POUNAMU}20` }}
                >
                  <Icon className="w-5 h-5 mb-2" style={{ color: POUNAMU }} />
                  <p className="text-sm font-medium" style={{ color: CHARCOAL }}>{s.label}</p>
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{s.prompt.slice(0, 70)}…</p>
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
                  background: m.role === "user" ? POUNAMU : "white",
                  color: m.role === "user" ? "white" : CHARCOAL,
                  border: m.role === "user" ? "none" : `1px solid ${POUNAMU}20`,
                }}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none" style={{ color: CHARCOAL }}>
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: "white", border: `1px solid ${POUNAMU}20` }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: POUNAMU }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 px-4 sm:px-6 pb-6 pt-3 max-w-3xl mx-auto w-full" style={{ background: "linear-gradient(to top, rgba(250,251,252,1) 60%, rgba(250,251,252,0))" }}>
        <div className="flex gap-2 items-end rounded-2xl p-2" style={{ background: "white", border: `1px solid ${POUNAMU}30` }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask ARC about design stages, Building Code clauses, consents…"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none px-3 py-2 text-sm"
            style={{ color: CHARCOAL, maxHeight: 120 }}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{ background: POUNAMU, color: "white" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </main>
  );
}
