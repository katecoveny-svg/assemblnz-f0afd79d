/**
 * Shared inbound-message pipeline for the bundle identity webhooks.
 *
 * One flow for every channel:
 *   1. resolve which bundle identity the message was sent TO (phone/email)
 *   2. log the inbound message (bundle_identity_messages)
 *   3. generate a reply with the bundle's lead agent (lib/ai ladder — same
 *      stack as /api/agents/[slug]/chat, prompts live in CODE)
 *   4. queue the reply for Kate in content_approvals (surface
 *      `bundle-identity:<slug>`, kind `sms-reply` / `email-reply`) and log it
 *      as outbound-draft
 *   5. hand the reply to lib/identity/send.ts — whose HARD gate keeps it a
 *      draft until bundle_identity.live is true AND SEND_MODE=live
 *
 * No real send API is ever called from this file.
 */

import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ModelMessage } from 'ai';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import {
  identityMetaBySlug,
  normalizeEmail,
  normalizePhone,
  resolveRoutingAgent,
  type BundleIdentityMeta,
} from './registry';
import { deliverReply, sendModeIsLive, type BundleIdentityRow } from './send';
import { sendPushToTenant } from '@/lib/push/send';

export type InboundMessage = {
  channel: 'sms' | 'email' | 'whatsapp';
  /** the human's address — their mobile or email */
  from: string;
  /** the bundle identity's address the message arrived on */
  to: string;
  body: string;
  /** email only */
  subject?: string;
};

export type InboundResult =
  | {
      ok: true;
      bundleSlug: string;
      agentSlug: string;
      /** 'draft' unless live=true AND SEND_MODE=live */
      mode: 'draft' | 'sent';
      approvalId: string | null;
    }
  | { ok: false; status: number; reason: string };

function serviceClient(): SupabaseClient | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  return createClient(base, key);
}

/**
 * The routing keyword is the first word of the message (shared-number model:
 * one short code / one WhatsApp sender for every identity). "helm hi there",
 * "HELM." and "Helm" all resolve to HELM.
 */
function keywordToken(body: string): string | null {
  const first = body.trim().split(/\s+/)[0]?.replace(/[^\p{L}\p{N}]/gu, '');
  return first ? first.toUpperCase() : null;
}

/**
 * Conversation continuity for shared numbers: a sender who opened with a
 * keyword should not need to repeat it on every message. The most recent
 * inbound row from the same address on the same channel wins.
 */
async function lastBundleForSender(
  supabase: SupabaseClient,
  msg: InboundMessage,
): Promise<string | null> {
  const { data } = await supabase
    .from('bundle_identity_messages')
    .select('bundle_slug')
    .eq('direction', 'inbound')
    .eq('channel', msg.channel)
    .eq('from_addr', msg.from)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { bundle_slug: string } | null)?.bundle_slug ?? null;
}

async function resolveIdentityRow(
  supabase: SupabaseClient,
  msg: InboundMessage,
): Promise<BundleIdentityRow | null> {
  const { data, error } = await supabase
    .from('bundle_identity')
    .select(
      'bundle_slug, display_name, phone, email, telegram_handle, chat_slug, live, keyword_sms, phone_whatsapp, keyword_whatsapp',
    );
  if (error || !data) return null;
  const rows = data as BundleIdentityRow[];

  if (msg.channel === 'email') {
    const wanted = normalizeEmail(msg.to);
    return rows.find((r) => r.email && r.email.toLowerCase() === wanted) ?? null;
  }

  // sms + whatsapp share a number across identities: keyword first, then the
  // sender's ongoing conversation, then the (possibly ambiguous) number match.
  const keyword = keywordToken(msg.body);
  const keywordOf = (r: BundleIdentityRow) =>
    msg.channel === 'sms' ? r.keyword_sms : r.keyword_whatsapp;
  if (keyword) {
    const byKeyword = rows.find((r) => keywordOf(r)?.toUpperCase() === keyword);
    if (byKeyword) return byKeyword;
  }

  const lastSlug = await lastBundleForSender(supabase, msg);
  if (lastSlug) {
    const byHistory = rows.find((r) => r.bundle_slug === lastSlug);
    if (byHistory) return byHistory;
  }

  const wanted = normalizePhone(msg.to);
  if (!wanted) return null;
  const phoneOf = (r: BundleIdentityRow) =>
    msg.channel === 'sms' ? r.phone : r.phone_whatsapp;
  return rows.find((r) => phoneOf(r) && normalizePhone(phoneOf(r)!) === wanted) ?? null;
}

