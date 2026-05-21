import type { Metadata } from "next";
import { LegacyHapaiToolShell } from "@/components/hapai/LegacyHapaiToolShell";

export const metadata: Metadata = {
  title: "Vessel studio — assembl",
  description: "A branded assembl prompt builder for hero imagery and vessel-led marketing assets.",
};

export default function VesselStudioPage() {
  return (
    <LegacyHapaiToolShell
      title="Vessel studio."
      kicker="hapai · marketing"
      description="A quiet prompt builder for branded hero imagery and vessel-led campaign assets."
      posture="Draft imagery only. A named person picks, checks, and publishes the final asset."
      path="/hapai/vessel-studio"
      legacyPath="/hapai/_legacy/vessel-studio/vessel-studio.html"
    />
  );
}
