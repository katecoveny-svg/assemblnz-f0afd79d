# RECOMMENDED CLAUDE CODE SKILLS FOR ASSEMBL

> Skills, scheduled tasks, and agent capabilities to help Kate run Assembl more efficiently
> Last updated: 27 March 2026

---

## OVERVIEW

This document recommends 20 additional capabilities organised into three categories. Each recommendation specifies whether it should be built as a **Claude Code skill** (on-demand command), a **scheduled task** (runs automatically), or **built into an agent** (part of the Assembl platform itself).

### Priority Key

| Priority | Meaning | Timeline |
|----------|---------|----------|
| **BUILD NOW** | High impact, quick to build, needed immediately | This week |
| **BUILD NEXT MONTH** | Important but can wait until core ops are stable | April 2026 |
| **BUILD LATER** | Nice to have, build when capacity allows | May 2026+ |

---

## SECTION 1: BUSINESS OPERATIONS SKILLS

| # | Skill | Description | Assembl Impact | Type | Priority |
|---|-------|-------------|----------------|------|----------|
| 1 | **Invoice Generator** | Generate branded Assembl invoices for enterprise clients with line items, GST calculations, and payment terms | Enterprise clients expect professional invoices. Automates what Kate currently does manually for custom/enterprise deals outside Stripe. | Claude Code skill | BUILD NOW |
| 2 | **Proposal Generator** | Create sales proposals and pitch decks for partnership meetings, investor conversations, and enterprise prospects | Kate has multiple partnership targets (Xero, MYOB, Vodafone, BNZ). Each needs a tailored proposal. This skill pulls from brand guidelines and agent data to produce consistent decks. | Claude Code skill | BUILD NOW |
| 3 | **Contract Generator** | Draft service agreements, NDAs, partnership agreements, and SaaS terms using NZ legal templates | Every partnership, reseller deal, and enterprise client needs a contract. Templates save legal costs and accelerate deal closing. | Claude Code skill | BUILD NOW |
| 4 | **Meeting Notes** | Transcribe and summarise meetings, extract action items, assign owners, and generate follow-up emails | Kate runs meetings with partners, investors, and prospects. Automated notes ensure nothing falls through the cracks and follow-ups happen. | Claude Code skill | BUILD NEXT MONTH |
| 5 | **Competitor Monitor** | Weekly scan of competitor pricing, features, product launches, and news across the NZ AI/business tool market | Assembl operates in a fast-moving space. Weekly intelligence on what Xero AI, MYOB, and other NZ business tools are doing keeps pricing and positioning sharp. | Scheduled task (weekly) | BUILD NOW |
| 6 | **Customer Onboarding** | Generate welcome packs, setup guides, training materials, and first-week email sequences for new subscribers | First impressions drive retention. Automated onboarding materials for each pricing tier (Free, Pro, Business, Enterprise) reduce churn in the critical first week. | Claude Code skill | BUILD NEXT MONTH |
| 7 | **Weekly Report** | Auto-generate a weekly business report covering signups, revenue, agent usage stats, support tickets, and churn | Kate needs a single-page view of business health each week. Pulls from Supabase analytics, Stripe revenue data, and support metrics. | Scheduled task (weekly, Mondays 8am) | BUILD NOW |
| 8 | **SEO Auditor** | Scan assembl.co.nz for technical SEO issues, content gaps, broken links, and generate prioritised fix recommendations | Organic search is a key growth channel. Regular audits catch issues before they hurt rankings. Particularly important after the recent landing page rebuild. | Claude Code skill | BUILD NEXT MONTH |
| 9 | **Testimonial Collector** | Draft personalised follow-up emails asking active customers for testimonials, Google reviews, and case study participation | Social proof is critical for conversion. Identifies customers with high usage and auto-drafts personalised asks. | Claude Code skill | BUILD LATER |
| 10 | **Pricing Optimiser** | Analyse usage patterns, conversion rates, and churn data to recommend pricing tier adjustments | The current $89/$299/$599 tiers need validation. This skill analyses which agents drive the most value and whether pricing captures that value correctly. | Claude Code skill | BUILD LATER |

