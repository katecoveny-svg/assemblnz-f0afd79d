import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Eye, Lock, Users, FileText, MessageSquare,
  ExternalLink, Database, AlertTriangle, UserCheck, Bot, Heart,
} from "lucide-react";

const cardMotion = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, delay: i * 0.08 },
});

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl p-6 sm:p-8 ${className}`}
    style={{
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      backdropFilter: "blur(12px)",
    }}
  >
    {children}
  </div>
);

const Bullet = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
    {children}
  </li>
);

const SectionHeader = ({ icon: Icon, accent, title }: { icon: React.ElementType; accent: string; title: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
      <Icon size={16} style={{ color: accent }} />
    </div>
    <h2 className="font-display font-bold text-lg text-foreground">{title}</h2>
  </div>
);

const FullPolicyLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-primary transition-colors duration-200 hover:text-primary/80"
  >
    {label}
    <ExternalLink size={11} />
  </Link>
);

const GOLD = "hsl(42 63% 55%)";
const POUNAMU = "hsl(164 36% 36%)";
const TANGAROA = "hsl(210 52% 23%)";

const DataPrivacyLegal = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEO
      title="Data Privacy & Responsible AI | Assembl"
      description="Assembl treats your data as taonga. How we handle your data under the Privacy Act 2020, follow MBIE Responsible AI Guidance, and protect your rights as a New Zealand user."
    />
    <BrandNav />

    {/* Hero */}
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(var(--primary) / 0.06), transparent 70%)" }}
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
            color: GOLD,
          }}
        >
          <Shield size={12} />
          NZ Privacy Act 2020 · MBIE Responsible AI
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl leading-tight mb-6 text-foreground">
          Your data is{" "}
          <span
            className="italic"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${POUNAMU})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            taonga
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Taonga means treasure in Te Reo Māori. Assembl treats every piece of your data with the
          care and respect that taonga deserves — grounded in NZ law, tikanga Māori, and genuine
          transparency about how we collect, use, and protect it.
        </p>
      </motion.div>
    </section>

    {/* Taonga highlight banner */}
    <section className="px-6 pb-8">
      <div className="max-w-3xl mx-auto">
        <motion.div {...cardMotion(0)}>
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(164 36% 36% / 0.06))`,
              border: `1px solid hsl(var(--primary) / 0.2)`,
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}20` }}>
                <Heart size={18} style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground mb-2">Kaitiakitanga — guardianship of your data</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In Te Ao Māori, kaitiakitanga is the responsibility to protect and nurture something precious.
                  Assembl applies this principle to every interaction. Your conversations, documents, and business
                  information are held with the same duty of care as a kaitiaki guarding a taonga for future generations.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Your data is never sold", "Not used for AI training", "Encrypted in transit & at rest", "Deletable on request"].map(item => (
                    <span key={item} className="text-[10px] font-mono px-3 py-1.5 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: GOLD }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Sections */}
    <section className="px-6 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 1 — Privacy Policy Summary */}
        <motion.div {...cardMotion(1)}>
          <Glass>
            <SectionHeader icon={Lock} accent={GOLD} title="Privacy policy summary" />
            <h3 className="text-xs font-display font-bold uppercase tracking-widest text-foreground/70 mb-3">What we collect</h3>
            <ul className="space-y-2.5 mb-5">
              <Bullet color={GOLD}><strong className="text-foreground/90">Account info</strong> — name and email address when you sign up.</Bullet>
              <Bullet color={GOLD}><strong className="text-foreground/90">Usage data</strong> — which agents you use, message counts, and session metadata to keep things running.</Bullet>
              <Bullet color={GOLD}><strong className="text-foreground/90">Conversation content</strong> — the messages you send to agents, stored to provide continuity within your session.</Bullet>
              <Bullet color={GOLD}><strong className="text-foreground/90">Uploaded files</strong> — documents or images processed by agents for the current session only.</Bullet>
            </ul>

            <h3 className="text-xs font-display font-bold uppercase tracking-widest text-foreground/70 mb-3">How we use it</h3>
            <ul className="space-y-2.5 mb-5">
              <Bullet color={GOLD}>Provide and improve our business intelligence services.</Bullet>
              <Bullet color={GOLD}>Communicate product updates and relevant guidance.</Bullet>
              <Bullet color={GOLD}>Monitor system health, prevent abuse, and meet legal obligations under NZ law.</Bullet>
            </ul>

            <div className="rounded-xl p-4 mb-4" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Database size={13} style={{ color: GOLD }} />
                <span className="text-xs font-display font-bold text-foreground/80">AI model data handling</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conversation data sent to AI model providers for processing is{" "}
                <strong className="text-foreground/90">not used for model training</strong>.
                We do not sell or share your data with third parties for marketing purposes. Your taonga stays yours.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Contact:{" "}
              <a href="mailto:assembl@assembl.co.nz" className="underline text-primary hover:text-primary/80">assembl@assembl.co.nz</a>
            </p>
            <FullPolicyLink to="/privacy" label="Read full privacy policy" />
          </Glass>
        </motion.div>

        {/* 2 — Terms of Service Summary */}
        <motion.div {...cardMotion(2)}>
          <Glass>
            <SectionHeader icon={FileText} accent={POUNAMU} title="Terms of service summary" />
            <ul className="space-y-2.5 mb-5">
              <Bullet color={POUNAMU}><strong className="text-foreground/90">Not professional advice.</strong> AI-generated guidance is informational only — it does not replace qualified legal, financial, medical, or other professional advice.</Bullet>
              <Bullet color={POUNAMU}><strong className="text-foreground/90">No guarantee of accuracy.</strong> AI can make errors. Outputs should be verified independently before reliance.</Bullet>
              <Bullet color={POUNAMU}><strong className="text-foreground/90">User responsibility.</strong> You are responsible for decisions and actions taken based on agent output.</Bullet>
              <Bullet color={POUNAMU}><strong className="text-foreground/90">Limitation of liability.</strong> Assembl's liability is limited to the fees paid for the service in the preceding 12 months, to the fullest extent permitted by NZ law.</Bullet>
              <Bullet color={POUNAMU}><strong className="text-foreground/90">Consumer Guarantees Act 1993.</strong> Nothing in these terms limits your rights under the CGA where it applies to services acquired for personal or domestic use.</Bullet>
            </ul>
            <FullPolicyLink to="/terms" label="Read full terms of use" />
          </Glass>
        </motion.div>

        {/* 3 — Responsible AI & Transparency */}
        <motion.div {...cardMotion(3)}>
          <Glass>
            <SectionHeader icon={Bot} accent={TANGAROA} title="Responsible AI & transparency" />
            <ul className="space-y-2.5">
              <Bullet color={TANGAROA}><strong className="text-foreground/90">AI identity.</strong> Every Assembl agent clearly identifies as AI — they will never pretend to be human.</Bullet>
              <Bullet color={TANGAROA}><strong className="text-foreground/90">MBIE alignment.</strong> We follow the NZ Government's Responsible AI Guidance for Businesses (MBIE, July 2025) across all agents.</Bullet>
              <Bullet color={TANGAROA}><strong className="text-foreground/90">Hallucination prevention.</strong> Agents are instructed never to fabricate legislation, statistics, case law, or compliance deadlines. When uncertain, they say so.</Bullet>
              <Bullet color={TANGAROA}><strong className="text-foreground/90">Professional advice disclaimers.</strong> Every agent interaction includes a disclaimer that output is AI-generated and should be verified by a qualified professional.</Bullet>
              <Bullet color={TANGAROA}><strong className="text-foreground/90">Māori data sovereignty.</strong> We respect Te Mana Raraunga principles, tikanga Māori, and the distinction between noa and tapu data. Culturally sensitive matters are flagged for human expertise.</Bullet>
              <Bullet color={TANGAROA}><strong className="text-foreground/90">Human escalation.</strong> Users can always request human assistance. Contact assembl@assembl.co.nz any time.</Bullet>
            </ul>
          </Glass>
        </motion.div>

        {/* 4 — Your Rights */}
        <motion.div {...cardMotion(4)}>
          <Glass>
            <SectionHeader icon={UserCheck} accent={GOLD} title="Your rights" />
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Under the Privacy Act 2020, you have the right to:
            </p>
            <ul className="space-y-2.5 mb-5">
              <Bullet color={GOLD}><strong className="text-foreground/90">Access</strong> the personal information we hold about you (IPP 6).</Bullet>
              <Bullet color={GOLD}><strong className="text-foreground/90">Correct</strong> any information that is inaccurate, incomplete, or misleading (IPP 7).</Bullet>
              <Bullet color={GOLD}><strong className="text-foreground/90">Request deletion</strong> of your personal data, subject to any legal retention requirements.</Bullet>
              <Bullet color={GOLD}>
                <strong className="text-foreground/90">Complain</strong> to the NZ Privacy Commissioner if you believe your privacy has been breached —{" "}
                <a href="https://privacy.org.nz" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">privacy.org.nz</a>
              </Bullet>
            </ul>

            <div className="rounded-xl p-4" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To exercise any of these rights, email{" "}
                <a href="mailto:assembl@assembl.co.nz" className="underline text-primary hover:text-primary/80">assembl@assembl.co.nz</a>{" "}
                with the subject line <strong className="text-foreground/90">"Privacy Request"</strong>.
                We will respond within 20 working days as required by the Privacy Act 2020.
              </p>
            </div>
          </Glass>
        </motion.div>

        {/* 5 — Applicable legislation */}
        <motion.div {...cardMotion(5)}>
          <Glass>
            <SectionHeader icon={Eye} accent={POUNAMU} title="Applicable NZ legislation" />
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
              ].map(act => (
                <span
                  key={act}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-full text-muted-foreground/70"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}
                >
                  {act}
                </span>
              ))}
            </div>
          </Glass>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="text-center pt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground mb-3">Questions about our data practices or AI governance?</p>
          <a
            href="mailto:assembl@assembl.co.nz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
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
