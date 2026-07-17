import type { Metadata } from "next";
import { VesselStudioTool } from "@/components/hapai/VesselStudioTool";

export const metadata: Metadata = {
  title: "Vessel studio — assembl",
  description: "A branded assembl prompt builder for hero imagery and vessel-led marketing assets.",
};

export default function VesselStudioPage() {
  return <VesselStudioTool />;
}
