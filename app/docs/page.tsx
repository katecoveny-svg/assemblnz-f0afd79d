import type { Metadata } from "next";
import Link from "next/link";
import { getAllDocs, getDocGroups } from "@/lib/docs";
import { DocsSearch } from "./DocsSearch";
import {
  PageHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";
export const metadata: Metadata = {
  title: "Documentation · assembl",
  description:
    "Find guidance for the collections, evidence packs, integrations and review steps.",
  alternates: { canonical: "/docs" },
};
export default function DocsPage() {
  const docs = getAllDocs();
  const groups = getDocGroups(docs);
  return (
    <PublicPage>
      <PageHero
        eyebrow="Documentation"
        title="The detail"
        accent="behind the work."
        body="Find the guidance for your next step: setting up a collection, understanding an evidence pack or checking how a connection and its review boundary work."
        image="receipt"
        compact
      >
        <TextLink href="#explore" primary>
          Search the guidance
        </TextLink>
        <TextLink href="/contact">Ask for help</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <div className="public-contact-grid">
          <div>
            <SectionHeading
              label="Find a useful answer"
              title="Where would you like to begin?"
            />
          </div>
          <div className="public-form public-form-panel">
            <DocsSearch
              docs={docs.map((doc) => ({
                slug: doc.slug,
                title: doc.title,
                description: doc.description,
                group: doc.group,
                order: doc.order,
                searchText: doc.searchText,
              }))}
            />
          </div>
        </div>
        <div className="public-proof-grid public-doc-groups">
          {groups.map(({ group, items }) => (
            <article key={group}>
              <p className="public-label">{group}</p>
              {items.map((doc) => (
                <Link
                  href={`/docs/${doc.slug}`}
                  key={doc.slug}
                  className="public-doc-link"
                >
                  <h3>
                    {doc.title}
                    <span aria-hidden>↗</span>
                  </h3>
                  <p>{doc.description}</p>
                </Link>
              ))}
            </article>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
