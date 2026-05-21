import type { Metadata } from "next";
import { VoyageItalyTool } from "./VoyageItalyTool";

export const metadata: Metadata = {
  title: "Voyage Travel Desk — assembl",
  description:
    "A practical travel companion with live weather, FX context, photo moments, booking parsing, local ideas, timing risks, useful phrases, and draft actions.",
  openGraph: {
    title: "Voyage Travel Desk — assembl",
    description:
      "Upload tickets, menus, signs, bookings, or trip photos and leave with today’s travel desk.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/voyage-italy",
    siteName: "assembl",
    images: [{ url: "/hapai/voyage-italy/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyage Travel Desk — assembl",
    description: "A shared Italy trip desk for Kate and Adrian.",
    images: ["/hapai/voyage-italy/opengraph-image"],
  },
};

export default function VoyageItalyPage() {
  return <VoyageItalyTool />;
}
