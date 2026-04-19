import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, User, Target, MessageSquare, CheckCircle2, XCircle, HelpCircle, Lightbulb, Shield, Zap, Users, FlaskConical, Brain, Award, BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";

const C = {
  bg: "#060610",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  navy: "#1A3A5C",
  white: "#FFFFFF",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.6)",
  t3: "rgba(255,255,255,0.36)",
  border: "rgba(255,255,255,0.07)",
  card: "rgba(255,255,255,0.03)",
  red: "#E74C3C",
  green: "#27AE60",
};

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

/* ─── Section wrapper ─── */
const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className={`max-w-4xl mx-auto px-5 sm:px-8 ${className}`}>
    {children}
  </motion.section>
);

const SectionTitle = ({ number, title, icon: Icon }: { number: string; title: string; icon: React.ElementType }) => (
  <motion.div variants={fade} className="flex items-center gap-4 mb-8 pt-14 pb-2">
    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${C.pounamu}20` }}>
      <Icon size={22} style={{ color: C.pounamuLight }} />
    </div>
    <div>
      <span className="text-xs font-mono uppercase tracking-widest" style={{ color: C.pounamuLight }}>{number}</span>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: C.t1 }}>{title}</h2>
    </div>
  </motion.div>
);

const Card = ({ children, className = "", highlight = false }: { children: React.ReactNode; className?: string; highlight?: boolean }) => (
  <motion.div variants={fade} className={`rounded-2xl p-6 sm:p-7 ${className}`} style={{
    background: highlight ? `${C.pounamu}12` : C.card,
    border: `1px solid ${highlight ? `${C.pounamu}30` : C.border}`,
  }}>
    {children}
  </motion.div>
);

const Badge = ({ children, color = C.pounamuLight }: { children: React.ReactNode; color?: string }) => (
  <span className="inline-flex items-center text-xs font-semibold rounded-full px-3 py-1" style={{ background: `${color}18`, color }}>{children}</span>
);

/* ─── Comparison row ─── */
const CompRow = ({ need, offer }: { need: string; offer: string }) => (
  <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
    <div className="flex gap-3">
      <HelpCircle size={16} className="shrink-0 mt-0.5" style={{ color: C.gold }} />
      <p className="text-[15px] leading-relaxed" style={{ color: C.t2 }}>{need}</p>
    </div>
    <div className="flex gap-3">
      <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: C.pounamuLight }} />
      <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>{offer}</p>
    </div>
  </motion.div>
);

/* ─── Script block ─── */
const ScriptBlock = ({ title, time, children }: { title: string; time: string; children: React.ReactNode }) => (
  <Card className="mb-5">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-lg font-bold" style={{ color: C.t1 }}>{title}</h4>
      <Badge>{time}</Badge>
    </div>
    <div className="text-[15px] leading-[1.85] space-y-4" style={{ color: C.t2 }}>
      {children}
    </div>
  </Card>
);

/* ─── QA card ─── */
const QACard = ({ q, a }: { q: string; a: string }) => (
  <Card className="mb-4">
    <div className="flex gap-3 mb-3">
      <MessageSquare size={16} className="shrink-0 mt-1" style={{ color: C.gold }} />
      <p className="text-[15px] font-semibold" style={{ color: C.t1 }}>"{q}"</p>
    </div>
    <p className="text-[14px] leading-[1.85] ml-7" style={{ color: C.t2 }}>{a}</p>
  </Card>
);

/* ─── Do / Don't ─── */
const DoItem = ({ text }: { text: string }) => (
  <motion.div variants={fade} className="flex gap-3 py-2">
    <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: C.green }} />
    <p className="text-[14px] leading-relaxed" style={{ color: C.t1 }}>{text}</p>
  </motion.div>
);
const DontItem = ({ text }: { text: string }) => (
  <motion.div variants={fade} className="flex gap-3 py-2">
    <XCircle size={16} className="shrink-0 mt-0.5" style={{ color: C.red }} />
    <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>{text}</p>
  </motion.div>
);

export default function AaaipPitchPrep() {
  return (
    <LightPageShell>
    <div className="min-h-screen" style={{ background: C.bg }}>
      <SEO title="AAAIP Pitch Prep — Assembl" description="Pitch preparation for Professor Gill Dobbie meeting, 16 April 2026." />
      <BrandNav />

      {/* ─── Hero ─── */}
      <Section className="pt-16 pb-6">
        <motion.div variants={fade}>
          <Badge>MEETING PREP</Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-5 mb-4" style={{ color: C.t1 }}>
            AAAIP Pitch Prep
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed mb-8" style={{ color: C.t2 }}>
            Prepared for Kate Hudson, Assembl — pitching as an industry partner for the Aotearoa Agentic AI Platform
          </p>
          <div className="flex flex-wrap gap-5 text-sm" style={{ color: C.t2 }}>
            <span className="flex items-center gap-2"><Calendar size={15} style={{ color: C.pounamuLight }} /> Wednesday 16 April 2026</span>
            <span className="flex items-center gap-2"><User size={15} style={{ color: C.pounamuLight }} /> Professor Gill Dobbie</span>
            <span className="flex items-center gap-2"><MapPin size={15} style={{ color: C.pounamuLight }} /> University of Auckland</span>
          </div>
        </motion.div>
      </Section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8"><div className="h-px" style={{ background: C.border }} /></div>

      {/* ─── 1 · Who is Gill ─── */}
      <Section>
        <SectionTitle number="01" title="Who is Professor Gill Dobbie?" icon={User} />
        <Card highlight className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.pounamuLight }}>Position</h4>
              <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>Professor of Computer Science, University of Auckland. Head of Research for the AAAIP.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.pounamuLight }}>Honours</h4>
              <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>Fellow of the Royal Society of New Zealand <span style={{ color: C.t2 }}>(elected 2022)</span> — one of NZ's most respected scientists.</p>
            </div>
          </div>
        </Card>

        <Card className="mb-5">
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: C.pounamuLight }}>Key Roles</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Co-Director, NAOInstitute (Natural, Artificial & Organisation Intelligence)",
              "Co-Director, Centre of Machine Learning for Social Good",
              "Chair, Marsden Fund Council",
              "Director, Auckland ICT Graduate School",
            ].map((r) => (
              <div key={r} className="flex gap-2 items-start">
                <ChevronRight size={14} className="shrink-0 mt-1" style={{ color: C.pounamuLight }} />
                <p className="text-[14px]" style={{ color: C.t1 }}>{r}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mb-5">
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.pounamuLight }}>Research Focus</h4>
          <p className="text-[15px] leading-relaxed mb-3" style={{ color: C.t2 }}>AI, machine learning, data stream mining, AI ethics and bias elimination, data management. 170+ peer-reviewed publications. 5,500+ citations.</p>
          <div className="rounded-xl p-4 mt-4" style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}25` }}>
            <div className="flex gap-3">
              <Lightbulb size={16} className="shrink-0 mt-0.5" style={{ color: C.gold }} />
              <p className="text-[14px] leading-relaxed" style={{ color: C.t1 }}>
                <strong>Current passion project:</strong> Eliminating bias and hallucinations from LLMs. Published specifically on AI bias in NZ healthcare — using fairness measures to detect and fix discrimination in health data and AI models.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <Target size={16} className="shrink-0 mt-1" style={{ color: C.pounamuLight }} />
            <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>
              <strong>What this tells you:</strong> Gill cares deeply about AI that is fair, reliable, and aligned with NZ values. She's not just interested in what AI can do — she's focused on making sure it does it responsibly. <em style={{ color: C.pounamuLight }}>Lead with how Assembl addresses trust, accuracy, and NZ-specific needs.</em>
            </p>
          </div>
        </Card>
      </Section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6"><div className="h-px" style={{ background: C.border }} /></div>

      {/* ─── 2 · What is AAAIP ─── */}
      <Section>
        <SectionTitle number="02" title="What is the AAAIP?" icon={Brain} />

        <Card highlight className="mb-5">
          <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>
            The Aotearoa Agentic AI Platform is one of 5 concepts shortlisted for the <strong>NZIAT national AI research platform</strong>, backed by up to <span className="font-bold" style={{ color: C.gold }}>$70 million over 7 years</span>.
          </p>
          <div className="rounded-xl p-4 mt-5" style={{ background: `${C.pounamu}15` }}>
            <p className="text-[15px] italic leading-relaxed" style={{ color: C.pounamuGlow }}>
              "Augment our population of 5 million New Zealanders with 100 million AI assistants, creating a wealthier and fairer country."
            </p>
          </div>
        </Card>

        <Card className="mb-5">
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: C.pounamuLight }}>What they're building</h4>
          <div className="space-y-3">
            {[
              "Next-generation AI agents that learn and maintain themselves by actively seeking data and observing the world",
              "Agentic simulations of Aotearoa to test AI agents and policies for reliability, efficiency, and alignment with NZ values before real-world deployment",
              "Focus areas: healthcare, robotics/automation, science discovery (drug discovery)",
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <ChevronRight size={14} className="shrink-0 mt-1" style={{ color: C.pounamuLight }} />
                <p className="text-[14px] leading-relaxed" style={{ color: C.t1 }}>{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Card>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.pounamuLight }}>Partners so far</h4>
            <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>Beca, Spark, Fonterra, Datacom, plus NZ and international universities and research organisations.</p>
          </Card>
          <Card>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.pounamuLight }}>Timeline</h4>
            <p className="text-[14px] leading-relaxed" style={{ color: C.t2 }}>Final platform selection happening now (H1 2026). Funding from July 2026. Each shortlisted concept got $250K seed.</p>
          </Card>
        </div>

        <Card>
          <div className="flex gap-3">
            <Lightbulb size={16} className="shrink-0 mt-1" style={{ color: C.gold }} />
            <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>
              <strong>Critical context:</strong> Gill is building her case for why AAAIP should win the $70M. She needs real-world industry examples that prove agentic AI works in NZ, and partners who strengthen the proposal. <em style={{ color: C.gold }}>That's your opening.</em>
            </p>
          </div>
        </Card>
      </Section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6"><div className="h-px" style={{ background: C.border }} /></div>

      {/* ─── 3 · Pitch Strategy ─── */}
      <Section>
        <SectionTitle number="03" title="Your Pitch Strategy" icon={Target} />

        <motion.div variants={fade} className="mb-6">
          <p className="text-[15px] leading-relaxed" style={{ color: C.t2 }}>
            Gill doesn't need another pitch deck. She's an academic leader building a $70M national platform. Here's what she needs from you — and how Assembl delivers it.
          </p>
        </motion.div>

        {/* comparison header */}
        <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 pb-3 mb-1">
          <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.gold }}>What Gill / AAAIP Needs</h4>
          <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.pounamuLight }}>What Assembl Offers</h4>
        </motion.div>

        <CompRow need="Real-world proof that agentic AI works in NZ — the proposal is theoretical, she needs production examples" offer="A live multi-agent platform running across 13+ NZ industries with real legislation" />
        <CompRow need="Industry partners to strengthen the bid — current partners are big corporates (Beca, Spark, Fonterra)" offer="The SME perspective — 97% of NZ businesses are small; Assembl serves them directly" />
        <CompRow need="Evidence of NZ values alignment — her research is about eliminating AI bias and ensuring fairness" offer="Tikanga compliance pipeline and cultural governance layer built into the agent architecture" />
        <CompRow need="Multi-agent orchestration research data — AAAIP is researching how agents coordinate" offer="48 specialist agents coordinated by Iho (central intelligence) with real orchestration data" />
        <CompRow need="NZ-specific testbed scenarios — they want to simulate agentic AI in NZ contexts" offer="Production system with NZ legislation, NZ business workflows, NZ compliance rules" />
        <CompRow need="Hallucination and accuracy research — Gill's personal research focus" offer="Five-stage compliance pipeline specifically designed to catch AI errors in high-stakes legal contexts" />

        <Card className="mt-6" highlight>
          <div className="flex gap-3">
            <Zap size={16} className="shrink-0 mt-1" style={{ color: C.gold }} />
            <p className="text-[15px] leading-relaxed" style={{ color: C.t1 }}>
              <strong>Your unique angle:</strong> Beca, Spark, Fonterra and Datacom are big corporates. Assembl is the scrappy NZ founder actually <em>building</em> agentic AI right now — not researching it, not planning it, <em>doing it</em>. In production. For real NZ businesses. That's rare and valuable to Gill's proposal.
            </p>
          </div>
        </Card>
      </Section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6"><div className="h-px" style={{ background: C.border }} /></div>

      {/* ─── 4 · Pitch Script ─── */}
      <Section>
        <SectionTitle number="04" title="What to Say — Your Pitch Script" icon={MessageSquare} />

        <motion.div variants={fade} className="mb-6">
          <p className="text-[15px] leading-relaxed" style={{ color: C.t2 }}>
            Keep this conversational. Gill is an academic — she'll appreciate substance over sales talk. Be direct, be honest about where you are, and focus on what you can contribute to the platform.
          </p>
        </motion.div>

        <ScriptBlock title="Opening" time="2 min">
          <p>Thanks for meeting with me, Gill. I'm Kate Hudson, founder of Assembl. I reached out because what you're building with the AAAIP is exactly aligned with what I'm building commercially — and I think there's a really natural partnership here.</p>
          <p>Assembl is a multi-agent AI platform built specifically for New Zealand small businesses. I have 48 specialist AI agents, each trained on a specific area of NZ legislation or business operations — employment law, food safety, health and safety, privacy, tax, construction, hospitality — and they work together through a central intelligence layer to give coordinated, accurate answers.</p>
          <p>Your vision is 100 million AI assistants for 5 million New Zealanders. I'm building the version of that for the 500,000+ NZ small businesses that can't afford Beca or Datacom.</p>
        </ScriptBlock>

        <ScriptBlock title="The Technical Story" time="3 min">
          <p>The core R&D challenge I've been solving is multi-agent orchestration. When a cafe owner asks a question, it might touch employment law, food safety, AND health and safety simultaneously. I've built a central brain — we call it Iho — that classifies the intent, routes it to the right specialist agents, and coordinates their responses so they don't contradict each other.</p>
          <p>I've also built a compliance pipeline — five stages — that every output passes through before it reaches the user. That's specifically to address the accuracy and hallucination problem. In a legal context, a wrong answer isn't just unhelpful — it can cost someone their business or put someone at risk.</p>
          <p>And there's a cultural governance layer — tikanga compliance — that ensures outputs respect Māori values and Te Tiriti obligations. I know your platform talks about alignment with NZ values — I'm actually implementing that at the agent architecture level.</p>
        </ScriptBlock>

        <ScriptBlock title="The Partnership Pitch" time="2 min">
          <p><strong>First — a live testbed.</strong> You're building simulations of agentic AI in NZ contexts. I have a production system running across 13+ NZ industries with real legislation. That's real-world data on how agents perform, where they fail, how they coordinate.</p>
          <p><strong>Second — the SME angle.</strong> Your current partners are large corporates. But 97% of NZ businesses are small. If the platform's vision is 100 million AI assistants for all New Zealanders, you need someone demonstrating that agentic AI works for the hairdresser, the cafe, the builder — not just Fonterra.</p>
          <p><strong>Third — hallucination research.</strong> I know this is close to your personal research. My compliance pipeline is specifically designed to catch AI errors in high-stakes legal contexts. I'd love to collaborate on measuring and reducing hallucinations in domain-specific agent systems.</p>
          <p style={{ color: C.t1 }}>I'm not asking for funding. I'm offering Assembl as a real-world industry partner that strengthens the AAAIP proposal with production evidence and SME reach.</p>
        </ScriptBlock>

        <ScriptBlock title="Closing" time="1 min">
          <p>I know you're in the middle of finalising the proposal for NZIAT selection. I'd love to understand what kind of industry partnership would be most valuable to you at this stage, and how Assembl could contribute — whether that's data, case studies, a research collaboration, or simply being a named industry partner that demonstrates real-world agentic AI in NZ.</p>
        </ScriptBlock>
      </Section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6"><div className="h-px" style={{ background: C.border }} /></div>

      {/* ─── 5 · Questions she'll ask ─── */}
      <Section>
        <SectionTitle number="05" title="Questions Gill Will Likely Ask" icon={HelpCircle} />

        <QACard
          q="What stage is Assembl at?"
          a="I've been building full-time since February. The platform is live at assembl.co.nz. I'm incorporated, doing formal R&D — I actually have my first RDTI meeting with Callaghan Innovation this week. Pre-revenue, but the product is built and functional."
        />
        <QACard
          q="How do you handle accuracy and hallucinations?"
          a="Every agent output passes through a five-stage compliance pipeline — Kahu flags the regulatory context, Iho routes to the right specialist, Tā formats the response, Mahara checks it against source legislation, and Mana does a final governance check. If any stage fails, the output doesn't reach the user. I'd love to share data on where agents fail and how the pipeline catches errors — that could be valuable research material for your hallucination work."
        />
        <QACard
          q="How does the tikanga governance posture work?"
          a="It's a governance framework built into the agent architecture. Every output is checked against four pou — Rangatiratanga, Kaitiakitanga, Manaakitanga, and Whanaungatanga. If content touches Māori contexts, the tikanga posture ensures it's handled with appropriate cultural respect. Mead's Five Tests are applied to Māori-origin content, and sacred content is hard-blocked. I should be transparent — I'm still developing the full protocol and I've paused expanding Māori-specific content until the governance framework is properly in place. I'm taking a default-deny approach."
        />
        <QACard
          q="What's your technical background?"
          a="I'm a coding beginner — I came to this from a business background, not computer science. I build with AI-assisted development tools like Lovable and Claude. That's actually part of the story — if someone like me can build a 48-agent platform using AI tools, that's evidence of what agentic AI enables for non-technical founders. But I'd hugely benefit from academic collaboration on the harder problems — agent reliability, hallucination reduction, orchestration efficiency."
        />
        <QACard
          q="What would you want from a partnership?"
          a="Primarily, I want to contribute to the platform's success — a named industry partner, real-world test data, and the SME perspective in your proposal. What I'd gain is credibility, research collaboration, and connection to NZ's AI research community. I'm not looking for direct funding through this — I'm pursuing RDTI and the New to R&D Grant separately."
        />
      </Section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6"><div className="h-px" style={{ background: C.border }} /></div>

      {/* ─── 6 · Do's and Don'ts ─── */}
      <Section className="pb-24">
        <SectionTitle number="06" title="Do's and Don'ts" icon={Shield} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: C.green }}>Do</h4>
            <DoItem text="Lead with what you can contribute to the AAAIP, not what you want from it" />
            <DoItem text="Be honest about your stage — early, pre-revenue, solo founder. Gill will respect honesty" />
            <DoItem text="Reference her hallucination/bias research — it shows you've done your homework" />
            <DoItem text="Use the phrase 'alignment with NZ values' — it's central to the AAAIP proposal" />
            <DoItem text="Mention your compliance pipeline and how it addresses AI accuracy in high-stakes domains" />
            <DoItem text="Ask good questions — what does the platform need? What gaps exist?" />
            <DoItem text="Be enthusiastic but grounded — be the authentic founder" />
          </Card>
          <Card>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: C.red }}>Don't</h4>
            <DontItem text="Don't oversell or make unbacked claims (e.g., 'enterprise-grade', 'trained on 50+ Acts')" />
            <DontItem text="Don't pitch Assembl as a product to sell her — pitch it as a research/collaboration asset" />
            <DontItem text="Don't pretend to be a computer scientist — own your non-technical background as a strength" />
            <DontItem text="Don't ask for money — this meeting is about partnership, not funding" />
            <DontItem text="Don't rush. Gill is an academic — she'll want depth and substance, not speed" />
            <DontItem text="Don't use jargon you can't explain if she asks follow-up questions" />
          </Card>
        </div>
      </Section>
      <BrandFooter />
    </div>
    </LightPageShell>
  );
}
