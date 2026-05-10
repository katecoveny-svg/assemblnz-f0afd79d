/**
 * age_gate.after_draft — flag drafts that mention a child by name.
 *
 * Reads `memoryBlocks.profile.children` (an array of child profile
 * objects from the toro_memory_blocks 'profile' content), looks for
 * each child's name in the generated draft body, and if it finds a
 * match annotates the receipt with `age_gate: 'parent_only'`. The
 * inbox UI uses that annotation to restrict approval to tenant
 * members with role `owner` or `admin`.
 *
 * Non-blocking by design: pass=true always. The flag is downstream
 * authorisation, not a stop-the-world veto.
 */
import type { Filter, FilterContext, FilterResult } from './types';

interface ChildProfile {
  name?: unknown;
  preferred_name?: unknown;
  nicknames?: unknown;
}

export const ageGateAfterDraft: Filter = {
  name: 'age_gate_after_draft',
  phase: 'after_draft',
  async run(ctx: FilterContext): Promise<FilterResult> {
    const draft = (ctx.draftBody ?? '').toString();
    if (draft.length === 0) {
      return { pass: true, receiptAddition: { age_gate: 'no_draft_body' } };
    }

    const children = extractChildren(ctx.memoryBlocks.profile);
    if (children.length === 0) {
      return { pass: true, receiptAddition: { age_gate: 'no_children_in_profile' } };
    }

    const matched: string[] = [];
    const lowered = draft.toLowerCase();
    for (const child of children) {
      const names = collectNamesForChild(child);
      for (const name of names) {
        const needle = name.toLowerCase();
        if (needle.length === 0) continue;
        // word-boundary match so "Niko" doesn't match "Nikolai" by accident
        const wordBoundary = new RegExp(`\\b${escapeRegex(needle)}\\b`);
        if (wordBoundary.test(lowered)) {
          matched.push(name);
          break;
        }
      }
    }

    if (matched.length === 0) {
      return { pass: true, receiptAddition: { age_gate: 'no_child_mentions' } };
    }

    const reason = `draft mentions child ${matched.join(', ')}`;
    return {
      pass: true,
      receiptAddition: {
        age_gate: 'parent_only',
        reason,
        children_mentioned: matched,
      },
    };
  },
};

function extractChildren(profile: unknown): ChildProfile[] {
  if (!profile || typeof profile !== 'object') return [];
  const children = (profile as { children?: unknown }).children;
  if (!Array.isArray(children)) return [];
  return children.filter((c): c is ChildProfile => typeof c === 'object' && c !== null);
}

function collectNamesForChild(child: ChildProfile): string[] {
  const names: string[] = [];
  if (typeof child.name === 'string') names.push(child.name);
  if (typeof child.preferred_name === 'string') names.push(child.preferred_name);
  if (Array.isArray(child.nicknames)) {
    for (const nick of child.nicknames) {
      if (typeof nick === 'string') names.push(nick);
    }
  }
  return names.filter((n) => n.trim().length > 0);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
