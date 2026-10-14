import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { getPersonalDoProfile } from '@/apps/do/personal/profile-service';
import { doVoiceConfig, DO_VOICE_MODELS } from '@/apps/do/shared/gemini-live';
import { voiceRevision } from '@/apps/do/services/voice-preference';
import { readDoVoicePolicy } from '@/apps/do/services/voice-policy';
import { createVoiceLeaseService, LeaseError } from './service';
import { durableVoiceLeaseStore } from './store';
export function voiceLeaseRuntime() {
  if (process.env.DO_VOICE_LEASE_ENABLED !== 'true' || process.env.DO_GEMINI_LIVE_ENABLED !== 'true') throw new LeaseError('lease_disabled', 503);
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new LeaseError('provider_unavailable', 503);
  return createVoiceLeaseService({
    store: durableVoiceLeaseStore(), now: Date.now,
    async funding(owner) {
      // Explicit reviewed pilot account allocations only. No blanket entitlement
      // from a ChatGPT login, a business subscription or an arbitrary client claim.
      let accounts;
      try { accounts = JSON.parse(process.env.DO_VOICE_LEASE_ACCOUNTS_JSON ?? '{}'); }
      catch { throw new LeaseError('funding_unavailable', 503); }
      const account = accounts && Object.hasOwn(accounts, owner) ? accounts[owner] : null;
      if (!Number.isSafeInteger(account?.dailySeconds) || account.dailySeconds % 300 !== 0) throw new LeaseError("funding_unavailable", 503);
      const dailySeconds = Math.min(readDoVoicePolicy().dailySeconds, 900, account?.dailySeconds ?? 0);
      return { enabled: account?.enabled === true, revision: typeof account?.revision === 'string' ? account.revision : '', dailySeconds };
    },
    async binding(owner) {
      const saved = await getPersonalDoProfile(owner);
      // This endpoint shares voice only, not optional personal style/preferences.
      const config = doVoiceConfig('standard', saved.profile.voiceName);
      config.sessionResumption = {};
      config.contextWindowCompression = { slidingWindow: {} };
      return { revision: voiceRevision(owner, saved.profile), model: DO_VOICE_MODELS.standard, voiceName: saved.profile.voiceName, config };
    },
    async issue(binding, deadline, signal) {
      const ai = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: 'v1beta' } });
      const result = await ai.authTokens.create({ config: {
        uses: 1, expireTime: new Date(deadline).toISOString(),
        newSessionExpireTime: new Date(Math.min(deadline, Date.now() + 60_000)).toISOString(),
        liveConnectConstraints: { model: binding.model, config: binding.config },
        abortSignal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000),
      } });
      return { token: result.name ?? '' };
    },
  });
}

/** Logical revocation remains available even when admission/provider flags are off. */
export async function revokeVoiceLease(owner: string, leaseId: string) {
  return durableVoiceLeaseStore().transact(owner, state => {
    const lease = state.leases.find(l => l.id === leaseId);
    if (!lease) throw new LeaseError('lease_unavailable', 404);
    lease.status = 'revoked'; return { revoked: true as const };
  });
}
