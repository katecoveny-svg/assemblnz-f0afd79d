import { LiveWidget } from "./LiveWidget";
import { getSection } from "@/config/dashboard-widgets";
import type { WidgetKete, WidgetRole } from "@/config/widget-types";
import { getKeteAccent } from "./kete-accents";

export interface LiveWidgetSectionProps {
  /** Which kete / dashboard section to render. */
  section: WidgetKete;
  viewerRole?: WidgetRole;
  enabledToolsets?: string[];
  /** Override the grid — defaults to responsive 1-2-3 columns. */
  gridClassName?: string;
  /** Hide the section header. */
  bare?: boolean;
}

/**
 * LiveWidgetSection — renders all widgets registered for a section in
 * a uniform themed grid. Drop into any dashboard page:
 *
 *   <LiveWidgetSection section="manaaki" viewerRole={role} />
 */
export function LiveWidgetSection({
  section,
  viewerRole = "public",
  enabledToolsets = [],
  gridClassName = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  bare = false,
}: LiveWidgetSectionProps) {
  const cfg = getSection(section);
  if (!cfg) return null;
  const accent = getKeteAccent(section);

  return (
    <section
      className="space-y-4"
      data-section={section}
      style={{ ["--kete-accent" as string]: accent.accentHex }}
    >
      {!bare && (
        <header className="flex items-end justify-between gap-3">
          <div>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ color: accent.inkHex }}
            >
              {accent.subtitle}
            </p>
            <h2 className="font-display text-2xl font-light text-foreground">{cfg.title}</h2>
            {cfg.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{cfg.description}</p>
            )}
          </div>
          <span
            className="hidden sm:inline-block h-1 w-16 rounded-full"
            style={{ background: accent.accentHex }}
          />
        </header>
      )}

      <div className={gridClassName}>
        {cfg.widgets.map((w) => (
          <LiveWidget
            key={w.id}
            widgetId={w.id}
            viewerRole={viewerRole}
            enabledToolsets={enabledToolsets}
          />
        ))}
      </div>
    </section>
  );
}
