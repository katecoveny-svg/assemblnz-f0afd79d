/**
 * Pilot catalogues — the option sets the 13-step flow draws from.
 *
 * Plain data, no server-only imports (used in the client flow). Domains and
 * result types (step 1), knowledge sources (step 5), and tools grouped by
 * category (step 6) per the brief addenda. The free-text-driven auto-suggestion
 * for tools lives in tool-registry.ts; these are the pickable option lists.
 */
import type { Domain, ResultType, KnowledgeKind } from './types';

export const DOMAINS: { id: Domain; label: string }[] = [
  { id: 'research', label: 'Research' },
  { id: 'writing', label: 'Writing' },
  { id: 'sales', label: 'Sales' },
  { id: 'customer-support', label: 'Customer support' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'admin', label: 'Admin' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance' },
  { id: 'hr', label: 'HR' },
  { id: 'learning', label: 'Learning' },
  { id: 'project-management', label: 'Project management' },
  { id: 'reporting', label: 'Reporting' },
  { id: 'internal-knowledge', label: 'Internal knowledge' },
  { id: 'personal-productivity', label: 'Personal productivity' },
  { id: 'custom', label: 'Custom workflow' },
];

export const RESULT_TYPES: { id: ResultType; label: string }[] = [
  { id: 'drafted-email', label: 'A drafted email' },
  { id: 'completed-report', label: 'A completed report' },
  { id: 'meeting-summary', label: 'A meeting summary' },
  { id: 'proposal', label: 'A proposal' },
  { id: 'customer-response', label: 'A customer response' },
  { id: 'task-list', label: 'A task list' },
  { id: 'spreadsheet-update', label: 'A spreadsheet update' },
  { id: 'crm-note', label: 'A CRM note' },
  { id: 'decision-recommendation', label: 'A decision recommendation' },
  { id: 'workflow-checklist', label: 'A workflow checklist' },
  { id: 'training-material', label: 'Training material' },
];

export const RESULT_LABEL: Record<ResultType, string> = Object.fromEntries(
  RESULT_TYPES.map((r) => [r.id, r.label]),
) as Record<ResultType, string>;

export const DOMAIN_LABEL: Record<Domain, string> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d.label]),
) as Record<Domain, string>;

// ── Knowledge sources (step 5), tagged by the four kinds ───────────────────
export interface KnowledgeSource {
  id: string;
  label: string;
  kind: KnowledgeKind;
}

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { id: 'uploaded-docs', label: 'Uploaded documents', kind: 'static' },
  { id: 'brand-guidelines', label: 'Brand guidelines', kind: 'static' },
  { id: 'internal-policies', label: 'Internal policies', kind: 'static' },
  { id: 'sops', label: 'SOPs', kind: 'static' },
  { id: 'faqs', label: 'FAQs', kind: 'static' },
  { id: 'product-docs', label: 'Product documentation', kind: 'static' },
  { id: 'templates', label: 'Templates', kind: 'static' },
  { id: 'style-guides', label: 'Style guides', kind: 'static' },
  { id: 'training-materials', label: 'Training materials', kind: 'static' },
  { id: 'examples', label: 'Previous examples', kind: 'static' },
  { id: 'website', label: 'Website pages', kind: 'live' },
  { id: 'grounded-web', label: 'Current web sources with citations', kind: 'live' },
  { id: 'spreadsheets', label: 'Spreadsheets', kind: 'live' },
  { id: 'crm', label: 'CRM data', kind: 'live' },
  { id: 'customer-records', label: 'Customer records', kind: 'live' },
  { id: 'conversation-context', label: 'What you tell it in the moment', kind: 'user-provided' },
  { id: 'baked-rules', label: "The agent's own rules", kind: 'system' },
];

export const KNOWLEDGE_BY_KIND: Record<KnowledgeKind, KnowledgeSource[]> = {
  static: KNOWLEDGE_SOURCES.filter((s) => s.kind === 'static'),
  live: KNOWLEDGE_SOURCES.filter((s) => s.kind === 'live'),
  'user-provided': KNOWLEDGE_SOURCES.filter((s) => s.kind === 'user-provided'),
  system: KNOWLEDGE_SOURCES.filter((s) => s.kind === 'system'),
};

export const KNOWLEDGE_KIND_LABEL: Record<KnowledgeKind, string> = {
  static: 'Static — does not change often',
  live: 'Live — searched or fetched',
  'user-provided': 'User-provided — given in conversation',
  system: 'System — baked-in rules',
};

