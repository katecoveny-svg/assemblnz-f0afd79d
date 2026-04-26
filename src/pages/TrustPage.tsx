import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  MapPin,
  Users,
  FileCheck,
  AlertTriangle,
  Mail,
  Database,
} from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

/* ─── Pearl tokens (single source of truth — match BrandFooter) ─── */
const PEARL = {
  bg: "#FAF6EF",
  ink: "#0F2A26",
  pounamu: "#1F4D47",
  muted: "#7A8B82",
  opal: "#E8EEEC",
  bodyInk: "rgba(15,42,38,0.72)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/* ─── Subprocessor table (canonical) ─── */
const SUBPROCESSORS: { name: string; purpose: string; region: string }[] = [
  { name: "Supabase (PostgreSQL, Auth, Storage, Edge Functions)", purpose: "Application database, authentication, file storage, server functions", region: "AWS ap-northeast-2 (under review for AU/NZ migration)" },
  { name: "Vercel", purpose: "Frontend hosting and CDN", region: "Global edge — NZ traffic served from Sydney (syd1)" },
  { name: "Cloudflare", purpose: "DNS, edge security", region: "Global" },
  { name: "Anthropic", purpose: "LLM (Claude) inference for selected agents", region: "US" },
  { name: "OpenAI", purpose: "LLM (GPT) inference for selected agents", region: "US" },
  { name: "Google Cloud", purpose: "LLM (Gemini) inference for selected agents", region: "US / global" },
  { name: "TNZ Group", purpose: "SMS gateway for outbound and inbound messaging", region: "NZ" },
  { name: "Brevo", purpose: "Transactional email", region: "EU" },
  { name: "Twilio", purpose: "WhatsApp Business API", region: "US" },
  { name: "Stripe", purpose: "Payments processing", region: "US / global" },
  { name: "ElevenLabs", purpose: "Voice synthesis (optional)", region: "US" },
];

/* ─── Section primitives ─── */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="lowercase mb-3"
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 11,
      letterSpacing: "0.32em",
      color: PEARL.pounamu,
      fontWeight: 500,
    }}
  >
    {children}
  </p>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 300,
      fontSize: "clamp(28px, 3.4vw, 42px)",
      lineHeight: 1.15,
      color: PEARL.ink,
      margin: 0,
      marginBottom: 24,
      letterSpacing: "-0.01em",
    }}
  >
    {children}
  </h2>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 15.5,
      lineHeight: 1.7,
      color: PEARL.bodyInk,
      margin: "0 0 14px 0",
    }}
  >
    {children}
  </p>
);

