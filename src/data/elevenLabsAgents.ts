/**
 * Mapping of Assembl agent IDs to their ElevenLabs Conversational AI agent IDs.
 * Add new entries as ElevenLabs agents are created for each Assembl agent.
 */
export const ELEVENLABS_AGENT_IDS: Record<string, string> = {
  hospitality: "agent_8901kme9bffcezybjwnbscc36bw6", // AURA
};

export function getElevenLabsAgentId(agentId: string): string | undefined {
  return ELEVENLABS_AGENT_IDS[agentId];
}
