import { describe, expect, it } from 'vitest';

import {
  DO_TOOL_STACK_LAYERS,
  MCP_MARKET_HUB,
  MCP_MARKET_HUB_LOOKALIKES,
  mcpMarketHubAllowlistEntries,
} from './mcp-market-hub-pack';

describe('MCP Market Hub pack', () => {
  it('points at the real Hub product Kate named', () => {
    expect(MCP_MARKET_HUB.id).toBe('mcp_market_hub');
    expect(MCP_MARKET_HUB.hubUrl).toBe('https://mcpmarket.com/hub');
    expect(MCP_MARKET_HUB.appUrl).toBe('https://app.mcpmarket.com');
    expect(MCP_MARKET_HUB.fit).toMatch(/not an execute gateway/i);
  });

  it('documents MCP360 and Glama as lookalikes only', () => {
    expect(MCP_MARKET_HUB_LOOKALIKES).toHaveLength(2);
    expect(MCP_MARKET_HUB_LOOKALIKES[0].name).toBe('MCP360');
    expect(MCP_MARKET_HUB_LOOKALIKES[1].name).toBe('Glama');
  });

  it('keeps Hub tools on the discovery/pack layer of the four-layer stack', () => {
    expect(DO_TOOL_STACK_LAYERS[0].id).toBe('discovery');
    expect(DO_TOOL_STACK_LAYERS[0].providers).toEqual(['mcp_market_hub']);
    expect(mcpMarketHubAllowlistEntries().every((e) => e.provider === 'mcp_market_hub')).toBe(true);
  });
});
