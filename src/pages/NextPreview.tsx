import { useState } from "react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SmoothScroll from "@/components/next/SmoothScroll";
import MagneticCursor from "@/components/next/MagneticCursor";
import HeroNext from "@/components/next/HeroNext";

/**
 * /next — A/B preview of the new cinematic hero treatments.
 * The live homepage at / stays untouched until Kate approves.
 */
export default function NextPreview() {
  const [variant, setVariant] = useState<"shader" | "layered">("shader");

  return (
    <>
      <SEO
        title="Assembl — Next (preview)"
        description="Cinematic hero preview. Internal A/B for the new homepage direction."
      />
      <SmoothScroll />
      <MagneticCursor />
      <BrandNav />

      {/* Floating A/B switch */}
      <div
        className="fixed top-20 right-4 z-[9990] flex items-center gap-1 p-1 rounded-full"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(58,125,110,0.18)",
          boxShadow: "0 8px 28px -10px rgba(58,125,110,0.25)",
        }}
      >
        {(["shader", "layered"] as const).map((v) => (
          <button
            key={v}
            data-magnetic
            onClick={() => setVariant(v)}
            className="px-4 py-2 rounded-full uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              background: variant === v ? "#3A7D6E" : "transparent",
              color: variant === v ? "#fff" : "#3D4250",
              transition: "background 220ms ease, color 220ms ease",
            }}
          >
            {v === "shader" ? "Shader only" : "Shader + glass"}
          </button>
        ))}
      </div>

      <HeroNext variant={variant} />

      {/* Spacer / next-section preview so smooth scroll has somewhere to go */}
      <section className="relative py-32 px-6" style={{ background: "#FAFBFC" }}>
        <div className="max-w-[900px] mx-auto text-center">
          <p
            className="uppercase mb-6"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "#3A7D6E",
            }}
          >
            Evidence packs, not chat
          </p>
          <h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 200,
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: "#3D4250",
            }}
          >
            Eight kete. From the dairy owner in Timaru to the customs broker on the Auckland waterfront —
            <em style={{ fontStyle: "italic", color: "#3A7D6E", fontWeight: 300 }}> AI that knows our laws, our context, and our way of working.</em>
          </h2>
          <p
            className="mt-6 max-w-[58ch] mx-auto"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              lineHeight: 1.65,
              color: "#3D4250B3",
            }}
          >
            Hospitality, construction, creative, automotive &amp; fleet, freight &amp; customs, health, professional services — and Tōro for whānau. Every output runs through our NZ compliance pipeline (Kahu → Iho → Tā → Mahara → Mana) and is grounded in live-updated NZ legislation, standards, and regulator guidance.
          </p>
          <p
            className="mt-6 max-w-[58ch] mx-auto"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#3D425099",
              fontStyle: "italic",
            }}
          >
            From $29/month for solo operators on Tōro, to $1,490 for small business on Operator, up to custom Outcome engagements. Nobody priced out of NZ-grounded AI.
          </p>
        </div>
      </section>

      <BrandFooter />
    </>
  );
}
