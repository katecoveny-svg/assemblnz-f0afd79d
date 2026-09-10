import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { PageHero, PublicPage, TextLink } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Contact · assembl",
  description:
    "Tell Kate about one customer wait, repeated task or handoff you would like to improve.",
  alternates: { canonical: "/contact" },
};
export default function ContactPage() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="A useful conversation"
        title="What’s waiting"
        accent="to come together?"
        body="Tell us about one customer wait, repeated task or handoff. We’ll work out whether assembl fits and what a useful first step could look like."
        image="folio"
        compact
      >
        <TextLink href="#explore" primary>
          Tell us about the work
        </TextLink>
        <TextLink href="mailto:assembl@assembl.co.nz">Email Kate</TextLink>
      </PageHero>
      <section id="explore" className="public-section public-contact-grid">
        <div className="public-form">
          <ContactForm />
        </div>
        <aside className="public-contact-aside">
          <p className="public-label">Start with the moment</p>
          <h2>One clear job is plenty.</h2>
          <p>
            What is the customer waiting for? What could help them prepare? Who
            on your team owns the next step?
          </p>
          <p>
            A short description is enough to begin. Please leave sensitive
            customer information out of this first message.
          </p>
          <dl>
            <div>
              <dt>Your contact</dt>
              <dd>
                Kate · assembl
                <br />
                <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>
              </dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>Aotearoa New Zealand</dd>
            </div>
            <div>
              <dt>What happens next</dt>
              <dd>
                We read your enquiry and discuss the fit, scope and next step
                with you.
              </dd>
            </div>
          </dl>
          <TextLink href="/trust">Read the trust details</TextLink>
        </aside>
      </section>
    </PublicPage>
  );
}
