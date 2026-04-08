// ═══════════════════════════════════════════════════════════════
// AAAIP — Human-Robot Workspace Digital Twin
// A deterministic, seedable simulator for a manufacturing /
// agriculture co-task. The robot moves between zones, the human
// operator drifts around the workspace, and sensors report
// position with noise that the agent must reason about.
// ═══════════════════════════════════════════════════════════════

export type ZoneId = "safe" | "shared" | "workbench" | "restricted";
export type HumanIntent = "helping" | "inspecting" | "away" | "unknown";

export interface RobotTask {
  id: string;
  /** Human-readable label shown in the dashboard. */
  label: string;
  /** Zone the robot must reach to execute this task. */
  targetZone: ZoneId;
  /** End-effector force in newtons required by this task. */
  forceN: number;
  /** Default speed for the move in mm/s. */
  speedMmS: number;
  /** Whether this task requires a tool change before execution. */
  toolChange: boolean;
  /** Set when the task has finished (booked from the queue). */
  completed: boolean;
}

export interface RobotWorld {
  now: number;
  /** Zones where the perception stack currently detects a human. */
  humanZones: ZoneId[];
  /** Operator intent classification, with confidence. */
  humanIntent: HumanIntent;
  humanIntentConfidence: number;
  /** Sensor reliability score, 0–1. Drops when the env is noisy. */
  sensorReliability: number;
  /** Configured collaborative limits — read by policy predicates. */
  forceLimitN: number;
  collaborativeSpeedMmS: number;
  /** Current robot location. */
  robotZone: ZoneId;
  /** Current end-effector / tool. */
  currentTool: string;
  /** Pending tasks the agent hasn't dispatched yet. */
  taskQueue: RobotTask[];
  /** Tasks the robot has executed. */
  completedTasks: RobotTask[];
}

export type RobotEvent =
  | { type: "tick"; tick: number }
  | { type: "human_entered"; zone: ZoneId; tick: number }
  | { type: "human_left"; zone: ZoneId; tick: number }
  | { type: "sensor_degraded"; reliability: number; tick: number }
  | { type: "task_added"; task: RobotTask; tick: number };

// ── Pseudo-random LCG ─────────────────────────────────────────

function makeRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

const ALL_ZONES: ZoneId[] = ["safe", "shared", "workbench", "restricted"];
const TASK_TEMPLATES: Array<Omit<RobotTask, "id" | "completed">> = [
  { label: "Pick crate from shared bench", targetZone: "shared", forceN: 30, speedMmS: 200, toolChange: false },
  { label: "Place crate on workbench", targetZone: "workbench", forceN: 25, speedMmS: 220, toolChange: false },
  { label: "Hand part to operator", targetZone: "shared", forceN: 15, speedMmS: 150, toolChange: false },
  { label: "Heavy weld at workbench", targetZone: "workbench", forceN: 120, speedMmS: 180, toolChange: true },
  { label: "Inspect restricted area", targetZone: "restricted", forceN: 5, speedMmS: 300, toolChange: false },
  { label: "Pack-out at safe zone", targetZone: "safe", forceN: 20, speedMmS: 350, toolChange: false },
];

// ── Simulator ─────────────────────────────────────────────────

export interface RobotSimOptions {
  seed?: number;
  /** Probability per tick a new task is added. */
  taskRate?: number;
  /** Probability per tick the operator moves to a different zone. */
  humanMoveRate?: number;
  /** Probability per tick the sensor reliability drifts. */
  sensorNoiseRate?: number;
}

export class RobotSimulator {
  readonly world: RobotWorld;
  private readonly rng: () => number;
  private readonly taskRate: number;
  private readonly humanMoveRate: number;
  private readonly sensorNoiseRate: number;
  private taskCounter = 0;

  constructor(opts: RobotSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 11);
    this.taskRate = opts.taskRate ?? 0.45;
    this.humanMoveRate = opts.humanMoveRate ?? 0.35;
    this.sensorNoiseRate = opts.sensorNoiseRate ?? 0.12;

