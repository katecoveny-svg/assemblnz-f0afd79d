import type { Metadata } from "next";
import { AiReadyClient } from "./AiReadyClient";

export const metadata: Metadata = {
  title: "Your website action plan — assembl",
  description:
    "Check your public website, prioritise improvements and download a visual implementation plan. Explore proposed customer experiences for your business.",
  keywords: [
    "AI search readiness",
    "AI SEO check",
    "llms.txt",
    "agentic customer journeys",
    "agentic CX",
    "AI optimised website",
    "New Zealand",
  ],
  alternates: { canonical: "/ai-ready" },
  openGraph: {
    title: "Your website. A useful next step.",
    description:
      "Public-page findings, a practical action plan and proposed interactive experiences. Free from assembl.",
  },
};

export default function AiReadyPage() {
  return <AiReadyClient />;
}
