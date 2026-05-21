import type { Metadata } from "next";
import { LegacyHapaiToolShell } from "@/components/hapai/LegacyHapaiToolShell";

export const metadata: Metadata = {
  title: "Brief generator — assembl",
  description: "Create a draft creative, pitch, or project brief in a shareable HAPAI surface.",
};

export default function BriefGeneratorPage() {
  return (
    <LegacyHapaiToolShell
      title="Brief generator."
      kicker="hapai · record"
      description="Turn a loose project idea into a clean draft brief with scope, audience, constraints, and next steps."
      posture="Draft brief only. The owner signs off scope, budget, claims, and deadlines."
      path="/hapai/brief-generator"
      legacyPath="/hapai/_legacy/brief-generator/brief-generator.html"
    />
  );
}