const Card = ({ children, icon: Icon }: { children: React.ReactNode; icon: React.ComponentType<{ size?: number | string }> }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    variants={fadeUp}
    className="rounded-3xl p-8 md:p-10 mb-6"
    style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${PEARL.opal}`,
      boxShadow: "0 8px 30px rgba(111,97,88,0.06)",
    }}
  >
    <div
      className="inline-flex items-center justify-center mb-5"
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: PEARL.opal,
        color: PEARL.pounamu,
      }}
    >
      <Icon size={20} />
    </div>
    {children}
  </motion.section>
);

export default function TrustPage() {
  return (
    <>
      <SEO
        title="Trust — Privacy, security and human-in-control | Assembl"
        description="Assembl's trust posture: NZ Privacy Act 2020 (incl. IPP 3A), human-in-the-loop on every consequential action, NZ data residency under review, full subprocessor list, and incident response."
        path="/trust"
      />

      <div style={{ background: PEARL.bg, minHeight: "100vh" }}>
        <BrandNav />

        {/* ─── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ minHeight: "60vh" }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 78% 30%, rgba(255,231,196,0.45) 0%, transparent 70%), " +
                "radial-gradient(ellipse 55% 50% at 18% 80%, rgba(228,238,236,0.55) 0%, transparent 72%)",
            }}
          />
          <div className="max-w-[920px] mx-auto px-6 md:px-10 relative z-10" style={{ paddingTop: "14vh", paddingBottom: 60 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Eyebrow>assembl · trust</Eyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              transition={{ duration: 1.1, delay: 0.15 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(40px, 6.4vw, 76px)",
                lineHeight: 1.05,
                letterSpacing: "-0.018em",
                color: PEARL.ink,
                margin: 0,
                maxWidth: "20ch",
              }}
            >
              Trust, in <span style={{ fontStyle: "italic", color: PEARL.pounamu }}>plain language</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(18px, 1.6vw, 22px)",
                color: PEARL.pounamu,
                marginTop: 22,
                maxWidth: "60ch",
              }}
            >
              What Assembl does with your data, who reviews what, where your information lives, and how to reach a human when something matters.
            </motion.p>
          </div>
        </section>

        {/* ─── Cards ──────────────────────────────────────────── */}
        <div className="max-w-[920px] mx-auto px-6 md:px-10 pb-20">
          {/* Privacy */}
          <Card icon={ShieldCheck}>
            <SectionTitle>Privacy and your data</SectionTitle>
            <ul className="space-y-3 mt-2">
              {[
                "We comply with the Privacy Act 2020, including the new IPP 3A (effective 1 May 2026).",
                "We complete a Privacy Impact Assessment for every new workflow before it goes live.",
                "We never train models on your customer data.",
                "You retain ownership of all data you enter into Assembl. You can export it at any time.",
                "Where personal information is sent overseas (e.g. to model providers), we apply Principle 12 of the Privacy Act and disclose the relevant subprocessors below.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, lineHeight: 1.65, color: PEARL.bodyInk }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: PEARL.pounamu }} />
                  {line}
                </li>
              ))}
            </ul>
          </Card>

          {/* Human in loop */}
          <Card icon={Users}>
            <SectionTitle>Human-in-the-loop, by default</SectionTitle>
            <Body>
              Every agent decision that affects a customer, a transaction, a person's record, or an external send (SMS, email, document, payment) requires explicit human approval before the action runs.
            </Body>
            <Body>
              Every approval is logged with a timestamp, the approving user, and the underlying source citations.
            </Body>
            <Body>
              An evidence pack is generated for every workflow output. You can export it as PDF.
            </Body>
          </Card>

          {/* NZ residency */}
          <Card icon={MapPin}>
            <SectionTitle>NZ data residency</SectionTitle>
            <ul className="space-y-3 mt-2">
              {[
                "Customer data is hosted on infrastructure with NZ or AU regional pinning where the cloud provider supports it.",
                "Database backups are retained in-region.",
                "The full hosting and infrastructure footprint is published in the subprocessor list below.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, lineHeight: 1.65, color: PEARL.bodyInk }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: PEARL.pounamu }} />
                  {line}
                </li>
              ))}
            </ul>
          </Card>

          {/* Subprocessors */}
          <Card icon={Database}>
            <SectionTitle>Subprocessors</SectionTitle>
            <Body>
              Updated when our processors change. The current set, by purpose and region:
            </Body>
            <div className="mt-4 overflow-x-auto rounded-2xl" style={{ border: `1px solid ${PEARL.opal}` }}>
              <table className="w-full text-left" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: PEARL.bodyInk }}>
                <thead>
                  <tr style={{ background: "rgba(232,238,236,0.55)" }}>
                    <th className="px-4 py-3 font-medium" style={{ color: PEARL.ink }}>Subprocessor</th>
                    <th className="px-4 py-3 font-medium" style={{ color: PEARL.ink }}>Purpose</th>
                    <th className="px-4 py-3 font-medium" style={{ color: PEARL.ink }}>Region</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((s, i) => (
                    <tr key={s.name} style={{ borderTop: i === 0 ? "none" : `1px solid ${PEARL.opal}` }}>
                      <td className="px-4 py-3" style={{ color: PEARL.ink }}>{s.name}</td>
                      <td className="px-4 py-3">{s.purpose}</td>
                      <td className="px-4 py-3">{s.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Security */}
          <Card icon={Lock}>
            <SectionTitle>Security</SectionTitle>
            <ul className="space-y-3 mt-2">
              {[
                "All connections are TLS 1.2+. HSTS is enabled.",
                "Secrets are stored in Supabase Edge Function secret store and Vercel encrypted environment variables — never in source code.",
                "We follow the principles of the NZ Information Security Manual (NZISM) and CERT NZ secure-by-default guidance.",
                "We are working toward an ISO/IEC 42001-aligned AI management system in 2026.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, lineHeight: 1.65, color: PEARL.bodyInk }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: PEARL.pounamu }} />
                  {line}
                </li>
              ))}
            </ul>
          </Card>

          {/* Incident response */}
          <Card icon={AlertTriangle}>
            <SectionTitle>Incident response</SectionTitle>
            <ul className="space-y-3 mt-2">
              {[
                "For privacy incidents, we follow notifiable breach rules under the Privacy Act 2020.",
                "For security incidents, we engage CERT NZ and notify affected customers as required by law and contract.",
                "All incidents are post-mortemed and the learnings are written into our risk register.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, lineHeight: 1.65, color: PEARL.bodyInk }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: PEARL.pounamu }} />
                  {line}
                </li>
              ))}
            </ul>
          </Card>

          {/* Contact */}
          <Card icon={Mail}>
            <SectionTitle>Contact</SectionTitle>
            <ul className="space-y-3 mt-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, lineHeight: 1.65, color: PEARL.bodyInk }}>
              <li>Privacy questions → <a href="mailto:privacy@assembl.co.nz" style={{ color: PEARL.pounamu, borderBottom: `1px solid ${PEARL.pounamu}` }}>privacy@assembl.co.nz</a></li>
              <li>Security questions → <a href="mailto:security@assembl.co.nz" style={{ color: PEARL.pounamu, borderBottom: `1px solid ${PEARL.pounamu}` }}>security@assembl.co.nz</a></li>
              <li>General trust queries → <a href="mailto:kia.ora@assembl.co.nz" style={{ color: PEARL.pounamu, borderBottom: `1px solid ${PEARL.pounamu}` }}>kia.ora@assembl.co.nz</a></li>
              <li>Postal: Assembl, 6A Geraldine Place, Auckland 1071, New Zealand</li>
            </ul>
          </Card>

          {/* Footer note */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-3xl p-7 mt-2"
            style={{
              background: "rgba(232,238,236,0.45)",
              border: `1px dashed ${PEARL.opal}`,
            }}
          >
            <div className="flex items-start gap-4">
              <FileCheck size={18} style={{ color: PEARL.pounamu, marginTop: 3 }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.65, color: PEARL.bodyInk, margin: 0 }}>
                This page is the public-facing summary of our trust posture. The full Data Processing Agreement (DPA) and Privacy Impact Assessment templates are available on request for procurement — email{" "}
                <a href="mailto:privacy@assembl.co.nz" style={{ color: PEARL.pounamu, borderBottom: `1px solid ${PEARL.pounamu}` }}>privacy@assembl.co.nz</a>.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="inline-block transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: PEARL.ink,
                borderBottom: `1px solid ${PEARL.ink}`,
                paddingBottom: 2,
                fontWeight: 500,
              }}
            >
              Talk to us about procurement →
            </Link>
          </div>
        </div>

        <BrandFooter />
      </div>
    </>
  );
}
