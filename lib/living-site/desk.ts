import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

const STOP = new Set([
  'about', 'after', 'again', 'also', 'and', 'are', 'can', 'could', 'does', 'for',
  'from', 'have', 'how', 'into', 'just', 'more', 'our', 'please', 'tell', 'that',
  'the', 'their', 'this', 'what', 'when', 'where', 'which', 'with', 'would', 'you',
  'your',
]);

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s$]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP.has(token));
}

export function rankGenomeFacts(question: string, facts: GenomeFact[], limit = 4): GenomeFact[] {
  const query = new Set(tokens(question));
  return facts
    .map((fact, index) => {
      const labelTokens = tokens(fact.label);
      const valueTokens = tokens(fact.value);
      const score = labelTokens.reduce((sum, token) => sum + (query.has(token) ? 3 : 0), 0)
        + valueTokens.reduce((sum, token) => sum + (query.has(token) ? 1 : 0), 0);
      return { fact, score, index };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.fact);
}

export function deterministicDeskAnswer(input: {
  question: string;
  facts: GenomeFact[];
  businessName: string;
  owner: string;
}): { answer: string; facts: GenomeFact[] } {
  const { question, facts, businessName, owner } = input;
  const lowered = question.toLowerCase();
  let selected: GenomeFact[];
  let lead: string;

  if (/price|cost|how much|rate|fee|quote/.test(lowered)) {
    selected = facts.filter((fact) => fact.section === 'services').slice(0, 5);
    lead = `Here are the current service details held in ${businessName}’s Business Genome:`;
  } else if (/book|booking|appointment|available|availability|time|slot/.test(lowered)) {
    selected = facts.filter((fact) => fact.id === 'g-booking-rules' || fact.section === 'services').slice(0, 4);
    lead = `You can request a preferred time through the **Book** area. It is not confirmed until ${owner} checks the diary and replies.`;
  } else if (/policy|safe|safety|cancel|refund|faq|question/.test(lowered)) {
    selected = facts.filter((fact) => fact.section === 'knowledge' || fact.id === 'g-booking-rules').slice(0, 4);
    lead = `These are the relevant policy and knowledge notes currently held by ${businessName}:`;
  } else {
    selected = rankGenomeFacts(question, facts);
    if (selected.length === 0) selected = facts.filter((fact) => fact.section === 'services').slice(0, 3);
    lead = selected.length
      ? `Here is what ${businessName} currently has on that:`
      : `I do not have that detail in ${businessName}’s Business Genome yet. I can still help you draft a clear question for ${owner}.`;
  }

  const lines = selected.map((fact) => `- **${fact.label}:** ${fact.value}`);
  return {
    answer: [lead, '', ...lines, '', `This is a desk draft from the current Business Genome. ${owner} confirms prices, availability and any commitment.`].join('\n'),
    facts: selected,
  };
}
