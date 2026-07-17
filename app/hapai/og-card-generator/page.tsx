import type { Metadata } from "next";
import { OgCardGeneratorTool } from "@/components/hapai/OgCardGeneratorTool";

export const metadata: Metadata = {
  title: "Share card maker — assembl",
  description: "Make a branded share card for any link you post.",
};

export default function OgCardGeneratorPage() {
  return <OgCardGeneratorTool />;
}
