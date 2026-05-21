import type { Metadata } from "next";
import { NineAmBriefTool } from "./NineAmBriefTool";

export const metadata: Metadata = {
  title: "The 9am Brief — assembl",
  description:
    "A shareable HAPAI tool that turns loose morning signals into priorities, follow-ups, calendar risks, and review-ready actions.",
  openGraph: {
    title: "The 9am Brief — assembl",
    description:
      "Paste the day’s loose signals and leave with priorities, follow-ups, and review-ready actions.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/9am-brief",
    siteName: "assembl",
  },
  twitter: {
    card: "summary_large_image",
    title: "The 9am Brief — assembl",
    description: "A practical morning brief for NZ operators, founders, EAs, and small teams.",
  },
};

export default function NineAmBriefPage() {
  return <NineAmBriefTool />;
}
