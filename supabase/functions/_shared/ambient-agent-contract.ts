export type KeteSlug =
  | "waihanga"
  | "manaaki"
  | "pikau"
  | "arataki"
  | "auaha"
  | "ako"
  | "matauranga"
  | "hoko"
  | "toro";

export type AmbientAction =
  | "morning-briefing"
  | "ambient-thought"
  | "draft"
  | "evidence-pack"
  | "escalate"
  | "send";

export type AgentPhase = "hunt" | "pitch" | "execution" | "ledger" | "infra";

export type AmbientAgentSpec = {
  slug: string;
  name: string;
  kete: KeteSlug;
  phase: AgentPhase;
  endpoint: string;
  systemPrompt: string;
};

export type AmbientRunRequest = {
  action: AmbientAction;
  tenant_id: string;
  tenant_slug?: string;
  kete: KeteSlug;
  agent: string;
  phase?: AgentPhase;
  prompt?: string;
  live_context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type AmbientDraft = {
  title: string;
  body: string;
  confidence: number;
  citations: string[];
  extracted_actions: Array<Record<string, unknown>>;
};

export const FLEET_AGENT_SLUGS_BY_KETE: Record<KeteSlug, string[]> = {
  waihanga: ["hapori", "kaupapa", "ata", "rawa", "whakaae", "pai", "arai", "iho", "signal"],
  manaaki: ["manuhiri", "aura", "kai", "hau", "mahi", "pai", "putea", "iho", "signal"],
  pikau: ["morunga", "gateway", "pikau", "transit", "transit-freight", "arai", "iho", "signal"],
  arataki: ["motor", "whaikorero", "whare", "rawa", "whakaae", "pai", "iho", "signal"],
  auaha: ["muse", "prism", "vessel-studio", "saffron", "pai", "putea", "iho", "signal"],
  ako: ["aroha", "ako-licence", "kaiako", "tamariki", "ero-pack", "iho", "signal"],
  matauranga: ["akonga", "kaiako-s", "reo", "ropu", "ero-s", "iho", "signal"],
  hoko: ["spark", "hoko-cga", "stock", "cellar", "pai", "putea", "iho", "signal"],
  toro: ["toro", "iho", "signal"],
};

const PHASE_BY_SLUG: Record<string, AgentPhase> = {
  iho: "infra",
  signal: "infra",
  hapori: "hunt",
  kaupapa: "pitch",
  ata: "execution",
  rawa: "execution",
  whakaae: "execution",
  pai: "ledger",
  arai: "ledger",
  manuhiri: "hunt",
  aura: "pitch",
  kai: "execution",
  hau: "execution",
  mahi: "execution",
  putea: "ledger",
  morunga: "hunt",
  gateway: "pitch",
  pikau: "execution",
  transit: "execution",
  "transit-freight": "execution",
  motor: "hunt",
  whaikorero: "pitch",
  whare: "execution",
  muse: "hunt",
  prism: "pitch",
  "vessel-studio": "execution",
  saffron: "execution",
  aroha: "hunt",
  "ako-licence": "pitch",
  kaiako: "execution",
  tamariki: "execution",
  "ero-pack": "ledger",
  akonga: "hunt",
  "kaiako-s": "execution",
  reo: "pitch",
  ropu: "execution",
  "ero-s": "ledger",
  spark: "hunt",
  "hoko-cga": "pitch",
  stock: "execution",
  cellar: "ledger",
  toro: "execution",
};

const DISPLAY_NAME_BY_SLUG: Record<string, string> = {
  iho: "Iho",
  signal: "Signal",
  hapori: "Hapori",
  kaupapa: "Kaupapa",
  ata: "Ata",
  rawa: "Rawa",
  whakaae: "Whakaae",
  pai: "Pai",
  arai: "Arai",
  manuhiri: "Manuhiri",
  aura: "Aura",
  kai: "Kai",
  hau: "Hau",
  mahi: "Mahi",
  putea: "Putea",
  morunga: "Morunga",
  gateway: "Gateway",
  pikau: "Pikau",
  transit: "Transit",
  "transit-freight": "Transit Freight",
  motor: "Motor",
  whaikorero: "Whaikorero",
  whare: "Whare",
  muse: "Muse",
  prism: "Prism",
  "vessel-studio": "Vessel Studio",
  saffron: "Saffron",
  aroha: "Aroha",
  "ako-licence": "Ako Licence",
  kaiako: "Kaiako",
  tamariki: "Tamariki",
  "ero-pack": "ERO Pack",
  akonga: "Akonga",
  "kaiako-s": "Kaiako",
  reo: "Reo",
  ropu: "Ropu",
  "ero-s": "ERO Pack",
  spark: "Spark",
  "hoko-cga": "Hoko CGA",
  stock: "Stock",
  cellar: "Cellar",
  toro: "Toro",
};

export function isKeteSlug(value: unknown): value is KeteSlug {
  return typeof value === "string" && value in FLEET_AGENT_SLUGS_BY_KETE;
}

export function isAmbientAction(value: unknown): value is AmbientAction {
  return (
    value === "morning-briefing" ||
    value === "ambient-thought" ||
    value === "draft" ||
    value === "evidence-pack" ||
    value === "escalate" ||
    value === "send"
  );
}

export function fleetForKete(kete: KeteSlug): AmbientAgentSpec[] {
  return FLEET_AGENT_SLUGS_BY_KETE[kete].map((slug) => agentSpecFor(kete, slug));
}

export function agentSpecFor(kete: KeteSlug, slug: string): AmbientAgentSpec {
  const phase = PHASE_BY_SLUG[slug] ?? "execution";
  return {
    slug,
    name: DISPLAY_NAME_BY_SLUG[slug] ?? slug,
    kete,
    phase,
    endpoint: `agent-${kete}`,
    systemPrompt:
      `You are ${DISPLAY_NAME_BY_SLUG[slug] ?? slug}, part of the ${kete} kete fleet. ` +
      "Prepare operator-ready work that is concise, evidence-aware, and held for human approval.",
  };
}

export function inferKeteForAgent(slug: string): KeteSlug {
  for (const [kete, agents] of Object.entries(FLEET_AGENT_SLUGS_BY_KETE) as Array<[KeteSlug, string[]]>) {
    if (agents.includes(slug)) return kete;
  }
  return "toro";
}

export function requiredScopesForAmbientRun(kete: KeteSlug, action: AmbientAction) {
  const base = ["connections", "memory", "knowledge_base"] as const;
  if (action === "send") return [...base, "email"] as const;
  if (action === "morning-briefing") {
    if (kete === "arataki" || kete === "pikau") return [...base, "weather", "calendar", "accounting", "routes"] as const;
    if (kete === "waihanga") return [...base, "weather", "calendar", "construction"] as const;
    if (kete === "manaaki") return [...base, "weather", "calendar", "accounting"] as const;
    return [...base, "calendar"] as const;
  }
  return base;
}

export function buildAmbientPrompt(input: AmbientRunRequest, agent: AmbientAgentSpec): string {
  const tenant = input.tenant_slug ? `Tenant: ${input.tenant_slug}` : `Tenant ID: ${input.tenant_id}`;
  const requested = input.prompt?.trim() || "Prepare today's operator briefing draft.";
  return [
    tenant,
    `Kete: ${input.kete}`,
    `Agent: ${agent.name} (${agent.slug})`,
    `Phase: ${input.phase ?? agent.phase}`,
    `Action: ${input.action}`,
    "",
    "Write one draft for the operator inbox. Do not send anything. Include only work the operator can approve, edit, reject, or defer.",
    requested,
  ].join("\n");
}

export function fallbackAmbientDraft(input: AmbientRunRequest, agent: AmbientAgentSpec): AmbientDraft {
  const phase = input.phase ?? agent.phase;
  const title = `${agent.name} ${input.action === "morning-briefing" ? "morning briefing" : "draft"}`;
  const body = [
    `${title}`,
    "",
    `For ${input.tenant_slug ?? input.tenant_id}, ${agent.name} has reviewed the ${input.kete} ${phase} queue and prepared one operator-held draft.`,
    "Live context available: " + Object.keys(input.live_context ?? {}).sort().join(", "),
    "",
    "Suggested operator action: review the attached context, adjust any voice-sensitive wording, then approve or defer from the inbox.",
  ].join("\n");
  return {
    title,
    body,
    confidence: 0.72,
    citations: ["tenant memory", "connected tools", "kete operating context"],
    extracted_actions: [
      {
        type: `ambient.${input.action}`,
        label: title,
        agent: agent.slug,
        kete: input.kete,
        phase,
      },
    ],
  };
}
