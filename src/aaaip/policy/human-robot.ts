// ═══════════════════════════════════════════════════════════════
// AAAIP — Human-Robot Collaboration Policies
// Reference policies for the manufacturing/agriculture co-task
// pilot. Mirrors the clinic library's shape so the runtime
// engine can consume it without changes.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id,
  passed: true,
  severity,
  message: "ok",
});

const fail = (
  id: string,
  severity: Policy["severity"],
  message: string,
): PolicyEvaluation => ({
  policyId: id,
  passed: false,
  severity,
  message,
});

// ── Policies ─────────────────────────────────────────────────

const HUMAN_IN_ZONE: Policy = {
  id: "robot.no_motion_in_human_zone",
  domain: "human_robot_collab",
  name: "Stop on human-in-zone",
  rationale:
    "The robot must not enter or move within a workcell zone where a human is currently detected by any sensor.",
  source: "ISO/TS 15066 Collaborative robots — speed & separation monitoring",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "human-in-the-loop"],
};

const humanInZonePredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "move_to_zone") return pass(HUMAN_IN_ZONE.id, "block");
  const target = action.payload.targetZone as string | undefined;
  const occupied = (ctx.world.humanZones as string[]) ?? [];
  if (target && occupied.includes(target)) {
    return fail(
      HUMAN_IN_ZONE.id,
      "block",
      `Zone ${target} currently has a human present. Motion blocked.`,
    );
  }
  return pass(HUMAN_IN_ZONE.id, "block");
};

const FORCE_LIMIT: Policy = {
  id: "robot.force_limit",
  domain: "human_robot_collab",
  name: "Force / payload limit",
  rationale:
    "End-effector force must not exceed the configured collaborative limit when a human is in any shared zone.",
  source: "ISO 10218-2 + ISO/TS 15066 — biomechanical thresholds",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "physical"],
};

const forceLimitPredicate: PolicyPredicate = (action, ctx) => {
  const force = (action.payload.forceN as number | undefined) ?? 0;
  const limit = (ctx.world.forceLimitN as number | undefined) ?? 80;
  const humansPresent = ((ctx.world.humanZones as string[]) ?? []).length > 0;
  if (humansPresent && force > limit) {
    return fail(
      FORCE_LIMIT.id,
      "block",
      `Action requires ${force} N — exceeds ${limit} N collaborative limit.`,
    );
  }
  return pass(FORCE_LIMIT.id, "block");
};

const SPEED_NEAR_HUMAN: Policy = {
  id: "robot.speed_near_human",
  domain: "human_robot_collab",
  name: "Speed reduction near human",
  rationale:
    "When a human is in a shared zone, end-effector speed must drop below the collaborative threshold.",
  source: "ISO/TS 15066 — speed & separation monitoring",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["safety"],
};

const speedNearHumanPredicate: PolicyPredicate = (action, ctx) => {
  const speed = (action.payload.speedMmS as number | undefined) ?? 0;
  const limit = (ctx.world.collaborativeSpeedMmS as number | undefined) ?? 250;
  const humansPresent = ((ctx.world.humanZones as string[]) ?? []).length > 0;
  if (humansPresent && speed > limit) {
    return fail(
      SPEED_NEAR_HUMAN.id,
      "warn",
      `Speed ${speed} mm/s exceeds ${limit} mm/s collaborative threshold.`,
    );
  }
  return pass(SPEED_NEAR_HUMAN.id, "warn");
};

const INTENT_CONFIRMATION: Policy = {
  id: "robot.intent_confirmation",
  domain: "human_robot_collab",
  name: "Confirm ambiguous human intent",
  rationale:
    "If sensor fusion cannot classify the operator's intent (handing-off vs. inspecting vs. away), the robot must request confirmation before proceeding.",
  source: "AAAIP human-in-the-loop principle + IEC 61508 SIL functional safety",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight", "intent"],
};

const intentConfirmationPredicate: PolicyPredicate = (action, ctx) => {
  const intent = (ctx.world.humanIntent as string | undefined) ?? "unknown";
  const intentConfidence = (ctx.world.humanIntentConfidence as number | undefined) ?? 1;
  if (intent === "unknown" || intentConfidence < 0.6) {
    return fail(
      INTENT_CONFIRMATION.id,
      "warn",
      `Operator intent unclear (intent="${intent}", confidence=${intentConfidence.toFixed(2)}). Request confirmation.`,
    );
  }
  return pass(INTENT_CONFIRMATION.id, "warn");
};

const SENSOR_HEALTH: Policy = {
  id: "robot.sensor_health",
  domain: "human_robot_collab",
  name: "Sensor health gate",
  rationale:
    "If perception sensors degrade below the safety-rated reliability, all autonomous motion is blocked.",
  source: "IEC 61496 — electro-sensitive protective equipment",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "perception"],
};

const sensorHealthPredicate: PolicyPredicate = (action, ctx) => {
  const reliability = (ctx.world.sensorReliability as number | undefined) ?? 1;
  if (reliability < 0.75) {
    return fail(
      SENSOR_HEALTH.id,
      "block",
      `Sensor reliability ${reliability.toFixed(2)} below 0.75 safety threshold.`,
    );
  }
  return pass(SENSOR_HEALTH.id, "block");
};

const TOOL_CHANGE_ACK: Policy = {
  id: "robot.tool_change_ack",
  domain: "human_robot_collab",
  name: "Tool change acknowledgement",
  rationale:
    "End-effector / tool changes require explicit operator acknowledgement before motion resumes.",
  source: "Operational standard — manufacturer-defined safe state",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["safety", "operational"],
};

const toolChangeAckPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "change_tool") return pass(TOOL_CHANGE_ACK.id, "warn");
  const ack = action.payload.operatorAck as boolean | undefined;
  if (ack !== true) {
    return fail(
      TOOL_CHANGE_ACK.id,
      "warn",
      "Tool change requires operator acknowledgement.",
    );
  }
  return pass(TOOL_CHANGE_ACK.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "robot.uncertainty_handoff",
  domain: "human_robot_collab",
  name: "Defer to humans when uncertain",
  rationale:
    "If the agent's confidence in a motion plan is below the configured threshold, escalate to a human supervisor.",
  source: "AAAIP safe-operation principle: human-in-the-loop fallback",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight", "human-in-the-loop"],
};

const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(
      UNCERTAINTY.id,
      "warn",
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)} — requesting human approval.`,
    );
  }
  return pass(UNCERTAINTY.id, "warn");
};

// ── Public registry ──────────────────────────────────────────

export const ROBOT_POLICIES: RegisteredPolicy[] = [
  { policy: HUMAN_IN_ZONE, predicate: humanInZonePredicate },
  { policy: FORCE_LIMIT, predicate: forceLimitPredicate },
  { policy: SPEED_NEAR_HUMAN, predicate: speedNearHumanPredicate },
  { policy: INTENT_CONFIRMATION, predicate: intentConfirmationPredicate },
  { policy: SENSOR_HEALTH, predicate: sensorHealthPredicate },
  { policy: TOOL_CHANGE_ACK, predicate: toolChangeAckPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];

export const ROBOT_POLICY_METADATA: Policy[] = ROBOT_POLICIES.map((p) => p.policy);
