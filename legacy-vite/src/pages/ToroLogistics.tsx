import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, MapPin, Fuel, Bus, Clock, Navigation, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SavedRoute {
  id: string;
  label: string;
  origin_label: string | null;
  dest_label: string | null;
  typical_duration_mins: number | null;
  typical_distance_km: number | null;
  departure_time: string | null;
  child_name: string | null;
  active: boolean | null;
}

interface FuelPrice {
  station: string;
  suburb: string;
  fuel_type: string;
  price_per_litre: number;
  updated_at: string;
}

interface BusArrival {
  route: string;
  destination: string;
  scheduled: string;
  expected: string;
  delay_mins: number;
  stop_name: string;
}

const ToroLogistics = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [busArrivals, setBusArrivals] = useState<BusArrival[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [busLoading, setBusLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }
      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!membership?.family_id) {
        setIsLoading(false);
        return;
      }
      setFamilyId(membership.family_id);
      const { data: r } = await supabase
        .from("toroa_saved_routes")
        .select("id, label, origin_label, dest_label, typical_duration_mins, typical_distance_km, departure_time, child_name, active")
        .eq("family_id", membership.family_id)
        .eq("active", true)
        .order("departure_time");
      setRoutes((r as SavedRoute[] | null) ?? []);
      setIsLoading(false);
    })();
  }, []);

  const refreshFuel = async () => {
    setFuelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nz-fuel-prices", {
        body: { region: "auckland", fuel_type: "91" },
      });
      if (error) throw error;
      setFuelPrices((data?.prices as FuelPrice[] | undefined) ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load fuel prices";
      toast.error(msg);
    } finally {
      setFuelLoading(false);
    }
  };

  const refreshBuses = async () => {
    setBusLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bus-positions", {
        body: { region: "auckland" },
      });
      if (error) throw error;
      setBusArrivals((data?.arrivals as BusArrival[] | undefined) ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load bus positions";
      toast.error(msg);
    } finally {
      setBusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link
            to="/toro/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#9D8C7D] hover:text-[#6F6158] font-body mb-4"
          >
            <ChevronLeft size={14} />
            Back to Tōro
          </Link>
          <h1 className="font-display text-5xl text-[#9D8C7D] inline-flex items-center gap-3 border-b-2 border-[#C7D9E8] pb-1">
            <Navigation size={32} className="text-[#C7D9E8]" />
            Haerenga
          </h1>
          <p className="font-body text-base text-[#9D8C7D]/80 mt-2">
            Saved routes, live fuel prices and bus tracking for the daily run.
          </p>
        </header>

        {isLoading ? (
          <p className="font-body text-sm text-[#9D8C7D]">Loading routes…</p>
        ) : !familyId ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-8 text-center">
            <p className="font-body text-sm text-[#6F6158]">
              No family workspace found. Set one up from the Tōro dashboard first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saved routes */}
            <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-[#9D8C7D] inline-flex items-center gap-2">
                  <MapPin size={18} />
                  Saved routes
                </h2>
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-xs font-medium"
                  onClick={() => toast.info("Add route flow coming soon")}
                >
                  <Plus size={14} />
                  Add route
                </button>
              </div>
              {routes.length === 0 ? (
                <p className="font-body text-sm text-[#9D8C7D]">
                  No saved routes yet. Tōro will suggest routes based on your daily school runs.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {routes.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl p-4 bg-white/60 border border-[rgba(142,129,119,0.10)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base text-[#6F6158]">{r.label}</h3>
                        {r.departure_time && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#9D8C7D]">
                            <Clock size={10} />
                            {r.departure_time}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-[#9D8C7D] mt-1">
                        {r.origin_label ?? "—"} → {r.dest_label ?? "—"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.typical_duration_mins !== null && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EEE7DE] text-[#6F6158]">
                            {r.typical_duration_mins} min
                          </span>
                        )}
                        {r.typical_distance_km !== null && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EEE7DE] text-[#6F6158]">
                            {r.typical_distance_km} km
                          </span>
                        )}
                        {r.child_name && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-[#C7D9E8]/40 text-[#6F6158]">
                            {r.child_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Fuel prices */}
            <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-[#9D8C7D] inline-flex items-center gap-2">
                  <Fuel size={18} />
                  Fuel prices
                </h2>
                <button
                  onClick={() => void refreshFuel()}
                  disabled={fuelLoading}
                  className="px-3 py-1.5 rounded-xl bg-[#EEE7DE] hover:bg-[#D8C8B4] text-[#6F6158] font-body text-xs disabled:opacity-60"
                >
                  {fuelLoading ? "Loading…" : "Refresh"}
                </button>
              </div>
              {fuelPrices.length === 0 ? (
                <p className="font-body text-sm text-[#9D8C7D]">
                  Tap Refresh to fetch the latest 91 octane prices in your area.
                </p>
              ) : (
                <ul className="space-y-2">
                  {fuelPrices.slice(0, 6).map((f, i) => (
                    <li
                      key={`${f.station}-${i}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.10)]"
                    >
                      <div className="min-w-0">
                        <p className="font-body text-sm text-[#6F6158] truncate">{f.station}</p>
                        <p className="font-body text-xs text-[#9D8C7D] truncate">{f.suburb}</p>
                      </div>
                      <span className="font-mono text-base text-[#6F6158] shrink-0">
                        ${f.price_per_litre.toFixed(3)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Bus tracker */}
            <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-[#9D8C7D] inline-flex items-center gap-2">
                  <Bus size={18} />
                  Bus tracker
                </h2>
                <button
                  onClick={() => void refreshBuses()}
                  disabled={busLoading}
                  className="px-3 py-1.5 rounded-xl bg-[#EEE7DE] hover:bg-[#D8C8B4] text-[#6F6158] font-body text-xs disabled:opacity-60"
                >
                  {busLoading ? "Loading…" : "Refresh"}
                </button>
              </div>
              {busArrivals.length === 0 ? (
                <p className="font-body text-sm text-[#9D8C7D]">
                  Tap Refresh to see live arrivals for routes saved against your tamariki.
                </p>
              ) : (
                <ul className="space-y-2">
                  {busArrivals.slice(0, 6).map((b, i) => (
                    <li
                      key={`${b.route}-${i}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.10)]"
                    >
                      <div className="min-w-0">
                        <p className="font-body text-sm text-[#6F6158]">
                          <span className="font-mono">{b.route}</span> · {b.destination}
                        </p>
                        <p className="font-body text-xs text-[#9D8C7D] truncate">{b.stop_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm text-[#6F6158]">{b.expected}</p>
                        {b.delay_mins !== 0 && (
                          <p
                            className={`font-mono text-[10px] ${
                              b.delay_mins > 0 ? "text-[#C09494]" : "text-[#8FB09A]"
                            }`}
                          >
                            {b.delay_mins > 0 ? `+${b.delay_mins}` : b.delay_mins} min
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Trip planner */}
            <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 lg:col-span-2">
              <h2 className="font-display text-xl text-[#9D8C7D] inline-flex items-center gap-2 mb-4">
                <Navigation size={18} />
                Trip planner
              </h2>
              <p className="font-body text-sm text-[#6F6158]">
                Ask Tōro Logistics to plan a one-off trip — it will use Auckland traffic patterns,
                live fuel prices, and your saved routes.
              </p>
              <Link
                to="/chat/toro-logistics"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium"
              >
                Start a trip plan
              </Link>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToroLogistics;
