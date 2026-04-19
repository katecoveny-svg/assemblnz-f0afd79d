import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import heroOrb from "@/assets/hero-glass-koru-orb.png";

/* ─────────────────────────────────────────────────────────
   GLASS KORU HERO — photographic koru orb on icy bokeh
   matching the brand reference. Single hero image with
   sparkle aura, soft reflective floor, headline & CTAs.
   ───────────────────────────────────────────────────────── */

const GlassKoruHero = () => {
  const isMobile = useIsMobile();

  return (
    <section
      className="relative min-h-[100vh] flex items-center overflow-hidden"
    >
      {/* Sparkle bokeh atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 78% 45%, rgba(255,255,255,0.85) 0%, rgba(220,240,238,0.4) 30%, transparent 65%), radial-gradient(ellipse 50% 60% at 15% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)",
        }}
      />
      {/* Floor sheen */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "30%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(168,221,219,0.18) 50%, rgba(200,235,233,0.35) 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
        {/* Left: text */}
        <div className="text-left">
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "2.25rem" : "3.75rem",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "#1F4E54",
            }}
          >
            Empowering
            <br />
            New&nbsp;Zealand business
            <br />
            with the intelligence
            <br />
            of Aotearoa.
          </h1>

          <p
            className="mt-7 max-w-[460px]"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "0.95rem" : "1.05rem",
              lineHeight: 1.7,
              color: "#5C7B7E",
            }}
          >
            The leading AI platform designed to unlock knowledge and insights
            from all your company's content.
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link
              to="/start"
              className="inline-flex items-center justify-center px-9 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{
                background: "linear-gradient(180deg, #6FBDBE, #4FA3A6)",
                color: "#FFFFFF",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 500,
                fontSize: "1rem",
                boxShadow: "0 8px 22px rgba(79,163,166,0.32)",
              }}
            >
              Get started
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-9 py-4 rounded-full transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(79,163,166,0.55)",
                color: "#3D6B6E",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              Speak to a specialist
            </Link>
          </div>
        </div>

        {/* Right: photographic koru orb */}
        <div className="relative w-full flex items-center justify-center koru-orb-stage">
          {/* Halo glow behind orb — pulses gently */}
          <div
            className="absolute inset-0 pointer-events-none koru-orb-halo"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(168,221,219,0.6) 0%, rgba(200,235,233,0.28) 35%, transparent 65%)",
              filter: "blur(22px)",
            }}
          />
          {/* Sparkle motes drifting around the orb */}
          <span className="koru-mote koru-mote--a" />
          <span className="koru-mote koru-mote--b" />
          <span className="koru-mote koru-mote--c" />
          <span className="koru-mote koru-mote--d" />

          <img
            src={heroOrb}
            alt="Glass koru orb — engraved spiral inside a luminous sphere representing Aotearoa intelligence"
            className="relative w-full max-w-[560px] lg:max-w-[640px] h-auto object-contain koru-orb-img"
            style={{
              filter: "drop-shadow(0 30px 60px rgba(74,138,140,0.22))",
            }}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
