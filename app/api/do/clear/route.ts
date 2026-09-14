import { NextResponse } from 'next/server';
import {
  applyClearSuggestions,
  CLEAR_HONESTY,
  scanClearWriting,
} from '@/apps/do/shared/clear-writing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Scan text for grammar + AI-slop issues (local heuristics). */
export async function POST(req: Request) {
  let body: { text?: string; rewrite?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const text = String(body.text || '');
  if (!text.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const issues = scanClearWriting(text);
  if (body.rewrite) {
    const result = applyClearSuggestions(text, issues);
    return NextResponse.json({
      issues,
      rewritten: result.rewritten,
      applied: result.applied,
      honesty: result.honesty || CLEAR_HONESTY,
    });
  }

  return NextResponse.json({
    honesty: CLEAR_HONESTY,
    issues,
    count: issues.length,
    slop: issues.filter((i) => i.kind === 'slop').length,
    grammar: issues.filter((i) => i.kind === 'grammar').length,
  });
}
