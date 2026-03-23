

## Pricing Page Branding Refresh

The pricing page is mostly well-structured but has several elements that don't match the premium glassmorphism branding used across the rest of the site.

### What needs fixing

1. **FAQ section uses flat card styling** -- `bg-card border-border` instead of the glassmorphism treatment (rgba(14,14,26,0.7) + backdrop-blur + border-white/[0.06])
2. **Section dividers are plain** -- basic `border-t border-border` lines instead of subtle gradient glow lines like the premium cards use
3. **Bottom CTA section looks generic** -- needs glass card wrapper and neon glow treatment on the "Browse agents" button
4. **Missing font-jakarta on body text** -- several `<p>` and `<span>` elements lack explicit font-jakarta class
5. **HELM section needs visual distinction** -- add a subtle purple-tinted glass background or a top-edge glow to differentiate it from the business plans section
6. **Trust signals bar is barely visible** -- needs slightly more contrast and a glass container

### Files to modify

**`src/pages/PricingPage.tsx`** (single file, all changes):
- FAQ accordion items: replace `rounded-xl border border-border bg-card` with glassmorphism inline styles matching the plan cards
- Section `border-t border-border` dividers: replace with gradient glow `<div>` elements (green → cyan → pink, 1px height, partial opacity)
- Bottom CTA: wrap in a glassmorphism card with neon border glow
- Add `font-jakarta` to body/label text elements that are missing it
- HELM section: add a subtle purple top-edge gradient glow line
- Trust signals: wrap in a subtle glass container with slightly increased text opacity

### No new files or dependencies needed

All changes are CSS/className updates within the existing PricingPage component, using the same glassmorphism patterns already established in the plan cards above.

---

# Assembl Soul Architecture — Implementation Plan

## Status Key
- ⬜ Not started | 🔨 In progress | ✅ Done

---

## SECTION 1: Humanist Engine — PRIORITY 1
- ✅ `src/engine/personality.ts` — UserContext, time greetings, seasonal context, mood detection, milestones
- ✅ Agent loading messages (per-agent personality strings)
- ✅ Time-aware greetings in chat header (Mōrena, Good afternoon, etc.)
- ⬜ Smart empty states (contextual first-visit suggestions per agent)
- ⬜ Milestone tracking & celebration toasts (confetti in agent colour)
- ⬜ Anniversary acknowledgment system

## SECTION 2: Document Intelligence — PRIORITY 2
- ⬜ Upload interface (paperclip/camera icon next to chat input)
- ⬜ Agent-specific document extraction prompts (LEDGER receipts, ANCHOR contracts, HAVEN property docs, etc.)
- ⬜ Multi-page PDF handling (up to 20 pages)
- ⬜ Document Intelligence UI card (structured extraction results)
- ⬜ Scan-line animation during processing

## SECTION 3: Compliance Autopilot — PRIORITY 3
- ⬜ Database tables: compliance_deadlines, user_compliance_tasks, legislation_changes
- ⬜ Seed NZ compliance deadlines (tax, employment, property, building, environmental)
- ⬜ Seed recent legislation changes
- ⬜ Proactive alert edge function (daily 6am NZST via pg_cron)
- ⬜ Agent-specific proactive prompts (LEDGER, AROHA, HAVEN)
- ⬜ Legislation change notification system

## SECTION 4: Self-Healing & Workflow Visualiser
- ⬜ `src/engine/self-healing.ts` — retry/healing logic
- ⬜ `src/components/WorkflowVisualiser.tsx` — animated node graph
- ⬜ Inline workflow visualiser in chat when symbiotic chain triggers
- ⬜ Full-page workflow view at /workflows

## SECTION 5: Voice Agents (Future-ready)
- ⬜ voice_agent_config table
- ⬜ voice_call_log table
- ⬜ Voice settings UI (waitlist mode)
- ⬜ Coming Soon badge

## SECTION 6: Financial Forecasting
- ⬜ LEDGER forecasting prompt additions
- ⬜ Expense anomaly detection prompts
- ⬜ Cash flow timeline component
- ⬜ Scenario modelling UI

## SECTION 7: Advanced SPARK
- ⬜ Inline app generation (HTML widgets in chat)
- ⬜ SPARK template library with pre-built templates
- ⬜ Template grid UI in SPARK

## SECTION 8: Command Centre Upgrade — PRIORITY 4
- ⬜ Compliance score ring (green/amber/red)
- ⬜ "Needs Your Attention" section with severity borders
- ⬜ Milestones display
- ⬜ 90-day compliance calendar (horizontal scrollable)
- ⬜ Real-time refresh via Supabase subscription
- ⬜ Mobile responsive polish (2×2 KPI grid, swipeable calendar)
