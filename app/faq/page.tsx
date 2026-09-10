import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, faqPageNode, breadcrumbNode, SITE_URL } from "@/lib/seo/schema";
import { FAQS } from "./faq-content";
import { FaqTool } from "./FaqTool";
import {
  PageHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Questions, answered · assembl",
  description:
    "Plain answers about active customer journeys, specialist agents, permissions, human review and evidence.",
  alternates: { canonical: "/faq" },
};
export default function FaqPage() {
  return (
    <PublicPage>
      <JsonLd
        data={graph(
          faqPageNode(
            FAQS.map((f) => ({ question: f.q, answer: f.a })),
            `${SITE_URL}/faq#faq`,
          ),
          breadcrumbNode([
            { name: "assembl", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        )}
      />
      <PageHero
        eyebrow="Questions & answers"
        title="A little more"
        accent="understanding."
        body="Explore the questions behind the work. Choose a topic, open an answer and take a copy into your next conversation."
        image="receipt"
        compact
      >
        <TextLink href="#explore" primary>
          Find an answer
        </TextLink>
        <TextLink href="/contact">Ask Kate</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="In plain words"
          title="What would you like to know?"
        />
        <FaqTool />
        <div className="public-actions">
          <TextLink href="/how-it-works" primary>
            See how it works
          </TextLink>
          <TextLink href="/pricing">Explore the pricing</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
