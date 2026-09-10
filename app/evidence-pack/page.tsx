import type { Metadata } from "next";
import {
  DetailRows,
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";
export const metadata: Metadata = {
  title: "The evidence pack · assembl",
  description:
    "The request, sources, assumptions, review and handoff behind a piece of prepared work.",
  alternates: { canonical: "/evidence-pack" },
};
export default function EvidencePackPage() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="The evidence pack"
        title="The work."
        accent="And what went into it."
        body="A readable record of a piece of prepared work: the request, the sources, the assumptions, the changes in review and the agreed next step."
        image="receipt"
      >
        <TextLink href="/mana-receipts/sample" primary>
          View a sample receipt
        </TextLink>
        <TextLink href="#explore">Look inside the pack</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="A record worth keeping"
          title="So the next person can understand."
          body="A useful handoff carries its context. The reviewer should be able to follow the work without reconstructing it from a conversation."
        />
        <DetailRows
          rows={[
            {
              n: "01",
              h: "The request and permission.",
              p: "What the customer asked for, the information they agreed to use and the purpose of the preparation.",
            },
            {
              n: "02",
              h: "Sources and assumptions.",
              p: "The material used, when it was checked, what remains unknown and which statements need a person to confirm them.",
            },
            {
              n: "03",
              h: "The prepared work.",
              p: "The draft brief, checklist or response, alongside the changes the customer or team made during review.",
            },
            {
              n: "04",
              h: "The next step.",
              p: "Who reviewed the work, what was approved, what remains open and who owns the handoff.",
            },
          ]}
        />
        <PageNote>
          A sample illustrates the record. The exact evidence captured and
          retained is agreed for each live journey.
        </PageNote>
        <div className="public-actions">
          <TextLink href="/trust" primary>
            Read the trust details
          </TextLink>
          <TextLink href="/pilots">Explore a pilot</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
