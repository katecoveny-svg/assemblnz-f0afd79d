export function readNumberParam(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const raw = new URL(window.location.href).searchParams.get(key);
  const parsed = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readBooleanParam(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const raw = new URL(window.location.href).searchParams.get(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

export function readStringParam<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  if (typeof window === 'undefined') return fallback;
  const raw = new URL(window.location.href).searchParams.get(key) as T | null;
  return raw && allowed.includes(raw) ? raw : fallback;
}
