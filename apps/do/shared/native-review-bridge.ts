import { z } from 'zod';

export const NATIVE_REVIEW_VERSION = 1 as const;
export class NativeRecipientLookupError extends Error {
  constructor(readonly code: 'sign_in_required' | 'workspace_version_required' | 'recipient_unavailable') { super(code); }
}
export const NATIVE_REVIEW_SCOPE = 'Personal' as const;
const uuid = z.string().uuid();
const revision = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const nativeRecipientSchema = z.object({ version: z.literal(1), owner: uuid, scope: z.literal('Personal'), label: z.string().min(1).max(100).regex(/^[\x20-\x7e]+$/) }).strict();
export type NativeRecipient = z.infer<typeof nativeRecipientSchema>;
const bindingSchema = z.object({ version: z.literal(1), documentId: uuid, owner: uuid, scope: z.literal('Personal'), generation: revision, editorRevision: revision, navigationGeneration: revision, reviewRevision: revision, offerId: uuid }).strict();
export type NativeBinding = z.infer<typeof bindingSchema>;
const reserve = bindingSchema.extend({ action: z.literal('reserve') }).strict();
const commit = bindingSchema.extend({ action: z.literal('commit'), reservation: uuid, text: z.string().max(12000).refine(text => Boolean(text.trim()), 'empty_text') }).strict();
const receipt = bindingSchema.extend({ action: z.literal('receipt') }).strict();
const cancel = bindingSchema.extend({ action: z.literal('cancel') }).strict();
export const nativeReviewRequestSchema = z.discriminatedUnion('action', [z.object({ version: z.literal(1), action: z.literal('lookup') }).strict(), reserve, commit, receipt, cancel]);
export type NativeReviewRequest = z.infer<typeof nativeReviewRequestSchema>;
export type NativeMetadata = NativeRecipient & { documentId: string; generation: number; editorRevision: number; occupied: boolean };
export type NativeReceipt = NativeBinding & { status: 'accepted'; committedEditorRevision: number };
export type NativeResponse =
  | (NativeMetadata & { status: 'recipient' })
  | (NativeBinding & { status: 'reserved'; reservation: string; expiresAt: number })
  | NativeReceipt
  | { version: 1; status: 'pending' | 'cancelled' | 'unknown' }
  | { version: 1; status: 'rejected'; code: string };

type Entry = { binding: NativeBinding; token: string; expiresAt: number; text?: string; phase: 'reserved' | 'committing' | 'accepted' | 'cancelled' | 'failed'; receipt?: NativeReceipt; promise?: Promise<NativeResponse>; finish?: (result: NativeResponse) => void };
export type NativeEditor = { revision: number; occupied: boolean };
export type NativeReviewEnvironment = {
  allowedDocument(): boolean;
  resolveRecipient(): Promise<NativeRecipient | null>;
  editor(): NativeEditor;
  // The component invokes committed only after its actual editor render commits.
  commit(text: string, binding: NativeBinding, committed: (editorRevision: number) => void): void;
  clear(): void;
  unavailable?(): void;
  now?(): number;
  randomId?(): string;
};
const rejected = (code: string): NativeResponse => ({ version: 1, status: 'rejected', code });
const sameBinding = (a: NativeBinding, b: NativeBinding) => Object.keys(a).every(key => a[key as keyof NativeBinding] === b[key as keyof NativeBinding]);
export function nativeReviewDocumentAllowed(url: string, mainFrame: boolean) {
  try {
    const value = new URL(url);
    return mainFrame && !value.username && !value.password && value.protocol === 'https:' && value.hostname === 'www.assembl.co.nz' && (value.port === '' || value.port === '443') && value.pathname === '/do/widget' && value.searchParams.get('nativeReview') === '1';
  } catch { return false; }
}

/** One mounted editor/document. No durable store, telemetry, providers or text transport. */
export class NativeReviewBridge {
  readonly documentId: string;
  private generation = 0;
  private recipient: NativeRecipient | null = null;
  private lastConfirmedRecipient: NativeRecipient | null = null;
  private disposed = false;
  private identityIssued = 0;
  private identityApplied = 0;
  private failureCode = 'recipient_unavailable';
  private entries = new Map<string, Entry>();
  private revisions = new Set<string>();
  private now: () => number;
  private id: () => string;

  constructor(private environment: NativeReviewEnvironment) {
    this.now = environment.now ?? Date.now;
    this.id = environment.randomId ?? (() => crypto.randomUUID());
    this.documentId = this.id();
  }

  invalidate(clear = true) {
    this.generation++;
    this.recipient = null;
    for (const entry of this.entries.values()) {
      if (entry.phase !== 'accepted') { entry.phase = 'failed'; entry.finish?.(rejected('recipient_invalidated')); }
    }
    if (clear) { this.lastConfirmedRecipient = null; this.environment.clear(); }
    else this.environment.unavailable?.();
  }
  dispose() { this.disposed = true; this.invalidate(); }

