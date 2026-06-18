import type { Metadata } from 'next';
import styles from '../dash.module.css';

export const metadata: Metadata = {
  title: 'Dash by assembl — Terms of Service',
  description:
    'The terms that govern Dash by assembl, the NZ in-product ad network. Revenue split, advertising standards, governing law and liability.',
  alternates: { canonical: '/dash/terms' },
  robots: { index: true, follow: true },
};

export default function DashTermsPage() {
  return (
    <section className={styles.legal}>
      <h1 className={styles.legalTitle}>Terms of Service</h1>
      <p className={styles.legalMeta}>
        Dash by assembl · ASSEMBL NZ LIMITED · last updated 17 June 2026
      </p>

      <div className={styles.legalBody}>
        <p>
          These terms govern your use of <strong>Dash by assembl</strong> (&ldquo;Dash&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;), the New Zealand in-product advertising network
          operated by ASSEMBL NZ LIMITED, a company registered in Aotearoa New Zealand. Dash is an
          assembl venture. Its named, accountable owner is Kate Hudson, reachable at{' '}
          <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>.
        </p>
        <p>
          By installing the Dash SDK, running a Dash campaign, or otherwise using the network, you
          agree to these terms. If you are agreeing on behalf of an organisation, you confirm you
          have authority to bind that organisation.
        </p>

        <h2>1. What Dash does</h2>
        <p>
          Dash serves a single, calm line of sponsored New Zealand brand text inside the
          wait-states (&ldquo;thinking…&rdquo; or loading moments) of participating software. A
          second-price auction matches advertiser demand to publisher inventory. assembl operates
          the auction, the fraud checks and the payouts.
        </p>

        <h2>2. Publishers — the revenue split</h2>
        <p>
          If you install the SDK and serve Dash inventory, you are a publisher. The standard split
          is <strong>55% to the publisher and 45% to assembl</strong> of net advertising revenue
          attributable to your inventory. &ldquo;Net revenue&rdquo; means amounts actually received
          from advertisers for impressions served in your surfaces, less payment-processing fees,
          refunds, and amounts clawed back for invalid or fraudulent traffic.
        </p>
        <ul>
          <li>
            Our first three anchor publishers receive a <strong>60%</strong> share for the life of
            their participation, as a launch incentive. That uplift is confirmed in writing at
            onboarding.
          </li>
          <li>Publisher earnings are calculated monthly and paid monthly in arrears, in NZD.</li>
          <li>
            We may withhold or reverse amounts attributable to traffic our fraud checks flag as
            invalid. We will tell you when we do.
          </li>
        </ul>

        <h2>3. Advertisers</h2>
        <p>
          If you run a campaign, you are an advertiser. You set a bid and a budget; the auction is
          second-price, so you never pay more than one cent above the next-highest bid. You are
          responsible for the lawfulness, accuracy and rights-clearance of your creative.
        </p>

        <h2>4. Advertising standards</h2>
        <p>
          All Dash advertising must comply with the Advertising Standards Authority (NZ) codes,
          including the Advertising Standards Code, and with all applicable New Zealand law,
          including the Fair Trading Act 1986. Brand-safety controls are on by default: we do not
          carry gambling, alcohol or weapons inventory. We may decline or remove any creative at our
          discretion.
        </p>

        <h2>5. Acceptable use</h2>
        <ul>
          <li>Do not attempt to inflate, spoof or manufacture impressions or clicks.</li>
          <li>Do not reverse-engineer, resell or sublicense the SDK except as these terms allow.</li>
          <li>Do not place Dash inventory in unlawful, misleading or harmful surfaces.</li>
        </ul>

        <h2>6. Privacy</h2>
        <p>
          Dash is built to be Privacy Act 2020 native. The SDK never reads prompts, content, code,
          files or user data. How we handle the limited data we do process is set out in our{' '}
          <a href="/dash/privacy">Privacy Policy</a>, which forms part of these terms.
        </p>

        <h2>7. Liability</h2>
        <p>
          Nothing in these terms limits liability that cannot be limited by law, including under the
          Consumer Guarantees Act 1993 where it applies. Where you acquire Dash for the purposes of
          a business, you agree the Consumer Guarantees Act does not apply.
        </p>
        <p>
          Subject to the above, and to the maximum extent permitted by law:{' '}
          <strong>
            our total aggregate liability to you arising out of or in connection with Dash is capped
            at the total amounts paid to or by you through Dash in the three (3) months immediately
            before the event giving rise to the claim
          </strong>
          ; and neither party is liable for indirect, consequential, or loss-of-profit damages. Dash
          is provided &ldquo;as is&rdquo; while in pilot.
        </p>

        <h2>8. Term and changes</h2>
        <p>
          Either party may stop participating at any time on reasonable notice. Accrued payment
          obligations survive. We may update these terms; we will post the updated version here with
          a new &ldquo;last updated&rdquo; date and, for material changes, tell active participants.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of New Zealand. The New Zealand courts have
          non-exclusive jurisdiction over any dispute, and you submit to that jurisdiction.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms go to Kate Hudson at{' '}
          <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>.
        </p>

        <p className={styles.legalDraft}>
          These pages are a working draft prepared by assembl. They have not been reviewed by
          external counsel.
        </p>
      </div>
    </section>
  );
}
