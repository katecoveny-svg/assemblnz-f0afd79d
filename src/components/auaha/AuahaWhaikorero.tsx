// ═══════════════════════════════════════════════════════════════
// Auaha — Whaikōrero Sales Assistant
//
// Route: /auaha/whaikorero
// Kete: Auaha (Creative Intelligence)
//
// Agentic sales assistant with four modules:
//   1. Prospecting — ICP builder, prospect list generation
//   2. Outreach Drafts — cold email, LinkedIn, follow-up
//   3. Pipeline Review — deal health check, at-risk flagging
//   4. Call Prep — call brief, talking points, objection handling
//
// "Whaikōrero" (Māori) — to speak, to orate; here, the craft
// of purposeful sales conversation.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Target,
  Mail,
  BarChart2,
  Phone,
  Copy,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";

const ACCENT = "#F0D078";

// ── Types ─────────────────────────────────────────────────────

type ActiveTab = "prospecting" | "outreach" | "pipeline" | "callprep";

// ── Prospecting ────────────────────────────────────────────────

const ICP_SIGNALS = [
  "Industry / sector",
  "Company size (headcount)",
  "Annual revenue range",
  "Tech stack",
  "Hiring signals",
  "Recent funding",
  "Pain indicators (e.g. rapid growth, compliance pressure)",
  "Geographic region",
];

