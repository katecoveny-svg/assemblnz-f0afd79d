import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_8%,rgba(43,107,87,0.16),transparent_30%),linear-gradient(180deg,#FAF7F2_0%,#F7F1E9_52%,#FAF7F2_100%)] text-[color:var(--text-primary)]">
      <div className="relative mx-auto max-w-[1540px] px-5 py-9 md:px-10 md:py-12">
        <Link
          href="/hapai"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--assembl-pounamu)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          hapai library
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.48fr)] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              {kicker}
            </p>
            <h1 className="mt-4 max-w-5xl font-display text-[clamp(4rem,8vw,8.4rem)] font-light italic leading-[0.82] text-[#103F35]">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              {description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={legacyPath}
                target="_blank"
                rel="noreferrer"
                className="cta-primary inline-flex h-12 items-center gap-2 px-6"
              >
                Open full-screen tool
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/hapai#workflow-request"
                className="btn-ghost inline-flex h-12 items-center gap-2 bg-white/54 px-6"
              >
                Suggest a better version
                <Sparkles className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/72 p-5 shadow-[0_24px_80px_rgba(35,33,31,0.10)] backdrop-blur">
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

        <section className="mt-9 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F1E9] shadow-[0_34px_120px_rgba(35,33,31,0.14)]">
          <div className="flex flex-col gap-3 border-b border-[rgba(35,33,31,0.10)] bg-[#103F35] px-4 py-4 text-[#FAF7F2] md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9A85A]">
                hapai workspace
              </p>
              <p className="mt-1 text-sm text-[#FAF7F2]/78">
                This tool is being carried in the new HAPAI shell while we port the remaining legacy studios to native React.
              </p>
            </div>
            <Link
              href={legacyPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-fit items-center justify-center rounded-[8px] border border-[#FAF7F2]/30 bg-[#FAF7F2]/10 px-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[#FAF7F2] transition hover:bg-[#FAF7F2]/18"
            >
              Full-screen
            </Link>
          </div>
          <div className="relative min-h-[820px] overflow-hidden bg-[#FAF7F2] md:min-h-[900px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(43,107,87,0.08),transparent_34%)]" aria-hidden />
            <iframe
              src={legacyPath}
              title={title}
              className="relative block h-[900px] w-full origin-top border-0 bg-[#FAF7F2] md:h-[1020px]"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
