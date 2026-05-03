// ═══════════════════════════════════════════════════════════════
// AAAIP — Guard badge component
//
// Drop-in indicator for any production Assembl Kete dashboard.
// Shows "Governed by AAAIP · N policies" with a popover listing
// every policy gating the current component's actions.
//
// Links to /aaaip/<pilotRoute> so users can see the live
// simulation + decision feed for the same Kete.
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAaaipGuard, type GuardDomain } from "./useAaaipGuard";

interface Props {
  domain: GuardDomain;
  /** Optional accent colour — defaults to the Kete colour. */
  accentColor?: string;
  /** Optional short subtitle. */
  subtitle?: string;
}

const KETE_LABEL: Record<GuardDomain, string> = {
  waihanga: "Waihanga",
  pikau: "Pikau",
  manaaki: "Manaaki",
  auaha: "Auaha",
  toro: "Toro",
};

export default function AaaipGuardBadge({ domain, accentColor, subtitle }: Props) {
  const guard = useAaaipGuard(domain);
  const colour = accentColor ?? "#3A7D6E";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/60"
          style={{ borderColor: `${colour}66`, color: colour }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Governed by AAAIP
          <Badge variant="outline" className="ml-1">
            {guard.policies.length} policies
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AAAIP Policy Gate
          </p>
          <p className="mt-1 text-sm font-medium">
            {KETE_LABEL[domain]}
            {subtitle && (
              <span className="text-muted-foreground"> · {subtitle}</span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Every action on this page is evaluated against the policies
            below before it takes effect.
          </p>
        </div>
        <ul className="max-h-72 space-y-2 overflow-y-auto p-3">
          {guard.policies.map((p) => (
            <li key={p.id} className="rounded-md border p-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium">{p.name}</span>
                <Badge
                  variant={p.severity === "block" ? "destructive" : "secondary"}
                >
                  {p.severity}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {p.rationale}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                {p.source}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t px-4 py-3">
          <Link
            to="/aaaip"
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: colour }}
          >
            Open live simulation
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
