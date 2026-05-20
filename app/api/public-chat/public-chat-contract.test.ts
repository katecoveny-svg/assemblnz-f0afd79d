import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync(join(process.cwd(), 'app/api/public-chat/route.ts'), 'utf8');

describe('public chat route contract', () => {
  it('keeps the default public chat path on iho-router', () => {
    expect(routeSource).toContain("service.functions.invoke(\n    'iho-router'");
    expect(routeSource).toContain("packId: kete");
    expect(routeSource).toContain("agentId: body.agent ? body.agent.toLowerCase() : undefined");
  });

  it('surfaces Iho proof headers to widget clients', () => {
    expect(routeSource).toContain("X-Audit-Request-Id");
    expect(routeSource).toContain("X-Agent-Code");
    expect(routeSource).toContain("X-Model-Used");
    expect(routeSource).toContain("X-Compliance-Passed");
  });

  it('keeps the multimodal/redaction exception separate from the Iho default', () => {
    expect(routeSource).toContain("if (imageDataUrl || redactPii)");
    expect(routeSource).toContain("'public-chat-llm'");
  });
});
