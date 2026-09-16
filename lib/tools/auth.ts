import { ToolHttpError } from './errors';

/**
 * Extract the tool API key from request headers.
 * Accepts `Authorization: Bearer <key>` or `X-Assembl-Tool-Key: <key>`.
 */
export function extractToolApiKey(headers: Headers): string {
  const dedicated = headers.get('x-assembl-tool-key')?.trim();
  if (dedicated) return dedicated;

  const auth = headers.get('authorization')?.trim();
  if (auth) {
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (match?.[1]?.trim()) return match[1].trim();
    throw new ToolHttpError({
      status: 401,
      code: 'missing_api_key',
      message: 'Authorization header present but not Bearer format.',
      fix: 'Send `Authorization: Bearer <your-key>` or `X-Assembl-Tool-Key: <your-key>`.',
    });
  }

  throw new ToolHttpError({
    status: 401,
    code: 'missing_api_key',
    message: 'API key required.',
    fix: 'Send `Authorization: Bearer <your-key>` or `X-Assembl-Tool-Key: <your-key>`. Get a test key from /tools/nz-who-runs-it.',
  });
}