export function knowledgeLabel(id: string): string {
  return KNOWLEDGE_SOURCES.find((s) => s.id === id)?.label ?? id;
}

// ── Tools grouped by category (step 6) ─────────────────────────────────────
export type ToolCategory = 'read' | 'action' | 'automation' | 'knowledge' | 'approval';

export interface CategorisedTool {
  id: string;
  label: string;
  category: ToolCategory;
}

export const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  read: 'Read — pull information in',
  action: 'Action — do something (needs care)',
  automation: 'Automation — connect to other systems',
  knowledge: 'Knowledge — search and recall',
  approval: 'Approval — pause for a human',
};

export const CATEGORISED_TOOLS: CategorisedTool[] = [
  // Read
  { id: 'read-drive', label: 'Google Drive', category: 'read' },
  { id: 'read-notion', label: 'Notion', category: 'read' },
  { id: 'read-airtable', label: 'Airtable', category: 'read' },
  { id: 'read-website', label: 'Website search', category: 'read' },
  { id: 'read-grounded-web', label: 'Live web research with citations', category: 'read' },
  { id: 'read-docs', label: 'Uploaded docs', category: 'read' },
  { id: 'read-crm', label: 'CRM', category: 'read' },
  { id: 'read-slack', label: 'Slack', category: 'read' },
  { id: 'read-email', label: 'Email', category: 'read' },
  { id: 'read-calendar', label: 'Calendar', category: 'read' },
  // Action
  { id: 'act-send-email', label: 'Send email', category: 'action' },
  { id: 'act-create-task', label: 'Create task', category: 'action' },
  { id: 'act-update-crm', label: 'Update CRM', category: 'action' },
  { id: 'act-calendar-event', label: 'Create calendar event', category: 'action' },
  { id: 'act-slack-message', label: 'Post Slack message', category: 'action' },
  { id: 'act-generate-doc', label: 'Generate document', category: 'action' },
  { id: 'act-update-sheet', label: 'Update spreadsheet', category: 'action' },
  { id: 'act-create-ticket', label: 'Create ticket', category: 'action' },
  // Automation
  { id: 'auto-zapier', label: 'Zapier', category: 'automation' },
  { id: 'auto-n8n', label: 'n8n', category: 'automation' },
  { id: 'auto-make', label: 'Make', category: 'automation' },
  { id: 'auto-webhooks', label: 'Webhooks', category: 'automation' },
  { id: 'auto-internal-api', label: 'Internal APIs', category: 'automation' },
  // Knowledge
  { id: 'kn-doc-search', label: 'Document search', category: 'knowledge' },
  { id: 'kn-grounded-web', label: 'Grounded web search (provider-neutral)', category: 'knowledge' },
  { id: 'kn-rag', label: 'RAG', category: 'knowledge' },
  { id: 'kn-vector-db', label: 'Vector database', category: 'knowledge' },
  { id: 'kn-internal-kb', label: 'Internal knowledge base', category: 'knowledge' },
  { id: 'kn-policy-lookup', label: 'Policy lookup', category: 'knowledge' },
  { id: 'kn-faq-lookup', label: 'FAQ lookup', category: 'knowledge' },
  // Approval
  { id: 'appr-before-send', label: 'Ask before sending', category: 'approval' },
  { id: 'appr-before-publish', label: 'Ask before publishing', category: 'approval' },
  { id: 'appr-before-delete', label: 'Ask before deleting', category: 'approval' },
  { id: 'appr-before-spend', label: 'Ask before spending', category: 'approval' },
  { id: 'appr-before-change', label: 'Ask before changing records', category: 'approval' },
  { id: 'appr-before-contact', label: 'Ask before contacting customers', category: 'approval' },
];

export const TOOLS_BY_CATEGORY: Record<ToolCategory, CategorisedTool[]> = {
  read: CATEGORISED_TOOLS.filter((t) => t.category === 'read'),
  action: CATEGORISED_TOOLS.filter((t) => t.category === 'action'),
  automation: CATEGORISED_TOOLS.filter((t) => t.category === 'automation'),
  knowledge: CATEGORISED_TOOLS.filter((t) => t.category === 'knowledge'),
  approval: CATEGORISED_TOOLS.filter((t) => t.category === 'approval'),
};

export function categorisedToolLabel(id: string): string {
  return CATEGORISED_TOOLS.find((t) => t.id === id)?.label ?? id;
}

export function isActionTool(id: string): boolean {
  const t = CATEGORISED_TOOLS.find((x) => x.id === id);
  return t?.category === 'action' || t?.category === 'automation';
}
