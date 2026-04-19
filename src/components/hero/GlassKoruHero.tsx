import { Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const GlassKoruOrb3D = lazy(() => import("./GlassKoruOrb3D"));

/* ─────────────────────────────────────────────────────────
   SEA-GLASS KORU HERO — pale translucent teal orb on a
   mist-white to pale-teal gradient. Calm, premium, luminous.
   ───────────────────────────────────────────────────────── */

const GlassKoruHero = () => {
  const isMobile = useIsMobile();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, #fbfffe 0%, #f3fbfa 28%, #e8f6f3 55%, #deefeb 100%)",
      }}
    >
      {/* Soft atmospheric blooms */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "rgba(168,221,219,0.18)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[260px] w-[760px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "rgba(207,234,231,0.28)" }}
        />
      </div>

      <div className="relative mx-auto grid min-h-[92vh] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-28 md:px-10 lg:grid-cols-2 lg:gap-16 lg:px-16">
        {/* Left: text */}
        <div className="max-w-xl">
          <div
            className="mb-5 inline-flex items-center rounded-full px-4 py-2 text-sm backdrop-blur-md"
            style={{
              border: "1px solid rgba(73,128,126,0.15)",
              background: "rgba(255,255,255,0.45)",
              color: "#4A6E6E",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Intelligence, shaped for Aotearoa
          </div>

          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 500,
              fontSize: isMobile ? "2.25rem" : "3.75rem",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: "#214F55",
            }}
          >
            Simulation-tested intelligence for real operational work.
          </h1>

          <p
            className="mt-6 max-w-lg"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "1rem" : "1.125rem",
              lineHeight: 1.7,
              color: "#5F7D7E",
            }}
          >
            Assembl delivers policy-governed AI systems designed for Aotearoa —
            specialist agents, trusted workflows, and premium operational tools
            for New Zealand business.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/start"
              className="inline-flex items-center justify-center rounded-full px-7 py-4 transition-all duration-300 hover:-translate-y-[1px]"
              style={{
                background: "#7FD4CC",
                color: "#133E43",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 500,
                fontSize: "1.0625rem",
                boxShadow: "0 10px 30px rgba(96,188,180,0.22)",
              }}
            >
              Explore the platform
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full px-7 py-4 backdrop-blur-md transition-all duration-300 hover:bg-white/70"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(73,128,126,0.20)",
                color: "#2A5A5F",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 500,
                fontSize: "1.0625rem",
              }}
            >
              Speak to us
            </Link>
          </div>
        </div>

        {/* Right: animated 3D sea-glass koru orb */}
        <div className="relative w-full flex items-center justify-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(191,228,221,0.35) 0%, rgba(207,234,231,0.18) 40%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="relative w-full mx-auto"
            style={{
              height: isMobile ? 380 : 600,
              maxWidth: isMobile ? 420 : 640,
              filter: "drop-shadow(0 24px 48px rgba(120,170,168,0.18))",
            }}
          >
            <Suspense fallback={null}>
              <GlassKoruOrb3D />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
