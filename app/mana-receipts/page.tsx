import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './mana-receipts.module.css';
import { ReceiptMock } from './ReceiptMock';
import { HERO_RECEIPT } from './receipt-data';

export const metadata: Metadata = {
  title: 'Mana Receipts — the honest trust page | assembl',
  description:
    'A Mana Receipt is the legible record of one thing assembl did. Where your data lives (Sydney, Supabase, AWS ap-southeast-2), how the human loop works, and the Privacy Act 2020 + IPP 3A posture — in plain English. Aligned, not certified: we tell you what we are and what we are not.',
  alternates: { canonical: '/mana-receipts' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Mana Receipts — the honest trust page',
    description:
      'The receipt is the proof. Every run gets one. Where your data lives, how the human loop works, and the honest list of what assembl is and is not.',
    url: 'https://www.assembl.co.nz/mana-receipts',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mana Receipts — the honest trust page',
    description: 'The receipt is the proof. Every run gets one.',
  },
};

export default function ManaReceiptsPage() {
  return (
    <main className={styles.root}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className={styles.heroDash} aria-hidden />
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>004 — Trust · Kaitiakitanga · Mana Receipts</p>
          <h1 className={styles.h1}>
            The receipt is the proof.
            <em>Every run gets one.</em>
          </h1>
          <p className={styles.sub}>
            A Mana Receipt is the legible record of one thing assembl did. It says which agent ran.
            What it read. What it cited. What was checked. What still needs a human. You can download
            it. You can show it to your auditor. You can show it to yourself in six months when you
            want to remember what you decided.
          </p>
          <Link href="/mana-receipts/sample" className={styles.pill}>
            See a sample receipt →
          </Link>
        </div>
      </section>

      {/* ── Receipt preview mock ─────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.receiptCaption}>A Mana Receipt — downloadable as a signed audit pack</p>
          <ReceiptMock receipt={HERO_RECEIPT} />
          <p className={styles.crossLink} style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/mana-receipts/sample">See the full sample — download it as JSON or PDF →</Link>
          </p>
        </div>
      </section>

      {/* ── 1 · Where your data lives ────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>001 — Data residency</p>
          <h2 className={styles.sectionH}>Where your data lives</h2>
          <p className={styles.p}>
            Your data lives in Sydney, on Supabase, in the AWS ap-southeast-2 region. The project
            reference is <code className={styles.inlineCode}>wurwcrgxjjwqdaxqceey</code>. That is the
            same number we put on every Mana Receipt, so a curious auditor can match the receipt to
            the database that wrote it.
          </p>
          <p className={styles.p}>
            We chose Sydney for one reason. It is the closest data centre to Aotearoa that meets the
            residency expectations under the Privacy Act 2020 and the Information Privacy Principles,
            including the cross-border rule under IPP 12. Hosting inside Aotearoa is what we will move
            to once Supabase or an equivalent provider runs an Auckland or Wellington region — until
            then, Sydney is the honest answer.
          </p>
          <p className={styles.p}>Three rules apply to your data while it sits there.</p>
          <p className={styles.p}>
            <strong>One.</strong> We do not sell it. We do not share it with advertisers. We do not
            use your runs to train third-party models. The agents that work on your behalf read the
            model provider’s API directly (Anthropic, Google, OpenAI) under contracts that exclude
            your data from training. The Mana Receipt records which provider was called, when, and
            what the request shape was — so you can audit that claim, not just take our word.
          </p>
          <p className={styles.p}>
            <strong>Two.</strong> We hold it for as long as it is useful, then we delete it.
          </p>
          <div className={styles.callout}>
            <p>
              <strong>Retention windows.</strong> Working data — 12 months from last use. Mana
              Receipts — 7 years (matches IRD record-keeping). Voice call recordings — 30 days, kept
              only for safety and abuse review. Public demo runs — 7 days, no email, IP only. You can
              request earlier deletion at any time. We will run it within 20 working days, which is
              the Privacy Act response window.
            </p>
          </div>
          <p className={styles.p}>
            <strong>Three.</strong> Encryption at rest and in transit. AES-256 on disk, TLS 1.3 on
            the wire. Standard, not novel — that is the point. Novel cryptography is a warning sign,
            not a feature.
          </p>
          <p className={styles.crossLink}>
            For the full sub-processor list, encryption detail and the enterprise security pack, see
            the <Link href="/trust">Trust Centre</Link>.
          </p>
        </div>
      </section>

      {/* ── 2 · How the human loop catches the AI ────────────────────── */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>002 — Human-in-the-loop</p>
          <h2 className={styles.sectionH}>How the human loop catches the AI</h2>
          <p className={styles.lead}>
            A Mana Receipt is not the same thing as a guarantee. The agent can be wrong. We are not
            pretending otherwise.
          </p>
          <p className={styles.p}>
            The reason a Receipt exists is because of how we catch the wrong. Every output that
            touches a regulated surface — medical advice, legal advice, employment law, financial
            advice, child safety, health and safety — runs through a human review layer before it
            leaves the agent.
          </p>
          <p className={styles.p}>Three review tiers, depending on what is at stake.</p>

          <div className={styles.tier}>
            <p className={styles.tierHead}>Tier one — light review.</p>
            <p className={styles.p}>
              The agent flags the output as “draft only” and the user is told, clearly, that a
              registered practitioner needs to sign off before it counts. This is what runs on
              Practice (the clinical bundle) and Counsel (the legal bundle) for every routine output.
              The Receipt records that the flag was raised, that the practitioner-review stamp was
              applied, and that the output was never delivered as final.
            </p>
          </div>

          <div className={styles.tier}>
            <p className={styles.tierHead}>Tier two — kaitiaki review.</p>
            <p className={styles.p}>
              Where the output touches tikanga, Te Tiriti, or mana whenua subject matter, the work
              goes through a kaitiaki review by a kaumātua-validated reviewer before the user sees it.
              This runs on Counsel-Te Tiriti, on Hearth’s marae-adjacent flows, and on any agent
              output that references kaitiakitanga, Whakaaē consents involving mana whenua, or
              rangatiratanga. The Receipt names the reviewer (with consent), the date, and the calls
              made.
            </p>
          </div>

          <div className={styles.tier}>
            <p className={styles.tierHead}>Tier three — full review.</p>
            <p className={styles.p}>
              For outputs going into a regulator’s process — a WorkSafe notification, an Inland
              Revenue objection, a Disputes Tribunal claim, an Immigration NZ appeal — the agent
              produces a draft only, and a registered human (LBP, lawyer, immigration adviser,
              accountant) signs it before it is filed. The agent never files for you. The Receipt
              records who reviewed, when, what they changed.
            </p>
          </div>

          <p className={styles.p}>
            Across all three tiers, the agent never pretends to be the human. The receipt is the line
            between the two.
          </p>
        </div>
      </section>

      {/* ── 3 · Privacy Act 2020 and IPP 3A ──────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>003 — IPP 3A · From 1 May 2026</p>
          <h2 className={styles.sectionH}>Privacy Act 2020 and IPP 3A — what it means for you</h2>
          <p className={styles.p}>
            The Privacy Act 2020 governs how every NZ business handles personal information. The
            thirteen Information Privacy Principles set out the rules. Most of them are unchanged from
            the 1993 Act. One is new.
          </p>
          <p className={styles.p}>
            <strong>IPP 3A came into force on 1 May 2026.</strong> It says that when a business
            collects personal information indirectly — meaning, not from the person it relates to —
            that business must usually notify the person at or before the time of collection. There
            are exceptions (publicly available information, exemptions where notification is
            impractical or where another lawful basis applies), but the default is: notify.
          </p>
          <p className={styles.p}>What this means for assembl, in plain language:</p>
          <p className={styles.p}>
            If you use one of our agents to read someone else’s personal information — a school notice
            that names a child, an invoice that names a customer, a clinical note about a patient, an
            HR file about an employee — the agent treats that data with IPP 3A in mind. Where the law
            requires you to notify the person, the agent flags it on the Mana Receipt: “this output
            contains personal information about someone other than the user. IPP 3A may apply.
            Consider whether notification is required before acting.”
          </p>
          <p className={styles.p}>
            We do not file the notification for you. That is your obligation as the data controller.
            The agent’s job is to make the obligation visible at the moment you might forget it.
          </p>
          <p className={styles.p}>
            The Privacy Commissioner has full guidance at{' '}
            <a href="https://privacy.org.nz" target="_blank" rel="noopener noreferrer">
              privacy.org.nz
            </a>
            . If you would rather talk to a person, their enquiry line is 0800 803 909.
          </p>
        </div>
      </section>

      {/* ── 4 · What we are. What we are not. ────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>004 — Straight answers</p>
          <h2 className={styles.sectionH}>What we are. What we are not.</h2>
          <p className={styles.p}>
            We promise this page never overpromises. The point of a trust page is to be the place a
            careful buyer can read everything in one go and decide. Here is the list.
          </p>

          <div className={styles.split}>
            <div className={styles.listCard}>
              <p className={styles.listCardTitle}>What we are</p>
              <ul className={styles.list}>
                <li>Aligned with the Privacy Act 2020, including IPP 3A from 1 May 2026.</li>
                <li>
                  Hosted in Sydney (AWS ap-southeast-2) via Supabase. Project ref{' '}
                  <code className={styles.inlineCode}>wurwcrgxjjwqdaxqceey</code>. Sydney chosen for
                  proximity to Aotearoa and Privacy Act compatibility.
                </li>
                <li>Encryption at rest (AES-256) and in transit (TLS 1.3).</li>
                <li>Human-in-the-loop reviewed on every regulated output (three tiers — see §2).</li>
                <li>
                  Tikanga gate on every output (Mead’s five tests run silently by our Kahu compliance
                  layer — Tika, Pono, Aroha, Tikanga, Mana).
                </li>
                <li>
                  Built in Aotearoa, by a small team based here. Not a reseller of an overseas
                  product.
                </li>
              </ul>
            </div>

            <div className={styles.listCard}>
              <p className={styles.listCardTitle}>What we are not (yet, or by design)</p>
              <ul className={`${styles.list} ${styles.listNot}`}>
                <li>
                  Not SOC 2 certified. We will pursue SOC 2 Type II when our enterprise pipeline
                  justifies the audit cost. Until then, we tell you so.
                </li>
                <li>Not ISO 27001 certified. Same reasoning.</li>
                <li>
                  Not HIPAA certified. HIPAA is a US framework — we run under the NZ Health
                  Information Privacy Code 2020 instead, which is the right one for NZ clinicians.
                </li>
                <li>
                  Not a substitute for a registered professional. Every clinical, legal, financial or
                  regulatory output is a draft for a human to review. We are emphatic about this.
                </li>
                <li>
                  Not training a foundation model on your data. We use Anthropic, Google, and OpenAI
                  APIs under contracts that exclude your data from training. The Mana Receipt records
                  the call.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 · Built in Aotearoa ────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>005 — Kaitiakitanga · Whakapapa</p>
          <h2 className={styles.sectionH}>Built in Aotearoa</h2>
          <p className={styles.p}>
            assembl was built in Aotearoa, by a small team here. We are a New Zealand company. Our
            agents are designed around Aotearoa’s regulatory shape — not adapted from a US product
            after the fact. The te reo Māori names on some agents are not decoration. They are
            signals that the agent was designed with tikanga in mind from the first line of code.
          </p>
          <p className={styles.p}>
            The Mana Receipt name is not borrowed marketing. Mana is the standing of a thing — its
            weight, its credibility, what it carries. A receipt that carries mana is one that an
            auditor, a kaumātua, a regulator or a customer can read and trust. That is what we are
            building toward. The standard is not “the AI got it right.” The standard is “you can show
            the receipt to anyone who needs to see it, and the answer holds.”
          </p>
          <p className={styles.p}>
            If you would like to talk to us about any of this — what we do with your data, how the
            review layer works, why we chose Sydney, what we are doing about SOC 2 — write to us at{' '}
            <a href="mailto:trust@assembl.co.nz">trust@assembl.co.nz</a>. A real person reads that
            inbox.
          </p>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className={styles.closing}>
        <div className={styles.wrap}>
          <Link href="/mana-receipts/sample" className={`${styles.pill} ${styles.pillSolid}`}>
            See your data on a receipt →
          </Link>
          <p className={styles.closingCaption}>Quiet intelligence · Woven · Built in Aotearoa</p>
        </div>
      </section>

      {/* ── Footer eyebrow ───────────────────────────────────────────── */}
      <div className={styles.footerEyebrow}>
        <span>Last reviewed 2026-06-29 · Next review 2026-09-29 · Kaitiaki: assembl Trust Kaupapa</span>
      </div>
    </main>
  );
}
