/**
 * Mana Receipt writer for marketplace chat.
 *
 * One receipt per completed exchange: which agent, which model, which prompt
 * version, which knowledge tools ran. This is the ledger /admin/receipts
 * already reads (searchReceipts in lib/admin/v2-data.ts) — the "why this
 * happened" drawer opens these rows.
 *
 * Fire-and-forget: a receipt failure never blocks or degrades chat.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

export type ChatReceipt = {
  agent: string;
  domain: string | null;
  model: string;
  promptSource: 'db' | 'code';
  promptVersion: number | null;
  toolsUsed: string[];
  draftMode: true; // marketplace chat never sends, lodges, or files anything
};

export type ActionReceipt = {
  agent: string;
  action: 'email_draft' | 'webhook';
  requestId: string;
  stage: 'requested' | 'approved' | 'rejected' | 'dispatched' | 'failed';
  reviewer: string | null;
};

/**
 * One receipt per stage of an action request's life (requested → decided →
 * dispatched/failed), so /admin/receipts shows the whole chain of custody:
 * the agent proposed, a named person decided, and what happened after.
 */
export function writeActionReceipt(receipt: ActionReceipt): void {
  void (async () => {
    try {
      const service = getServiceClient();
      await service.from('mana_receipts').insert({
        agent: receipt.agent,
        domain: null,
        issuer: 'action-path',
        hitl: {
          status: receipt.stage,
          reviewer: receipt.reviewer,
          send_mode: receipt.stage === 'dispatched' ? 'sent_after_approval' : 'held',
        },
        detail: {
          action: receipt.action,
          request_id: receipt.requestId,
        },
      });
    } catch {
      // Receipts are best-effort by design.
    }
  })();
}

export function writeChatReceipt(receipt: ChatReceipt): void {
  void (async () => {
    try {
      const service = getServiceClient();
      await service.from('mana_receipts').insert({
        agent: receipt.agent,
        domain: receipt.domain,
        issuer: 'marketplace-chat',
        hitl: { status: 'draft_only', send_mode: 'draft' },
        detail: {
          model: receipt.model,
          prompt_source: receipt.promptSource,
          prompt_version: receipt.promptVersion,
          tools_used: receipt.toolsUsed,
        },
      });
    } catch {
      // Receipts are best-effort by design.
    }
  })();
}
