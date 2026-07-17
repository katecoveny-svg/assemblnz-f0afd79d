import type { Metadata } from "next";
import { CaptionComposerTool } from "@/components/hapai/CaptionComposerTool";

export const metadata: Metadata = {
  title: "Caption composer — assembl",
  description: "Draft a caption for LinkedIn, Instagram, X, or Facebook. You check it before you post.",
};

export default function CaptionComposerPage() {
  return <CaptionComposerTool />;
}
