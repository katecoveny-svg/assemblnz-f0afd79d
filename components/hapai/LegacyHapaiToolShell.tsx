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
          body: "create the draft, then review before publishing",
          icon: <Sparkles className="h-5 w-5" aria-hidden />,
        },
        {
          title: "native shell",
          body: "open the focused workspace when you need more room",
          icon: <ExternalLink className="h-5 w-5" aria-hidden />,
        },
      ]}
      aside={
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D9A85A]">
            focused workspace
          </p>
          <p className="mt-3 font-display text-4xl font-light leading-none text-[#FFF7EC]">
            Make the asset. Keep the record.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-[#FFF7EC]/82">
            Use the studio when you want the full working surface. The output
            stays draft-only until a named person checks, chooses, and publishes
            it.
          </p>
          <Link
            href={legacyPath}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#FFF7EC] px-5 text-sm font-medium text-[#103F35] transition hover:bg-white"
          >
            Open full-screen studio
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </>
      }
    >
      <div className="overflow-hidden rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-[#F7F1E9]">
        <div className="flex flex-col gap-3 border-b border-[rgba(35,33,31,0.10)] bg-[#103F35] px-4 py-4 text-[#FFF7EC] md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9A85A]">
              HAPAI workspace
            </p>
            <p className="mt-1 text-sm text-[#FFF7EC]/78">
              Open the full workspace below, or launch it full-screen when you
              need more room.
            </p>
          </div>
          <Link
            href={legacyPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-fit items-center justify-center rounded-[8px] border border-[#FFF7EC]/30 bg-[#FFF7EC]/10 px-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[#FFF7EC] transition hover:bg-[#FFF7EC]/18"
          >
            Full-screen
          </Link>
        </div>
        <div className="relative min-h-[820px] overflow-hidden bg-[#FFF7EC] md:min-h-[900px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(58,56,50,0.08),transparent_34%)]" aria-hidden />
          <iframe
            src={legacyPath}
            title={title}
            className="relative block h-[900px] w-full origin-top border-0 bg-[#FFF7EC] md:h-[1020px]"
          />
        </div>
      </div>
    </HapaiToolShell>
  );
}
