export class DurabilityError extends Error {
  constructor(public stage: string, public uncertain: boolean) {
    super(`Ingestion persistence ${uncertain ? "unconfirmed" : "failed"}: ${stage}`);
    this.name = "DurabilityError";
  }
}
/** Pinned PostgREST resolves transport/body/JSON faults with status 0: ACK unknown. */
export async function durable<T extends { error?: unknown; status?: number }>(operation: PromiseLike<T>, stage: string): Promise<T> {
  let result: T;
  try { result = await operation; }
  catch { throw new DurabilityError(stage, true); }
  if (result.status === 0) throw new DurabilityError(stage, true);
  if (result.error) throw new DurabilityError(stage, false);
  return result;
}