    this.world = {
      now: 0,
      humanZones: ["safe"],
      humanIntent: "helping",
      humanIntentConfidence: 0.9,
      sensorReliability: 0.95,
      forceLimitN: 80,
      collaborativeSpeedMmS: 250,
      robotZone: "safe",
      currentTool: "gripper",
      taskQueue: [],
      completedTasks: [],
    };
  }

  /** Advance one tick. Returns the events that fired. */
  tick(): RobotEvent[] {
    this.world.now += 1;
    const events: RobotEvent[] = [{ type: "tick", tick: this.world.now }];

    // Human movement.
    if (this.rng() < this.humanMoveRate) {
      const next = ALL_ZONES[Math.floor(this.rng() * ALL_ZONES.length)];
      const previous = this.world.humanZones[0];
      if (next !== previous) {
        if (previous) events.push({ type: "human_left", zone: previous, tick: this.world.now });
        this.world.humanZones = [next];
        events.push({ type: "human_entered", zone: next, tick: this.world.now });
        this.recomputeIntent();
      }
    }

    // Sensor noise drift.
    if (this.rng() < this.sensorNoiseRate) {
      const drift = (this.rng() - 0.5) * 0.4;
      this.world.sensorReliability = Math.max(
        0.4,
        Math.min(1, this.world.sensorReliability + drift),
      );
      events.push({
        type: "sensor_degraded",
        reliability: this.world.sensorReliability,
        tick: this.world.now,
      });
    } else {
      // Slow recovery toward 0.95 over time.
      this.world.sensorReliability = Math.min(0.95, this.world.sensorReliability + 0.02);
    }

    // New task arrivals.
    if (this.rng() < this.taskRate) {
      const tpl = TASK_TEMPLATES[Math.floor(this.rng() * TASK_TEMPLATES.length)];
      this.taskCounter += 1;
      const task: RobotTask = {
        id: `task-${this.taskCounter}`,
        completed: false,
        ...tpl,
      };
      this.world.taskQueue.push(task);
      events.push({ type: "task_added", task, tick: this.world.now });
    }

    return events;
  }

  /**
   * Apply an executed move/task. Returns true if the simulator
   * accepted the action. Caller is expected to have run the policy
   * engine first; this is defence-in-depth only.
   */
  applyTaskExecution(taskId: string): boolean {
    const idx = this.world.taskQueue.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;
    const task = this.world.taskQueue[idx];
    // Refuse to execute if a human is in the target zone.
    if (this.world.humanZones.includes(task.targetZone)) return false;
    this.world.taskQueue.splice(idx, 1);
    this.world.completedTasks.push({ ...task, completed: true });
    this.world.robotZone = task.targetZone;
    if (task.toolChange) this.world.currentTool = task.id.includes("weld") ? "welder" : "gripper";
    return true;
  }

  /** Drop a task without executing it (used by human "reject"). */
  dropTask(taskId: string) {
    this.world.taskQueue = this.world.taskQueue.filter((t) => t.id !== taskId);
  }

  /** Force-inject an operator entry into a zone (used by demo button). */
  injectHumanIntoZone(zone: ZoneId) {
    this.world.humanZones = [zone];
    this.recomputeIntent();
  }

  /** Force-degrade the sensors (used by demo button). */
  injectSensorFailure() {
    this.world.sensorReliability = 0.55;
  }

  reset() {
    this.world.now = 0;
    this.world.humanZones = ["safe"];
    this.world.humanIntent = "helping";
    this.world.humanIntentConfidence = 0.9;
    this.world.sensorReliability = 0.95;
    this.world.robotZone = "safe";
    this.world.currentTool = "gripper";
    this.world.taskQueue = [];
    this.world.completedTasks = [];
    this.taskCounter = 0;
  }

  // ── Internals ────────────────────────────────────────────

  private recomputeIntent() {
    const zone = this.world.humanZones[0];
    if (!zone) {
      this.world.humanIntent = "away";
      this.world.humanIntentConfidence = 0.95;
      return;
    }
    if (zone === "safe") {
      this.world.humanIntent = "inspecting";
      this.world.humanIntentConfidence = 0.8;
    } else if (zone === "shared") {
      this.world.humanIntent = this.rng() > 0.5 ? "helping" : "unknown";
      this.world.humanIntentConfidence = this.world.humanIntent === "unknown" ? 0.4 : 0.8;
    } else if (zone === "workbench") {
      this.world.humanIntent = "inspecting";
      this.world.humanIntentConfidence = 0.75;
    } else {
      this.world.humanIntent = "unknown";
      this.world.humanIntentConfidence = 0.3;
    }
  }
}
