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
              fontFamily: "'IBM Plex Mono', monospace",
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
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "#3A7D6E",
            }}
          >
            Evidence packs, not chat
          </p>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 200,
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: "#3D4250",
            }}
          >
            Eight kete. One compliance pipeline. From the dairy owner in Timaru to the customs broker on the Auckland waterfront —
            <em style={{ fontStyle: "italic", color: "#3A7D6E", fontWeight: 300 }}> built in Aotearoa, for the way we actually operate.</em>
          </h2>
          <p
            className="mt-8 max-w-[60ch] mx-auto"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              lineHeight: 1.65,
              color: "#3D4250B3",
            }}
          >
            Manaaki (hospitality), Waihanga (construction), Auaha (creative), Arataki (automotive &amp; fleet), Pikau (freight &amp; customs), Hoko (retail), Ako (early childhood) — and Tōro for whānau. Every output runs through Kahu → Iho → Tā → Mahara → Mana, grounded in live-updated NZ Acts and regulator guidance.
          </p>

          {/* Three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            {[
              { eyebrow: "Pillar 1", title: "Made accessible", body: "From $29 Tōro to custom Outcome. Same compliance pipeline at every tier — nobody priced out." },
              { eyebrow: "Pillar 2", title: "NZ-specific by default", body: "Live-updated NZ Acts, regulator guidance, industry standards. Every output cites an Act, regulator, or record." },
              { eyebrow: "Pillar 3", title: "Evidence packs, not chat", body: "Auditable deliverables for WorkSafe, MBIE, IRD, a client, or a board. The pack is the product." },
            ].map((p) => (
              <div key={p.eyebrow} className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(58,125,110,0.15)" }}>
                <p className="uppercase text-[10px] mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.28em", color: "#3A7D6E" }}>{p.eyebrow}</p>
                <h3 className="text-[19px] mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "#3D4250" }}>{p.title}</h3>
                <p className="text-[14px]" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6, color: "#3D4250B3" }}>{p.body}</p>
              </div>
            ))}
          </div>

          <p
            className="mt-12 text-[13px]"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.18em",
              color: "#3A7D6E",
              textTransform: "uppercase",
            }}
          >
            Intelligence, shaped for Aotearoa — at a price every operator can afford
          </p>
        </div>
      </section>

      <BrandFooter />
    </>
  );
}
