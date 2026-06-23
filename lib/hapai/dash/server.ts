import 'server-only';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { gate, gateBlockedResponse } from '@/lib/gating/server';
import { getDashTool, type DashToolConfig } from '@/lib/hapai/dash/tools';

/**
 * Shared server handler for the five Dash-branded HAPAI tools. Each route file
 * is a one-liner that calls handleDashTool(slug, req). The locked system prompt
 * + deterministic fallback live here (server-only), never in the bundle.
 *
 * Output contract for every tool: HTML using only <h2> <h3> <p> <ul> <li>
 * <strong>. Numbers tools lead with an <h2> headline figure — that figure is
 * the share asset.
 */

const COMMON_RULES = `
RULES:
- Use New Zealand English and a calm, plain, useful tone. No American corporate filler.
- Write "assembl" in lowercase if it appears.
- Only use what the person supplied. Never invent figures, dates, names, or obligations.
- If you genuinely cannot tell, say so plainly rather than guessing.
- Do not claim anything was sent, filed, lodged, booked, or paid.
- Every output is a draft for a human to check.
OUTPUT FORMAT — return HTML using ONLY these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>. No other tags, no markdown fences, no attributes.`;

type ToolBrain = {
  systemPrompt: string;
  /** Deterministic HTML when the model is unavailable. */
  fallback: (values: Record<string, string>, imageAttached: boolean) => string;
};

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ul = (items: string[]) =>
  items.length === 0 ? '<p>Nothing recorded.</p>' : `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

const lines = (value: string) =>
  value
    .split(/[\n\r,;]+/)
    .map((l) => l.replace(/^[-•*\d.\s]+/, '').trim())
    .filter((l) => l.length > 1)
    .slice(0, 16);

const BRAINS: Record<string, ToolBrain> = {
  'rates-reader': {
    systemPrompt: `You are the assembl Rates Reader for a New Zealand homeowner. Decode a council rates notice into a plain-English breakdown.

Read whatever the person supplies — pasted line items, a total, a council name, or a photo of the notice.

Sections in this exact order:
<h2>{the annual total, e.g. "$4,800 a year"}</h2> — the headline figure, big and clear. If no total is known, write a short headline like "Your rates, decoded".
<h3>Where it goes</h3> — a bullet list splitting the rates into categories (roads & transport, water & wastewater, parks & recreation, libraries & community, waste, environment, council administration). Use the supplied figures where given; otherwise give typical NZ proportions and SAY they are typical.
<h3>The jargon, decoded</h3> — short bullets explaining any terms present (UAGC / Uniform Annual General Charge, targeted rates, capital value, general rate).
<h3>How your area compares</h3> — one short paragraph putting the bill in context for that council or NZ generally. Be honest that this is indicative.
<h3>What you can do</h3> — 2–3 bullets (rates rebate eligibility, instalment options, where to read the long-term plan).
${COMMON_RULES}`,
    fallback: (v, img) => {
      const total = (v.total || '').trim();
      const council = (v.council || '').trim();
      const head = total ? `${total} a year` : 'Your rates, decoded';
      const split = [
        'Roads & transport — typically around 20–25%',
        'Water & wastewater — typically around 18–22% (sometimes billed separately)',
        'Parks, pools & recreation — typically around 10–14%',
        'Libraries & community services — typically around 4–7%',
        'Rubbish & recycling — typically around 4–6%',
        'Environment & stormwater — typically around 6–10%',
        'Council administration & democracy — typically around 8–12%',
      ];
      return [
        `<h2>${esc(head)}</h2>`,
        `<p>Here is a plain-English read on your rates${council ? ` from ${esc(council)}` : ''}. The exact split is set in your council’s rates resolution — these are typical New Zealand proportions until you confirm the line items.</p>`,
        `<h3>Where it goes</h3>${ul(split)}`,
        `<h3>The jargon, decoded</h3>${ul([
          'UAGC (Uniform Annual General Charge) — a flat charge every property pays, regardless of value.',
          'Targeted rates — charges for a specific service (water, waste, a local project) rather than general spending.',
          'Capital value — the council’s estimate of your property’s worth; the general rate is usually a percentage of it.',
        ])}`,
        `<h3>How your area compares</h3><p>${total ? `At ${esc(total)}, you can compare against your council’s “average residential rates” figure, usually published with the annual budget.` : 'Add your annual total to compare against your council’s average residential bill.'}${img ? ' The uploaded notice can be read for the exact line items.' : ''}</p>`,
        `<h3>What you can do</h3>${ul([
          'Check if you qualify for the government Rates Rebate (income-tested, up to several hundred dollars).',
          'Ask your council about weekly, fortnightly, or direct-debit instalments.',
          'Read the council’s Long-Term Plan to see where the money is actually being spent.',
        ])}`,
      ].join('');
    },
  },
  'school-notice': {
    systemPrompt: `You are the assembl School Notice Translator for a busy New Zealand parent. Turn a school newsletter or notice into the few things that actually matter.

