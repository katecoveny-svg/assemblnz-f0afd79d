/**
 * Compile NL brief + optional page context → AgentSpec.
 * v0 is deterministic (no model required) so DEMO works offline / without keys.
 * Policy is always enforced server-side after compile.
 */

import { randomUUID } from 'node:crypto';
import { enforceApprovalPolicy, POLICY_HONESTY } from './policy';
import { getTemplate, DEMO_TEMPLATES, isPublicTemplate } from './templates';
import { planTools } from './router';
import type {
  AgentPrimitive,
  AgentSpec,
  CompileRequest,
  CompileResponse,
  PageContext,
} from './types';

const PAGE_TEXT_MAX = 4_000;

const CREATIVE_HINT =
  /\b(creative|art direction|web design|design director|visual director|direct(or)? web|ensemble|brand refs?|craft critique)\b/i;

function truncatePage(page?: PageContext): PageContext | undefined {
  if (!page) return undefined;
  return {
    url: page.url?.slice(0, 2_000) ?? '',
    title: page.title?.slice(0, 500) ?? '',
    selectedText: page.selectedText?.slice(0, 2_000),
    pageText: page.pageText?.slice(0, PAGE_TEXT_MAX),
  };
}

function inferPrimitive(brief: string): AgentPrimitive {
  const b = brief.toLowerCase();
  if (CREATIVE_HINT.test(b)) return 'prepare';
  if (/\bcompar(e|ison)\b|\bvs\b|\bdiffer/.test(b)) return 'compare';
  if (/\bextract\b|\bpull (out|the)\b|\bcalendar\b|\bdates?\b|\bstakeholder/.test(b)) {
    return 'extract';
  }
  if (/\bfind\b|\bopportunit|\btender|\bgets\b|\bsearch\b|\btradie\b/.test(b)) return 'find';
  if (/\bprepar|\bbrief\b|\btomorrow\b|\bkids?\b|\bmeeting\b|\btutor\b|\bexplain\b|\bcreat(e|ive)\b/.test(b)) {
    return 'prepare';
  }
  if (/\bwatch\b|\bchang(e|es|ing)\b|\btell me if\b|\balert\b|\bmonitor\b/.test(b)) {
    return 'watch';
  }
  return 'watch';
}

function matchTemplate(brief: string, templateId?: string) {
  if (templateId) {
    const t = getTemplate(templateId);
    if (t) return t;
  }
  const b = brief.toLowerCase();

  // Creative / Ensemble intents win before generic watch/price heuristics.
  if (CREATIVE_HINT.test(b) || /\bdirect(or)?\b.*\b(web|design|site)\b|\bweb design\b/.test(b)) {
    return getTemplate('creative-web-director');
  }

  const publicPool = DEMO_TEMPLATES.filter(isPublicTemplate);
  for (const t of publicPool) {
    if (b.includes(t.id.replace(/-/g, ' '))) return t;
    const key = t.brief.toLowerCase().slice(0, 24);
    if (key && b.includes(key.slice(0, 16))) return t;
  }

  // Mitre pack only when the brief explicitly asks — never from generic NL.
  if (/\bmitre\b|\bsap\b.*\brfp\b/.test(b)) {
    return getTemplate('mitre10-sap-rfp-brief');
  }

  if (/\bschool\b|\bnotice\b|\bcalendar\b/.test(b)) return getTemplate('school-notice-tomorrow');
  if (/\bgets\b|\btender\b|\bopportunit/.test(b)) return getTemplate('gets-opportunity');
  if (/\bquote\b|\bcompar/.test(b)) return getTemplate('quote-compare');
  if (/\bkids?\b|\btomorrow\b/.test(b)) return getTemplate('kids-tomorrow');
  if (/\bpower\b.*\bprice|\bprice\b.*\bpower/.test(b)) return getTemplate('power-price-watch');
  if (/\btell me if this changes\b|\bwatch (this|the) (page|url|site)\b/.test(b)) {
    return getTemplate('price-watcher');
  }
  if (/\bchang(e|es)\b.*\b(page|price|stock)\b|\bwatch\b.*\bprice\b/.test(b)) {
    return getTemplate('price-watcher');
  }
  return undefined;
}

function nameFromBrief(brief: string, page?: PageContext): string {
  const selected = page?.selectedText?.trim();
  if (selected && selected.length < 60) return selected;
  const title = page?.title?.trim();
  if (/\btell me if this changes\b/i.test(brief) && title) {
    return `Watch · ${title.slice(0, 48)}`;
  }
  if (CREATIVE_HINT.test(brief)) return 'Creative web director';
  const cleaned = brief.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 48) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return cleaned.slice(0, 45).trimEnd() + '…';
}

function defaultForPrimitive(
  primitive: AgentPrimitive,
  page?: PageContext,
  brief = '',
): Pick<
  AgentSpec,
  'watches' | 'looks_for' | 'can_do_without_asking' | 'must_ask_before' | 'never'
