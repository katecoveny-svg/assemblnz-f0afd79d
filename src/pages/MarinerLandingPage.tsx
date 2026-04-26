import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Anchor,
  ShieldCheck,
  FileCheck,
  Compass,
  CloudSun,
  ClipboardCheck,
  Waves,
  Users,
  MapPin,
} from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

/* ─── Mariner palette — Pearl base + sea-glass accent ─── */
const PEARL = {
  bg: "#FAF6EF",
  ink: "#0F2A26",
  pounamu: "#1F4D47",
  muted: "#7A8B82",
  opal: "#E8EEEC",
};
const ACCENT = "#7BA8C9"; // moonstone — calm maritime tone
const ACCENT_SOFT = "#C7D9E8";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const CAPABILITIES = [
  {
    icon: FileCheck,
    title: "Certification tracking",
    desc: "MNZ certificates of survey, STCW, MOSS / SeaCert, crew qualifications — every expiry logged, every reminder timed.",
  },
  {
    icon: ClipboardCheck,
    title: "Trip-plan workflows",
    desc: "Pre-departure checks, passenger manifest, weather check, fuel & range, masters' sign-off — drafted and ready for human approval.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & audit pack",
    desc: "Every operation ends in an evidence pack — signed, timestamped, with the source citation for every regulatory check.",
  },
  {
    icon: CloudSun,
    title: "Live conditions",
    desc: "MetService swell, wind, and tide pulled at trip-plan time — pinned into the pack so the conditions on the day are part of the record.",
  },
  {
    icon: Compass,
    title: "Route & harbour ops",
    desc: "Departure, waypoints, arrival ETAs, and harbour call-ins drafted from the trip-plan — human-approved before they go anywhere.",
  },
  {
    icon: Users,
    title: "Crew & passenger comms",
    desc: "SMS to crew and to next-of-kin contacts on departure and safe arrival — through the unified governed channel, with audit trail.",
  },
];

