import type { Metadata } from "next";
import { LegacyHapaiToolShell } from "@/components/hapai/LegacyHapaiToolShell";

export const metadata: Metadata = {
  title: "Share card maker — assembl",
  description: "Make a branded share card for any link you post.",
};

export default function OgCardGeneratorPage() {
  return (
    <LegacyHapaiToolShell
      title="Share card maker."
      kicker="hapai · marketing"
      description="Make a branded share card for a link you're posting — headline, accent colour, vessel image, ready to download."
      posture="Draft share cards only. Check copy, image rights, and brand fit before publishing."
      path="/hapai/og-card-generator"
      legacyPath="/static-hapai/og-card-generator/og-card-generator.html"
    />
  );
}
