import type { Metadata } from "next";
import { NineAmBriefTool } from "./NineAmBriefTool";

export const metadata: Metadata = {
  title: "The 9am Brief — assembl",
  description:
    "Paste your morning mess and get back a clear list: what matters today, who to chase, and what might slip. A free HAPAI tool from assembl.",
  openGraph: {
    title: "The 9am Brief — assembl",
    description:
      "Paste the day’s mess and get back a clear list: what matters, who to chase, what to pack.",
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
