import type { Metadata } from "next";
import { TurfMaintenanceLog } from "@/components/hapai/TurfMaintenanceLog";

export const metadata: Metadata = {
  title: "Turf maintenance log · assembl",
  description:
    "A free tool for NZ sports clubs and school grounds. Weekly mowing, irrigation, line marking, hazards, chemical sprays — mapped to HSWA 2015 and HSNO 1996.",
  openGraph: {
    images: ["/hapai/turf-maintenance/opengraph-image"],
  },
};

export default function TurfMaintenancePage() {
  return <TurfMaintenanceLog />;
}