/** Channel-specific drafting instructions appended to the lead agent's prompt. */
function identityPromptBlock(meta: BundleIdentityMeta, msg: InboundMessage): string {
  const shared =
    `You are answering as "${meta.displayName}" — the public front door of the assembl ` +
    `${meta.chatSlug} bundle. A member of the public has messaged this identity directly. ` +
    `Draft ONE reply. It is a DRAFT: a human (Kate) reviews and approves it in /admin before ` +
    `anything is sent, so never claim the message has already been sent or actioned. ` +
    `Never invent prices, commitments, or customer data. Warm-direct voice, short sentences. ` +
    `lowercase "assembl" always.`;
  if (msg.channel === 'sms') {
    return (
      `${shared}\n\nChannel: SMS. Keep the reply under 450 characters, plain text, no markdown, ` +
      `no links unless the sender asked for one. Sign off as ${meta.displayName} · assembl.`
    );
  }
  if (msg.channel === 'whatsapp') {
    return (
      `${shared}\n\nChannel: WhatsApp. Keep the reply under 900 characters, plain text, no ` +
      `markdown, conversational. No links unless the sender asked for one. Sign off as ` +
      `${meta.displayName} · assembl.`
    );
  }
  return (
    `${shared}\n\nChannel: email. Reply in plain text (no markdown syntax), a few short ` +
    `paragraphs at most. Do not include a subject line in the body — it is handled separately. ` +
    `Sign off as ${meta.displayName} · assembl.`
  );
}

