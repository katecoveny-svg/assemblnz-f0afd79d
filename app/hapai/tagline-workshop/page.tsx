import type { Metadata } from "next";
import { LegacyHapaiToolShell } from "@/components/hapai/LegacyHapaiToolShell";

export const metadata: Metadata = {
  title: "Tagline workshop — assembl",
  description: "Generate and shortlist tagline candidates in a shareable SPARK surface.",
};

export default function TaglineWorkshopPage() {
  return (
    <LegacyHapaiToolShell
      title="Tagline workshop."
      kicker="hapai · marketing"
      description="Generate tagline candidates across five styles, then shortlist the lines worth human review."
      posture="Draft language only. A human chooses and clears the final line."
      path="/hapai/tagline-workshop"
      legacyPath="/static-hapai/tagline-workshop/tagline-workshop.html"
    />
  );
}
