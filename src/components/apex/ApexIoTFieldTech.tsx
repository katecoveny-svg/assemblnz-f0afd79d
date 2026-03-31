import { useState } from "react";
import { Thermometer, Droplets, Wind, Volume2, MapPin, Camera, Box, Radio, Wifi } from "lucide-react";

const SENSORS = [
  { id: "temp-1", label: "Concrete Temp", type: "temperature", value: 28.4, unit: "°C", status: "normal", icon: Thermometer, location: "Slab B2" },
  { id: "humid-1", label: "Site Humidity", type: "humidity", value: 72, unit: "%", status: "warning", icon: Droplets, location: "Excavation Zone" },
  { id: "dust-1", label: "Dust Level (PM10)", type: "dust", value: 38, unit: "µg/m³", status: "normal", icon: Wind, location: "Main Entrance" },
  { id: "noise-1", label: "Noise Level", type: "noise", value: 87, unit: "dB", status: "alert", icon: Volume2, location: "Pile Driving Area" },
  { id: "temp-2", label: "Ambient Temp", type: "temperature", value: 19.2, unit: "°C", status: "normal", icon: Thermometer, location: "Site Office" },
  { id: "vibe-1", label: "Vibration", type: "vibration", value: 4.2, unit: "mm/s", status: "normal", icon: Radio, location: "Adjacent Property" },
];

const EQUIPMENT = [
  { id: "eq-1", name: "Excavator CAT 320", status: "Active", location: "Zone A — Earthworks", lastPing: "2 min ago", fuel: 68 },
  { id: "eq-2", name: "Tower Crane #1", status: "Active", location: "Zone B — Structure", lastPing: "1 min ago", fuel: null },
  { id: "eq-3", name: "Concrete Pump", status: "Idle", location: "Yard", lastPing: "15 min ago", fuel: 42 },
  { id: "eq-4", name: "Roller Compactor", status: "Maintenance", location: "Workshop", lastPing: "3 hrs ago", fuel: 91 },
];

const statusColor = (s: string) =>
  s === "alert" ? "#FF4D4D" : s === "warning" ? "#FFB74D" : "#5AADA0";

const eqStatusColor = (s: string) =>
  s === "Active" ? "#5AADA0" : s === "Idle" ? "#FFB74D" : "#FF4D4D";

const ApexIoTFieldTech = () => {
  const [activePanel, setActivePanel] = useState<"sensors" | "trimble" | "drone" | "gps">("sensors");

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-syne font-bold text-lg text-foreground mb-1">IoT & Field Technology</h2>
        <p className="text-xs font-jakarta text-muted-foreground">Live site monitoring, BIM coordination, and aerial surveys</p>
      </div>

      {/* Panel tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: "sensors", label: "IoT Sensors", icon: <Wifi size={13} /> },
          { id: "trimble", label: "Trimble Connect", icon: <Box size={13} /> },
          { id: "drone", label: "DroneDeploy", icon: <Camera size={13} /> },
          { id: "gps", label: "Equipment GPS", icon: <MapPin size={13} /> },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePanel(p.id as any)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-jakarta font-medium transition-all"
            style={{
              background: activePanel === p.id ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
              color: activePanel === p.id ? "#5AADA0" : "rgba(255,255,255,0.5)",
              border: activePanel === p.id ? "1px solid rgba(0,255,136,0.2)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* IoT Sensor Dashboard */}
      {activePanel === "sensors" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SENSORS.map((sensor) => (
              <div
                key={sensor.id}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${statusColor(sensor.status)}20`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <sensor.icon size={14} style={{ color: statusColor(sensor.status) }} />
                    <span className="text-xs font-semibold text-foreground">{sensor.label}</span>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: `${statusColor(sensor.status)}15`, color: statusColor(sensor.status) }}
                  >
                    {sensor.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold font-mono" style={{ color: statusColor(sensor.status) }}>
                    {sensor.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{sensor.unit}</span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin size={9} /> {sensor.location}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Configure sensor thresholds and alert rules in the Integration Hub. Real-time data requires IoT sensor API key.
          </p>
        </div>
      )}

      {/* Trimble Connect */}
      {activePanel === "trimble" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-syne font-bold text-sm text-foreground mb-3">Trimble Connect — BIM Coordination</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "BIM Import", desc: "Import IFC/RVT models from Trimble Connect projects", icon: "" },
                { label: "Model Viewer", desc: "3D model viewing with clash detection and annotations", icon: "" },
                { label: "Equipment Tracking", desc: "Track machine hours, utilisation, and maintenance schedules", icon: "" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-lg mb-1 block">{item.icon}</span>
                  <span className="text-xs font-semibold text-foreground block mb-1">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Connect via Trimble Connect REST API. Configure your API key in Integration Hub → Trimble Connect.
            </p>
          </div>
        </div>
      )}

      {/* DroneDeploy */}
      {activePanel === "drone" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-syne font-bold text-sm text-foreground mb-3">DroneDeploy — Aerial Intelligence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Aerial Surveys", desc: "Orthomosaic maps and 3D site reconstructions from drone flights", icon: "" },
                { label: "Progress Photos", desc: "Automated site progress tracking with timestamped comparisons", icon: "" },
                { label: "Volume Calc", desc: "Cut & fill volume calculations from elevation data", icon: "" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-lg mb-1 block">{item.icon}</span>
                  <span className="text-xs font-semibold text-foreground block mb-1">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Connect via DroneDeploy Map Engine API. Configure your API key in Integration Hub → DroneDeploy.
            </p>
          </div>
        </div>
      )}

      {/* Equipment GPS Tracker */}
      {activePanel === "gps" && (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <h3 className="font-syne font-bold text-sm text-foreground">Equipment GPS Tracker</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {EQUIPMENT.map((eq) => (
                <div key={eq.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: eqStatusColor(eq.status) }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{eq.name}</span>
                      <span className="text-[10px] text-muted-foreground">{eq.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
                      style={{ background: `${eqStatusColor(eq.status)}15`, color: eqStatusColor(eq.status) }}
                    >
                      {eq.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{eq.lastPing}</span>
                    {eq.fuel !== null && (
                      <span className="text-[10px] text-muted-foreground"> {eq.fuel}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApexIoTFieldTech;
