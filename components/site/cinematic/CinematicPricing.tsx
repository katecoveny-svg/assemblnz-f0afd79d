import { PilotSprintCheckout } from "@/components/billing/PilotSprintCheckout";
import {
  PRICE_INSTALL,
  PRICE_INSTALL_SUFFIX,
  PRICE_OUTCOME,
  PRICE_RUNNING,
  PRICE_RUNNING_SUFFIX,
  PRICE_TEAM,
  PRICE_TEAM_SUFFIX,
  PRICING_NOTE,
} from "@/lib/registry/pricing";
import {
  DetailRows,
  PageHero,
  PageNote,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

export function CinematicPricing({
  checkoutConfigured,
}: {
  checkoutConfigured: boolean;
}) {
  return (
    <PublicPage>
      <PageHero
        eyebrow="Pricing"
        title="Start with one"
        accent="useful thing."
        body="One real job, a defined review boundary and a customer journey you can inspect. Begin small, then decide what deserves to grow."
        image="tiles"
      >
        <TextLink href="#explore" primary>
          Explore the offer
        </TextLink>
        <TextLink href="/contact">Talk through the scope</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="The starting point"
          title="Make it work. Keep it useful."
          body="The install covers one agreed job. We confirm the workflow, the review owner and any connections needed before work begins."
        />
        <div className="public-price-grid">
          <article className="public-price-card featured">
            <p className="public-label">01 / The install</p>
            <h3>One journey, brought together.</h3>
            <p className="public-price-amount">{PRICE_INSTALL}</p>
            <div className="public-price-suffix">{PRICE_INSTALL_SUFFIX}</div>
            <p>
              Two weeks to document the work, build one supervised agent and
              test one customer journey.
            </p>
            <ul>
              <li>A written business record you can read and change</li>
              <li>One agent preparing one agreed task</li>
              <li>A customer journey with visible review and handoff</li>
              <li>First month of running included</li>
            </ul>
            <TextLink href="/contact" primary>
              Discuss your install
            </TextLink>
          </article>
          <article className="public-price-card">
            <p className="public-label">02 / Keep it running</p>
            <h3>Care after the launch.</h3>
            <p className="public-price-amount">{PRICE_RUNNING}</p>
            <div className="public-price-suffix">{PRICE_RUNNING_SUFFIX}</div>
            <p>
              Keep the agreed journey hosted, maintained and checked when the
              information behind it changes.
            </p>
            <ul>
              <li>Hosting and running costs</li>
              <li>Your written business record kept current</li>
              <li>The agent checked against the updated record</li>
              <li>Cancel any time; keep your written record</li>
            </ul>
            <TextLink href="/contact">Talk about ongoing care</TextLink>
          </article>
        </div>
        <PageNote>
          {PRICING_NOTE} Hosting, data handling and integration requirements are
          confirmed for the agreed scope.
        </PageNote>
        <details className="public-checkout">
          <summary>Already agreed the scope? Open the install checkout</summary>
          <div className="public-form public-form-panel">
            <PilotSprintCheckout configured={checkoutConfigured} />
          </div>
        </details>
      </section>
      <section className="public-section">
        <SectionHeading
          label="As the work grows"
          title="Add what earns its place."
          body="A second agent should have a clear job. A larger engagement should have an agreed result and a way to test it."
        />
        <div className="public-price-grid">
          <article className="public-price-card">
            <p className="public-label">03 / Team</p>
            <h3>A few specialists, one journey.</h3>
            <p className="public-price-amount">{PRICE_TEAM}</p>
            <div className="public-price-suffix">{PRICE_TEAM_SUFFIX}</div>
            <ul>
              <li>Everything in keep it running</li>
              <li>Several agents, each with written limits</li>
              <li>One complete customer journey</li>
              <li>Shared drafts your team can inspect</li>
            </ul>
            <TextLink href="/contact">Discuss a team</TextLink>
          </article>
          <article className="public-price-card">
            <p className="public-label">04 / Outcome</p>
            <h3>A larger piece of work.</h3>
            <p className="public-price-amount">{PRICE_OUTCOME}</p>
            <p>
              For work that spans more than one journey. Scope and price are
              agreed around the work to be delivered.
            </p>
            <ul>
              <li>A defined result and review owner</li>
              <li>A scorecard agreed before we start</li>
              <li>A clear point to continue, change or stop</li>
            </ul>
            <TextLink href="/contact">Discuss the outcome</TextLink>
          </article>
        </div>
      </section>
      <section className="public-section">
        <SectionHeading
          label="The two weeks"
          title="A clear shape to the work."
        />
        <DetailRows
          rows={[
            {
              n: "01",
              h: "Write it down.",
              p: "In week one, we capture the business context, the customer moment and the limits. We build the agent around that record.",
            },
            {
              n: "02",
              h: "Try it together.",
              p: "In week two, we test the agreed job with your team, inspect the drafts and fix what is unclear. Any live connection needs its own agreed permission path.",
            },
            {
              n: "03",
              h: "Review the evidence.",
              p: "Look at the work prepared and the measures agreed at the start. Decide what is useful enough to keep running.",
            },
          ]}
        />
        <div className="public-actions">
          <TextLink href="/concept-studio">Try the public tools first</TextLink>
          <TextLink href="/trust">Trust and data details</TextLink>
        </div>
      </section>
    </PublicPage>
  );
}
