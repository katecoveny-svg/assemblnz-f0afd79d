import type { Metadata } from "next";
import { TaglineWorkshopTool } from "@/components/hapai/TaglineWorkshopTool";

export const metadata: Metadata = {
  title: "Tagline workshop — assembl",
  description: "Generate and shortlist tagline candidates in a shareable SPARK surface.",
};

export default function TaglineWorkshopPage() {
  return <TaglineWorkshopTool />;
}
