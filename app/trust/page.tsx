import type { Metadata } from "next";
import { SecurityPackForm } from "@/components/trust/SecurityPackForm";
import {
  DetailRows,
  PageHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Trust · assembl",
  description:
    "Permissions, sources, human review and evidence. Read the boundaries and the current security posture.",
  alternates: { canonical: "/trust" },
};
export default function TrustPage() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="Trust & evidence"
        title="Good work"
        accent="leaves a trace."
        body="Understand what was used, what was prepared, what needs a person and what happened next. The record should make the work easier to inspect."
        image="receipt"
      >
        <TextLink href="#explore" primary>
          Look inside the record
        </TextLink>
        <TextLink href="/mana-receipts/sample">View a sample receipt</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label="The evidence"
          title="Keep the important pieces."
          body="The evidence record connects the customer’s permission with the prepared work and the agreed handoff. A sample shows the shape; the scope is confirmed for each journey."
        />
        <div className="public-proof-grid">
          <article>
            <span className="public-label">01 / Permission</span>
            <h3>What the customer chose.</h3>
            <p>
              The information they allowed, the purpose and the limits.
              Preparing, saving and sharing are separate choices.
            </p>
          </article>
          <article>
            <span className="public-label">02 / Preparation</span>
            <h3>What the agent used.</h3>
            <p>
              Sources, assumptions and the resulting draft. Missing information
              should remain visible for the reviewer.
            </p>
          </article>
          <article>
            <span className="public-label">03 / Accountability</span>
            <h3>Who owns the next step.</h3>
            <p>
              The customer’s changes, the agreed review and the resulting
              handoff. A person remains responsible for consequential decisions.
            </p>
          </article>
        </div>
        <div className="public-actions">
          <TextLink href="/mana-receipts">Read about Mana Receipts</TextLink>
          <TextLink href="/evidence-pack">Explore the evidence pack</TextLink>
        </div>
      </section>
      <section className="public-section">
        <SectionHeading
          label="Where the information comes from"
          title="Make the source clear."
          body="A public source, a maintained playbook and a customer’s own information carry different weight. The journey should make that distinction visible."
        />
        <DetailRows
          rows={[
            {
              n: "A",
              h: "Primary sources.",
              p: "Official publications and first-party information relevant to the task. A dated source helps a reviewer judge how current an answer is.",
            },
            {
              n: "B",
              h: "Knowledge and guidance.",
              p: "Sector material and approved playbooks. Their source, version and limits should be visible alongside the draft.",
            },
            {
              n: "C",
              h: "Permitted workspace data.",
              p: "Information the customer or organisation has agreed to use. Demonstration data is labelled separately from real customer information.",
            },
          ]}
        />
      </section>
      <section className="public-section">
        <SectionHeading
          label="Before a live pilot"
          title="Agree the boundary."
          body="A demonstrator is a way to inspect the idea. A live pilot also needs the right data, security, accessibility and operational checks for its scope."
        />
        <div className="public-faq">
          <details>
            <summary>Hosting and data handling</summary>
            <div>
              <p>
                Confirm the hosting region, retention, access and service
                providers for the proposed journey before sharing live customer
                information. The detailed posture and privacy pages describe the
                current approach.
              </p>
              <TextLink href="/legal/privacy">Read the privacy policy</TextLink>
            </div>
          </details>
          <details>
            <summary>Security and certification</summary>
            <div>
              <p>
                assembl does not claim SOC 2 or ISO 27001 certification. Teams
                assessing a pilot can review the current posture and request the
                supporting material.
              </p>
              <TextLink href="/trust/soc2">
                Read the current security posture
              </TextLink>
            </div>
          </details>
          <details>
            <summary>Human review and escalation</summary>
            <div>
              <p>
                Agree who reviews the prepared work, which actions are allowed
                and how a customer reaches a person. A live connection is tested
                against that specific boundary before use.
              </p>
              <TextLink href="/how-it-works">See the review steps</TextLink>
            </div>
          </details>
          <details>
            <summary>Commitments in Aotearoa</summary>
            <div>
              <p>
                The Te Tiriti statement describes assembl’s commitments and the
                work behind them.
              </p>
              <TextLink href="/te-tiriti">Read the statement</TextLink>
            </div>
          </details>
        </div>
      </section>
      <section className="public-section public-contact-grid">
        <div>
          <SectionHeading
            label="For your review"
            title="Request the security pack."
          />
          <p className="public-lede">
            Architecture, data flows, service providers and current posture for
            teams assessing a proposed engagement.
          </p>
        </div>
        <div className="public-form public-form-panel">
          <SecurityPackForm />
        </div>
      </section>
    </PublicPage>
  );
}
