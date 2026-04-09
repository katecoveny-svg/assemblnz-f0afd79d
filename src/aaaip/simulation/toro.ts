// ═══════════════════════════════════════════════════════════════
// AAAIP — Tōro (Whānau Family Navigator) Digital Twin
//
// Simulates a typical NZ whānau receiving SMS-first messages from
// Tōro: school notices about tamariki, weekly meal ideas, budget
// alerts, learning prompts and appointment reminders. Some events
// include a wellbeing-crisis signal that must be hard-handed-off
// to a kaiāwhina.
// ═══════════════════════════════════════════════════════════════

export type ToroMessageKind =
  | "send_school_notice"
  | "send_meal_idea"
  | "send_budget_alert"
  | "send_learning_prompt"
  | "send_reminder";

export type RecipientType = "parent" | "caregiver" | "child";

export interface ToroMessage {
  id: string;
  kind: ToroMessageKind;
  label: string;
  recipientType: RecipientType;
  /** Whether the message references a child (name, school, health). */
  referencesChild: boolean;
  parentalConsent: boolean;
  /** True if the content classifier rates this message age-appropriate. */
  ageAppropriate: boolean;
  /** For budget alerts: recommendation risk tier. */
  recommendationRisk?: "low" | "medium" | "high";
  vulnerableHousehold: boolean;
  /** True if the crisis classifier fired on the upstream signal. */
  crisisFlag: boolean;
  /** Whether the message contains te reo Māori. */
  containsTeReo: boolean;
  teReoValidated: boolean;
  /** Data scope the action touches. */
  dataScope: "whanau" | "school" | "provider";
  arrivedAt: number;
}

export interface ToroWorld {
  now: number;
  /** Whether the household is flagged vulnerable by MSD/hardship signals. */
  vulnerableHousehold: boolean;
  /** Children registered with the navigator (used for displays). */
  childCount: number;
  inbox: ToroMessage[];
  sent: ToroMessage[];
  escalated: ToroMessage[];
  alerts: {
    crisisHandoffs: number;
    consentBlocks: number;
    financialBlocks: number;
    teReoReviews: number;
  };
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

const LABELS: Record<ToroMessageKind, string[]> = {
  send_school_notice: [
    "Assembly tomorrow 9am at school",
    "Cross-country — please pack running shoes",
    "Parent-teacher evening 6pm",
    "Kapa haka practice after school",
  ],
  send_meal_idea: [
    "Pasta night — under $8 for four",
    "Sunday roast — double up for lunches",
    "Bulk soup for the week",
    "Kūmara, mince and salad",
  ],
  send_budget_alert: [
    "Power bill due Friday",
    "Rent auto-pay tomorrow",
    "Groceries tracking over budget this week",
    "Weekly budget check-in",
  ],
  send_learning_prompt: [
    "Reading quiz for Year 3 tonight",
    "Māths practice — 10 minutes",
    "Te reo word of the day",
    "STEM activity: paper bridge",
  ],
  send_reminder: [
    "Dentist appointment tomorrow 10am",
    "GP check-up Friday",
    "WoF expiring next week",
    "School lunch order cut-off 8am",
  ],
};

export interface ToroSimOptions {
  seed?: number;
  arrivalRate?: number;
  vulnerableHousehold?: boolean;
  childCount?: number;
}

export class ToroSimulator {
  readonly world: ToroWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private counter = 0;

  constructor(opts: ToroSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 83);
    this.arrivalRate = opts.arrivalRate ?? 0.7;
    this.world = {
      now: 0,
      vulnerableHousehold: opts.vulnerableHousehold ?? false,
      childCount: opts.childCount ?? 2,
      inbox: [],
      sent: [],
      escalated: [],
      alerts: { crisisHandoffs: 0, consentBlocks: 0, financialBlocks: 0, teReoReviews: 0 },
    };
  }

  tick() {
    this.world.now += 1;
    if (this.rng() < this.arrivalRate) this.world.inbox.push(this.spawnMessage());
  }

  send(messageId: string): boolean {
    const msg = this.world.inbox.find((m) => m.id === messageId);
    if (!msg) return false;
    this.world.sent.push(msg);
    this.world.inbox = this.world.inbox.filter((m) => m.id !== messageId);
    return true;
  }

