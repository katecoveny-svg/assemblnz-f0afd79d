import 'server-only';

import {
  DO_MCP_PROVIDERS,
  type DoMcpProviderId,
  type DoMcpProviderMeta,
} from '@/apps/do/shared/do-mcp-gateway';
import { pipedreamConfigured } from '@/lib/connectors/pipedream';
import { mcpMarketHubConfigured, hubProviderNote } from './mcp-market-hub';

export type DoMcpProviderStatus = DoMcpProviderMeta & {
  configured: boolean;
  missingEnv: string[];
  state: 'ready' | 'setup_needed' | 'stub';
  note: string;
};

function missingEnv(keys: readonly string[]): string[] {
  return keys.filter((key) => !process.env[key]?.trim());
}

export function composioConfigured(): boolean {
  return Boolean(process.env.COMPOSIO_API_KEY?.trim());
}

export function zapierMcpConfigured(): boolean {
  return Boolean(process.env.ZAPIER_MCP_TOKEN?.trim());
}

export function tregConfigured(): boolean {
  return Boolean(process.env.TREG_TOKEN?.trim());
}

export function providerConfigured(id: DoMcpProviderId): boolean {
  switch (id) {
    case 'composio':
      return composioConfigured();
    case 'zapier':
      return zapierMcpConfigured();
    case 'treg':
      return tregConfigured();
    case 'pipedream':
      return pipedreamConfigured();
    case 'nz_live':
      // NZ Live is a toolkit: some tools are always live (keyless). Treat gateway as configured.
      return true;
    case 'mcp_market_hub':
      // Attach toolkit + list work without API key (local_draft). Catalog browse/search need key + client.
      return true;
    default:
      return false;
  }
}

export function listProviderStatuses(): DoMcpProviderStatus[] {
  return DO_MCP_PROVIDERS.map((meta) => {
    const missing = missingEnv(meta.envKeys);
    const configured = missing.length === 0;
    if (meta.id === 'mcp_market_hub') {
      const hubKey = mcpMarketHubConfigured();
      return {
        ...meta,
        configured: hubKey,
        missingEnv: missing,
        state: hubKey ? 'stub' : 'setup_needed',
        note: hubProviderNote(),
      };
    }
    if (meta.id === 'zapier') {
      return {
        ...meta,
        configured,
        missingEnv: missing,
        state: configured ? 'ready' : 'stub',
        note: configured
          ? 'Zapier MCP token present — list/call spike uses Streamable HTTP connect endpoint.'
          : 'Not configured. Set ZAPIER_MCP_TOKEN from mcp.zapier.com (connection token). Long-tail apps only — Composio is primary.',
      };
    }
    if (meta.id === 'treg') {
      return {
        ...meta,
        configured,
        missingEnv: missing,
        state: configured ? 'ready' : 'stub',
        note: configured
          ? 'TREG_TOKEN present — pay-per-call /call/{endpoint} is live; catalog search works without a token.'
          : 'Token missing. Catalog search still works (public). Live calls need TREG_TOKEN + prepaid balance.',
      };
    }
    if (meta.id === 'pipedream') {
      return {
        ...meta,
        configured,
        missingEnv: missing,
        state: configured ? 'ready' : 'setup_needed',
        note: configured
          ? 'Pipedream Connect ready for first-party Gmail / mapped actions — use /do/connections.'
          : 'Pipedream env incomplete. Keep for Gmail Connect; marketplace tools go through Composio/Zapier/Treg.',
      };
    }
    if (meta.id === 'nz_live') {
      return {
        ...meta,
        configured: true,
        missingEnv: missing,
        state: 'ready',
        note: missing.length
          ? `NZ Live toolkit ready for keyless tools (GeoNet, weather, fuel, Beehive). Keyed tools need: ${missing.join(', ')}. Waka Kotahi traffic is stub.`
          : 'NZ Live toolkit ready — including keyed AT/NZBN/PCO/NewsAPI tools.',
      };
    }
    return {
      ...meta,
      configured,
      missingEnv: missing,
      state: configured ? 'ready' : 'setup_needed',
      note: configured
        ? 'Composio API key present — tool list/execute spike is available.'
        : 'Not configured. Set COMPOSIO_API_KEY to enable the primary DO MCP toolbox.',
    };
  });
}
