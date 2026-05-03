import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { TripActivity, TripDay, TripDestination } from "./types";

interface Props {
  day: TripDay | undefined;
  destination: TripDestination | undefined;
  activities: TripActivity[];
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "short" });

const VoyageDayBriefing = ({ day, destination, activities }: Props) => {
  if (!day) return null;
  return (
    <section className="glass-card rounded-3xl border border-border/40 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Day briefing
          </div>
          <h2 className="text-lg font-light mt-1">{day.title || fmtDate(day.date)}</h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            {fmtDate(day.date)}
            {destination && (
              <>
                <span>·</span>
                <MapPin className="w-3.5 h-3.5" style={{ color: destination.color }} />
                {destination.name}
              </>
            )}
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      {day.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{day.summary}</p>
      )}

      {activities.length > 0 ? (
        <ul className="space-y-2">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-xl bg-background/40 border border-border/30 px-3 py-2"
            >
              <div className="text-xs font-medium text-primary w-12 flex-shrink-0 pt-0.5">
                {a.start_time || "—"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{a.name}</div>
                {a.note && <div className="text-[11px] text-muted-foreground mt-0.5">{a.note}</div>}
              </div>
              {a.urgent && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  Urgent
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No activities scheduled — a free day to wander.
        </p>
      )}
    </section>
  );
};

export default VoyageDayBriefing;
