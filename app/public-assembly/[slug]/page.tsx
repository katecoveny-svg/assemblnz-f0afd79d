import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionReveal } from "@/components/SectionReveal";
import {
  getPublicAssemblyPreview,
  isPublicAssemblyDemoEnabled,
} from "@/lib/government/public-assembly-previews";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preview = getPublicAssemblyPreview(slug);
  return {
    title: preview ? `${preview.name} preview | Public Assembly` : "Public Assembly preview",
    description: preview?.oneLiner,
  };
}

export default async function PublicAssemblyPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isPublicAssemblyDemoEnabled()) notFound();

  const { slug } = await params;
  const preview = getPublicAssemblyPreview(slug);
  if (!preview) notFound();

  return (
    <main className="bg-[color:var(--assembl-paper)]">
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <SectionReveal>
            <div className="border-l-2 border-[color:var(--assembl-amber,#D9A85A)] bg-[rgba(217,168,90,0.14)] p-5 text-sm leading-7 text-[color:var(--text-primary)]">
              <strong>Pre-incorporation preview only.</strong> Public Assembly is
              not yet a public product surface. These navigator pages stay behind a
              feature flag until the Māori-elder and iwi sponsorship conversation
              has happened.
            </div>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <p className="mt-12 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Public Assembly · {preview.subtitle}
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] text-[color:var(--text-primary)]">
              {preview.name}.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              {preview.oneLiner}
            </p>
          </SectionReveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionReveal delay={0.15}>
              <section className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6">
                <h2 className="font-display text-2xl font-light">Statutory basis</h2>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                  {preview.statutoryBasis.map((item) => (
                    <li key={item} className="border-t border-[rgba(157,140,125,0.16)] pt-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <section className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6">
                <h2 className="font-display text-2xl font-light">Sample evidence pack</h2>
                <pre className="mt-4 max-h-[360px] overflow-auto bg-[rgba(61,66,80,0.05)] p-4 font-mono text-xs leading-6 text-[color:var(--text-primary)]">
                  {JSON.stringify(preview.sampleEvidencePack, null, 2)}
                </pre>
              </section>
            </SectionReveal>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <SectionReveal delay={0.25}>
              <section className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6">
                <h2 className="font-display text-2xl font-light">Tools declared</h2>
                <ul className="mt-4 space-y-3 font-mono text-xs uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                  {preview.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </section>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <section className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6">
                <h2 className="font-display text-2xl font-light">Procurement questions</h2>
                <div className="mt-4 space-y-5 text-sm leading-7 text-[color:var(--text-secondary)]">
                  {preview.procurementFaq.map((item) => (
                    <div key={item.q}>
                      <h3 className="font-medium text-[color:var(--text-primary)]">{item.q}</h3>
                      <p className="mt-1">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            </SectionReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
