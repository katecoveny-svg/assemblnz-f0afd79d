export type {
  AgentPrimitive,
  AgentSpec,
  AgentStatus,
  CompileRequest,
  CompileResponse,
  ConsequentialVerb,
  ConnectorChoice,
  ConnectorHint,
  DemoTemplate,
  PageContext,
  PendingApproval,
  TemplateLane,
} from './types';

export type {
  DoContext,
  DoIntent,
  DoEvidence,
  DoEvidenceSource,
  DoMessage,
  DoOutcome,
  LaunchSurface,
  RuntimeLane,
  ToolPlan,
} from './pipeline';

export {
  CONSEQUENTIAL_VERBS,
  detectConsequentialVerb,
  requiresHumanApproval,
  enforceApprovalPolicy,
  POLICY_HONESTY,
} from './policy';

export { compileAgent } from './compile';
export { DEMO_TEMPLATES, getTemplate, templatesByLane, LANE_LABELS, LANE_ORDER } from './templates';
export { FIXTURES } from './fixtures';
export { CONNECTOR_STUBS, getConnector } from './connectors';
export {
  listAgents,
  getAgent,
  saveAgent,
  deleteAgent,
  activateAgent,
  approvePending,
  agentsByStatus,
  tickWatch,
} from './store';
export { chooseLane, planTools, stubAstraProvider } from './router';
export { SURFACES, getSurface } from './surfaces';
export {
  diffSnapshots,
  getWatchFixture,
  resolveWatchFixtureKey,
  snapshotFromText,
  hashContent,
} from './watch';
export { evidenceFromSnapshots, evidenceFromSources } from './evidence';
export { needsMajorChain, buildMajorApproval } from './approval-chain';
