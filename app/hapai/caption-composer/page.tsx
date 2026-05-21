import type { Metadata } from "next";
import { LegacyHapaiToolShell } from "@/components/hapai/LegacyHapaiToolShell";

export const metadata: Metadata = {
  title: "Caption composer — assembl",
  description: "Draft LinkedIn, Instagram, X, and Facebook captions in a review-ready assembl surface.",
};

export default function CaptionComposerPage() {
  return (
    <LegacyHapaiToolShell
      title="Caption composer."
      kicker="hapai · marketing"
      description="Draft LinkedIn, Instagram, X, and Facebook captions tuned to each platform's rhythm."
      posture="Draft captions only. Check claims, permissions, and platform fit before posting."
      path="/hapai/caption-composer"
      legacyPath="/static-hapai/caption-composer/caption-composer.html"
    />
  );
}
