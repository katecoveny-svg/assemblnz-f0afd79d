import { z } from 'zod';
export const stockVoiceCandidates = [
  { id: 'en-NZ-MollyNeural', name: 'Molly · female', provider: 'azure-speech', source: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts' },
  { id: 'en-NZ-MitchellNeural', name: 'Mitchell · male', provider: 'azure-speech', source: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts' },
] as const;
/** A portable draft, never a durable account profile, consent receipt or approved voice. */
export const brandVoiceDraftSchema = z.object({
  version: z.literal(1), brand: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(80),
  kind: z.enum(['licensed-stock', 'own-clone', 'designed']), voiceId: z.string().max(120),
  direction: z.string().max(3000), pronunciation: z.string().max(2000), avatarReference: z.string().max(500),
  script: z.string().trim().min(1).max(300), approval: z.literal('not-auditioned'),
}).strict();
export type BrandVoiceDraft = z.infer<typeof brandVoiceDraftSchema>;
export const initialBrandVoice: BrandVoiceDraft = { version: 1, brand: 'My brand', name: 'Auckland voice direction', kind: 'own-clone', voiceId: '', direction: 'Keep the speaker’s own NZ accent and recognisable identity. Warm, clear, natural and relaxed; subtle professional delivery. No American twang. Use the full Auckland brief for review; do not force age, gender or accent changes onto a clone.', pronunciation: '', avatarReference: '', script: 'Hello, thanks for getting in touch. Let’s find a time that works for you.', approval: 'not-auditioned' };
export function referenceProblem(bytes: number, type: string, seconds: number) {
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > 10 * 1024 * 1024) return 'Choose an audio file up to 10 MB.';
  if (!['audio/wav','audio/x-wav','audio/mpeg','audio/mp4','audio/x-m4a','audio/webm','audio/ogg'].includes(type)) return 'Choose WAV, MP3, M4A, WebM or Ogg audio.';
  if (!Number.isFinite(seconds) || seconds < 3 || seconds > 60) return 'Review a clear reference between 3 and 60 seconds.';
  return null;
}
/** Server implementations must supply these facts; UI/exported draft cannot grant them. */
export function previewBlocker(kind: BrandVoiceDraft['kind'], facts: { providerConfigured: boolean; privateProfileStored: boolean; cloningSupported: boolean; designedSupported: boolean; rightsConfirmed: boolean; costApproved: boolean; referenceConsented: boolean }) {
  if (!facts.providerConfigured) return 'No generation provider is connected for this brand workflow.';
  if (!facts.privateProfileStored) return 'An owner-bound private brand profile is required.';
  if (!facts.rightsConfirmed || !facts.costApproved) return 'Provider rights and bounded usage must be reviewed.';
  if (kind === 'own-clone' && (!facts.cloningSupported || !facts.referenceConsented)) return 'A compatible clone engine and consented private reference are required.';
  if (kind === 'designed' && !facts.designedSupported) return 'This provider does not support designed voices.';
  return null;
}
export interface BrandVoiceProviderAdapter {
  readonly id: string;
  capabilities: { stock: boolean; referenceClone: boolean; designed: boolean; deliveryInstructions: boolean; streaming: boolean };
  /** Scope is verified server-side; a browser brand name grants no access. */
  createPreview(scope: { ownerId: string; workspaceId: string }, request: { profileId: string; referenceId?: string; consentReceiptId?: string; script: string; maxCharacters: number }): Promise<{ jobId: string; state: 'queued'; provider: string; costReceiptId: string }>;
  /** Reference failure MUST fail the job, never fall back to an unrelated voice. */
  getPreview(scope: { ownerId: string; workspaceId: string }, jobId: string): Promise<{ state: 'queued' | 'generating' | 'ready' | 'failed'; audioSha256?: string; modelRevision?: string; referenceApplied?: boolean }>;
}
