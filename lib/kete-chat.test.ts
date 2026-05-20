import { describe, expect, it } from 'vitest';
import { getKeteWidgetCopy, publicChatEmbedUrl, publicChatUrl } from './kete-chat';

describe('kete chat widget config', () => {
  it('builds public chat URLs without inventing another chat backend', () => {
    expect(publicChatUrl('arataki')).toBe('/c/arataki');
    expect(publicChatEmbedUrl('arataki')).toBe('/c/arataki/embed');
  });

  it('preserves agent deep links for Iho routing', () => {
    expect(publicChatUrl('toro', 'voyage')).toBe('/c/toro?agent=voyage');
    expect(publicChatEmbedUrl('toro', 'voyage')).toBe('/c/toro/embed?agent=voyage');
  });

  it('uses kete-specific marketing copy', () => {
    const copy = getKeteWidgetCopy('arataki');
    expect(copy.eyebrow).toContain('Arataki');
    expect(copy.prompt.toLowerCase()).toContain('dealer');
  });
});
