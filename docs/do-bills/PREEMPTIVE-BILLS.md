# DO Bills: preemptive layer and the bank-connection path

Status: review build, 14 October 2026. Extends the [financial foundation](FINANCIAL-FOUNDATION.md). Not a live bank connection; nothing switches, cancels, pays or contacts a provider.

## What Kate asked for

Bills should be preemptive. DO should know what a person pays, who their provider is for power, broadband and the rest, go hunting for better deals, and suggest who to switch to. It should read the bank account securely through Redbark or an equivalent, rather than waiting for a CSV. This applies to every DO, not only Bills: a DO should know and suggest before it is asked.

The master handover of 14 October ranks Assembl-owned browser shopping as the immediate delivery priority and lists Bills as the strongest next low-risk expansion (Appendix J). This slice is that expansion, delivered on Kate's direct instruction. It does not touch the shopping, extension or School workstreams.

## What this slice delivers on `/do/bills`

**00 · KNOW — What you pay.** Every recurring-payment candidate that looks like a household service becomes a service card: category, provider, monthly equivalent, rhythm, last payment and any rise above the earlier median. A yearly total is shown for services with a known rhythm; irregular ones are counted separately and never converted into a monthly figure.

- Provider names come from a public directory of New Zealand statement wording (`apps/do/finance/services.ts`). Unmatched merchants fall back to category words and are labelled **provider not matched**. Detection is a suggestion to confirm against the bill.
- **Hunt for a better deal** fetches dated public offers for that category from assembl's price book (`/api/do/bills/offers`, read-only, cacheable, no account) and lists cheaper advertised plans by possible yearly saving. Each row shows its source host, verification date, a link to the source, and a stale flag when the verification is older than 45 days. The household's own provider is excluded. The person sets their own "worth my time" monthly threshold.
- **Research with sources** opens the existing sourced comparison with only the category and a rounded monthly figure prefilled. No merchant text, account or address travels.
- **Ask DO to watch this** hands a reviewed request to Personal DO through the Ask DO entry: watch this service, check monthly whether a public offer would cost less over a year including fees, prepare a note with sources, do not switch or contact anyone. The person sees the words first and sets the actual wake-up schedule in Personal DO.

Gate E acceptance from the master handover is respected: each comparison is reproducible from dated evidence, fees and eligibility notes are visible, a stale offer is flagged before anyone acts, reminders are not payments, and no switch is claimed. A generic advertised saving is worded as a possible saving before fees, never a promised household saving.

### Not done, by design

- No switching, cancelling, signing or contacting a provider. The strongest action remains an editable, reviewed enquiry draft.
- No personalised electricity quote. Tariffs depend on the supply address; the card says a quote is still needed.
- No mobile, gas or council-rates offers: the price book holds broadband, electricity, insurance, streaming and subscriptions. Mobile still has sourced research.
- The watch request is not a scheduled job yet. It becomes one only when the person sets the wake-up in Personal DO, under the existing wake-up consent and the `DO_PERSONAL_WAKEUPS_ENABLED` gate.

## Round two, 14 October: email, energy, solar, fuel and the always-looking worker

Kate's second ask: read bills that arrive by email, flag unusually high energy use, talk about solar, add a fuel watcher, and make Bills "always looking" for better providers.

**Bills from email.** `apps/do/finance/mail-bills.ts` reads provider, total, due date, billing period and kWh out of bill text, deterministically, with account numbers, references and links stripped from the evidence lines. On `/do/bills`, "Add a bill from an email" takes pasted text in the page (no upload, no model) and prefills the checked-bill form; the person still adds the reference and ticks that they checked the figures. The reader accepts the same shape the Personal DO mail read returns (`MailSource`), so when that read is verified (it currently fails closed by design, see `docs/DO-PERSONAL-MAIL-READ.md`), the same reader runs on arriving bills. That wiring belongs to the mail workstream and is not claimed here.

**Unusually high energy.** `energyUsageCheck` compares the latest period's daily kWh against the median of earlier periods, needs three periods, flags a 25% rise, and names the heating season so a winter rise is judged fairly. Payment rises were already flagged on the service cards.

**Solar.** `apps/do/finance/solar.ts` is a versioned estimate (`SOLAR_ASSUMPTIONS_VERSION`): usage from bills or from spend, system size to cover 60% of use within 3 to 8 kW, regional yield, installed cost range, saving range from self-use and export, payback range, and whether it is worth a quote. The electricity card gains "Consider solar?" with the assumptions printed. "Doing it cost-effectively" lists bank green loans, Gen Less and EECA guidance, three like-for-like quotes, and retailer export plans, each with its public source and no promise. This is an outlook, not a design, a quote or financial advice; a site check decides.

