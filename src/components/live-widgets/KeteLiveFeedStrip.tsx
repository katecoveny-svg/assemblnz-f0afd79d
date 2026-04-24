import { LiveWidgetSection } from "@/components/live-widgets";
import { useViewerScope } from "@/hooks/useViewerScope";
import type { WidgetKete } from "@/config/widget-types";

export interface KeteLiveFeedStripProps {
  /** Which kete section's widgets to render. */
  kete: WidgetKete;
  /** Hide the section header (when the host already has its own). */
  bare?: boolean;
  /** Override grid layout — defaults to responsive 1-2-3 columns. */
  gridClassName?: string;
  className?: string;
}

/**
 * KeteLiveFeedStrip — drop-in band of live data widgets for a kete
 * dashboard. Wires the registry to the viewer's role + enabled
 * toolsets so each widget shows the same data the agent chat uses.
 */
export function KeteLiveFeedStrip({
  kete,
  bare,
  gridClassName,
  className,
}: KeteLiveFeedStripProps) {
  const { viewerRole, enabledToolsets } = useViewerScope();
  return (
    <div className={className}>
      <LiveWidgetSection
        section={kete}
        viewerRole={viewerRole}
        enabledToolsets={enabledToolsets}
        gridClassName={gridClassName}
        bare={bare}
      />
    </div>
  );
}
