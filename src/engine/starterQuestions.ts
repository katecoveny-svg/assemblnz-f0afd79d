import type { Agent } from "@/data/agents";

/**
 * Generate agent-specific starter questions tailored to each agent's role,
 * tagline, and expertise. Falls back to (and enriches) agent.starters when
 * present, otherwise derives a coherent set from the agent's metadata.
 *
 * Returns 3-4 short, action-oriented first prompts.
 */
export function getStarterQuestions(agent: Agent): string[] {
  const fromAgent = (agent.starters || []).filter(Boolean);
  const derived = deriveStarters(agent);

  // Merge: prefer hand-curated, then top up from derived set, dedupe.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of [...fromAgent, ...derived]) {
    const key = q.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(q.trim());
    if (out.length >= 4) break;
  }
  return out;
}

function deriveStarters(agent: Agent): string[] {
  const role = (agent.role || "").trim();
  const tagline = (agent.tagline || "").trim();
  const expertise = agent.expertise || [];
  const name = agent.name || "this agent";

  const starters: string[] = [];

  // 1. Role-anchored opener
  if (role) {
    starters.push(`Where should I start with ${lowerFirst(role)}?`);
  }

  // 2. Expertise-driven specifics (top 2)
  for (const topic of expertise.slice(0, 2)) {
    starters.push(`Help me with ${lowerFirst(topic)}`);
  }

  // 3. Tagline-derived "how do I..." prompt
  if (tagline) {
    const trimmed = tagline.replace(/[.?!]+$/, "");
    starters.push(`How do you handle ${lowerFirst(trimmed)}?`);
  }

  // 4. Generic safety-net
  starters.push(`What can ${name} do for my business?`);

  return starters;
}

function lowerFirst(s: string): string {
  if (!s) return s;
  // Preserve ALL-CAPS acronyms (e.g. "GST", "CCCFA")
  if (s === s.toUpperCase()) return s;
  return s[0].toLowerCase() + s.slice(1);
}
