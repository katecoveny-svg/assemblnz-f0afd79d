/**
 * Mapping of Assembl agent IDs to their ElevenLabs Conversational AI agent IDs.
 * Add new entries as ElevenLabs agents are created for each Assembl agent.
 */
export const ELEVENLABS_AGENT_IDS: Record<string, string> = {
  hospitality: "agent_8901kme9bffcezybjwnbscc36bw6", // AURA
  sales: "agent_9901kmedvk7wfmyrkk1wr3ddqmts", // FLUX
  automotive: "agent_9801kmedekfdfq29kcz3hgzk3ewx", // FORGE
  marketing: "agent_3401kmefawt3fex8qdtgq19jg2wg", // PRISM
  operations: "agent_4301kmegw0b3fy49dt2cpf0qx6tw", // HELM
  echo: "agent_9201kmej873zerqt2bme09chmnt5", // ECHO
  customs: "agent_1801kmek0yy6f9a8y8dvht8cq5kb", // NEXUS
};

export function getElevenLabsAgentId(agentId: string): string | undefined {
  return ELEVENLABS_AGENT_IDS[agentId];
}
