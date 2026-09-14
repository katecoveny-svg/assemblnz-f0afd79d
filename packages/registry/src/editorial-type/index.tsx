/** @assembl/editorial-type — stub. Type hierarchy helpers. */
import type { CSSProperties, ReactNode } from 'react';

export interface EditorialTypeProps {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  tone?: 'display' | 'body' | 'proof';
  children: ReactNode;
}

const STYLES: Record<NonNullable<EditorialTypeProps['tone']>, CSSProperties> = {
  display: {
    fontFamily: 'Instrument Sans, sans-serif',
    fontWeight: 450,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    color: '#240B21',
  },
  body: {
    fontFamily: 'Instrument Sans, sans-serif',
    fontWeight: 400,
    lineHeight: 1.55,
    color: 'rgba(36,11,33,0.68)',
  },
  proof: {
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 12,
    letterSpacing: '0.02em',
    color: '#916A70',
  },
};

export function EditorialType({ as = 'p', tone = 'body', children }: EditorialTypeProps) {
  const Tag = as;
  return (
    <Tag data-assembl-block="editorial-type" data-tone={tone} style={STYLES[tone]}>
      {children}
    </Tag>
  );
}

export default EditorialType;