---

### Detailed Build Specifications

#### 1. Invoice Generator
```
Skill name: /invoice
Inputs:    Client name, services, amounts, payment terms
Outputs:   Branded PDF invoice with Assembl logo, GST calculation, bank details
Data:      Pulls from brand-guidelines/, company details
Notes:     Include IRD-compliant tax invoice format for NZ GST
```

#### 2. Proposal Generator
```
Skill name: /proposal
Inputs:    Prospect name, industry, meeting context, partnership type
Outputs:   Markdown proposal + can be sent to Canva for deck design
Data:      Pulls from agents.ts (relevant agents), pricing, brand guidelines
Notes:     Templates for: Enterprise sales, Channel partnerships, Investor pitch
```

#### 3. Contract Generator
```
Skill name: /contract
Inputs:    Contract type (SaaS agreement, NDA, partnership, reseller)
Outputs:   Markdown contract with NZ law references, ready for legal review
Data:      NZ Contract and Commercial Law Act references
Notes:     Always include disclaimer that contracts should be reviewed by a lawyer
```

#### 5. Competitor Monitor
```
Task name: competitor-weekly-scan
Schedule:  Fridays at 2pm (0 14 * * 5)
Outputs:   Markdown report in marketing/competitive-intel/
Targets:   Xero AI features, MYOB AI, Hnry, Digit, local NZ AI startups
Notes:     Web search for pricing changes, new features, press releases, funding
```

#### 7. Weekly Report
```
Task name: weekly-business-report
Schedule:  Mondays at 8am (0 8 * * 1)
Outputs:   Markdown report in marketing/weekly-reports/
Sections:  Revenue, signups, churn, agent usage, support, upcoming deadlines
Notes:     Could query Supabase + Stripe APIs if configured
```

---

## SECTION 2: AGENT MANAGEMENT SKILLS

| # | Skill | Description | Assembl Impact | Type | Priority |
|---|-------|-------------|----------------|------|----------|
| 11 | **Agent Tester** | Systematically test each agent's responses for accuracy, NZ compliance, hallucination, and quality against a test suite | 43 agents is a lot to QA manually. Automated testing catches broken responses, outdated legislation references, and hallucinated information before customers do. | Claude Code skill | BUILD NOW |
| 12 | **Legislation Monitor** | Weekly scan for NZ law changes (parliamentary bills, regulations, gazette notices) that affect agent knowledge bases | Agents like ANCHOR, LEDGER, AROHA, and HAVEN give legal/compliance advice. If legislation changes and agents still give old advice, it is a liability risk. This is the most important scheduled task for Assembl. | Scheduled task (weekly) | BUILD NOW |
| 13 | **Agent Performance Report** | Analyse which agents are most/least used, conversation quality scores, user satisfaction, and common failure modes | Knowing that LEDGER gets 40% of conversations while MARINER gets 1% informs product decisions: where to invest in prompt quality, which agents to promote, and what to deprecate. | Scheduled task (monthly) | BUILD NEXT MONTH |
| 14 | **Knowledge Base Builder** | Compile agent expertise, FAQs, and common conversations into searchable documentation for the help centre | Reduces support load by giving customers self-serve answers. Also useful for training new team members on what each agent can do. | Claude Code skill | BUILD NEXT MONTH |
| 15 | **System Prompt Optimiser** | Analyse agent conversation logs, identify common failures or weak responses, and suggest system prompt improvements | Continuous improvement of the 43 agent prompts is essential. This skill finds patterns in bad responses and generates specific prompt fixes. | Claude Code skill | BUILD LATER |

---

### Detailed Build Specifications

