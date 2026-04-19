import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio, Ship, Loader2, X, Navigation } from "lucide-react";

interface Vessel {
  mmsi: string;
  name: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  lastUpdate: Date;
  shipType?: number;
}

interface Props {
  agentColor: string;
  onSendToChat?: (msg: string) => void;
}

// NZ bounding box
const NZ_BOUNDS = [
  [[-47, 166], [-47, 179], [-34, 179], [-34, 166], [-47, 166]]
];

export default function AISLiveTracker({ agentColor, onSendToChat }: Props) {
  const [vessels, setVessels] = useState<Map<string, Vessel>>(new Map());
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setConnecting(true);
    setError(null);
    retryCount.current = 0;

    try {
      // Get API key from edge function
      const { data, error: fnError } = await supabase.functions.invoke("iot-ais-tracking", {
        body: {},
      });

      if (fnError || !data?.apiKey) {
        throw new Error(data?.error || fnError?.message || "Failed to get AIS API key");
      }

      const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
      wsRef.current = ws;

      ws.onopen = () => {
        // Subscribe to NZ waters bounding box
        const subscribeMsg = {
          APIKey: data.apiKey,
          BoundingBoxes: NZ_BOUNDS,
          FilterMessageTypes: ["PositionReport", "ShipStaticData"],
        };
        ws.send(JSON.stringify(subscribeMsg));
        setConnected(true);
        setConnecting(false);
        retryCount.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          setMessageCount(c => c + 1);

          if (msg.MessageType === "PositionReport") {
            const pos = msg.Message?.PositionReport;
            const meta = msg.MetaData;
            if (pos && meta) {
              setVessels(prev => {
                const next = new Map(prev);
                next.set(String(meta.MMSI), {
                  mmsi: String(meta.MMSI),
                  name: meta.ShipName?.trim() || `MMSI ${meta.MMSI}`,
                  lat: pos.Latitude,
                  lon: pos.Longitude,
                  speed: pos.Sog ?? 0,
                  heading: pos.TrueHeading ?? pos.Cog ?? 0,
                  lastUpdate: new Date(),
                  shipType: meta.ShipType,
                });
                return next;
              });
            }
          } else if (msg.MessageType === "ShipStaticData") {
            const staticData = msg.Message?.ShipStaticData;
            const meta = msg.MetaData;
            if (staticData && meta) {
              setVessels(prev => {
                const next = new Map(prev);
                const existing = next.get(String(meta.MMSI));
                if (existing) {
                  next.set(String(meta.MMSI), {
                    ...existing,
                    name: staticData.Name?.trim() || existing.name,
                    shipType: staticData.Type,
                  });
                }
                return next;
              });
            }
          }
        } catch {
          // skip malformed messages
        }
      };

      ws.onerror = () => {
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          setError(`Connection error — retrying (${retryCount.current}/${maxRetries})...`);
        } else {
          setError("Unable to connect to AIS stream after 3 attempts");
          disconnect();
        }
      };

      ws.onclose = (e) => {
        setConnected(false);
        setConnecting(false);
        if (e.code !== 1000 && retryCount.current < maxRetries) {
          retryCount.current++;
          setTimeout(() => connect(), 2000 * retryCount.current);
        }
      };
    } catch (err: any) {
      setError(err.message || "Connection failed");
      setConnecting(false);
    }
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const vesselList = Array.from(vessels.values())
    .sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime())
    .slice(0, 50);

  const formatTime = (d: Date) => {
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  const getShipTypeLabel = (type?: number) => {
    if (!type) return "";
    if (type >= 70 && type <= 79) return "Cargo";
    if (type >= 80 && type <= 89) return "Tanker";
    if (type >= 60 && type <= 69) return "Passenger";
    if (type >= 40 && type <= 49) return "HSC";
    if (type >= 30 && type <= 39) return "Fishing";
    if (type >= 50 && type <= 59) return "Special";
    if (type >= 20 && type <= 29) return "WIG";
    return "Other";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: `${agentColor}15` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Ship size={14} style={{ color: agentColor }} />
          <h3 className="text-xs font-semibold text-foreground">Live AIS Vessel Tracking</h3>
          {connected && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#5AADA0]/10 text-[#5AADA0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5AADA0] animate-pulse" />
              Live
            </span>
          )}
        </div>
        {connected ? (
          <button
            onClick={disconnect}
            className="p-1.5 rounded-lg transition-colors hover:bg-destructive/10 text-destructive"
          >
            <X size={14} />
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-[0.98]"
            style={{ background: `${agentColor}15`, color: agentColor, border: `1px solid ${agentColor}25` }}
          >
            {connecting ? (
              <span className="flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> Connecting...
              </span>
            ) : (
              "Track Vessels"
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-destructive mb-2 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}

      {!connected && !connecting && vesselList.length === 0 && (
        <p className="text-[10px] text-muted-foreground py-4 text-center">
          Click "Track Vessels" to open a live WebSocket connection to AISStream and see real-time vessel positions in NZ waters.
        </p>
      )}

      {/* Stats bar */}
      {(connected || vesselList.length > 0) && (
        <div className="flex gap-3 mb-3 text-[10px] text-muted-foreground">
          <span>{vesselList.length} vessels</span>
          <span>{messageCount} messages</span>
          <span>NZ waters (34°S–47°S)</span>
        </div>
      )}

      {/* Vessel table */}
      {vesselList.length > 0 && (
        <div className="overflow-auto max-h-72 rounded-lg border border-border">
          <table className="w-full text-[10px]">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Vessel</th>
                <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">MMSI</th>
                <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Type</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Lat</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Lon</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Speed</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Hdg</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Updated</th>
              </tr>
            </thead>
            <tbody>
              {vesselList.map(v => (
                <tr key={v.mmsi} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-2 py-1.5 font-medium text-foreground truncate max-w-[120px]">{v.name}</td>
                  <td className="px-2 py-1.5 text-muted-foreground font-mono">{v.mmsi}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{getShipTypeLabel(v.shipType)}</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground font-mono">{v.lat.toFixed(4)}</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground font-mono">{v.lon.toFixed(4)}</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">{v.speed.toFixed(1)} kn</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <Navigation size={8} style={{ transform: `rotate(${v.heading}deg)`, color: agentColor }} />
                      {v.heading}°
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">{formatTime(v.lastUpdate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Send to chat */}
      {onSendToChat && vesselList.length > 0 && (
        <button
          onClick={() => {
            const summary = vesselList.slice(0, 10).map(v =>
              `${v.name} (${v.mmsi}): ${v.lat.toFixed(4)}°S ${v.lon.toFixed(4)}°E, ${v.speed.toFixed(1)}kn, hdg ${v.heading}°`
            ).join("\n");
            onSendToChat(`Analyse these live AIS vessel positions in NZ waters:\n${summary}`);
          }}
          className="mt-3 text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-[0.98]"
          style={{ background: `${agentColor}15`, color: agentColor, border: `1px solid ${agentColor}25` }}
        >
          Analyse in Chat
        </button>
      )}
    </div>
  );
}
