import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FeedEnvelope, CompliancePayload, ComplianceUpdate } from "../types";

const IMPACT_TONE: Record<ComplianceUpdate["impact_level"], string> = {
  low: "border-emerald-300 text-emerald-700 bg-emerald-50",
  medium: "border-amber-300 text-amber-700 bg-amber-50",
  high: "border-rose-300 text-rose-700 bg-rose-50",
};

export function LiveComplianceBody({
  envelope,
}: {
  envelope: FeedEnvelope<CompliancePayload>;
}) {
  const payload = envelope?.data;
  if (!payload) return null;
  if (payload.error) {
    return <p className="text-xs text-destructive">{payload.error}</p>;
  }
  const updates = payload.updates ?? [];

  return (
    <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
      {updates.map((u) => (
        <li key={u.id} className="rounded-xl bg-muted/20 p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-foreground leading-snug">{u.title}</p>
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] uppercase tracking-wider px-1.5 py-0 h-5 ${IMPACT_TONE[u.impact_level]}`}
            >
              {u.impact_level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {u.change_summary}
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>
              {u.source_name}
              {u.legislation_ref ? ` · ${u.legislation_ref}` : ""}
            </span>
            {u.source_url && (
              <a
                href={u.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
