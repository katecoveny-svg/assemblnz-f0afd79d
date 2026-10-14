export function personalWorkerHealth(worker: { configured: boolean; lastSeenAt: string | null }, now = Date.now()) {
  if (!worker.configured) return { ready: false, label: 'Cloud preparation unavailable', detail: 'Cloud preparation has not been configured.' };
  const last = worker.lastSeenAt ? Date.parse(worker.lastSeenAt) : NaN;
  if (!Number.isFinite(last) || last > now + 5 * 60_000) return { ready: false, label: 'Background checks not verified', detail: 'No valid worker check has been recorded yet. Do not rely on daily preparation.' };
  if (now - last > 2 * 60 * 60_000) return { ready: false, label: 'Background checks delayed', detail: 'The worker has not checked in during the last two hours. Do not rely on daily preparation until checks resume.' };
  return { ready: true, label: 'Background worker checked in', detail: 'The worker recently checked in. Each prepared draft still needs its own completion record.' };
}