Read whatever is supplied — pasted newsletter text, a Hero/Seesaw/Skool post, or a photo.

Sections in this exact order:
<h2>3 things this week</h2> — exactly three bullets, the most important items, each with the date.
<h3>Dates to diary</h3> — bullets: each event with its day/date. If none are clear, say so.
<h3>What to send or bring</h3> — bullets: money, permission slips, mufti themes, gear, food. Include amounts where stated.
<h3>Drafted reply</h3> — one short, friendly RSVP/acknowledgement the parent can send, in a <p>. Only include what the notice actually asks for.
${COMMON_RULES}`,
    fallback: (v, img) => {
      const items = lines(v.notice || '');
      const dates = items.filter((i) => /\b(mon|tue|wed|thu|fri|sat|sun|day|week|term|\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\/)\b/i.test(i));
      const bring = items.filter((i) => /\b(coin|\$|bring|wear|mufti|togs|costume|slip|permission|book|due|return|donation|gold)\b/i.test(i));
      const top = [...dates, ...bring, ...items].slice(0, 3);
      while (top.length < 3) top.push('Re-read the notice for anything time-bound before the week starts.');
      const child = (v.child || '').trim();
      return [
        `<h2>3 things this week</h2>${ul(top)}`,
        `<h3>Dates to diary</h3>${dates.length ? ul(dates) : '<p>No clear dates in what was supplied — check the original notice.</p>'}`,
        `<h3>What to send or bring</h3>${bring.length ? ul(bring) : '<p>Nothing obvious to send from what was supplied.</p>'}`,
        `<h3>Drafted reply</h3><p>Kia ora, thanks for the notice${child ? ` about ${esc(child)}` : ''} — got it, we’ll be sorted for the dates above. Please let me know if anything else is needed. Ngā mihi.</p>`,
        img ? '<p><strong>Note:</strong> a photo was attached; the connected version reads it directly.</p>' : '',
      ].join('');
    },
  },
  'healthy-homes': {
    systemPrompt: `You are the assembl Healthy Homes Checker for a New Zealand tenant or landlord. Check a rental against the five Healthy Homes Standards (heating, insulation, ventilation, moisture & drainage, draught-stopping) under the Residential Tenancies (Healthy Homes Standards) Regulations 2019.

You are given yes/no/unsure answers for each standard plus free-text notes and maybe a photo.

