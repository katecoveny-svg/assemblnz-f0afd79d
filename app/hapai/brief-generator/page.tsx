import type { Metadata } from "next";
import { BriefGeneratorTool } from "@/components/hapai/BriefGeneratorTool";

export const metadata: Metadata = {
  title: "Brief generator — assembl",
  description: "Create a draft creative, pitch, or project brief in a shareable SPARK surface.",
};

export default function BriefGeneratorPage() {
  return <BriefGeneratorTool />;
}
