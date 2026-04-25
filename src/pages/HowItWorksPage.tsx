import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

/* ── Mārama Whenua palette (locked) ── */
const C = {
  bg: "#F7F3EE",          // Mist
  cloud: "#EEE7DE",       // Cloud
  sand: "#D8C8B4",        // Sand
  taupe: "#9D8C7D",       // Taupe (headings)
  taupeDeep: "#6F6158",   // Taupe Deep (body text)
  gold: "#D9BC7A",        // Soft Gold (CTA)
  goldDeep: "#C9A862",
};

type Step = {
  n: string;
  label: string;
  title: string;
  body: string[];
};

const STEPS: Step[] = [
  {
    n: "01",
    label: "Pick your kete",
    title: "Choose what you need",
    body: [
      "A kete is a specialist toolkit built for a specific industry. MANAAKI handles hospitality operations. WAIHANGA covers construction. AUAHA runs creative workflows. Pick the kete that match the work eating your time.",
      "Starting with Grow? You get two. Not sure which two? We'll ask a few questions during setup and recommend the combination that covers the most ground for your business.",
    ],
  },
  {
    n: "02",
    label: "Connect your tools",
    title: "Xero, Deputy, Google — one click each",
    body: [
      "You log into Assembl, go to Settings, and click \"Connect\" next to each tool you use. It opens your normal Xero login (or Deputy, or Google) and asks you to approve access. That's it.",
      "Assembl reads your existing data — employee records from Xero, shift schedules from Deputy, documents from Google Drive. It never moves your data anywhere. It never changes anything in your tools without telling you first. Think of it like giving a new staff member read access to the systems they need to do their job.",
      "The whole process takes about ten minutes. If you get stuck, we're on a call with you.",
    ],
  },
  {
    n: "03",
    label: "We map your workflows",
    title: "Your business, not a template",
    body: [
      "Every business runs differently. A café in Ponsonby doesn't operate like a construction firm in Hamilton, even if they both need compliance and scheduling sorted.",
      "During setup, we map the workflows that matter to your business. Which compliance checks do you need to run, and when? How does your roster work? What reports does your accountant actually want? We configure the agents around the way you already work — not the other way around.",
      "This is where the setup fee earns its keep. It's not a software licence charge. It's the work of fitting Assembl to your operation so the agents are useful from day one, not day ninety.",
    ],
  },
  {
    n: "04",
    label: "Agents go live",
    title: "Quiet, consistent, documented",
    body: [
      "Once configured, the agents start handling the operational work you've mapped. Compliance checks run on schedule. Roster gaps get flagged before they become problems. Reports generate and land in your inbox or your accountant's.",
      "Every action produces an evidence pack — a timestamped record of what was checked, what was found, and what was done about it. If WorkSafe asks how you verified a competency, you've got the receipt. If your accountant asks when the last BAS reconciliation ran, there's a log.",
      "Your team sees the outputs through channels they already check: email, SMS, or the Assembl dashboard. Nobody needs to learn a new system. Nobody needs to remember to run a report. It just happens.",
    ],
  },
];