**Fuel watch.** `/do/fuel` reads MBIE's weekly national price through the existing `nz-fuel-prices` edge function (`/api/do/fuel`, labelled live or fallback with its date), lets the person record pump prices they saw, and answers fill up, top up or wait from their own tank, weekly use and target price (`lib/do/fuel/watch.ts`). Nearly empty always means fill. "Ask DO to watch fuel" hands a daily request through Ask DO; it never buys. Station-level prices are not read automatically: the crowd-sourced apps have no public feed and retailer sites differ. That adapter is the next honest step, labelled when it exists. The vehicle template links here.

**Always looking.** The wake-up worker (`apps/do/personal/service.ts`) now recognises a watched bill (the request "Ask DO to watch this" writes) and, on every run, compares the saved monthly figure against the dated public price book, writing cheaper offers with source, verified date and stale flag (`apps/do/personal/bills-watch.ts`). No model. The price book is refreshed by the `refresh-provider-prices` edge function on its own schedule; the worker reads it. Live only when `DO_PERSONAL_WAKEUPS_ENABLED` and `DO_PERSONAL_WORKER_MODE=worksheet` are set, which they are not yet in production.

Smart enough to know what saves money means, here: a dated comparison on total yearly cost, fees visible, the person's own threshold, their own provider excluded, electricity always needing an address quote, and nothing promised until a provider confirms it.

## The bank-connection path

The Redbark read adapter (`apps/do/finance/redbark.ts`) exists and is tested against provider schemas: owner-bound grants, fixed GET endpoints, bounded pagination, explicit truncation. What is missing is everything that turns it into a connection a person can make and unmake.

| Step | Owner | What it establishes |
|---|---|---|
| 1. Redbark commercial account for assembl, with confirmation that per-user connections are permitted and how a user authorises their bank through Redbark (hosted consent link or OAuth). | Kate | Whether Redbark can be the first live source. Its documentation is not reachable from the cloud build environment, so this has to be read and confirmed from Kate's side. |
| 2. Per-user connection flow: start, hosted authorisation, callback with verified state, account selection, disconnect, revocation. | Build | A person connects their own bank; assembl never holds internet-banking passwords. |
| 3. Encrypted credential custody: the token reference lives in a server-only table, never in the browser, with owner isolation and expiry. Proposal: [`bank-connection-proposal.sql`](bank-connection-proposal.sql). | Build, Kate applies | Owner-bound read grants the adapter already demands. |
| 4. Connected snapshot mode on `/do/bills`: the same What-you-pay, hunt and watch layer runs on live transactions, labelled **connected · read-only**, with the fetch time shown. | Build | Preemptive bills without a CSV. |
| 5. Flag `DO_BILLS_BANK_CONNECTION_ENABLED`, a private pilot on Kate's own account, then wider release. | Kate | Live evidence before any claim. |

Equivalent providers (Akahu is the other New Zealand open-finance aggregator) would use the same custody table and connection flow with a different adapter. The `provider` column keeps that open. Do not work around an unavailable banking API by collecting credentials; E03 in the master handover forbids it.

## Why this layer is deterministic

Detection, monthly equivalents, comparison and the stale rule are plain code with tests. A model is used only where it already was: reading a bill image and the Google-grounded research. That keeps every card reproducible from the records on the page and the dated price book.

## Proof

- `apps/do/finance/services.test.ts`: provider detection, category fallback, monthly equivalents, irregular timing, yearly totals, comparison ranking and thresholds, own-provider and currency exclusions, stale flag, research prefill and the Ask DO words.
- `app/api/do/bills/offers/route.test.ts`: category filter, dated sources, dropped rows that fail the public contract, rejected categories, honest empty book.
- `app/do/bills/BillsWorkspace.test.ts`: the section, labels and links render; no switch, pay or send control exists.
- `scripts/review-do-bills-preemptive.cjs`: desktop and 375px browser proof against fictional offers and fuel fixtures: cards, hunt ranking, stale flag, threshold, no overflow, research prefill, solar outlook, email reading and prefill, fuel answer, recorded pump price, watch handoff, no errors.
- `apps/do/finance/mail-bills.test.ts`, `solar.test.ts`, `lib/do/fuel/watch.test.ts`, `app/api/do/fuel/route.test.ts`, `apps/do/personal/bills-watch.test.ts` and the bills-watch run in `service.test.ts`.

## Direction for every DO

Preemptive means: know the person's current state from permitted records, notice what changed or could be better, prepare the next step with sources, and ask. It never means acting first. Bills is the pattern: **know → hunt → prepare → ask → receipt**. Shop, Household, Travel and Fitness should follow the same shape on their own records.
