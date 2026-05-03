import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat, ShieldAlert, ShieldCheck, Lock, Unlock,
  ChevronDown, ChevronUp, Plus, X, Users,
} from "lucide-react";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const ALERT_AMBER = "#C68A3D";
const ALERT_RED = "#B5483A";

export interface SupervisorComplianceContext {
  ppeConfirmed: boolean;
  workerConsent: boolean;
  containsWorkers: boolean;
  humanSignoff: boolean;
  zone: string | null;
  world: {
    headcount: number;
    headcountCap: number;
    criticalHazardZones: string[];
  };
}

export const DEFAULT_SUPERVISOR_CONTEXT: SupervisorComplianceContext = {
  ppeConfirmed: true,
  workerConsent: false,
  containsWorkers: false,
  humanSignoff: false,
  zone: null,
  world: {
    headcount: 12,
    headcountCap: 40,
    criticalHazardZones: [],
  },
};

interface Props {
  context: SupervisorComplianceContext;
  onChange: (next: SupervisorComplianceContext) => void;
  onSystemNote?: (note: string) => void;
}

export function SupervisorControls({ context, onChange, onSystemNote }: Props) {
  const [open, setOpen] = useState(false);
  const [newZone, setNewZone] = useState("");

  const update = (patch: Partial<SupervisorComplianceContext>) =>
    onChange({ ...context, ...patch });

  const updateWorld = (patch: Partial<SupervisorComplianceContext["world"]>) =>
    onChange({ ...context, world: { ...context.world, ...patch } });

  const injectHazard = () => {
    const zone = newZone.trim() || `Zone-${context.world.criticalHazardZones.length + 1}`;
    if (context.world.criticalHazardZones.includes(zone)) {
      onSystemNote?.(`Hazard already active on ${zone}.`);
      return;
    }
    updateWorld({
      criticalHazardZones: [...context.world.criticalHazardZones, zone],
    });
    onChange({
      ...context,
      zone,
      world: {
        ...context.world,
        criticalHazardZones: [...context.world.criticalHazardZones, zone],
      },
    });
    setNewZone("");
    onSystemNote?.(
      `Critical hazard injected on ${zone}. Only escalation actions allowed for this zone until cleared.`,
    );
  };

  const escalateHazard = (zone: string) => {
    onSystemNote?.(
      `Hazard on ${zone} escalated to site supervisor. Awaiting on-site verification before clearance.`,
    );
  };

  const clearHazard = (zone: string) => {
    const next = context.world.criticalHazardZones.filter((z) => z !== zone);
    onChange({
      ...context,
      zone: context.zone === zone ? null : context.zone,
      world: { ...context.world, criticalHazardZones: next },
    });
    onSystemNote?.(`${zone} cleared by supervisor. Standard activities may resume.`);
  };

  const atCap = context.world.headcount >= context.world.headcountCap;
  const hazardCount = context.world.criticalHazardZones.length;

  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(74,165,168,0.04)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors hover:bg-black/[0.02]"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: hazardCount > 0 ? `${ALERT_RED}15` : `${POUNAMU}15` }}
          >
            <HardHat
              size={13}
              style={{ color: hazardCount > 0 ? ALERT_RED : POUNAMU }}
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#3D4250" }}>
            Site Supervisor Controls
          </span>
          {hazardCount > 0 && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${ALERT_RED}15`, color: ALERT_RED }}
            >
              {hazardCount} active hazard{hazardCount > 1 ? "s" : ""}
            </span>
          )}
          {atCap && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${ALERT_AMBER}15`, color: ALERT_AMBER }}
            >
              At capacity
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={14} style={{ color: "#9CA3AF" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 space-y-3">
              {/* Hazard injection */}
              <div>
                <div className="text-[10px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>
                  Inject critical hazard
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && injectHazard()}
                    placeholder="Zone label (e.g. Level 3 East)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] outline-none"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "#3D4250",
                    }}
                  />
                  <button
                    onClick={injectHazard}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                    style={{ background: `${ALERT_RED}15`, color: ALERT_RED }}
                  >
                    <ShieldAlert size={12} /> Inject
                  </button>
                </div>
              </div>

              {/* Active hazard zones */}
              {hazardCount > 0 && (
                <div>
                  <div className="text-[10px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>
                    Locked zones
                  </div>
                  <div className="space-y-1">
                    {context.world.criticalHazardZones.map((zone) => (
                      <div
                        key={zone}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.7)",
                          border: `1px solid ${ALERT_RED}30`,
                        }}
                      >
                        <Lock size={11} style={{ color: ALERT_RED }} />
                        <span className="flex-1 text-[11px]" style={{ color: "#3D4250" }}>
                          {zone}
                        </span>
                        <button
                          onClick={() => escalateHazard(zone)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
                          style={{ background: `${ALERT_AMBER}15`, color: ALERT_AMBER }}
                          title="Escalate to site supervisor"
                        >
                          Escalate
                        </button>
                        <button
                          onClick={() => clearHazard(zone)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
                          style={{ background: `${POUNAMU}15`, color: POUNAMU }}
                          title="Clear hazard and unlock zone (supervisor sign-off)"
                        >
                          <Unlock size={9} /> Unlock
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] mt-1" style={{ color: "#9CA3AF" }}>
                    Unlocking a zone requires on-site verification. The agent will refuse all non-escalation actions until cleared.
                  </p>
                </div>
              )}

              {/* Site headcount */}
              <div>
                <div className="text-[10px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>
                  Site headcount
                </div>
                <div className="flex items-center gap-2">
                  <Users size={12} style={{ color: TEAL_ACCENT }} />
                  <input
                    type="number"
                    value={context.world.headcount}
                    onChange={(e) =>
                      updateWorld({ headcount: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="w-14 px-2 py-1 rounded-lg text-[11px] outline-none text-right"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "#3D4250",
                    }}
                  />
                  <span className="text-[11px]" style={{ color: "#9CA3AF" }}>/</span>
                  <input
                    type="number"
                    value={context.world.headcountCap}
                    onChange={(e) =>
                      updateWorld({ headcountCap: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-14 px-2 py-1 rounded-lg text-[11px] outline-none text-right"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "#3D4250",
                    }}
                  />
                  <span className="text-[10px]" style={{ color: "#9CA3AF" }}>workers</span>
                </div>
              </div>

              {/* Compliance toggles */}
              <div>
                <div className="text-[10px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>
                  Compliance flags
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Toggle
                    label="PPE confirmed"
                    value={context.ppeConfirmed}
                    onChange={(v) => update({ ppeConfirmed: v })}
                  />
                  <Toggle
                    label="Worker consent"
                    value={context.workerConsent}
                    onChange={(v) => update({ workerConsent: v })}
                  />
                  <Toggle
                    label="Photo has workers"
                    value={context.containsWorkers}
                    onChange={(v) => update({ containsWorkers: v })}
                  />
                  <Toggle
                    label="Tender sign-off"
                    value={context.humanSignoff}
                    onChange={(v) => update({ humanSignoff: v })}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[10px] transition-colors"
      style={{
        background: value ? "rgba(58,125,110,0.10)" : "rgba(255,255,255,0.6)",
        border: value
          ? "1px solid rgba(58,125,110,0.25)"
          : "1px solid rgba(0,0,0,0.08)",
        color: value ? POUNAMU : "#6B7280",
      }}
    >
      <span className="truncate text-left">{label}</span>
      {value ? <ShieldCheck size={11} /> : <X size={11} />}
    </button>
  );
}
