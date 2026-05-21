import type { PaeAgent, PCOCitation, SupabaseRpcClient } from './types';
import { citeFromPCO } from './types';

export type NavigatorEmbedFn = (text: string) => Promise<number[] | null>;

export type NavigatorDraftBuilder<TInput, TDraft> = (context: {
  navigator: PaeAgent;
  input: TInput;
  citations: PCOCitation[];
  groundingQuery: string;
}) => TDraft | Promise<TDraft>;

export interface RunNavigatorOptions<TInput, TDraft> {
  navigator: PaeAgent;
  input: TInput;
  supabase: SupabaseRpcClient;
  embedFn: NavigatorEmbedFn;
  agentPack?: string | null;
  topK?: number;
  snapshotToText?: (input: TInput) => string;
  draftBuilder?: NavigatorDraftBuilder<TInput, TDraft>;
}

export interface NavigatorRunResult<TInput, TDraft> {
  navigator: {
    slug: string;
    name: string;
    subtitle?: string;
    agency: PaeAgent['agency'];
    humanApprover: string;
  };
  input: TInput;
  citations: PCOCitation[];
  draft: TDraft | null;
  status: 'pending_approval';
  groundingQuery: string;
  generatedAt: string;
}

function defaultSnapshotToText(input: unknown) {
  if (typeof input === 'string') return input;
  return JSON.stringify(input, null, 2);
}

export async function runNavigator<TInput, TDraft = unknown>({
  navigator,
  input,
  supabase,
  embedFn,
  agentPack,
  topK = 5,
  snapshotToText = defaultSnapshotToText,
  draftBuilder,
}: RunNavigatorOptions<TInput, TDraft>): Promise<NavigatorRunResult<TInput, TDraft>> {
  const groundingQuery = [
    navigator.name,
    navigator.subtitle ? `(${navigator.subtitle})` : '',
    navigator.agency.toUpperCase(),
    navigator.statutoryBasis.join('; '),
    snapshotToText(input),
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 8000);

  const embedding = await embedFn(groundingQuery);
  const citations = embedding
    ? await citeFromPCO(supabase, embedding, agentPack ?? navigator.kete ?? null, topK)
    : [];
  const draft = draftBuilder
    ? await draftBuilder({ navigator, input, citations, groundingQuery })
    : null;

  return {
    navigator: {
      slug: navigator.slug,
      name: navigator.name,
      subtitle: navigator.subtitle,
      agency: navigator.agency,
      humanApprover: navigator.humanApprover,
    },
    input,
    citations,
    draft,
    status: 'pending_approval',
    groundingQuery,
    generatedAt: new Date().toISOString(),
  };
}
