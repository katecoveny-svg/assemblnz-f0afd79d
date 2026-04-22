/**
 * SLUG_TO_ID maps legacy/marketing URL slugs to canonical agent IDs in
 * src/data/agents.ts. New agents use their ID directly (e.g. /chat/aura →
 * agent.id = "aura"); only mappings for legacy or alternate slugs go here.
 *
 * Used by ChatPage to resolve `useParams().agentId` and by the routing
 * integrity test to validate every static /chat/:agentId link.
 */
export const SLUG_TO_ID: Record<string, string> = {
  // Legacy slugs that differ from canonical IDs
  "sports-recreation": "turf",
  "hospitality": "aura",
  "construction": "arai",
  "marketing": "prism",
  "accounting": "ledger",
  "software": "spark",
  "hotel": "aura",
  "tourism": "moana",
  "events": "pau",
  "coastal": "coast",
  "bar": "cellar",
  "concierge": "luxe",
  "bim": "ata",
  "safety": "arai",
  "projectgov": "kaupapa",
  "resource": "rawa",
  "consent": "whakaaē",
  "quality": "pai",
  "copywriting": "muse",
  "design": "pixel",
  "video": "echo",
  "hr": "aroha",
  "brandstrategy": "prism",
  "strategy": "sage",
  "risk": "vault",
  "operations": "nova",
  "sales": "flux",
  "insurance": "vault",
  "datasecurity": "cipher",
  "forecasting": "oracle",
  "analytics": "sage",
  "innovation": "ascend",
  "monitoring": "sentinel",
  "integration": "nexus-t",
  "crypto": "cipher",
  "messaging": "relay",
  "netsec": "sentinel",
  "devops": "forge",
  "family": "toroa",
  "tiriti": "mana-bi",
  "healthcompanion": "vitals",
  "triage": "remedy",
  "carenavigation": "vitae",
  "sports": "turf",
  "nonprofit": "anchor",
  "property": "haven",
  "customs": "gateway",
  "maritime": "mariner",
  "automotive": "motor",
  "agriculture": "harvest",
  "pm": "kaupapa",
  // Agent names that match their IDs (no mapping needed, but keep for explicit routing)
  "whakaae": "whakaaē",
};
