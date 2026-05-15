import 'server-only';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type DocMeta = {
  slug: string;
  title: string;
  description: string;
  group: string;
  order: number;
};

export type DocBlock =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export type DocPage = DocMeta & {
  body: string;
  blocks: DocBlock[];
  searchText: string;
};

const DOCS_DIR = join(process.cwd(), 'app/docs/content');

export function getAllDocs(): DocPage[] {
  return readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => loadDoc(file.replace(/\.mdx$/, '')))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getDoc(slug: string): DocPage | null {
  try {
    return loadDoc(slug);
  } catch {
    return null;
  }
}

export function getDocGroups(docs = getAllDocs()) {
  const groups = new Map<string, DocMeta[]>();
  for (const doc of docs) {
    const items = groups.get(doc.group) ?? [];
    items.push(toMeta(doc));
    groups.set(doc.group, items);
  }
  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

function loadDoc(slug: string): DocPage {
  const raw = readFileSync(join(DOCS_DIR, `${slug}.mdx`), 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const blocks = parseBlocks(body);
  return {
    slug,
    title: meta.title ?? humanise(slug),
    description: meta.description ?? '',
    group: meta.group ?? 'Guide',
    order: Number(meta.order ?? 999),
    body,
    blocks,
    searchText: [meta.title, meta.description, meta.group, body].filter(Boolean).join(' '),
  };
}

function parseFrontmatter(raw: string) {
  if (!raw.startsWith('---')) return { meta: {} as Record<string, string>, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {} as Record<string, string>, body: raw };

  const frontmatter = raw.slice(3, end).trim();
  const meta: Record<string, string> = {};
  for (const line of frontmatter.split('\n')) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return { meta, body: raw.slice(end + 4).trim() };
}

function parseBlocks(body: string): DocBlock[] {
  const blocks: DocBlock[] = [];
  const lines = body.split('\n');
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) return;
    blocks.push({ type: 'ul', items: list });
    list = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith('- ')) {
      flushParagraph();
      list.push(trimmed.slice(2).trim());
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function toMeta(doc: DocPage): DocMeta {
  return {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    group: doc.group,
    order: doc.order,
  };
}

function humanise(slug: string) {
  return slug
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
