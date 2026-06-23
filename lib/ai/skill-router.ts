/**
 * Skill router with a free-fallback ladder.
 *
 * Ladder (the amendment's spec):
 *   1. Primary  — Claude Skills (Anthropic SDK)
 *   2+. Fallback — free MCP servers: filesystem, fetch, Brave (free), Tavily
 *       (free), Hugging Face Spaces (free inference), public NZ Gov APIs.
 *
 * Same fail-open contract as the model router (lib/ai/router.ts): try each rung
 * in order, log every drop to `skill_fallback_events`, and never throw at the
 * caller — a skill that can't run returns a structured failure, it doesn't take
 * the request down with it.
 *
 * Handlers are pluggable. They ship as clearly-marked stubs (mirroring the
 * NZ-knowledge tool stubs in app/api/agents/[slug]/chat/route.ts); wiring a real
 * Claude Skill invocation or MCP client is a drop-in replacement for one `run`.
 *
 * Server-only.
 */
import 'server-only';
import { recordSkillFallback } from './fallback-log';

export type SkillInput = { query: string; context?: Record<string, unknown> };

export type SkillRunResult =
  | { ok: true; rungId: string; output: unknown }
  | { ok: false; rungId: string; reason: string };

export type SkillRung = {
  id: string;
  kind: 'claude-skill' | 'mcp';
  label: string;
  run: (input: SkillInput) => Promise<SkillRunResult>;
};

/** Free MCP servers used as the fallback chain after Claude Skills. */
export const FREE_MCP_FALLBACKS = [
  { id: 'mcp:filesystem', label: 'Filesystem MCP' },
  { id: 'mcp:fetch', label: 'Fetch MCP' },
  { id: 'mcp:brave-search', label: 'Brave Search (free)' },
  { id: 'mcp:tavily', label: 'Tavily (free)' },
  { id: 'mcp:hf-spaces', label: 'Hugging Face Spaces (free inference)' },
  { id: 'mcp:nz-gov', label: 'Public NZ Gov APIs' },
] as const;

// ── Pluggable handlers (stubs until the real runtimes are wired) ──────────
function claudeSkillRung(skillId: string): SkillRung {
  return {
    id: `claude-skill:${skillId}`,
    kind: 'claude-skill',
    label: `Claude Skill: ${skillId}`,
    run: async () => {
      // TODO: invoke the Claude Skill via the Anthropic SDK. Until wired, decline
      // so the router transparently drops to the free MCP fallbacks.
      if (process.env.CLAUDE_SKILLS_ENABLED !== 'true') {
        return { ok: false, rungId: `claude-skill:${skillId}`, reason: 'Claude Skills runtime not enabled (CLAUDE_SKILLS_ENABLED).' };
      }
      return { ok: false, rungId: `claude-skill:${skillId}`, reason: 'Claude Skill handler not implemented yet.' };
    },
  };
}

function mcpRung(id: string, label: string): SkillRung {
  return {
    id,
    kind: 'mcp',
    label,
    run: async () => {
      // TODO: dispatch to the corresponding free MCP server. Stubbed for now.
      return { ok: false, rungId: id, reason: `${label} not wired yet.` };
    },
  };
}

/** Build the ordered ladder for a skill: Claude Skill primary → free MCP fallbacks. */
export function buildSkillLadder(skillId: string): SkillRung[] {
  return [
    claudeSkillRung(skillId),
    ...FREE_MCP_FALLBACKS.map((m) => mcpRung(m.id, m.label)),
  ];
}

/**
 * Run a skill through the ladder, logging each drop and failing open.
 * Returns the first successful rung's result, or a structured failure if every
 * rung declines/errors.
 */
export async function runSkillWithFallback(
  skillId: string,
  input: SkillInput,
  ctx: { agentSlug?: string | null; userId?: string | null } = {},
): Promise<SkillRunResult> {
  const ladder = buildSkillLadder(skillId);
  for (let i = 0; i < ladder.length; i++) {
    const rung = ladder[i];
    const next = ladder[i + 1]?.id ?? null;
    try {
      const res = await rung.run(input);
      if (res.ok) return res;
      await recordSkillFallback({
        agentSlug: ctx.agentSlug,
        userId: ctx.userId,
        primarySkill: rung.id,
        fallbackSkill: next,
        reason: res.reason,
      });
    } catch (err) {
      await recordSkillFallback({
        agentSlug: ctx.agentSlug,
        userId: ctx.userId,
        primarySkill: rung.id,
        fallbackSkill: next,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { ok: false, rungId: 'none', reason: 'All skill rungs exhausted (fail-open).' };
}
