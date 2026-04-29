import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { track } from "@/lib/analytics";

export default function SampleEvidencePackPage() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = heroRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !fired) {
            fired = true;
            track("proof_asset_viewed", {
              page: "/sample-evidence-pack",
              asset: "evidence_pack_hero",
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <SEO
        title="Sample evidence pack — Assembl"
        description="A redacted sample evidence pack is on the way. Book a call to see one live."
        path="/sample-evidence-pack"
      />
      <div style={{ background: "#FAF6EF", minHeight: "100vh" }}>
        <BrandNav />
        <main
          ref={heroRef}
          data-asset="evidence_pack_hero"
          className="mx-auto max-w-3xl px-6 py-32 text-center"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[#7A8B82] mb-6">Evidence pack</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#0F2A26] mb-6">
            Sample evidence pack — coming soon.
          </h1>
          <p className="text-lg text-[#0F2A26]/80">
            <Link
              to="/contact"
              data-cta="evidence-pack-book-call"
              className="underline text-[#1F4D47] hover:text-[#0F2A26]"
            >
              Book a call to see one live.
            </Link>
          </p>
        </main>
        <BrandFooter />
      </div>
    </>
  );
}
