import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { GEMINI_MCP_READ_TOOLS, runGeminiWithAssemblMcp } from './gemini-mcp';

const ORIGINAL_ENV = { ...process.env };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('runGeminiWithAssemblMcp', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'gemini-test-key';
    process.env.ASSEMBL_MCP_URL = 'https://mcp.assembl.example/mcp';
    process.env.ASSEMBL_MCP_CLIENT_TOKEN = 'mcp-test-token';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it('calls Gemini 3.7 through Interactions with only the read-only Assembl MCP tools', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        id: 'int_123',
        model: 'gemini-3.7-flash',
        status: 'completed',
        steps: [
          {
            type: 'model_output',
            content: [{ type: 'text', text: 'There are three recent work items.' }],
          },
        ],
      }),
    );

    const result = await runGeminiWithAssemblMcp({
      input: 'Summarise my recent Assembl work.',
      fetchImpl,
    });

    expect(result.text).toBe('There are three recent work items.');
    expect(fetchImpl).toHaveBeenCalledOnce();

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/interactions');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({
      'content-type': 'application/json',
      'x-goog-api-key': 'gemini-test-key',
    });

    const body = JSON.parse(String(init?.body));
    expect(body.model).toBe('gemini-3.7-flash');
    expect(body.store).toBe(false);
    expect(body.generation_config).toMatchObject({ thinking_level: 'medium', tool_choice: 'auto' });
    expect(body.tools).toEqual([
      {
        type: 'mcp_server',
        name: 'assembl_os',
        url: 'https://mcp.assembl.example/mcp',
        headers: { Authorization: 'Bearer mcp-test-token' },
        allowed_tools: [...GEMINI_MCP_READ_TOOLS],
      },
    ]);
    expect(body.tools[0].allowed_tools).not.toContain('create_work_item');
    expect(body.tools[0].allowed_tools).not.toContain('request_action_approval');
  });

  it('requires the public MCP endpoint to use HTTPS and end in /mcp', async () => {
    const fetchImpl = vi.fn<typeof fetch>();

    process.env.ASSEMBL_MCP_URL = 'http://localhost:8787/mcp';
    await expect(runGeminiWithAssemblMcp({ input: 'List work', fetchImpl })).rejects.toThrow(
      'ASSEMBL_MCP_URL must use HTTPS',
    );

    process.env.ASSEMBL_MCP_URL = 'https://mcp.assembl.example/health';
    await expect(runGeminiWithAssemblMcp({ input: 'List work', fetchImpl })).rejects.toThrow(
      'must point to the Streamable HTTP /mcp endpoint',
    );
  });

  it('does not leak the MCP bearer token when Gemini returns an error', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({ error: { message: 'Remote MCP could not be reached.' } }, 400),
    );

    await expect(runGeminiWithAssemblMcp({ input: 'List work', fetchImpl })).rejects.toThrow(
      'Gemini Interactions API failed: Remote MCP could not be reached.',
    );
  });
});
