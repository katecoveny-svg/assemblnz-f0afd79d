import 'server-only';
import { randomUUID } from 'node:crypto';
import type { LiveConnectConfig } from '@google/genai';
import type { VoiceCostQuote, VoiceLeaseRequest } from '@/apps/do/shared/voice-lease';
export class LeaseError extends Error {
  constructor(public code: string, public status = 409) { super(code); }
}
export type Funding = { revision: string; dailySeconds: number; enabled: boolean };
type Binding = { revision: string; model: string; voiceName: string; config: LiveConnectConfig };
type Quote = VoiceCostQuote & { binding: Binding };
export type Lease = {
  id: string; requestId: string; quoteId: string; day: string; deadline: number;
  seconds: number; planRevision: string; binding: Binding;
  status: 'issuing' | 'active' | 'revoked' | 'failed';
  usage: Record<string, { inputTokens: number; outputTokens: number }>;
};
export type Ledger = { quotes: Quote[]; leases: Lease[] };
/** Callback must be pure: adapter retries under a durable per-owner CAS/transaction.
 * Never invoke Google or another side effect inside it. No process-memory fallback. */
export interface LeaseStore { transact<T>(owner: string, change: (ledger: Ledger) => T): Promise<T> }
export interface LeasePorts {
  store: LeaseStore;
  funding(owner: string): Promise<Funding>;
  binding(owner: string): Promise<Binding>;
  issue(binding: Binding, deadline: number, signal?: AbortSignal): Promise<{ token: string }>;
  now(): number;
}
const dayAt = (at: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
const ready = (funding: Funding) => {
  if (!funding.enabled || !funding.revision || !Number.isSafeInteger(funding.dailySeconds) || funding.dailySeconds < 300 || funding.dailySeconds > 900)
    throw new LeaseError('funding_unavailable', 503);
};
const publicQuote = ({ binding: _binding, ...quote }: Quote): VoiceCostQuote => quote;
export function createVoiceLeaseService(ports: LeasePorts) {
  async function handle(owner: string, request: VoiceLeaseRequest, signal?: AbortSignal) {
    if (!owner) throw new LeaseError('sign_in_required', 401);
    if (signal?.aborted) throw new LeaseError("cancelled", 499);
    const now = ports.now();
    if (request.action === 'revoke') return ports.store.transact(owner, state => {
      const lease = state.leases.find(l => l.id === request.leaseId);
      if (!lease) throw new LeaseError('lease_unavailable', 404);
      lease.status = 'revoked'; return { revoked: true as const };
    });
    const funding = await ports.funding(owner); ready(funding);
    if (request.action === 'quote') {
      const binding = await ports.binding(owner);
      if (binding.revision !== request.voiceRevision) throw new LeaseError('voice_review_changed');
      if (request.requestedSeconds > funding.dailySeconds) throw new LeaseError('allowance_exhausted', 429);
      const quote: Quote = { quoteId: randomUUID(), expiresAt: now + 60_000,
        requestedSeconds: request.requestedSeconds, voiceRevision: binding.revision,
        provider: 'google', model: binding.model, voiceName: binding.voiceName,
        funding: 'assembl_included', planRevision: funding.revision,
        dailyReservedSecondsLimit: funding.dailySeconds, additionalChargeCents: 0,
        usageBasis: 'reserved_connection_seconds', binding };
      return ports.store.transact(owner, state => {
        state.quotes = state.quotes.filter(q => q.expiresAt > now).slice(-9);
        state.quotes.push(quote); return { quote: publicQuote(quote) };
      });
    }
    if (request.action === 'resume') return ports.store.transact(owner, state => {
      const lease = state.leases.find(l => l.id === request.leaseId);
      if (!lease || lease.status !== 'active' || lease.deadline <= now) throw new LeaseError('lease_unavailable');
      if (lease.planRevision !== funding.revision) throw new LeaseError('funding_changed');
      // No handle/token from browser is admitted or reissued here. The client uses
      // Google's existing one-use token + in-memory handle within this deadline.
      return { resumeAllowed: true as const, leaseId: lease.id, expiresAt: lease.deadline, reuseExistingToken: true as const };
    });
    const binding = await ports.binding(owner);
    const leaseId = randomUUID();
    const admitted = await ports.store.transact(owner, state => {
      if (signal?.aborted) throw new LeaseError("cancelled", 499);
      if (state.leases.some(l => l.requestId === request.requestId)) throw new LeaseError('request_already_admitted');
      const quote = state.quotes.find(q => q.quoteId === request.quoteId);
      if (!quote || quote.expiresAt <= now) throw new LeaseError('quote_expired');
      if (quote.voiceRevision !== binding.revision || quote.planRevision !== funding.revision || quote.dailyReservedSecondsLimit !== funding.dailySeconds) throw new LeaseError('review_changed');
      if (state.leases.some(l => l.quoteId === quote.quoteId)) throw new LeaseError('quote_already_used');
      // A single account cannot start simultaneous charged sessions on two tabs.
      if (state.leases.some(l => ['issuing', 'active'].includes(l.status) && l.deadline > now)) throw new LeaseError('call_already_active');
      const day = dayAt(now);
      const used = state.leases.filter(l => l.day === day).reduce((sum, l) => sum + l.seconds, 0);
      if (used + quote.requestedSeconds > funding.dailySeconds) throw new LeaseError('allowance_exhausted', 429);
      const lease: Lease = { id: leaseId, requestId: request.requestId, quoteId: quote.quoteId,
        day, deadline: now + quote.requestedSeconds * 1000, seconds: quote.requestedSeconds,
        planRevision: funding.revision, binding: quote.binding, status: 'issuing', usage: {} };
      state.leases.push(lease); return structuredClone(lease);
    });
    try {
      const issued = await ports.issue(admitted.binding, admitted.deadline, signal);
      if (!issued.token) throw new LeaseError('provider_unavailable', 502);
      return await ports.store.transact(owner, state => {
        const lease = state.leases.find(l => l.id === leaseId);
        if (signal?.aborted || !lease || lease.status !== 'issuing' || lease.deadline <= ports.now()) throw new LeaseError('lease_unavailable');
        lease.status = 'active';
        return { leaseId, token: issued.token, model: lease.binding.model, voiceName: lease.binding.voiceName,
          config: lease.binding.config, expiresAt: lease.deadline, sessionSeconds: lease.seconds,
          usageBasis: 'reserved_connection_seconds' as const };
      });
    } catch {
      // Ambiguous issuance can have incurred provider use. Retain reservation;
      // never mint again or credit from a client report. Support may reconcile it.
      await ports.store.transact(owner, state => {
        const lease = state.leases.find(l => l.id === leaseId);
        if (lease?.status === 'issuing') lease.status = signal?.aborted ? 'revoked' : 'failed';
      });
      throw new LeaseError('issuance_unavailable', 503);
    }
  }
  async function availability(owner: string) {
    if (!owner) throw new LeaseError('sign_in_required', 401);
    const funding = await ports.funding(owner); ready(funding);
    const now = ports.now();
    return ports.store.transact(owner, state => ({
      dailyReservedSecondsLimit: funding.dailySeconds,
      remainingSeconds: Math.max(0, funding.dailySeconds - state.leases.filter(l => l.day === dayAt(now)).reduce((sum, l) => sum + l.seconds, 0)),
      planRevision: funding.revision, funding: 'assembl_included' as const,
      usageBasis: 'reserved_connection_seconds' as const,
      // Provider invoice/usage ingestion is separate; never infer measured cost.
      measuredCost: null,
    }));
  }
  return { handle, availability };
}
