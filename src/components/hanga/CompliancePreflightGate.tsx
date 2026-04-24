import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, HardHat, Users, MapPin, FileSignature, AlertCircle, CheckCircle2 } from "lucide-react";
import type { SupervisorComplianceContext } from "./SupervisorControls";
import {
  policySetIncludes,
  type CompliancePolicySet,
} from "./agentCompliancePolicies";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const ALERT_AMBER = "#C68A3D";
const ALERT_RED = "#B5483A";

interface Props {
  initial: SupervisorComplianceContext;
  policySet: CompliancePolicySet;
  onConfirm: (context: SupervisorComplianceContext) => void;
  onCancel: () => void;
}

const ZONE_PRESETS = [
  "Level 1 — Ground works",
  "Level 2 — Framing",
  "Level 3 — Services",
  "Roof / Working at height",
  "Yard / Laydown",
  "Other (custom)",
];

/**
 * Pre-flight compliance gate shown before the first chat turn in Waihanga.
 * Collects PPE, worker consent, tender sign-off, zone, and headcount cap.
 * Cannot be dismissed without confirming or cancelling.
 */
export function CompliancePreflightGate({ initial, policySet, onConfirm, onCancel }: Props) {
  const [ppe, setPpe] = useState(initial.ppeConfirmed);
  const [consent, setConsent] = useState(initial.workerConsent);
  const [signoff, setSignoff] = useState(initial.humanSignoff);
  const [zone, setZone] = useState<string>(initial.zone ?? ZONE_PRESETS[0]);
  const [customZone, setCustomZone] = useState("");
  const [headcount, setHeadcount] = useState(initial.world.headcount);
  const [headcountCap, setHeadcountCap] = useState(initial.world.headcountCap);
  const [attempted, setAttempted] = useState(false);

  const needsPpe = policySetIncludes(policySet, "ppe");
  const needsConsent = policySetIncludes(policySet, "worker_consent");
  const needsSignoff = policySetIncludes(policySet, "tender_signoff");
  const needsZone = policySetIncludes(policySet, "zone");
  const needsCap = policySetIncludes(policySet, "headcount_cap");

  const resolvedZone = zone === "Other (custom)" ? customZone.trim() : zone;
  const capValid = !needsCap || (headcountCap >= 1 && headcount >= 0 && headcount <= headcountCap);
  const zoneValid = !needsZone || resolvedZone.length > 0;
  const allValid =
    (!needsPpe || ppe) &&
    (!needsConsent || consent) &&
    (!needsSignoff || signoff) &&
    zoneValid &&
    capValid;

  const submit = () => {
    if (!allValid) {
      setAttempted(true);
      return;
    }
    onConfirm({
      ...initial,
      ppeConfirmed: needsPpe ? ppe : initial.ppeConfirmed,
      workerConsent: needsConsent ? consent : initial.workerConsent,
      humanSignoff: needsSignoff ? signoff : initial.humanSignoff,
      zone: needsZone ? resolvedZone : initial.zone,
      world: {
        ...initial.world,
        headcount: needsCap ? headcount : initial.world.headcount,
        headcountCap: needsCap ? headcountCap : initial.world.headcountCap,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${POUNAMU}20, ${TEAL_ACCENT}20)` }}
        >
          <ShieldCheck size={16} style={{ color: POUNAMU }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "#3D4250" }}>
            {policySet.label}
          </h3>
          <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
            {policySet.description}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* PPE confirmation */}
        {needsPpe && (
          <CheckRow
            icon={<HardHat size={14} style={{ color: TEAL_ACCENT }} />}
            label="PPE confirmation"
            description="All workers on site are in the correct PPE for today's tasks."
            checked={ppe}
            onChange={setPpe}
            attempted={attempted}
          />
        )}

        {/* Worker consent */}
        {needsConsent && (
          <CheckRow
            icon={<Users size={14} style={{ color: TEAL_ACCENT }} />}
            label="Worker consent"
            description="Workers consent to AI-assisted reporting and compliance review."
            checked={consent}
            onChange={setConsent}
            attempted={attempted}
          />
        )}

        {/* Tender / human sign-off */}
        {needsSignoff && (
          <CheckRow
            icon={<FileSignature size={14} style={{ color: TEAL_ACCENT }} />}
            label="Tender human sign-off"
            description="A nominated human has approved any tender drafts before submission."
            checked={signoff}
            onChange={setSignoff}
            attempted={attempted}
          />
        )}

        {/* Zone selection */}
        {needsZone && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin size={12} style={{ color: TEAL_ACCENT }} />
              <span className="text-[11px] font-medium" style={{ color: "#3D4250" }}>
                Active zone
              </span>
            </div>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-[11px] outline-none"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "#3D4250",
              }}
            >
              {ZONE_PRESETS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            {zone === "Other (custom)" && (
              <input
                value={customZone}
                onChange={(e) => setCustomZone(e.target.value)}
                placeholder="Enter zone label"
                maxLength={60}
                className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg text-[11px] outline-none"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${attempted && !zoneValid ? ALERT_RED : "rgba(0,0,0,0.08)"}`,
                  color: "#3D4250",
                }}
              />
            )}
            {attempted && !zoneValid && (
              <p className="text-[10px] mt-1" style={{ color: ALERT_RED }}>
                Enter a zone label.
              </p>
            )}
          </div>
        )}

        {/* Headcount cap */}
        {needsCap && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={12} style={{ color: TEAL_ACCENT }} />
              <span className="text-[11px] font-medium" style={{ color: "#3D4250" }}>
                Site headcount cap
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={headcount}
                onChange={(e) => setHeadcount(Math.max(0, Number(e.target.value) || 0))}
                className="w-16 px-2 py-1 rounded-lg text-[11px] outline-none text-right"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "#3D4250",
                }}
              />
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>on site /</span>
              <input
                type="number"
                min={1}
                value={headcountCap}
                onChange={(e) => setHeadcountCap(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 px-2 py-1 rounded-lg text-[11px] outline-none text-right"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${attempted && !capValid ? ALERT_RED : "rgba(0,0,0,0.08)"}`,
                  color: "#3D4250",
                }}
              />
              <span className="text-[10px]" style={{ color: "#9CA3AF" }}>cap</span>
            </div>
            {headcount > headcountCap * 0.85 && capValid && (
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: ALERT_AMBER }}>
                <AlertCircle size={10} /> Approaching cap — agent will warn on inductions.
              </p>
            )}
            {attempted && !capValid && (
              <p className="text-[10px] mt-1" style={{ color: ALERT_RED }}>
                Headcount must be between 0 and the cap.
              </p>
            )}
          </div>
        )}

        {attempted && !allValid && (
          <div
            className="flex items-start gap-2 p-2.5 rounded-lg"
            style={{ background: `${ALERT_RED}10`, border: `1px solid ${ALERT_RED}25` }}
          >
            <AlertCircle size={12} style={{ color: ALERT_RED, marginTop: 1 }} />
            <p className="text-[10px]" style={{ color: ALERT_RED }}>
              All compliance items must be confirmed before the agent can respond.
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ background: "rgba(0,0,0,0.04)", color: "#6B7280" }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!allValid}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
          style={{
            background: allValid ? `linear-gradient(135deg, ${POUNAMU}, ${TEAL_ACCENT})` : "rgba(0,0,0,0.06)",
            color: allValid ? "#fff" : "#9CA3AF",
          }}
        >
          <CheckCircle2 size={13} />
          Confirm and start chat
        </button>
      </div>
    </motion.div>
  );
}

function CheckRow({
  icon,
  label,
  description,
  checked,
  onChange,
  attempted,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  attempted: boolean;
}) {
  const showError = attempted && !checked;
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors"
      style={{
        background: checked ? "rgba(58,125,110,0.08)" : "rgba(255,255,255,0.7)",
        border: `1px solid ${
          showError ? `${ALERT_RED}40` : checked ? "rgba(58,125,110,0.25)" : "rgba(0,0,0,0.08)"
        }`,
      }}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: checked ? POUNAMU : "rgba(0,0,0,0.06)" }}
      >
        {checked ? (
          <CheckCircle2 size={12} color="#fff" />
        ) : (
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "transparent" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[11px] font-medium" style={{ color: "#3D4250" }}>
            {label}
          </span>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: "#6B7280" }}>
          {description}
        </p>
        {showError && (
          <p className="text-[10px] mt-1" style={{ color: ALERT_RED }}>
            Required.
          </p>
        )}
      </div>
    </button>
  );
}
