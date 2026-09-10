import type { Metadata } from "next";
import { CinematicSubpage } from "@/components/site/cinematic/CinematicSubpage";

export const metadata: Metadata = {
  title: "assembl · about",
  description:
    "Useful preparation while your customer waits. Built in Aotearoa, with people in control.",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <CinematicSubpage
      spec={{
        kicker: "About assembl",
        h1a: "Make the wait",
        h1b: "mean something.",
        lede: "assembl helps organisations turn necessary customer waiting into useful, permissioned preparation—with a named person in control and evidence of what happened.",
        panels: [
          {
            n: "01",
            h: "Begin with a real moment.",
            p: "A customer is waiting for a quote, an order, a reply or a decision. We find the small piece of preparation that would make their next step easier. Taking part is always optional.",
          },
          {
            n: "02",
            h: "Build around the people.",
            p: "We shape the journey around your customer, your team and the information you approve. Agents prepare useful work. The customer can correct it, decline it or ask for a person.",
          },
          {
            n: "03",
            h: "Let the work earn its proof.",
            p: "assembl is founded in Aotearoa New Zealand by Kate. We start with a bounded journey, agree who owns the next step and test the benefit before making bigger promises.",
          },
        ],
        cta: { label: "Talk to Kate", href: "/contact" },
        scene: "about",
      }}
    />
  );
}
