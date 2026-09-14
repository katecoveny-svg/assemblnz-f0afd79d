/** @assembl/sideways-story — stub. Horizontal chapter rail. */
export interface SidewaysChapter {
  id: string;
  title: string;
  body: string;
}

export interface SidewaysStoryProps {
  chapters?: SidewaysChapter[];
  demo?: boolean;
}

const DEFAULT: SidewaysChapter[] = [
  { id: 'many', title: 'Many', body: 'Signals scatter across the household.' },
  { id: 'coordinate', title: 'Coordinate', body: 'An agent gathers options without theatre.' },
  { id: 'one', title: 'One', body: 'A single plan settles for human yes.' },
];

export function SidewaysStory({ chapters = DEFAULT, demo = true }: SidewaysStoryProps) {
  return (
    <section
      data-assembl-block="sideways-story"
      data-demo={demo ? 'true' : undefined}
      style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1.5rem', background: '#FFFDFB' }}
    >
      {chapters.map((c) => (
        <article
          key={c.id}
          style={{
            minWidth: 'min(80vw, 320px)',
            border: '1px solid rgba(36,11,33,0.12)',
            padding: '1.25rem',
            background: '#F5F1F2',
          }}
        >
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#916A70', margin: 0 }}>
            {c.id}
          </p>
          <h3 style={{ fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500, margin: '0.4rem 0' }}>
            {c.title}
          </h3>
          <p style={{ margin: 0, color: 'rgba(36,11,33,0.68)', lineHeight: 1.45 }}>{c.body}</p>
        </article>
      ))}
    </section>
  );
}

export default SidewaysStory;
