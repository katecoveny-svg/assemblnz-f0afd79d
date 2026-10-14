import { z } from 'zod';

const timestamp = z.string().datetime({ offset: true });
export const preparationPolicySchema = z.object({
  timezone: z.string().min(1).refine(value => { try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; } }),
  quietStartHour: z.number().int().min(0).max(23), quietEndHour: z.number().int().min(0).max(23),
  cooldownHours: z.number().int().min(1).max(168), paused: z.boolean(),
}).strict();
export type PreparationPolicy = z.infer<typeof preparationPolicySchema>;
export type PreparationHistory = { noveltyKey: string; state: 'prepared_draft' | 'dismissed'; at: string; dismissedUntil?: string };
/** Exact caller-derived key identifies purpose + source revision; never hashes private text.
 * Persist history owner-scoped; reserve key transactionally before claiming a worker run.
 */
export function preparationEligibility(policyRaw: PreparationPolicy, history: PreparationHistory[], noveltyKey: string, now: string): { eligible: boolean; reason: 'paused' | 'quiet_hours' | 'dismissed' | 'duplicate' | 'cooldown' | null } {
  const policy = preparationPolicySchema.parse(policyRaw);
  const clock = Date.parse(timestamp.parse(now));
  if (!/^[a-z0-9:_-]{1,160}$/i.test(noveltyKey)) throw new Error('invalid_novelty_key');
  for (const item of history) {
    if (!['prepared_draft', 'dismissed'].includes(item.state) || Date.parse(timestamp.parse(item.at)) > clock) throw new Error('invalid_preparation_history');
    if (item.dismissedUntil) timestamp.parse(item.dismissedUntil);
  }
  if (policy.paused) return { eligible: false, reason: 'paused' };
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: policy.timezone, hour: '2-digit', hourCycle: 'h23' }).format(new Date(clock)));
  const quiet = policy.quietStartHour < policy.quietEndHour ? hour >= policy.quietStartHour && hour < policy.quietEndHour : policy.quietStartHour > policy.quietEndHour && (hour >= policy.quietStartHour || hour < policy.quietEndHour);
  if (quiet) return { eligible: false, reason: 'quiet_hours' };
  if (history.some(item => item.noveltyKey === noveltyKey && item.state === 'dismissed' && (!item.dismissedUntil || Date.parse(item.dismissedUntil) > clock))) return { eligible: false, reason: 'dismissed' };
  if (history.some(item => item.noveltyKey === noveltyKey && item.state === 'prepared_draft')) return { eligible: false, reason: 'duplicate' };
  if (history.some(item => clock - Date.parse(item.at) < policy.cooldownHours * 3600000)) return { eligible: false, reason: 'cooldown' };
  return { eligible: true, reason: null };
}