#### 11. Agent Tester
```
Skill name: /test-agents
Inputs:    Agent name (or "all"), test category (compliance, accuracy, tone)
Outputs:   Test results report with pass/fail per agent, specific failures highlighted
Tests:     - Does LEDGER cite current GST rate correctly?
           - Does ANCHOR reference current Employment Relations Act?
           - Does AROHA know the current minimum wage?
           - Does each agent stay in character and not hallucinate?
Notes:     Maintain test cases in a YAML file, run on-demand or weekly
```

#### 12. Legislation Monitor
```
Task name: legislation-monitor
Schedule:  Wednesdays at 9am (0 9 * * 3)
Sources:   NZ Parliament bills tracker, Gazette, IRD updates, MBIE updates
Outputs:   Alert report + draft update prompts for affected agents
Mapping:   - Employment law changes -> AROHA
           - Tax law changes -> LEDGER
           - Building code changes -> APEX, ARC
           - Immigration changes -> COMPASS
           - Privacy changes -> ANCHOR, SIGNAL
           - Health regulations -> VITAE, ORA
Notes:     This is CRITICAL for maintaining trust in Assembl's advice
```

#### 13. Agent Performance Report
```
Task name: agent-performance-monthly
Schedule:  1st of each month at 8am (0 8 1 * *)
Outputs:   Report in marketing/agent-reports/
Metrics:   - Conversations per agent (from Supabase)
           - Average conversation length
           - User return rate per agent
           - Common first messages (what people actually ask)
Notes:     Requires Supabase analytics queries
```

---

## SECTION 3: MARKETING & CONTENT SKILLS

*Note: Kate already has the `social-media-manager` (ECHO daily content) scheduled task running weekdays at 9am.*

| # | Skill | Description | Assembl Impact | Type | Priority |
|---|-------|-------------|----------------|------|----------|
| 16 | **Blog Post Generator** | Write SEO-optimised blog posts about NZ business compliance topics, agent features, and industry insights | Content marketing drives organic traffic. Each blog post targets keywords like "NZ GST calculator", "healthy homes compliance", "NZ employment agreement template" that Assembl agents can answer. | Claude Code skill | BUILD NOW |
| 17 | **Case Study Generator** | Turn customer success stories into formatted case studies with problem/solution/result structure | Case studies are the highest-converting content for B2B SaaS. Each industry vertical needs at least one. | Claude Code skill | BUILD NEXT MONTH |
| 18 | **Newsletter Generator** | Generate weekly email newsletter content for Brevo with product updates, tips, featured agents, and NZ business news | Email nurtures leads and retains subscribers. A weekly newsletter keeps Assembl top-of-mind. Currently manual; should be a scheduled task that drafts content for Kate to review. | Scheduled task (weekly, Thursdays 2pm) | BUILD NEXT MONTH |
| 19 | **Webinar Planner** | Plan and script webinar content including slide outlines, talking points, Q&A prep, and registration page copy | Webinars are a proven lead generation channel for SaaS. Topics like "How to automate your NZ tax compliance with AI" attract the right audience. | Claude Code skill | BUILD LATER |
| 20 | **LinkedIn Thought Leadership** | Generate daily LinkedIn posts in Kate's voice about AI in NZ business, founder journey, and industry insights | LinkedIn is the primary B2B channel in NZ. Daily presence builds Kate's personal brand which drives Assembl awareness. Different from ECHO's social content which is brand-focused. | Scheduled task (daily, weekdays 7am) | BUILD NOW |

---

### Detailed Build Specifications

#### 16. Blog Post Generator
```
Skill name: /blog
Inputs:    Topic, target keyword, target agent, word count
Outputs:   SEO-optimised markdown blog post with meta description, headings, internal links
Strategy:  Each post maps to an Assembl agent's expertise area
           "NZ GST Guide 2026" -> links to LEDGER
           "Healthy Homes Compliance Checklist" -> links to HAVEN
           "Employment Agreement Template NZ" -> links to AROHA
Notes:     Include schema markup suggestions for each post
```

