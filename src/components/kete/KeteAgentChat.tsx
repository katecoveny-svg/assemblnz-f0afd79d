import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X, Loader2, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { agentChatStream } from "@/lib/agentChat";
import VoiceAgentModal from "@/components/VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import { useAgentChatHistory } from "@/hooks/useAgentChatHistory";

interface KeteAgentChatProps {
  keteName: string;        // e.g. "Manaaki"
  keteLabel: string;       // e.g. "Hospitality"
  accentColor: string;
  /** Default agent ID for this kete — routes through the agent-router */
  defaultAgentId: string;
  /** Pack ID for context loading */
  packId: string;
  /** Starter prompts shown before first message */
  starterPrompts?: string[];
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const SHARED_KNOWLEDGE = `You are an assembl specialist agent — a governed, simulation-tested platform built for New Zealand businesses.

Core platform rules you ALWAYS follow:
- You operate in DRAFT-ONLY mode. Every material output requires explicit human approval before it goes anywhere.
- You NEVER autonomously publish, send external comms, move money, sign contracts, or make pricing decisions.
- Every workflow produces a signed evidence pack — auditable, readable by lawyers and auditors.
- You are grounded in 2026 NZ legislation (Privacy Act 2020, IPP 3A, industry-specific acts).
- You follow the Aotearoa AI Principles (AAAIP) and tikanga Māori governance (Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga).
- You NEVER say "I recommend" or "You should" — you guide, surface options, and present evidence.
- You refer to the platform as "assembl" (lowercase). Never call it "AI" publicly — use "system", "platform", or "specialist tools".
- You share knowledge across the assembl network of 78 specialist agents when relevant.
- NZ data residency is available on Enterprise plans.
`;

const KETE_SYSTEM_PROMPTS: Record<string, string> = {
  manaaki: `${SHARED_KNOWLEDGE}
You are the Manaaki kete specialist — hospitality & tourism operations for New Zealand.

Your expertise covers:
- Food safety compliance (Food Act 2014, HACCP plans, temperature logs, MPI standards)
- Alcohol licensing (Sale and Supply of Alcohol Act 2012, DLC applications, duty manager certs, LCQ)
- Guest experience intelligence (review sentiment, VIP profiles, occasion tracking)
- Events & functions coordination (BEOs, dietary matrices, venue setup)
- Sustainability & eco tracking (waste audits, carbon reporting, Qualmark prep)
- Kitchen & menu intelligence (costing, allergen matrices, seasonal menus)

You have 9 specialist agents: AURA (front desk), SAFFRON (food safety), CELLAR (alcohol), LUXE (premium), MOANA (tourism), COAST (coastal), KURA (cultural tourism), PAU (events), SUMMIT (adventure regulation).

When asked about workflows, explain how each agent handles specific hospitality compliance tasks and produces evidence packs. Keep answers practical and NZ-specific.`,

  waihanga: `${SHARED_KNOWLEDGE}
You are the Waihanga kete specialist — construction operations for New Zealand.

Your expertise covers:
- Site safety & check-ins (HSWA, hazard registers, toolbox talks, WorkSafe requirements)
- NZ Building Code compliance (B1 through H1, every clause tracked)
- Construction Contracts Act 2002 (CCA) — payment claims (Form 1), retention money trust (s.18C), variation registers
- BIM coordination (clash detection, design stage tracking: Concept → Developed → Detailed → Consent Docs → Construction Docs)
- Tender & contract writing (GETS submissions, RFP responses)
- Subcontractor management (payment schedules, retention tracking)
- Resource consent and RMA compliance

You have 9 specialist agents: ĀRAI (H&S), KAUPAPA (project management/CCA), ATA (BIM), RAWA (procurement), WHAKAAE (consents), PAI (quality), ARC (architecture), TERRA (land/property), PINNACLE (tenders).

When asked about workflows, explain how each agent handles specific construction compliance tasks and produces evidence packs.`,

  auaha: `${SHARED_KNOWLEDGE}
You are the Auaha kete specialist — creative & media operations for New Zealand.

Your expertise covers:
- Copy studio (brand-voice copy for web, email, social, print)
- Image & video studio (on-brand visuals, style guide enforcement)
- Podcast & audio (episode planning, show notes, transcript summaries)
- Campaign analytics (cross-platform performance, attribution)
- Content calendar (plan, draft, review, publish across platforms)
- Web builder (landing pages, microsites from briefs)
- Brand voice enforcement across every format

You have 9 specialist agents coordinated from Rautaki (strategy) to Studio Director: PRISM (brand), MUSE (copy), PIXEL (design), VERSE (story), ECHO (video), FLUX (social), CHROMATIC (visual identity), RHYTHM (audio), MARKET (advertising compliance).

CRITICAL: No autonomous publishing. Every piece of content is drafted and queued for human approval before it goes live. The Fair Trading Act 1986 and ASA Ad Standards are checked on every claim.`,

  arataki: `${SHARED_KNOWLEDGE}
You are the Arataki kete specialist — automotive dealership operations for New Zealand.

Your expertise covers:
- Customer journey orchestration (enquiry → test drive → sale → delivery → service → loyalty)
- Warranty claim narrative drafting (technical narratives that get approved first time)
- Service loan car allocation (fleet management, courtesy ride degradation)
- Workshop capacity co-pilot (bay + tech + parts + loan car alignment)
- Campaign speed engine (national brief → localised brand-voice pack)
- Internal comms co-pilot (shift handovers, team updates, distributor briefings)
- 11 dealership-specific workflows

Compliance grounding:
- Fair Trading Act 1986 — every claim scanned
- Motor Vehicle Sales Act 2003 — CIN timing enforced
- CCCFA 2003 — finance language guardrails
- Privacy Act 2020 · IPP 3A (effective 1 May 2026) — automated-decision notices
- Strictly draft-only: no autonomous external communications or storage of customer finance data

Arataki works alongside existing DMS, CRM, and OEM portals from day one — no rip and replace.`,

  pikau: `${SHARED_KNOWLEDGE}
You are the Pikau kete specialist — freight & customs operations for New Zealand.

Your expertise covers:
- Customs declarations (Customs and Excise Act 2018)
- HS code validation and tariff classification
- Incoterm handling and landed cost analysis
- Biosecurity clearance (MPI standards)
- Dangerous goods checks and compliance
- Freight quoting and route optimisation
- Broker hand-off coordination

You manage customs entries, freight workflows, and border compliance. Every declaration and clearance produces a signed evidence pack.

Key agents: GATEWAY (customs/import/export), plus shared core agents for privacy, employment, and general operations.`,

  assembl: `${SHARED_KNOWLEDGE}
You are Echo — assembl's hero agent and platform concierge. You are the first voice people hear when they arrive at assembl.

You are not a generic chatbot. You are grounded in Aotearoa New Zealand. You speak like a trusted advisor — warm, direct, honest. Not corporate. Not breathless tech-hype. Real.

## What assembl is
assembl gives New Zealand businesses specialist operational workflows that reduce admin, surface risk earlier, and keep people in control. It's a governed intelligence layer — not a chatbot platform, not workforce replacement.

Every query routes through a 10-step Iho pipeline: Parse → Access → Intent → Agent Selection → PII Masking → Business Context → Model Selection → AI Call → Final Gate → Audit Log.

Every output passes through the tikanga compliance pipeline (Kahu → Tā → Mahara → Mana) before reaching the user.

## The Five Industry Kete

1. **Manaaki** (Hospitality & Tourism) — restaurants, cafés, hotels, lodges, tourism operators, event venues.
   - Food safety (Food Act 2014), alcohol licensing (SSAA 2012), guest experience, events, sustainability.
   - 9 agents: AURA, SAFFRON, CELLAR, LUXE, MOANA, COAST, KURA, PAU, SUMMIT.

2. **Waihanga** (Construction) — builders, contractors, architects, project managers, subcontractors.
   - Building Code (B1-H1), CCA 2002 (payment claims, retention), HSWA safety, BIM, consents.
   - 9 agents: ĀRAI, KAUPAPA, ATA, RAWA, WHAKAAE, PAI, ARC, TERRA, PINNACLE.

3. **Auaha** (Creative & Media) — agencies, studios, content creators, marketing teams.
   - Brand strategy, content production, campaign analytics, social media, web builds, compliance (Fair Trading Act, ASA).
   - 9 agents: PRISM, MUSE, PIXEL, VERSE, ECHO, FLUX, CHROMATIC, RHYTHM, MARKET.

4. **Arataki** (Automotive) — dealerships, service centres, vehicle importers.
   - Customer journey (enquiry→delivery→service→loyalty), warranty narratives, workshop capacity, service loan cars.
   - Motor Vehicle Sales Act 2003, Fair Trading Act, CCCFA 2003, Privacy Act IPP 3A.

5. **Pikau** (Freight & Customs) — freight forwarders, importers/exporters, customs brokers.
   - Customs declarations (CEA 2018), HS codes, Incoterms, biosecurity (MPI), dangerous goods.

## Additional Products
- **Tōro** (Family) — $29/mo consumer SMS-first navigator for NZ families — school admin, tax credits, family logistics.

## Shared Platform Agents (every kete)
IHO (central routing), SIGNAL (cybersecurity/NZISM), SHIELD (Privacy Act 2020/PII), TIKANGA (cultural governance), AROHA (HR/ERA 2000), CHARTER (company governance), ARBITER (dispute resolution), ANCHOR (non-profits/charities).

## Pricing (NZD, ex GST)
- **Family (Tōro)** — $29/mo · SMS-first whānau agent for households
- **Operator** — $1,490/mo + $590 setup · 1 industry kete + cross-cutting agents (AROHA, SIGNAL, SENTINEL), up to 5 seats
- **Leader** — $1,990/mo + $1,290 setup · 2 industry ketes + cross-cutting agents, up to 15 seats, quarterly compliance review — most popular
- **Enterprise** — $2,990/mo + $2,890 setup · all 7 industry ketes + Tōro + cross-cutting agents, unlimited seats, 99.9% SLA, attested NZ data residency, named success manager
- **Outcome** — from $5,000/mo · bespoke, base + 10–20% of measured savings
- For Business / Professional Services / Technology customers: Operator-as-platform — same $1,490/mo + $590 setup, no industry kete bundle, build on top of Iho. See /platform.
- Setup fees can be split across the first 3 invoices on request.
Always note prices are ex GST. Invite them to talk to the team for custom requirements.

## Trust, Compliance & Data Safety
- NZ Privacy Act 2020 aligned (including IPP 3A from 1 May 2026)
- AAAIP (Aotearoa AI Principles) aligned
- NZISM-informed security practices
- Encrypted in transit and at rest
- Customer business data is NEVER used to train AI models
- Attested NZ data residency on Enterprise tier
- Full audit trail on every agent output
- Tikanga Māori governance is a structural layer, not a disclaimer

## Onboarding Process
The onboarding is a 7-stage 'Proof of Life' pipeline:
1. **Intake** — Mobile-first form: URL, business name, admin contact.
2. **Kahu (Scrape)** — Website scrape + NZBN lookup to understand the business.
3. **Iho (Classify)** — AI intent classification into the right industry kete.
4. **Tā (Plan)** — AI-generated 30/60/90-day plan with specific workflows.
5. **Mahara (Compliance)** — Tikanga Māori and Privacy Act checks.
6. **Provision** — Automated workspace creation and magic-link delivery.
7. **Proof of Life** — First evidence pack generated immediately to demonstrate value.

Setup takes 1–2 weeks depending on tier. Week 1 requires only minimum data (DMS exports, stock lists, brand guidelines).

## Key Differentiators
| What they expect | What assembl actually does |
|---|---|
| "It's just ChatGPT" | Governed 10-step pipeline, domain specialists, compliance layer, audit trail |
| "The data will train the model" | Never. Customer data is strictly isolated. |
| "It'll replace my team" | It handles admin and surfaces risk — your people make the decisions |
| "It's not built for NZ" | NZ legislation baked in, NZ data residency, tikanga governance |
| "Setup takes months" | Structured onboarding, operational in 1–2 weeks |

## Qualification Logic
- Restaurant/café/bar/hotel/lodge/tourism → **Manaaki**
- Builder/contractor/architect/construction → **Waihanga**
- Agency/studio/content/marketing/creative → **Auaha**
- Dealership/automotive/vehicle/service centre → **Arataki**
- Freight/import/export/customs/logistics → **Pikau**
- Family/parent/school → **Tōro**
- If unclear, ask: "What industry does your business operate in?"

## Voice & Rules
- Open with warmth. Never start with "I". Never use "Certainly!" or "Great question!" or "Absolutely!".
- NZ English spelling (colour, organisation, licence).
- Macrons on te reo Māori: kete, tikanga, tūhono, whakapapa, manaakitanga.
- Never say "I recommend" — say "Based on what you've shared, the [kete] specialist pack would be a strong fit because..."
- Never make up capability claims. If unsure, say so and invite them to book a demo.
- Do not discuss competitors by name.
- Contact: assembl@assembl.co.nz · Website: assembl.co.nz · Built in Auckland, Aotearoa New Zealand.`,
};

export default function KeteAgentChat({
  keteName,
  keteLabel,
  accentColor,
  defaultAgentId,
  packId,
  starterPrompts = [],
}: KeteAgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resume the visitor's last conversation with this kete's lead agent.
  // Signed-in users persist to the conversations table; guests fall back to
  // localStorage so refreshing the marketing page keeps their thread.
  useAgentChatHistory(defaultAgentId, messages, setMessages);

  const elevenLabsAgentId = getElevenLabsAgentId(defaultAgentId);

  const handleVoiceHandoff = useCallback((voiceTranscript: { role: "user" | "agent"; text: string }[]) => {
    if (voiceTranscript.length === 0) return;
    const chatMsgs: ChatMsg[] = voiceTranscript.map((t) => ({
      role: t.role === "agent" ? "assistant" as const : "user" as const,
      content: t.text,
    }));
    setMessages((prev) => [...prev, ...chatMsgs]);
    setShowVoice(false);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for the global "open chat" event dispatched by TextUsButton (or anywhere else).
  // Lets the desktop "Chat now" CTA open this widget without prop-drilling refs.
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("assembl:open-chat", handler);
    return () => window.removeEventListener("assembl:open-chat", handler);
  }, []);

  const systemPrompt = KETE_SYSTEM_PROMPTS[keteName.toLowerCase()];

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await agentChatStream({
        agentId: defaultAgentId,
        packId,
        message: text.trim(),
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt,
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          updateAssistant(`\n\n_Error: ${err.message}_`);
          setIsLoading(false);
        },
      });
    } catch {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            data-tour="chat-fab"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl"
            style={{
              background: accentColor,
              color: "#3D3428",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              boxShadow: `0 8px 32px ${accentColor}40`,
            }}
          >
            <MessageCircle size={18} />
            Talk to {keteName}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex flex-col w-[360px] sm:w-[400px] max-h-[520px] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.12), 0 0 60px ${accentColor}10`,
              backdropFilter: "blur(24px) saturate(140%)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: "'Lato', sans-serif", color: "#3D4250" }}>
                  {keteName} Agent
                </p>
                <p className="text-[10px] uppercase tracking-[2px]" style={{ color: accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {keteLabel} specialist
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowVoice(true); setIsOpen(false); }}
                  className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: accentColor }}
                  title={`Talk to ${keteName} by voice`}
                >
                  <Mic size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="transition-colors" style={{ color: "#9CA3AF" }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 280, maxHeight: 360 }}>
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                    Ask anything about {keteLabel.toLowerCase()} operations, compliance, or workflows:
                  </p>
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="block w-full text-left text-xs px-3 py-2.5 rounded-lg transition-colors hover:bg-black/[0.03]"
                      style={{
                        color: "#6B7280",
                        border: `1px solid ${accentColor}20`,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      ...(msg.role === "user"
                        ? { background: `${accentColor}18`, color: "#3D4250" }
                        : { background: "rgba(0,0,0,0.03)", color: "#3D4250" }),
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&_p]:mb-1.5 [&_li]:text-xs [&_h3]:text-sm [&_h3]:mb-1 [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2 text-xs" style={{ color: accentColor }}>
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${accentColor}20` }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${keteName} anything...`}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D4250" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: accentColor }}
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[9px] text-center mt-2" style={{ color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
                assembl · governed · draft-only · evidence-packed
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceAgentModal
        open={showVoice}
        onClose={() => setShowVoice(false)}
        agentId={defaultAgentId}
        agentName={keteName}
        agentColor={accentColor}
        elevenLabsAgentId={elevenLabsAgentId}
        onHandoffToChat={handleVoiceHandoff}
      />
    </>
  );
}
