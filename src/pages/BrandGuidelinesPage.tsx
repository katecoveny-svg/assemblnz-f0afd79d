import SEO from "@/components/SEO";

export default function BrandGuidelinesPage() {
  return (
    <>
      <SEO
        title="Brand Asset Library | Assembl Mārama Brand System"
        description="Download official Assembl brand assets — logos, colour palettes, typography, and agent colour assignments across the Whenua palette."
      />
      <iframe
        src="/unified-brand-system-v2.html"
        title="Assembl × Te Kāhui Reo — Unified Brand System"
        className="w-full h-screen border-0"
        style={{ minHeight: "100vh" }}
      />
    </>
  );
}
