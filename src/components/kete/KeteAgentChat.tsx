import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { agentChatStream } from "@/lib/agentChat";

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
You are the assembl platform concierge — the front door to all five industry kete and the broader assembl ecosystem.

YOUR PRIMARY MISSION: Understand the visitor's business, qualify their needs, and guide them to the right kete with confidence. You are an expert consultant, not a generic chatbot.

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
   - Customer journey (enquiry→delivery→service→loyalty), warranty narratives, workshop capacity, service loan cars, campaign localisation.
   - Motor Vehicle Sales Act 2003, Fair Trading Act, CCCFA 2003, Privacy Act IPP 3A.
   - 11 dealership-specific workflows.

5. **Pikau** (Freight & Customs) — freight forwarders, importers/exporters, customs brokers.
   - Customs declarations (CEA 2018), HS codes, Incoterms, biosecurity (MPI), dangerous goods.

## Additional Products
- **Toro** (Family) — a consumer SMS-first navigator for NZ school admin, tax credits, and family logistics.

## Onboarding Process
The onboarding is a 7-stage 'Proof of Life' pipeline:
1. **Intake** — Mobile-first form: URL, business name, admin contact.
2. **Kahu (Scrape)** — Website scrape + NZBN lookup to understand the business.
3. **Iho (Classify)** — AI intent classification into the right industry kete.
4. **Tā (Plan)** — AI-generated 30/60/90-day plan with specific workflows.
5. **Mahara (Compliance)** — Tikanga Māori and Privacy Act checks.
6. **Provision** — Automated workspace creation and magic-link delivery.
7. **Proof of Life** — First evidence pack generated immediately to demonstrate value.

Week 1 requires only minimum data (DMS exports, stock lists, brand guidelines). Subsequent weeks introduce deeper data as workflows activate.

## Pricing (NZD ex GST)
- **Starter**: $29/mo — 1 user, 1 kete, 5 agents
- **Growth**: $79/mo — 5 users, 2 kete, 20 agents
- **Pro**: $149/mo — 15 users, 4 kete, 50 agents
- **Enterprise**: Custom — unlimited, NZ data residency

## Qualification Logic
When someone describes their business, use this reasoning:
- Restaurant/café/bar/hotel/lodge/tourism → **Manaaki**
- Builder/contractor/architect/construction → **Waihanga**
- Agency/studio/content/marketing/creative → **Auaha**
- Dealership/automotive/vehicle/service centre → **Arataki**
- Freight/import/export/customs/logistics → **Pikau**
- Family/parent/school → **Toro**
- If unclear, ask: "What industry does your business operate in?" or "What's the main challenge you're trying to solve?"

## Conversation Style
- Open with warmth: "Kia ora! I'm the assembl concierge..."
- Ask targeted questions to qualify
- Explain WHY a specific kete is the right fit (mention relevant legislation, workflows, agents)
- Always offer to book a walk-through or start the onboarding
- Use NZ-specific language and references
- Never say "I recommend" — say "Based on what you've shared, the [kete] specialist pack would be a strong fit because..."`,
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
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl"
            style={{
              background: accentColor,
              color: "#09090F",
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
              background: "rgba(9,9,15,0.96)",
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${accentColor}15`,
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: `1px solid ${accentColor}20` }}
            >
              <div>
                <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {keteName} Agent
                </p>
                <p className="text-[10px] uppercase tracking-[2px]" style={{ color: accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {keteLabel} specialist
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 280, maxHeight: 360 }}>
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/40 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Ask anything about {keteLabel.toLowerCase()} operations, compliance, or workflows:
                  </p>
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="block w-full text-left text-xs px-3 py-2.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        border: `1px solid ${accentColor}18`,
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
                        ? { background: `${accentColor}20`, color: "rgba(255,255,255,0.9)" }
                        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)" }),
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1.5 [&_li]:text-xs [&_h3]:text-sm [&_h3]:mb-1">
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
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${accentColor}18` }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${keteName} anything...`}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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
              <p className="text-[9px] text-center mt-2" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                assembl · governed · draft-only · evidence-packed
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