  private async identity(): Promise<NativeRecipient | null> {
    const generation = this.generation;
    const sequence = ++this.identityIssued;
    let value: NativeRecipient | null;
    try { value = await this.environment.resolveRecipient(); } catch (cause) {
      if (!this.disposed && generation === this.generation && sequence >= this.identityApplied) { this.identityApplied = sequence; this.failureCode = cause instanceof NativeRecipientLookupError ? cause.code : 'recipient_unavailable'; this.invalidate(this.failureCode === 'sign_in_required'); }
      return null;
    }
    if (this.disposed || generation !== this.generation || sequence < this.identityApplied || !this.environment.allowedDocument()) return null;
    this.identityApplied = sequence;
    if (!value || !nativeRecipientSchema.safeParse(value).success) { this.invalidate(false); return null; }
    if (this.lastConfirmedRecipient && (value.owner !== this.lastConfirmedRecipient.owner || value.scope !== this.lastConfirmedRecipient.scope)) this.invalidate();
    this.recipient = value; this.lastConfirmedRecipient = value; this.failureCode = 'recipient_unavailable';
    return value;
  }

  private matches(binding: NativeBinding, owner: NativeRecipient) {
    return binding.documentId === this.documentId && binding.owner === owner.owner && binding.scope === owner.scope && binding.generation === this.generation;
  }

  async request(raw: unknown): Promise<NativeResponse> {
    const parsed = nativeReviewRequestSchema.safeParse(raw);
    if (!parsed.success) return rejected('invalid_request');
    if (this.disposed || !this.environment.allowedDocument()) return rejected('wrong_document');
    const request = parsed.data;
    // A late close cannot retract acceptance or require network availability.
    if (request.action === 'cancel') {
      const binding = bindingSchema.strip().parse(request);
      const existing = this.entries.get(binding.offerId);
      if (binding.documentId === this.documentId && binding.generation === this.generation && existing?.receipt && sameBinding(existing.binding, binding)) return existing.receipt;
    }
    const owner = await this.identity();
    if (!owner) return rejected(this.failureCode);
    const editor = this.environment.editor();
    if (request.action === 'lookup') return { ...owner, status: 'recipient', documentId: this.documentId, generation: this.generation, editorRevision: editor.revision, occupied: editor.occupied };
    const binding = bindingSchema.strip().parse(request);
    if (!this.matches(binding, owner)) return rejected('recipient_changed');
    const existing = this.entries.get(binding.offerId);
    if (existing && !sameBinding(existing.binding, binding)) return rejected('offer_conflict');
    if (request.action === 'receipt') return existing?.receipt ?? { version: 1, status: existing?.phase === 'committing' ? 'pending' : 'unknown' };
    if (request.action === 'cancel') {
      if (existing?.receipt) return existing.receipt; // Acceptance cannot be retracted by a late cancellation.
      if (existing?.phase === 'committing') return { version: 1, status: 'pending' }; // React may already have committed; do not claim retraction.
      if (existing) { existing.phase = 'cancelled'; existing.finish?.({ version: 1, status: 'cancelled' }); }
      return { version: 1, status: 'cancelled' };
    }
    if (request.action === 'reserve') {
      if (existing) return rejected('offer_used');
      const revisionKey = `${binding.navigationGeneration}:${binding.reviewRevision}`;
      if (this.revisions.has(revisionKey)) return rejected('revision_used');
      if (this.entries.size >= 32) return rejected('document_offer_limit');
      if (editor.occupied || editor.revision !== binding.editorRevision) return rejected('editor_changed');
      const entry: Entry = { binding, token: this.id(), expiresAt: this.now() + 15000, phase: 'reserved' };
      this.entries.set(binding.offerId, entry); this.revisions.add(revisionKey);
      return { ...binding, status: 'reserved', reservation: entry.token, expiresAt: entry.expiresAt };
    }
    if (!existing || request.reservation !== existing.token) return rejected('invalid_reservation');
    if (existing.text !== undefined && existing.text !== request.text) return rejected('offer_payload_changed');
    if (existing.receipt) return existing.receipt;
    if (existing.phase === 'committing') return existing.promise!;
    if (existing.phase !== 'reserved' || this.now() >= existing.expiresAt) return rejected('expired_or_used');
    if (editor.occupied || editor.revision !== binding.editorRevision) return rejected('editor_changed');
    // Consume before any render or await. Duplicates can only observe this exact attempt.
    existing.phase = 'committing'; existing.text = request.text;
    existing.promise = new Promise(resolve => { existing.finish = resolve; });
    try {
      this.environment.commit(request.text, binding, committedEditorRevision => {
        if (existing.phase !== 'committing') return;
        if (this.disposed || !this.environment.allowedDocument() || !this.recipient || !this.matches(binding, this.recipient) || committedEditorRevision !== binding.editorRevision + 1) {
          existing.phase = 'failed'; existing.finish?.(rejected('commit_invalidated')); return;
        }
        void this.identity().then(confirmed => {
          if (existing.phase !== 'committing') return;
          if (!confirmed || !this.matches(binding, confirmed)) { existing.phase = 'failed'; existing.finish?.(rejected('recipient_changed')); return; }
          existing.receipt = { ...binding, status: 'accepted', committedEditorRevision };
          existing.phase = 'accepted'; existing.finish?.(existing.receipt);
        });
      });
    } catch { existing.phase = 'failed'; existing.finish?.(rejected('editor_failed')); }
    return existing.promise;
  }
}
