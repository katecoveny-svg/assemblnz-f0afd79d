import type { Metadata } from "next";
import { CinematicSubpage } from "@/components/site/cinematic/CinematicSubpage";
export const metadata: Metadata = {
  title: "assembl · field notes",
  description:
    "Notes from the workshop: the choices, questions and evidence behind active customer journeys.",
  alternates: { canonical: "/field-notes" },
};
export default function FieldNotesPage() {
  return (
    <CinematicSubpage
      spec={{
        kicker: "Field notes",
        h1a: "Notes from",
        h1b: "the workshop.",
        lede: "The choices, questions and evidence behind active customer journeys. A place to make the thinking visible as the work develops.",
        panels: [
          {
            n: "01",
            h: "First notes to come.",
            p: "This collection is being prepared. In the meantime, the journey demonstrators show how permission, preparation and review fit together.",
          },
          {
            n: "02",
            h: "Decisions worth sharing.",
            p: "What makes a wait useful? Where should an agent stop? What should a person be able to inspect? These are the questions the notes will follow.",
          },
          {
            n: "03",
            h: "Evidence before outcomes.",
            p: "Concepts, observations and measured results will be identified separately. A promising prototype is a starting point for a test, not a claim of customer impact.",
          },
        ],
        cta: { label: "Explore the journeys", href: "/journeys" },
        scene: "notes",
      }}
    />
  );
}
