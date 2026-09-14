/** @assembl/agent-live — stub. Quiet coordinator presence. */
export interface AgentLiveProps {
  name?: string;
  status?: 'observing' | 'assembling' | 'awaiting-approval';
  demo?: boolean;
}

export function AgentLive({
  name = 'agent',
  status = 'assembling',
  demo = true,
}: AgentLiveProps) {
  return (
    <aside
      data-assembl-block="agent-live"
      data-demo={demo ? 'true' : undefined}
      style={{
        border: '1px solid rgba(36,11,33,0.28)',
        background: '#FFFDFB',
        padding: '0.85rem 1rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'baseline',
      }}
    >
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#916A70' }}>
        {status}
      </span>
      <strong style={{ fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500 }}>{name}</strong>
      <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#654A4E' }}>
        @assembl/agent-live{demo ? ' · DEMO' : ''}
      </span>
    </aside>
  );
}

export default AgentLive;
