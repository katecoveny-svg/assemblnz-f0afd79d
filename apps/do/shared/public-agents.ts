/**
 * Public /do must never surface Mitre/SAP pursuit agents.
 * Those stay under /do/pursuit/mitre10 (+ agents?pack=mitre10).
 */

import type { AgentSpec, TemplatePack } from './types';
import { isMitreTemplateId } from './templates';

export function isPublicAgent(agent: AgentSpec): boolean {
  if (agent.templateId && isMitreTemplateId(agent.templateId)) return false;
  const blob = `${agent.name} ${agent.brief}`.toLowerCase();
  if (/\bmitre\b/.test(blob) || /\bsap\b/.test(blob)) return false;
  return true;
}

export function filterAgentsForPack(
  agents: AgentSpec[],
  pack: TemplatePack = 'public',
): AgentSpec[] {
  if (pack === 'mitre10') return agents;
  return agents.filter(isPublicAgent);
}
