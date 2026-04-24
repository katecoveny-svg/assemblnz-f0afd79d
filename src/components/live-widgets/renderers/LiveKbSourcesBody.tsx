import { ExternalLink } from "lucide-react";
import type { FeedEnvelope, KbSourcesPayload } from "../types";

export function LiveKbSourcesBody({
  envelope,
}: {
  envelope: FeedEnvelope<KbSourcesPayload>;
}) {
  const p = envelope?.data;
  if (!p) return null;
  if (p.error) {
    return <p className="text-xs text-destructive">{p.error}</p>;
  }
  const sources = p.sources ?? [];

  return (
    <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      {sources.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{s.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              {s.type}
              {s.category ? ` · ${s.category}` : ""}
              {s.reliability_score != null ? ` · ${s.reliability_score}% reliable` : ""}
            </p>
          </div>
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label={`Open ${s.name}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
