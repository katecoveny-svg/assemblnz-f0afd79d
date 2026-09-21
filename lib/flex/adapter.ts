import { z } from 'zod';
import type { ProposedAction } from '@/lib/journey/types';

/** Browser-local proof only. A future authorised provider implements this boundary. */
export const envelopeSchema = z.object({
  readyBy: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  targetPct: z.number().int().min(20).max(100),
  reservePct: z.number().int().min(0).max(100),
  hotWaterFlexible: z.boolean(),
  heatingAskFirst: z.literal(true),
});
export type Envelope = z.infer<typeof envelopeSchema>;
export const defaultEnvelope: Envelope = { readyBy: '06:45', targetPct: 80, reservePct: 35, hotWaterFlexible: true, heatingAskFirst: true };
export type Scenario = 'morning' | 'solar' | 'storm' | 'shortfall';
export type Context = {
  provider: 'kraken-simulated'; status: 'simulated'; account: string;
  scenario: Scenario; evPct: number; capacityKwh: number; chargerKw: number;
  batteryPct: number; windowStart: number; windowEnd: number; signal: string;
};
export type Plan = {
  id: string; envelope: Envelope; context: Context; fingerprint: string;
  state: 'prepared' | 'needs_review'; start: number; end: number;
  energyKwh: number; reason: string; action: ProposedAction;
};
export type Permit = { planId: string; fingerprint: string; account: string; authority: 'simulate'; expiresAt: number };
export type Receipt = {
  id: string; planId: string; provider: string; account: string; status: 'simulated' | 'overridden';
  timestamp: string; permission: Envelope; authority: 'simulate'; summary: string;
  externalActions: false; deliveredKwh: null; rewardNzd: null;
};
export interface UtilityOperatingSystemAdapter {
  readonly status: 'simulated';
  read(scenario: Scenario): Context;
  prepare(context: Context, envelope: Envelope, now?: number): Plan;
  execute(plan: Plan, permit: Permit, currentEnvelope: Envelope, now?: number): Receipt;
  override(plan: Plan, now?: number): Receipt;
}
export const clock = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const fingerprint = (context: Context, envelope: Envelope) => JSON.stringify({ context, envelope });
const receipt = (plan: Plan, status: Receipt['status'], now: number): Receipt => ({
  id: `${plan.id}-${status}-${now}`, planId: plan.id, provider: plan.context.provider, account: plan.context.account,
  status, timestamp: new Date(now).toISOString(), permission: { ...plan.envelope }, authority: 'simulate',
  summary: status === 'overridden' ? 'Simulation stopped by the household. No device command was sent.' : plan.energyKwh === 0 ? 'The simulated EV already meets the target. No charging scheduled. Heating, hot water and home battery unchanged.' : `Simulated EV schedule ${clock(plan.start)}–${clock(plan.end)}. Home battery untouched; minimum reserve ${plan.envelope.reservePct}%. Heating unchanged.`,
  externalActions: false, deliveredKwh: null, rewardNzd: null,
});

export function createSimulatedUtilityAdapter(): UtilityOperatingSystemAdapter {
  // Session-local state provides replay and revocation protection, not production auth.
  const plans = new Map<string, Plan>();
  const revoked = new Set<string>();
  const executed = new Map<string, Receipt>();
  let sequence = 0;
  return {
    status: 'simulated',
    read(scenario) {
      if (!['morning', 'solar', 'storm', 'shortfall'].includes(scenario)) throw new Error('Unknown simulated scenario.');
      return { provider: 'kraken-simulated', status: 'simulated', account: 'fictional-household', scenario,
        evPct: 40, capacityKwh: 60, chargerKw: scenario === 'shortfall' ? 1.4 : 7,
        batteryPct: 60, windowStart: scenario === 'solar' ? 11 * 60 : 60,
        windowEnd: scenario === 'solar' ? 15 * 60 : 7 * 60,
        signal: scenario === 'solar' ? 'Fictional solar-surplus window, 11:00–15:00' : scenario === 'storm' ? 'Fictional storm scenario: preserve home battery; decline grid participation' : 'Fictional off-peak window, 01:00–07:00',
      };
    },
    prepare(context, raw, now = Date.now()) {
      const envelope = envelopeSchema.parse(raw);
      // Reject supplied/altered provider fixtures. No live provider can enter this rail.
      if (JSON.stringify(context) !== JSON.stringify(this.read(context.scenario))) throw new Error('Use the supplied simulated household context.');
      const [h, m] = envelope.readyBy.split(':').map(Number);
      const deadline = h * 60 + m;
      const energyKwh = Math.max(0, (envelope.targetPct - context.evPct) * context.capacityKwh / 100);
      // Fixed conservative efficiency assumption; no real optimisation or dispatch claim.
      const duration = Math.ceil(energyKwh / (context.chargerKw * 0.9) * 60);
      const start = context.windowStart;
      const end = start + duration;
      const feasible = (energyKwh === 0 || end <= Math.min(deadline, context.windowEnd)) && envelope.reservePct <= context.batteryPct;
      const reason = envelope.reservePct > context.batteryPct ? 'The requested reserve exceeds the simulated battery level. A person must review a recovery plan.' : !feasible ? 'The available charging window cannot meet this ready-by requirement. Change the target, time or scenario, or prepare a human handoff.' : energyKwh === 0 ? 'The simulated EV already meets your target. No charging is needed.' : 'This schedule fits the fictional charging window and your ready-by time without drawing from the home battery.';
      const id = `flex-plan-${now}-${++sequence}`;
      const plan: Plan = { id, envelope, context: { ...context }, fingerprint: fingerprint(context, envelope), state: feasible ? 'prepared' : 'needs_review', start, end, energyKwh, reason,
        action: { id: `${id}-action`, runId: id, stageId: 'review', agentId: 'assembl-flex', type: 'utility.prepare_charging', title: 'Simulate household charging plan', description: reason, reason, status: 'proposed', riskLevel: 'low', authorityRequired: 'act_with_approval', execution: 'simulated', payload: { start, end, energyKwh }, evidenceIds: ['fictional-device-state', 'household-envelope'], createdAt: new Date(now).toISOString() },
      };
      plans.set(id, structuredClone(plan));
      return plan;
    },
    execute(plan, permit, currentEnvelope, now = Date.now()) {
      const original = plans.get(plan.id);
      if (!original || JSON.stringify(original) !== JSON.stringify(plan)) throw new Error('The reviewed plan has changed. Prepare it again.');
      if (revoked.has(plan.id)) throw new Error('This plan was overridden. Prepare a new plan.');
      if (plan.state !== 'prepared') throw new Error('This plan needs human review.');
      if (!permit || permit.authority !== 'simulate' || permit.account !== plan.context.account || permit.planId !== plan.id || permit.fingerprint !== plan.fingerprint || !Number.isFinite(permit.expiresAt) || permit.expiresAt <= now) throw new Error('A current approval for this exact simulation is required.');
      if (fingerprint(plan.context, envelopeSchema.parse(currentEnvelope)) !== plan.fingerprint) throw new Error('Your household boundaries changed. Review a new plan.');
      const existing = executed.get(plan.id);
      if (existing) return structuredClone(existing);
      const result = receipt(plan, 'simulated', now);
      executed.set(plan.id, structuredClone(result));
      return result;
    },
    override(plan, now = Date.now()) {
      const original = plans.get(plan.id);
      if (!original) throw new Error('Unknown plan.');
      revoked.add(plan.id);
      return receipt(original, 'overridden', now);
    },
  };
}
