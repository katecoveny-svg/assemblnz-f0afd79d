"use client";

import { useState } from "react";
import {
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

const JOURNEYS = [
  {
    id: "grocery",
    sector: "Grocery",
    title: "Dinner starts before the bag arrives.",
    wait: "An order is being packed.",
    prepared:
      "A customer-approved plan for pantry gaps, substitutions and the week ahead.",
    review:
      "The customer chooses what to include. Allergy, food safety and delivery concerns go to the service team.",
    proof:
      "Preferences used, choices made and the summary prepared for the next step.",
    measure:
      "Test whether preferences are clearer and avoidable service contacts decrease.",
  },
  {
    id: "travel",
    sector: "Travel",
    title: "Prepare the next option while plans change.",
    wait: "A travel team is resolving a disruption.",
    prepared:
      "A brief covering connections, travelling companions, accessibility and priorities.",
    review:
      "The customer approves the brief. The travel team confirms availability and any booking change.",
    proof: "The chosen priorities, information checked and named handoff.",
    measure:
      "Test whether the next conversation is better prepared and repeat explanations decrease.",
  },
  {
    id: "energy",
    sector: "Energy",
    title: "Make the bill easier to understand.",
    wait: "Billing information or an account review is being prepared.",
    prepared:
      "A clear summary of changes, open questions and relevant next steps.",
    review:
      "The customer checks the information. Billing disputes and hardship support go to a person.",
    proof:
      "Source information, any assumptions and the questions shared with the team.",
    measure:
      "Test comprehension and successful support routing. Estimates are never guaranteed savings.",
  },
  {
    id: "retirement",
    sector: "Retirement living",
    title: "A better visit begins with your questions.",
    wait: "A village adviser is preparing information or a visit.",
    prepared:
      "A family-controlled brief of preferences, access needs and questions to ask.",
    review:
      "The customer chooses what to share. Advisers, clinicians and legal professionals retain their own roles.",
    proof: "Invited participants, permission and the approved visit brief.",
    measure:
      "Test visit relevance, unanswered questions and customer confidence.",
  },
  {
    id: "trades",
    sector: "Trades",
    title: "Let the first conversation start further ahead.",
    wait: "A team is preparing a quote or arranging a site visit.",
    prepared:
      "An organised brief of the job, customer questions and the information still needed.",
    review:
      "The customer checks the brief. A qualified person confirms scope, price and any technical advice.",
    proof: "Inputs, open questions, reviewer and agreed next step.",
    measure:
      "Test missing-information rates and the time needed to prepare the visit.",
  },
];
export const CONCEPT_SECTOR_COUNT = JOURNEYS.length;

export function CinematicConcepts() {
  const [active, setActive] = useState(0);
  const journey = JOURNEYS[active]!;
  return (
    <PublicPage>
      <PageHero
        eyebrow="Journey concepts"
        title="Different moments."
        accent="The same care."
        body="One pattern works across many customer journeys: a real wait, a useful choice, prepared work and a person responsible for what happens next."
        image="folio"
      >
        <TextLink href="#explore" primary>
          Explore five moments
        </TextLink>
        <TextLink href="/journeys">Try a demonstrator</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="Choose a customer moment"
          title="Where could the wait become useful?"
          body="These are proposed assembl concepts. They describe a pilot to test, not existing client offers or connections."
        />
        <div className="public-concept-layout">
          <div className="public-concept-tabs" aria-label="Choose an industry">
            {JOURNEYS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                aria-controls="concept-detail"
              >
                <span>0{index + 1}</span>
                {item.sector}
              </button>
            ))}
          </div>
          <div
            className="public-concept-detail"
            id="concept-detail"
            role="region"
            aria-live="polite"
            aria-label={journey.sector}
          >
            <p className="public-label">Proposed concept / {journey.sector}</p>
            <h2>{journey.title}</h2>
            <dl>
              <div>
                <dt>The wait</dt>
                <dd>{journey.wait}</dd>
              </div>
              <div>
                <dt>The preparation</dt>
                <dd>{journey.prepared}</dd>
              </div>
              <div>
                <dt>The human</dt>
                <dd>{journey.review}</dd>
              </div>
              <div>
                <dt>The evidence</dt>
                <dd>{journey.proof}</dd>
              </div>
              <div>
                <dt>What to test</dt>
                <dd>{journey.measure}</dd>
              </div>
            </dl>
            <TextLink href="/contact" primary>
              Discuss a moment like this
            </TextLink>
          </div>
        </div>
        <PageNote>
          Participation is optional. Any reward or sponsored utility would need
          a separate, disclosed agreement and must not influence a consequential
          outcome.
        </PageNote>
      </section>
    </PublicPage>
  );
}