function ProspectingPanel() {
  const [company, setCompany] = useState("");
  const [brief, setBrief] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const generate = () => {
    if (!company.trim()) return;
    setOutput(
      `ICP PROFILE — Based on ${company}\n\n` +
        `IDEAL CUSTOMER PROFILE\n${"─".repeat(40)}\n\n` +
        `FIRMOGRAPHICS\n` +
        `• Industry: [Match industries served by ${company}]\n` +
        `• Size: 50–500 employees (SME to mid-market sweet spot)\n` +
        `• Revenue: NZ$5M–$100M ARR\n` +
        `• Stage: Growth or scale-up phase\n` +
        `• Geography: New Zealand (primary), Australia (secondary)\n\n` +
        `TECHNOGRAPHICS\n` +
        `• Uses cloud-based SaaS stack (Xero, HubSpot, Slack)\n` +
        `• Has budget allocated for software (signals: job ads, G2 reviews)\n` +
        `• Pain: manual processes, data silos, lack of automation\n\n` +
        `BUYING SIGNALS TO TRACK\n` +
        `• LinkedIn: hiring for "Operations", "Digital Transformation"\n` +
        `• Press: recent funding announcement, acquisition, expansion\n` +
        `• Job ads: CRM, ERP, or platform-specific roles\n` +
        `• Reviews: negative reviews of incumbent solution\n\n` +
        `PERSONA\n` +
        `• Title: CEO (SME), Head of Operations / Digital, CFO\n` +
        `• Decision style: ROI-driven, risk-averse, referral-influenced\n` +
        `• Channel: LinkedIn first, then warm email, then call\n\n` +
        (brief ? `CONTEXT NOTES\n${brief}\n\n` : "") +
        `─────────────────────────────────────────\n` +
        `⚠  This ICP is a starting point — validate against your win/loss data\n` +
        `   and refine with your first 10 closed deals.`,
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-[#6B7280] text-sm leading-relaxed">
        Build an ideal customer profile (ICP) to focus prospecting. Enter your company or product
        context — Whaikōrero generates a structured ICP with firmographics, technographics, and
        buying signals.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Your company or product</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Assembl — AI business operations platform for NZ SMEs"
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">
            ICP signals to emphasise (optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {ICP_SIGNALS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setBrief((b) => (b ? `${b}, ${s}` : s))}
                className="px-2.5 py-1 rounded-full text-[10px] bg-[rgba(74,165,168,0.04)] text-[#6B7280] hover:bg-[rgba(74,165,168,0.06)] hover:text-[#2A2F3D] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={2}
            placeholder="Additional context..."
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0] resize-none"
          />
        </div>
        <button
          onClick={generate}
          disabled={!company.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: ACCENT, color: "#09090F" }}
        >
          Generate ICP →
        </button>
      </div>

      {output && (
        <div className="rounded-xl border border-gray-200 bg-white/[0.03] p-4 relative">
          <button
            onClick={() => navigator.clipboard?.writeText(output)}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[rgba(74,165,168,0.06)] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
          <pre className="text-xs text-[#2A2F3D] whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  );
}

// ── Outreach Drafts ────────────────────────────────────────────

type OutreachType = "cold_email" | "linkedin" | "followup" | "referral_ask";

const OUTREACH_LABELS: Record<OutreachType, string> = {
  cold_email: "Cold Email",
  linkedin: "LinkedIn Connection",
  followup: "Follow-up",
  referral_ask: "Referral Ask",
};

function generateOutreach(type: OutreachType, prospect: string, pain: string, product: string): string {
  const p = prospect || "[Prospect Name]";
  const pl = pain || "manual processes and data silos";
  const pr = product || "Assembl";

  switch (type) {
    case "cold_email":
      return `Subject: Quick question about ${pl} at ${p}'s company\n\nHi [First Name],\n\nI noticed [personalised observation — e.g. you recently expanded to a second location / your team is scaling fast].\n\nWe work with NZ businesses like yours to [solve: ${pl}] — typically saving teams 6–10 hours a week on [specific task].\n\n${pr} does [one-line value prop]. Happy to share a 3-minute overview if that's useful?\n\nNo pitch, just a quick look to see if there's a fit.\n\n[Your Name]\n[Title] · ${pr}\n[Phone] · [Calendar link]\n\n---\n💡 Personalise the first line before sending. Generic openers cut response rates by ~40%.`;

    case "linkedin":
      return `Hi [First Name],\n\nSaw your post on [topic] — resonated with how we think about [theme].\n\nI help NZ [industry] businesses [outcome — e.g. cut admin time by automating their operations]. Thought it might be worth a connection.\n\n— [Your Name]\n\n---\n💡 Keep LinkedIn notes under 300 characters. No pitch in the first message.`;

    case "followup":
      return `Subject: Re: ${p} × ${pr}\n\nHi [First Name],\n\nFollowing up on my message last week — I know inboxes get busy.\n\nOne thing I didn't mention: [new insight or case study relevant to their situation].\n\nWorth 15 minutes? [Calendar link]\n\nIf the timing isn't right, happy to reconnect in a month — just say the word.\n\n[Your Name]\n\n---\n💡 Follow up 3–5 business days after the first touch. Three follow-ups is the average before a response.`;

    case "referral_ask":
      return `Subject: Quick favour?\n\nHi [First Name],\n\nThings have been going well since we [worked together / you started using ${pr}] — glad it's been useful.\n\nI'm looking to help more [industry] businesses in NZ with [pain point]. If you know anyone who might benefit, I'd really appreciate an intro — even just a "Hey, you should talk to [Name]" message.\n\nHappy to return the favour if I can ever be useful in your network.\n\nThanks,\n[Your Name]`;
  }
}

function OutreachPanel() {
  const [type, setType] = useState<OutreachType>("cold_email");
  const [prospect, setProspect] = useState("");
  const [pain, setPain] = useState("");
  const [product, setProduct] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <p className="text-[#6B7280] text-sm leading-relaxed">
        Generate first-draft outreach for cold email, LinkedIn, follow-up, or referral asks.
        Built for NZ B2B sales — direct, no fluff, personalisation-first.
      </p>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(OUTREACH_LABELS) as OutreachType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="px-3 py-1.5 rounded-full text-xs transition-all"
            style={
              type === t
                ? { background: ACCENT, color: "#09090F", fontWeight: 600 }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }
            }
          >
            {OUTREACH_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Prospect / company</label>
          <input
            value={prospect}
            onChange={(e) => setProspect(e.target.value)}
            placeholder="e.g. Acme NZ"
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Pain point</label>
          <input
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            placeholder="e.g. manual payroll processing"
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Your product / company</label>
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Assembl"
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0]"
          />
        </div>
      </div>

      <button
        onClick={() => setOutput(generateOutreach(type, prospect, pain, product))}
        className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: ACCENT, color: "#09090F" }}
      >
        Draft outreach →
      </button>

      {output && (
        <div className="rounded-xl border border-gray-200 bg-white/[0.03] p-4 relative">
          <button
            onClick={() => navigator.clipboard?.writeText(output)}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[rgba(74,165,168,0.06)] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
          <pre className="text-xs text-[#2A2F3D] whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  );
}

// ── Pipeline Review ────────────────────────────────────────────

interface Deal {
  id: string;
  name: string;
  stage: string;
  value: number;
  daysInStage: number;
  lastContact: number; // days ago
  nextStep: string;
}

const DEMO_PIPELINE: Deal[] = [
  { id: "d1", name: "Acme NZ — Operator", stage: "Proposal Sent", value: 17880, daysInStage: 18, lastContact: 12, nextStep: "Follow up on pricing Q" },
  { id: "d2", name: "Kiwi Build Group — Leader", stage: "Discovery", value: 23880, daysInStage: 4, lastContact: 2, nextStep: "Book demo call" },
  { id: "d3", name: "Southern Cross — Enterprise", stage: "Negotiation", value: 35880, daysInStage: 31, lastContact: 21, nextStep: "Legal review — chase" },
  { id: "d4", name: "Pohutukawa Finance — Operator", stage: "Trial", value: 17880, daysInStage: 7, lastContact: 1, nextStep: "Check onboarding progress" },
  { id: "d5", name: "Tasman Media — Leader", stage: "Closed Won", value: 23880, daysInStage: 0, lastContact: 3, nextStep: "Handover to CS" },
];

function riskLevel(deal: Deal): "healthy" | "at_risk" | "stalled" {
  if (deal.stage === "Closed Won") return "healthy";
  if (deal.daysInStage > 21 || deal.lastContact > 14) return "stalled";
  if (deal.daysInStage > 10 || deal.lastContact > 7) return "at_risk";
  return "healthy";
}

const RISK_COLORS = {
  healthy: "#4E8B5A",
  at_risk: "#D4A843",
  stalled: "#C65D4E",
};
const RISK_LABELS = { healthy: "Healthy", at_risk: "At risk", stalled: "Stalled" };

function PipelinePanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[#6B7280] text-sm">
          Pipeline health review — deals flagged by last-contact and time-in-stage thresholds.
        </p>
        <span className="text-[10px] text-[#6B7280] uppercase tracking-widest">Demo data</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["healthy", "at_risk", "stalled"] as const).map((r) => {
          const count = DEMO_PIPELINE.filter((d) => riskLevel(d) === r).length;
          const val = DEMO_PIPELINE.filter((d) => riskLevel(d) === r).reduce((a, b) => a + b.value, 0);
          return (
            <div key={r} className="rounded-xl p-3" style={{ background: `${RISK_COLORS[r]}12`, border: `1px solid ${RISK_COLORS[r]}30` }}>
              <p className="text-xs font-medium mb-1" style={{ color: RISK_COLORS[r] }}>{RISK_LABELS[r]}</p>
              <p className="text-xl text-foreground font-mono">{count}</p>
              <p className="text-[10px] text-[#6B7280]">NZ${(val / 1000).toFixed(0)}k ARR</p>
            </div>
          );
        })}
      </div>

      {/* Deal list */}
      <div className="space-y-2">
        {DEMO_PIPELINE.map((deal) => {
          const risk = riskLevel(deal);
          return (
            <div key={deal.id} className="rounded-xl p-3 border border-gray-100 bg-white/[0.02]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: RISK_COLORS[risk] }}
                    />
                    <span className="text-sm text-foreground truncate">{deal.name}</span>
                    <span className="text-[10px] text-[#6B7280] shrink-0">{deal.stage}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
                    <span>NZ${(deal.value / 1000).toFixed(0)}k/yr</span>
                    <span>{deal.daysInStage}d in stage</span>
                    <span>Last contact: {deal.lastContact}d ago</span>
                  </div>
                </div>
                {risk !== "healthy" && (
                  <TrendingDown className="w-4 h-4 shrink-0" style={{ color: RISK_COLORS[risk] }} />
                )}
                {risk === "healthy" && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: RISK_COLORS.healthy }} />
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: ACCENT }}>
                <ChevronRight className="w-3 h-3" />
                <span>{deal.nextStep}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[#8B92A0]">
        Thresholds: at-risk = 10+ days in stage or 7+ days since contact. Stalled = 21+ days or 14+ days.
        Connect your CRM to replace demo data.
      </p>
    </div>
  );
}

// ── Call Prep ─────────────────────────────────────────────────

function CallPrepPanel() {
  const [prospect, setProspect] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const generate = () => {
    if (!prospect.trim()) return;
    const p = prospect;
    const ctx = context || "First discovery call";
    setOutput(
      `CALL BRIEF — ${p}\n${"─".repeat(40)}\n\n` +
        `OBJECTIVE\n` +
        `${ctx} — qualify BANT (Budget, Authority, Need, Timeline) and earn a next step.\n\n` +
        `OPENING (30 sec)\n` +
        `"Thanks for making time, ${p}. Quick agenda: I'll take about 5 minutes to understand your situation, then show you what we do — and if it's not a fit, I'll tell you straight. Sound good?"\n\n` +
        `DISCOVERY QUESTIONS\n` +
        `1. Walk me through how you currently handle [problem area] — what does that look like day to day?\n` +
        `2. What's the cost of not fixing this — in time, money, or headaches?\n` +
        `3. Have you tried other solutions? What got in the way?\n` +
        `4. Who else would be involved in a decision like this?\n` +
        `5. If we found a fit today, what would the path to a decision look like?\n\n` +
        `VALUE STATEMENT (after discovery)\n` +
        `"Based on what you've shared, [specific pain] is costing you roughly [estimated impact]. Here's how we'd address that..."\n\n` +
        `OBJECTION HANDLING\n` +
        `Price: "What's your current cost of doing this manually / with your existing tool?"\n` +
        `Timing: "What needs to change for this to be the right time?"\n` +
        `"Need to think about it": "Totally fair — what would make you more confident?"\n` +
        `Competitor: "What's drawing you to them? Let me show you where we differ."\n\n` +
        `CLOSE\n` +
        `"Based on what we've discussed — does it make sense to [next step: book a demo / start a trial / get a proposal]?"\n\n` +
        `FOLLOW-UP (within 24 hrs)\n` +
        `• Summary email with 3 bullet points from the call\n` +
        `• One relevant case study or stat\n` +
        `• Clear next step with a date\n\n` +
        `─────────────────────────────────────────\n` +
        `⚠  Review this against your CRM notes before the call. Never wing discovery.`,
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-[#6B7280] text-sm leading-relaxed">
        Generate a structured call brief — discovery questions, value statement, objection handling,
        and a close framework. Prep takes 5 minutes; it shows.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Prospect / company</label>
          <input
            value={prospect}
            onChange={(e) => setProspect(e.target.value)}
            placeholder="e.g. Acme NZ — Sarah (CEO)"
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5">Call context / stage</label>
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Second demo — pricing discussion"
            className="w-full rounded-xl border border-gray-200 bg-[rgba(74,165,168,0.04)] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400/40 placeholder:text-[#8B92A0]"
          />
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!prospect.trim()}
        className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
        style={{ background: ACCENT, color: "#09090F" }}
      >
        Generate call brief →
      </button>

      {output && (
        <div className="rounded-xl border border-gray-200 bg-white/[0.03] p-4 relative">
          <button
            onClick={() => navigator.clipboard?.writeText(output)}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[rgba(74,165,168,0.06)] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
          <pre className="text-xs text-[#2A2F3D] whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: "prospecting", label: "Prospecting", icon: Target },
  { id: "outreach", label: "Outreach Drafts", icon: Mail },
  { id: "pipeline", label: "Pipeline Review", icon: BarChart2 },
  { id: "callprep", label: "Call Prep", icon: Phone },
];

export default function AuahaWhaikorero() {
  const [tab, setTab] = useState<ActiveTab>("prospecting");

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <p
          className="text-[10px] uppercase tracking-[5px] mb-2"
          style={{ color: ACCENT, fontFamily: "Lato, sans-serif", fontWeight: 700 }}
        >
          WHAIKŌRERO — SALES ASSISTANT
        </p>
        <h1
          className="text-2xl text-foreground mb-2"
          style={{ fontFamily: "Lato, sans-serif", fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          Prospecting, outreach & pipeline — done right
        </h1>
        <p className="text-[#6B7280] text-sm leading-relaxed">
          Structured sales workflows for NZ B2B — ICP building, first-draft outreach, deal health
          review, and call prep. All output is a first draft: personalise before sending.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={
              tab === t.id
                ? { background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
            }
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="rounded-2xl border border-gray-100 bg-white/[0.02] p-5">
        {tab === "prospecting" && <ProspectingPanel />}
        {tab === "outreach" && <OutreachPanel />}
        {tab === "pipeline" && <PipelinePanel />}
        {tab === "callprep" && <CallPrepPanel />}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 flex items-start gap-2 text-[10px] text-[#8B92A0]">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
        <p>
          Whaikōrero generates first-draft content for review. Always personalise outreach before
          sending — generic messages harm response rates. Pipeline data above is demo only; connect
          your CRM for live health scoring.
        </p>
      </div>
    </div>
  );
}
