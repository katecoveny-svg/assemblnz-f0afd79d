import { describe, expect, it } from 'vitest';
import { findAgent, findAgentBySlug } from '@/lib/chat/registry';

describe('chat agent registry', () => {
  it('resolves Voyage query param casing inside Tōro', () => {
    for (const agentId of ['VOYAGE', 'voyage', 'Voyage']) {
      const found = findAgent('toro', agentId);
      expect(found?.agent.slug, agentId).toBe('voyage');
      expect(found?.agent.name, agentId).toBe('Voyage');
    }
  });

  it('resolves Voyage path casing by slug', () => {
    for (const slug of ['VOYAGE', 'voyage', 'Voyage']) {
      const found = findAgentBySlug(slug, 'toro');
      expect(found?.agent.slug, slug).toBe('voyage');
      expect(found?.agent.name, slug).toBe('Voyage');
    }
  });

  it('falls through for unknown agent IDs', () => {
    expect(findAgent('toro', 'UNKNOWN')).toBeNull();
    expect(findAgentBySlug('UNKNOWN', 'toro')).toBeNull();
  });
});
