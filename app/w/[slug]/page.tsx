import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { InstallPwaButton } from '@/components/hapai/InstallPwaButton';
import { ShareableToolActions } from '@/components/hapai/ShareableToolActions';
import { WorkflowRunner } from '@/components/site/WorkflowRunner';
import { getKete } from '@/lib/kete';
import { getWorkflow } from '@/lib/workflows';

type Params = { slug: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) return {};
  return {
    title: `${workflow.title} runner`,
    robots: { index: false, follow: false },
    manifest: `/w/${workflow.slug}/manifest.json`,
    appleWebApp: {
      capable: true,
      title: `${workflow.title} · assembl`,
      statusBarStyle: 'default',
    },
  };
}

export default async function StandaloneWorkflowPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();
  const kete = getKete(workflow.kete);

  return (
    <section className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FAF7F2_0%,#F5EEE5_48%,#FAF7F2_100%)] px-4 py-5 text-[color:var(--text-primary)] md:px-8 md:py-7">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-3xl font-normal lowercase leading-none text-[color:var(--text-primary)]"
        >
          assembl
        </Link>
        <Link
          href={`/workflows/${workflow.slug}`}
          className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          View workflow details <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>
      <main className="mx-auto mt-6 max-w-[1500px] md:mt-10">
        <section className="relative mb-6 overflow-hidden rounded-[24px] border border-white/70 bg-white/58 p-5 shadow-[0_30px_120px_rgba(35,33,31,0.10)] backdrop-blur md:mb-8 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_8%,rgba(217,168,90,0.20),transparent_28%),linear-gradient(135deg,rgba(43,107,87,0.08),transparent_42%)]" aria-hidden />
          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(420px,0.58fr)] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]">
                Shared workflow · {kete.englishName}
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.8rem,7vw,7.8rem)] font-light leading-[0.86] text-[#103F35]">
                {workflow.title}
              </h1>
              <p className="mt-5 max-w-3xl text-[clamp(1.05rem,1.45vw,1.35rem)] leading-relaxed text-[color:var(--text-body)]">
                {workflow.description}
              </p>
            </div>
            <div className="rounded-[18px] border border-white/80 bg-[#FAF7F2]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_22px_70px_rgba(35,33,31,0.08)] md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                Send this to another parent
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Opens directly to the live parser. Works on mobile camera upload, typed text, and supported browser speech capture.
              </p>
              <div className="mt-4">
                <ShareableToolActions
                  title={`${workflow.title} by assembl`}
                  text={workflow.description}
                  path={`/w/${workflow.slug}`}
                  embed={false}
                />
              </div>
              <div className="mt-4 border-t border-[rgba(35,33,31,0.08)] pt-4">
                <InstallPwaButton label="Save this tool" compact />
              </div>
            </div>
          </div>
        </section>

        <WorkflowRunner workflow={workflow} minimal />
      </main>
      <footer className="mx-auto mt-10 max-w-[1500px] border-t border-[rgba(35,33,31,0.10)] py-5 text-sm text-[color:var(--text-secondary)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Link href="/">Powered by assembl</Link>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <Link href="/privacy" className="hover:text-[color:var(--assembl-pounamu)]">
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal/terms" className="hover:text-[color:var(--assembl-pounamu)]">
              Terms
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal/disclaimer" className="hover:text-[color:var(--assembl-pounamu)]">
              Draft-only disclaimer
            </Link>
          </p>
        </div>
      </footer>
    </section>
  );
}
