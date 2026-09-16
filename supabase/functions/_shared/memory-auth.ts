export type MemoryPrincipal =
  | { kind: 'anonymous' }
  | { kind: 'service' }
  | { kind: 'user'; userId: string };

type VerifiedUser = { id: string; is_anonymous?: boolean } | null;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function memoryUserId(value: unknown): string | null {
  return typeof value === 'string' && uuid.test(value) ? value.toLowerCase() : null;
}

export async function isMemoryServiceRequest(req: Request, serviceKey: string): Promise<boolean> {
  const token = req.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token || !serviceKey) return false;
  const encoder = new TextEncoder();
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(token)),
    crypto.subtle.digest('SHA-256', encoder.encode(serviceKey)),
  ]);
  const a = new Uint8Array(actual);
  const b = new Uint8Array(expected);
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a[i] ^ b[i];
  return different === 0;
}

// Verify the session with Auth, never decode a caller-supplied JWT as identity.
export async function memoryPrincipal(
  req: Request,
  serviceKey: string,
  verifyUser: (token: string) => Promise<VerifiedUser>,
): Promise<MemoryPrincipal> {
  if (await isMemoryServiceRequest(req, serviceKey)) return { kind: 'service' };
  const token = req.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return { kind: 'anonymous' };
  try {
    const user = await verifyUser(token);
    const userId = memoryUserId(user?.id);
    if (userId && !user?.is_anonymous) return { kind: 'user', userId };
  } catch { /* Auth outage must not permit private memory access. */ }
  return { kind: 'anonymous' };
}

export function resolveMemoryUser(principal: MemoryPrincipal, claimedUserId: unknown): string | null {
  if (principal.kind === 'user') return principal.userId;
  if (principal.kind === 'service') return memoryUserId(claimedUserId);
  return null;
}
