import Link from "next/link";
import { ExternalLink, MonitorUp, Sparkles } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";

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
    <HapaiToolShell
      kicker={kicker}
      title={title}
      description={description}
      toolPath={path}
      shareTitle={`${title} — assembl`}
      shareText={description}
      posture={posture}
      highlights={[
        {
          title: "share",
          body: "copy the link, email it, or embed it",
          icon: <MonitorUp className="h-5 w-5" aria-hidden />,
        },
        {
          title: "draft",
          body: "make the thing, then review before publishing",
          icon: <Sparkles className="h-5 w-5" aria-hidden />,
        },
        {
          title: "native shell",
          body: "legacy studio carried inside the new HAPAI frame",
          icon: <ExternalLink className="h-5 w-5" aria-hidden />,
        },
      ]}
      aside={
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D9A85A]">
            porting status
          </p>
          <p className="mt-3 font-display text-4xl font-light italic leading-none text-[#FAF7F2]">
            The frame is native. The studio is next.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-[#FAF7F2]/82">
            This version uses the shared HAPAI page shell, share controls, and
            draft-only posture while the older studio is ported into proper
            React controls.
          </p>
          <Link
            href={legacyPath}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#FAF7F2] px-5 text-sm font-medium text-[#103F35] transition hover:bg-white"
          >
            Open full-screen studio
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </>
      }
    >
      <div className="overflow-hidden rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-[#F7F1E9]">
        <div className="flex flex-col gap-3 border-b border-[rgba(35,33,31,0.10)] bg-[#103F35] px-4 py-4 text-[#FAF7F2] md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9A85A]">
              HAPAI workspace
            </p>
            <p className="mt-1 text-sm text-[#FAF7F2]/78">
              Legacy studio preview. The next pass ports these controls into the native HAPAI app framework.
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
      </div>
    </HapaiToolShell>
  );
}
