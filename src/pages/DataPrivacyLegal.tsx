import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Eye, Lock, Users, FileText, MessageSquare,
  ExternalLink, Database, AlertTriangle, UserCheck, Bot,
} from "lucide-react";

/* ── animation helper ── */
const cardMotion = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, delay: i * 0.08 },
});

/* ── reusable glass card ── */
const Glass = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl p-6 sm:p-8 ${className}`}
    style={{
      background: "hsl(var(--surface-1) / 0.03)",
      border: "1px solid hsl(var(--border) / 0.5)",
      backdropFilter: "blur(12px)",
    }}
  >
    {children}
  </div>
);

const Bullet = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => (
  <li className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
    <span
      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: color }}
    />
    {children}
  </li>
);

const SectionHeader = ({
  icon: Icon,
  accent,
  title,
}: {
  icon: React.ElementType;
  accent: string;
  title: string;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: `${accent}15` }}
    >
      <Icon size={16} style={{ color: accent }} />
    </div>
    <h2 className="font-syne font-bold text-lg text-foreground">{title}</h2>
  </div>
);

const FullPolicyLink = ({
  to,
  label,
}: {
  to: string;
  label: string;
}) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium transition-colors duration-200"
    style={{ color: "hsl(var(--cyan))" }}
  >
    {label}
    <ExternalLink size={11} />
  </Link>
);

/* ── page ── */
const GREEN = "hsl(var(--primary))";
const PINK = "hsl(var(--pink))";
const CYAN = "hsl(var(--cyan))";

const DataPrivacyLegal = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEO
      title="Data Privacy & Responsible AI | Assembl"
      description="How Assembl handles your data, complies with the Privacy Act 2020, follows MBIE Responsible AI Guidance, and protects your rights as a New Zealand user."
    />
    <BrandNav />

    {/* ── Hero ── */}
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(var(--primary) / 0.06), transparent 70%)",
        }}
      />
      <motion.div
        className="max-w-3xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase mb-8"
          style={{
            background: "hsl(var(--primary) / 0.08)",
            border: "1px solid hsl(var(--primary) / 0.2)",
            color: GREEN,
          }}
        >
          <Shield size={12} />
          NZ Privacy Act 2020 · MBIE Responsible AI
        </div>

        <h1
          className="font-syne font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-tight mb-6"
          style={{
            background:
              "linear-gradient(135deg, #00FF88, #00E5FF, #A855F7, #1E3A5F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Data Privacy &<br />Responsible AI
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Built in Aotearoa for NZ businesses. Here's exactly how we collect,
          use, and protect your data — and the standards our AI agents follow.
        </p>
      </motion.div>
    </section>

    {/* ── Sections ── */}
    <section className="px-6 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 1 ─ Privacy Policy Summary */}
        <motion.div {...cardMotion(0)}>
          <Glass>
            <SectionHeader icon={Lock} accent={GREEN} title="Privacy Policy Summary" />

            <h3 className="text-xs font-syne font-bold uppercase tracking-widest text-foreground/70 mb-3">
              What we collect
            </h3>
            <ul className="space-y-2.5 mb-5">
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Account info</strong> — name and email address when you sign up.
              </Bullet>
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Usage data</strong> — which agents you use, message counts, and session metadata to keep things running.
              </Bullet>
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Conversation content</strong> — the messages you send to agents, stored to provide continuity within your session.
              </Bullet>
            </ul>

            <h3 className="text-xs font-syne font-bold uppercase tracking-widest text-foreground/70 mb-3">
              How we use it
            </h3>
            <ul className="space-y-2.5 mb-5">
              <Bullet color={GREEN}>Provide and improve our business intelligence services.</Bullet>
              <Bullet color={GREEN}>Communicate product updates and relevant guidance.</Bullet>
              <Bullet color={GREEN}>Monitor system health, prevent abuse, and meet legal obligations.</Bullet>
            </ul>

            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: "hsl(var(--cyan) / 0.06)",
                border: "1px solid hsl(var(--cyan) / 0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database size={13} style={{ color: CYAN }} />
                <span className="text-xs font-syne font-bold text-foreground/80">
                  Anthropic API &amp; data handling
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conversation data sent to the Anthropic API for processing is{" "}
                <strong className="text-foreground/90">not used for model training</strong>.
                Anthropic's data retention and usage policies apply. We do not sell or
                share your data with third parties for marketing purposes.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Contact:{" "}
              <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: CYAN }}>
                assembl@assembl.co.nz
              </a>
            </p>
            <FullPolicyLink to="/privacy" label="Read full Privacy Policy" />
          </Glass>
        </motion.div>

        {/* 2 ─ Terms of Service Summary */}
        <motion.div {...cardMotion(1)}>
          <Glass>
            <SectionHeader icon={FileText} accent={PINK} title="Terms of Service Summary" />
            <ul className="space-y-2.5 mb-5">
              <Bullet color={PINK}>
                <strong className="text-foreground/90">Not professional advice.</strong> AI-generated
                guidance is informational only — it does not replace qualified legal, financial,
                medical, or other professional advice.
              </Bullet>
              <Bullet color={PINK}>
                <strong className="text-foreground/90">No guarantee of accuracy.</strong> AI can make
                errors. Outputs should be verified independently before reliance.
              </Bullet>
              <Bullet color={PINK}>
                <strong className="text-foreground/90">User responsibility.</strong> You are responsible
                for decisions and actions taken based on agent output.
              </Bullet>
              <Bullet color={PINK}>
                <strong className="text-foreground/90">Limitation of liability.</strong> Assembl's
                liability is limited to the fees paid for the service in the preceding 12 months,
                to the fullest extent permitted by NZ law.
              </Bullet>
              <Bullet color={PINK}>
                <strong className="text-foreground/90">Consumer Guarantees Act 1993.</strong> Nothing in
                these terms limits your rights under the CGA where it applies to services
                acquired for personal or domestic use.
              </Bullet>
            </ul>
            <FullPolicyLink to="/terms" label="Read full Terms of Use" />
          </Glass>
        </motion.div>

        {/* 3 ─ Responsible AI / Transparency */}
        <motion.div {...cardMotion(2)}>
          <Glass>
            <SectionHeader icon={Bot} accent={CYAN} title="Responsible AI & Transparency" />
            <ul className="space-y-2.5">
              <Bullet color={CYAN}>
                <strong className="text-foreground/90">AI identity.</strong> Every Assembl agent clearly identifies as AI — they will never pretend to be human.
              </Bullet>
              <Bullet color={CYAN}>
                <strong className="text-foreground/90">MBIE alignment.</strong> We follow the NZ Government's Responsible AI Guidance for Businesses (MBIE, July 2025) across all agents.
              </Bullet>
              <Bullet color={CYAN}>
                <strong className="text-foreground/90">Hallucination prevention.</strong> Agents are instructed never to fabricate legislation, statistics, case law, or compliance deadlines. When uncertain, they say so.
              </Bullet>
              <Bullet color={CYAN}>
                <strong className="text-foreground/90">Professional advice disclaimers.</strong> Every agent interaction includes a disclaimer that output is AI-generated and should be verified by a qualified professional.
              </Bullet>
              <Bullet color={CYAN}>
                <strong className="text-foreground/90">Māori data sovereignty.</strong> We respect Te Mana Raraunga principles, tikanga Māori, and the distinction between noa and tapu data. Culturally sensitive matters are flagged for human expertise.
              </Bullet>
              <Bullet color={CYAN}>
                <strong className="text-foreground/90">Human escalation.</strong> Users can always request human assistance. Contact assembl@assembl.co.nz any time.
              </Bullet>
            </ul>
          </Glass>
        </motion.div>

        {/* 4 ─ Your Rights */}
        <motion.div {...cardMotion(3)}>
          <Glass>
            <SectionHeader icon={UserCheck} accent={GREEN} title="Your Rights" />
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Under the Privacy Act 2020, you have the right to:
            </p>
            <ul className="space-y-2.5 mb-5">
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Access</strong> the personal information we hold about you.
              </Bullet>
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Correct</strong> any information that is inaccurate, incomplete, or misleading.
              </Bullet>
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Request deletion</strong> of your personal data, subject to any legal retention requirements.
              </Bullet>
              <Bullet color={GREEN}>
                <strong className="text-foreground/90">Complain</strong> to the NZ Privacy Commissioner if you believe your privacy has been breached —{" "}
                <a
                  href="https://privacy.org.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: CYAN }}
                >
                  privacy.org.nz
                </a>
              </Bullet>
            </ul>

            <div
              className="rounded-xl p-4"
              style={{
                background: "hsl(var(--primary) / 0.06)",
                border: "1px solid hsl(var(--primary) / 0.15)",
              }}
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                To exercise any of these rights, email{" "}
                <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: CYAN }}>
                  assembl@assembl.co.nz
                </a>{" "}
                with the subject line <strong className="text-foreground/90">"Privacy Request"</strong>.
                We will respond within 20 working days as required by the Privacy Act 2020.
              </p>
            </div>
          </Glass>
        </motion.div>

        {/* ── Legislation reference badges ── */}
        <motion.div {...cardMotion(4)}>
          <Glass>
            <SectionHeader icon={Eye} accent={PINK} title="Applicable NZ Legislation" />
            <div className="flex flex-wrap gap-2">
              {[
                "Privacy Act 2020",
                "Fair Trading Act 1986",
                "Consumer Guarantees Act 1993",
                "Health and Safety at Work Act 2015",
                "Human Rights Act 1993",
                "NZ Bill of Rights Act 1990",
                "Employment Relations Act 2000",
                "Incorporated Societies Act 2022",
                "Copyright Act 1994",
                "Harmful Digital Communications Act 2015",
              ].map((act) => (
                <span
                  key={act}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-full text-muted-foreground/70"
                  style={{
                    background: "hsl(var(--surface-2) / 0.4)",
                    border: "1px solid hsl(var(--border) / 0.4)",
                  }}
                >
                  {act}
                </span>
              ))}
            </div>
          </Glass>
        </motion.div>

        {/* ── Contact CTA ── */}
        <motion.div
          className="text-center pt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground mb-3">
            Questions about our data practices or AI governance?
          </p>
          <a
            href="mailto:assembl@assembl.co.nz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            <MessageSquare size={14} />
            assembl@assembl.co.nz
          </a>
        </motion.div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default DataPrivacyLegal;
