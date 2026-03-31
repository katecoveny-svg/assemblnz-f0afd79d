import { useEffect } from "react";
import SEO from "@/components/SEO";

export default function BrandGuidelinesPage() {
  useEffect(() => {
    // Navigate directly to the static HTML page for full download support
    window.location.href = "/unified-brand-system-v2.html";
  }, []);

  return (
    <>
      <SEO
        title="Brand Asset Library | Assembl Mārama Brand System"
        description="Download official Assembl brand assets — logos, colour palettes, typography, and agent colour assignments across the Whenua palette."
      />
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground text-sm font-body">Loading brand assets…</p>
      </div>
    </>
  );
}
