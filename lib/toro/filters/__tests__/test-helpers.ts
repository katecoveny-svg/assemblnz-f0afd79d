import type { FilterContext } from '../types';

export function makeCtx(overrides: Partial<FilterContext> = {}): FilterContext {
  return {
    tenantId: '00000000-0000-0000-0000-000000000001',
    conversationId: 'conv-1',
    incomingMessage: 'Kia ora — can you remind us about the school run?',
    pluginSlug: 'toro',
    skillSlug: 'household-coordination',
    memoryBlocks: {},
    consentGrants: [],
    ...overrides,
  };
}
