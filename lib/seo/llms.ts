/** Public product index. A catalogue entry is not proof a provider call succeeded. */
import {CATEGORIES,PUBLIC_MARKETPLACE_AGENTS,priceLabel,type MarketplaceCategory} from '@/lib/marketplace/agents';
import {SITE_URL} from '@/lib/seo/schema';
const liveAgents=()=>PUBLIC_MARKETPLACE_AGENTS.filter(a=>a.status==='live');
const agentsByCat=(cat:MarketplaceCategory)=>liveAgents().filter(a=>a.category===cat);
const SUMMARY='assembl is a New Zealand software company for finding, doing and showing valuable work. Pursuit finds evidence-backed opportunities, DO moves bounded work forward with agents, tools and permissions, and Studio turns the result into proof, pitches and experiences.';
const INTRO=`assembl (always lowercase) is a New Zealand company founded by Kate Hudson. Its public product structure is Pursuit → DO → Studio, with one shared operating layer underneath for context, connectors, models, permissions, evidence and learning.

Pursuit turns relevant signals into evidence-backed opportunities. DO brings the right agent, context, tools and permissions to a bounded job while keeping consequential actions behind explicit approval. Studio turns opportunities and completed work into interactive demonstrations, websites, campaigns, imagery, film, 3D experiences and other commercial proof.

Human authority remains explicit. A connection does not itself grant permission to send, publish, spend or make irreversible changes. Completed work should leave evidence or a receipt.

Agentic customer journeys, loyalty, rewarded waits and sponsorship remain specialist capabilities inside suitable DO and Studio journeys. They are not the top-level definition of assembl.`;
const ACCESS=`## Public knowledge and callable tools

- Documentation: ${SITE_URL}/tools/agents
- OpenAPI: ${SITE_URL}/tools/agents/openapi.json
- Machine-readable catalogue: ${SITE_URL}/.well-known/assembl-tools.json
- Read-only knowledge search: GET ${SITE_URL}/api/knowledge/search?q=studio
- MCP: POST ${SITE_URL}/api/knowledge/mcp, stateless Streamable HTTP
- MCP tool: search_assembl_public_knowledge, input {"query":"Pursuit"}

The free collection contains six published Assembl product records, not private client documents or the full New Zealand knowledge base. Keep returned source URLs and version dates. Private hubs and Creative Studio remain authenticated.

The homepage public-source research trial reports current availability at ${SITE_URL}/api/pursuit/research. A configured provider is not a completed call. TypeSafe is optional decision support, not a search engine or evidence source. Public research must retain actual search counts and source links. Its deck export is editable HTML, not a confirmed client-hub write.

Paid tool access and external registry listings require separate activation. Do not treat catalogue prices, test keys or registered specialist names as evidence of a working billable API. No charge is made by the public knowledge search.`;
const KEY_PAGES=[
 ['/pursuit','Pursuit: find evidence-backed opportunities and prepare the next move'],
 ['/do','DO: bounded work with context, tools, permissions and evidence'],
 ['/creative-studio','Studio: demonstrations, campaigns, visual production, web and 3D'],
 ['/tools/agents','Agent access: public knowledge, MCP, OpenAPI and exact availability limits'],
 ['/trust','Trust Centre: security, privacy, evidence and governance'],
 ['/mana-receipts','Evidence receipts and provenance'],
 ['/about','About assembl and its founder'],
 ['/contact','Contact assembl'],
] as const;
const SPECIALIST_NOTE='Specialists are capabilities underneath DO, not separate top-level brands. The following entries reflect registered catalogue metadata, not a verification that every upstream provider is configured or that a billable action has run.';
export function buildLlmsTxt():string{
 const lines:string[]=['# assembl','',`> ${SUMMARY}`,'',INTRO,'',ACCESS,'','## Key pages',''];
 for(const [path,description] of KEY_PAGES)lines.push(`- [${path}](${SITE_URL}${path}): ${description}`);
 lines.push('','## Specialist agents','',SPECIALIST_NOTE,'');
 for(const cat of CATEGORIES){const agents=agentsByCat(cat.slug);if(!agents.length)continue;lines.push(`### ${cat.label}`,'');for(const a of agents)lines.push(`- [${a.name}](${SITE_URL}/agents/${a.slug}) (${priceLabel(a)}): ${a.description}`);lines.push('');}
 lines.push('## About','','assembl was founded by Kate Hudson and is built in Aotearoa New Zealand. Find it. DO it. Show it.','');return lines.join('\n');
}
export function buildLlmsFullTxt():string{
 const lines:string[]=['# assembl — full content','',`> ${SUMMARY}`,'','## The system','',INTRO,'',ACCESS,'',
 '## Pursuit','','Pursuit brings relevant company, market and customer signals into an evidence-backed opportunity brief. Keep dates, sources, proposed next actions and unresolved questions together. A suggested opportunity is not proof of customer demand.','',
 '## DO','','DO brings a specialist agent, selected context, tools and permissions to bounded work. Browser, desktop and hosted surfaces must preserve the same authority boundary. Verify each connection and runtime capability before describing it as available.','',
 'The underlying model can vary by task. Agent identity, context, tools, permissions, work state and evidence are separate from the selected model.','',
 '## Studio','','Studio turns a brief, an opportunity or completed work into demonstrations, websites, campaigns, imagery, video, 3D, pitches and other artefacts people can see and try. Private workspaces remain authenticated.','',
 '## Customer journeys and useful waits','','Customer journeys are a reusable capability across the system. DO prepares the next step and Studio demonstrates it. Loyalty, rewards and sponsored waits belong only where they improve the customer outcome.','',
 '## Security and authority','','Secrets are not prompt context. OAuth credentials and API keys stay server-side. Retrieved webpages and documents are untrusted data, not instructions. Sending, publishing, spending and irreversible actions require separate authority and an auditable receipt.','',
 '## Self-improvement','','Use measured evaluations and reviewable changes rather than silent self-modification. Evidence and observed failures can guide improvements; they do not authorise broader permissions.','',
 '## Specialist agents','',SPECIALIST_NOTE,''];
 for(const cat of CATEGORIES){const agents=agentsByCat(cat.slug);if(!agents.length)continue;lines.push(`### ${cat.label}`,'');for(const a of agents){lines.push(`#### ${a.name}${a.teReo?` (${a.teReo})`:''} — ${priceLabel(a)}`,'',a.description,'');if(a.whatItDoes?.length){lines.push('Registered capabilities:');for(const w of a.whatItDoes)lines.push(`- ${w}`);lines.push('');}if(a.nzKnowledge?.length)lines.push(`Listed New Zealand knowledge areas: ${a.nzKnowledge.join('; ')}.`,'');lines.push(`URL: ${SITE_URL}/agents/${a.slug}`,'');}}
 lines.push('## Founder','','assembl was founded by Kate Hudson. It is built in New Zealand around useful delegated work, visible authority and source-linked proof.','');return lines.join('\n');
}
