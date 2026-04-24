import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Sparkles,
  Shield,
  Workflow,
  Database,
  Globe,
  Zap,
  FileCheck,
  Brain,
  Phone,
  type LucideIcon,
} from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

/* ─── Pearl palette (matches PearlIndex / HowItWorksPage) ─── */
const PEARL = {
  bg: "#FBFAF7",
  linen: "#F3F4F2",
  opal: "#E8EEEC",
  ink: "#0E1513",
  pounamu: "#1F4D47",
  seaGlass: "#C4D6D2",
  muted: "#8B8479",
  bodyInk: "rgba(14,21,19,0.72)",
};

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease },
};

type Capability = {
  icon: LucideIcon;
  title: string;
  body: string;
  proof?: string;
};

const HEADLINE_CAPABILITIES: Capability[] = [
  {
    icon: MessageSquare,
    title: "Streaming chat",
    body:
      "Replies appear word-by-word as the model thinks — no more waiting for a full response. Powered by Server-Sent Events through our Mana Trust Layer so PII gets masked before tokens leave your tenant.",
    proof: "Token-by-token UI updates · SSE end-to-end",
  },
  {
    icon: Users,
    title: "Agent selection",
    body:
      "Pick the right specialist for the job from 46 NZ-trained agents across hospitality, construction, creative, automotive, freight, retail, early childhood and family ops. Switch agents mid-conversation without losing context.",
    proof: "8 industry kete · 46 specialists live",
  },
  {
    icon: Sparkles,
    title: "Claude model support",
    body:
      "Per-agent settings let you swap between Claude 3.5 Sonnet, Claude 3.5 Haiku, GPT-5 and Gemini 2.5 Pro on the fly. Tune temperature and max tokens from the in-chat ⚙️ panel — no redeploy needed.",
    proof: "Anthropic + OpenAI + Google · live model switcher",
  },
];

const PLATFORM_CAPABILITIES: Capability[] = [
  {
    icon: Shield,
    title: "Governed by default",
    body:
      "Every response runs through the Kahu → Iho → Tā → Mana pipeline: PII masking, tier gates, in-flight stamping, and post-rewrite. NZ Privacy Act 2020 + Algorithm Charter aligned.",
  },
  {
    icon: FileCheck,
    title: "Evidence packs",
    body:
      "Workflows finish with a branded 'Proof of Life' document — citations, sources, agent attribution and a verifiable audit trail you can hand to a regulator or client.",
  },
  {
    icon: Workflow,
    title: "Symbiotic workflows",
    body:
      "Trigger one agent from another. Manaaki's booking confirmations feed Auaha's review-request campaigns; Waihanga site check-ins feed Pikau's freight planning.",
  },
  {
    icon: Database,
    title: "Live NZ knowledge base",
    body:
      "Daily 5am NZST scans of 26 verified NZ regulatory sources — IRD, MBIE, MPI, NZTA, Privacy Commissioner. Agents cite the exact clause and effective date.",
  },
  {
    icon: Phone,
    title: "SMS + WhatsApp",
    body:
      "Every agent has a phone number. Customers text in te reo, English, Mandarin, Hindi, Samoan or Tongan — agents reply 24/7 via the unified Channel Gateway.",
  },
  {
    icon: Brain,
    title: "Per-agent memory",
    body:
      "Agents remember your business context, customer preferences and prior decisions. Memory is scoped to your tenant — never shared, never trained on.",
  },
  {
    icon: Globe,
    title: "Te reo Māori first-class",
    body:
      "Bilingual UI, te reo responses, and tikanga-aligned naming throughout. The Te Reo & Tikanga Advisor reviews tone and cultural fit before anything ships.",
  },
  {
    icon: Zap,
    title: "Visual workflow builder",
    body:
      "Drag-and-drop trigger nodes to wire your own multi-agent chains. Schedule them, gate them with human approval, or fire them on a webhook.",
  },
];

const FOR_NZ_BUSINESS = [
  "Privacy Act 2020 + Notifiable Breach support",
  "MBIE Responsible AI Guidance compliant",
  "Māori Data Sovereignty (MDS) control plane",
  "GST-ready invoicing via Stripe (NZD)",
  "IRD, MBIE, MPI, NZTA citations baked in",
  "Hosted in Aotearoa-friendly regions",
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="lowercase mb-6"
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      letterSpacing: "0.18em",
      color: PEARL.muted,
    }}
  >
    {children}
  </p>
);

