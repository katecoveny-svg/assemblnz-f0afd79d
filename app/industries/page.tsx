import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, breadcrumbNode, SITE_URL } from "@/lib/seo/schema";
import {
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";
export const metadata: Metadata = {
  title: "Industry moments · assembl",
  description:
    "Explore proposed customer journeys across different industries, each with a real wait and a defined human handoff.",
  alternates: { canonical: "/industries" },
};
type Industry = {
  name: string;
  wait: string;
  what: string;
  demo?: { label: string; href: string };
  status?: "coming";
};
const INDUSTRIES: Industry[] = [
  {
    name: "General insurance",
    wait: "A claim is being reviewed.",
    what: "Prepare a customer-approved evidence summary and questions for the claims team. A person owns the assessment and any decision.",
    demo: {
      label: "walk the claims concept",
      href: "https://assembling-tower.pages.dev",
    },
  },
  {
    name: "Health insurance",
    wait: "Information is being gathered for a coverage review.",
    what: "Organise the documents and open questions for the insurer. Clinical advice and coverage decisions remain with qualified people.",
    demo: {
      label: "walk the remediation concept",
      href: "https://assembling-southern-cross.pages.dev",
    },
  },
  {
    name: "Lending & consumer finance",
    wait: "An application is awaiting information or review.",
    what: "Prepare a completeness checklist and questions for the lending specialist. The agent does not decide affordability, eligibility or approval.",
    demo: {
      label: "walk the lending concept",
      href: "https://assembling-nectar.pages.dev",
    },
  },
  {
    name: "Banking",
    wait: "A customer is waiting for an adviser or an application update.",
    what: "Assemble a clear brief of the customer’s questions and missing items for an approved human handoff.",
    demo: {
      label: "walk the banking demonstrator",
      href: "https://assembling-demo-banking.pages.dev",
    },
  },
  {
    name: "Investing & KiwiSaver",
    wait: "An order or transfer is processing.",
    what: "Explain the administrative steps and prepare customer questions. Any regulated advice follows an approved advice pathway.",
    demo: {
      label: "walk the investing concept",
      href: "https://assembling-sharesies.pages.dev",
    },
  },
  {
    name: "Tax & fintech",
    wait: "A client is waiting for an accountant or filing review.",
    what: "Organise supporting records and open questions for a qualified reviewer. Filing and consequential advice need a defined approval path.",
    demo: {
      label: "walk the tax concept",
      href: "https://assembling-hnry.pages.dev",
    },
  },
  {
    name: "Postal & logistics",
    wait: "A parcel is between delivery steps.",
    what: "Prepare delivery preferences or the information needed for an enquiry. A real status source is required for live tracking.",
    demo: {
      label: "walk the parcel concept",
      href: "https://assembling-nzpost.pages.dev",
    },
  },
  {
    name: "Marketplace & property",
    wait: "A customer is waiting for a property conversation.",
    what: "Assemble the questions and approved information that would make the next conversation more useful.",
    demo: {
      label: "walk the property concept",
      href: "https://assembling-trademe.pages.dev",
    },
  },
  {
    name: "Energy & utilities",
    wait: "A bill, switch or account question is being reviewed.",
    what: "Prepare a clear summary of the information and questions. Billing disputes, outages and hardship need the appropriate support team.",
    demo: {
      label: "walk the energy concept",
      href: "https://assembling-electrickiwi.pages.dev",
    },
  },
  {
    name: "Grocery & retail",
    wait: "An order is being picked or packed.",
    what: "Gather optional substitution preferences for customer review, with the primary order continuing either way.",
    demo: {
      label: "walk the grocery demonstrator",
      href: "https://assembling-demo-grocery.pages.dev",
    },
  },
  {
    name: "Subscription & meal kits",
    wait: "A meal-kit order is being prepared.",
    what: "Help the household prepare for the week with an optional pantry check or dinner plan. Allergy and food safety questions go to the service team.",
    demo: {
      label: "walk the meal-kit concept",
      href: "https://assembling-myfoodbag.pages.dev",
    },
  },
  {
    name: "Retirement living & care",
    wait: "A family is waiting for information or a village visit.",
    what: "Prepare a family-controlled brief of preferences and questions for the adviser. Care, legal and financial decisions stay with qualified people.",
    demo: {
      label: "walk the retirement demonstrator",
      href: "https://assembling-demo-retirement.pages.dev",
    },
  },
  {
    name: "Airlines & travel",
    wait: "A travel team is resolving a disruption.",
    what: "Prepare the customer’s priorities for connections, travelling companions and access needs. The team confirms availability and any booking.",
    demo: {
      label: "walk the airline demonstrator",
      href: "https://assembling-demo-airline.pages.dev",
    },
  },
  {
    name: "Trades & professional services",
    wait: "A quote or site visit is being prepared.",
    what: "Organise the job brief and questions using the information the customer approves. A qualified person confirms scope and price.",
    demo: { label: "see the journey", href: "/concepts" },
  },
  {
    name: "Construction & architecture",
    wait: "A project question is waiting for a design or delivery review.",
    what: "Prepare the relevant model information, documents and questions for the responsible professional. Technical decisions remain with that person.",
    demo: {
      label: "walk the construction demonstrator",
      href: "https://assembling-construction.pages.dev",
    },
  },
];
export default function IndustriesPage() {
  return (
    <PublicPage>
      <JsonLd
        data={graph(
          {
            "@type": "ItemList",
            "@id": SITE_URL + "/industries#list",
            name: "Proposed customer journey concepts",
            itemListElement: INDUSTRIES.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              description: item.what,
            })),
          },
          breadcrumbNode([
            { name: "assembl", path: "/" },
            { name: "Industries", path: "/industries" },
          ]),
        )}
      />
      <PageHero
        eyebrow="Industry moments"
        title="A real wait."
        accent="In every kind of work."
        body="Explore where useful preparation could fit. Each concept begins with a customer moment and ends with a person responsible for the next step."
        image="folio"
      >
        <TextLink href="#explore" primary>
          Explore the moments
        </TextLink>
        <TextLink href="/pilots">Start with one pilot</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="Proposed customer journeys"
          title="One pattern. Many possibilities."
          body="These independent concepts illustrate possible journeys. They do not establish a client relationship, a live integration or a measured customer outcome."
        />
        <div className="public-agent-grid">
          {INDUSTRIES.map((item, index) => (
            <article className="public-agent-card" key={item.name}>
              <p className="public-label">
                {String(index + 1).padStart(2, "0")} / Proposed concept
              </p>
              <h3>{item.name}</h3>
              <p className="public-industry-wait">{item.wait}</p>
              <p>{item.what}</p>
              {item.demo &&
                (item.demo.href.startsWith("http") ? (
                  <a
                    className="public-text-link"
                    href={item.demo.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open concept <span aria-hidden>↗</span>
                    <span className="sr-only"> (opens a new tab)</span>
                  </a>
                ) : (
                  <Link className="public-text-link" href={item.demo.href}>
                    Explore the journey <span aria-hidden>↗</span>
                  </Link>
                ))}
            </article>
          ))}
        </div>
        <PageNote>
          External concepts have their own demonstration data and boundaries. A
          live pilot requires a separately agreed scope, permissions and tested
          connections.
        </PageNote>
      </section>
    </PublicPage>
  );
}
