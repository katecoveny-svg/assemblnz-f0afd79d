import type { Metadata } from "next";
import { VoyageItalyTool } from "./VoyageItalyTool";

export const metadata: Metadata = {
  title: "Voyage Italy — assembl",
  description:
    "A practical Italy travel desk with live weather, EUR to NZD context, photo parsing, timing risks, useful Italian, and draft travel actions.",
  openGraph: {
    title: "Voyage Italy — assembl",
    description:
      "Upload a ticket, menu, sign, or booking screenshot and leave with today’s Italy travel desk.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/voyage-italy",
    siteName: "assembl",
  },
};

export default function VoyageItalyPage() {
  return <VoyageItalyTool />;
}
