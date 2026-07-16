import { z } from 'zod';

/**
 * Lead Hunter is provider-neutral. The runtime resolves `grounded_web_search`
 * to the best configured provider (Google/Parallel, OpenAI, Perplexity, etc.)
 * and must preserve source provenance in every accepted lead.
 */
export const leadHunterInputSchema = z.object({
  market: z.string().default('New Zealand'),
  niche: z.string().min(2),
  targetCount: z.number().int().min(1).max(200).default(25),
  criteria: z.array(z.string()).min(1),
  exclusions: z.array(z.string()).default([]),
  problemSignals: z.array(z.string()).default([]),
  freshnessDays: z.number().int().min(1).max(365).default(60),
});

export const leadEvidenceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  retrievedAt: z.string().datetime(),
  excerpt: z.string().max(800),
  supports: z.array(z.string()).min(1),
  provider: z.string(),
});

export const leadRecordSchema = z.object({
  businessName: z.string(),
  website: z.string().url(),
  location: z.string().optional(),
  category: z.string(),
  matchedCriteria: z.array(z.string()),
  likelyOperationalProblem: z.string(),
  recommendedAssemblOffer: z.string(),
  personalisedOpening: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(leadEvidenceSchema).min(1),
  duplicateKey: z.string(),
  status: z.enum(['accepted', 'needs-review', 'rejected']),
  rejectionReason: z.string().optional(),
});

export const leadHunterOutputSchema = z.object({
  querySummary: z.string(),
  leads: z.array(leadRecordSchema),
  rejectedCount: z.number().int().nonnegative(),
  duplicateCount: z.number().int().nonnegative(),
  coverageNotes: z.array(z.string()),
  runEvidence: z.object({
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime(),
    provider: z.string(),
    model: z.string(),
    promptVersion: z.string(),
  }),
});

export type LeadHunterInput = z.infer<typeof leadHunterInputSchema>;
export type LeadHunterOutput = z.infer<typeof leadHunterOutputSchema>;

export const LEAD_HUNTER_AGENT = {
  slug: 'lead-hunter',
  name: 'Lead Hunter',
  category: 'sales',
  description:
    'Finds and verifies New Zealand businesses that match a precise brief, then turns public evidence into confidence-scored leads and personalised openings.',
  agentType: 'workflow' as const,
  modelPolicy: {
    preference: 'balanced',
    requiresGrounding: true,
    requiresStructuredOutput: true,
    requiresIndependentVerificationAboveRisk: 'medium',
  },
  capabilities: [
    'grounded_web_search',
    'website_read',
    'structured_extraction',
    'deduplication',
    'evidence_capture',
    'crm_draft',
  ],
  tools: ['read-grounded-web', 'kn-grounded-web', 'read-website', 'read-crm', 'act-update-crm', 'appr-before-contact'],
  knowledge: ['grounded-web', 'website', 'crm', 'brand-guidelines', 'conversation-context', 'baked-rules'],
  approvals: {
    requiredBefore: ['contacting a lead', 'writing to the CRM', 'starting a paid data-enrichment run'],
    neverAutomatic: ['sending outreach', 'purchasing contact data', 'publishing personal information'],
  },
  successCriteria: {
    minimumEvidenceSourcesPerLead: 1,
    targetDuplicateRate: 0.05,
    minimumAcceptedConfidence: 0.72,
    factualClaimsRequireSource: true,
  },
  version: '1.0.0',
  promptVersion: 'lead-hunter-v1',
} as const;