Sections in this exact order:
<h2>{a short verdict headline, e.g. "Meets 2 of 5 standards"}</h2>
<h3>Standard by standard</h3> — one bullet per standard, each starting with the standard name in <strong>, then PASS / FAILS / CHECK and a short reason. The five: Heating, Insulation, Ventilation, Moisture & drainage, Draught-stopping.
<h3>What to ask your landlord for</h3> — bullets of specific, polite requests for anything that fails or is unclear.
<h3>A letter you can send</h3> — one short, polite paragraph in a <p> the tenant could send their landlord (or a landlord could use as a self-audit note).
${COMMON_RULES}`,
    fallback: (v, img) => {
      const map: { key: string; name: string }[] = [
        { key: 'heating', name: 'Heating' },
        { key: 'insulation', name: 'Insulation' },
        { key: 'ventilation', name: 'Ventilation' },
        { key: 'moisture', name: 'Moisture & drainage' },
        { key: 'draughts', name: 'Draught-stopping' },
      ];
      const verdict = (val: string) => (val === 'yes' ? 'PASS' : val === 'no' ? 'FAILS' : 'CHECK');
      const reason: Record<string, Record<string, string>> = {
        heating: { yes: 'a fixed heater serves the main living room.', no: 'no compliant fixed heater in the main living room.', unsure: 'confirm a fixed heater of the right size serves the living room.' },
        insulation: { yes: 'ceiling and underfloor insulation appears present.', no: 'insulation is missing or below the required minimum.', unsure: 'ask for the insulation statement to confirm.' },
        ventilation: { yes: 'extractor fans vent the kitchen and bathroom.', no: 'kitchen/bathroom extractor fans are missing.', unsure: 'confirm the fans vent outside, not into the roof space.' },
        moisture: { yes: 'no obvious damp and a ground moisture barrier where needed.', no: 'damp, mould, or a missing moisture barrier reported.', unsure: 'check under-floor for a moisture barrier and any damp.' },
        draughts: { yes: 'gaps and draughts appear blocked.', no: 'unblocked gaps or draughts reported.', unsure: 'check around windows, doors, and unused fireplaces.' },
      };
      const passes = map.filter((m) => v[m.key] === 'yes').length;
      const rows = map.map((m) => `<strong>${m.name}:</strong> ${verdict(v[m.key] ?? 'unsure')} — ${reason[m.key][v[m.key] ?? 'unsure']}`);
      const asks = map
        .filter((m) => v[m.key] !== 'yes')
        .map((m) => `Ask about ${m.name.toLowerCase()}: ${reason[m.key][v[m.key] === 'no' ? 'no' : 'unsure']}`);
      const notes = (v.notes || '').trim();
      return [
        `<h2>Meets ${passes} of 5 standards${passes < 5 ? ' — some to chase' : ''}</h2>`,
        `<p>Based on your answers${notes ? ` and your notes (${esc(notes.slice(0, 160))})` : ''}${img ? ' and the photo supplied' : ''}. This is a plain-English guide, not a compliance certificate.</p>`,
        `<h3>Standard by standard</h3><ul>${rows.map((r) => `<li>${r}</li>`).join('')}</ul>`,
        `<h3>What to ask your landlord for</h3>${asks.length ? ul(asks) : '<p>Looks like all five are covered — keep the records in case you need them.</p>'}`,
        `<h3>A letter you can send</h3><p>Kia ora, I’m doing a quick Healthy Homes check on the property. Could you confirm the status of ${esc(map.filter((m) => v[m.key] !== 'yes').map((m) => m.name.toLowerCase()).join(', ') || 'the five standards')}? Happy to talk it through. Ngā mihi.</p>`,
      ].join('');
    },
  },
  'fare-optimiser': {
    systemPrompt: `You are the assembl Fare Optimiser for a New Zealand public-transport commuter. Work out the cheapest legitimate way to pay for their usual trips.

Regions and their systems: Auckland (AT HOP — has a weekly fare cap and monthly passes), Wellington (Metlink Snapper — has weekly capping and off-peak discounts), Otago/Queenstown (Bee Card — flat low fares, weekly fare cap), Canterbury (Metrocard — low stored-value fares). Adult, child, tertiary, and Community Services Card concessions exist on most.

