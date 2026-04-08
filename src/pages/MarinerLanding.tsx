import { useNavigate } from "react-router-dom";
import ParticleField from "@/components/ParticleField";
import { Anchor, Fish, Ship, CloudSun, Shield, Wrench, Radio, BookOpen, Check, ArrowRight, MapPin, Navigation, AlertTriangle } from "lucide-react";

const NEON = "#26C6DA";

const capabilities = [
  {
    icon: <CloudSun size={28} style={{ color: NEON }} />,
    title: "Live Marine Weather",
    desc: "Real-time MetService forecast interpretation. Know if it's safe to go out — wind, swell, tides, and bar conditions explained in plain English.",
  },
  {
    icon: <Navigation size={28} style={{ color: NEON }} />,
    title: "Trip Planning with GPS",
    desc: "Plan boating trips with GPS coordinates for every waypoint, anchorage, and fishing spot. Tidal timing, fuel estimates, and return planning.",
  },
  {
    icon: <AlertTriangle size={28} style={{ color: NEON }} />,
    title: "Rocks & Hazard Warnings",
    desc: "Know every reef, rock, and danger zone in NZ waters. Bar crossing warnings, chart references, and safe passage guidance.",
  },
  {
    icon: <MapPin size={28} style={{ color: NEON }} />,
    title: "GPS Coordinates & Maps",
    desc: "Get exact GPS coordinates for boat ramps, marinas, anchorages, and fishing spots with Google Maps links.",
  },
  {
    icon: <Fish size={28} style={{ color: NEON }} />,
    title: "Fishing Rules by Region",
    desc: "Bag limits, size limits, closed seasons, shellfish biotoxin alerts, and marine reserves — specific to your region.",
  },
  {
    icon: <Ship size={28} style={{ color: NEON }} />,
    title: "Commercial Maritime",
    desc: "QMS quotas, MOSS compliance, seafood export, vessel registration, and seafarer certification.",
  },
  {
    icon: <BookOpen size={28} style={{ color: NEON }} />,
    title: "Boating Education",
    desc: "Coastguard Day Skipper, Boatmaster courses, VHF Radio Certification guidance.",
  },
  {
    icon: <Wrench size={28} style={{ color: NEON }} />,
    title: "Boat Maintenance",
    desc: "Seasonal checklists, anti-foul schedules, engine service intervals, trailer WoF requirements.",
  },
  {
    icon: <Radio size={28} style={{ color: NEON }} />,
    title: "Safety & Compliance",
    desc: "Lifejacket rules, navigation lights, flare expiry, speed limits, safety equipment by vessel type.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 questions per day",
      "Recreational fishing rules",
      "Basic marine weather help",
      "General boating safety info",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Skipper",
    price: "$9",
    period: "/mo",
    features: [
      "Unlimited questions",
      "Region-specific fishing rules",
      "Detailed forecast interpretation",
      "Boat maintenance checklists",
      "Seasonal service reminders",
      "Shellfish biotoxin alerts",
    ],
    cta: "Start Skipper",
    highlight: true,
  },
  {
    name: "Captain",
    price: "$19",
    period: "/mo",
    features: [
      "Everything in Skipper",
      "Commercial maritime compliance",
      "QMS & quota management",
      "Seafood export guidance",
      "MOSS & SSM support",
      "Crew certification tracking",
      "Priority responses",
    ],
    cta: "Start Captain",
    highlight: false,
  },
];

const MarinerLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ParticleField />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, ${NEON} 0%, transparent 60%), radial-gradient(circle at 70% 80%, ${NEON} 0%, transparent 50%)`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Anchor size={40} style={{ color: NEON }} />
            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: NEON }}>
              ASM-021
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-4 font-display">
            Your expert skipper for{" "}
            <span style={{ color: NEON }}>NZ waters</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            Expert guidance for recreational boaters, commercial operators, and fishing enthusiasts — powered by NZ maritime knowledge.
          </p>
          <button
            onClick={() => navigate("/chat/maritime")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{
              background: NEON,
              color: "#0A0A14",
              boxShadow: `0 0 30px ${NEON}30`,
            }}
          >
            Talk to MARINER <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Capabilities */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10 font-display">
          What MARINER knows
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="rounded-xl p-5 transition-all hover:border-[#26C6DA30]"
              style={{
                background: "hsl(var(--card))",
                border: `1px solid ${NEON}12`,
              }}
            >
              <div className="mb-3">{c.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-3 font-display">
          Choose your plan
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: "hsl(var(--muted-foreground))" }}>
          From weekend fisher to commercial operator
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pricingTiers.map((t) => (
            <div
              key={t.name}
              className="rounded-xl p-6 flex flex-col"
              style={{
                background: t.highlight ? `${NEON}08` : "hsl(var(--card))",
                border: t.highlight ? `2px solid ${NEON}40` : `1px solid ${NEON}12`,
                boxShadow: t.highlight ? `0 0 40px ${NEON}10` : undefined,
              }}
            >
              <h3 className="font-bold text-lg mb-1" style={t.highlight ? { color: NEON } : {}}>
                {t.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-light">{t.price}</span>
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t.period}
                </span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: NEON }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/chat/maritime")}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors"
                style={
                  t.highlight
                    ? { background: NEON, color: "#0A0A14" }
                    : { background: `${NEON}15`, color: NEON, border: `1px solid ${NEON}25` }
                }
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Coastguard NZ Partnership */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            background: `linear-gradient(135deg, ${NEON}08, ${NEON}03)`,
            border: `1px solid ${NEON}20`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield size={28} style={{ color: NEON }} />
            <h2 className="text-xl font-bold font-display">
              Coastguard NZ Partnership
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            <p>
              MARINER proudly supports maritime safety education in partnership with{" "}
              <a
                href="https://www.coastguard.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
                style={{ color: NEON }}
              >
                Coastguard NZ
              </a>
              , New Zealand's primary maritime search and rescue service and the leading provider of boating safety education.
            </p>
            <p>
              We help Kiwi boaters understand and prepare for Coastguard courses — from the{" "}
              <strong className="text-foreground">Day Skipper</strong> certificate (ideal for
              recreational skippers wanting confidence on the water) to the{" "}
              <strong className="text-foreground">Boatmaster</strong> qualification and{" "}
              <strong className="text-foreground">VHF Radio Operator Certificate</strong>.
            </p>
            <p>
              MARINER reinforces Coastguard NZ's core message:{" "}
              <em className="text-foreground">"Every boater should wear a lifejacket, carry two forms of communication, and check the weather forecast before heading out."</em>
            </p>
            <p>
              A portion of every Skipper and Captain subscription supports Coastguard NZ's volunteer search and rescue operations around Aotearoa.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://www.coastguard.nz/boating-education"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: `${NEON}15`, color: NEON, border: `1px solid ${NEON}25` }}
            >
              Coastguard Courses <ArrowRight size={14} />
            </a>
            <button
              onClick={() => navigate("/chat/maritime")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: NEON, color: "#0A0A14" }}
            >
              Ask MARINER about courses
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center" style={{ borderColor: `${NEON}10` }}>
        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          MARINER (ASM-021) by{" "}
          <a href="https://assembl.co.nz" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: NEON }}>
            Assembl
          </a>{" "}
          · General information only, not a substitute for professional maritime advice
        </p>
        <p className="text-[11px] mt-2" style={{ color: '#ffffff38' }}>
          © 2026 Assembl · Auckland, New Zealand · Built in Aotearoa
        </p>
        <p className="text-[10px] mt-1" style={{ color: '#ffffff22' }}>
          Agent designs, system prompts, and automation workflows are proprietary trade secrets of Assembl.
        </p>
      </footer>
    </div>
  );
};

export default MarinerLanding;
