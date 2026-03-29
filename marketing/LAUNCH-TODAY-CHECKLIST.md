# ASSEMBL LAUNCH DAY CHECKLIST — 25 March 2026

## PRICING REVIEW & RECOMMENDATION

### Current Pricing (Already in Stripe)
| Tier | Monthly | What's Included |
|------|---------|-----------------|
| Free | $0 | 3 messages per agent, all 42 agents |
| HELM | $29/mo | Family agent, 200 messages |
| Starter | $89/mo | 1 agent, 100 messages |
| Pro | $299/mo | 3 agents + SPARK, 500 messages |
| Business | $599/mo | All 42 agents, 2,000 messages |
| Industry Suite | $1,499/mo | All + custom agents, 5,000 messages |
| Enterprise | Custom | Unlimited everything |

### Recommendation: KEEP CURRENT PRICING
Your pricing is well-structured and competitive. Here's why:
- **$29 HELM** is a genius entry point for families — low barrier, high engagement
- **$89 Starter** is accessible for sole traders
- **$299 Pro** is the sweet spot for SMEs — most popular tag is correct
- **$599 Business** is justified now with 42 world-class agents
- **$1,499 Industry Suite** is enterprise-adjacent
- **15% annual discount** (already implemented) creates commitment

**One change to consider**: The AgentGrid.tsx hardcoded pricing shows 20% annual discount but pricing.ts calculates 15%. Recommend aligning to 20% — it's a stronger selling point. This is a Lovable prompt to fix.

### Stripe Status: ALREADY CONFIGURED
- Stripe checkout sessions working via `create-checkout` edge function
- 6 Stripe price IDs configured in `stripeTiers.ts`
- Payment links in `pricing.ts` (buy.stripe.com links)
- Customer portal for subscription management
- Webhook for subscription status checking

**No new Stripe setup needed** — payments are live and working.

---

## LAUNCH TODAY — STEP BY STEP

### HOUR 1: Final Checks (Do Now)
- [ ] Wait for Lovable queue to finish (agent upgrades processing)
- [ ] Click Publish > Update in Lovable
- [ ] Visit www.assembl.co.nz — verify homepage loads
- [ ] Click through to /pricing — verify all tiers show
- [ ] Click "Start with Pro" — verify Stripe checkout opens
- [ ] Test /chat/construction — ask APEX a question
- [ ] Test /about — verify business plan page loads
- [ ] Test on mobile (phone browser)

### HOUR 2: Social Media Launch
- [ ] Set up @AssemblNZ profiles (use files in /marketing/social-profiles/)
  - LinkedIn company page (SOCIAL-PROFILES.md has copy)
  - Instagram @assembl.nz
  - X/Twitter @AssemblNZ
  - Facebook page
- [ ] Post launch content (use LAUNCH-POSTS.md — copy-paste ready)
  - LinkedIn: Long-form founder announcement
  - Instagram: 10-slide carousel
  - X/Twitter: 5-tweet thread
  - Facebook: Launch announcement
- [ ] Update LinkedIn personal profile to show Founder, Assembl

### HOUR 3: PR & Outreach
- [ ] Send press release to NZ media (PR-KIT.md has templates)
  - NZ Herald Business desk
  - Stuff Business
  - NBR
  - interest.co.nz
  - Idealog
  - TechBlog.nz
- [ ] Post in NZ business Facebook groups
- [ ] Post in NZ tech Slack/Discord communities
- [ ] Email your existing network (EMAIL-SEQUENCES.md welcome sequence)

### HOUR 4: Paid Ads (Optional — $50-100 to start)
- [ ] Set up Facebook Business Manager (if not done)
- [ ] Create first Meta ad campaign (AD-COPY-LIBRARY.md has 10 variants)
  - Campaign: Conversions
  - Audience: NZ, 25-55, Small Business Owners, interested in Xero/MYOB/Accounting
  - Budget: $20/day
  - Use Ad Variant #1: "You're paying for 6 different platforms..."
- [ ] Set up Google Ads (optional)
  - Brand campaign: "Assembl NZ" keywords
  - Budget: $10/day

### ONGOING: Daily Operations
- ECHO daily content runs automatically at 9am weekdays
- Monitor Stripe dashboard for signups
- Respond to contact form submissions (check Supabase + Formspree)
- Check assembl.co.nz/admin/dashboard for user activity

---

## QUICK WINS FOR WEEK 1
1. Get 5 people to try the free tier and give feedback
2. Post daily on LinkedIn (use the 28-day calendar)
3. Ask 3 NZ business owners for testimonial quotes
4. Join NZ Business Network group on Facebook
5. DM 10 construction companies about APEX
6. DM 10 hospitality businesses about AURA
7. Contact Hospitality NZ and Master Builders for partnership conversations

---

## METRICS TO TRACK
| Metric | Day 1 Target | Week 1 Target | Month 1 Target |
|--------|-------------|---------------|----------------|
| Website visitors | 100 | 500 | 2,000 |
| Free signups | 10 | 50 | 200 |
| Paid conversions | 1 | 5 | 25 |
| Social followers | 50 | 200 | 500 |
| Agent conversations | 50 | 300 | 1,500 |