const FLOW = [
  { step: "Plan", detail: "Skipper drafts the trip in plain English. Mariner builds the formal trip-plan, weather check, and crew/passenger list." },
  { step: "Approve", detail: "Master reviews and signs. Nothing leaves without explicit human approval." },
  { step: "Operate", detail: "Departure call-in, position checks, and arrival confirmation — logged automatically." },
  { step: "Pack", detail: "An evidence pack is generated for the operation: trip-plan, conditions, sign-off, comms log, and certificates referenced. PDF on request." },
];

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
    style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${PEARL.opal}`,
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      letterSpacing: "0.04em",
      color: PEARL.pounamu,
      fontWeight: 500,
    }}
  >
    {children}
  </span>
);

export default function MarinerLandingPage() {
  return (
    <>
      <SEO
        title="Mariner — Maritime AI for Aotearoa | Assembl"
        description="Mariner is Assembl's maritime compliance and operational assistant — built for NZ vessel operators. Certification tracking, trip-plan workflows, governed AI with audit trail."
        path="/mariner"
      />

      <div style={{ background: PEARL.bg, minHeight: "100vh" }}>
        <BrandNav />

        {/* ─── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ minHeight: "78vh" }}>
          {/* Atmospheric wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                `radial-gradient(ellipse 70% 60% at 80% 30%, ${ACCENT_SOFT}55 0%, transparent 70%), ` +
                `radial-gradient(ellipse 55% 50% at 18% 78%, rgba(228,238,236,0.55) 0%, transparent 72%), ` +
                `linear-gradient(180deg, rgba(255,248,236,0.30) 0%, transparent 55%)`,
            }}
          />

          <div className="max-w-[1200px] mx-auto px-6 md:px-10 relative z-10" style={{ paddingTop: "16vh", paddingBottom: 80 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p
                className="lowercase mb-6"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.32em",
                  color: PEARL.pounamu,
                  fontWeight: 500,
                }}
              >
                mariner · operational confidence for aotearoa's maritime operators
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              transition={{ duration: 1.1, delay: 0.15 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(40px, 6.4vw, 88px)",
                lineHeight: 1.05,
                letterSpacing: "-0.018em",
                color: PEARL.ink,
                maxWidth: "16ch",
                margin: 0,
              }}
            >
              Maritime <span style={{ fontStyle: "italic", color: PEARL.pounamu }}>compliance</span>,
              quietly held.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(19px, 1.8vw, 24px)",
                color: PEARL.pounamu,
                marginTop: 24,
                maxWidth: "44ch",
              }}
            >
              Compliance, certification tracking, and trip-plan workflows built for NZ skippers, fleet managers, and harbour operators.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 17,
                lineHeight: 1.6,
                color: "rgba(15,42,38,0.72)",
                marginTop: 28,
                maxWidth: "56ch",
              }}
            >
              Governed AI. Human-in-control. Evidence at every step. Built in Aotearoa for the way New Zealand vessels actually operate.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="flex items-center gap-6 flex-wrap"
              style={{ marginTop: 40 }}
            >
              <Link
                to="/contact?offer=mariner"
                className="inline-flex items-center gap-2 transition-all hover:-translate-y-px"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#FBFAF7",
                  background: PEARL.pounamu,
                  padding: "18px 32px",
                  borderRadius: 999,
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  boxShadow: "0 10px 30px -12px rgba(31,77,71,0.35)",
                }}
              >
                Talk to us about Mariner <ArrowRight size={16} />
              </Link>
              <Link
                to="/pricing"
                className="inline-block transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: PEARL.ink,
                  borderBottom: `1px solid ${PEARL.ink}`,
                  paddingBottom: 2,
                  fontWeight: 500,
                }}
              >
                See pricing
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.0 }}
              className="flex items-center gap-3 flex-wrap"
              style={{ marginTop: 56 }}
            >
              <Pill><ShieldCheck size={12} /> NZ data residency under review for full AU/NZ migration</Pill>
              <Pill><Anchor size={12} /> Aligned to Maritime NZ rule parts</Pill>
              <Pill><FileCheck size={12} /> Evidence pack — every operation</Pill>
            </motion.div>
          </div>
        </section>

        {/* ─── Capabilities ───────────────────────────────────── */}
        <section className="relative" style={{ paddingTop: 100, paddingBottom: 100 }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
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
                what mariner does
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(32px, 4vw, 52px)",
                  lineHeight: 1.1,
                  color: PEARL.ink,
                  margin: 0,
                  maxWidth: "20ch",
                }}
              >
                Built for the way New Zealand vessels actually operate.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
              {CAPABILITIES.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i}
                    className="rounded-3xl p-7"
                    style={{
                      background: "rgba(255,255,255,0.7)",
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
                        background: ACCENT_SOFT,
                        color: PEARL.pounamu,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        fontSize: 24,
                        color: PEARL.ink,
                        margin: 0,
                        marginBottom: 10,
                      }}
                    >
                      {c.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "rgba(15,42,38,0.72)",
                        margin: 0,
                      }}
                    >
                      {c.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Flow ───────────────────────────────────────────── */}
        <section className="relative" style={{ paddingTop: 60, paddingBottom: 120 }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
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
                how it runs
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(32px, 4vw, 52px)",
                  lineHeight: 1.1,
                  color: PEARL.ink,
                  margin: 0,
                  maxWidth: "20ch",
                }}
              >
                Plan, approve, operate, pack.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {FLOW.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-3xl p-7"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${PEARL.opal}`,
                  }}
                >
                  <p
                    className="lowercase mb-3"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.28em",
                      color: ACCENT,
                      fontWeight: 600,
                    }}
                  >
                    step {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: 26,
                      color: PEARL.ink,
                      margin: 0,
                      marginBottom: 10,
                    }}
                  >
                    {s.step}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "rgba(15,42,38,0.72)",
                      margin: 0,
                    }}
                  >
                    {s.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────── */}
        <section className="relative" style={{ paddingTop: 40, paddingBottom: 140 }}>
          <div className="max-w-[820px] mx-auto px-6 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Waves size={28} style={{ color: ACCENT, margin: "0 auto 20px" }} />
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(28px, 3.6vw, 44px)",
                  lineHeight: 1.15,
                  color: PEARL.ink,
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                A 30-day pilot, on one vessel or one fleet.
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(15,42,38,0.72)",
                  margin: "0 auto 36px",
                  maxWidth: "52ch",
                }}
              >
                One painful workflow, governed and live in a month. We sit with the master, map the existing routine, and bring Mariner in alongside. Human approval on everything that matters.
              </p>
              <Link
                to="/contact?offer=mariner-pilot"
                className="inline-flex items-center gap-2 transition-all hover:-translate-y-px"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#FBFAF7",
                  background: PEARL.pounamu,
                  padding: "18px 32px",
                  borderRadius: 999,
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  boxShadow: "0 10px 30px -12px rgba(31,77,71,0.35)",
                }}
              >
                Book a Mariner pilot <ArrowRight size={16} />
              </Link>
              <p
                className="mt-6"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: PEARL.muted,
                }}
              >
                <MapPin size={11} className="inline -mt-px mr-1" />
                Auckland · Aotearoa New Zealand
              </p>
            </motion.div>
          </div>
        </section>

        <BrandFooter />
      </div>
    </>
  );
}
