# COPY.md — assembl homepage copy manifest

**This file is the single source of truth for every customer-facing string on
the homepage.** Code renders strings from here (via
`lib/copy/homepage.ts`, which mirrors this file). No copy is authored inline.

The simplified public story below was approved by Kate on 17 July 2026. Keep
the homepage focused on one promise, two actions and one short path to value.

Fixed forever: the tagline **"Mahi that earns its proof."** — never touched.
NZ English spelling. Te reo Māori keeps its macrons.

---

## Fixed brand lines

- Wordmark: `assembl`
- Tagline: `Mahi that earns its proof. Built in Aotearoa.`
- Genome name: `Business Genome`

---

## Global chrome

### Top navigation
- `how it works`
- `pricing`
- `about`
- `sign in`
- `try the demo`

### Footer
- Wordmark: `assembl`
- Tagline line: `Mahi that earns its proof. Built in Aotearoa.`
- Links: `Live demo` · `Start a pilot` · `Pricing` · `About` · `Contact` · `Privacy`

---

## Hero (`components/assembl-hero/AssemblHero.tsx`)

### Signal rail
- `Try it without an account`
- `Built in Aotearoa`
- `You approve every action`

### Eyebrow
- `Agents for the work behind your business`

### Headline (two lines)
- `Your business, understood.`
- `Your admin, prepared.`

### Lede
- `assembl creates one source of truth for your business, then gives you agents that prepare useful work for your approval.`

### Actions
- `Try the live demo`
- `Start a pilot`

### Proof line
- `One source of truth`
- `Drafts ready to review`
- `Nothing sends without you`

---

## Hours-back calculator

- Eyebrow: `A two-minute reality check`
- Heading: `How many hours could you get back?`
- Body: `Use your own numbers. We will show a plain planning estimate — no form, no phone call and no inflated promise.`
- Inputs: `People doing repeat admin` · `Admin hours each week, per person` · `How much of that work is repetitive?`
- Result label: `Your mahi-saved estimate`
- Result: `hours back each week` · `hours a year` · `working days`
- Assumption: `This estimate assumes half of your repetitive admin time could be recovered. Planning estimate only.`
- Actions: `Try the live demo` · `Share result`

---

## Three-step explanation

- Heading: `One workflow. Three clear steps.`
- `We understand it.` — capture the facts, rules and tools.
- `Agents prepare it.` — useful drafts arrive.
- `Your team approves it.` — important actions wait for a person.

## Pilot close

- Eyebrow: `Founding pilot · NZ$1,500 + GST`
- Heading: `Start with one workflow.`
- Body: `In ten working days, we build and test one useful workflow around the way your business already works.`

The older Business Genome, orbit and conversational-build copy below remains as
component reference. It is no longer rendered on the simplified homepage.

### Sculpture captions (`components/assembl-hero/ParticleCanvas.tsx`)
- `your living business genome`
- `collective knowledge`
- `coordinated movement`
- `patterns become visible`
- `work begins to flow`
- Place label: `Tāmaki Makaurau · Aotearoa`

---

## Business Genome section (`components/business-genome/BusinessGenomeSection.tsx`)

### Intro
- Eyebrow: `The system becomes visible`
- Heading: `Not another stack of apps. One living map of the business.`
- Body: `Every website answer, booking rule, customer record and agent action reads the same structured Business Genome. Change the source once; each connected surface can prepare the right update for review.`

### Left rail
- Brand: `assembl` / `Business Genome`
- Systems: `Business overview` · `People` · `Customers` · `Knowledge` · `Finance` · `Risk` · `Activity`
- Status: `connected now`

### Map panel
- Header: `Fictional Auckland service business` / `A living view of today`
- Nodes (label · value): `Customers` `3 waiting` · `Knowledge` `14 facts` · `Operations` `6 flows` · `Finance` `2 drafts` · `People` `4 roles` · `Approvals` `1 ready`
- Place: `Tāmaki Makaurau · Auckland`
- Metrics: `3` `enquiries to review` · `1` `improvement prepared` · `0` `unapproved sends`

### Intelligence panel
- Title: `assembl is interpreting` / `today`
- Items (title · body · action):
  - `Customer response` · `Three enquiries are ready for review.` · `Open the customer desk`
  - `Operating signal` · `Friday afternoon has the longest booking gap.` · `Review a draft offer`
  - `Knowledge risk` · `Two common answers only exist in one person’s inbox.` · `Capture the source`
- Approval note: `A person stays in control.` / `Sources, assumptions and approval state travel with the work.`

### Intelligence in action
- Eyebrow: `Intelligence in action`
- Heading: `Context becomes useful work.`
- Scenarios (number · title · body · label):
  - `01` · `An enquiry arrives` · `The customer response agent finds the right service facts, prepares a reply and leaves it on the desk for approval.` · `Open the customer desk`
  - `02` · `A booking becomes a customer` · `The confirmed request appears in the CRM with its source, next action and the original Business Genome context.` · `See a working Living Site`
  - `03` · `Commercial work stays connected` · `Proposal and invoice drafts use the approved customer, service and price facts — with reviewer and status visible.` · `Open the operating dashboard`
  - `04` · `The business learns` · `Repeated customer questions become a suggested knowledge update, ready for a person to review once.` · `Explore the live genome`

### Agents
- Eyebrow: `Agents born from context`
- Heading: `Specialists inside the system — not products on a shelf.`
- Body: `Each capability knows its role, source knowledge, connected tools, permissions, required approvals and success criteria.`
- Core: `Business Genome` / `shared context`
- Agents: `Customer response` · `Operations coordinator` · `Financial monitor` · `Knowledge keeper` · `Growth planner`
- Agent status: `connected · reviewed`

### Founding pilot
- Eyebrow: `Founding pilot sprint`
- Heading: `Build the first working version of your business.`
- Body: `A focused installation for founding pilots: Business Genome, live dashboard, one priority workflow and the proof needed to decide what comes next.`
- Price card: `Founding pilot` / `NZ$1,500` / `+ GST · one focused sprint`
- Includes: `Business Genome workshop` · `Working Living Site dashboard` · `One connected workflow`
- CTA: `Apply for a founding pilot`

---

## Planned components — strings reserved, not yet built

These are the exact strings for the orbit (Prompt 2) and conversational build
scroll (Prompt 3). They are locked here now so that, when built, the code
reads them from the manifest and they are never rewritten.

### Business Genome orbit — node labels (exact, lowercase, in order)
`pricing` · `customers` · `knowledge` · `services` · `voice` · `website` · `crm` · `marketing` · `bookings`

Centre node: `Business Genome`

### Conversational build scroll — script (verbatim, in order)
1. `Kia ora.`  _(DECIDED 2026-07-14 by Kate: the public site opens with `Kia ora.`)_
2. `Let's build your business.`
3. `What do you do?`
4. `Tell me about it.`
5. `Drop anything you've got.`
6. Chips, one per step, in order: `Website` · `PDFs` · `Emails` · `Price list` · `Logo` · `Facebook` · `Google Drive`
7. `Done.`
