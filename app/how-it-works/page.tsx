import type { Metadata } from "next";
import {
  DetailRows,
  PageHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";
import { PreparationDemo } from "@/components/public/PreparationDemo";

export const metadata: Metadata = {
  title: "How assembl works",
  description:
    "From a real customer wait to useful preparation, human review and a clear next step.",
  alternates: { canonical: "/how-it-works" },
};
export default function HowItWorksPage() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="How it works"
        title="Good work,"
        accent="coming together."
        body="A customer is waiting for something real. assembl uses that moment to help them prepare what comes next, with their permission and a person in control."
        image="folio"
      >
        <TextLink href="#explore" primary>
          Explore the steps
        </TextLink>
        <TextLink href="/journeys">Try a journey</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="Anatomy of a useful wait"
          title="Every piece has a purpose."
          body="Select a step to see how the preparation fits together. The customer’s original task continues, whether or not they take part."
        />
        <PreparationDemo />
      </section>
      <section className="public-section">
        <SectionHeading
          label="From your workflow to a pilot"
          title="Built around how you work."
        />
        <DetailRows
          rows={[
            {
              n: "01",
              h: "Understand one workflow.",
              p: "We learn the facts, rules, people and tools behind one customer moment. Together, we define what can be prepared and where the agent must stop.",
            },
            {
              n: "02",
              h: "Prepare useful work.",
              p: "Agents can help assemble replies, follow-ups, briefs and documents from the information you approve. Outputs stay drafts until the agreed review is complete.",
            },
            {
              n: "03",
              h: "Agree the next action.",
              p: "Your team sets who can approve a handoff. Sending, publishing, booking or charging needs a defined permission path and an appropriately tested connection.",
            },
          ]}
        />
        <div className="public-actions">
          <TextLink href="/pilots" primary>
            Start with one journey
          </TextLink>
          <TextLink href="/trust">Read the trust details</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
