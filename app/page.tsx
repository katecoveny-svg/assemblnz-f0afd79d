import type { Metadata } from "next";
import { AssemblHomepage } from "@/components/site/AssemblHomepage";

const HOME_DESCRIPTION =
  "assembl designs and runs agentic customer journeys, from first enquiry to final handoff. Specialist agents prepare the work. Your people stay in control.";

export const metadata: Metadata = {
  title: "assembl · active customer journeys",
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "assembl · active customer journeys",
    description: HOME_DESCRIPTION,
    type: "website",
    locale: "en_NZ",
    url: "https://www.assembl.co.nz",
    siteName: "assembl",
  },
  twitter: {
    card: "summary_large_image",
    title: "assembl · active customer journeys",
    description: HOME_DESCRIPTION,
  },
};

export default function HomePage() {
  return <AssemblHomepage />;
}
