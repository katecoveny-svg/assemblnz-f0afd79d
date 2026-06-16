/**
 * Deploy the Manaaki voice agent (Aria) to ElevenLabs Agents.
 *
 *   pnpm voice:deploy:manaaki
 *
 * Reads the canonical persona + knowledge from lib/voice/manaaki/, POSTs the
 * agent config to ElevenLabs (create or update), uploads the knowledge-base
 * docs for RAG, and prints the returned agent id to paste into
 * ELEVENLABS_AGENT_ID. The declarative shape is documented in
 * lib/voice/manaaki/agent.config.yaml; this script constructs the equivalent
 * JSON body so we don't need a YAML parser in the toolchain.
 *
 * Phase 1: NZ-English voice (te reo not supported by ElevenLabs). Brain is the
 * Tōro Custom LLM (OpenAI-compatible). Tools point at VOICE_PUBLIC_BASE_URL.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { upsertAgent, uploadKnowledge, elevenLabsKeyFromEnv } from '../lib/voice/clients/elevenlabs';

const ROOT = join(process.cwd(), 'lib', 'voice', 'manaaki');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function toolDef(name: string, description: string) {
  const base = process.env.VOICE_PUBLIC_BASE_URL ?? '';
  return {
    type: 'webhook',
    name,
    description,
    api_schema: { url: `${base}/api/voice/${name.replace(/_/g, '-')}`, method: 'POST' },
  };
}

async function main() {
  const apiKey = elevenLabsKeyFromEnv();
  const base = process.env.VOICE_PUBLIC_BASE_URL;
  if (!base) throw new Error('VOICE_PUBLIC_BASE_URL must be set (e.g. https://assembl.co.nz)');

  const systemPrompt = read('system-prompt.md');
  const menu = read('knowledge/whetu-menu.md');
  const policies = read('knowledge/whetu-policies.md');

  console.log('Uploading knowledge base…');
  const kb = await Promise.all([
    uploadKnowledge(apiKey, 'whetu-menu', menu),
    uploadKnowledge(apiKey, 'whetu-policies', policies),
  ]);

  const body = {
    name: 'aria.manaaki@demo',
    conversation_config: {
      agent: {
        prompt: {
          prompt: systemPrompt,
          llm: 'custom',
          custom_llm: {
            url: process.env.TORO_ENDPOINT,
            model_id: 'claude-haiku-4-5',
            api_key: { secret_env: 'CLAUDE_API_KEY' },
          },
          tools: [
            toolDef('check_availability', 'Find bookable tables for a date and party size.'),
            toolDef('book_reservation', 'Create a confirmed reservation.'),
            toolDef('send_sms', 'Text the booking confirmation to the caller.'),
            toolDef('warm_transfer', 'Hand the call to a human at Whetū.'),
            toolDef('capture_message', 'Take a voicemail-style message.'),
            toolDef('capture_consent', 'Log the caller’s recording-consent reply.'),
          ],
          knowledge_base: kb.map((k) => ({ id: k.id })),
        },
        language: 'en',
        first_message:
          'Kia ora, you’ve reached Whetū — I’m Aria, the booking assistant. I record calls just to confirm your booking; is that OK?',
      },
      tts: { voice_id: process.env.ELEVENLABS_VOICE_ID },
    },
    platform_settings: {
      workspace_overrides: {
        webhooks: { post_call_webhook_url: `${base}/api/voice/post-call` },
      },
    },
  };

  console.log('Upserting agent…');
  const { agent_id } = await upsertAgent(apiKey, body, process.env.ELEVENLABS_AGENT_ID || undefined);

  console.log('\n✓ Deployed Aria (Manaaki phase 1)');
  console.log(`  ELEVENLABS_AGENT_ID=${agent_id}`);
  console.log('  → paste that into your env (and Vercel project env) and re-run to update.');
}

main().catch((err) => {
  console.error('voice:deploy:manaaki failed:', err.message);
  process.exit(1);
});
