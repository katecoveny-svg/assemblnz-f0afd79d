import type { Metadata } from "next";
import { NineAmBriefTool } from "./NineAmBriefTool";

export const metadata: Metadata = {
  title: "The Dawn — assembl",
  description:
    "Paste your morning mess and get back a clear list: what matters today, who to chase, and what might slip. A free SPARK tool from assembl.",
  openGraph: {
    title: "The Dawn — assembl",
    description:
      "Paste the day’s mess and get back a clear list: what matters, who to chase, what to pack.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/9am-brief",
    siteName: "assembl",
    images: ["/hapai/9am-brief/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Dawn — assembl",
    description: "A practical morning brief for NZ operators, founders, EAs, and small teams.",
  },
};

export default function NineAmBriefPage() {
  return <NineAmBriefTool />;
}