  escalate(messageId: string): boolean {
    const msg = this.world.inbox.find((m) => m.id === messageId);
    if (!msg) return false;
    this.world.escalated.push(msg);
    this.world.inbox = this.world.inbox.filter((m) => m.id !== messageId);
    return true;
  }

  drop(messageId: string) {
    this.world.inbox = this.world.inbox.filter((m) => m.id !== messageId);
  }

  injectWellbeingCrisis() {
    this.counter += 1;
    this.world.inbox.push({
      id: `toro-${this.counter}`,
      kind: "send_reminder",
      label: "Inbound message contains crisis keywords",
      recipientType: "parent",
      referencesChild: true,
      parentalConsent: true,
      ageAppropriate: true,
      vulnerableHousehold: true,
      crisisFlag: true,
      containsTeReo: false,
      teReoValidated: true,
      dataScope: "whanau",
      arrivedAt: this.world.now,
    });
    this.world.alerts.crisisHandoffs += 1;
  }

  injectHighRiskBudgetAdvice() {
    this.counter += 1;
    this.world.inbox.push({
      id: `toro-${this.counter}`,
      kind: "send_budget_alert",
      label: "Consider a short-term loan to cover groceries",
      recipientType: "parent",
      referencesChild: false,
      parentalConsent: true,
      ageAppropriate: true,
      recommendationRisk: "high",
      vulnerableHousehold: true,
      crisisFlag: false,
      containsTeReo: false,
      teReoValidated: true,
      dataScope: "whanau",
      arrivedAt: this.world.now,
    });
    this.world.alerts.financialBlocks += 1;
  }

  injectChildMessageWithoutConsent() {
    this.counter += 1;
    this.world.inbox.push({
      id: `toro-${this.counter}`,
      kind: "send_school_notice",
      label: "Report card summary for your child",
      recipientType: "parent",
      referencesChild: true,
      parentalConsent: false,
      ageAppropriate: true,
      vulnerableHousehold: this.world.vulnerableHousehold,
      crisisFlag: false,
      containsTeReo: false,
      teReoValidated: true,
      dataScope: "whanau",
      arrivedAt: this.world.now,
    });
    this.world.alerts.consentBlocks += 1;
  }

  reset() {
    this.world.now = 0;
    this.world.inbox = [];
    this.world.sent = [];
    this.world.escalated = [];
    this.world.alerts = { crisisHandoffs: 0, consentBlocks: 0, financialBlocks: 0, teReoReviews: 0 };
    this.counter = 0;
  }

  private spawnMessage(): ToroMessage {
    this.counter += 1;
    const kinds: ToroMessageKind[] = [
      "send_school_notice",
      "send_meal_idea",
      "send_budget_alert",
      "send_learning_prompt",
      "send_reminder",
    ];
    const kind = kinds[Math.floor(this.rng() * kinds.length)];
    const labels = LABELS[kind];
    const label = labels[Math.floor(this.rng() * labels.length)];
    const recipientType: RecipientType = this.rng() < 0.15 ? "child" : "parent";
    const referencesChild =
      kind === "send_school_notice" || kind === "send_learning_prompt" || this.rng() < 0.2;
    const parentalConsent = referencesChild ? this.rng() > 0.1 : true;
    const ageAppropriate = recipientType === "child" ? this.rng() > 0.07 : true;
    const recommendationRisk: "low" | "medium" | "high" =
      kind === "send_budget_alert"
        ? (this.rng() < 0.05 ? "high" : this.rng() < 0.3 ? "medium" : "low")
        : "low";
    const containsTeReo = this.rng() < 0.18;
    const teReoValidated = containsTeReo ? this.rng() > 0.4 : true;
    if (containsTeReo && !teReoValidated) this.world.alerts.teReoReviews += 1;
    return {
      id: `toro-${this.counter}`,
      kind,
      label,
      recipientType,
      referencesChild,
      parentalConsent,
      ageAppropriate,
      recommendationRisk,
      vulnerableHousehold: this.world.vulnerableHousehold,
      crisisFlag: false,
      containsTeReo,
      teReoValidated,
      dataScope: "whanau",
      arrivedAt: this.world.now,
    };
  }
}
