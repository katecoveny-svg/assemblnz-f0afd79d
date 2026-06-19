import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import { ShaderHeroBackdrop } from "@/components/site/ShaderHeroBackdrop";
import { ManaTrustLayerDiagram } from "@/components/trust/ManaTrustLayerDiagram";
import { SecurityPackForm } from "@/components/trust/SecurityPackForm";
import {
  CHANGE_LOG,
  COMPLIANCE_POSTURE,
  DATA_CLASS_LABELS,
  LAST_UPDATED,
  POSTURE_LABELS,
  SUB_PROCESSORS,
  TRUST_CENTRE_VERSION,
  type PostureStatus,
} from "@/lib/trust-centre/sub-processors";

export const metadata: Metadata = {
  title: "Trust Centre | assembl",
  description:
    "Where your data lives, who can touch it, and what we can prove today — in plain English. Data in Sydney (an NZ option is coming), PII masked before any model call, and a receipt behind every output.",
  alternates: { canonical: "/trust" },
  robots: { index: true, follow: true },
};

const lastUpdatedLong = new Date(LAST_UPDATED).toLocaleDateString("en-NZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SECTION_INDEX = [
  { id: "architecture", label: "Architecture" },
  { id: "data-residency", label: "Data residency" },
  { id: "sub-processors", label: "Sub-processors" },
  { id: "compliance", label: "Compliance posture" },
  { id: "receipts", label: "Evidence packs" },
  { id: "encryption", label: "Encryption" },
  { id: "incident-response", label: "Incident response" },
  { id: "retention", label: "Deletion & retention" },
  { id: "access", label: "Access controls" },
  { id: "ai-governance", label: "AI governance" },
  { id: "change-log", label: "Change log" },
  { id: "request", label: "Request the pack" },
];

function LastUpdated() {
  return (
    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--assembl-sand)]">
      Last updated {lastUpdatedLong}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title: string;
  id: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-light leading-[1.05] text-[color:var(--text-primary)]"
      >
        {title}
      </h2>
      <LastUpdated />
    </div>
  );
}

const POSTURE_STYLES: Record<PostureStatus, string> = {
  live: "border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu-deep)]",
  "in-progress": "border-[color:var(--assembl-gold-thread)] bg-[#FBF3E2] text-[#8A6516]",
  planned: "border-[color:var(--assembl-cloud)] bg-white text-[color:var(--text-secondary)]",
};

