import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Compass, Loader2 } from "lucide-react";
import VoyageCommandHeader from "@/components/voyage/VoyageCommandHeader";
import VoyageConvoyPanel from "@/components/voyage/VoyageConvoyPanel";
import VoyageTimelineScrubber from "@/components/voyage/VoyageTimelineScrubber";
import VoyageDayBriefing from "@/components/voyage/VoyageDayBriefing";
import VoyageMap from "@/components/voyage/VoyageMap";
import type {
  TripBundle,
  TripFamily,
  TripDestination,
  TripDay,
  TripActivity,
  TripConvoy,
} from "@/components/voyage/types";

const SAMPLE_TRIP_ID = "11111111-1111-1111-1111-111111111111";

const VoyageCommandPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip") || SAMPLE_TRIP_ID;
  const [bundle, setBundle] = useState<TripBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // SEO
  useEffect(() => {
    document.title = "VOYAGE Command Mode — Multi-family trip ops | Assembl";
    const desc = "VOYAGE Command Mode: a Mārama-styled, light-glass operations view of multi-family trips with convoy tracking, day-by-day timeline and live map.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [tripRes, famsRes, destsRes, daysRes, actsRes, convoysRes] = await Promise.all([
          supabase.from("trips").select("*").eq("id", SAMPLE_TRIP_ID).single(),
          supabase.from("trip_families").select("*").eq("trip_id", SAMPLE_TRIP_ID),
          supabase.from("trip_destinations").select("*").eq("trip_id", SAMPLE_TRIP_ID).order("sort_order"),
          supabase.from("trip_days").select("*").eq("trip_id", SAMPLE_TRIP_ID).order("date"),
          supabase.from("trip_activities").select("*").eq("trip_id", SAMPLE_TRIP_ID).order("sort_order"),
          supabase.from("trip_convoys").select("*").eq("trip_id", SAMPLE_TRIP_ID),
        ]);

        if (tripRes.error) throw tripRes.error;

        setBundle({
          trip: tripRes.data as TripBundle["trip"],
          families: (famsRes.data || []) as TripFamily[],
          destinations: (destsRes.data || []) as TripDestination[],
          days: (daysRes.data || []) as TripDay[],
          activities: (actsRes.data || []) as TripActivity[],
          convoys: (convoysRes.data || []) as unknown as TripConvoy[],
        });
      } catch (e) {
        console.error("[VOYAGE Command] load failed", e);
        setError(e instanceof Error ? e.message : "Failed to load trip");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Timeline auto-play
  useEffect(() => {
    if (!playing || !bundle) return;
    const id = window.setInterval(() => {
      setActiveDayIndex((i) => {
        const next = i + 1;
        if (next >= bundle.days.length) {
          setPlaying(false);
          return i;
        }
        return next;
      });
    }, 1800);
    return () => window.clearInterval(id);
  }, [playing, bundle]);

  const activeDay = bundle?.days[activeDayIndex];
  const activeDayActivities = useMemo(
    () => (bundle && activeDay ? bundle.activities.filter((a) => a.day_id === activeDay.id) : []),
    [bundle, activeDay]
  );
  const activeDayConvoys = useMemo(
    () => (bundle && activeDay ? bundle.convoys.filter((c) => c.day_id === activeDay.id) : []),
    [bundle, activeDay]
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading mission brief…</span>
        </div>
      </main>
    );
  }

  if (error || !bundle) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <Compass className="w-10 h-10 mx-auto text-primary" />
          <h1 className="text-2xl font-light">VOYAGE Command Mode</h1>
          <p className="text-sm text-muted-foreground">{error || "No trip data found."}</p>
          <Link to="/" className="text-sm text-primary underline">Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <VoyageCommandHeader trip={bundle.trip} families={bundle.families} />

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: convoys + briefing */}
          <div className="lg:col-span-5 space-y-6">
            <VoyageConvoyPanel
              families={bundle.families}
              convoys={activeDayConvoys}
              dayLabel={activeDay?.title || ""}
            />
            <VoyageDayBriefing
              day={activeDay}
              activities={activeDayActivities}
              destination={bundle.destinations.find((d) => d.id === activeDay?.destination_id)}
            />
          </div>

          {/* Right: map */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl overflow-hidden border border-border/40 shadow-sm">
              <VoyageMap
                center={[Number(bundle.trip.base_lat ?? -41), Number(bundle.trip.base_lng ?? 173)]}
                zoom={bundle.trip.base_zoom ?? 6}
                families={bundle.families}
                destinations={bundle.destinations}
                convoys={activeDayConvoys}
                activeDayIndex={activeDayIndex}
              />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <VoyageTimelineScrubber
            days={bundle.days}
            destinations={bundle.destinations}
            activeIndex={activeDayIndex}
            onChange={setActiveDayIndex}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
          />
        </section>
      </div>
    </main>
  );
};

export default VoyageCommandPage;
