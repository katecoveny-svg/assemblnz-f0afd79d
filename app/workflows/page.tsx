import type { Metadata } from "next";
import { MarketplaceClient } from "@/components/site/MarketplaceClient";
import { KETES, type KeteSlug } from "@/lib/kete";
import { allWorkflows } from "@/lib/workflows";
import {
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";
export const metadata: Metadata = {
  title: "Workflow collection · assembl",
  description:
    "Explore pre-made workflows, run a sample and find one useful starting point for your team.",
  alternates: { canonical: "/workflows" },
};
export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<{ kete?: string }>;
}) {
  const { kete } = await searchParams;
  const initialKete: "all" | KeteSlug = KETES.some((item) => item.slug === kete)
    ? (kete as KeteSlug)
    : "all";
  return (
    <PublicPage>
      <PageHero
        eyebrow="Workflow collection"
        title="A head start"
        accent="on the work."
        body="Explore prepared workflows for the tasks that take up your day. Open a sample, inspect the result and find a starting point your team can shape."
        image="tiles"
      >
        <TextLink href="#explore" primary>
          Find a workflow
        </TextLink>
        <TextLink href="/agents">Browse the agents</TextLink>
      </PageHero>
      <section id="explore" className="public-section public-document">
        <SectionHeading
          label={allWorkflows.length + " workflows in the collection"}
          title="Choose one job to begin."
          body="Kete means basket or kit. The collections group related work so you can find a useful sample and understand what it prepares."
        />
        <MarketplaceClient workflows={allWorkflows} initialKete={initialKete} />
        <PageNote>
          Any time-saving figures in the catalogue are estimates for the
          example. Actual benefit needs a baseline and a pilot.
        </PageNote>
      </section>
    </PublicPage>
  );
}
