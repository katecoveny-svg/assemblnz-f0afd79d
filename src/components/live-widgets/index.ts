/**
 * LiveWidget component library — barrel export.
 *
 * Usage:
 *   import { LiveWidget, LiveWidgetSection } from "@/components/live-widgets";
 *
 *   // Render every widget in a section:
 *   <LiveWidgetSection section="manaaki" viewerRole={role} />
 *
 *   // Render a single widget by id:
 *   <LiveWidget widgetId="weather-auckland" />
 *
 * All widgets fetch through the public `dashboard-feed` edge function
 * (or a configured edge function / table) via `useWidgetData`. They
 * share a unified shell (`LiveWidgetShell`) that handles loading,
 * error, empty, and forbidden (locked) states.
 */

export { LiveWidget } from "./LiveWidget";
export type { LiveWidgetProps } from "./LiveWidget";

export { LiveWidgetSection } from "./LiveWidgetSection";
export type { LiveWidgetSectionProps } from "./LiveWidgetSection";

export { LiveWidgetShell } from "./LiveWidgetShell";
export type { LiveWidgetShellProps } from "./LiveWidgetShell";

export { KETE_ACCENTS, getKeteAccent } from "./kete-accents";
export type { KeteAccent } from "./kete-accents";

// Body renderers — exported so consumers can compose custom widgets
// with the same visual language.
export { LiveWeatherBody } from "./renderers/LiveWeatherBody";
export { LiveFuelBody } from "./renderers/LiveFuelBody";
export { LiveComplianceBody } from "./renderers/LiveComplianceBody";
export { LiveKbSourcesBody } from "./renderers/LiveKbSourcesBody";
export { LiveTableBody } from "./renderers/LiveTableBody";

export type {
  FeedEnvelope,
  WeatherPayload,
  FuelPricesPayload,
  CompliancePayload,
  ComplianceUpdate,
  KbSourcesPayload,
  KbSource,
} from "./types";
