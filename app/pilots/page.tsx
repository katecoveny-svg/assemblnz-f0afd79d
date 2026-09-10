import type { Metadata } from "next";
import { CinematicSubpage } from "@/components/site/cinematic/CinematicSubpage";
export const metadata: Metadata = {
  title: "assembl · pilots",
  description:
    "Start with one customer wait, one useful output and a clear way to measure the difference.",
  alternates: { canonical: "/pilots" },
};
export default function PilotsPage() {
  return (
    <CinematicSubpage
      spec={{
        kicker: "Pilots",
        h1a: "One real wait.",
        h1b: "Something useful.",
        lede: "Start with a customer moment your team knows well. Together, we can build a small journey, agree the review boundary and test whether the next step becomes easier.",
        panels: [
          {
            n: "01",
            h: "Choose the moment.",
            p: "Map the real event, the wait and what happens next. Agree what the customer receives, the information needed and a clear way to skip.",
          },
          {
            n: "02",
            h: "Make it tangible.",
            p: "Build an interactive demonstrator with permission, preparation, review and handoff. Any simulated step is labelled. Connections to your systems are scoped separately.",
          },
          {
            n: "03",
            h: "Measure the difference.",
            p: "Agree a baseline and a small set of measures: missing information, preparation time, customer understanding and successful handoffs. Use the evidence to decide whether to continue.",
          },
        ],
        cta: { label: "Explore the pilot offer", href: "/pricing" },
        scene: "pilots",
      }}
    />
  );
}
