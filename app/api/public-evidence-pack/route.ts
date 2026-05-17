import { NextRequest } from 'next/server';
import { hashPack, type EvidencePack } from '@/lib/evidence/pack-spec';
import { getKete, type KeteSlug } from '@/lib/kete';
import { isKeteSlug } from '@/lib/public-chat/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TranscriptTurn = {
  role?: unknown;
  content?: unknown;
  timestamp?: unknown;
};

type PublicEvidencePackRequest = {
  slug?: unknown;
  kete?: unknown;
  sessionId?: unknown;
  transcript?: unknown;
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function cleanString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') || 'public-chat';
}

function pdfSafeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

function normaliseTimestamp(value: unknown) {
  const text = cleanString(value);
  const date = text ? new Date(text) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normaliseTranscript(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((turn: TranscriptTurn) => {
      const role = turn.role === 'assistant' ? 'assistant' : 'user';
      const content = cleanString(turn.content);
      return content
        ? {
            role,
            content: pdfSafeText(content).slice(0, 4000),
            timestamp: normaliseTimestamp(turn.timestamp),
          }
        : null;
    })
    .filter(Boolean) as Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
}

function formatNzDate(iso: string) {
  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(iso));
}

function speakerLabel(role: 'user' | 'assistant') {
  return role === 'user' ? 'Visitor' : 'assembl specialist';
}

function truncateForTable(value: string) {
  return value.length > 1200 ? `${value.slice(0, 1197)}...` : value;
}