Sections in this exact order:
<h2>{the recommended monthly cost as the headline figure, e.g. "About $96 a month"}</h2>
<h3>Cheapest way to pay</h3> — one short paragraph naming the card/product and why (weekly cap vs pay-as-you-go vs pass).
<h3>What you’d save</h3> — bullets comparing options with rough dollar figures, ending with the likely monthly saving. Be clear the numbers are indicative.
<h3>Don’t miss</h3> — bullets of concessions or deals that apply (tertiary, child, off-peak, free transfers, Community Services Card).
${COMMON_RULES}
Extra rule: fares change often — say the figures are indicative and to confirm on the operator’s site.`,
    fallback: (v) => {
      const region = v.region || 'other';
      const labels: Record<string, string> = {
        auckland: 'Auckland (AT HOP)',
        wellington: 'Wellington (Metlink)',
        otago: 'Otago / Queenstown (Bee Card)',
        canterbury: 'Canterbury (Metrocard)',
        other: 'your region',
      };
      const product: Record<string, string> = {
        auckland: 'an AT HOP card and let the weekly fare cap kick in',
        wellington: 'a Metlink Snapper card with weekly capping and off-peak travel where you can',
        otago: 'a Bee Card — fares are flat and low, with a weekly cap',
        canterbury: 'a Metrocard — stored-value fares are well below cash fares',
        other: 'the local smartcard rather than paying cash',
      };
      const freq = parseInt((v.frequency || '5').replace(/[^\d]/g, ''), 10) || 5;
      const perTrip = region === 'auckland' ? 4 : region === 'wellington' ? 3 : 2.5;
      const payg = Math.round(freq * 2 * perTrip * 4.3);
      const capped = Math.round(payg * 0.8);
      return [
        `<h2>About $${capped} a month</h2>`,
        `<p>For ${esc(`${freq} return trips a week`)} in ${esc(labels[region])}${v.from && v.to ? ` between ${esc(v.from)} and ${esc(v.to)}` : ''}, the cheapest route is usually to get ${product[region]}. These figures are indicative — confirm current fares on the operator’s site.</p>`,
        `<h3>What you’d save</h3>${ul([
          `Pay-as-you-go cash/card: roughly $${payg} a month.`,
          `With the smartcard + weekly cap: roughly $${capped} a month.`,
          `Likely saving: about $${Math.max(0, payg - capped)} a month.`,
        ])}`,
        `<h3>Don’t miss</h3>${ul([
          'Tertiary and child concessions cut fares substantially — register your card.',
          'A Community Services Card unlocks half-price fares on most NZ networks.',
          'Free or discounted transfers within a set window — tag on and off every leg.',
          'Off-peak discounts where your region offers them.',
        ])}`,
      ].join('');
    },
  },
  'holidays-act': {
    systemPrompt: `You are the assembl Holidays Act Sense-Check for a New Zealand worker. Give a plain-English read on whether their holiday pay looks about right under the Holidays Act 2003. You are NOT calculating exact arrears and NOT giving legal advice.

Key principles to apply:
- Annual holidays are paid at the GREATER of the employee’s ordinary weekly pay and their average weekly earnings over the last 52 weeks (s21). Regular overtime, commission, and allowances must be included — this is the most common error.
- Public holidays worked are paid at time-and-a-half plus an alternative day if it’s an otherwise working day (s49–s50, s56–s57).
- Sick, bereavement, and alternative leave are paid at relevant daily pay or average daily pay (s9, s71).

