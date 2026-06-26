import { Fragment, type ReactNode } from 'react';
import { PALETTE } from '@/lib/marketplace/agents';

/**
 * Lightweight, dependency-free markdown renderer for agent chat replies.
 *
 * Agent output is markdown (headings, bold, lists, links). Before this, the
 * chat dumped it into a `whitespace-pre-wrap` <p>, so users saw literal `**`,
 * `###`, and `[text](url)`. This renders the constructs the agents actually
 * emit and nothing exotic — kept small on purpose so there is no new runtime
 * dependency and no parser surface to audit.
 *
 * Safety: links only render as anchors for http(s)/mailto targets; everything
 * else stays plain text, and all text is rendered through React (auto-escaped),
 * so model output cannot inject markup.
 */

// Asterisk emphasis only — underscore emphasis is deliberately unsupported so
// identifiers agents mention (agent_slugs, NEXT_PUBLIC_*) are never italicised.
const INLINE = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*([^*\n]+)\*)/g;

function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed;
  return null;
}

/** Render inline markdown (bold, italic, code, links) within a single line. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`${keyPrefix}-t${i}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const key = `${keyPrefix}-m${i}`;
    if (match[2] != null) {
      nodes.push(<strong key={key} style={{ fontWeight: 700, color: PALETTE.ink }}>{match[2]}</strong>);
    } else if (match[4] != null) {
      nodes.push(
        <code
          key={key}
          style={{
            fontFamily: 'var(--font-space-mono), ui-monospace, monospace',
            fontSize: '0.92em',
            background: 'rgba(0,0,0,0.05)',
            padding: '0.05em 0.35em',
            borderRadius: 4,
          }}
        >
          {match[4]}
        </code>,
      );
    } else if (match[6] != null && match[7] != null) {
      const href = safeHref(match[7]);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#B8860B', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {match[6]}
          </a>
        ) : (
          <Fragment key={key}>{match[6]}</Fragment>
        ),
      );
    } else if (match[9] != null) {
      nodes.push(<em key={key}>{match[9]}</em>);
    }
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-t${i}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return nodes;
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'p'; lines: string[] }
  | { kind: 'hr' };

/** Group lines into block-level structures (headings, lists, paragraphs). */
function toBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: 'p', lines: para });
      para = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (line.trim() === '') {
      flushPara();
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flushPara();
      blocks.push({ kind: 'hr' });
      continue;
    }
    if (heading) {
      flushPara();
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      continue;
    }
    if (bullet) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'ul') last.items.push(bullet[1]);
      else blocks.push({ kind: 'ul', items: [bullet[1]] });
      continue;
    }
    if (ordered) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'ol') last.items.push(ordered[1]);
      else blocks.push({ kind: 'ol', items: [ordered[1]] });
      continue;
    }
    para.push(line);
  }
  flushPara();
  return blocks;
}

export function AgentMarkdown({ text }: { text: string }) {
  const blocks = toBlocks(text);
  return (
    <div className="agent-md text-sm leading-relaxed">
      {blocks.map((block, bi) => {
        switch (block.kind) {
          case 'heading': {
            const size = block.level <= 1 ? '1.15em' : block.level === 2 ? '1.05em' : '1em';
            return (
              <p
                key={bi}
                style={{ fontWeight: 700, color: PALETTE.ink, fontSize: size, margin: bi === 0 ? '0 0 0.35em' : '0.7em 0 0.35em' }}
              >
                {renderInline(block.text, `h${bi}`)}
              </p>
            );
          }
          case 'ul':
            return (
              <ul key={bi} style={{ listStyle: 'disc', paddingLeft: '1.25em', margin: '0.35em 0' }}>
                {block.items.map((item, ii) => (
                  <li key={ii} style={{ margin: '0.15em 0' }}>{renderInline(item, `ul${bi}-${ii}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={bi} style={{ listStyle: 'decimal', paddingLeft: '1.4em', margin: '0.35em 0' }}>
                {block.items.map((item, ii) => (
                  <li key={ii} style={{ margin: '0.15em 0' }}>{renderInline(item, `ol${bi}-${ii}`)}</li>
                ))}
              </ol>
            );
          case 'hr':
            return <hr key={bi} style={{ border: 0, borderTop: `1px solid ${PALETTE.hairline}`, margin: '0.7em 0' }} />;
          case 'p':
          default:
            return (
              <p key={bi} style={{ margin: bi === 0 ? 0 : '0.5em 0 0' }}>
                {(block as { lines: string[] }).lines.map((line, li, arr) => (
                  <Fragment key={li}>
                    {renderInline(line, `p${bi}-${li}`)}
                    {li < arr.length - 1 ? <br /> : null}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
