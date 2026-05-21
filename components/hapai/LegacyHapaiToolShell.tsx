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
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-10 text-[color:var(--text-primary)] md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/hapai"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--assembl-pounamu)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          hapai library
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(320px,0.3fr)] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              {kicker}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.3rem,7vw,6.8rem)] font-light italic leading-[0.9]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              {description}
            </p>
          </div>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-5">
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

        <section className="mt-10 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white shadow-[0_24px_80px_rgba(35,33,31,0.10)]">
          <div className="border-b border-[rgba(35,33,31,0.10)] bg-[#EFEAE1]/65 px-4 py-3 md:px-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                draft workspace
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-body)]">
                Work locally in the browser, then review before publishing or sharing.
              </p>
            </div>
          </div>
          <iframe
            src={legacyPath}
            title={title}
            loading="lazy"
            className="block h-[min(980px,calc(100svh-120px))] min-h-[760px] w-full border-0 bg-[#FAF7F2]"
          />
        </section>
      </div>
    </main>
  );
}
