/** Server-owned budget, not a provider limit or a measured billing estimate.
 * This preparatory policy keeps the existing bounded connection lifecycle.
 * A larger budget requires an explicit operator configuration/release decision.
 */
export type DoVoicePolicy = Readonly<{
  sessionSeconds: 300;
  dailySeconds: number;
  dailySessions: number;
}>;
export function readDoVoicePolicy(
  env: Readonly<Record<string, string | undefined>> = process.env,
): DoVoicePolicy {
  const raw = env.DO_VOICE_DAILY_SECONDS;
  const seconds = raw === undefined ? 900 : Number(raw);
  // Whole five-minute reservations preserve the existing atomic slot ledger.
  // Do not accept blank, zero, unlimited, fractional or silently rounded budgets.
  if ((raw !== undefined && !/^[1-9][0-9]*$/.test(raw)) ||
      !Number.isSafeInteger(seconds) || seconds < 300 || seconds > 86400 || seconds % 300 !== 0) {
    throw new Error('Invalid DO voice budget configuration.');
  }
  return Object.freeze({ sessionSeconds: 300, dailySeconds: seconds, dailySessions: seconds / 300 });
}
