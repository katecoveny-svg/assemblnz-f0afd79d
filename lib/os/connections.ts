/**
 * Connections view — connected systems, honestly.
 *
 * (Brief §11 Connections.) Reports what is actually wired up on this
 * deployment: which providers hold keys, which capabilities resolve, and
 * what is declared but not connected. Presence booleans only — no secret
 * values ever leave the server. Server-only; the UI gets a serialisable
 * view model.
 */
import 'server-only';
import { CAPABILITIES, resolveCapability } from './capabilities';

export type ConnectionState = 'connected' | 'approval_gated' | 'not_connected';

export type ConnectionView = {
  name: string;
  role: string;
  state: ConnectionState;
  note: string;
};

export type ConnectionsView = {
  systems: ConnectionView[];
  capabilities: Array<{
    key: string;
    description: string;
    state: ConnectionState;
    needsApproval: boolean;
  }>;
};

function has(name: string): boolean {
  return Boolean(process.env[name] && String(process.env[name]).length > 0);
}

export function loadConnectionsView(): ConnectionsView {
  const dispatchOn = process.env.ACTION_DISPATCH_ENABLED === 'true';

  const systems: ConnectionView[] = [
    {
      name: 'Business data (Supabase)',
      role: 'the genome, tasks, evidence and enquiries',
      state: has('SUPABASE_SERVICE_ROLE_KEY') ? 'connected' : 'not_connected',
      note: has('SUPABASE_SERVICE_ROLE_KEY')
        ? 'live — every surface reads the same source of truth'
        : 'no service key on this deployment — surfaces fall back to sample data',
    },
    {
      name: 'Claude (Anthropic)',
      role: 'primary reasoning and drafting',
      state: has('ANTHROPIC_API_KEY') ? 'connected' : 'not_connected',
      note: has('ANTHROPIC_API_KEY') ? 'primary model' : 'not configured — ladder falls through',
    },
    {
      name: 'Gemini (Google)',
      role: 'first fallback model',
      state:
        has('GEMINI_API_KEY') || has('GOOGLE_GENERATIVE_AI_API_KEY')
          ? 'connected'
          : 'not_connected',
      note: 'used only when the primary is unavailable, always disclosed',
    },
    {
      name: 'Outbound email',
      role: 'sending approved replies',
      state: dispatchOn && has('BREVO_API_KEY') ? 'approval_gated' : 'not_connected',
      note: dispatchOn
        ? 'dispatch enabled — still requires a named operator’s yes per message'
        : 'dispatch is deliberately OFF — drafts queue for approval and nothing sends',
    },
    {
      name: 'Payments (Stripe)',
      role: 'billing and checkout',
      state: has('STRIPE_SECRET_KEY') ? 'connected' : 'not_connected',
      note: has('STRIPE_SECRET_KEY') ? 'live' : 'not configured on this deployment',
    },
    {
      name: 'Voice (ElevenLabs)',
      role: 'the platform voice',
      state: has('ELEVENLABS_API_KEY') ? 'connected' : 'not_connected',
      note: has('ELEVENLABS_API_KEY') ? 'live' : 'browser speech carries the desk instead',
    },
  ];

  return {
    systems,
    capabilities: CAPABILITIES.map((c) => {
      const r = resolveCapability(c.key);
      return {
        key: c.key,
        description: c.description,
        state:
          r.resolution === 'not_connected'
            ? 'not_connected'
            : r.resolution === 'action_request'
              ? 'approval_gated'
              : 'connected',
        needsApproval: r.needsApproval,
      };
    }),
  };
}