export async function handleInboundMessage(msg: InboundMessage): Promise<InboundResult> {
  if (!msg.from || !msg.to || !msg.body?.trim()) {
    return { ok: false, status: 400, reason: 'missing from/to/body' };
  }

  const supabase = serviceClient();
  if (!supabase) {
    return { ok: false, status: 503, reason: 'Supabase service credentials not configured' };
  }

  const identity = await resolveIdentityRow(supabase, msg);
  if (!identity) {
    // Unknown receiving address — acknowledge without processing so providers
    // don't retry forever, but do nothing else.
    return { ok: false, status: 404, reason: `no bundle identity for ${msg.channel} address` };
  }

  // 2 · log the inbound message
  await supabase.from('bundle_identity_messages').insert({
    bundle_slug: identity.bundle_slug,
    direction: 'inbound',
    channel: msg.channel,
    from_addr: msg.from,
    to_addr: msg.to,
    body: msg.subject ? `[${msg.subject}]\n${msg.body}` : msg.body,
  });

  // 3 · generate the reply with the bundle's lead agent
  // DB-only rows (not in the code registry) route via their chat_slug: a row
  // like { bundle_slug: 'atlas', chat_slug: 'atlas' } gives an individual
  // AGENT its own inbound address through this same pipeline — chat_slug is
  // tried first as a bundle lead, then as a marketplace agent slug.
  const meta: BundleIdentityMeta = identityMetaBySlug(identity.bundle_slug) ?? {
    bundleSlug: identity.bundle_slug,
    displayName: identity.display_name,
    email: identity.email ?? '',
    chatSlug: identity.chat_slug,
    routingAgentSlug: identity.chat_slug,
  };
  const agent = resolveRoutingAgent(meta);
  if (!agent) {
    return { ok: false, status: 500, reason: `no routing agent for bundle ${identity.bundle_slug}` };
  }

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC[agent.modelTier], agent.fallbackModels);
  if (!ladder.length) {
    return { ok: false, status: 503, reason: 'no model provider configured (inbound was logged)' };
  }

  const system = `${agent.systemPrompt}\n\n${identityPromptBlock(meta, msg)}`;
  const messages: ModelMessage[] = [
    {
      role: 'user',
      content: msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body,
    },
  ];
  const generated = await generateWithFallback({
    ladder,
    system,
    messages,
    agentSlug: agent.slug,
  });
  if (!generated.ok) {
    return { ok: false, status: 502, reason: 'reply generation failed (inbound was logged)' };
  }
  const replyBody = generated.text.trim();
  const replySubject =
    msg.channel === 'email'
      ? msg.subject
        ? /^re:/i.test(msg.subject.trim())
          ? msg.subject.trim()
          : `Re: ${msg.subject.trim()}`
        : `Re: your message to ${identity.display_name} · assembl`
      : undefined;

  // 4 · queue for approval — this is the review queue Kate sees in /admin
  const { data: approval } = await supabase
    .from('content_approvals')
    .insert({
      surface: `bundle-identity:${identity.bundle_slug}`,
      kind: `${msg.channel}-reply`,
      title: `Draft ${msg.channel.toUpperCase()} reply — ${identity.display_name}`,
      summary: `From ${msg.from}: ${msg.body.slice(0, 200)}`,
      payload: {
        bundleSlug: identity.bundle_slug,
        chatSlug: identity.chat_slug,
        agentSlug: agent.slug,
        channel: msg.channel,
        replyTo: msg.from,
        identityAddress: msg.to,
        inboundSubject: msg.subject ?? null,
        inboundBody: msg.body,
        replySubject: replySubject ?? null,
        replyBody,
        model: generated.rung.id,
      },
      status: 'pending',
      created_by: 'bundle-identity-webhook',
    })
    .select('id')
    .single();
  const approvalId: string | null = (approval as { id: string } | null)?.id ?? null;

  await supabase.from('bundle_identity_messages').insert({
    bundle_slug: identity.bundle_slug,
    direction: 'outbound-draft',
    channel: msg.channel,
    from_addr: msg.to,
    to_addr: msg.from,
    body: replyBody,
    agent_reply_approval_id: approvalId,
  });

  // 4b · web push to any installed workspace apps subscribed under this slug —
  // a POINTER only ("new draft reply waiting"), never the message content.
  // Draft-only rules unchanged: the push notifies, it cannot send. Best-effort
  // (no-op when VAPID keys or subscriptions are absent).
  try {
    await sendPushToTenant(identity.bundle_slug, {
      title: `${identity.display_name} · assembl`,
      body: `New draft ${msg.channel.toUpperCase()} reply waiting for approval.`,
      url: '/admin/approvals',
      tag: `draft-${identity.bundle_slug}`,
    });
  } catch {
    /* push is infrastructure, never the pipeline */
  }

  // 5 · the send door — hard-gated to draft unless live=true AND SEND_MODE=live
  let mode: 'draft' | 'sent' = 'draft';
  if (sendModeIsLive() && identity.live) {
    const delivered = await deliverReply(identity, {
      channel: msg.channel,
      to: msg.from,
      body: replyBody,
      subject: replySubject,
    });
    if (delivered.mode === 'sent') {
      mode = 'sent';
      await supabase.from('bundle_identity_messages').insert({
        bundle_slug: identity.bundle_slug,
        direction: 'outbound-sent',
        channel: msg.channel,
        from_addr: msg.to,
        to_addr: msg.from,
        body: replyBody,
        agent_reply_approval_id: approvalId,
      });
    }
  }

  return { ok: true, bundleSlug: identity.bundle_slug, agentSlug: agent.slug, mode, approvalId };
}
