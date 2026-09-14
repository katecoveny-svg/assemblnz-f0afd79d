/** @assembl/wait-state — stub. Honest assembling / wait proof. */
export interface WaitStateProps {
  label?: string;
  evidence?: string;
  demo?: boolean;
}

export function WaitState({
  label = 'assembling',
  evidence = 'DEMO · proof pending',
  demo = true,
}: WaitStateProps) {
  return (
    <div
      data-assembl-block="wait-state"
      data-demo={demo ? 'true' : undefined}
      style={{
        background: '#240B21',
        color: '#FFFDFB',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#916A70' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{evidence}</span>
      {demo ? (
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, opacity: 0.7 }}>
          @assembl/wait-state · DEMO stub
        </span>
      ) : null}
    </div>
  );
}

export default WaitState;
