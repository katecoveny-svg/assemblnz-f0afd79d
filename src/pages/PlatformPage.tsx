import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

const C = {
  bg: "#FAFBFC",
  teal: "#4AA5A8",
  text: "#3D4250",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
};

const FEATURES = [
  "Full Iho governed router — build any workflow on top",
  "AROHA — HR & Employment Hero",
  "SIGNAL — Security (NZISM aligned)",
  "SENTINEL — Monitoring & uptime",
  "Privacy Act 2020 + AAAIP alignment",
  "SMS, WhatsApp & dashboard access",
  "Up to 5 seats · 3 training hours / year",
  "Email support, 1 business day · 99.0% uptime",
];

const PlatformPage = () => (
  <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
    <SEO
      title="Operator-as-platform — Assembl for Business, Pro Services, Tech"
      description="You don't fit a pre-built industry kete. So buy the platform. $1,490/mo + $590 setup. Build your own workflows on top of Iho — our governed router."
      path="/platform"
    />
    <BrandNav />

    {/* Hero */}
    <section className="pt-32 pb-16 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-[10px] tracking-[5px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.teal, fontWeight: 700 }}>
          — Operator-as-platform —
        </p>
        <h1 className="text-3xl sm:text-[44px] mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, lineHeight: 1.15, color: C.text }}>
          You don't fit a pre-built industry kete.<br />
          <span style={{ color: C.teal }}>So buy the platform.</span>
        </h1>
        <p className="text-[16px] leading-[1.8] max-w-xl mx-auto mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
          For Business, Professional Services, and Technology customers. Same price as Operator. No industry kete bundle. Full platform plus the cross-cutting agents. You build your own workflows on top of Iho — our governed router.
        </p>
        <p className="text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}>
          $1,490/mo + $590 one-off setup · NZD ex GST
        </p>
      </div>
    </section>

    {/* What you get */}
    <section className="px-6 pb-20">
      <div className="max-w-2xl mx-auto rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}>
        <h2 className="text-[18px] mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "3px", textTransform: "uppercase", color: C.text }}>
          What's included
        </h2>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${C.teal}15`, border: `1px solid ${C.teal}25` }}>
                <Check size={11} style={{ color: C.teal }} />
              </div>
              <span className="text-[14px] leading-[1.7]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Honest framing */}
    <section className="px-6 pb-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[14px] leading-[1.8] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
          We don't have a pre-built kete for accounting firms, dev shops, B2B SaaS, consultancies, or law practices yet. If your operations are bespoke enough that an industry pack would feel like a bad fit — this is the SKU. You get the same governed pipeline (Kahu → Iho → Tā → Mahara → Mana) and you wire it to <em>your</em> workflows.
        </p>
        <p className="text-[13px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textTertiary }}>
          If conversion is strong here, we'll build a dedicated kete for the most-requested vertical.
        </p>
      </div>
    </section>

    {/* CTA */}
    <section className="px-6 py-20 text-center">
      <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-[12px] tracking-[2px] uppercase font-semibold transition-all duration-300 hover:scale-[1.03]"
        style={{ background: `linear-gradient(135deg, ${C.teal}, #6CBFC1)`, color: "#FFFFFF", boxShadow: `0 4px 30px rgba(74,165,168,0.35)`, fontFamily: "'Lato', sans-serif" }}>
          Talk to us about Operator-as-platform <ArrowRight size={13} />
      </Link>
      <p className="mt-6 text-[12px]" style={{ color: C.textTertiary }}>
        Or email <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: C.textSecondary }}>assembl@assembl.co.nz</a>
      </p>
    </section>

    <BrandFooter />
  </div>
);

export default PlatformPage;
