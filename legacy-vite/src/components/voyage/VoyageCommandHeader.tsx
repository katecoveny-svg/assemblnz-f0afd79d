import { Calendar, MapPin, Users } from "lucide-react";
import type { Trip, TripFamily } from "./types";

interface Props {
  trip: Trip;
  families: TripFamily[];
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });

const VoyageCommandHeader = ({ trip, families }: Props) => {
  const totalPeople = families.reduce((s, f) => s + (f.member_count || 0), 0);
  return (
    <header className="glass-card rounded-3xl border border-border/40 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] uppercase tracking-[0.18em] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            VOYAGE · Command Mode
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
            {trip.name}
          </h1>
          {trip.tagline && (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              {trip.tagline}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {families.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-border/50 text-xs"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.accent_color }} />
              <span className="font-medium">{f.name}</span>
              <span className="text-muted-foreground">· {f.member_count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <Metric icon={<Calendar className="w-4 h-4" />} label="Window" value={`${fmtDate(trip.start_date)} → ${fmtDate(trip.end_date)}`} />
        <Metric icon={<Users className="w-4 h-4" />} label="People" value={`${totalPeople} across ${families.length}`} />
        <Metric icon={<MapPin className="w-4 h-4" />} label="Currency" value={trip.currency} />
      </div>
    </header>
  );
};

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl bg-background/40 border border-border/40 px-4 py-3">
    <div className="flex items-center justify-center gap-2 text-muted-foreground text-[10px] uppercase tracking-[0.15em]">
      {icon}
      {label}
    </div>
    <div className="mt-1 text-sm sm:text-base text-foreground font-light truncate">{value}</div>
  </div>
);

export default VoyageCommandHeader;
