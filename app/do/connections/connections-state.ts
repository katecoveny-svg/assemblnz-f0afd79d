import type { DoCapabilityCard } from '@/apps/do/shared/capability-catalogue';
import type { DoMcpAllowlistEntry } from '@/apps/do/shared/do-mcp-gateway';

export type State = {
  signedIn: boolean;
  configured: boolean;
  availability: Record<string, boolean>;
  accountsAvailable?: boolean;
  capabilities: DoCapabilityCard[];
  accounts: Array<{ app: string; label: string; healthy: boolean }>;
};

type McpProviderRow = {
  id: string;
  label: string;
  fit: string;
  configured: boolean;
  missingEnv: string[];
  state: 'ready' | 'setup_needed' | 'stub';
  note: string;
  envKeys: string[];
  connectHint: string;
};

export type HubAttached = {
  toolkitId: string;
  label: string;
  attachedAt: string;
  syncState: 'local_draft' | 'synced';
  sourceUrl?: string;
};

export type McpState = {
  signedIn: boolean;
  cursorMcpNote: string;
  portableAgentNote?: string;
  fourLayerStack?: Array<{ layer: number; label: string; role: string }>;
  providers: McpProviderRow[];
  allowlist: DoMcpAllowlistEntry[];
  nzLive?: Array<{
    toolId: string;
    label: string;
    purpose: string;
    status: 'live' | 'needs_key' | 'stub';
    envKeys: string[];
    namedToolkit?: string;
    priority?: string;
    note?: string;
  }>;
  nzLiveNamedToolkits?: Array<{
    id: string;
    label: string;
    fit: string;
    toolIds: string[];
  }>;
  nzLiveGroceryNote?: string;
  mcpMarketHub?: {
    hubUrl: string;
    appUrl: string;
    directoryUrl: string;
    connectHint: string;
    lookalikes: Array<{ name: string; url: string; note: string }>;
    attached: HubAttached[];
    publicCatalogApi: string;
  };
};

export async function readConnections(fetcher: typeof fetch = fetch): Promise<State> {
  const response = await fetcher('/api/do/connections', { cache: 'no-store' });
  if (!response.ok) throw new Error('Connections unavailable');
  return response.json();
}

export async function readMcp(fetcher: typeof fetch = fetch): Promise<McpState> {
  const response = await fetcher('/api/do/mcp', { cache: 'no-store' });
  if (!response.ok) throw new Error('MCP gateway unavailable');
  return response.json();
}

export const accountNotice = (next: State) => next.accountsAvailable === false ? 'Your connected accounts could not be checked. Their status is currently unknown.' : '';

type PanelHandlers = {
  onConnections: (state: State | null, error: string) => void;
  onTechnical: (state: McpState | null, error: string) => void;
};

/** Each panel publishes independently, including when the other request is slow. */
export async function loadConnectionPanels(handlers: PanelHandlers, fetcher: typeof fetch = fetch): Promise<void> {
  await Promise.all([
    readConnections(fetcher).then(
      (state) => handlers.onConnections(state, ''),
      () => handlers.onConnections(null, 'Connections could not be checked. Please try again.'),
    ),
    readMcp(fetcher).then(
      (state) => handlers.onTechnical(state, ''),
      () => handlers.onTechnical(null, 'Technical details could not be checked. Your personal connections are shown separately.'),
    ),
  ]);
}