const HowItWorksPage = () => (
  <div className="min-h-screen" style={{ background: C.bg, color: C.taupeDeep }}>
    <SEO
      title="How it works — From signup to running in one week | Assembl"
      description="Pick your kete. Connect Xero, Deputy and Google in one click each. We map your workflows. Agents go live. Most NZ businesses are fully operational within five business days."
      path="/how-it-works"
    />
    <BrandNav />

    {/* ═══ HEADER ═══ */}
    <section className="pt-32 pb-12 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <p
          className="text-[10px] tracking-[5px] uppercase mb-6 font-mono font-bold"
          style={{ color: C.taupe }}
        >
          — How it works —
        </p>
        <h1
          className="font-display mb-6"
          style={{
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            lineHeight: 1.1,
            color: C.taupe,
            letterSpacing: "-0.01em",
          }}
        >
          From signup to running. <em style={{ fontStyle: "italic", color: C.goldDeep }}>One week.</em>
        </h1>
        <p
          className="font-body text-[17px] leading-[1.7] max-w-2xl mx-auto"
          style={{ color: C.taupeDeep }}
        >
          You keep using the tools your team already knows. Assembl works behind them.
        </p>
      </div>
    </section>

    {/* ═══ SHORT VERSION ═══ */}
    <section className="px-6 pb-16">
      <div
        className="max-w-3xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl p-10"
        style={{
          border: `1px solid ${C.sand}50`,
          boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
        }}
      >
        <h2
          className="font-display mb-5"
          style={{
            fontWeight: 400,
            fontSize: "30px",
            color: C.taupe,
            lineHeight: 1.2,
          }}
        >
          Four steps. <em style={{ fontStyle: "italic", color: C.goldDeep }}>No migration.</em>
        </h2>
        <div className="space-y-4 font-body text-[15px] leading-[1.75]" style={{ color: C.taupeDeep }}>
          <p>
            You pick your kete. We connect to your tools. The agents start working. Your team
            barely notices — except the paperwork stops piling up.
          </p>
          <p>
            Most customers are fully operational within{" "}
            <strong style={{ color: C.taupe }}>five business days</strong>. No software to install
            on anyone's computer. No training days. No "change management workshops." Your staff
            keep using Xero, Deputy, and Google exactly the way they do now.
          </p>
        </div>
      </div>
    </section>

    {/* ═══ STEPS — VERTICAL TIMELINE ═══ */}
    <section className="px-6 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="relative rounded-3xl bg-white/80 backdrop-blur-xl p-8 md:p-10"
            style={{
              border: `1px solid ${C.sand}50`,
              boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:gap-6">
              {/* Step number circle */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 mb-5 md:mb-0 font-mono font-bold text-[14px]"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`,
                  color: "#FFFFFF",
                  boxShadow: "0 6px 20px rgba(217,188,122,0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                {step.n}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="font-mono text-[10px] tracking-[2.5px] uppercase mb-3"
                  style={{ color: C.taupe, fontWeight: 700 }}
                >
                  Step {step.n} — {step.label}
                </p>
                <h3
                  className="font-display mb-5"
                  style={{
                    fontWeight: 400,
                    fontSize: "26px",
                    color: C.taupe,
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>
                <div
                  className="space-y-4 font-body text-[15px] leading-[1.75]"
                  style={{ color: C.taupeDeep }}
                >
                  {step.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ═══ AFTER GO-LIVE ═══ */}
    <section className="px-6 pb-16">
      <div
        className="max-w-3xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl p-10"
        style={{
          border: `1px solid ${C.sand}50`,
          boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
        }}
      >
        <p
          className="font-mono text-[10px] tracking-[3px] uppercase mb-4 font-bold"
          style={{ color: C.taupe }}
        >
          — After go-live —
        </p>
        <h2
          className="font-display mb-6"
          style={{
            fontWeight: 400,
            fontSize: "30px",
            color: C.taupe,
            lineHeight: 1.2,
          }}
        >
          It gets better the <em style={{ fontStyle: "italic", color: C.goldDeep }}>longer it runs</em>.
        </h2>
        <div className="space-y-4 font-body text-[15px] leading-[1.75]" style={{ color: C.taupeDeep }}>
          <p>
            The agents learn your patterns. After a few weeks, Assembl knows your peak roster
            periods, your compliance calendar, and the reports your accountant always asks for at
            month-end. Suggestions get sharper. Gaps get caught earlier.
          </p>
          <p>
            On Enterprise plans, you get a named success manager who checks in quarterly. They
            review what the agents are handling, flag anything that's changed in NZ legislation,
            and tune the configuration if your business has shifted.
          </p>
          <p>
            You're never locked in. Month to month, cancel anytime. If you leave, we export your
            data and every evidence pack the agents ever generated.
          </p>
        </div>
      </div>
    </section>

    {/* ═══ TEAM EXPERIENCE ═══ */}
    <section className="px-6 pb-24">
      <div
        className="max-w-3xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl p-10"
        style={{
          border: `1px solid ${C.sand}50`,
          boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
        }}
      >
        <p
          className="font-mono text-[10px] tracking-[3px] uppercase mb-4 font-bold"
          style={{ color: C.taupe }}
        >
          — What your team experiences —
        </p>
        <h2
          className="font-display mb-6"
          style={{
            fontWeight: 400,
            fontSize: "30px",
            color: C.taupe,
            lineHeight: 1.2,
          }}
        >
          Day-to-day, almost <em style={{ fontStyle: "italic", color: C.goldDeep }}>nothing changes</em>.
        </h2>
        <div className="space-y-4 font-body text-[15px] leading-[1.75]" style={{ color: C.taupeDeep }}>
          <p>
            Your kitchen staff still clock in on Deputy. Your office manager still does payroll in
            Xero. Your site foreman still files photos in Google Drive.
          </p>
          <p>
            The difference is what happens between those actions. Compliance checks that used to
            wait for someone to remember them now run automatically. Roster conflicts that used to
            surface at 5am now get flagged the night before. The monthly reporting that used to eat
            a full day now arrives as a finished document.
          </p>
          <p>
            Assembl doesn't replace anyone on your team. It handles the work that was falling
            between the cracks — or landing on someone's desk at 9pm.
          </p>
        </div>
      </div>
    </section>

    {/* ═══ CTA ═══ */}
    <section className="px-6 pb-32">
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="font-display mb-6"
          style={{
            fontWeight: 300,
            fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
            color: C.taupe,
            lineHeight: 1.15,
          }}
        >
          Ready to see what it costs?
        </h2>
        <p
          className="font-body text-[15px] leading-[1.7] mb-8"
          style={{ color: C.taupeDeep }}
        >
          Three plans. NZD, ex GST. Month to month, no lock-in.
        </p>
        <Link
          to="/pricing"
          className="inline-block px-8 py-4 rounded-xl font-body font-medium text-[15px] tracking-[0.5px] transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`,
            color: "#FFFFFF",
            boxShadow: "0 6px 20px rgba(217,188,122,0.35)",
          }}
        >
          See what it costs
        </Link>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default HowItWorksPage;
