import type { Metadata } from "next";
import { LegacyHapaiToolShell } from "@/components/hapai/LegacyHapaiToolShell";

export const metadata: Metadata = {
  title: "OG card generator — assembl",
  description: "Build branded 1200x630 share cards from a proper HAPAI app route.",
};

export default function OgCardGeneratorPage() {
  return (
    <LegacyHapaiToolShell
      title="OG card generator."
      kicker="hapai · marketing"
      description="Build branded 1200x630 social share cards with headline, accent, vessel image, and export controls."
      posture="Draft share cards only. Check copy, image rights, and brand fit before publishing."
      path="/hapai/og-card-generator"
      legacyPath="/hapai/_legacy/og-card-generator/og-card-generator.html"
    />
  );
}
