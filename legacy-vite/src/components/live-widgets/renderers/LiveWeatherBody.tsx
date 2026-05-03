import { Cloud, Droplets, Wind } from "lucide-react";
import type { FeedEnvelope, WeatherPayload } from "../types";

export function LiveWeatherBody({ envelope }: { envelope: FeedEnvelope<WeatherPayload> }) {
  const w = envelope?.data;
  if (!w) return null;
  if (w.error) {
    return <p className="text-xs text-destructive">{w.error}</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl text-foreground">
          {w.temperature != null ? `${Math.round(w.temperature)}°` : "—"}
        </span>
        <span className="text-sm text-muted-foreground capitalize">
          {w.description ?? w.conditions ?? "Conditions unavailable"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat icon={<Cloud className="h-3 w-3" />} label="Feels" value={fmt(w.feels_like, "°")} />
        <Stat
          icon={<Droplets className="h-3 w-3" />}
          label="Humidity"
          value={fmt(w.humidity, "%")}
        />
        <Stat icon={<Wind className="h-3 w-3" />} label="Wind" value={fmt(w.wind_speed, " m/s")} />
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">
        {w.city} · {new Date(envelope.generated_at).toLocaleTimeString("en-NZ")}
      </p>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/30 px-2 py-1.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function fmt(n: number | undefined, suffix: string): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n)}${suffix}`;
}
