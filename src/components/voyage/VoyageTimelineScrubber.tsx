import { Pause, Play } from "lucide-react";
import type { TripDay, TripDestination } from "./types";

interface Props {
  days: TripDay[];
  destinations: TripDestination[];
  activeIndex: number;
  onChange: (i: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
}

const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });

const VoyageTimelineScrubber = ({ days, destinations, activeIndex, onChange, playing, onTogglePlay }: Props) => {
  return (
    <div className="glass-card rounded-3xl border border-border/40 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Mission timeline
        </div>
        <button
          onClick={onTogglePlay}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label={playing ? "Pause timeline" : "Play timeline"}
        >
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, i) => {
          const dest = destinations.find((d) => d.id === day.destination_id);
          const active = i === activeIndex;
          return (
            <button
              key={day.id}
              onClick={() => onChange(i)}
              className={`flex-shrink-0 rounded-2xl border px-3 py-2.5 text-left min-w-[120px] transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                  : "bg-background/40 border-border/40 text-foreground hover:bg-background/70"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                Day {i + 1}
              </div>
              <div className="text-xs font-medium mt-0.5">{fmtDay(day.date)}</div>
              {dest && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] opacity-90">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: active ? "currentColor" : dest.color }}
                  />
                  {dest.name}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VoyageTimelineScrubber;