Sections in this exact order:
<h2>{an honest verdict headline: "Looks about right", "Might be short", or "Can’t tell from this"}</h2>
<h3>What the maths should be</h3> — a short paragraph naming the right method for the leave type they chose, and the section of the Act.
<h3>Why it might be off</h3> — bullets pointing at likely issues (overtime/allowances excluded, ordinary vs average not compared, daily pay method). Tie to what they told you.
<h3>What to do next</h3> — bullets: ask payroll how the rate was calculated, mention the relevant section, and where to get help (union, Employment NZ, Labour Inspectorate).
${COMMON_RULES}
Extra rule: never state a dollar figure of what they are "owed". Frame everything as "looks like it may be low/right" and recommend confirmation.`,
    fallback: (v) => {
      const leaveType = v.leaveType || 'annual';
      const taken = (v.leaveTaken || '').trim();
      const mentionsExtra = /\b(overtime|allowance|commission|shift|bonus|penal)\b/i.test(taken);
      const method: Record<string, string> = {
        annual: 'Annual holidays must be paid at the greater of your ordinary weekly pay and your average weekly earnings over the last 52 weeks (Holidays Act 2003, s21). Regular overtime, commission, and allowances count.',
        public: 'A public holiday you work is paid at time-and-a-half, plus an alternative day if it falls on a day you’d otherwise work (s49–s50, s56–s57).',
        bapsl: 'Sick, bereavement, and alternative leave are paid at relevant daily pay, or average daily pay where your hours vary (s9, s71).',
      };
      const verdict = mentionsExtra && leaveType === 'annual' ? 'Might be short' : 'Can’t tell from this';
      return [
        `<h2>${verdict}</h2>`,
        `<p>This is a plain-English sense-check, not a calculation of what you’re owed and not legal advice.</p>`,
        `<h3>What the maths should be</h3><p>${method[leaveType]}</p>`,
        `<h3>Why it might be off</h3>${ul([
          mentionsExtra
            ? 'You mentioned regular overtime or an allowance — if your leave was paid only on base pay, the "greater of" test may not have been applied.'
            : 'If your pay varies week to week, the average-weekly-earnings comparison is easy to get wrong.',
          'Holiday pay calculated on contracted hours only, ignoring regular extra earnings, is the most common Holidays Act error.',
          'Daily pay for sick/bereavement leave is sometimes set too low when hours vary.',
        ])}`,
        `<h3>What to do next</h3>${ul([
          'Ask payroll, in writing, exactly how your leave rate was calculated.',
          `Mention the relevant section (${leaveType === 'annual' ? 's21' : leaveType === 'public' ? 's50' : 's9'}) so the question is specific.`,
          'If it still looks off, contact your union, Employment New Zealand (0800 20 90 20), or the Labour Inspectorate.',
        ])}`,
      ].join('');
    },
  },
};

function sanitizeHtml(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<\/?(?!h2\b|h3\b|p\b|ul\b|li\b|strong\b)[a-z][^>]*>/gi, '')
    .replace(/\bonly an ai\b/gi, 'only a specialist')
    .trim();
}

function buildMessage(config: DashToolConfig, values: Record<string, string>, imageAttached: boolean) {
  const parts = config.fields.map((f) => {
    const raw = (values[f.name] ?? '').trim();
    let val = raw || 'Not supplied';
    if (f.type === 'select' && raw) {
      val = f.options?.find((o) => o.value === raw)?.label ?? raw;
    }
    return `${f.label}:\n${val}`;
  });
  parts.push(`Attachment:\n${imageAttached ? 'A photo is attached — read any visible text carefully and use only what you can confidently read.' : 'No attachment supplied.'}`);
  return parts.join('\n\n');
}

export async function handleDashTool(slug: string, req: Request) {
  const config = getDashTool(slug);
  const brain = BRAINS[slug];
  if (!config || !brain) {
    return NextResponse.json({ error: 'Unknown tool.' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const values: Record<string, string> = {};
  for (const field of config.fields) {
    values[field.name] = String(body?.[field.name] ?? '').trim().slice(0, 8000);
  }
  const imageDataUrl = String(body?.imageDataUrl ?? '').trim();

  if (imageDataUrl && !imageDataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Upload a photo or screenshot image.' }, { status: 400 });
  }
  if (imageDataUrl.length > 11_200_000) {
    return NextResponse.json({ error: 'Please upload an image under 8MB.' }, { status: 413 });
  }

  const filled = Object.values(values).join('').trim();
  if (filled.length < 3 && !imageDataUrl) {
    return NextResponse.json({ error: 'Add a few details or a photo first.' }, { status: 400 });
  }

  // Access gate — assembl pays for the model call, so consume one unit of quota
  // once the input is valid (anon: 1 free; email lifts it).
  const verdict = await gate(req, 'hapai', slug);
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  const message = buildMessage(config, values, Boolean(imageDataUrl));

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke('public-chat-llm', {
        body: {
          kete: config.kete ?? 'matauranga',
          message,
          systemPromptOverride: brain.systemPrompt,
          sessionId: crypto.randomUUID(),
          imageDataUrl: imageDataUrl || undefined,
          maxTokens: 2200,
        },
      });
      if (!error && typeof data?.response === 'string' && data.response.trim()) {
        return NextResponse.json({ html: sanitizeHtml(data.response) });
      }
    }
  } catch (err) {
    console.error(`[hapai/${slug}] generation failed`, err);
  }

  return NextResponse.json({ html: brain.fallback(values, Boolean(imageDataUrl)) });
}
