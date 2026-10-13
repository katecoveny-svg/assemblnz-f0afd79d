/** Server-only deployment opt-in; no environment is changed by this implementation.
 * Even when enabled, storage requires the reviewed schema, session and explicit consent.
 * This does not change the session-only UI or activate image durability. */
export function savedDurableActive(): boolean {
  return process.env.DO_SAVED_DURABLE_ENABLED === 'true';
}
