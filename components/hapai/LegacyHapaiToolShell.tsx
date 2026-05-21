import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareableToolActions } from "@/components/hapai/ShareableToolActions";

type LegacyHapaiToolShellProps = {
  title: string;
  kicker: string;
  description: string;
  posture: string;
  path: string;
  legacyPath: string;
};

export function LegacyHapaiToolShell({
  title,
  kicker,
  description,
  posture,
  path,
  legacyPath,
}: LegacyHapaiToolShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_50%_0%,rgba(43,107,87,0.16),transparent_62%)]" />
      <div className="relative mx-auto max-w-[1680px] px-5 py-9 md:px-10 md:py-12">
        <Link
          href="/hapai"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--assembl-pounamu)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          hapai library
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,0.22fr)] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              {kicker}
            </p>
            <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.1rem,7vw,6.6rem)] font-light italic leading-[0.92]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              {description}
            </p>
          </div>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/70 p-5 shadow-[0_18px_56px_rgba(35,33,31,0.08)] backdrop-blur">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
              draft-only posture
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
              {posture}
            </p>
            <div className="mt-5">
              <ShareableToolActions
                title={`${title} — assembl`}
                text={description}
                path={path}
              />
            </div>
          </div>
        </div>

        <section className="mt-9 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white shadow-[0_30px_100px_rgba(35,33,31,0.14)]">
          <div className="flex flex-col gap-3 border-b border-[rgba(35,33,31,0.10)] bg-[#EFEAE1]/72 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                hapai workspace
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-body)]">
                Work locally in the browser, then review before publishing or sharing.
              </p>
            </div>
            <Link
              href="/hapai#workflow-request"
              className="inline-flex h-9 w-fit items-center justify-center rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/60 px-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[color:var(--text-primary)] transition hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)]"
            >
              Suggest a better tool
            </Link>
          </div>
          <iframe
            src={legacyPath}
            title={title}
            className="block h-[min(1120px,calc(100svh-92px))] min-h-[820px] w-full border-0 bg-[#FAF7F2]"
          />
        </section>
      </div>
    </main>
  );
}