function wrapPdfText(value: string, maxLength = 92) {
  const words = pdfSafeText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function escapePdfText(value: string) {
  return pdfSafeText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function drawPdfLine(text: string, x: number, y: number, size = 10, font = 'F1') {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET\n`;
}

function renderFallbackPdf(pack: EvidencePack) {
  const pageLines: string[][] = [[]];
  const push = (line = '') => {
    const current = pageLines[pageLines.length - 1];
    if (current.length >= 42) pageLines.push([]);
    pageLines[pageLines.length - 1].push(line);
  };

  push('assembl evidence pack');
  push('DEMO - NOT SEALED');
  push(`Status: ${pack.status.toUpperCase()} / Mana seal: DRAFT`);
  push(`Kete: ${pack.subject.label}`);
  push(`Session: ${pack.subject.ref}`);
  push(`Generated: ${formatNzDate(pack.issuedAt)}`);
  push('');
  for (const section of pack.sections) {
    push(`${section.title.en.toUpperCase()} / ${section.title.mi.toUpperCase()}`);
    for (const block of section.body) {
      if (block.kind === 'paragraph' || block.kind === 'callout' || block.kind === 'pullQuote') {
        const text = block.kind === 'pullQuote' ? block.text : block.text;
        for (const line of wrapPdfText(text)) push(line);
      } else if (block.kind === 'list') {
        for (const item of block.items) {
          for (const [index, line] of wrapPdfText(item, 88).entries()) {
            push(index === 0 ? `- ${line}` : `  ${line}`);
          }
        }
      } else if (block.kind === 'table') {
        push(block.columns.join(' | '));
        for (const row of block.rows) {
          const rowText = row.join(' | ');
          for (const line of wrapPdfText(rowText, 88)) push(line);
        }
      }
      push('');
    }
  }
  push('Hash');
  push(pack.hashChain.thisHash || '-');

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesId = addObject('PAGES_PLACEHOLDER');
  const helveticaId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const helveticaBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const courierId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  const pageIds: number[] = [];

  for (const [pageIndex, lines] of pageLines.entries()) {
    let y = 790;
    let content = '';
    content += '0.980 0.969 0.949 rg 0 0 595 842 re f\n';
    content += '0.169 0.420 0.341 rg 54 746 3 58 re f\n';
    content += drawPdfLine('DEMO - NOT SEALED', 374, 790, 18, 'F2');
    content += drawPdfLine(`DRAFT / page ${pageIndex + 1}`, 54, 34, 8, 'F3');
    for (const [lineIndex, line] of lines.entries()) {
      const font = pageIndex === 0 && lineIndex < 2 ? 'F2' : line.endsWith(':') ? 'F2' : 'F1';
      const size = pageIndex === 0 && lineIndex === 0 ? 22 : pageIndex === 0 && lineIndex === 1 ? 14 : 9.5;
      content += drawPdfLine(line, 70, y, size, font);
      y -= lineIndex < 2 ? 24 : 15;
    }
    const contentId = addObject(`<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}endstream`);
    const pageId = addObject(
      [
        '<< /Type /Page',
        `/Parent ${pagesId} 0 R`,
        '/MediaBox [0 0 595 842]',
        `/Resources << /Font << /F1 ${helveticaId} 0 R /F2 ${helveticaBoldId} 0 R /F3 ${courierId} 0 R >> >>`,
        `/Contents ${contentId} 0 R`,
        '>>',
      ].join(' '),
    );
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = '<< /Type /Catalog /Pages 2 0 R >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, body] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

async function buildPack({
  slug,
  kete,
  sessionId,
  transcript,
}: {
  slug: string;
  kete: KeteSlug;
  sessionId: string;
  transcript: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
}): Promise<EvidencePack> {
  const keteDef = getKete(kete);
  const keteName = pdfSafeText(keteDef.name);
  const keteIndustry = pdfSafeText(keteDef.industry);
  const issuedAt = new Date().toISOString();
  const sessionShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'demo';
  const pack: EvidencePack = {
    id: `demo-public-chat-${safeSlug(slug)}-${sessionShort}`,
    tenantId: `public-chat:${slug}`,
    kete,
    kind: 'workflow',
    title: {
      en: 'DEMO - NOT SEALED public chat evidence pack',
      mi: 'Kopaki taunaki tauira - kaore ano kia hiritia',
    },
    subject: {
      kind: 'public_chat_demo',
      ref: sessionShort,
      label: `${keteName} public chat transcript - DEMO - NOT SEALED`,
    },
    issuedAt,
    status: 'draft',
    reviewer: null,
    agentLoadout: [
      {
        agent: `public-chat-${kete}`,
        sectionIds: ['demo-notice', 'transcript', 'next-steps'],
      },
    ],
    sections: [
      {
        id: 'demo-notice',
        title: { en: 'Demo notice', mi: 'Panui tauira' },
        draftedBy: 'public-chat evidence pack builder',
        body: [
          {
            kind: 'callout',
            tone: 'draft',
            text:
              'DEMO - NOT SEALED. This PDF is a downloadable public-chat transcript for demonstration only. It has not been reviewed by a named human, sealed by Mana, or published to a permanent verifier URL.',
          },
          {
            kind: 'paragraph',
            text: `Kete: ${keteName} (${keteIndustry}). Session: ${sessionShort}. Generated: ${formatNzDate(issuedAt)}.`,
          },
        ],
      },
      {
        id: 'transcript',
        title: { en: 'Transcript', mi: 'Tuhinga korero' },
        draftedBy: 'public-chat evidence pack builder',
        body: [
          {
            kind: 'table',
            columns: ['Time', 'Speaker', 'Message'],
            rows: transcript.map((turn) => [
              formatNzDate(turn.timestamp),
              speakerLabel(turn.role),
              truncateForTable(turn.content),
            ]),
            caption: `Public chat session ${sessionShort}`,
          },
        ],
      },
      {
        id: 'next-steps',
        title: { en: 'Next steps', mi: 'Nga mahi whai ake' },
        draftedBy: 'public-chat evidence pack builder',
        body: [
          {
            kind: 'list',
            items: [
              'Book a Pilot Sprint to turn this public chat into a reviewed workflow with named human oversight.',
              'Add the relevant documents, decisions, legislation, and citations before relying on any operational output.',
              'Seal the final pack through Mana only after review, traceability checks, and approval by the responsible person.',
            ],
          },
          {
            kind: 'callout',
            tone: 'pounamu',
            text: 'Draft status: this demo pack is fileable as a transcript, not as verified advice or a sealed assembl evidence pack.',
          },
        ],
      },
    ],
    citations: [],
    hashChain: {
      prevHash: '',
      thisHash: '',
      sealedAt: null,
      verifierUrl: '',
    },
  };

  pack.hashChain.thisHash = await hashPack(pack);
  return pack;
}

function getSupabaseFunctionConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const keyCandidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ].filter(Boolean) as string[];
  const supabaseKey = keyCandidates.find((key) => key.split('.').length === 3) ?? keyCandidates[0];

  if (!supabaseUrl || !supabaseKey) return null;
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), supabaseKey };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as PublicEvidencePackRequest;
  const slug = safeSlug(cleanString(body.slug, 'public-chat'));
  const kete = body.kete;
  const sessionId = cleanString(body.sessionId, crypto.randomUUID());
  const transcript = normaliseTranscript(body.transcript);

  if (!isKeteSlug(kete)) {
    return json({ error: 'A valid kete is required.' }, 400);
  }
  if (transcript.length < 2) {
    return json({ error: 'At least two transcript turns are required.' }, 400);
  }

  const config = getSupabaseFunctionConfig();
  if (!config) {
    return json({ error: 'Evidence pack rendering is not configured on this deployment.' }, 500);
  }

  try {
    const pack = await buildPack({ slug, kete, sessionId, transcript });
    const edgeResponse = await fetch(`${config.supabaseUrl}/functions/v1/generate-evidence-pack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseKey,
        Authorization: `Bearer ${config.supabaseKey}`,
      },
      body: JSON.stringify({ pack }),
    });

    const bytes = await edgeResponse.arrayBuffer();
    const contentType = edgeResponse.headers.get('content-type') ?? '';
    if (!edgeResponse.ok || !contentType.includes('application/pdf')) {
      const text = new TextDecoder().decode(bytes);
      console.warn('public evidence pack renderer fallback used', {
        status: edgeResponse.status,
        error: safeJson(text)?.error ?? text,
      });
      const fallback = renderFallbackPdf(pack);
      const sessionShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'demo';
      return new Response(fallback, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="assembl-demo-evidence-pack-${slug}-${sessionShort}.pdf"`,
          'Cache-Control': 'no-store',
          'X-Assembl-Pdf-Renderer': 'fallback',
        },
      });
    }

    const sessionShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'demo';
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="assembl-demo-evidence-pack-${slug}-${sessionShort}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown evidence pack error.';
    return json({ error: message }, 500);
  }
}

function safeJson(text: string): { error?: string } | null {
  try {
    const parsed = JSON.parse(text) as { error?: string };
    return parsed;
  } catch {
    return null;
  }
}
