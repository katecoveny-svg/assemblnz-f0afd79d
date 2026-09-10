import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import {
  CONCEPT_DEMOS,
  PROMOTION_TOOL_SLUGS,
  STATUS_LABELS,
  type ConceptDemo,
} from "@/lib/public-site";
import styles from "@/components/public/public-pages.module.css";
import { PageHero, PublicPage, TextLink } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Concept Studio — live demos and public experiments",
  description:
    "Try assembl products, public tools and labelled concept previews. Each card says what you can try today and where the boundary still sits.",
  alternates: { canonical: "/concept-studio" },
};

const promotable = PROMOTION_TOOL_SLUGS.map((slug) =>
  CONCEPT_DEMOS.find((demo) => demo.slug === slug),
).filter((demo): demo is ConceptDemo => Boolean(demo));

function DemoLink({
  demo,
  children,
}: {
  demo: ConceptDemo;
  children: React.ReactNode;
}) {
  if (demo.external) {
    return (
      <a
        href={demo.href}
        target="_blank"
        rel="noreferrer"
        className={styles.cardLink}
      >
        {children} <ArrowUpRight aria-hidden size={14} />
      </a>
    );
  }
  return (
    <Link href={demo.href} className={styles.cardLink}>
      {children} <ArrowUpRight aria-hidden size={14} />
    </Link>
  );
}

function DemoCard({ demo }: { demo: ConceptDemo }) {
  return (
    <article
      className={`${styles.demoCard} ${demo.featured ? styles.featured : ""}`}
    >
      <div className={styles.cardTop}>
        <span className={`${styles.status} ${styles[demo.status]}`}>
          {STATUS_LABELS[demo.status]}
        </span>
        <span className={styles.number}>
          {demo.external ? "↗" : "assembl"}
        </span>
      </div>
      <h3>{demo.title}</h3>
      <p className={styles.label}>{demo.label}</p>
      <p className={styles.summary}>{demo.summary}</p>
      <p className={styles.proof}>{demo.tryCopy}</p>
      <p className={styles.boundary}>{demo.boundary}</p>
      <div className={styles.cardActions}>
        <DemoLink demo={demo}>
          {demo.status === "concept" ? "Explore concept" : "Open demo"}
        </DemoLink>
      </div>
    </article>
  );
}

export default function ConceptStudioPage() {
  const live = CONCEPT_DEMOS.filter((demo) => demo.status === "live");
  const previews = CONCEPT_DEMOS.filter((demo) => demo.status === "preview");
  const concepts = CONCEPT_DEMOS.filter((demo) => demo.status === "concept");

  return (
    <PublicPage className={styles.page}>
      <PageHero
        eyebrow="Concept Studio"
        title="A little curiosity."
        accent="Something to try."
        body="Working tools, public experiments and early concepts. Each one says what you can try today and where the boundary sits."
        image="tiles"
      >
        <TextLink href="#explore" primary>
          Explore the studio
        </TextLink>
        <TextLink href="/genome">Open Business Genome</TextLink>
      </PageHero>

      <div className={styles.truthBar}>
        <div>
          <strong>{live.length} live experiences</strong>
          <span>Open and use them now.</span>
        </div>
        <div>
          <strong>{previews.length} previews</strong>
          <span>Useful, with visible production limits.</span>
        </div>
        <div>
          <strong>{concepts.length} concepts</strong>
          <span>
            Explore the direction — fictional or simulated on purpose.
          </span>
        </div>
      </div>

      <section id="explore" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>shareable tools</p>
            <h2>
              Small tools people can <em>use and share.</em>
            </h2>
          </div>
          <p>
            Best starting links for a prospect conversation. Each gives the
            visitor something of their own to keep or remix.
          </p>
        </div>
        <div className={styles.demoGrid}>
          {promotable.map((demo) => (
            <DemoCard key={demo.slug} demo={demo} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>working now</p>
            <h2>
              Live demos with a <em>clear result.</em>
            </h2>
          </div>
          <p>
            Use the tool, inspect the proof and share the output. Nothing
            auto-sends, auto-files or acts outside the page.
          </p>
        </div>
        <div className={styles.demoGrid}>
          {live.map((demo) => (
            <DemoCard key={demo.slug} demo={demo} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>still being proven</p>
            <h2>
              Previews and <em>concept products.</em>
            </h2>
          </div>
          <p>
            The useful idea is visible, along with the missing connection or
            approval step. That honesty is part of the product.
          </p>
        </div>
        <div className={styles.demoGrid}>
          {[...previews, ...concepts].map((demo) => (
            <DemoCard key={demo.slug} demo={demo} />
          ))}
        </div>
      </section>

      <div className={styles.darkWrap}>
        <section className={styles.darkSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>the rule</p>
              <h2>
                A demo should prove <em>one real job.</em>
              </h2>
            </div>
            <p>
              Not a feature tour. Not a promise that an integration exists. A
              visitor should understand the job, try it, receive a useful result
              and know what still needs human review.
            </p>
          </div>
          <div className={styles.stepGrid}>
            <article className={styles.stepCard}>
              <CheckCircle2 aria-hidden />
              <h3>Useful in a minute</h3>
              <p>
                Paste, choose, record or describe. The first useful action stays
                obvious.
              </p>
            </article>
            <article className={styles.stepCard}>
              <CheckCircle2 aria-hidden />
              <h3>Proof attached</h3>
              <p>
                Sources, assumptions, model mode and review boundary travel with
                the result.
              </p>
            </article>
            <article className={styles.stepCard}>
              <CheckCircle2 aria-hidden />
              <h3>Made to travel</h3>
              <p>
                A link, card, file or loop carries the assembl mark and a reason
                to pass it on.
              </p>
            </article>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
