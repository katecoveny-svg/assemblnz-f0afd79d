import 'server-only';

export const GEMINI_MCP_READ_TOOLS = ['list_work', 'get_work_item', 'read_proof'] as const;

export type GeminiThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

type GeminiTextBlock = {
  type?: string;
  text?: string;
};

type GeminiInteractionStep = {
  type?: string;
  content?: GeminiTextBlock[];
  [key: string]: unknown;
};

export type GeminiMcpInteraction = {
  id?: string;
  model?: string;
  status?: string;
  steps?: GeminiInteractionStep[];
  usage?: Record<string, unknown>;
  [key: string]: unknown;
};

const INTERACTIONS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

function requireGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return apiKey;
}

function requireMcpUrl(): string {
  const raw = process.env.ASSEMBL_MCP_URL;
  if (!raw) throw new Error('ASSEMBL_MCP_URL is not configured.');

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('ASSEMBL_MCP_URL must be a valid URL.');
  }

  if (url.protocol !== 'https:') {
    throw new Error('ASSEMBL_MCP_URL must use HTTPS so Gemini can call it safely.');
  }
  if (!url.pathname.endsWith('/mcp')) {
    throw new Error('ASSEMBL_MCP_URL must point to the Streamable HTTP /mcp endpoint.');
  }
  return url.toString();
}

function requireMcpClientToken(): string {
  const token = process.env.ASSEMBL_MCP_CLIENT_TOKEN;
  if (!token) throw new Error('ASSEMBL_MCP_CLIENT_TOKEN is not configured.');
  return token;
}

export function extractGeminiInteractionText(interaction: GeminiMcpInteraction): string {
  const chunks: string[] = [];
  for (const step of interaction.steps ?? []) {
    if (step.type !== 'model_output') continue;
    for (const block of step.content ?? []) {
      if (block.type === 'text' && typeof block.text === 'string') chunks.push(block.text);
    }
  }
  return chunks.join('\n').trim();
}

export async function runGeminiWithAssemblMcp(options: {
  input: string;
  model?: string;
  thinkingLevel?: GeminiThinkingLevel;
  fetchImpl?: typeof fetch;
}): Promise<{ interaction: GeminiMcpInteraction; text: string }> {
  const input = options.input.trim();
  if (!input) throw new Error('Gemini MCP input must not be empty.');

  const apiKey = requireGeminiApiKey();
  const mcpUrl = requireMcpUrl();
  const mcpToken = requireMcpClientToken();
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(INTERACTIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: options.model ?? 'gemini-3.7-flash',
      input,
      store: false,
      system_instruction:
        'You are using Assembl as a governed source of work and proof. Use the Assembl MCP only when it helps answer the request. The exposed tools are read-only. Never imply that an external action was sent, published, spent, deleted, or otherwise executed.',
      tools: [
        {
          type: 'mcp_server',
          name: 'assembl_os',
          url: mcpUrl,
          headers: {
            Authorization: `Bearer ${mcpToken}`,
          },
          allowed_tools: [...GEMINI_MCP_READ_TOOLS],
        },
      ],
      generation_config: {
        thinking_level: options.thinkingLevel ?? 'medium',
        tool_choice: 'auto',
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  let interaction: GeminiMcpInteraction;
  try {
    interaction = (await response.json()) as GeminiMcpInteraction;
  } catch {
    throw new Error(`Gemini Interactions API returned a non-JSON response (${response.status}).`);
  }

  if (!response.ok) {
    const error = interaction.error;
    const message =
      error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : `HTTP ${response.status}`;
    throw new Error(`Gemini Interactions API failed: ${message}`);
  }

  return {
    interaction,
    text: extractGeminiInteractionText(interaction),
  };
}