#### 18. Newsletter Generator
```
Task name: newsletter-weekly-draft
Schedule:  Thursdays at 2pm (0 14 * * 4)
Outputs:   Draft newsletter content in marketing/newsletters/
Sections:  - What's new in Assembl this week
           - Featured agent spotlight
           - NZ business compliance tip of the week
           - Upcoming NZ business deadlines
Notes:     Kate reviews and sends via Brevo on Friday
```

#### 20. LinkedIn Thought Leadership
```
Task name: linkedin-daily-post
Schedule:  Weekdays at 7am (0 7 * * 1-5)
Outputs:   Draft post for Kate's review
Topics:    - AI transformation stories for NZ business
           - Founder journey and lessons learned
           - NZ industry insights (rotating through sectors)
           - Agent feature highlights
           - NZ regulatory/compliance updates
Notes:     Different voice from ECHO brand posts; this is Kate's personal brand
```

---

## IMPLEMENTATION ROADMAP

### Week 1 (BUILD NOW) -- 7 skills

| Skill | Type | Est. Build Time |
|-------|------|-----------------|
| Invoice Generator | Claude Code skill | 2 hours |
| Proposal Generator | Claude Code skill | 3 hours |
| Contract Generator | Claude Code skill | 3 hours |
| Competitor Monitor | Scheduled task | 1 hour |
| Weekly Report | Scheduled task | 2 hours |
| Agent Tester | Claude Code skill | 4 hours |
| Legislation Monitor | Scheduled task | 2 hours |
| Blog Post Generator | Claude Code skill | 2 hours |
| LinkedIn Thought Leadership | Scheduled task | 1 hour |

**Total Week 1: ~20 hours**

### Month 2 (BUILD NEXT MONTH) -- 6 skills

| Skill | Type | Est. Build Time |
|-------|------|-----------------|
| Meeting Notes | Claude Code skill | 2 hours |
| Customer Onboarding | Claude Code skill | 3 hours |
| SEO Auditor | Claude Code skill | 3 hours |
| Agent Performance Report | Scheduled task | 2 hours |
| Knowledge Base Builder | Claude Code skill | 4 hours |
| Case Study Generator | Claude Code skill | 2 hours |
| Newsletter Generator | Scheduled task | 1 hour |

**Total Month 2: ~17 hours**

### Month 3+ (BUILD LATER) -- 4 skills

| Skill | Type | Est. Build Time |
|-------|------|-----------------|
| Testimonial Collector | Claude Code skill | 1 hour |
| Pricing Optimiser | Claude Code skill | 3 hours |
| System Prompt Optimiser | Claude Code skill | 4 hours |
| Webinar Planner | Claude Code skill | 2 hours |

**Total Month 3: ~10 hours**

---

## SKILL TYPE SUMMARY

| Type | Count | Skills |
|------|-------|--------|
| **Claude Code skill** (on-demand `/command`) | 13 | Invoice, Proposal, Contract, Meeting Notes, Customer Onboarding, SEO Auditor, Testimonial Collector, Pricing Optimiser, Agent Tester, Knowledge Base Builder, System Prompt Optimiser, Blog Post, Case Study, Webinar Planner |
| **Scheduled task** (auto-runs on schedule) | 7 | Competitor Monitor, Weekly Report, Legislation Monitor, Agent Performance Report, Newsletter Generator, LinkedIn Thought Leadership, ECHO daily content (already built) |
| **Built into agent** | 0 | None recommended at this stage -- all capabilities are better as skills or tasks that Kate controls directly |

---

## WHAT KATE ALREADY HAS

For reference, these capabilities are already running:

| Capability | Type | Schedule | Status |
|------------|------|----------|--------|
| ECHO Daily Content | Scheduled task | Weekdays 9:03am | Running |
| Social Media Manager | Scheduled task | Weekdays 9:03am | Running (same as above) |
| 43 AI Agents | Built into platform | Always on | Running |
| Brand Guidelines | Reference docs | N/A | Complete |
| Marketing Materials | Reference docs | N/A | Complete |

---

*Last updated: 27 March 2026*
*Document: RECOMMENDED-SKILLS.md*
