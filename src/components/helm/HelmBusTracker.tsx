import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw, Bus, AlertTriangle } from "lucide-react";

const HELM_COLOR = "#3A6A9C";
const REFRESH_INTERVAL = 15000;

interface VehiclePosition {
  vehicle_id: string;
  route_id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  bearing: number | null;
  speed: number | null;
  timestamp: number;
  occupancy_status: string | null;
}

interface Child { id: string; name: string; bus_route_id: string | null; avatar_color: string; }

export default function HelmBusTracker() {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(import.meta.env.VITE_MAPBOX_TOKEN || null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Load children with bus routes
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        const { data } = await supabase.from("children").select("*").eq("family_id", fm.family_id).not("bus_route_id", "is", null);
        if (data && data.length > 0) {
          setChildren(data);
          setSelectedChild(data[0].id);
        }
      }
    })();
  }, [user]);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapRef.current || !mapboxToken || mapInitialized) return;
    setMapInitialized(true);
    
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
      document.head.appendChild(link);
      
      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = mapboxToken;
      
      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [174.763, -36.848],
        zoom: 11,
      });
      
      map.on("load", () => {
        mapInstanceRef.current = map;
        setMapLoaded(true);
      });
    };
    document.head.appendChild(script);
    
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [mapboxToken, mapInitialized]);

  // Fetch bus positions
  const fetchPositions = useCallback(async () => {
    const child = children.find(c => c.id === selectedChild);
    if (!child?.bus_route_id) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("bus-positions", {
        body: { route_ids: child.bus_route_id.split(",").map(r => r.trim()) }
      });
      if (fnError) throw fnError;
      if (data?.vehicles) {
        setVehicles(data.vehicles);
        setLastUpdated(new Date());
      }
      // Get mapbox token from edge function response if not already set
      if (data?.mapbox_token && !mapboxToken) {
        setMapboxToken(data.mapbox_token);
      }
    } catch (err: any) {
      console.error("Bus positions fetch error:", err);
      setError(err.message || "Failed to fetch bus positions");
    } finally {
      setLoading(false);
    }
  }, [children, selectedChild, mapboxToken]);

  // Fetch token on mount if not available
  useEffect(() => {
    if (!mapboxToken) {
      (async () => {
        try {
          const { data } = await supabase.functions.invoke("bus-positions", {
            body: { route_ids: [] }
          });
          if (data?.mapbox_token) {
            setMapboxToken(data.mapbox_token);
          }
        } catch (e) {
          console.error("Failed to fetch mapbox token:", e);
        }
      })();
    }
  }, [mapboxToken]);

  // Auto-refresh
  useEffect(() => {
    if (!selectedChild || children.length === 0) return;
    fetchPositions();
    const interval = setInterval(fetchPositions, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedChild, children, fetchPositions]);

  // Update map markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    const mapboxgl = (window as any).mapboxgl;
    
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    
    vehicles.forEach(v => {
      const el = document.createElement("div");
      el.className = "bus-marker";
      el.style.cssText = `width:32px;height:32px;background:${HELM_COLOR};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#000;font-weight:bold;box-shadow:0 0 12px ${HELM_COLOR}60;`;
      el.innerHTML = "";
      if (v.bearing) el.style.transform = `rotate(${v.bearing}deg)`;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([v.longitude, v.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="color:#000;padding:4px;font-size:12px;">
            <strong>Route ${v.route_id}</strong><br/>
            Speed: ${v.speed ? Math.round(v.speed) + " km/h" : "N/A"}<br/>
            ${v.occupancy_status ? `Occupancy: ${v.occupancy_status}` : ""}
          </div>`
        ))
        .addTo(mapInstanceRef.current);
      
      markersRef.current.push(marker);
    });
    
    if (vehicles.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      vehicles.forEach(v => bounds.extend([v.longitude, v.latitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [vehicles, mapLoaded]);

  const child = children.find(c => c.id === selectedChild);

  return (
    <div className="flex-1 flex flex-col" style={{ background: "transparent" }}>
      {/* Controls */}
      <div className="p-3 flex items-center gap-3 border-b border-gray-100">
        {children.length > 1 && (
          <select value={selectedChild || ""} onChange={e => setSelectedChild(e.target.value)}
            className="bg-white/5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none" style={{ accentColor: HELM_COLOR }}>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {child && <span className="text-[10px] font-mono text-gray-400">Route: {child.bus_route_id}</span>}
        <div className="flex-1" />
        <button onClick={fetchPositions} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition hover:bg-white/5" style={{ color: HELM_COLOR }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
        {lastUpdated && <span className="text-[9px] text-white/25 font-mono">{lastUpdated.toLocaleTimeString("en-NZ")}</span>}
      </div>

      {error && (
        <div className="mx-3 mt-2 rounded-lg p-2 flex items-center gap-2 bg-[#C85A54]/10 border border-red-500/20">
          <AlertTriangle size={12} className="text-[#C85A54]" />
          <span className="text-xs text-red-300">{error}</span>
        </div>
      )}

      {children.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Bus size={32} style={{ color: HELM_COLOR }} className="mx-auto opacity-40" />
            <p className="text-sm text-gray-500">No bus routes configured</p>
            <p className="text-xs text-gray-400">Add a bus route ID to a child's profile in Settings</p>
          </div>
        </div>
      ) : !mapboxToken ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Bus size={32} style={{ color: HELM_COLOR }} className="mx-auto opacity-50" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="flex-1 min-h-[300px]" />
          {vehicles.length > 0 && (
            <div className="p-3 border-t border-gray-100 space-y-2">
              <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{vehicles.length} bus{vehicles.length > 1 ? "es" : ""} tracked</h3>
              {vehicles.map(v => (
                <div key={v.vehicle_id} className="rounded-lg px-3 py-2 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-sm"></span>
                  <div className="flex-1">
                    <span className="text-xs text-white/70 font-medium">Route {v.route_id}</span>
                    {v.speed != null && <span className="text-[10px] text-gray-400 ml-2">{Math.round(v.speed)} km/h</span>}
                  </div>
                  {v.occupancy_status && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{v.occupancy_status}</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