const CapabilitiesPage = () => {
  return (
    <div style={{ background: PEARL.bg, minHeight: "100vh" }}>
      <SEO
        title="Capabilities — What Assembl does for NZ businesses"
        description="Streaming chat, multi-agent selection, Claude/GPT/Gemini support, evidence packs, NZ compliance scanning, te reo Māori, SMS + WhatsApp, and the Mana Trust Layer."
        path="/capabilities"
      />
      <BrandNav />

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-32 pb-16">
        <div className="max-w-5xl mx-auto">
          <Eyebrow>capabilities</Eyebrow>
          <motion.h1
            {...fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              color: PEARL.ink,
              letterSpacing: "-0.01em",
            }}
          >
            What Assembl does for{" "}
            <em style={{ color: PEARL.pounamu, fontStyle: "italic" }}>
              New Zealand businesses
            </em>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-lg md:text-xl max-w-3xl leading-relaxed"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: PEARL.bodyInk,
              fontWeight: 300,
            }}
          >
            A governed operating layer for NZ operators — streaming chat,
            specialist agents per industry, your choice of frontier models, and
            an evidence pack at the end of every workflow. Built in Aotearoa,
            for Aotearoa.
          </motion.p>
        </div>
      </section>

      {/* Headline capabilities — the three the user asked about */}
      <section className="px-6 md:px-12 lg:px-20 py-16" style={{ background: PEARL.linen }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {HEADLINE_CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className="rounded-3xl p-8 h-full flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: `1px solid ${PEARL.seaGlass}`,
                    boxShadow:
                      "10px 10px 30px rgba(166,166,180,0.18), -8px -8px 24px rgba(255,255,255,0.95)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background: `${PEARL.pounamu}14`,
                      border: `1px solid ${PEARL.pounamu}30`,
                    }}
                  >
                    <Icon size={22} style={{ color: PEARL.pounamu }} />
                  </div>
                  <h2
                    className="text-2xl mb-4"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      color: PEARL.ink,
                    }}
                  >
                    {cap.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed mb-6 flex-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: PEARL.bodyInk,
                    }}
                  >
                    {cap.body}
                  </p>
                  {cap.proof && (
                    <div
                      className="text-[11px] uppercase tracking-wider pt-4"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: PEARL.pounamu,
                        borderTop: `1px solid ${PEARL.seaGlass}`,
                      }}
                    >
                      {cap.proof}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform capabilities grid */}
      <section className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>everything else, governed</Eyebrow>
          <motion.h2
            {...fadeUp}
            className="text-3xl md:text-5xl mb-12 max-w-3xl"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              color: PEARL.ink,
              letterSpacing: "-0.01em",
            }}
          >
            The full platform, in plain English.
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: (i % 4) * 0.06 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: `1px solid ${PEARL.opal}`,
                  }}
                >
                  <Icon size={20} style={{ color: PEARL.pounamu }} />
                  <h3
                    className="mt-4 mb-2 text-lg"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                      color: PEARL.ink,
                    }}
                  >
                    {cap.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: PEARL.bodyInk,
                    }}
                  >
                    {cap.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For NZ business strip */}
      <section className="px-6 md:px-12 lg:px-20 py-20" style={{ background: PEARL.linen }}>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>built for aotearoa</Eyebrow>
          <motion.h2
            {...fadeUp}
            className="text-3xl md:text-4xl mb-10"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              color: PEARL.ink,
            }}
          >
            Compliance and context that lands here.
          </motion.h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {FOR_NZ_BUSINESS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${PEARL.opal}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 shrink-0"
                  style={{ background: PEARL.pounamu }}
                />
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: PEARL.ink,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            {...fadeUp}
            className="text-3xl md:text-5xl mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              color: PEARL.ink,
            }}
          >
            See it run on your business.
          </motion.h2>
          <p
            className="mb-10 text-lg"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: PEARL.bodyInk,
            }}
          >
            Pick a kete, ask a question, watch the streamed answer arrive with
            citations and an audit trail.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/kete"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full transition"
              style={{
                background: PEARL.pounamu,
                color: PEARL.bg,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                letterSpacing: "0.02em",
              }}
            >
              Browse the kete <ArrowRight size={16} />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full transition"
              style={{
                background: "transparent",
                color: PEARL.ink,
                border: `1px solid ${PEARL.ink}`,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                letterSpacing: "0.02em",
              }}
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default CapabilitiesPage;
