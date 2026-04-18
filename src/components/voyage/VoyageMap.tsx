import { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TripConvoy, TripDestination, TripFamily } from "./types";

interface Props {
  center: [number, number];
  zoom: number;
  families: TripFamily[];
  destinations: TripDestination[];
  convoys: TripConvoy[];
  activeDayIndex: number;
}

// Auto-fit bounds whenever the active set of points changes
const FitBounds = ({ points }: { points: Array<[number, number]> }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 8, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [points, map]);
  return null;
};

const VoyageMap = ({ center, zoom, families, destinations, convoys, activeDayIndex }: Props) => {
  const points: Array<[number, number]> = [
    ...destinations.map((d) => [Number(d.lat), Number(d.lng)] as [number, number]),
    ...convoys.flatMap((c) =>
      c.origin_lat && c.origin_lng && c.destination_lat && c.destination_lng
        ? [
            [Number(c.origin_lat), Number(c.origin_lng)] as [number, number],
            [Number(c.destination_lat), Number(c.destination_lng)] as [number, number],
          ]
        : []
    ),
  ];

  return (
    <div className="h-[460px] sm:h-[560px] w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "hsl(var(--muted))" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Destination route between stops in order */}
        {destinations.length > 1 && (
          <Polyline
            positions={destinations.map((d) => [Number(d.lat), Number(d.lng)] as [number, number])}
            pathOptions={{ color: "hsl(var(--primary))", weight: 3, opacity: 0.5, dashArray: "6 8" }}
          />
        )}

        {/* Destination markers */}
        {destinations.map((d) => (
          <CircleMarker
            key={d.id}
            center={[Number(d.lat), Number(d.lng)]}
            radius={9}
            pathOptions={{
              color: d.color,
              fillColor: d.color,
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={false}>
              <span className="font-medium">{d.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Convoy routes for active day */}
        {convoys.map((c) => {
          const fam = families.find((f) => f.id === c.family_id);
          if (!fam || !c.origin_lat || !c.origin_lng || !c.destination_lat || !c.destination_lng) return null;
          const route: Array<[number, number]> = [
            [Number(c.origin_lat), Number(c.origin_lng)],
            [Number(c.destination_lat), Number(c.destination_lng)],
          ];
          return (
            <Fragment key={c.id}>
              <Polyline
                positions={route}
                pathOptions={{ color: fam.accent_color, weight: 3, opacity: 0.85 }}
              />
              <CircleMarker
                center={route[0]}
                radius={6}
                pathOptions={{ color: fam.accent_color, fillColor: "#fff", fillOpacity: 1, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  {fam.name} — depart {c.origin_label}
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}

        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
};

export default VoyageMap;
