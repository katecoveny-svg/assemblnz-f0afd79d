import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSparkToolBySlug } from '@/lib/spark/store';
import styles from '../../spark.module.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getSparkToolBySlug(slug);
  if (!tool) return { title: 'Tool not found · SPARK' };
  const desc = `${tool.summary} Built with SPARK on assembl.co.nz.`;
  return {
    title: `${tool.title} · built with SPARK`,
    description: desc,
    openGraph: {
      title: `${tool.title} — built with SPARK`,
      description: desc,
      url: `https://assembl.co.nz/spark/tool/${slug}`,
      siteName: 'assembl',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${tool.title} — built with SPARK`, description: desc },
  };
}

export default async function SparkToolPage({ params }: Params) {
  const { slug } = await params;
  const tool = await getSparkToolBySlug(slug);
  if (!tool) notFound();

  return (
    <main className={styles.surface}>
      <div className={styles.wordmarkTop}>
        <span className={styles.dot} aria-hidden />
        SPARK
      </div>

      <section className={styles.preview} style={{ marginTop: '0.5rem' }}>
        <div className={styles.previewCard}>
          <div className={styles.previewHead}>
            <div>
              <div className={styles.previewTitle}>{tool.title}</div>
              <div className={styles.previewSummary}>{tool.summary}</div>
            </div>
            <span className={styles.draftBadge}>
              {tool.status === 'approved' ? 'Built with SPARK' : 'Draft preview · in review'}
            </span>
          </div>
          <iframe
            className={styles.frame}
            title={tool.title}
            srcDoc={tool.html}
            sandbox="allow-scripts allow-forms"
          />
          <p className={styles.reassureLine}>
            <b>A tool built with SPARK</b> from a plain-English description. The owner sets the rates and terms,
            checks it&rsquo;s right, and runs it.
          </p>
        </div>
      </section>

      <section className={styles.promise} style={{ marginTop: '2.5rem' }}>
        <h2 className={styles.promiseTitle}>Build your own</h2>
        <p className={styles.promiseBody}>
          Got a &ldquo;we should build a tool for that&rdquo; on your list? Describe it in plain English and SPARK
          builds it in seconds.
        </p>
        <p style={{ marginTop: '1.2rem' }}>
          <Link href="/spark" className={styles.build} style={{ textDecoration: 'none', display: 'inline-block' }}>
            Build your own with SPARK →
          </Link>
        </p>
      </section>

      <footer className={styles.footerStrip}>
        <div className={styles.assemblMark}>
          <span className={styles.dot} aria-hidden />
          part of assembl
        </div>
        <div style={{ marginTop: '0.4rem' }}>Kate Hudson · assembl.co.nz</div>
      </footer>
    </main>
  );
}
