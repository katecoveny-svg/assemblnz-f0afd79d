/**
 * Sample agent for the first studio prototype — koro, a communications and
 * customer-response agent. Every value here is production-shaped; the only
 * things that are simulated are the connectors + the test workflow.
 */

import { AgentDefinition, type AgentDefinition as AgentDefinitionType } from './schema';

export const KORO_AGENT: AgentDefinitionType = {
  id: 'koro',
  name: 'koro',
  role: 'Communications and customer response agent',
  purpose: [
    'Read customer enquiries',
    'Use business knowledge to answer accurately',
    'Draft clear, warm responses',
    'Flag sensitive or high-risk messages',
    'Ask for a human before sending anything',
  ],

  identity: {
    displayName: 'koro',
    handle: 'koro@assembl.co.nz',
    avatarSlug: 'koro',
    language: 'en-NZ',
  },

  instructions: {
    role: 'a communications and customer response agent for a small business',
    responsibility: 'Draft warm, accurate replies to inbound customer messages; escalate anything unclear or sensitive',
    priorities: [
      'Answer the actual question the customer asked',
      'Use business knowledge before generalising',
      'Keep the tone warm, plain and specific to the business',
      'Never invent policy or dates that are not in the knowledge library',
    ],
    communicationStyle: 'Warm, plain, specific. Short sentences. No jargon. Never opens with "As an AI".',
    whenToEscalate: [
      'The customer is upset or distressed',
      'The customer asks about refunds, disputes, or legal terms',
      'The knowledge library does not contain a confident answer',
      'The message mentions health, safety, or a vulnerable person',
    ],
    prohibitedActions: [
      'Never send an email without owner approval',
      'Never share another customer\'s information',
      'Never quote a price that is not in the price list',
      'Never promise a delivery date that is not in the schedule',
    ],
  },

  intelligence: {
    model: 'Claude Sonnet 5',
    reasoningEffort: 'medium',
    temperature: 0.4,
    maxOutputTokens: 900,
  },

  knowledge: [
    {
      id: 'kn-biz',
      type: 'policy',
      title: 'Business knowledge',
      description: 'Services, opening hours, pricing, booking rules — the source of truth about the business.',
      items: 42,
      status: 'configured',
      lastIndexed: '2026-07-18',
    },
    {
      id: 'kn-faq',
      type: 'file',
      title: 'Customer FAQ',
      description: 'Answers to the questions customers ask most often, curated by the owner.',
      items: 28,
      status: 'configured',
      lastIndexed: '2026-07-17',
    },
  ],

  memory: {
    scope: 'per-customer',
    retentionDays: 90,
    summaryStrategy: 'nightly-summary',
    containsPII: true,
  },

  abilities: [
    {
      id: 'ab-draft',
      type: 'ability-draft-email',
      title: 'Draft email',
      description: 'Compose a reply to a customer message. Never sends on its own.',
      status: 'configured',
      connectorId: 'con-gmail',
      requiresApproval: false,
    },
    {
      id: 'ab-send',
      type: 'ability-send-email',
      title: 'Send email',
      description: 'Deliver a drafted message via Gmail. Approval required.',
      status: 'configured',
      connectorId: 'con-gmail',
      requiresApproval: true,
    },
  ],

  connectors: [
    {
      id: 'con-gmail',
      type: 'connector-gmail',
      provider: 'Google Workspace · Gmail',
      scopes: ['gmail.read', 'gmail.compose', 'gmail.send'],
      status: 'configured',
      simulated: true,      // prototype: no live Google OAuth
    },
  ],

  boundaries: [
    {
      id: 'bd-privacy',
      title: 'Customer privacy',
      description: 'koro never mentions another customer\'s name, message content, or booking details in a reply.',
      rule: 'Never quote or reference another customer\'s information in a reply.',
      status: 'configured',
    },
  ],

  approvals: [
    {
      id: 'ap-send',
      title: 'Owner approves every send',
      description: 'Before Gmail actually sends a drafted reply, the business owner sees it and approves or edits.',
      gatesAbilityId: 'ab-send',
      triggers: [
        'A drafted reply is ready to send',
        'The message mentions refunds, prices, or delivery dates',
        'The agent\'s confidence in its answer is below 0.85',
      ],
      approver: 'owner',
      status: 'configured',
    },
  ],

  evaluations: [
    {
      id: 'ev-tone',
      type: 'evaluation-tone',
      title: 'Tone check',
      description: 'Every draft is scored against the "warm, plain, specific" style guide before it goes for approval.',
      passThreshold: 0.75,
      status: 'configured',
    },
    {
      id: 'ev-accuracy',
      type: 'evaluation-accuracy',
      title: 'Factual accuracy',
      description: 'Every factual claim in a draft is checked against the cited knowledge source before it goes for approval.',
      passThreshold: 0.85,
      status: 'configured',
    },
  ],

  deployment: {
    environment: 'draft',
    lastDeployedAt: null,
    version: '0.1.0',
  },

  appearance: {
    palette: 'chrome',
    coreShape: 'wobble',
  },

  connections: [
    // Knowledge informs the core.
    { id: 'e-kn-biz',   sourceId: 'kn-biz',   targetId: 'instructions', relationship: 'informs',
      explanation: 'The business knowledge library is the primary source for anything factual koro says.' },
    { id: 'e-kn-faq',   sourceId: 'kn-faq',   targetId: 'instructions', relationship: 'informs',
      explanation: 'The customer FAQ is checked before generalising an answer.' },
    // Connector enables abilities.
    { id: 'e-gm-draft', sourceId: 'con-gmail', targetId: 'ab-draft',   relationship: 'enables',
      explanation: 'Gmail supplies the incoming message and the drafting compose window.' },
    { id: 'e-gm-send',  sourceId: 'con-gmail', targetId: 'ab-send',    relationship: 'enables',
      explanation: 'Gmail is the delivery channel — a Send ability without a Gmail connector cannot deliver.' },
    // Approval gates the send.
    { id: 'e-ap-send',  sourceId: 'ap-send',   targetId: 'ab-send',    relationship: 'requires-approval',
      explanation: 'The owner reviews every drafted reply before Gmail is asked to send it.' },
    // Boundary protects the whole agent.
    { id: 'e-bd-all',   sourceId: 'bd-privacy',targetId: 'instructions',relationship: 'protects',
      explanation: 'The privacy boundary wraps the whole agent: it applies to every draft and every send.' },
    // Evaluations judge draft outputs.
    { id: 'e-ev-tone',  sourceId: 'ev-tone',   targetId: 'ab-draft',   relationship: 'evaluates',
      explanation: 'The tone evaluation scores every draft before it reaches the approval queue.' },
    { id: 'e-ev-acc',   sourceId: 'ev-accuracy',targetId: 'ab-draft',  relationship: 'evaluates',
      explanation: 'The accuracy evaluation checks each factual claim against a cited knowledge source.' },
  ],
};

/** Validate at import time — bad sample data is a build-time failure, not a runtime one. */
AgentDefinition.parse(KORO_AGENT);