> {
  const url = page?.url || 'current page';
  if (CREATIVE_HINT.test(brief)) {
    return {
      watches: [url, 'brand refs', 'brief'],
      looks_for: [
        'brand cues on the page',
        'brief constraints',
        'composition opportunities',
      ],
      can_do_without_asking: [
        'draft three materially different art directions',
        'propose visual targets',
        'run craft critique',
      ],
      must_ask_before: ['publish', 'export', 'send'],
      never: ['publish or ship without a human yes'],
    };
  }
  switch (primitive) {
    case 'watch':
      return {
        watches: [url],
        looks_for: ['material changes to price, availability, or key copy'],
        can_do_without_asking: [
          'snapshot visible page text',
          'compare to the previous snapshot',
          'surface a change under Needs you',
        ],
        must_ask_before: ['send a notification off this device'],
        never: ['buy, book, or submit anything on the page'],
      };
    case 'extract':
      return {
        watches: [url, 'pasted text'],
        looks_for: ['dates', 'times', 'named events', 'deadlines'],
        can_do_without_asking: ['extract candidates', 'draft calendar suggestions'],
        must_ask_before: ['add to a real calendar', 'send the extract to anyone'],
        never: ['post or submit forms'],
      };
    case 'find':
      return {
        watches: ['DEMO opportunity fixtures'],
        looks_for: ['keyword fit', 'closing date', 'agency'],
        can_do_without_asking: ['search fixtures', 'prepare a draft brief'],
        must_ask_before: ['submit a response', 'register interest'],
        never: ['scrape locked sites', 'lodge anything'],
      };
    case 'compare':
      return {
        watches: ['pasted quotes', 'DEMO quote fixtures'],
        looks_for: ['price', 'inclusions', 'exclusions', 'validity'],
        can_do_without_asking: ['draft a comparison table', 'flag gaps'],
        must_ask_before: ['accept a quote', 'pay', 'sign'],
        never: ['send acceptance without a human yes'],
      };
    case 'prepare':
      return {
        watches: ['DEMO fixtures', url],
        looks_for: ['requirements', 'deadlines', 'open questions'],
        can_do_without_asking: ['draft a brief from fixtures'],
        must_ask_before: ['send the brief', 'submit'],
        never: ['message other people without a human yes'],
      };
  }
}

export function compileAgent(input: CompileRequest): CompileResponse {
  const brief = (input.brief || '').trim();
  if (!brief && !input.templateId) {
    throw new Error('brief is required');
  }

  const page = truncatePage(input.page);
  const template = matchTemplate(brief || input.templateId || '', input.templateId);
  const primitive = template?.primitive ?? inferPrimitive(brief);
  const base = template
    ? {
        watches: [...template.watches],
        looks_for: [...template.looks_for],
        can_do_without_asking: [...template.can_do_without_asking],
        must_ask_before: [...template.must_ask_before],
        never: [...template.never],
      }
    : defaultForPrimitive(primitive, page, brief);

  if (page?.url && primitive === 'watch' && !base.watches.includes(page.url)) {
    base.watches = [page.url, ...base.watches.filter((w) => w !== 'current page URL')];
  }
  if (page?.selectedText) {
    base.looks_for = [
      `selected text: “${page.selectedText.slice(0, 80)}${page.selectedText.length > 80 ? '…' : ''}”`,
      ...base.looks_for,
    ];
  }

  const enforced = enforceApprovalPolicy(base);
  const now = new Date().toISOString();
  const planBrief = brief || template?.brief || '';
  const toolPlan = planTools(primitive, { brief: planBrief });

  // Creative templates always stay on ensemble lane even if brief is short.
  if (template?.lane === 'creative-ensemble' && toolPlan.lane !== 'ensemble') {
    toolPlan.lane = 'ensemble';
    toolPlan.reason =
      'Creative / Ensemble lane — art directions, visual targets, craft critique (Assembl Studio language).';
    toolPlan.tools = [
      'ensemble.directions',
      'ensemble.visual_targets',
      'ensemble.critic',
      'evidence.capture',
      'permissions.gate',
    ];
  }

  const name =
    template?.id === 'creative-web-director'
      ? 'Creative web director'
      : (template?.name ?? nameFromBrief(brief || template?.brief || 'Untitled agent', page));

  const spec: AgentSpec = {
    id: randomUUID(),
    name,
    ...enforced,
    primitive,
    brief: brief || template?.brief || '',
    page,
    status: 'needs_you',
    demo: true,
    createdAt: now,
    updatedAt: now,
    pendingApprovals: [],
    lastNote: 'Compiled · not active yet. Review the card, then activate.',
    lane: toolPlan.lane,
    toolPlan,
    watchSnapshots: [],
    templateId: template?.id,
    connector: input.connector ?? 'hook-later',
  };

  const honesty =
    toolPlan.lane === 'astra'
      ? `${POLICY_HONESTY} · Astra-class lane (stub in v0).`
      : toolPlan.lane === 'ensemble'
        ? `${POLICY_HONESTY} · Creative / Ensemble lane (Assembl Studio language).`
        : POLICY_HONESTY;

  return { spec, honesty };
}
