import type { ConceptConfig } from '@/lib/concepts/types';

/**
 * Private gate shown when a visitor lacks a valid access token. Reveals NO
 * concept content, metrics or scenario — only that this is a private,
 * invitation-only assembl concept, plus the standing independent-concept
 * disclosure and a field to enter an access key (which posts to the /enter
 * magic-link handler). Rendered with noindex from the page metadata.
 */
export function ConceptGate({ concept, configured }: { concept: ConceptConfig; configured: boolean }) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: '#f4f2ec',
        color: '#252d31',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: 460, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.66rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#3f7373',
            margin: 0,
          }}
        >
          assembl · private concept
        </p>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2rem', margin: '0.6rem 0 0.75rem' }}>
          By invitation
        </h1>
        <p style={{ color: '#68766f', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
          This is a private assembl concept shared with a named recipient. If you have an access
          link, open it directly; otherwise enter your access key below.
        </p>

        <form
          action={`/concepts/${concept.slug}/enter`}
          method="get"
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
          <input
            name="k"
            type="text"
            placeholder="Access key"
            aria-label="Access key"
            autoComplete="off"
            style={{
              flex: '1 1 auto',
              maxWidth: 260,
              border: '1px solid rgba(17,19,17,0.15)',
              borderRadius: 999,
              padding: '0.6rem 1rem',
              font: 'inherit',
              background: '#fff',
            }}
          />
          <button
            type="submit"
            style={{
              border: 0,
              borderRadius: 999,
              padding: '0.6rem 1.3rem',
              background: '#252d31',
              color: '#fff',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            Enter
          </button>
        </form>

        {!configured && (
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#8a8f8a' }}>
            Preview mode — signed magic links are not configured in this environment.
          </p>
        )}

        <p
          style={{
            marginTop: '2rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#a0a49f',
          }}
        >
          Independent concept · simulated data · not an active partnership
        </p>
      </div>
    </main>
  );
}
