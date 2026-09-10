import type { Metadata } from "next";
import Image from "next/image";
import { InMemoryJourneyRepository } from "@/lib/journey/repository";
import {
  DetailRows,
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Customer journeys · assembl",
  description:
    "Explore how a real customer wait can become useful preparation, with permission, human review and evidence.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/journeys" },
};
export default async function JourneysIndex() {
  const repo = new InMemoryJourneyRepository();
  const journeys = await repo.listJourneys("everyday-assembled");
  return (
    <PublicPage>
      <PageHero
        eyebrow="Customer journeys"
        title="A better"
        accent="next step."
        body="The wait is one part of a bigger journey. Explore how a customer’s choice becomes useful preparation, a human handoff and a record of what happened."
        image="folio"
      >
        <TextLink href="#explore" primary>
          Explore the journeys
        </TextLink>
        <TextLink href="/how-it-works">See the shared pattern</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="Inside a customer moment"
          title="From waiting to ready."
          body="These demonstrators make the journey tangible. They are independent concepts with visible limits, not claims of a client relationship or a live integration."
        />
        <article className="public-feature">
          <div className="public-feature-image">
            <Image
              src="/img/home/assembl-phone-journey-aperture.png"
              alt="Paper stages of a customer journey lead through a phone into a prepared folio."
              fill
              sizes="(max-width: 760px) 100vw, 45vw"
            />
          </div>
          <div>
            <p className="public-label">01 / Independent telecom concept</p>
            <h3>Make the connection count.</h3>
            <p>
              Explore the One NZ concept: a customer wait, optional
              participation and an evidence receipt that shows the steps.
            </p>
            <dl className="public-feature-rows">
              <div>
                <dt>The moment</dt>
                <dd>A customer is waiting for their mobile connection.</dd>
              </div>
              <div>
                <dt>The idea</dt>
                <dd>
                  Prepare the next step and make any proposed reward visible.
                </dd>
              </div>
              <div>
                <dt>The boundary</dt>
                <dd>
                  An independent assembl demonstrator. Not a current One NZ
                  offer.
                </dd>
              </div>
            </dl>
            <TextLink href="/journeys/one-nz" primary>
              Explore the One NZ concept
            </TextLink>
          </div>
        </article>
        <article className="public-feature">
          <div className="public-feature-image">
            <Image
              src="/brand/public-craft/receipt.webp"
              alt="An archival receipt, glass and rose metal frame."
              fill
              sizes="(max-width: 760px) 100vw, 45vw"
            />
          </div>
          <div>
            <p className="public-label">02 / Sample evidence</p>
            <h3>Leave a trail someone can read.</h3>
            <p>
              A sample receipt makes the permission, event and resulting status
              inspectable. The example uses simulated information.
            </p>
            <TextLink href="/journeys/evidence-receipt" primary>
              Inspect the sample receipt
            </TextLink>
          </div>
        </article>
      </section>
      <section className="public-section">
        <SectionHeading
          label="Reference journeys"
          title="The same care, in different moments."
          body="Use the sample journeys to explore the flow, then imagine one real wait in your organisation."
        />
        <DetailRows
          rows={journeys.map((journey, index) => ({
            n: String(index + 3).padStart(2, "0"),
            h: journey.name,
            p: journey.description,
            href: `/journeys/${journey.id}`,
          }))}
        />
        <PageNote>
          Reference journeys use fictional details and simulated actions. Each
          experience explains its own boundary.
        </PageNote>
        <div className="public-actions">
          <TextLink href="/concepts">Explore five industry moments</TextLink>
          <TextLink href="/pilots">Shape a pilot around your wait</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
