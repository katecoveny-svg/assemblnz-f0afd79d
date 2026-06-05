import type { Metadata } from "next";
import { CustomsEntryTool } from "@/components/hapai/CustomsEntryTool";

export const metadata: Metadata = {
  title: "Customs entry drafter — free HAPAI tool",
  description:
    "Structure a broker-ready customs entry draft from a commercial invoice. Draft only — it never invents an HS code and never lodges to TSW.",
  openGraph: {
    title: "Customs entry drafter — free HAPAI tool",
    description:
      "Turn a commercial invoice into a structured, broker-ready customs entry draft. Never lodges to TSW.",
    images: ["/hapai/customs-entry/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hapai/customs-entry/opengraph-image"],
  },
};

export default function HapaiCustomsEntryPage() {
  return <CustomsEntryTool />;
}