function PostureBadge({ status }: { status: PostureStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${POSTURE_STYLES[status]}`}
    >
      {POSTURE_LABELS[status]}
    </span>
  );
}

const sectionClass = "border-t border-[color:var(--assembl-cloud)] py-16 md:py-20";

export default function TrustCentrePage() {
  return (
    <main className="bg-[color:var(--assembl-paper)]">
      {/* ── Headline panel ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_30%_22%,#f7f0e3_0%,#ece3d2_52%,#ddd2bd_100%)] pt-28 pb-12 md:pt-36 md:pb-16">
        <ShaderHeroBackdrop />
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl">
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Trust Centre · {TRUST_CENTRE_VERSION}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.1rem,6.2vw,5.25rem)] font-light leading-[0.98] text-[color:var(--text-primary)]">
              Sovereign by default. <em className="not-italic text-[color:var(--assembl-pounamu)]">Evidence-ready by design.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--text-secondary)]">
              This is the plain version — for the procurement officer who has read a hundred
              glossy compliance pages and just wants the facts. Where your data lives. Who can
              touch it. What we can prove today. How to get the full pack.
            </p>
            <LastUpdated />
          </SectionReveal>

          {/* Three counter-positioning points */}
          <SectionReveal delay={0.05}>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  head: "Your data stays close",
                  body: "Your data lives in Sydney today, not the US. An NZ-resident option is on the way. Only masked content ever reaches a model.",
                },
                {
                  head: "Models never see real names",
                  body: "We strip the personal details before any model call. The model reads masked text. The names stay with you.",
                },
                {
                  head: "Proof you can hand over",
                  body: "Every output ends in an evidence pack — a downloadable bundle of PDFs. Hand it to an auditor and they can check it themselves.",
                },
              ].map((item) => (
                <li
                  key={item.head}
                  className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5"
                >
                  <p className="font-display text-lg font-medium text-[color:var(--text-primary)]">
                    {item.head}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </SectionReveal>

          {/* Quick index — find anything in under 60 seconds */}
          <SectionReveal delay={0.1}>
            <nav aria-label="Trust Centre sections" className="mt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                On this page
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                {SECTION_INDEX.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="inline-flex rounded-full border border-[color:var(--assembl-cloud)] bg-white px-3.5 py-1.5 text-sm text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--assembl-paper)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </SectionReveal>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* ── Architecture summary ─────────────────────────────────────── */}
          <section id="architecture" aria-labelledby="architecture-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Architecture" title="The Mana Trust Layer" id="architecture" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Every output runs the same five steps: Kahu → Iho → Tā → Mahara → Mana. Kahu
                takes the request and masks the personal details first. Iho picks the right
                agent and model. Tā drafts the work with every source cited inline. Mahara is
                where someone in your team reads it and decides. Mana seals the receipt with
                their name on it. <strong className="font-medium text-[color:var(--text-primary)]">
                The personal details are masked before any model call</strong> — the model
                never sees a real name.
              </p>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5 md:p-8">
                <div className="min-w-[640px]">
                  <ManaTrustLayerDiagram />
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ── Data residency ───────────────────────────────────────────── */}
          <section id="data-residency" aria-labelledby="data-residency-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Where your data lives" title="Data residency" id="data-residency" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Your data lives in Sydney today. Not in the US. It is the closest major cloud
                region to Aotearoa, and an NZ-resident option is on the way — we are confirming
                the region with our infra team now. Models may sit offshore, but they only ever
                see masked content. Your raw data stays put.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]">
                    assembl
                  </p>
                  <p className="mt-3 font-display text-xl font-light text-[color:var(--text-primary)]">
                    Your data sits in Sydney, not the US.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    An NZ option is on the way. Everything is fenced to your tenant, and only
                    masked content ever reaches a model.
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                    The implicit alternative
                  </p>
                  <p className="mt-3 font-display text-xl font-light text-[color:var(--text-primary)]">
                    Routed offshore by default.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    Most AI tools ship your data to the US the moment you paste it. No regional
                    option. No masking. The model sees everything.
                  </p>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ── Sub-processor list ───────────────────────────────────────── */}
          <section id="sub-processors" aria-labelledby="sub-processors-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Who touches your data" title="Sub-processors" id="sub-processors" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Here is every company that can touch your data — where they sit, what they do,
                and the contract that binds them. We check this list every week. Every change
                shows up in the log below.
              </p>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--assembl-cloud)] bg-white">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    assembl sub-processors and their data-processing agreements
                  </caption>
                  <thead>
                    <tr className="border-b border-[color:var(--assembl-cloud)] text-[color:var(--text-secondary)]">
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Provider</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Location</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Purpose</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Data</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">DPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUB_PROCESSORS.map((p) => (
                      <tr key={p.name} className="border-b border-[color:var(--assembl-cloud)] last:border-0 align-top">
                        <th scope="row" className="px-4 py-4 font-medium text-[color:var(--text-primary)]">
                          {p.name}
                          {p.receivesMaskedPiiOnly ? (
                            <span className="mt-1 block font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--assembl-pounamu)]">
                              Masked content only
                            </span>
                          ) : null}
                        </th>
                        <td className="px-4 py-4 text-[color:var(--text-secondary)]">{p.country}</td>
                        <td className="px-4 py-4 text-[color:var(--text-secondary)]">{p.purpose}</td>
                        <td className="px-4 py-4 text-[color:var(--text-secondary)]">
                          {p.dataClasses.map((c) => DATA_CLASS_LABELS[c]).join(", ")}
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={p.dpaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-sm text-[color:var(--assembl-pounamu)] underline underline-offset-2 hover:text-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
                          >
                            View DPA
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionReveal>
          </section>

          {/* ── Compliance posture ───────────────────────────────────────── */}
          <section id="compliance" aria-labelledby="compliance-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="What we can prove today" title="Compliance posture" id="compliance" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                What is true today, not what we hope for. If a certification is not done, we
                say so. We would rather tell you we are on the way than pretend we have arrived.
              </p>
              <ul className="mt-8 space-y-4">
                {COMPLIANCE_POSTURE.map((item) => (
                  <li
                    key={item.framework}
                    className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5 md:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                        {item.framework}
                      </h3>
                      <PostureBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {item.detail}
                    </p>
                    {item.target ? (
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--assembl-sand)]">
                        {item.target}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Evidence packs / Mana Receipts ───────────────────────────── */}
          <section id="receipts" aria-labelledby="receipts-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Verifiable by anyone" title="Evidence packs" id="receipts" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Every output ends in an evidence pack — a downloadable bundle of PDFs. Sources,
                decisions, who signed off, and when. Show it to a regulator, an auditor, or a
                client, and they don&rsquo;t have to take your word for anything.
              </p>
              <p className="mt-4 text-base leading-7 text-[color:var(--text-secondary)]">
                Under the hood we call it a Mana Receipt. It&rsquo;s Ed25519-signed, so any
                tampering shows. Paste one into our public verifier and check it yourself.
              </p>
              <div className="mt-6">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--assembl-pounamu)] px-6 py-2.5 text-sm font-medium text-[color:var(--assembl-pounamu)] transition-colors hover:bg-[color:var(--assembl-pounamu)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--assembl-paper)]"
                >
                  Verify a receipt
                </Link>
              </div>
            </SectionReveal>
          </section>

          {/* ── Encryption posture ───────────────────────────────────────── */}
          <section id="encryption" aria-labelledby="encryption-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="How it's protected" title="Encryption" id="encryption" />
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { head: "At rest", body: "Stored data is encrypted with AES-256. A stolen disk reads as noise." },
                  { head: "In transit", body: "Every connection runs on TLS 1.3. Nothing travels in the clear." },
                  {
                    head: "Key management",
                    body: "Our infra providers hold the keys, kept apart from the data they unlock. The app code never sees them.",
                  },
                ].map((item) => (
                  <li key={item.head} className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      {item.head}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Incident response ────────────────────────────────────────── */}
          <section id="incident-response" aria-labelledby="incident-response-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="When something goes wrong" title="Incident response" id="incident-response" />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { head: "Detect", body: "Logs and audit trails flag access that looks wrong, fast." },
                  { head: "Contain", body: "We kill the affected access first, then map exactly how far it reached." },
                  { head: "Notify", body: "We tell you — and the Privacy Commissioner when the law says we must." },
                ].map((item) => (
                  <div key={item.head} className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      {item.head}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-2xl border border-[color:var(--assembl-gold-thread)] bg-[#FBF3E2] p-5 text-sm leading-6 text-[color:var(--text-primary)]">
                <strong className="font-medium">72 hours, not &ldquo;eventually.&rdquo;</strong>{" "}
                The Privacy Act 2020 asks for notice &ldquo;as soon as practicable.&rdquo; We
                hold ourselves tighter: you and the Privacy Commissioner hear from us within 72
                hours of us knowing.
              </p>
            </SectionReveal>
          </section>

          {/* ── Data deletion + retention ────────────────────────────────── */}
          <section id="retention" aria-labelledby="retention-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Your data, your terms" title="Deletion & retention" id="retention" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                You decide how long we keep things. By default, evidence packs stay as long as
                your contract needs — usually to match your own tax or audit rules. Ask us to
                delete your data and we do, unless a law makes us hold it.
              </p>
              <ul className="mt-6 space-y-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                <li>• <strong className="font-medium text-[color:var(--text-primary)]">By default:</strong> kept as long as your contract and record-keeping rules need.</li>
                <li>• <strong className="font-medium text-[color:var(--text-primary)]">Your call:</strong> dial the window up or down per workspace.</li>
                <li>• <strong className="font-medium text-[color:var(--text-primary)]">Deletion:</strong> ask, we remove it, then confirm it&rsquo;s gone.</li>
              </ul>
            </SectionReveal>
          </section>

          {/* ── Access controls ──────────────────────────────────────────── */}
          <section id="access" aria-labelledby="access-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Who can see what" title="Access controls" id="access" />
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { head: "Row-level security", body: "Every record is fenced to its tenant. One customer simply can't read another's." },
                  { head: "Role-based access", body: "Inside your workspace, people see what their role allows — and nothing past it." },
                  { head: "Founder allowlist", body: "The riskiest outputs wait behind a named person. Nothing sensitive ships without them." },
                ].map((item) => (
                  <li key={item.head} className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      {item.head}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── AI governance ────────────────────────────────────────────── */}
          <section id="ai-governance" aria-labelledby="ai-governance-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="How the agents are governed" title="AI governance" id="ai-governance" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                The agents draft. People decide. Te Tiriti commitments and tikanga values shape
                how we build them and how they handle your data.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Draft-only. No agent sends, posts, or files anything on its own.",
                  "A named person reads every draft and accepts, edits, or bins it.",
                  "Nothing leaves your workspace until someone signs it off.",
                  "Your data never trains a public model. Ever.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-base leading-7 text-[color:var(--text-secondary)]">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--assembl-pounamu)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Sub-processor change log ─────────────────────────────────── */}
          <section id="change-log" aria-labelledby="change-log-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Last 12 months" title="Change log" id="change-log" />
              <ul className="mt-8 space-y-3">
                {CHANGE_LOG.map((entry) => (
                  <li
                    key={`${entry.date}-${entry.summary}`}
                    className="flex flex-col gap-1 rounded-xl border border-[color:var(--assembl-cloud)] bg-white p-4 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)]">
                      {new Date(entry.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-sm leading-6 text-[color:var(--text-secondary)]">{entry.summary}</span>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Security pack request form ───────────────────────────────── */}
          <section id="request" aria-labelledby="request-heading" className={`${sectionClass} pb-24 md:pb-32`}>
            <SectionReveal>
              <SectionHeading eyebrow="Get the full pack" title="Request the security pack" id="request" />
              <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--text-secondary)]">
                Running a vendor review? Tell us who you are and what you need. Our security team
                replies straight from security@assembl.co.nz.
              </p>
              <div className="mt-8 rounded-3xl border border-[color:var(--assembl-cloud)] bg-white p-6 md:p-8">
                <SecurityPackForm />
              </div>
              <p className="mt-8 text-sm leading-6 text-[color:var(--text-secondary)]">
                Kate Hudson, our founder, reads and signs off this page herself. See something
                that&rsquo;s not right? Email{" "}
                <a
                  href="mailto:security@assembl.co.nz"
                  className="rounded-sm text-[color:var(--assembl-pounamu)] underline underline-offset-2 hover:text-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
                >
                  security@assembl.co.nz
                </a>
                .
              </p>
            </SectionReveal>
          </section>
        </div>
      </div>
    </main>
  );
}
