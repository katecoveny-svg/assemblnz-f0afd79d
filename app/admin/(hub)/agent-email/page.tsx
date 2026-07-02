/**
 * Agent email — cross-agent inbound triage.
 *
 * Server-rendered, service-role read, gated by a secret token in the URL (same
 * stopgap as /admin/leads). This is the cross-agent support surface: every
 * agent's email threads in one place, newest first, with a reply box that sends
 * FROM the agent's own address.
 *
 * Env:
 *   SUPABASE_SERVICE_ROLE_KEY      server-only
 *   AGENT_EMAIL_ADMIN_TOKEN        (falls back to LEADS_VIEW_TOKEN)
 *
 * Open: https://www.assembl.co.nz/admin/agent-email?key=YOUR_TOKEN
 *       add &agent=tax-tidy to filter to one agent.
 */
import { getServiceClient } from '@/lib/supabase/service';
import { agentEmailAddress } from '@/lib/agent-email/addresses';
import { ReplyForm } from './ReplyForm';

export const dynamic = 'force-dynamic';

type Thread = {
  id: string;
  agent_slug: string;
  customer_email: string;
  customer_name: string | null;
  subject: string | null;
  status: string;
  last_message_at: string;
};

type Message = {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  subject: string | null;
  body: string;
  quarantined: boolean;
  quarantine_reason: string | null;
  created_at: string;
};

const TOKEN = process.env.AGENT_EMAIL_ADMIN_TOKEN || process.env.LEADS_VIEW_TOKEN || '';

const nzDate = (iso: string) =>
  new Date(iso).toLocaleString('en-NZ', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

export default async function AgentEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; agent?: string }>;
}) {
  const params = await searchParams;

  if (!TOKEN || params.key !== TOKEN) {
    return (
      <main style={S.page}>
        <p style={S.muted}>Not authorised.</p>
      </main>
    );
  }

  const supabase = getServiceClient();

  let threads: Thread[] = [];
  let messagesByThread: Record<string, Message[]> = {};
  let error = '';

  try {
    let q = supabase
      .from('agent_email_threads')
      .select('id, agent_slug, customer_email, customer_name, subject, status, last_message_at')
      .order('last_message_at', { ascending: false })
      .limit(200);
    if (params.agent) q = q.eq('agent_slug', params.agent);
    const { data: tData, error: tErr } = await q;
    if (tErr) throw tErr;
    threads = (tData as Thread[]) ?? [];

    const ids = threads.map((t) => t.id);
    if (ids.length) {
      const { data: mData, error: mErr } = await supabase
        .from('agent_email_messages')
        .select('id, thread_id, direction, subject, body, quarantined, quarantine_reason, created_at')
        .in('thread_id', ids)
        .order('created_at', { ascending: true });
      if (mErr) throw mErr;
      for (const m of (mData as Message[]) ?? []) {
        (messagesByThread[m.thread_id] ??= []).push(m);
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Could not load threads';
  }

  const quarantined = threads.filter((t) => t.status === 'quarantined').length;

  return (
    <main style={S.page}>
      <h1 style={S.h1}>Agent email</h1>
      <p style={S.muted}>
        {threads.length} thread{threads.length === 1 ? '' : 's'}
        {quarantined ? ` · ${quarantined} quarantined` : ''}
        {params.agent ? ` · filtered to ${params.agent}` : ''}
      </p>

      {error && <p style={S.error}>{error}</p>}
      {!error && threads.length === 0 && (
        <p style={S.muted}>No agent email yet. Send one to an agent address to see it here.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        {threads.map((t) => {
          const agentAddr = agentEmailAddress(t.agent_slug) ?? `${t.agent_slug}@assembl.co.nz`;
          const msgs = messagesByThread[t.id] ?? [];
          return (
            <section key={t.id} style={S.card}>
              <div style={S.cardHead}>
                <div>
                  <span style={S.agentTag}>{t.agent_slug}</span>
                  {t.status === 'quarantined' && <span style={S.quarTag}>quarantined</span>}
                  <span style={S.from}>
                    {' '}{t.customer_name ? `${t.customer_name} · ` : ''}{t.customer_email}
                  </span>
                </div>
                <span style={S.when}>{nzDate(t.last_message_at)}</span>
              </div>
              <p style={S.subject}>{t.subject || '(no subject)'}</p>
              <p style={S.addr}>via {agentAddr}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      ...S.bubble,
                      alignSelf: m.direction === 'outbound' ? 'flex-end' : 'flex-start',
                      background: m.direction === 'outbound' ? '#FFF7EC' : '#FFFFFF',
                      borderColor: m.quarantined ? '#E0A800' : '#EFEADC',
                    }}
                  >
                    <span style={S.bubbleMeta}>
                      {m.direction === 'outbound' ? '↑ agent' : '↓ customer'} · {nzDate(m.created_at)}
                      {m.quarantined ? ` · held: ${m.quarantine_reason ?? 'sensitive'}` : ''}
                    </span>
                    <p style={S.bubbleBody}>{m.body || '—'}</p>
                  </div>
                ))}
              </div>

              <ReplyForm threadId={t.id} token={TOKEN} toEmail={t.customer_email} />
            </section>
          );
        })}
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FFF7EC',
    padding: '40px 24px',
    fontFamily: "'Lato', system-ui, sans-serif",
    color: '#3A3832',
  },
  h1: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 34,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    margin: '0 0 4px',
  },
  muted: { color: '#8A8678', fontSize: 14, margin: '0 0 8px' },
  error: { color: '#B5533A', fontSize: 14 },
  card: {
    background: '#FFFFFF',
    border: '1px solid #EFEADC',
    borderRadius: 18,
    padding: '18px 20px',
    boxShadow: '0 16px 44px rgba(180, 140, 0, 0.06)',
    maxWidth: 760,
  },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  agentTag: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#C79B1F',
    fontWeight: 700,
  },
  quarTag: {
    marginLeft: 8,
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#E0A800',
    border: '1px solid #E0A800',
    borderRadius: 999,
    padding: '1px 7px',
  },
  from: { fontSize: 13, color: '#56544B' },
  when: { fontSize: 12, color: '#8A8678', whiteSpace: 'nowrap' },
  subject: { margin: '8px 0 0', fontSize: 15, fontWeight: 700, color: '#3A3832' },
  addr: { margin: '2px 0 0', fontSize: 12, color: '#8A8678', fontFamily: "'Space Mono', monospace" },
  bubble: { maxWidth: '88%', border: '1px solid #EFEADC', borderRadius: 14, padding: '9px 13px' },
  bubbleMeta: { display: 'block', fontSize: 11, color: '#8A8678', marginBottom: 3 },
  bubbleBody: { margin: 0, fontSize: 14, lineHeight: 1.5, color: '#3A3832', whiteSpace: 'pre-wrap' },
};
