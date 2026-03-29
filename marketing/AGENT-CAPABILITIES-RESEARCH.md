# Assembl Agent Capabilities Research: World-Class AI Benchmark Analysis

**Date:** March 2026
**Purpose:** Gap analysis of Assembl's 42 agents versus the world's best AI platforms, with prioritised recommendations.

> **Research note:** This analysis draws on the Assembl codebase (agents.ts, agentCapabilities.ts, integrations.ts, chat/index.ts, personality engine, self-healing engine) and knowledge of competitor platforms as of early 2026. Web search was unavailable during compilation; some competitor features may have shipped more recently than captured here.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Global AI Agent Landscape (2026)](#global-landscape)
3. [What Makes an Agent "Agentic"](#what-makes-agentic)
4. [MCP (Model Context Protocol) Capabilities](#mcp-capabilities)
5. [Major Platform Comparison](#major-platform-comparison)
6. [Assembl Agent Gap Analysis (Top 10)](#gap-analysis)
7. [Voice AI Benchmarks](#voice-ai-benchmarks)
8. [Document Processing Benchmarks](#document-processing-benchmarks)
9. [Assembl's Existing Advantages](#assembl-advantages)
10. [Prioritised Recommendations](#recommendations)

---

## 1. Executive Summary <a name="executive-summary"></a>

Assembl fields 42 specialised AI agents plus ECHO (hero agent), each with deep NZ legislation knowledge, industry-specific document generation, and a personality engine. This is a genuinely differentiated approach -- no global competitor offers NZ-regulation-native, sector-specific AI agents at this breadth.

**However, the gap between Assembl and world-class platforms exists primarily in three areas:**

1. **Agentic autonomy** -- leading platforms can now take real actions (send emails, book meetings, execute code, browse the web) while Assembl agents primarily generate text and documents
2. **Live data connectivity** -- competitors pull real-time CRM data, financial data, and third-party APIs natively, while Assembl's integrations are mostly "available" or "coming soon"
3. **Multi-step workflow execution** -- top platforms chain multiple actions together with human-in-the-loop approval, while Assembl's symbiotic workflows are still emerging

**The good news:** Assembl's NZ-specific depth, 42-agent breadth, and regulatory knowledge create a moat that global platforms cannot easily replicate. The priority is to make agents more *agentic* -- able to act, not just advise.

---

## 2. The Global AI Agent Landscape (2026) <a name="global-landscape"></a>

### ChatGPT / OpenAI

- **Operator:** A dedicated agentic product that can browse the web, fill out forms, complete multi-step tasks autonomously in a browser environment
- **GPTs / Custom GPTs:** User-built agents with custom instructions, knowledge files, and API actions
- **Code Interpreter:** Executes Python, generates charts, analyses data files in a sandboxed environment
- **DALL-E 3 / Image generation:** Native image creation integrated into chat
- **Voice mode:** Real-time conversational voice with low latency, emotional awareness, and multi-language support
- **Memory:** Persistent user memory across conversations
- **Canvas:** Collaborative writing and coding workspace
- **Plugins/Actions:** Can call external APIs, fetch live data, and take actions in third-party services
- **File analysis:** PDF, Excel, CSV, images -- upload and analyse any document
- **o1/o3 reasoning:** Deep multi-step reasoning for complex problems

### Claude (Anthropic)

- **Computer Use:** Can see and control a desktop, click buttons, type text, navigate applications -- true agentic computer operation
- **MCP (Model Context Protocol):** Open standard for connecting AI to tools, data sources, and services. Adopted widely by the ecosystem
- **200K context window (standard), 1M (Opus):** Analyse entire codebases, long legal documents, or full financial reports in one pass
- **Artifacts:** Generates interactive applications, visualisations, and documents inline
- **Document analysis:** Best-in-class for legal, financial, and technical document analysis
- **Coding:** Top-tier code generation with Claude Code CLI for autonomous development
- **Projects:** Persistent workspaces with custom instructions and knowledge
- **Citations:** Precise source attribution from uploaded documents

### Google Gemini

- **2M token context window:** The longest available -- can process entire books, massive datasets
- **Multimodal native:** Text, image, audio, video input and output -- analyse YouTube videos, process images, understand audio
- **Google Workspace integration:** Deep integration with Gmail, Docs, Sheets, Slides, Calendar, Meet
- **Gems:** Custom AI personas with specialised knowledge
- **Deep Research:** Autonomous multi-step web research with source-cited reports
- **NotebookLM:** Audio overviews, interactive podcast-style content from documents
- **Live API:** Real-time multimodal streaming for voice and video
- **Grounding with Google Search:** Real-time information retrieval during generation

### Microsoft Copilot

- **Office 365 integration:** Native AI in Word, Excel, PowerPoint, Outlook, Teams
- **Copilot Studio:** No-code agent builder for enterprises
- **Copilot Agents:** Autonomous agents that can execute multi-step business processes
- **Graph-grounded:** Pulls from Microsoft Graph (emails, files, meetings, contacts) for personalised responses
- **Power Automate integration:** Triggers automated workflows from natural language
- **Security Copilot:** AI for cybersecurity incident response
- **Teams integration:** Meeting summaries, action items, real-time transcription

### Salesforce Einstein / Agentforce

- **Autonomous agents:** Agents that handle customer inquiries, qualify leads, and resolve cases without human intervention
- **Einstein Trust Layer:** Enterprise-grade data security, PII masking, toxicity detection
- **CRM-native:** Direct access to all Salesforce data -- contacts, opportunities, cases, campaigns
- **Einstein Copilot:** Natural language interface to all Salesforce actions
- **Agentforce SDR:** Autonomous sales development rep that prospects, qualifies, and books meetings
- **Agentforce Service Agent:** Resolves customer cases autonomously with full CRM context
- **Custom actions:** Build agent actions from Salesforce Flows, Apex, APIs, MuleSoft
- **Multi-channel:** Operates across email, chat, SMS, Slack, and voice

### HubSpot AI

- **Breeze AI:** Embedded AI across the entire HubSpot platform
- **Breeze Copilot:** Contextual AI assistant in every HubSpot tool
- **Breeze Agents:** Content Agent (writes blogs, landing pages), Social Agent (manages social media), Prospecting Agent (finds and qualifies leads), Customer Agent (handles support tickets)
- **Content remix:** Repurposes a single piece of content across all formats
- **Brand voice:** Learns and maintains brand tone across all content
- **CRM-enriched:** Every AI output grounded in CRM data
- **Campaign assistant:** Generates complete multi-channel campaigns from a brief
- **SEO recommendations:** AI-powered content optimisation

### Xero AI

- **Xero Ask:** Natural language queries against accounting data ("What were my top expenses last quarter?")
- **Bank reconciliation AI:** Auto-matches transactions to invoices
- **Invoice coding:** Automatic categorisation of expenses
- **Cash flow predictions:** Forward-looking cash flow analysis
- **Smart categorisation:** Learns from accountant corrections
- **Hubdoc:** Document scanning and data extraction for receipts and bills
- **Short-term cash flow:** 30-day predictions based on upcoming bills and expected payments
- **Analytics Plus:** Custom financial reports with AI insights

### Intercom Fin

- **Resolution-first AI:** Resolves up to 86% of customer queries without human intervention
- **Multi-source knowledge:** Learns from help centre articles, past conversations, internal docs
- **Handoff to human:** Seamless escalation with full conversation context
- **Multilingual:** 45+ languages automatically
- **Custom answers:** Business-specific responses for complex scenarios
- **Tone customisation:** Adjustable personality and brand voice
- **Actions:** Can perform tasks (check order status, update account, process refunds) via API
- **Analytics:** Resolution rate, CSAT, topics, and performance metrics
- **Omnichannel:** Chat, email, SMS, WhatsApp, social media

### Notion AI

- **Workspace-wide AI:** Searches and reasons across all pages, databases, and wikis
- **Q&A:** Answers questions using workspace knowledge as the source
- **Autofill:** Populates database properties automatically based on content
- **AI blocks:** Generates summaries, action items, and translations inline
- **Custom AI agents:** Build agents that operate on workspace data
- **Connectors:** Pulls data from Slack, Google Drive, GitHub, Confluence
- **Meeting notes AI:** Transcription, summaries, and action item extraction

### Perplexity

- **Real-time research:** Searches the internet and synthesises answers with citations
- **Pages:** Generates full articles/reports from research
- **Spaces:** Collaborative research workspaces with shared context
- **Pro Search:** Multi-step research with follow-up questions and deeper analysis
- **API:** Developer access for programmatic research
- **File analysis:** Upload documents for AI-powered analysis
- **Focus modes:** Academic, writing, Wolfram Alpha, video, social

### Jasper

- **Brand voice training:** Learns from existing content to replicate brand tone
- **Campaigns:** Generates complete multi-channel marketing campaigns
- **Marketing AI workflows:** Template-driven content production pipelines
- **Brand intelligence:** Analyses brand positioning and competitor content
- **SEO optimisation:** Content scoring and keyword recommendations
- **Image generation:** Marketing-focused AI image creation
- **Team collaboration:** Multi-user workflows with approval chains
- **Content calendar:** AI-planned editorial calendars
- **Analytics:** Performance tracking for AI-generated content
- **60+ templates:** Blog posts, social media, ads, email, product descriptions

### Harvey AI

- **Legal research:** Searches case law, statutes, and regulations
- **Document analysis:** Extracts key terms, risks, and obligations from contracts
- **Draft generation:** Creates legal documents, memos, and briefs
- **Jurisdiction-specific:** Trained on specific legal jurisdictions
- **Confidential computing:** Enterprise-grade security for sensitive legal data
- **Citation verification:** Validates legal citations against source material
- **Contract review:** Clause-by-clause analysis with risk flagging
- **Due diligence:** Analyses large document sets for M&A and transactions
- **Hallucination controls:** Purpose-built safeguards for legal accuracy

### Nuance Dragon / Microsoft Speech

- **Medical dictation:** Specialised vocabulary for clinical documentation
- **Speaker recognition:** Identifies individual speakers in multi-party conversations
- **Real-time transcription:** Live speech-to-text with punctuation
- **Custom vocabularies:** Industry-specific terminology models
- **Command and control:** Voice-driven application operation
- **DAX Copilot:** Ambient clinical documentation -- listens to doctor-patient conversations and generates clinical notes
- **Enterprise voice:** Call centre automation, IVR, and conversational AI

---

## 3. What Makes an AI Agent "Agentic" <a name="what-makes-agentic"></a>

The industry has converged on a clear definition. A truly agentic AI system must have:

### The 5 Pillars of Agentic AI

| Pillar | Description | Assembl Status |
|--------|-------------|----------------|
| **1. Tool Use** | Can call APIs, query databases, send emails, trigger webhooks | Partial -- PDF export, weather, image gen are live; most integrations "coming soon" |
| **2. Planning** | Can break complex tasks into steps and execute them sequentially | Emerging -- self-healing engine exists with workflow chains, but limited to retry logic |
| **3. Memory** | Remembers user context, preferences, and past interactions across sessions | Yes -- personality engine tracks user context, mood, milestones, and seasonal awareness |
| **4. Reasoning** | Can analyse situations, weigh options, and make decisions | Yes -- agents have deep domain expertise and NZ legislation knowledge |
| **5. Action** | Can take real-world actions (not just generate text) with human-in-the-loop approval | Limited -- agents advise but rarely execute actions in external systems |

### Current Industry Standard for "Agentic" (2026)

World-class agentic systems can now:
- Browse the web to research information and complete forms (OpenAI Operator)
- Control a computer to use any application (Claude Computer Use)
- Send emails after human approval (Salesforce Agentforce, HubSpot Breeze)
- Create and update CRM records (Salesforce, HubSpot)
- Schedule meetings and manage calendars (Microsoft Copilot, Google Gemini)
- Process refunds and update orders (Intercom Fin)
- Execute code and analyse data files (ChatGPT Code Interpreter, Claude)
- File documents with government portals (emerging -- not yet mainstream)
- Make API calls to third-party services (all major platforms via function calling)

### What Assembl Should Target

Assembl's agents should evolve from **advisory AI** to **action-taking AI** with a clear human-in-the-loop approval step:

```
User request -> Agent plans actions -> Shows action plan to user -> User approves -> Agent executes
```

Priority actions for Assembl agents:
1. Send emails (draft -> approve -> send)
2. Create calendar events
3. Update CRM records
4. Generate and file documents
5. Post to social media (draft -> approve -> publish)
6. Make API calls to Xero, Stripe, HubSpot
7. File returns with IRD (future -- requires gateway integration)

---

## 4. MCP (Model Context Protocol) Capabilities <a name="mcp-capabilities"></a>

### What is MCP?

MCP is an open protocol (created by Anthropic, now widely adopted) that standardises how AI models connect to external tools and data sources. Think of it as "USB-C for AI" -- a universal connector.

### What Assembl Agents Should Be Able to DO via MCP

Assembl already exposes MCP API at the Business tier (100 calls/day). Here is what best-in-class MCP implementations enable:

| Category | MCP Actions | Priority for Assembl |
|----------|-------------|---------------------|
| **Document** | Read/write Google Docs, generate PDFs, scan uploaded files | HIGH -- already have PDF export |
| **Calendar** | Read/create/update events in Google Calendar, Outlook | HIGH -- HELM and AXIS need this |
| **Email** | Read inbox, draft replies, send with approval | HIGH -- ECHO and FLUX need this |
| **CRM** | Read/write contacts, deals, activities in HubSpot/Salesforce | HIGH -- FLUX needs this |
| **Accounting** | Read transactions, create invoices, reconcile in Xero | HIGH -- LEDGER needs this |
| **Social Media** | Draft and schedule posts via Buffer/Later | MEDIUM -- PRISM and ECHO |
| **Database** | Query Supabase/Postgres directly for analytics | MEDIUM -- Command Centre |
| **File Storage** | Read/write to Google Drive, Dropbox | MEDIUM -- all agents |
| **Communication** | Send Slack messages, Teams notifications | MEDIUM -- all agents |
| **Browser** | Scrape web pages, fill forms, research | LOW -- complex to implement safely |
| **Code Execution** | Run Python/JS in sandbox for data analysis | LOW -- SPARK partially covers this |

### MCP Implementation Recommendations

1. **Standardise tool definitions** for all 42 agents using MCP schema
2. **Build a universal action approval UI** -- every agentic action shows the user what will happen before executing
3. **Create MCP server endpoints** for each integration (Xero, HubSpot, Google Workspace, etc.)
4. **Expose agent capabilities** via MCP so third-party tools can invoke Assembl agents
5. **Implement audit logging** for all MCP actions (already mentioned in Enterprise tier)

---

## 5. Major Platform Comparison <a name="major-platform-comparison"></a>

### Assembl vs Global Platforms -- Feature Matrix

| Feature | ChatGPT | Claude | Gemini | Copilot | Salesforce | HubSpot | Assembl |
|---------|---------|--------|--------|---------|------------|---------|---------|
| Text generation | 10 | 10 | 10 | 9 | 8 | 8 | 8 |
| Document analysis | 9 | 10 | 9 | 8 | 7 | 6 | 7 |
| Code generation | 10 | 10 | 9 | 9 | 5 | 3 | 7 (SPARK) |
| Image generation | 10 | 7 | 9 | 8 | 3 | 5 | 7 |
| Voice interaction | 10 | 6 | 9 | 7 | 5 | 4 | 5 (ElevenLabs) |
| Web browsing | 10 | 8 | 10 | 9 | 4 | 6 | 3 (scan-website only) |
| CRM integration | 4 | 3 | 5 | 8 | 10 | 10 | 4 (planned) |
| Calendar/Email | 5 | 5 | 10 | 10 | 8 | 8 | 3 (planned) |
| Multi-agent | 7 | 7 | 6 | 6 | 9 | 7 | 9 (42 agents) |
| Workflow automation | 7 | 7 | 7 | 9 | 10 | 9 | 5 (symbiotic) |
| Industry depth | 3 | 3 | 3 | 5 | 8 (CRM) | 7 (mkt) | 10 |
| NZ regulation | 1 | 1 | 1 | 1 | 1 | 1 | 10 |
| Personality/memory | 8 | 7 | 7 | 6 | 5 | 5 | 9 |
| Agentic actions | 9 | 9 | 8 | 9 | 10 | 8 | 4 |
| Privacy/data sovereignty | 5 | 8 | 5 | 7 | 8 | 7 | 9 (NZ hosted) |

### Key Insight

Assembl scores highest on NZ regulation, industry depth, multi-agent architecture, and personality/memory. It scores lowest on agentic actions, CRM integration, and calendar/email -- the exact areas where users expect AI to *do things*, not just *say things*.

---

## 6. Assembl Agent Gap Analysis (Top 10) <a name="gap-analysis"></a>

### 1. ECHO (Marketing Content) vs Jasper, HubSpot AI, Copy.ai

**Current Assembl capability: 6/10**
**World-class benchmark: 9/10 (Jasper)**

| Feature | Jasper | HubSpot Breeze | Copy.ai | ECHO Status |
|---------|--------|----------------|---------|-------------|
| Brand voice training | Yes -- analyses existing content and replicates tone | Yes -- learns from CRM | Yes | Partial -- Brand DNA scanner exists |
| Multi-channel campaign gen | Full campaigns from single brief | Yes with CRM data | Limited | No -- generates individual pieces |
| SEO-integrated content | Built-in SEO scoring and keywords | HubSpot SEO tools | Basic | No |
| Content performance tracking | Yes -- tracks what content performs best | Deep analytics | Basic | No |
| Content calendar with auto-scheduling | Yes | Yes -- publishes directly | No | Generates calendars but doesn't publish |
| A/B testing suggestions | Yes | Yes | Yes | No |
| Image generation for content | Yes | Yes | Yes | Yes -- via image generation integration |
| Social media direct publishing | Via integrations | Native | No | No -- Buffer/Later planned |
| Email campaign builder | Yes | Native in HubSpot | Yes | Draft only, no sending |
| Repurposing engine | One piece -> 10 formats | Content remix | Yes | No |

**Features ECHO should add:**
1. **Content repurposing engine** -- turn one blog post into social posts, email, LinkedIn article, video script
2. **SEO scoring** on every piece of content generated
3. **Performance feedback loop** -- learn from which content performs best
4. **Direct social publishing** via Buffer/Later integration (already planned)
5. **A/B variant generation** -- auto-create 2-3 versions of every headline/CTA
6. **Brand voice scoring** -- rate how "on brand" generated content is against the Brand DNA scan
7. **Competitor content analysis** -- scan competitor social feeds and suggest differentiation

**NZ advantages ECHO already has:**
- NZ English and cultural nuance
- Te reo Maori integration awareness (via TIKA agent collaboration)
- NZ market and seasonal awareness (summer is December)
- ASA Advertising Standards Code compliance checking

---

### 2. PRISM (Marketing Director) vs HubSpot, Salesforce Marketing Cloud

**Current Assembl capability: 6/10**
**World-class benchmark: 9/10 (HubSpot Marketing Hub + Breeze)**

| Feature | HubSpot | Salesforce Mktg Cloud | PRISM Status |
|---------|---------|----------------------|--------------|
| Campaign orchestration | Multi-channel automated journeys | Complex journey builder | Generates campaign briefs only |
| Audience segmentation | AI-powered segments from CRM | Einstein segments | No -- no CRM data access |
| Email marketing automation | Full drip campaigns with triggers | Yes | No automation, draft only |
| Landing page builder | Drag-and-drop + AI | Yes | No (SPARK could do this) |
| Social media management | Schedule, publish, monitor | Social Studio | Generates content only |
| Paid ad management | Google/Meta/LinkedIn ads | Yes | No |
| Attribution reporting | Multi-touch attribution | Einstein attribution | No |
| Lead scoring | AI-powered scoring | Einstein scoring | No -- FLUX has basic scoring |
| Marketing ROI tracking | Full pipeline attribution | Yes | No |
| Content strategy AI | Topic clusters, pillar pages | Yes | Generates plans but no tracking |

**Features PRISM should add:**
1. **Campaign performance dashboard** -- connect to Google Analytics, Meta Ads for ROI visibility
2. **Email sequence automation** -- not just drafting, but sending with triggers (when FLUX qualifies a lead -> PRISM sends nurture sequence)
3. **Budget allocation AI** -- recommend spend allocation across channels based on industry benchmarks
4. **Competitor monitoring** -- track competitor social, pricing, and positioning changes
5. **Content-to-pipeline attribution** -- show which content pieces generated leads (requires FLUX integration)
6. **Landing page generation** -- leverage SPARK to build campaign landing pages from PRISM briefs

**NZ advantages PRISM already has:**
- ASA compliance checking for all NZ advertising
- NZ seasonal marketing calendar awareness
- Local market sizing and demographic knowledge
- NZ media landscape knowledge (NZ Herald, Stuff, RNZ, etc.)

---

### 3. ANCHOR (Legal) vs Harvey AI, Clio AI

**Current Assembl capability: 6/10**
**World-class benchmark: 9/10 (Harvey AI)**

| Feature | Harvey AI | Clio AI | ANCHOR Status |
|---------|-----------|---------|---------------|
| Contract review with risk scoring | Clause-by-clause analysis | Basic | Yes -- contract analysis exists |
| Legal research (case law) | Comprehensive search | Via integration | No -- no case law database |
| Citation verification | Validates all citations | No | No |
| Jurisdiction-specific | US, UK, EU focus | US/Canada | NZ-specific -- strong advantage |
| Document comparison (redline) | Yes | Yes | No |
| Due diligence document review | Large-scale batch processing | No | No |
| Client intake automation | No | Yes | No |
| Time tracking integration | No | Yes | No |
| Court filing assistance | Emerging | Yes | No |
| Plain language explanation | Yes | Basic | Yes -- strong ("NZ law in plain English") |

**Features ANCHOR should add:**
1. **NZ case law search** -- integrate NZLII (New Zealand Legal Information Institute) for case law lookup
2. **Document comparison / redline** -- compare contract versions and highlight changes
3. **Legislation change alerts** -- proactively notify users when NZ legislation changes affect them
4. **Court filing checklists** -- step-by-step guides for common NZ court processes (District Court, Disputes Tribunal, Tenancy Tribunal, Employment Relations Authority)
5. **Legal cost estimator** -- estimate likely legal costs for common NZ legal processes
6. **Lawyer finder** -- connect users with NZ Law Society registered lawyers by specialisation and region
7. **Multi-document analysis** -- upload a folder of contracts and get a risk summary across all

**NZ-specific features ANCHOR should emphasise:**
- Family Court process navigation (separation, custody, relationship property)
- Employment Relations Authority processes
- Disputes Tribunal guidance ($30K threshold)
- ACC cover and dispute navigation
- Privacy Act 2020 breach response
- Consumer Guarantees Act claims guidance
- Building disputes (Weathertight Homes)

**NZ advantages ANCHOR already has:**
- Deep NZ legislation knowledge (Contract and Commercial Law Act 2017, Employment Relations Act, Privacy Act 2020)
- Plain English explanations of NZ-specific legal concepts
- Separation/custody guidance with NZ family law context
- Community Law Centre and Citizens Advice Bureau referral awareness

---

### 4. LEDGER (Accounting) vs Xero AI, QuickBooks AI

**Current Assembl capability: 5/10**
**World-class benchmark: 8/10 (Xero AI)**

| Feature | Xero AI | QuickBooks AI | LEDGER Status |
|---------|---------|---------------|---------------|
| Live transaction data | Native | Native | No -- Xero integration "available" not live |
| Auto bank reconciliation | Yes -- AI matching | Yes | No |
| Receipt/invoice scanning | Hubdoc integration | Yes | Generates invoices, doesn't scan inbound |
| Cash flow predictions | 30-day short-term | Yes | Generates forecasts from user-provided data |
| GST return preparation | Full calculation from data | Yes (US tax) | Calculates from manual input |
| Expense categorisation AI | Learns from corrections | Yes | Advises on categories |
| Tax deadline tracking | Yes | Yes | Yes -- IRD filing calendar generation |
| Payroll processing | Xero Payroll | QuickBooks Payroll | No -- AROHA handles HR/payroll advice |
| Multi-entity support | Yes | Limited | No |
| Accountant collaboration | Accountant portal | Yes | No |

**Features LEDGER should add:**
1. **Xero live data connection** -- this is the single highest-impact integration. Let LEDGER read real transaction data
2. **Receipt scanning** -- photograph a receipt, LEDGER extracts vendor, amount, GST, category
3. **Bank statement analysis** -- upload a CSV/PDF bank statement, get categorised expenses and GST summary
4. **IRD direct filing** -- prepare and file GST returns directly (IRD Gateway integration is planned)
5. **Provisional tax scenario modelling** -- show all three methods (standard, estimation, ratio) with real numbers
6. **Accountant export** -- generate a package an accountant can import into their software
7. **Real-time GST position** -- "You've collected $X in GST, you've paid $Y, your next return will be approximately $Z"

**NZ advantages LEDGER already has:**
- Deep NZ tax knowledge (GST, provisional tax, PAYE, FBT)
- IRD filing calendar awareness
- NZ-specific expense categories
- Minimum wage and payroll rate knowledge

---

### 5. FLUX (Sales) vs Salesforce Einstein, Gong AI, Outreach AI

**Current Assembl capability: 5/10**
**World-class benchmark: 10/10 (Salesforce Einstein + Agentforce)**

| Feature | Salesforce Einstein | Gong AI | Outreach AI | FLUX Status |
|---------|--------------------|---------| ------------|-------------|
| Lead scoring AI | Predictive scoring from CRM data | Engagement scoring | Yes | Basic framework, no live data |
| Deal forecasting | AI predictions with confidence | Revenue intelligence | Yes | Templates only |
| Email sequence automation | Yes with send/tracking | No | Yes -- multi-step sequences | Drafts only, no sending |
| Call recording & analysis | Einstein Conversation | Core product | Yes | No |
| Pipeline management | Full CRM pipeline | Deal boards | Pipeline view | Generates pipelines, doesn't manage live data |
| Competitive intelligence | Yes | Win/loss analysis | Competitor mentions | No |
| Meeting scheduling | Calendar integration | No | Yes | No |
| Proposal generation | Via CPQ | No | No | Yes -- strong feature |
| CRM data sync | Native | Via integrations | Native | Planned (HubSpot, Salesforce) |
| Autonomous SDR | Agentforce SDR agent | No | AI SDR | No |

**Features FLUX should add:**
1. **Live CRM connection** -- read and write deals/contacts in HubSpot or Salesforce
2. **Email send with tracking** -- send follow-up sequences and track opens/clicks
3. **Meeting booking link** -- integrate with Calendly or Google Calendar for one-click booking
4. **Call/meeting prep briefs** -- pull prospect data from LinkedIn, Companies Office, NZBN before meetings
5. **Win/loss analysis** -- when deals close or are lost, analyse patterns across the pipeline
6. **Autonomous follow-up** -- after user approves, FLUX sends scheduled follow-up emails
7. **Companies Office integration** -- pull NZ company data (directors, shareholders, financials) for prospect research

**NZ advantages FLUX already has:**
- GETS government tender response frameworks
- NZ business culture awareness for follow-up cadence
- NZ-compliant cold outreach (Unsolicited Electronic Messages Act 2007)

---

### 6. AURA (Hospitality) vs Opera Cloud AI, Mews AI

**Current Assembl capability: 7/10**
**World-class benchmark: 8/10 (Opera Cloud + bespoke lodge systems)**

| Feature | Opera Cloud AI | Mews AI | AURA Status |
|---------|---------------|---------|-------------|
| PMS integration | Native | Native | No -- no PMS connection |
| Dynamic pricing AI | Revenue management built-in | Yes | Advises on yield strategy |
| Guest profile management | Full CRM with stay history | Yes | Generates dossiers but no persistent CRM |
| Channel management | OTA distribution | Multi-channel | No |
| Automated guest messaging | Pre/post-stay sequences | Yes | Generates sequences but doesn't send |
| F&B management | POS integration | Yes | Daily briefings, wine pairing engine |
| Housekeeping optimisation | Real-time room status | Yes | No |
| IoT integration | Room controls, energy | Smart room | Awareness documented, not connected |
| Sustainability reporting | Emerging | Emerging | Strong -- TIA 2050 Blueprint aligned |
| Review management | Basic | TrustYou integration | No |

**Features AURA should add:**
1. **PMS data connection** -- read occupancy, rates, and guest data from Opera/Mews/RMS
2. **OTA listing optimisation** -- rewrite Booking.com/Airbnb descriptions based on performance data
3. **Review response AI** -- draft responses to TripAdvisor, Google, Booking.com reviews
4. **Revenue management dashboard** -- show occupancy vs rate analysis with recommendations
5. **Staff scheduling AI** -- optimise rosters based on predicted occupancy
6. **Guest messaging automation** -- send pre-arrival, mid-stay, and post-stay messages via email/WhatsApp

**NZ advantages AURA already has:**
- NZ liquor licensing knowledge (Sale and Supply of Alcohol Act)
- NZ Food Act compliance
- Michelin Guide NZ awareness
- NZ luxury experiences knowledge (heli-skiing, Great Walks, whale watching)
- Seasonal awareness for southern hemisphere

---

### 7. APEX (Construction) vs Procore AI, Autodesk AI

**Current Assembl capability: 7/10**
**World-class benchmark: 8/10 (Procore + specialised tools)**

| Feature | Procore AI | Autodesk AI | APEX Status |
|---------|-----------|-------------|-------------|
| Project management | Full PM platform | Via BIM 360 | Generates plans, doesn't manage live projects |
| Drawing/plan analysis | RFI from drawings | AI plan analysis | Plan analysis engine documented |
| Safety incident tracking | Full HSWA reporting | Basic | Generates safety plans and toolbox talks |
| Cost estimation | Integrated budgets | Quantity takeoff | Cost estimator in capabilities |
| BIM integration | Yes | Native | Planned (Trimble Connect coming soon) |
| Drone data integration | Integrations available | Yes | Planned (DroneDeploy coming soon) |
| Subcontractor management | Bidding and qualification | No | ITB generation, tender evaluation templates |
| Progress photo AI | Auto-progress tracking | Site Scan | No |
| Quality management | Punchlists, inspections | No | Quality assurance documentation |
| Award/tender writing | No | No | Yes -- unique differentiator |

**Features APEX should add:**
1. **Live project dashboard** -- connect to Procore or similar for real-time project status
2. **Progress photo analysis** -- upload site photos, AI identifies progress vs schedule
3. **Automated WorkSafe notifications** -- when notifiable events occur, generate the notification
4. **Material price tracking** -- monitor NZ material prices (timber, steel, concrete) and flag changes
5. **Weather-based scheduling** -- integrate NZ weather data to flag weather-sensitive activities
6. **Drone survey integration** -- process DroneDeploy data for volume calculations and progress monitoring

**NZ advantages APEX already has:**
- NZ Building Code compliance checking
- NZ-specific H&S legislation (HSWA 2015)
- Construction Contracts Act payment claim generation
- NZS 3910 contract expertise
- NZ construction awards tracking (NAWIC, Registered Master Builders, Property Council)
- Site Safe and CHASNZ alignment

---

### 8. HELM (Family) vs Google Family, Apple Family Sharing

**Current Assembl capability: 7/10**
**World-class benchmark: 7/10 (no clear winner -- this is an underserved market)**

| Feature | Google Family | Apple Family | HELM Status |
|---------|--------------|-------------|-------------|
| Calendar management | Google Calendar sharing | Apple Calendar | Planned integration |
| Newsletter parsing | No | No | Yes -- unique and strong feature |
| Meal planning | No | No | Yes -- NZD grocery lists |
| Budget tracking | No | No | Yes -- NZ-specific categories |
| School coordination | No | No | Yes -- newsletter extraction, school dates |
| Bus tracking | No | No | Yes -- live bus positions |
| Location sharing | Yes | Yes | No |
| Screen time management | Yes | Yes | No |
| Content filters | Yes | Yes | No |
| Shopping lists | Google Keep | Apple Reminders | Within meal planning |
| Vehicle maintenance tracking | No | No | Yes -- WoF, rego, insurance |
| Pet care scheduling | No | No | Yes |

**Key insight:** HELM is in a genuinely underserved market. Google and Apple focus on device management and location sharing. HELM focuses on the actual *administrative burden* of running a family. This is a blue ocean.

**Features HELM should add:**
1. **Google Calendar sync** -- automatically create calendar events from newsletter extraction (highest impact)
2. **Weekly briefing automation** -- the "Week Ahead" briefing sent via email every Sunday
3. **Shopping list integration** -- export meal plan ingredients to a shared shopping list
4. **School portal integration** -- connect to Hero, Linc-Ed, or KAMAR for school notices
5. **WhatsApp family group** -- send reminders and updates to family WhatsApp group
6. **Bill payment reminders** -- track recurring bills with due dates and amounts

**NZ advantages HELM already has:**
- NZ school term dates and calendar awareness
- NZ bus tracking integration
- NZD grocery pricing awareness
- NZ-specific vehicle compliance (WoF, rego)
- Te reo Maori awareness for school context

---

### 9. SIGNAL (IT) vs ServiceNow AI, Freshdesk AI

**Current Assembl capability: 5/10**
**World-class benchmark: 9/10 (ServiceNow AI)**

| Feature | ServiceNow AI | Freshdesk AI | SIGNAL Status |
|---------|--------------|-------------|---------------|
| Ticket management | Full ITSM | Yes | No -- generates policies, doesn't manage tickets |
| Incident response automation | Playbooks with actions | Basic | Generates playbooks, doesn't execute |
| Asset management | Full CMDB | Basic | No |
| Vulnerability scanning | Integration | No | No -- advises on security but doesn't scan |
| Compliance monitoring | GRC module | No | Advises on Privacy Act but doesn't monitor |
| Change management | Full CAB workflows | No | No |
| Knowledge base AI | Yes | Yes | No |
| Chatbot for employees | Virtual Agent | Freddy AI | No |
| Cloud security posture | Via integrations | No | Advises on setup |
| Breach notification | Workflow automation | No | Guides through OPC notification |

**Features SIGNAL should add:**
1. **Security audit automation** -- run automated checks on email security (SPF, DKIM, DMARC) for the user's domain
2. **Privacy Act breach wizard** -- guided workflow that ends with a ready-to-submit OPC notification
3. **Incident response automation** -- when a breach is detected, auto-generate containment checklist, notification letters, and OPC report
4. **NZ threat intelligence** -- CERT NZ alert monitoring and contextualised briefings
5. **Cloud security checklist** -- assess Azure/AWS/Google Cloud configuration against NZISM
6. **Employee security training** -- generate phishing simulation content and awareness training

**NZ advantages SIGNAL already has:**
- NZ Privacy Act 2020 breach notification expertise
- OPC (Office of the Privacy Commissioner) process knowledge
- NZISM (NZ Information Security Manual) guidance
- CERT NZ alignment

---

### 10. FORGE (Automotive) vs DealerSocket AI, CDK AI

**Current Assembl capability: 5/10**
**World-class benchmark: 8/10 (CDK Global AI)**

| Feature | DealerSocket/CDK | FORGE Status |
|---------|-----------------|--------------|
| DMS integration | Full dealer management | No -- standalone |
| Inventory management | Full with pricing AI | No |
| F&I compliance | US-focused | Yes -- CCCFA compliance (NZ-specific advantage) |
| Lead management | Full CRM for dealers | No -- generates templates |
| Trade-in valuation AI | Market-based pricing | No |
| Service scheduling | Full service department | No |
| OEM integration | Factory connections | No |
| Digital retailing | Online purchase flow | No |
| TradeMe integration | No (US platforms) | Yes -- listing generation (NZ advantage) |
| EV transition tools | Emerging | Yes -- EV vs ICE cost analyser |

**Features FORGE should add:**
1. **NZTA API integration** -- pull vehicle details from registration number (make, model, year, WoF/rego status)
2. **Trade-in valuation AI** -- use TradeMe sold data and market comparisons for pricing guidance
3. **Service reminder automation** -- send WoF/service reminders to customers
4. **Inventory listing AI** -- generate optimised TradeMe and Facebook Marketplace listings with photos
5. **PPSR search integration** -- check vehicle financing/security interest status
6. **Clean Car Discount calculator** -- real-time fee/rebate calculation from the Waka Kotahi schedule

**NZ advantages FORGE already has:**
- CCCFA (Credit Contracts and Consumer Finance Act) compliance
- Motor Vehicle Sales Act disclosure generation
- Clean Car Standard knowledge
- TradeMe listing generation
- NZ-specific WoF and certification knowledge

---

## 7. Voice AI Benchmarks <a name="voice-ai-benchmarks"></a>

### Current Industry Standard (2026)

| Metric | World-Class | Assembl (ElevenLabs) |
|--------|-------------|---------------------|
| Latency (response time) | <500ms (ChatGPT Voice, Gemini Live) | ~800ms-1.2s (ElevenLabs Conversational AI) |
| Voice naturalness | Near-human (GPT-4o voice, ElevenLabs) | High quality -- ElevenLabs is top-tier |
| Language support | 40+ languages real-time | English + limited multilingual |
| Speaker identification | Yes (Nuance Dragon) | No |
| Emotion detection | Yes (GPT-4o, Hume AI) | No |
| Custom voice cloning | Yes (ElevenLabs, PlayHT) | Yes -- available through ElevenLabs |
| Domain vocabulary | Medical (Nuance DAX), Legal (Harvey) | NZ industry terms in system prompts |
| Ambient listening | Yes (Nuance DAX for clinical) | No |
| Phone integration | Yes (Bland AI, Vapi, Retell) | No -- web-based only |
| Interruption handling | Natural (GPT-4o) | Good (ElevenLabs) |

### Assembl Voice Status

Assembl has ElevenLabs Conversational AI integrated for 7 agents (AURA, FLUX, FORGE, PRISM, HELM, ECHO, NEXUS). This is a strong foundation.

### Voice Features to Add

1. **Phone number integration** -- let businesses assign a phone number that rings through to their Assembl agent (via Twilio or Vapi)
2. **NZ accent options** -- offer Kiwi English voice options (ElevenLabs supports custom voices)
3. **Te reo Maori pronunciation** -- ensure correct pronunciation of NZ place names and Maori terms
4. **Call recording and transcription** -- for FLUX sales calls and AURA guest calls
5. **Voicemail-to-action** -- transcribe voicemails and have the relevant agent draft a response
6. **Meeting transcription** -- transcribe Zoom/Teams meetings and extract action items (for AXIS project management)

---

## 8. Document Processing Benchmarks <a name="document-processing-benchmarks"></a>

### Current Best in Class

| Capability | Best Platform | Benchmark | Assembl Status |
|-----------|--------------|-----------|----------------|
| PDF text extraction | Claude (200K+ context) | 99%+ accuracy on structured docs | Good -- via AI model processing |
| Table extraction | Amazon Textract, Google Document AI | 95%+ table accuracy | Not specialised |
| Handwriting OCR | Google Document AI | 90%+ accuracy | No |
| Invoice data extraction | Xero Hubdoc, Dext | 95%+ field extraction | Not built yet |
| Contract clause extraction | Harvey AI, Luminance | Identifies 50+ clause types | ANCHOR does basic clause flagging |
| Multi-document comparison | Harvey AI, Kira | Side-by-side with changes | No |
| Image-to-text (OCR) | Google Vision AI, Claude | 98%+ accuracy | Via AI model (good) |
| Plan/drawing analysis | Autodesk AI, Bluebeam | Room detection, measurements | APEX has plan analysis engine |
| Bulk document processing | Docusign Insight, Luminance | 1000s of docs in minutes | No -- one document at a time |
| Structured data extraction | Amazon Textract, Azure Form Recognizer | Forms, receipts, IDs | Limited |

### Document Processing Recommendations

1. **Receipt/invoice scanner** -- LEDGER should extract vendor, date, amount, GST from photographed receipts
2. **Bulk contract review** -- ANCHOR should process multiple contracts and produce a risk summary
3. **Newsletter parser improvement** -- HELM's newsletter extraction should handle more school platforms (Hero, Linc-Ed)
4. **Building plan analyser** -- APEX should extract room dimensions, door/window counts from uploaded plans
5. **Vehicle document scanner** -- FORGE should read registration certificates, WoF certificates, and vehicle inspections
6. **Immigration document checker** -- COMPASS should verify visa documents are complete before submission

---

## 9. Assembl's Existing Advantages <a name="assembl-advantages"></a>

These are competitive advantages that global platforms will struggle to replicate:

### 1. NZ Regulation Depth (Unmatched)
No global AI platform has the depth of NZ legislation knowledge that Assembl's agents possess. The system prompts reference specific Acts, sections, and 2026 amendments. This is a genuine moat.

### 2. 42-Agent Architecture (Unique Breadth)
No competitor offers this breadth of industry-specific agents. Salesforce has CRM agents. HubSpot has marketing agents. Assembl covers hospitality, construction, maritime, customs, agriculture, family life, and more.

### 3. Personality Engine (Superior)
The personality.ts engine (mood detection, seasonal awareness, NZ time greetings, milestone tracking, anniversary messages) creates an emotional connection that generic platforms lack. "Morena" at 8am NZ time is a detail that matters.

### 4. Self-Healing Workflow Engine
The self-healing.ts engine with exponential backoff, automatic fix attempts, and user-friendly error messages is enterprise-grade infrastructure.

### 5. Symbiotic Multi-Agent Workflows
The concept of agents collaborating (FLUX qualifies a lead -> PRISM creates content -> ECHO sends it) is ahead of most platforms, which operate as single agents.

### 6. NZ Cultural Competence
Te Tiriti awareness via TIKA agent, te reo Maori integration, tikanga guidance, iwi engagement processes -- no global platform offers this.

### 7. Price Accessibility
At $89-599 NZD/month, Assembl is dramatically cheaper than enterprise platforms (Salesforce $150+ USD/user/month, HubSpot $800+ USD/month for Marketing Hub Professional).

### 8. Data Sovereignty
NZ-hosted, Supabase-backed infrastructure gives Assembl a privacy and data sovereignty advantage for NZ businesses concerned about offshore data processing.

---

## 10. Prioritised Recommendations <a name="recommendations"></a>

### Tier 1: Critical (Next 3 Months) -- High Impact, High Feasibility

| # | Recommendation | Impact | Effort | Agents Affected |
|---|---------------|--------|--------|-----------------|
| 1 | **Activate Google Calendar integration** -- HELM, AXIS, AURA, FLUX can read/create events | 10 | Medium | HELM, AXIS, AURA, FLUX |
| 2 | **Activate Gmail send** -- draft -> approve -> send flow for ECHO and FLUX | 10 | Medium | ECHO, FLUX |
| 3 | **Activate Xero connection** -- LEDGER reads real transaction data | 10 | Medium | LEDGER |
| 4 | **Build universal action approval UI** -- "FLUX wants to send this email. Approve?" | 9 | Medium | All agents |
| 5 | **Receipt/invoice scanning for LEDGER** -- photograph receipts, extract data | 8 | Low | LEDGER |
| 6 | **Content repurposing for ECHO** -- one piece -> multiple formats | 8 | Low | ECHO, PRISM |
| 7 | **Review response AI for AURA** -- draft TripAdvisor/Google review responses | 7 | Low | AURA, NOVA |

### Tier 2: Important (3-6 Months) -- High Impact, Medium Feasibility

| # | Recommendation | Impact | Effort | Agents Affected |
|---|---------------|--------|--------|-----------------|
| 8 | **HubSpot/Salesforce CRM sync for FLUX** -- read/write deals and contacts | 9 | High | FLUX |
| 9 | **Phone number integration for voice** -- business phone number rings Assembl agent | 9 | High | All voice agents |
| 10 | **NZTA API for FORGE** -- pull vehicle data from registration | 8 | Medium | FORGE |
| 11 | **Companies Office API for FLUX** -- prospect research from NZ company data | 8 | Medium | FLUX, ANCHOR |
| 12 | **Social media publishing via Buffer** -- ECHO publishes approved content | 8 | Medium | ECHO, PRISM |
| 13 | **Newsletter-to-Calendar for HELM** -- auto-create events from school newsletters | 8 | Medium | HELM |
| 14 | **NZ case law search for ANCHOR** -- NZLII integration | 7 | Medium | ANCHOR |
| 15 | **Bank statement analysis for LEDGER** -- upload CSV, get categorised expenses | 7 | Medium | LEDGER |
| 16 | **Bulk contract review for ANCHOR** -- process multiple documents at once | 7 | Medium | ANCHOR |

### Tier 3: Strategic (6-12 Months) -- Transformative, Higher Effort

| # | Recommendation | Impact | Effort | Agents Affected |
|---|---------------|--------|--------|-----------------|
| 17 | **IRD Gateway integration for LEDGER** -- file GST returns directly | 10 | Very High | LEDGER |
| 18 | **Autonomous SDR for FLUX** -- prospect, qualify, and book meetings autonomously | 9 | Very High | FLUX |
| 19 | **PMS integration for AURA** -- connect to Opera/Mews/RMS for live hotel data | 8 | High | AURA |
| 20 | **Procore integration for APEX** -- live construction project data | 8 | High | APEX |
| 21 | **WhatsApp Business integration** -- HELM reminders, AURA guest messaging | 8 | High | HELM, AURA, HAVEN |
| 22 | **MCP server publication** -- let third-party tools invoke Assembl agents | 7 | High | All agents |
| 23 | **Meeting transcription for AXIS** -- Zoom/Teams recording analysis | 7 | High | AXIS, FLUX |
| 24 | **AI security audit for SIGNAL** -- automated SPF/DKIM/DMARC checking | 7 | Medium | SIGNAL |

### Tier 4: Competitive Moat (12+ Months) -- Long-term Differentiation

| # | Recommendation | Impact | Effort | Agents Affected |
|---|---------------|--------|--------|-----------------|
| 25 | **NZ-specific voice with te reo pronunciation** -- Kiwi English voice model | 7 | High | All voice agents |
| 26 | **School portal integration for HELM** -- Hero, Linc-Ed, KAMAR | 6 | High | HELM |
| 27 | **IoT sensor integration** -- building/property/farm sensors | 6 | Very High | HAVEN, APEX, AURA, TERRA |
| 28 | **Industry benchmark databases** -- NZ-specific performance data by sector | 6 | High | All sector agents |
| 29 | **White-label agent marketplace** -- let NZ businesses build and sell custom agents | 5 | Very High | Platform |
| 30 | **Drone survey processing for APEX** -- DroneDeploy integration | 5 | High | APEX |

---

## Appendix A: Full Agent Roster with Capability Ratings

| # | Agent | Designation | Sector | Current Level | Benchmark | Priority Gap |
|---|-------|------------|--------|---------------|-----------|-------------|
| 0 | ECHO | ASM-000 | Hero/Content | 6/10 | 9/10 | Content repurposing, direct publishing |
| 1 | AURA | ASM-001 | Hospitality | 7/10 | 8/10 | PMS integration, review response |
| 2 | NOVA | ASM-002 | Tourism | 6/10 | 8/10 | OTA optimisation, booking integration |
| 3 | APEX | ASM-003 | Construction | 7/10 | 8/10 | Live project data, drone integration |
| 4 | TERRA | ASM-004 | Agriculture | 6/10 | 7/10 | Farm management system integration |
| 5 | PULSE | ASM-005 | Retail | 5/10 | 8/10 | Shopify/WooCommerce live data |
| 6 | FORGE | ASM-006 | Automotive | 5/10 | 8/10 | NZTA API, trade-in valuation |
| 7 | ARC | ASM-007 | Architecture | 6/10 | 8/10 | BIM integration, council portal data |
| 8 | FLUX | ASM-008 | Sales | 5/10 | 10/10 | CRM sync, email automation, SDR |
| 9 | NEXUS | ASM-009 | Customs | 7/10 | 8/10 | TSW direct lodgement, container tracking |
| 10 | AXIS | ASM-010 | Project Mgmt | 6/10 | 9/10 | Live project tracking, meeting transcription |
| 11 | PRISM | ASM-011 | Marketing | 6/10 | 9/10 | Campaign automation, analytics |
| 12 | VITAE | ASM-012 | Health | 6/10 | 7/10 | Practice management integration |
| 13 | HELM | ASM-013 | Family/Admin | 7/10 | 7/10 | Calendar sync, school portal |
| 14 | LEDGER | ASM-014 | Accounting | 5/10 | 8/10 | Xero live data, receipt scanning |
| 15 | ANCHOR | ASM-015 | Legal | 6/10 | 9/10 | Case law search, document comparison |
| 16 | SIGNAL | ASM-016 | IT/Cyber | 5/10 | 9/10 | Security scanning, incident automation |
| 17 | GROVE | ASM-017 | Education | 6/10 | 7/10 | NZQA portal integration |
| 18 | HAVEN | ASM-018 | Property | 6/10 | 8/10 | Property management integration |
| 19 | COMPASS | ASM-019 | Immigration | 6/10 | 7/10 | INZ portal integration |
| 20 | KINDLE | ASM-020 | Nonprofit | 6/10 | 7/10 | Grant tracking, Charities Services integration |
| 21 | MARINER | ASM-021 | Maritime | 7/10 | 7/10 | Live marine weather already integrated |
| 22 | CURRENT | ASM-022 | Energy | 6/10 | 7/10 | Smart meter data integration |
| 23 | MUSE | ASM-023 | Style | 5/10 | 6/10 | Retailer API integration |
| 24 | VOYAGE | ASM-024 | Travel | 5/10 | 8/10 | Booking integration, flight search |
| 25 | THRIVE | ASM-025 | Wellbeing | 5/10 | 6/10 | Health app integration |
| 26 | ATLAS | ASM-026 | Fitness | 5/10 | 7/10 | Wearable data integration |
| 27 | NOURISH | ASM-027 | Nutrition | 5/10 | 6/10 | Supermarket API (Countdown/NW) |
| 28 | GLOW | ASM-028 | Beauty | 5/10 | 6/10 | Product recommendation engine |
| 29 | SOCIAL | ASM-029 | Events | 5/10 | 7/10 | Event booking integration |
| 30 | TIKA | ASM-030 | Te Tiriti | 7/10 | 7/10 | Unique -- no global competitor |
| 31 | PUNAHA | ASM-031 | Govt/Public | 6/10 | 8/10 | GETS integration |
| 32 | AWA | ASM-032 | Environment | 6/10 | 7/10 | Council portal integration |
| 33 | MANAAKI | ASM-033 | Welfare | 6/10 | 7/10 | MSD portal integration |
| 34 | KURA | ASM-034 | Education Nav | 6/10 | 7/10 | School finder integration |
| 35 | ORA | ASM-035 | Public Health | 6/10 | 7/10 | Health NZ integration |
| 36 | WHARE | ASM-036 | Housing | 6/10 | 7/10 | Kainga Ora portal integration |
| 37 | HAUMARU | ASM-037 | Emergency | 6/10 | 7/10 | NEMA alert integration |
| 38 | AROHA | ASM-038 | HR | 6/10 | 8/10 | Payroll system integration |
| 39 | VAULT | ASM-039 | Finance | 5/10 | 8/10 | Rate comparison API |
| 40 | SHIELD | ASM-040 | Insurance | 5/10 | 7/10 | Policy comparison engine |
| 41 | MINT | ASM-041 | Banking | 5/10 | 7/10 | Payment gateway integration |
| 42 | SPARK | ASM-042 | App Builder | 7/10 | 8/10 | Deployment and hosting |
| 43 | TURF | ASM-043 | Sports | 6/10 | 6/10 | Club management integration |

---

## Appendix B: The Agentic Maturity Model for Assembl

### Level 1: Advisor (Current State for Most Agents)
- Answers questions with domain expertise
- Generates documents and templates
- Provides NZ-specific compliance guidance
- **70% of Assembl agents are here**

### Level 2: Drafter (Current State for Top Agents)
- Creates ready-to-use documents (not just templates)
- Generates multi-step plans
- Produces branded outputs (PDF export)
- **25% of Assembl agents are here (APEX, AURA, NEXUS, ECHO, HELM)**

### Level 3: Actor (Target State -- Next 6 Months)
- Sends emails after approval
- Creates calendar events
- Updates CRM records
- Posts to social media after approval
- Files documents to cloud storage
- **5% of Assembl agents are approaching this (limited to weather, image gen)**

### Level 4: Autonomous (Target State -- 12 Months)
- Monitors for triggers and acts proactively
- Manages multi-step workflows end-to-end
- Handles routine tasks without approval (with audit trail)
- Learns from outcomes to improve
- **0% of Assembl agents are here yet**

### Level 5: Orchestrator (Target State -- 18+ Months)
- Coordinates multiple agents on complex goals
- Delegates sub-tasks to specialist agents
- Manages exceptions and escalations
- Optimises its own workflows based on results
- **This is the vision for Assembl's symbiotic architecture**

---

## Appendix C: Competitive Positioning Summary

### Where Assembl Wins Today
1. NZ regulation and legislation depth
2. Industry-specific agent breadth (42 agents across 30 sectors)
3. Cultural competence (te reo, tikanga, Tiriti)
4. NZ market pricing ($89-599 NZD vs enterprise pricing)
5. Personality and emotional intelligence (mood detection, seasonal awareness)
6. Data sovereignty (NZ-hosted)
7. Family/lifestyle agents (HELM is genuinely unique)
8. Niche industries (maritime, customs brokerage, agriculture)

### Where Assembl Must Improve
1. Agentic actions (taking real actions, not just generating text)
2. Live data integration (connecting to real business systems)
3. Workflow automation (multi-step chains that execute, not just plan)
4. Voice capabilities (phone integration, NZ accent)
5. Document processing sophistication (bulk processing, table extraction)
6. Analytics and performance tracking (showing ROI of AI usage)
7. Real-time web data (search, competitor monitoring, market intelligence)

### The Strategic Opportunity

Assembl is positioned to be the *only* platform that combines:
- Global-quality AI capabilities
- NZ-native regulation and cultural intelligence
- Affordable pricing for SMEs
- Genuinely agentic multi-agent workflows

No global platform will invest in NZ-specific legislation for 30 industries. No NZ platform has 42 AI agents. The gap to close is making these agents *do things* -- not just *know things*.

**The single most impactful move: activate the integrations already listed as "available" in the Integration Hub (Google Calendar, Gmail, Xero, HubSpot). Every agent that can take an action becomes 3x more valuable than one that only advises.**

---

*Research compiled March 2026. Web search was unavailable during compilation; recommend validating specific competitor feature claims against current product pages before using in public-facing materials.*
