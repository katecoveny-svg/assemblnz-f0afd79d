import { Car, Clock, Route as RouteIcon } from "lucide-react";
import type { TripConvoy, TripFamily } from "./types";

interface Props {
  families: TripFamily[];
  convoys: TripConvoy[];
  dayLabel: string;
}

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" }) : "—";

const VoyageConvoyPanel = ({ families, convoys, dayLabel }: Props) => {
  return (
    <section className="glass-card rounded-3xl border border-border/40 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Convoy ops · {dayLabel || "—"}
          </div>
          <h2 className="text-lg font-light mt-1">Whānau in transit</h2>
        </div>
        <Car className="w-5 h-5 text-primary" />
      </div>

      {convoys.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No convoys scheduled for this day — everyone's already on site.
        </p>
      ) : (
        <ul className="space-y-3">
          {convoys.map((c) => {
            const fam = families.find((f) => f.id === c.family_id);
            if (!fam) return null;
            return (
              <li
                key={c.id}
                className="rounded-2xl border border-border/40 bg-background/40 p-4 hover:bg-background/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: fam.accent_color }}
                    />
                    <span className="font-medium text-sm">{fam.name}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {c.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {c.origin_label || "Home"} → {c.destination_label || "Destination"}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <Stat icon={<Clock className="w-3 h-3" />} label="Depart" value={fmtTime(c.depart_at)} />
                  <Stat icon={<Clock className="w-3 h-3" />} label="Arrive" value={fmtTime(c.arrive_at)} />
                  <Stat icon={<RouteIcon className="w-3 h-3" />} label="Distance" value={c.distance_km ? `${c.distance_km} km` : "—"} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg bg-background/40 border border-border/30 px-2 py-1.5 text-center">
    <div className="flex items-center justify-center gap-1 text-muted-foreground">
      {icon}
      <span className="uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-foreground mt-0.5">{value}</div>
  </div>
);

export default VoyageConvoyPanel;
