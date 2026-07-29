# Agentic AI and personalisation in grocery — evidence base for a Woolworths NZ concept

**Compiled** 30 July 2026 · for assembl · New Zealand English throughout.

**How to read this.** Every figure carries a publisher and a URL. Each finding is tagged:

- **[PUBLISHED]** — the company's own newsroom, investor material or annual report.
- **[PRESS]** — reported by press or analysts, not the company's own words.
- **[ACADEMIC]** — peer-reviewed or university-published.
- **[VENDOR CLAIM]** — a technology supplier's marketing about a retailer. Treat as unverified.
- **[INFERENCE]** — my own reasoning or arithmetic, not anyone's published claim.

Where I could not source a number, it is not in this document. See **What I could not verify** at the end.

---

## The single most important finding

Woolworths Group's own media release announcing its agentic shopping assistant — Olive, Snap & Shop and Smart Baskets, 29 June 2026 — **does not mention Everyday Rewards, loyalty, member pricing or Boosts anywhere in it.** I checked the full release text. **[PUBLISHED / INFERENCE]**

Source: [Woolworths Group newsroom, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html)

Press coverage *expects* loyalty integration — Mediaweek wrote that "the assistant is expected to surface specials and apply relevant rewards-member discounts as items are selected" ([Mediaweek, 13 January 2026](https://www.mediaweek.com.au/woolworths-and-google-team-up-for-ai-shopping-agent/)) — but that is a press expectation, not a Woolworths commitment. Marketing-Interactive's write-up of the same announcement contains no loyalty integration claim at all ([Marketing-Interactive, 15 January 2026](https://www.marketing-interactive.com/woolworths-moves-olive-chatbot-toward-agentic-ai-with-google-cloud-partnership)).

**Why this matters for the pitch:** the agentic shopping layer and the loyalty layer are being built as separate things. The fusion of the two is genuinely unclaimed territory, and it is the whole of assembl's proposal. It is also *not* a platform rebuild — it is a join.

And in New Zealand, none of it has shipped yet. See **NZ and Australia** below.

---

## What to open with

Each fact below is sourced in full later in the document. These are the ones that will do the work in the room.

1. **Woolworths' agentic release never mentions Everyday Rewards.** The agent and the loyalty programme are separate builds. ([Woolworths Group, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html))
2. **It is Australia only, and Woolworths NZ could not name a date.** "Woolworths New Zealand could not say when it would be launched here, but said it would likely come after Australian customers gained access." ([RNZ, 20 January 2026](https://www.rnz.co.nz/news/business/584510/how-ai-might-help-you-do-your-supermarket-shopping))
3. **Amazon removed the technology that eliminated the wait**, because customers wanted "a running tally" and to "know how much money they saved while shopping". Frictionlessness lost to legibility, at Amazon's expense. ([Amazon](https://www.aboutamazon.com/news/retail/amazon-just-walk-out-dash-cart-grocery-shopping-checkout-stores))
4. **Woolworths' own trolley screen already runs on an Everyday Rewards scan** — 35 Australian stores, over 70% repeat users — and shows a running total and nothing else. ([Woolworths Group, 10 July 2025](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2025/woolworths-scan-go-trolley-rolls-out-to-more-new-stores-across-a.html))
5. **Foodstuffs just re-enrolled the entire country.** Club+ launched 15 June 2026, Clubcard closed 26 July 2026 — four days ago — promising personalisation it has not built. ([Foodstuffs, 18 May 2026](https://www.foodstuffs-si.co.nz/news-room/2026/new-world-pak-nsave-four-square-launch-club---a-smarter-way-to-save-on-groceries))
6. **Operational transparency is experimentally proven**, not a hunch: a field experiment measured a **22.2% increase in customer-reported quality and a 19.2% reduction in throughput times**. ([Buell, Kim & Tsay, *Management Science*](https://pubsonline.informs.org/doi/10.1287/mnsc.2015.2411))

**And the two things that will actually decide the meeting:**

**Woolworths has already published a personalisation outcome for Boosts.** In F24: members accessing Boost offers were **up 9%** year on year, and **"members who boost reaching their $10 value back more than five times faster than those who simply scan their card."** That is Woolworths quantifying its own mechanic — and it has not refreshed the figure since. ([Woolworths Group Annual Report 2024](https://www.woolworthsgroup.com.au/content/dam/wwg/investors/reports/f24/f24/Woolworths%20Group%202024%20Annual%20Report.pdf))

**And the risk climate is severe — this is the frame, not the footnote.** On **7 July 2026** the NZ Commerce Commission said it had identified **"over 50 different types of supplier payments that account for around $6 billion paid by suppliers to the major supermarkets annually"**, explicitly including **"promotional support"**, and has closed its Wholesale Supply Inquiry to prioritise **compliance and enforcement**. Separately, Woolworths' own annual report discloses that the **NZCC filed proceedings against Woolworths New Zealand on 5 May 2025 for allegedly breaching section 10 of the Fair Trading Act 1986** over the price consumers were to pay for grocery products, alongside ACCC proceedings and a class action in Australia over discount pricing representations.

Sources: [Commerce Commission, 7 July 2026](https://comcom.govt.nz/news-and-media/news-and-events/2026/supermarket-charges-on-suppliers-harming-grocery-competition/) · [Woolworths Group Annual Report 2025, contingent liabilities](https://www.woolworthsgroup.com.au/content/dam/wwg/sustainability/reports/f25/Woolworths%20Group%20Annual%20Report%202025%20.pdf)

**[INFERENCE]** Read those two together and the pitch writes itself. Woolworths is being prosecuted over how prices were represented to customers, its supplier promotional payments are under active enforcement scrutiny, and it is about to hand basket-building to an AI. **A verifiable, labelled receipt for every suggestion is not a nice-to-have in that room — it is the risk control that lets the agent ship at all.** Lead with this, not with the technology.

**And the one number nobody has:** no retailer anywhere — Ocado, Instacart, Kroger, Albertsons, Woolworths — has published a substitution-accuracy figure. That is the unclaimed, measurable outcome.

---

## What is actually shipping

### Woolworths Group Australia — Olive, Snap & Shop, Smart Baskets

**[PUBLISHED]** On 29 June 2026 Woolworths Group announced three customer-facing digital tools, powered by Google Cloud's Gemini Enterprise, rolling out to all Woolworths app customers in pick up and delivery mode **during July 2026, Australia only**:

- **Olive** — upgraded from a customer-service chatbot to a shopping assistant that creates weekly meal plans from stated preferences, and identifies specials and "smart swaps" to help families stick to a budget.
- **Snap & Shop** — "Customers can now take a photo of a handwritten list or a recipe from a magazine, and the app instantly turns it into a shopping list."
- **Smart Baskets** — "the app now predicts recurring weekly items and suggests 'smart additions' based on a customer's past shopping habits."

Amitabh Mall, Managing Director of eComX and Chief Digital & Analytics Officer, in the release: *"We've designed the new Olive to make sure technology remains a helper and not a decider. While Olive can do the heavy lifting to suggest products and build a basket, customers will remain in complete control, reviewing and approving all items before checkout."*

Source: [Woolworths Group newsroom, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html)

**Design note worth stealing:** "a helper and not a decider", and an explicit human approval gate before checkout. Woolworths has publicly committed to the review step. That step is a *surface* — and it is where a loyalty and disclosure layer can live without asking anyone to rebuild anything.

### The Olive announcement and the Google partnership

**[PRESS]** Olive first launched in **November 2018**, built by WooliesX. The agentic upgrade was announced **12 January 2026** at the US National Retail Federation trade show, using Google Cloud's newly launched **Gemini Enterprise for Customer Experience**. Amanda Bardwell, Group MD and CEO, said Woolworths is *"evolving our digital shopping assistant Olive into an intuitive partner that won't just answer questions, but actually anticipates your needs."* Faysal Kalal, Director of Group Customer, spoke to the multimodal experience and faster, more predictive baskets.

Source: [iTnews, 12 January 2026](https://www.itnews.com.au/news/woolworths-to-incorporate-agentic-ai-into-its-olive-chatbot-622907)

**[PUBLISHED — Google]** Google Cloud's own agentic-commerce announcement of 12 January 2026 names **Kroger, Lowe's, Papa John's and Woolworths** as retailers using Gemini Enterprise for CX. Papa John's is described specifically as using an enhanced food-ordering agent for natural-language ordering across mobile, kiosks and in-car systems "with intelligent upselling and real-time menu synchronization". Other named builds: The Home Depot's "Magic Apron" project-planning agent, Jo Malone London's AI Scent Advisor (Estée Lauder), Gap Inc., Authentic Brands Group.

Source: [Google Cloud, 12 January 2026](https://cloud.google.com/transform/a-new-era-agentic-commerce-retail-ai)

**Caution:** the Kroger, Lowe's and Woolworths descriptions in that post are generic ("deliver elevated experiences for their customers") with no capability detail and no results. A claimed "up to 60% higher ROAS" for Reebok creative in the same post is a **[VENDOR CLAIM]** published by Google about a customer, not a verified retailer outcome — do not use it.

### Woolworths' staff-facing agent, and its governance mechanism

**[PRESS]** In the week before 28 April 2026, Woolworths deployed an agentic version of Olive to **200,000+ staff**, first demonstrated at Google Cloud Next '26. Venky Erode Sivasubramaniyam, Technology Director of Digital Experiences, said **"roughly 80 percent of our groceries are repeat purchases"** and described wanting recommendations to be "more proactive".

Most useful detail: Woolworths built eight proprietary **"Agentic Judges"** — automated vetting systems that check the agent's responses. Named examples include a "number cruncher" that validates maths and pricing, a "product detective" for compliance, and a "goal judge" that verifies the task was actually completed.

Source: [iTnews, 28 April 2026](https://www.itnews.com.au/news/woolworths-gives-agentic-powered-olive-chatbot-to-its-200000-staff-625339)

**Why this matters:** Woolworths has already accepted, and built, the principle that an agent needs automated boundaries checking its work. A pilot proposing verifiable receipts and checks is speaking their own language, not importing a foreign idea. No usage or outcome figures were published.

### Coles' position

**[PRESS]** An unnamed Coles spokesperson responded to the Woolworths announcement: *"We were an early adopter in areas like computer vision, machine learning, optimisation and now generative AI"* and *"Coles has been using AI for more than a decade."* Coles is reported to use AI for rostering, order replenishment and tailoring ranges to specific stores, has deployed ChatGPT Enterprise across parts of its corporate workforce, and is **exploring** AI for personalised shopping, meal planning and checkout tools.

Source: [Yahoo News Australia, 28 January 2026](https://au.news.yahoo.com/coles-responds-after-woolworths-announces-major-change-to-shopping-experience-we-were-an-early-adopter-202537754.html)

**[INFERENCE]** Coles is at "exploring" on personalised shopping while Woolworths has shipped. That lead is real but narrow, and it is an Australian lead — it does not exist in New Zealand yet.

### Woolworths' own stated position on paid placement inside the basket

**[PRESS]** Asked directly how Olive chooses products, a Woolworths spokesperson said: **"At this stage, we have no plans to place items in baskets based on commercial arrangements."** Selection "will be different for every person – it's personalised based on the individual's behaviour, preferences and the way they interact with Olive." SmartCompany notes Woolworths did **not** clarify how Olive picks between competing brands, nor whether private label could be prioritised.

Source: [SmartCompany, 15 January 2026](https://www.smartcompany.com.au/retail/woolworths-ai-chatbot-olive-shopping-basket-product-selection/)

**[INFERENCE] — this constrains the pitch, and improves it.** Do not propose supplier-paid placement *inside the agent's basket*. Woolworths has publicly ruled it out "at this stage", and a concept that ignores that will be declined on the spot. The defensible position is the opposite one: **build the disclosure and verification layer first**, so that if Woolworths ever does introduce commercial influence, it can be labelled, audited and defended. Everyday Rewards Boosts remain fair game — they are an existing, opt-in, member-facing loyalty mechanic, not a hidden placement — but they should be shown *as* offers, clearly marked, never silently slipped into a basket.

### The published critique — read this before designing anything

**[ACADEMIC / PRESS]** Uri Gal, Professor of Business Information Systems at the University of Sydney, published a critique on 16 January 2026 (The Conversation, syndicated by RNZ and NZ Herald). The core argument, verbatim:

> "Instead of actively selecting products through browsing and comparison, shoppers will increasingly review and approve selections made for them."

And, on whose interests the agent serves:

> its priorities reflect "pricing strategies, promotional priorities and commercial relationships – not an objective assessment of the consumer's interests"

On data sensitivity: *"Meal planning can disclose health conditions, dietary restrictions, cultural practices, religious observance, family composition and financial pressures."* He notes it is not yet clear how long household data is retained or how it is aggregated.

Sources: [The Conversation, 16 January 2026](https://theconversation.com/do-woolworths-shoppers-want-google-ai-adding-items-to-buy-well-soon-find-out-273342) · [RNZ, 17 January 2026](https://www.rnz.co.nz/news/on-the-inside/584335/when-your-supermarket-shops-for-you-what-woolworths-ai-upgrade-really-means)

**[INFERENCE]** This is the criticism a Woolworths NZ CX or loyalty lead will be asked about internally. A concept that answers it in the product — by labelling supplier-funded suggestions and showing the customer the arithmetic — is more defensible than one that ignores it. Disclosure is not a compliance tax here; it is the feature.

### The Olive failure case — an agent that claimed to be human

**[PRESS]** By 27 February 2026, Woolworths had to remove scripting from Olive after it claimed to be human and discussed personal memories — including a mother's birth year and "memories of its mother and her angry voice", plus fake typing sounds. Woolworths' statement: *"A number of responses about birthdays were written for Olive by a team member several years ago as a more personal way for Olive to connect with customers. As a result of customer feedback, we recently removed this particular scripting."* No regulator involvement was reported.

Source: [RNZ, 27 February 2026](https://www.rnz.co.nz/news/world/588177/australian-supermarket-giant-reins-in-ai-assistant-claiming-to-be-human)

**[INFERENCE]** Cheap, specific lesson: an agent must present as an agent. A pilot should state this as an explicit boundary, because Woolworths has already been burned by the opposite.

---

### The international field — who has shipped what

**Kroger — the closest thing to a template, and it went live two days ago.**

**[PUBLISHED]** Kroger's **AI Shopping Assistant** is live across Kroger Family of Companies websites and apps as of **28 July 2026**. It plans weekly meals, discovers recipes, builds carts to budget and dietary needs, **processes a photo of a handwritten list or recipe card**, and takes a **pasted URL** to find the products and build the cart. Yael Cosset, EVP & Chief Digital Officer: *"We continue to invest in digital tools that make shopping simpler, more intuitive and more convenient for our customers."* **No metrics of any kind published.**
Source: [Kroger IR, 28 July 2026](https://ir.kroger.com/news/news-details/2026/Kroger-Helps-Families-Simplify-Back-to-Routine-Season-with-Fresh-Convenient-Meals-and-a-Smarter-Way-to-Shop/default.aspx) · trade: [Supermarket News](https://www.supermarketnews.com/grocery-technology/kroger-launches-ai-driven-shopping-agent)

**[PUBLISHED]** Kroger's earlier announcement (11 January 2026) covers the Google Cloud expansion — Gemini Enterprise for CX nationwide, with a **Meal assistant** and **Shopping assistant** doing "intelligent execution through agentic integration", grounded in Kroger's proprietary pricing and inventory. No pilot results disclosed.
Source: [Kroger IR, 11 January 2026](https://ir.kroger.com/news/news-details/2026/Kroger-Scales-Generative-AI-Strategy-with-Google-Cloud-to-Drive-Digital-Growth-and-Personalization/default.aspx)

**[PRESS]** Kroger's staff-facing **Sage** platform grew from **30 use cases at five months to 95+**, with **up to 150,000 associates** active. Yael Cosset: *"Consumers actually struggle the more choice we give them."*
Source: [Grocery Dive, 13 January 2026](https://www.grocerydive.com/news/kroger-ai-google-gemini-shopping-assistant-technology-associate-platform-sage-nrf-2026/809435/)

**Tesco — the best de-risking model for a six-week pilot.**

**[PRESS — The Grocer]** Tesco has an in-app AI assistant **in trial**: conversational dialogue producing personalised recipe ideas and **adding ingredients straight to basket**, handling dietary requirements and using up leftovers. **280,000 Tesco colleagues have early access** and will feed back — including naming it — before rollout to all customers later in 2026. Built in-house with Tomoro AI. Ken Murphy, CEO: *"In the long term, this assistant has the potential to transform the way people shop with us."*
Source: [The Grocer, 9 April 2026](https://www.thegrocer.co.uk/news/tesco-launches-meal-planning-basket-building-in-app-ai-assistant/717474.article)

**Caveat:** The Grocer says the assistant taps "a customer's previous shopping history and preferences" and **does not explicitly say Clubcard**. Other coverage describes a Clubcard link; that is unverified. Do not claim Clubcard integration.

**[INFERENCE]** The Tesco pattern is the single most transferable thing in this document: **a staff-first internal beta at scale before any customer sees it.** Woolworths did exactly the same thing — 200,000+ staff in April 2026 before the July customer rollout. That is the shape a six-week pilot should take, and it is the honest answer to "how do we know it won't embarrass us."

**Albertsons — agentic grocery, live, with one number to handle carefully.**

**[PUBLISHED]** Albertsons' **AI Shopping Assistant** went live on web (3 December 2025) across Albertsons, Safeway, Vons, Jewel-Osco and other banners. Named capabilities: **Rapid Restock, Plan Meals, Shop Lists, Fridge Cleaner, Shop Recipe, Event-Ready**. Jill Pavlovich, SVP Digital Customer Experience: *"The assistant doesn't just answer questions, it actively completes shopping tasks for customers."*
Source: [Albertsons newsroom, 3 December 2025](https://www.albertsonscompanies.com/newsroom/press-releases/news-details/2025/Albertsons-Companies-Accelerates-Digital-Transformation-with-the-Albertsons-AI-Shopping-Assistant-Redefining-the-Grocery-Shopping-Experience/default.aspx) · [Grocery Dive, 5 December 2025](https://www.grocerydive.com/news/albertsons-agentic-ai-shopping-assistant/807168/)

**Handle with care:** Albertsons' release claims it can "reduce grocery shopping time from an average of 46 minutes\* to as little as four minutes" — **46, not 45**, and asterisked in Albertsons' own copy. This is a **company design aspiration, not a measured outcome**. Grocery Dive declined to repeat it. If used at all, attribute it as Albertsons' stated goal.

**Walmart — the deepest published outcome data of anyone.**

**[PRESS reporting earnings calls]** Sparky launched **6 June 2025**. CEO John Furner stated on **two consecutive earnings calls** (February and May 2026) that **customers who use Sparky have an average order value about 35% higher** than non-Sparky customers, that **~50% of Walmart app users have used Sparky**, and that Sparky **weekly active users were up over 100%** quarter on quarter. David Guggina, CEO Walmart U.S.: units purchased through Sparky have **more than quadrupled** since the prior quarter. US only.
Sources: [Retail Dive, 10 June 2025](https://www.retaildive.com/news/walmart-launches-generative-ai-assistant-sparky/750300/) · [Constellation Research, 19 February 2026](https://www.constellationr.com/insights/news/walmarts-sparky-ai-agent-increases-order-value) · [Digital Commerce 360, 22 May 2026](https://www.digitalcommerce360.com/2026/05/22/walmart-sparky-agent-ai-sales-supply-chain/)

**Important honesty note:** the 35% is a **correlation stated on an earnings call**, not a controlled experiment. Sparky users are likely already the higher-spending, more engaged cohort. Present it as what it is.

**[PRESS]** Walmart's agent architecture is four "super agents": **Sparky** (customers), **Marty** (sellers/suppliers/advertisers), **Associate Agent** (employees), **Developer Agent**. CTO Suresh Kumar: *"Multiple agents — even if each one is useful — can quickly become overwhelming and confusing."*
Source: [Retail Dive, 25 July 2025](https://www.retaildive.com/news/walmart-artificial-intelligence-ai-super-agents-retail-associates/753996/)

**[PUBLISHED then reversed]** Walmart announced an OpenAI partnership on 14 October 2025 using ChatGPT **Instant Checkout**. By March 2026 the plan had changed: Walmart launched an **in-platform ChatGPT app powered by Sparky** handling discovery through checkout on Walmart's own rails, after **OpenAI pivoted away from handling purchases itself** — "the initial version of Instant Checkout did not offer the level of flexibility that we aspire to provide, so we're allowing merchants to use their own checkout experiences while we focus our efforts on product discovery."
Sources: [Walmart newsroom, 14 October 2025](https://corporate.walmart.com/news/2025/10/14/walmart-partners-with-openai-to-create-ai-first-shopping-experiences) · [Grocery Dive, 27 March 2026](https://www.grocerydive.com/news/walmart-sparky-chatgpt-instant-checkout/815961/)

**Amazon — the largest published attribution.**

**[PUBLISHED]** Amazon's Q4 2025 earnings report, verbatim: **"Rufus was used by 300 million+ customers and saw an even stronger response than anticipated, helping deliver nearly $12 billion in incremental annualized sales last year."** Amazon's own agentic-shopping explainer adds: Rufus users are **60%+ more likely to convert**; **Buy for Me** catalogue grew **from 65,000 products at launch to over half a million**; **Alexa+ drives three times more on-device purchases** than classic Alexa; nearly **20%** of customers who created Interests added a recommended item to cart.
Sources: [Amazon Q4 2025 report](https://www.aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report) · [Amazon agentic AI shopping](https://www.aboutamazon.com/news/retail/amazon-agentic-ai-gen-ai-shopping)

**Caution:** Amazon also reported roughly $12bn of *incremental advertising revenue* in the same period. Two different $12bn figures — do not conflate them.

**[PUBLISHED]** In May 2026 Amazon folded Rufus into **Alexa for Shopping** (US only) — **Buy for Me** completes purchases at non-Amazon retailers using saved details, and **Scheduled Actions** handles recurring and conditional buys ("add if the price drops to $10").
Source: [Amazon, Alexa for Shopping](https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant)

**Carrefour — Hopla, and the same checkout conclusion.**

**[PRESS]** Carrefour launched a **Carrefour app inside ChatGPT** (March 2026), first major European food retailer to do so, **France only**. Product search, basket building, meal-plan suggestions, delivery/click-and-collect options and substitution alternatives. **Payment is NOT available in ChatGPT** — orders must be finalised on Carrefour's own site. Emmanuel Grenier, Executive Director: *"By launching on ChatGPT, Carrefour reaffirms its position as a pioneer in artificial intelligence."*
Source: [Connexion France, 26 March 2026](https://www.connexionfrance.com/news/carrefour-customers-in-france-can-now-use-ai-to-do-their-shopping/781130)

Carrefour's earlier **Hopla** generative shopping assistant (2023, France) is real but its own launch page would not load — no verified quote, metric or exact date. See what I could not verify.

**Target — the list scanner, and a naming correction.**

**[PUBLISHED]** Target launched (12 November 2025) **Target Gift Finder** (conversational recommendations), **List Scanner** (scan a handwritten or digital list into the app for cart addition), enhanced **Store Mode** (aisle guidance, alternate fulfilment when an item is out) and **Find Bullseye** (an in-store mascot hunt game). Published figure: guests using the Target app in-store have basket sizes **"nearly 50% higher"**. Cara Sylvester, Chief Guest Experience Officer.
Source: [Target newsroom, 12 November 2025](https://corporate.target.com/press/release/2025/11/target-launches-new-ai-powered-features-to-make-holiday-shopping-easier,-smarter-and-more-fun)

**Correction to a common belief:** there is no "Bullseye" AI shopping assistant. Target's own wording is **Target Gift Finder**; Bullseye is the mascot and Find Bullseye is a game.

**Zalando — the best adoption curve outside grocery.**

**[PUBLISHED]** Zalando extended its AI Assistant to **all 25 markets** in local languages (1 October 2024), having launched in four German- and English-speaking markets in 2023, running on Zalando's own models plus OpenAI LLMs. Tian Su, VP Personalisation and Recommendation: *"We know our customers want to get inspired when they come to Zalando."*
Source: [Zalando corporate, 1 October 2024](https://corporate.zalando.com/en/technology/zalando-brings-its-ai-powered-assistant-all-markets-and-adds-four-new-cities-its-trend)

**Ocado — real published AI, but mostly upstream, and one glaring gap.**

**[PUBLISHED]** Ocado publishes deep-learning demand forecasting figures: **over 70 million supply chain forecasts daily**, **up to 40% more accurate** than traditional retailer systems, **up to 98% of stock ordered automatically**.
Source: [Ocado newsroom, 8 October 2025](https://www.ocadogroup.com/newsroom/stories/forecasting-the-future)

Ocado's OSP product-page figures (98% availability, 99.4% fulfilment accuracy, 0.49% food waste) are **[VENDOR CLAIM]** sales collateral for software Ocado sells to other grocers, with no named retailer or third-party validation. Flag if used.
Source: [Ocado OSP Supply Chain](https://www.ocadogroup.com/our-solutions/online-grocery/supply-chain)

**[INFERENCE] — the most useful gap in this entire document.** **Nobody has published a substitution-accuracy figure.** Not Ocado, not Instacart, not Kroger, not Albertsons, not Woolworths. Ocado's substitution claim is qualitative only. For a New Zealand grocer whose customers feel every bad substitution, that is genuinely unclaimed ground — and it makes a clean, measurable, defensible pilot outcome rather than a vibe.

---

## The loyalty + AI fusion

### Everyday Rewards New Zealand — the actual mechanics

You must design to these, not to the Australian programme.

**[PUBLISHED]** From Woolworths Group's own launch release (1 February 2024) and NZ trade coverage:

- **Earn:** 1 Everyday Rewards point per $1 spent at Woolworths. Also 1 point per litre of fuel at bp, and 1 point per $1 at bp shop, Wild Bean Cafe and bp car washes.
- **Redeem:** **2,000 points = a $15 Rewards voucher**, redeemable at Woolworths or bp.
- **Boosts:** personalised offers "delivered to their inbox, online or accessed within the Everyday Rewards app" — described as "special offers designed to get customers to their $15 rewards faster."
- **Member Prices:** evolved from Onecard's Club Price discounts.
- Replaced Countdown's Onecard from February 2024. Foundation partner bp. Existing Onecard points converted automatically.
- Mark Wolfenden, Director of Digital and Loyalty, Woolworths New Zealand, on launch: members "could be earning rewards over twice as fast as our previous programme" if they use the tailored offers.
- Mark Burger, General Manager of Loyalty: *"We've prioritised simplicity with the programme. Its appeal is that customers shop as normal from Woolworths and other retail partners, and the rewards take care of themselves."*

Sources: [Woolworths Group newsroom, 1 February 2024](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2024/woolworths--first-loyalty-programme-members-score-a-surprise-boo.html) · [Supermarket News NZ, 13 September 2023](https://supermarketnews.co.nz/news/local/woolworths-new-zealands-new-loyalty-programme/) · [Inside Retail NZ, 1 February 2024](https://insideretail.co.nz/2024/02/01/woolworths-launches-everyday-rewards-loyalty-program-into-nz/)

**[INFERENCE — my arithmetic, clearly labelled]** $15 per 2,000 points at 1 point per $1 spent is a **0.75% base return on grocery spend**. This is arithmetic from the published mechanics above, not a Woolworths figure. Notably it is the *same* headline rate Foodstuffs now offers at New World (below), which means base earn is not a differentiator in New Zealand — **the personalised layer is the only place either side can win**. That is the strategic argument for this pilot.

### Everyday Rewards — verified scale, both markets

All figures below are quoted from Woolworths Group's own filings.

**New Zealand** — Annual Report 2025: *"In February 2025 we marked the one-year anniversary of the Everyday Rewards program launching in New Zealand and we are pleased with the engagement we are seeing with **2.1 million active members** at the end of F25."* Three new partners were added: **Air New Zealand, Qantas and g.a.s.**

H1 F26 (25 February 2026): *"Active Everyday Rewards members of **2.1 million increased 6%** compared to the prior year. Member engagement and sentiment continued to improve with **tag rates and Rewards VOC NPS increasing** on prior periods. During the half, Everyday Rewards was launched across the **FreshChoice** store network"* (**71 stores**).

**Australia** — Annual Report 2025: *"Everyday Rewards & Services sales increased by a normalised **9.8%** in F25. Everyday Rewards active members reached **10.4 million**, with more than half a million new members joining the program during the year. Member engagement remains strong with **weekly active app users reaching 2 million** in the quarter."*

H1 F26: *"Everyday Rewards active members reached **10.6 million** in Q2, an increase of **3.8%** on the prior year and 0.9% on Q1."* Campaigns named: Shop, Scan & Win, Member Frenzy, Points Blitz.

Member definition, footnoted in both reports: *"Registered Everyday Rewards members that scanned their card at any Woolworths Group banner or partner in the last 12 months."*

Sources: [Woolworths Group Annual Report 2025](https://www.woolworthsgroup.com.au/content/dam/wwg/sustainability/reports/f25/Woolworths%20Group%20Annual%20Report%202025%20.pdf) · [H1 F26 results, 25 February 2026](https://www.woolworthsgroup.com.au/content/dam/wwg/investors/reports/f26/h26/3029540.pdf)

**Use 10.6m for Australia and 2.1m for New Zealand.** Ignore Cartology's marketing site, which claims "+11 million" — see the retail media section.

### Boosts are the personalisation engine — and Woolworths has published what they do

**[PUBLISHED] — the most valuable single figure in this document, because Woolworths quantified its own mechanic.** From the Annual Report 2024:

> *"Our Everyday Rewards members also benefitted from personalised value with members accessing boost offers **up 9% compared to the prior year**, with members who boost reaching their **$10 value back more than five times faster** than those who simply scan their card."*

Source: [Woolworths Group Annual Report 2024](https://www.woolworthsgroup.com.au/content/dam/wwg/investors/reports/f24/f24/Woolworths%20Group%202024%20Annual%20Report.pdf)

**Two precision points, both important.** First, this is **F24 only** (year ended 30 June 2024) and Woolworths has **not refreshed it** — F25 and H1 F26 report Boost only directionally ("growth in members accessing personalised Boost offers", "record engagement" on Boost your Budget campaigns). Cite it as F24 and say so. Second, the "$10 value back" is the **Australian** reward threshold; New Zealand's is **$15 at 2,000 points**. Do not mix them.

**[PUBLISHED]** Woolworths' H1 F26 results also put the agentic work on the record in the company's own words: *"Through **agentic AI**, extended partnership with **Google** to transform digital shopping assistant **Olive** into a market-leading conversational shopping companion."* The Annual Report 2025 states **"1,500 GenAI use cases identified"**.

**[INFERENCE]** So Woolworths has published, itself, that its personalised offer mechanic makes members reach their reward **more than five times faster**. And its own agentic release never mentions that mechanic. The pitch is: take the thing you already proved works, and put it where the customer is now making decisions.

### Foodstuffs Club+ — the competitive clock, and it is loud

**[PUBLISHED]** Foodstuffs' own media release, 18 May 2026, announced **Club+** across New World, PAK'nSAVE and Four Square:

- Earn rates: **New World 0.75%**, **Four Square 0.38%** in Club+ Dollars. **PAK'nSAVE has no earn rate** — customers can spend Club+ Dollars there but earn nothing on PAK'nSAVE purchases.
- Digital cards via the Club+, New World and PAK'nSAVE apps, physical card optional.
- The release promises "a more personalised experience over time" and references **"personalised Club+ Picks"** for PAK'nSAVE customers — but gives no technical detail on how.
- First time a rewards system is shared across the legally separate North and South Island co-operatives.
- Cited from brand tracking (May '25–Apr '26): "more than three quarters of customers regularly shop at more than one supermarket."
- Brendon Lawry, Acting Chief Customer Officer, Foodstuffs New Zealand: *"Club+ is designed to reflect those changing shopping habits by giving people a single rewards and savings programme they can use across Foodstuffs brands, so the value and benefits travel with them wherever they choose to shop."*
- Timeline: early joining from 18 May 2026 · full launch **15 June 2026** · Clubcard phase-out completed **26 July 2026**.

Source: [Foodstuffs South Island newsroom, 18 May 2026](https://www.foodstuffs-si.co.nz/news-room/2026/new-world-pak-nsave-four-square-launch-club---a-smarter-way-to-save-on-groceries)

**[PRESS — independent critique]** Consumer NZ's analysis (18 June 2026) confirms the 0.75% and 0.38% rates and lists what Club+ removed: the automatic **Everyday Fuel Discount of 8c/L at Z and Caltex** is gone entirely (Consumer NZ calculates the old discount was worth roughly **$208 a year** on a 50-litre weekly fill); new exclusions cover NZ Post services, delivery fees, click-and-collect fees, bag fees, online subscription fees and gas bottle exchanges; rewards can no longer be redeemed at Liquorland; and customers **must now join the loyalty programme in order to shop online or use click and collect**.

Source: [Consumer NZ, 18 June 2026](https://www.consumer.org.nz/shopping/supermarkets/the-fine-print-foodstuffs-club-card)

**[INFERENCE]** Foodstuffs has just put every New World, PAK'nSAVE and Four Square shopper through a forced re-enrolment, stripped a popular fuel benefit, and promised personalisation it has not yet built. That is the widest switching window in New Zealand grocery loyalty in years, and it closes as Club+ matures. A six-week pilot lands inside it.

### Foodstuffs uses dunnhumby — and Consumer NZ said so publicly

**[PRESS]** Gemma Rasmussen, Consumer NZ head of research and advocacy, on Club+: *"Foodstuffs will be capturing data not only on New World but Pak'nSave and Four Square now and they use this data along with pricing analytics through a tool called Dunnhumby to understand just how aggressively they can price in certain areas."* Foodstuffs responded: *"we do not use customer data to increase prices"*, and said data helps customers "find value" through personalised notifications of sales on regularly purchased items.

Same source: [RNZ, 11 June 2026](https://www.rnz.co.nz/news/personal-finance/597842/supermarket-loyalty-programmes-not-all-they-re-cracked-up-to-be-consumer-warns)

**[INFERENCE]** dunnhumby is Tesco's analytics arm — the organisation behind Clubcard. Foodstuffs has bought the Clubcard playbook. Woolworths NZ's counter cannot be "better segmentation"; it has to be a better *customer-facing* experience.

### Tesco Clubcard Challenges — the clearest live example of a model setting per-customer targets

**[PUBLISHED]** Tesco has published the reach and the scale-up across three filings:

- **4.9m customers** (H1 FY24/25): *"further personalisation, with 4.9m customers receiving 'Clubcard Challenges' tailored to their shopping habits."* Clubcard sales penetration: **UK 82%, ROI 85%, Central Europe 87%**. ([Tesco Interim Results 2024/25, 2 October 2024](https://www.tescoplc.com/media/qjejufrm/tesco-plc-interim-results-2425-press-release.pdf))
- **10m customers** (FY24/25): *"Clubcard Challenges offered to 10m customers, awarding up to **£50** worth of Clubcard Points."* ([Tesco FY24/25 prelims presentation](https://www.tescoplc.com/media/hkjbexki/prelims-fy-2425-slide-master_for-website_v2.pdf))
- The Annual Report adds: *"Personalised Clubcard Challenges were offered to 10 million customers and launched a trial of **Your Clubcard Prices**, which contributed to **record levels of digital engagement**."* Also: *"over **23 million Clubcard households** in the UK."* ([Tesco Annual Report 2025](https://www.tescoplc.com/media/ky0bfwpo/tesco_ar25_interactive.pdf))
- **10th round** (H1 FY25/26): *"We have also sent tailored digital coupons to over **10 million customers** and further enhanced our Clubcard challenges, which are now in their **10th round**."* Clubcard penetration *"around 85% across the group."* ([Tesco Interim Results 2025/26 call transcript, 2 October 2025](https://www.tescoplc.com/media/v52epwqm/tesco-plc-interim-results-2526-investor-analyst-call-transcript.pdf))

**Note what Tesco has NOT published:** any conversion rate, redemption rate or incremental-sales figure for Challenges. Only reach and the reward ceiling.

### ⚠️ The famous Clubcard Challenges performance numbers are vendor claims, not Tesco's

**[VENDOR CLAIM — do not present as a Tesco figure]** The figures that circulate as "Tesco's results" — **76% of visitors converting to players, 62% of players becoming winners, "over half a billion extra Clubcard points"** — come from **Eagle Eye, Tesco's technology supplier**, not from Tesco.

Source: [Eagle Eye case study](https://eagleeye.com/case-studies/tesco-clubcard-challenges) · [PR Newswire, 28 May 2025](https://www.prnewswire.com/in/news-releases/tescos-clubcard-challenges-powered-by-eagle-eye-wins-best-global-loyalty-launch-or-initiative-at-the-2025-international-loyalty-awards-302466793.html) — note the award release contains **no Tesco spokesperson at all**; the only quote is from Eagle Eye's CEO.

Eagle Eye attributes the "half a billion extra Clubcard points" line to Ken Murphy, but it could not be found in any Tesco primary document checked (Annual Report 2025, H1 24/25 release, FY24/25 prelims). **Do not put that number in front of Woolworths as a Tesco figure.** Eagle Eye also never explains how the AI sets each customer's threshold — only "AI-driven segmentation".

### Tesco "smart stock" — prediction fused with supplier-funded media, in Tesco's own words

**[PUBLISHED]** This is the closest published analogue to what this pitch proposes, and it is worth quoting in full:

> *"Our Tesco media team has developed **smart stock**, which can **anticipate when customers are running low on household products**. This allows us to send **timely personalised reminders**, helping **both customers and suppliers**, and setting a new benchmark for **precision-led retail media**."*

The same call confirms an Adobe partnership powering *"close to real-time personalised emails with offers and recipe inspiration based on their preferences and shopping habits"*, and an *"AI-powered range curation tool"*.

Source: [Tesco Interim Results 2025/26 call transcript, 2 October 2025](https://www.tescoplc.com/media/v52epwqm/tesco-plc-interim-results-2526-investor-analyst-call-transcript.pdf)

**[INFERENCE]** Tesco has framed a predictive replenishment nudge as *retail media* — supplier-relevant and customer-useful at once — and said so on an investor call. That is the commercial model for concepts 1 and 2, already articulated by the most sophisticated loyalty operator in grocery.

### Tesco Media & Insight Platform — published scale

**[PUBLISHED]** Annual Report 2025: *"We now have more than **5,000 in-store screens** and more than **9,000 retail media campaigns**"*; *"ranked **joint #1** in Flywheel's European retail media rankings"*; new partnerships with WPP and Publicis.

Prior period (H1 FY24/25): *"Surpassed **4,000** digital in-store screens; over **7,600 campaigns** delivered in the first half"*; group-wide Tesco app users **16.3m**. H1 FY25/26 adds *"Over **550** new media screens... including launching **video advertising on the Tesco app**"* and names the supplier platform **Sphere**.

### Sainsbury's "Your Nectar Prices" — the largest published personalised-pricing scale anywhere

**[PUBLISHED]** Sainsbury's press release, 24 July 2025:

- **17 billion** personalised discounts generated since launch
- **1 million** customers using Your Nectar Prices weekly
- **£60 million** in customer savings over the past year
- **8.5 million** additional customers gaining access via supermarket checkouts
- Up to **10** personalised offers per week per customer; **over £150** potential annual saving
- Mark Given, Chief Marketing, Data & Sustainability Officer: *"while Nectar Prices are for everyone, we know our customers love an offer that is made just for them."*

Source: [Sainsbury's, 24 July 2025](https://corporate.sainsburys.co.uk/news/press-releases/unlock-shop-save-sainsburys-rolls-out-your-nectar-prices-across-tills-nationwide/)

**The forward target is the number to show Woolworths.** From the Annual Report 2025: *"More than one million customers are already enjoying personalised savings each week through Your Nectar Prices... we're working towards generating up to **500 million personalised offers a week**."*
Source: [Sainsbury's Annual Report 2025](https://corporate.sainsburys.co.uk/media/e1lfnybd/sainsbury-annual-report-and-financial-statements-2025.pdf)

### Sainsbury's Nectar Prices — base programme, and the most current figures

**[PUBLISHED]** Annual Report 2025: *"Nectar Prices has delivered over **£2 billion** in savings to our customers this year. With more than **9,000 offers** available, participation has increased to **over 85 per cent**, reaching record levels during the Christmas period."*

Preliminary Results FY25/26, 52 weeks to 28 February 2026 (published 23 April 2026):

- *"Customers saved an average of **£15.50** on an £80+ big weekly shop with Nectar Prices during 2025/26"*
- *"Nectar Prices has delivered more than **£5.5 billion** savings for customers since April 2023 launch"*
- *"more than **10,000** Nectar Price offers every week"*
- *"Customers can save more than **£450** a year with Nectar, as well as collecting over **£170** of Nectar Points"*
- *"**Your Nectar Prices** now rolled out to cover **all supermarket checkouts**"* — previously online and SmartShop only
- *"Key driver of record Nectar digital engagement with **35 per cent increase in digitally active users**"* (footnoted as February 2026 vs February 2025)
- *"joining up Groceries Online, ChopChop and SmartShop apps into one coherent app, creating the foundation for future personalisation and AI-led experiences"*; **"AI Centre of Excellence launched"**

Source: [Sainsbury's Preliminary Results 2025/26](https://corporate.sainsburys.co.uk/media/qxuhq1w0/j-sainsbury-plc-preliminary-results-2526-statement.pdf)

**Could not source:** a Nectar total-member count in either document. Widely-circulated "18 million members" and "260 million offers a week" figures appear only on content-farm sites — **do not use them.**

### Nectar360 — retail media with a published profit commitment

**[PUBLISHED]** From the FY25/26 prelims and Annual Report 2025:

- *"over **900 clients and media agencies**"* partner with Nectar360
- *"We remain **ahead of plan** to deliver at least **£100 million of incremental profit** over the three years to March 2027"*
- *"a **four percentage point** improvement in overall client satisfaction year-on-year"*
- *"Launched **Nectar360 Pollen**... connecting audience insight, planning, activation, optimisation and measurement in a single platform"*, with *"the benefit of **real-time audience building AI tools**"*
- Screens: **820** with Clear Channel (FY25) → *"almost **3,000** screens... Plans to install a further **3,000** screens during the next year"* (FY25/26)

**[INFERENCE]** This is the closest published analogue to Cartology, and the **£100m incremental-profit commitment over three years** is the kind of number that makes a Woolworths executive lean forward. It also shows the direction: loyalty personalisation and retail media converging into one platform.

### The pattern across Tesco, Sainsbury's and Woolworths

**[INFERENCE]** All three are pushing **personalised member pricing to every touchpoint** while building the **AI layer beside it rather than through it**. Sainsbury's has an AI Centre of Excellence and 17 billion personalised discounts, and its AI work is app consolidation. Tesco has 10m Clubcard Challenges and a separate in-app assistant whose Clubcard link is unconfirmed. Woolworths has a five-times-faster Boost mechanic and an agentic release that never mentions it.

This is not a Woolworths oversight. It is where the entire category currently sits. Which is precisely the argument for moving now, in the smaller market, where it can be done in six weeks.

### The trust deficit is measured, and it is the constraint

**[PRESS reporting Consumer NZ research]**

- **84% of New Zealanders** use supermarket loyalty cards. ([Consumer NZ, 28 March 2025](https://www.consumer.org.nz/about-us/media-releases/consumer-nz-urges-new-zealand-to-learn-from-australia-s-supermarket-inquiry))
- Only **35%** have high trust in supermarket pricing and promotions. ([RNZ, 11 June 2026](https://www.rnz.co.nz/news/personal-finance/597842/supermarket-loyalty-programmes-not-all-they-re-cracked-up-to-be-consumer-warns); the same 35% figure also appears in Commerce Commission-derived reporting, see NZ section)
- **86%** support Australian-style price regulation rules; **82%** reported food budgets under strain; **71%** bought more budget or home-brand products. (same RNZ source, 11 June 2026)
- New Zealanders lose "tens of millions of dollars annually" to pricing errors. ([Consumer NZ, 28 March 2025](https://www.consumer.org.nz/about-us/media-releases/consumer-nz-urges-new-zealand-to-learn-from-australia-s-supermarket-inquiry))

**[INFERENCE]** Near-universal loyalty enrolment plus low pricing trust is the exact condition where a *legible* agent wins and an opaque one backfires. Showing the arithmetic is the product.

---

## Retail media inside the shopping journey, and what governs it

### How big the category is

**[ANALYST REPORT]** WARC, *The Future of Commerce Media 2025* (3 November 2025): global retail media ad spend **$196.7 billion in 2026**; growth **13.7% in 2025** and **11.6% forecast for 2027** (against 38.6% in 2021). The most quotable framing: **retail media is projected to surpass combined linear and connected TV spend in 2026** — it was around one quarter of the total TV market in 2019. WARC also sizes the agentic commerce addressable market at **$136bn in 2025 rising to $1.7tn by 2030**.

Source: [WARC, 3 November 2025](https://www.warc.com/content/paywall/article/warc-data/the-future-of-commerce-media-2025/en-gb/162035) (paywalled; these figures were visible)

**Caution:** two figures often attached to this report — "+12.4% in 2026" and "~16% of all global ad spend in 2026" — appear only in secondary trade coverage, not on WARC's own page. Drop them or label them secondary.

**[ANALYST REPORT]** eMarketer, *Retail Media Ad Spending Forecast H1 2026* (5 May 2026), US-focused: *"By 2028, Amazon's retail media revenues will exceed **$75 billion**, more than **$65 billion** ahead of the next-largest RMN."* Narrative: growth is **slowing**, a scaled second tier is emerging, and the long tail is falling behind.
Source: [eMarketer, 5 May 2026](https://www.emarketer.com/content/retail-media-ad-spending-forecast-h1-2026)

### Woolworths already owns the retail media arm — and it runs on Everyday Rewards

**[PUBLISHED — filings, use these]** Annual Report 2025: *"Cartology revenue increased by a normalised **19.5%** with growth across all banners and channels, particularly in Digital and Shopper. Highlights include the roll out of **video ads on the woolworths.com.au homepage and the app** during the year and the activation of approximately **20,000 in-store POS screens** as media opportunities."*

H1 F26: *"**Cartology revenue increased by 4.5%** with the lower growth rate due to cycling several promotional events in the prior year, including the Olympics in Q1 and the Roblox campaign in Q2, as well as a soft out-of-home advertising market."* Plus *"Roll out of Cartology Health & Beauty and Household **aisle end screens in over 450 stores**"* and *"Launch of new **Ads Manager**, a self-service reporting platform for Cartology clients."*

Sources: [Woolworths Group Annual Report 2025](https://www.woolworthsgroup.com.au/content/dam/wwg/sustainability/reports/f25/Woolworths%20Group%20Annual%20Report%202025%20.pdf) · [H1 F26 results](https://www.woolworthsgroup.com.au/content/dam/wwg/investors/reports/f26/h26/3029540.pdf)

**[COMPANY MARKETING — not audited]** Cartology's own site claims **82.7 million monthly Woolworths transactions**, *"+3,600 digital Retail Out of Home screens"*, 5.1 million monthly Fresh Mag readers, and BIG W *"over 20m monthly"* visitors across 170+ stores.
Source: [Cartology](https://www.cartology.com.au/) · [Cartology solutions](https://www.cartology.com.au/solutions)

**⚠️ A discrepancy not to walk into.** Cartology's homepage claims **"+11 million active Everyday Rewards members"** while its own solutions page says **10.4 million** and the H1 F26 filing says **10.6 million**. **Cite the filing, never the marketing site.**

**[INFERENCE]** The commercial logic of the whole pitch is visible here. Cartology's audience *is* Everyday Rewards. So the moment an agent starts building baskets, Cartology's inventory either moves into the agent — or gets bypassed by it. Cartology's revenue growth already decelerated from 19.5% to 4.5%. That is a live strategic problem inside Woolworths right now, and a labelling-and-disclosure layer is the only thing that makes the first option defensible.

### But Woolworths has publicly ruled out paid placement in the basket — for now

Repeating this because it is the constraint that shapes everything: a Woolworths spokesperson said **"At this stage, we have no plans to place items in baskets based on commercial arrangements"**, and did not clarify how Olive chooses between competing brands or whether private label could be prioritised ([SmartCompany, 15 January 2026](https://www.smartcompany.com.au/retail/woolworths-ai-chatbot-olive-shopping-basket-product-selection/)).

**[INFERENCE]** Note the phrase "at this stage". This is a position that will be revisited the moment the agent has scale. The useful thing to build now is the mechanism that makes revisiting it safe.

### How supplier-funded placement actually works in a grocery app and in-store

**[PUBLISHED — vendor]** The clearest published model is Instacart's in-store cart advertising: opened to **"more than 7,000 brand partners"**, with ads that are **"inventory- and aisle-aware"** — they fire only when the shopper is in the relevant aisle and the item is in stock. The dwell-time sales pitch, verbatim: **"On average, customers spend more than 30 minutes shopping in-store with a Caper Cart."**

Source: [Instacart, 25 March 2025](https://company.instacart.com/pressreleases/instacart-expands-in-store-advertising)

**[PUBLISHED]** Sainsbury's has stated its intent to monetise the scan-and-go trip directly: **"Continuing to develop our Retail Media capabilities, including exploring further opportunities within SmartShop"** — while in the same release rolling **"Your Nectar Prices"** out to all supermarket checkouts.

Source: [Sainsbury's FY2026 preliminary results, 23 April 2026](https://corporate.sainsburys.co.uk/news/press-releases/preliminary-results-for-the-52-weeks-ended-28-february-2026/)

**[INFERENCE]** The pattern across both: **relevance conditions are what make the placement acceptable.** Instacart's ads only fire when the product is in the aisle and in stock; Sainsbury's pairs monetisation with personalised member pricing. Nobody is selling raw interruption. Any Woolworths concept should inherit that discipline — a placement must be *useful at that moment* or it does not appear.

### 🔴 The NZ regulator is actively investigating supplier promotional payments — three weeks ago

**This is the most locally consequential finding in the document.**

**[PUBLISHED — regulator]** New Zealand Commerce Commission, **7 July 2026**:

> *"The Commission has identified **over 50 different types of supplier payments** that account for around **$6 billion** paid by suppliers to the major supermarkets **annually**."*

> *"These payments may be charged for shelf restocking, **promotional support**, aisle-cleaning and other in-store services."*

Grocery Commissioner **Pierre van Heerden**: *"These payments add backroom complexity and reinforce the low levels of competition in the grocery market"*, and *"While these payments aren't unique to New Zealand's grocery sector, they're problematic because of our market structure where a few big players hold most of the market and so can distort competition."*

The Commission has **closed its Wholesale Supply Inquiry to prioritise compliance and enforcement**. Penalties under the regime: **$500,000 to $10 million, or three times the commercial gain**.

Source: [Commerce Commission, 7 July 2026](https://comcom.govt.nz/news-and-media/news-and-events/2026/supermarket-charges-on-suppliers-harming-grocery-competition/)

**[INFERENCE]** The release does not separate retail-media or advertising payments from other rebates and payments. But supplier-funded personalised offers sit squarely inside the "promotional support" category the Commission named. Any product funded by suppliers needs a clean, auditable answer on how the payment is characterised and how the shopper-facing saving is represented. **This is why the receipt layer is the product, not the packaging.**

### 🔴 And Woolworths is already defending pricing-representation proceedings in both markets

**[PUBLISHED — Woolworths' own contingent liabilities note]** From the Annual Report 2025:

> *"On 23 September 2024, the ACCC commenced proceedings in the Federal Court against Woolworths Group Limited... for allegedly breaching the Australian Consumer Law in relation to **discount pricing representations** on common supermarket products. Class action proceedings were subsequently launched against Woolworths Group Limited by Gerard Malouf & Partners in relation to the same allegations."*

> *"On 10 December 2024, the **NZCC** announced an intention to file **criminal proceedings against Woolworths New Zealand Ltd**... for allegedly breaching **section 10 of the Fair Trading Act 1986** in relation to the price consumers were to pay, or paid, for grocery products. Those proceedings were **filed on 5 May 2025**."*

> *"The Group is defending the ACCC proceedings and the class action, and the NZCC proceedings, each of which may or may not result in a liability."*

Source: [Woolworths Group Annual Report 2025, contingent liabilities](https://www.woolworthsgroup.com.au/content/dam/wwg/sustainability/reports/f25/Woolworths%20Group%20Annual%20Report%202025%20.pdf)

**[INFERENCE]** A personalised-offer product is, to this buyer, **inside the live litigation blast radius**. Which cuts both ways: it raises the bar for anything touching price representation, and it makes a verifiable disclosure mechanism unusually easy to justify internally. Note again that Woolworths NZ has publicly said it *"does not use dynamic or any personalisation in pricing"* — that line exists for exactly this reason, and no concept should cross it.

### No retailer publishes an in-app sponsored-placement labelling policy

**[PUBLISHED absence — verified by direct checking]** Cartology's public site describes its ad products in detail — in-store screens, aisle takeovers, retail out-of-home, first-party audience targeting from Everyday Rewards data — but contains **no statement about how sponsored placements are labelled or disclosed to shoppers**, and no measurement or attribution methodology.

**[INFERENCE]** This is an open, ownable gap. "We will publish the labelling standard" is a differentiated position rather than table stakes — and it directly de-risks both the Commerce Commission enforcement exposure and the live pricing-representation proceedings above.

### The disclosure rules

**[PUBLISHED — regulator, verified at source]** United States, for reference on how disclosure obligations are drafted:

- **FTC Endorsement Guides, 16 CFR Part 255** — source credit **"88 FR 48102, July 26, 2023"**, confirming the 2023 revision. [Cornell LII](https://www.law.cornell.edu/cfr/text/16/part-255)
- **Rule on the Use of Consumer Reviews and Testimonials, 16 CFR Part 465** (the fake-reviews rule) — source credit **"89 FR 68077, Aug. 22, 2024"**. Sections cover fake testimonials (§465.2), buying reviews (§465.4), insider reviews (§465.5), company-controlled review sites (§465.6), review suppression (§465.7), fake social-media indicators (§465.8). [Cornell LII](https://www.law.cornell.edu/cfr/text/16/part-465)

**Caution:** those are *Federal Register publication* dates, not effective dates. Do not state an effective date without checking.

**[PUBLISHED — self-regulator, verified verbatim]** The UK CAP Code, Section 2 (Recognition of marketing communications):

> **2.1** "Marketing communications must be obviously identifiable as such."
> **2.2** "Unsolicited e-mail marketing communications must be obviously identifiable as marketing communications without the need to open them"
> **2.3** Marketing communications must not falsely suggest the marketer is acting as a private consumer, and must make commercial intent clear where context does not make it evident.
> **2.4** "Marketers and publishers must make clear that advertorials are marketing communications; for example, by heading them 'advertisement feature'"

Source: [ASA / CAP Code Section 2](https://www.asa.org.uk/type/non_broadcast/code_section/02.html)

**[INFERENCE]** Rule 2.1 is the whole argument in eight words, and 2.3 is directly on point for an agent: if the agent presents a paid suggestion as if it were a neutral recommendation from a helper, that is the "falsely suggesting" problem. This is also, independently, exactly the failure Woolworths already had when Olive claimed to be human.

**New Zealand:** the NZ Advertising Standards Authority code contains an equivalent identification requirement, but **[asa.co.nz](https://www.asa.co.nz/codes/codes/advertising-standards-code/) returned HTTP 403 to me and I could not quote the rule number or wording.** Do not cite a NZ rule number without checking it. New Zealand's statutory backstop is the **Fair Trading Act 1986**, which the Commerce Commission lists among the legislation governing grocery ([Commerce Commission](https://www.comcom.govt.nz/regulated-industries/grocery/)) — but I could not reach the Commission's specific advertising guidance page and have not quoted it.

**Also unverified:** the FTC Endorsement Guides and Native Advertising guidance pages both returned 403; IAB Australia's retail media standards page 404'd; and I could not reach the AANA Code of Ethics. See what I could not verify.

---

## The wait moments, and who has used them

### First, the evidence that this works at all

The thesis has a real experimental base. Use it — it is the difference between a pitch and an opinion.

**[ACADEMIC]** Buell, Ryan W., and Michael I. Norton, "The Labor Illusion: How Operational Transparency Increases Perceived Value," *Management Science* 57, no. 9 (September 2011): 1564–1579. [DOI](https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1376) · [full text PDF, HBS](https://www.hbs.edu/ris/Publication%20Files/Norton_Michael_The%20labor%20illusion%20How%20operational_f4269b70-3732-4fc4-8113-72d0c47533e0.pdf)

The headline result, from Experiment 2 (N=118, forced choice between an *instant* service and a *waiting* service): when the wait showed the work being done, **62% chose the waiting service at 30 seconds and 63% at 60 seconds**. Without transparency, only **42% (30s) and 23% (60s)**. In the logistic regression the transparency coefficient was significant (1.30, p<0.01) and wait time was **not** (−0.01, p=0.37). People chose to wait, for identical results.

Experiment 3 (N=143) shows the mechanism is not anxiety reduction — uncertainty did not differ across conditions, F(4,137)=1.68, p=0.16. It runs on perceived effort and reciprocity.

**[ACADEMIC]** Buell, Ryan W., Tami Kim, and Chia-Jung Tsay, "Creating Reciprocal Value Through Operational Transparency," *Management Science* 63, no. 6: 1673–1695. [link](https://pubsonline.informs.org/doi/10.1287/mnsc.2015.2411)

Field and lab experiments in food service. From the abstract: transparency "contributed to a **22.2% increase in customer-reported quality and reduced throughput times by 19.2%**."

**This is the best single citation available** — a real operation, real customers, and it improved satisfaction *and* speed, which pre-empts the usual operations objection.

### And the boundary condition that must shape the build

**[ACADEMIC]** Same 2011 paper, Experiment 5 (N=280): transparency × outcome favourability interaction, F(2,152)=4.42, p<0.05. **When the outcome was bad, transparency made things actively worse.** At 15 seconds, transparent M=2.47 vs instantaneous M=3.24, p<0.05. The authors note benefits "began to decline after 30 seconds", and "even earlier, at 15 seconds" in one context.

Corroborated in the field: **[ACADEMIC — working paper, not journal-published]** Buell, Porter and Norton, "Surfacing the Submerged State", HBS Working Paper 14-034 ([PDF](https://www.hbs.edu/ris/Publication%20Files/14-034_16ccb2b4-1a24-47b5-8bcf-dca2720bb96f.pdf)). Boston residents shown the work being done submitted **60% more service requests across 38% more categories** over 13 months, and became **14% more trusting**. But residents shown transparency into a **backlog the city was failing to clear** were "no more nor less trusting" than those shown nothing. Transparency into failure bought nothing.

**[INFERENCE]** This is the design rule, and it is where a credible pitch separates itself from a naive one: **build the failure branch first.** A substitution experience that narrates its work while failing to find the customer's items will cost more than silence. Show the work when the pick is going well; when it is not, lead with the remedy, not the narration.

### Amazon removed the technology that eliminated the wait — because customers preferred legibility

This is the most expensive validation of the thesis on record, and it is in Amazon's own words.

**[PUBLISHED]** Amazon pulled Just Walk Out from US Amazon Fresh stores and replaced it with Dash Cart (announced April 2024; page dated 27 January 2026), retaining Just Walk Out at Amazon Go, UK Amazon Fresh and third-party retailers. Amazon's stated reason: customers wanted **"the ability to easily find nearby products and deals, view their receipt as they shop, and know how much money they saved while shopping throughout the store"** and **"A running tally of purchases is more important to them. Customers want to manage their budget during their shopping journeys, in real time."**

Source: [Amazon, Just Walk Out / Dash Cart](https://www.aboutamazon.com/news/retail/amazon-just-walk-out-dash-cart-grocery-shopping-checkout-stores)

Amazon-published Dash Cart figures: **over 80% of daily Dash Cart transactions are from repeat users**, a **98% customer satisfaction rating**, and **Dash Cart shoppers spend 10% more** than non-Dash Cart shoppers at Amazon Fresh.

**Caution:** all self-reported by Amazon with no stated methodology or comparison design. The 10% is almost certainly selection-confounded — people who choose smart carts are bigger shoppers. Use directionally, attributed to Amazon, never as an effect size.

Leandro Balbinot, CTO and Head of Supply Chain, Amazon Grocery/Whole Foods: *"You see your running total update in real-time as items go in or out of your cart, making it effortless to track your basket."* An Amazon spokesperson offered only *"We've seen positive results, with higher customer shopping satisfaction scores and increased purchasing"* — no numbers.
Source: [Retail Technology Innovation Hub, 15 April 2026](https://retailtechinnovationhub.com/home/2026/4/14/life-after-just-walk-out-amazon-continues-dash-carts-push-at-whole-foods-market-stores)

**[INFERENCE]** Frictionlessness lost to transparency, at Amazon's scale and expense. That is Buell's finding, discovered the hard way. Lead the pitch with this, not with a vision statement.

### Woolworths Group already ships a legible-trip screen — gated behind Everyday Rewards

**This is the single most useful precedent in the document**, and I initially missed it.

**[PUBLISHED]** Woolworths Group's **Scan&Go Trolley** launched August 2024 in 10 NSW stores; by 10 July 2025 it had reached **35 stores** (NSW 20, VIC 7, QLD 8). Published figures: **"over seventy percent of Scan&Go Trolley users are repeat customers."** And the unlock mechanism, verbatim: **"Scan your Everyday Rewards card to unlock a device and pop it on your trolley."** The screen tracks spend in real time.

Source: [Woolworths Group newsroom, 10 July 2025](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2025/woolworths-scan-go-trolley-rolls-out-to-more-new-stores-across-a.html)

**[INFERENCE]** Same corporate group. Same loyalty scheme — Everyday Rewards operates in New Zealand too. Already using the loyalty card as the key to a screen that makes the trip legible. And that screen currently shows a **running total and little else**. The gap between "running total" and what Instacart's carts do (below) is the opportunity, and Woolworths' own Australian business has already half-crossed it.

### What the smart carts actually put on screen: ads, coupons and games

**[PUBLISHED — but a VENDOR CLAIM from a grocer's point of view]** Instacart's Caper Carts run **"Quests" — "interactive mini-games that customers can complete using a Caper Cart"** that **"appear on the Caper Cart digital screen with lights and sounds."** Mechanics include flash-deal treasure hunts, **"credits, like $10 off their next visit, when they complete a 'shopping streak,' such as three shops with a Caper Cart in one month"**, and coupon-clipping credits **"equivalent to $5 at the end of their shop."** Launch retailers Schnucks and Wakefern; brands General Mills and PepsiCo. Instacart reports a **net promoter score of more than 70 at ramped locations** and that **more than 40% of Caper Cart users clip coupons**.

Source: [Instacart, 7 October 2024](https://company.instacart.com/pressreleases/instacart-launches-new-gamified-capabilities-savings-on-caper-carts)

**[PUBLISHED — vendor]** In-store cart advertising opened to **"more than 7,000 brand partners"** (March 2025). Ads are **"inventory- and aisle-aware"** — they fire only when the shopper is in the relevant aisle and the item is in stock. The dwell-time pitch, verbatim: **"On average, customers spend more than 30 minutes shopping in-store with a Caper Cart."** ALDI, Kroger, Schnucks and Wakefern named.

Source: [Instacart, 25 March 2025](https://company.instacart.com/pressreleases/instacart-expands-in-store-advertising)

**[PRESS citing retailer-published data — the strongest numbers here]** **Soelbergs Market** (Utah) reported that **40% of smart cart users who saw an omnichannel offer redeemed it** by placing an order through the retailer's Instacart app, and that **55% of Caper Cart orders included at least one coupon**. Named deployments include **Coles Supermarkets (Australia)** and Aldi South Group (Austria).

Source: [Grocery Dive, 13 August 2025](https://www.grocerydive.com/news/instacart-smart-carts-retail-media-soelbergs/757373/)

**[INFERENCE]** Coles is already running Instacart Caper Carts in Australia. That is the competitive frame for a Woolworths pitch, and it is verifiable. Note also which numbers to trust: the *retailer*-reported Soelbergs figures will survive scrutiny in a room; Instacart's own product statistics are supplier marketing.

### Substitution at the pick — real engineering, deliberately thin on outcomes

**[PUBLISHED]** Instacart's engineering team published its replacement-recommendation architecture: a **cold-start Siamese network** over product-name text (BERT embeddings), categorical features (brand, size, aisle, department), binary dietary attributes (kosher, organic, vegan) and pre-trained product embeddings; plus an **engagement model** memorising historical approval rates for high-frequency products; ensembled as `final_score = engagement_score * weight + cold_start_score * (1-weight)`.

The most transferable design decision: the schema moved from `(source_product_id, replacement_product_id)` to **`(retailer_id, source_product_id, replacement_product_id)`** so that store brands can be prioritised over universally available brands. For a grocer with its own private label, that is the whole idea in one line.

Published outcome: **"more than 95% of replacements picked by Instacart shoppers are included within the candidate set."** Online tests showed "statistically significant improvements" in `replacement_issues_per_delivery` — **but no absolute numbers are published**.

Source: Bajaj & Prasad, Instacart engineering — [tech.instacart.com](https://tech.instacart.com/how-instacart-uses-machine-learning-to-suggest-replacements-for-out-of-stock-products-8f80d03bb5af) (Medium login-walled; readable via [Machine Learning Times republication](https://www.predictiveanalyticsworld.com/machinelearningtimes/how-instacart-uses-machine-learning-to-suggest-replacements-for-out-of-stock-products/14118/)). **Publication date could not be verified** — cite without a date.

**[PUBLISHED]** Instacart's help centre documents what the customer controls: **"You can add items until your shopper checks out"** (excluding alcohol, Rx, items over $49.99 and some retailers), **"You can track your shopper's progress and view item changes in the Instacart app"**, live chat with the shopper, and per-item replacement preference set in advance — **"Best match"**, a specific item, or **"Refund"**.

Source: [Instacart help](https://www.instacart.com/help/section/2114054412)

**Do not overclaim this.** Instacart's own documentation describes preferences set *in advance*, plus notifications, plus chat. It does **not** describe a hard real-time approve/reject gate that blocks the shopper. The common framing of "approve substitutions in real time" is closer to chat-plus-notification. **[INFERENCE]** on that distinction.

**[INFERENCE]** Which means the real-time substitution gate — the customer deciding, in the window, with points and price visible — is **not a solved product anywhere I could find**. Combined with the fact that nobody publishes a substitution-accuracy figure, this is the most defensible thing on the list to pilot.

### Scan & Go and in-trip personalisation — Sainsbury's is the best-documented

**[PUBLISHED]** Sainsbury's FY2025 preliminary results (17 April 2025): **"On average, self-service participation has increased to over 70 per cent of transactions compared to around 40 per cent of transactions five years ago."**

**Critical nuance — do not misreport this.** That is **self-service overall** (self-checkout *and* SmartShop), **not SmartShop alone**. It is frequently misquoted as a SmartShop adoption figure.

The same release states: **"Work is also underway to improve the functionality of SmartShop handsets by digitising the in-store customer journey, for example enabling product finding and personalisation of offers."**

Source: [Sainsbury's FY2025 preliminary results](https://corporate.sainsburys.co.uk/news/press-releases/preliminary-results-for-the-52-weeks-ended-1-march-2025/)

**[PUBLISHED]** FY2026 preliminary results (23 April 2026): **"SmartShop extended to another 100 stores and now available in the majority of supermarkets"**; **"Introduced enhanced features such as Product Finder"**; **"Continuing to develop our Retail Media capabilities, including exploring further opportunities within SmartShop"**; and **"Your Nectar Prices now rolled out to cover all supermarket checkouts - previously only available using Online and SmartShop."**

Source: [Sainsbury's FY2026 preliminary results](https://corporate.sainsburys.co.uk/news/press-releases/preliminary-results-for-the-52-weeks-ended-28-february-2026/)

**Honest gap:** Sainsbury's has **never published a SmartShop-specific adoption percentage**. If you need one, it does not exist publicly.

**[PRESS]** Tesco added to Scan as you Shop an in-app shopping list surfaced on the handset showing **checkboxes, aisle numbers and stock levels per product**. Nazma Ali, Head of Product at Tesco: *"We have lots planned in this area so watch this space."* No store count or adoption figures disclosed.
Source: [Retail Technology Innovation Hub, 27 October 2025](https://retailtechinnovationhub.com/home/2025/10/26/tesco-adds-new-feature-to-scan-as-you-shop-solution-as-retailers-store-shopping-trip-evolves)

### Woolworths NZ has a real, priced, growing wait

**[PRESS]** Woolworths NZ introduced a **flat $3.50 fee on online orders** for pick-up, replacing a structure of $5 for orders under $50 and free over $50. Woolworths said additional revenue from the blanket fees would fund further investment "in innovation, or AI and automation capabilities, such as its picking and packing machines in Auckland and Christchurch."

At its Penrose warehouse in Auckland, Woolworths runs a machine unit imported from the United States, almost 6 m high and 32 m long, that picks grocery items onto a conveyor for packing by staff — reported as **six times faster** than picking around a store. An "auto bagging" machine that packs filled bags into crates for delivery was described as soon to be operational.

Sources: [The Post, 2026](https://www.thepost.co.nz/business/360935320/woolworths-introduces-350-fee-all-online-orders) (paywalled — figures above are from the accessible summary and from [Stuff](https://www.stuff.co.nz/nz-news/360928803/woolworths-charge-flat-fee-online-orders-next-week))

**[INFERENCE]** This is the pitch in one line: Woolworths NZ now *charges customers for the wait* and is spending the money making the wait shorter. Nobody is making the wait *worth something*. That is the gap, and it needs no new infrastructure — the order-placed-to-collected window already exists, is already instrumented, and now has a price attached that customers notice.

### The pick window and the substitution moment

**[PUBLISHED]** Woolworths' own Olive release describes identifying specials and **"smart swaps"** to help families save money — a substitution concept the retailer has already named and shipped in Australia.

Source: [Woolworths Group newsroom, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html)

**[PUBLISHED]** Woolworths' staff-facing agent already suggests product alternatives — "organic, cheaper options" — and does price comparison and savings calculation.

Source: [iTnews, 28 April 2026](https://www.itnews.com.au/news/woolworths-gives-agentic-powered-olive-chatbot-to-its-200000-staff-625339)

**[INFERENCE]** Substitution is the highest-value wait moment in grocery because it is the one moment where the customer's attention, a decision, and a margin/points lever all coincide. Woolworths has built the swap logic. It has not connected it to Boosts.

### The approval gate is an unused surface

**[PUBLISHED]** Woolworths has publicly committed that customers "will remain in complete control, reviewing and approving all items before checkout" (Amitabh Mall, 29 June 2026), and Woolworths told RNZ: *"Customers will remain in full control - they can view, edit, and swap any suggested items before they reach the checkout."*

Sources: [Woolworths Group newsroom, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html) · [RNZ, 20 January 2026](https://www.rnz.co.nz/news/business/584510/how-ai-might-help-you-do-your-supermarket-shopping)

**[INFERENCE]** A mandatory review step is a guaranteed-attention screen that Woolworths has already promised to build and that currently carries no loyalty content and no disclosure. It is the cheapest high-value surface in the whole journey.

### The NZ meal-planning wait — and the cautionary precedent

**[PRESS]** Pak'nSave launched the **Savey Meal-bot** in July 2023, an AI recipe generator built to help households economise and cut food waste from ingredients the user types in. When a commentator (Liam Hehir) asked for recipes using only water, bleach and ammonia, it produced an "aromatic water mix" — a chlorine gas recipe. Other reported outputs included a "bleach-infused rice surprise". Foodstuffs said it had "included a number of safeguards", had rules "to prevent the use of items that aren't ingredients", required users to confirm they were 18+, and would "keep fine-tuning". No usage figures were published.

Source: [NZ Herald, 11 August 2023](https://www.nzherald.co.nz/nz/paknsave-ai-meal-bot-suggests-deadly-and-toxic-spreads-supermarket-says-it-will-keep-fine-tuning/6BHCPHS7BNGQZJHOBI5H5USAPQ/)

**[INFERENCE]** This is the most useful precedent in the whole document for a New Zealand pitch, because it is local, it is memorable inside both retailers, and it is a *failure*. Any meal-planning concept put to Woolworths NZ must lead with the boundary — constrained to the real catalogue, never generative free-text about consumables — or it will be pattern-matched to Savey and declined.

### The loading screen: no precedent, but the best experimental backing of any surface

**[INFERENCE]** I found **no credible evidence that any grocer has shipped value into an app load, splash or waiting state** — not Instacart, not Amazon, not Sainsbury's, not Tesco, not Woolworths. Nobody publishes about it, which most likely means nobody is doing it deliberately. I am not going to manufacture an example.

But the position is stronger than "untested", and there is an irony worth putting in front of the client: **Buell and Norton's experiments were loading screens.** The manipulation in Experiment 1 was a waiting screen — the transparent condition showed "a continually changing list of which sites were being searched" with fares animating in as they were found; the control showed "a progress bar that gradually filled at a uniform rate".

The control condition — the plain progress bar — is what essentially every grocery app ships today. The transparent condition is the one that beat *instant results* in a forced choice 62–63% of the time. Nobody in grocery has built it.

**[INFERENCE]** So: the loading state is the least-exploited surface in grocery and the one with the most direct experimental evidence behind it. That said, for a six-week pilot the money is in the **longer** waits — the order-placed-to-picked window, the substitution decision, the pre-checkout review step, the click-and-collect arrival wait. Those are minutes to hours, already instrumented, and now priced. Use the loading-screen research as the *argument*; pilot on the longer waits.

### One famous number you must not use

**[PRESS — and a warning]** The Domino's Pizza Tracker (launched 2008) is safe to cite as a design precedent and **unsafe to cite with any number attached.** The Hustle investigated it directly: **Domino's declined to be interviewed**, and the widely circulated business-impact figures trace to a Campaign Live case study, **not to Domino's**. The only figure that stands up is that Domino's aimed to grow digital sales "from 20% to 50% of its business."

Source: [The Hustle, 22 August 2025](https://thehustle.co/originals/how-the-dominos-pizza-tracker-conquered-the-business-world)

The commonly repeated "boosted online ordering profits by 23%" and "online guests spent on average $2 more" could not be traced to any Domino's filing, earnings call or release. **Leave them out.**

---

## NZ and Australia

### Verified

| Fact | Detail | Source |
|---|---|---|
| Countdown → Woolworths rebrand | Announced July 2023; **NZ$400m over three years** to renew the store network; **191 stores** in New Zealand; Managing Director at the time Spencer Sonn; introduced a "Fresh or Free Guarantee". Business traded as Woolworths before being renamed Countdown in 2011. | [Retail Insight Network, 15 April 2024](https://www.retail-insight-network.com/news/woolworths-new-zealand-countdown/) |
| Everyday Rewards NZ replaced Onecard | Launched nationwide **February 2024**. 1 point per $1; **2,000 points = $15 voucher**; Boosts = personalised offers; Member Prices; bp foundation partner. | [Woolworths Group, 1 Feb 2024](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2024/woolworths--first-loyalty-programme-members-score-a-surprise-boo.html) · [Supermarket News NZ](https://supermarketnews.co.nz/news/local/woolworths-new-zealands-new-loyalty-programme/) |
| Everyday Rewards NZ scale | **2.1 million members** in New Zealand (Woolworths' statement to RNZ). | [RNZ, 11 June 2026](https://www.rnz.co.nz/news/personal-finance/597842/supermarket-loyalty-programmes-not-all-they-re-cracked-up-to-be-consumer-warns) |
| Agentic AI is **Australia only** | Olive / Snap & Shop / Smart Baskets rolled out to Woolworths app customers in pick up and delivery mode during **July 2026**, Australia. The release names no NZ market. | [Woolworths Group, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html) |
| NZ timing is explicitly undecided | "Woolworths New Zealand could not say when it would be launched here, but said it would likely come after Australian customers gained access." RNZ, 20 January 2026, also reported "no set timeline for the launch in New Zealand". | [RNZ, 20 January 2026](https://www.rnz.co.nz/news/business/584510/how-ai-might-help-you-do-your-supermarket-shopping) |
| Woolworths NZ pricing boundary | Woolworths NZ uses electronic shelf labelling in nearly all stores but **"does not use dynamic or any personalisation in pricing."** | [RNZ, 6 March 2026](https://www.rnz.co.nz/news/business/588840/worries-ai-could-be-used-by-supermarkets-to-charge-customers-more) |
| Online order fee | Flat **$3.50** fee on online orders for pick-up, replacing $5 under $50 / free over $50. Revenue earmarked for innovation, AI and automation including picking and packing machines in Auckland and Christchurch. | [Stuff](https://www.stuff.co.nz/nz-news/360928803/woolworths-charge-flat-fee-online-orders-next-week) · [The Post](https://www.thepost.co.nz/business/360935320/woolworths-introduces-350-fee-all-online-orders) |
| Automation in NZ | Penrose (Auckland) machine unit ~6 m high, 32 m long, picks to a conveyor for staff packing, reported six times faster than in-store picking; auto-bagging machine coming. Christchurch also has picking/packing machinery. | as above |
| Scan&Go Trolley (**Australia**) | Launched August 2024 in 10 NSW stores; **35 stores** by July 2025 (NSW 20, VIC 7, QLD 8). **"over seventy percent of Scan&Go Trolley users are repeat customers."** Unlocked by scanning an **Everyday Rewards card**. Screen shows real-time spend. **No NZ deployment found.** | [Woolworths Group, 10 July 2025](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2025/woolworths-scan-go-trolley-rolls-out-to-more-new-stores-across-a.html) |
| Coles smart trolleys (**Australia**) | Coles Supermarkets is a named Instacart Caper Cart deployment. | [Grocery Dive, 13 August 2025](https://www.grocerydive.com/news/instacart-smart-carts-retail-media-soelbergs/757373/) |
| Foodstuffs Club+ | Launched **15 June 2026** across New World, PAK'nSAVE, Four Square. New World **0.75%**, Four Square **0.38%**, **PAK'nSAVE earns nothing**. Clubcard closed **26 July 2026**. Promises "personalised Club+ Picks". | [Foodstuffs SI, 18 May 2026](https://www.foodstuffs-si.co.nz/news-room/2026/new-world-pak-nsave-four-square-launch-club---a-smarter-way-to-save-on-groceries) |
| Club+ removed benefits | 8c/L Everyday Fuel Discount at Z and Caltex removed (Consumer NZ values the old discount at ~**$208/year** on a 50 L weekly fill); loyalty membership now **required** to shop online or click-and-collect at Foodstuffs. | [Consumer NZ, 18 June 2026](https://www.consumer.org.nz/shopping/supermarkets/the-fine-print-foodstuffs-club-card) |
| Foodstuffs analytics | Consumer NZ states Foodstuffs uses **dunnhumby** for pricing analytics. Foodstuffs says "we do not use customer data to increase prices". | [RNZ, 11 June 2026](https://www.rnz.co.nz/news/personal-finance/597842/supermarket-loyalty-programmes-not-all-they-re-cracked-up-to-be-consumer-warns) |
| Pak'nSave Savey Meal-bot | Launched July 2023; produced dangerous outputs including a chlorine gas "aromatic water mix"; Foodstuffs said it would "keep fine-tuning". | [NZ Herald, 11 August 2023](https://www.nzherald.co.nz/nz/paknsave-ai-meal-bot-suggests-deadly-and-toxic-spreads-supermarket-says-it-will-keep-fine-tuning/6BHCPHS7BNGQZJHOBI5H5USAPQ/) |
| Foodstuffs facial recognition | Foodstuffs North Island began trialling facial recognition in February 2024 in Pak'nSave and New World stores, technology in use since 2022, to detect previously trespassed people. | [Wikipedia — Foodstuffs](https://en.wikipedia.org/wiki/Foodstuffs_(company)) — **weak source, verify before use** |
| NZ loyalty penetration | **84%** of New Zealanders use supermarket loyalty cards. | [Consumer NZ, 28 March 2025](https://www.consumer.org.nz/about-us/media-releases/consumer-nz-urges-new-zealand-to-learn-from-australia-s-supermarket-inquiry) |
| NZ pricing trust | Only **35%** have high trust in supermarket pricing and promotions; **86%** support Australian-style price regulation; **82%** report food budgets under strain; **71%** bought more budget/home-brand products. | [RNZ, 11 June 2026](https://www.rnz.co.nz/news/personal-finance/597842/supermarket-loyalty-programmes-not-all-they-re-cracked-up-to-be-consumer-warns) |

### The New Zealand regulatory frame

**[PUBLISHED — regulator]** Grocery in New Zealand is regulated under the **Grocery Industry Competition Act 2023**, alongside the Commerce Act 1986 and Fair Trading Act 1986. **Pierre van Heerden** was appointed the first **Grocery Commissioner** on **13 July 2023**. The Commission's stated focus includes "creating pricing and promotional transparency for consumers", a Grocery Supply Code, a wholesale regime, and ongoing competition monitoring. Published instruments include the **Annual Grocery Report**, the **Grocery Supply Code**, a **Consumer Complaints Disclosure Standard**, and **Unit Pricing Regulations effective 31 August 2023**.

Source: [Commerce Commission — Grocery](https://www.comcom.govt.nz/regulated-industries/grocery/)

**[PRESS]** The Commerce Commission recommended that promotional and pricing practices and loyalty programme terms be made easy for consumers to understand, and recommended **transparency in disclosure regarding loyalty programmes and data collection** — but it did **not** recommend a review of loyalty programmes. Australia's ACCC, by contrast, recommended a **review of loyalty programmes' value within three years**. Consumer NZ's Chief Executive Jon Duffy: *"With fewer players in the market, our situation is, in many ways, worse than Australia's, meaning we need a stronger response."*

Sources: [Consumer NZ, 28 March 2025](https://www.consumer.org.nz/about-us/media-releases/consumer-nz-urges-new-zealand-to-learn-from-australia-s-supermarket-inquiry) · [RNZ](https://www.rnz.co.nz/news/business/563106/commerce-commission-wants-more-rules-for-big-supermarket-players)

**[INFERENCE]** The regulatory direction of travel in New Zealand is transparency of promotions and of loyalty data use. A pilot whose core mechanic is *disclosing* why a product was suggested and what it earns is aligned with where the regulator is heading, not exposed to it. That is a rare position and worth saying out loud in the pitch.

### Commonly believed about Woolworths NZ that I could NOT verify

- **That Olive, Snap & Shop or Smart Baskets are live in New Zealand.** They are not, on any source I found. Australia only, July 2026, with NZ timing explicitly unstated.
- **That Olive integrates Everyday Rewards.** The Woolworths release does not say so. One outlet said it is "expected to". Treat as unconfirmed.
- **That Woolworths NZ runs Scan&Go or smart trolleys.** I could not verify either in New Zealand. The **Scan&Go Trolley is verified in Australia** — 35 stores as at July 2025, launched August 2024, unlocked with an Everyday Rewards card, over 70% repeat users ([Woolworths Group, 10 July 2025](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2025/woolworths-scan-go-trolley-rolls-out-to-more-new-stores-across-a.html)). No New Zealand deployment found. **Ask, do not assert** — this is a good opening question for the meeting.
- **Everyday Extra (the paid subscription) availability in New Zealand** — not verified.
- **Any Woolworths NZ-specific AI or personalisation programme of its own.** I found none published. NZ appears to be a follower of Australian builds.

---

## Four concepts for a Woolworths NZ pilot

Design constraints I have held to, all evidenced above:

- Everyday Rewards NZ earns 1 point per $1 and pays $15 at 2,000 points. Boosts already exist as the personalisation engine.
- Woolworths NZ has publicly said it does **not** personalise pricing. **None of these touch price** — they touch points and suggestions.
- Woolworths has publicly said it has **"no plans to place items in baskets based on commercial arrangements"**. So none of these propose hidden paid placement. Boosts are used only as what they already are: opt-in, member-facing, clearly-marked loyalty offers.
- Woolworths has publicly committed to a human approval step before checkout. That step is a surface, not an obstacle.
- The local memory of Savey Meal-bot means safety boundaries go first, not last.
- Buell's Experiment 5 says transparency into a *failing* process is worth zero at best. **Every concept below needs its failure branch built first.**

All four sit on surfaces that already exist. None requires a platform rebuild. And per the Tesco and Woolworths precedents, all four should run **staff-first** before any customer sees them — Tesco put 280,000 colleagues on its assistant before customer rollout, and Woolworths put 200,000+ staff on Olive before July. That is the six-week shape.

---

### 1. Boost the Basket — Boosts that land while your order is being picked

**What the customer sees.** They place a click-and-collect or delivery order. In the window between placing it and it being picked, the app shows at most three personalised Boosts that apply to *this* order — a swap to a Boosted brand already in their basket, or one add-on they buy most fortnights. Each one shows the points it earns and how much closer that puts them to their next $15. Each supplier-funded one is labelled as such. One tap accepts; doing nothing changes nothing.

**Wait moment.** Order placed → order picked. Real, instrumented, minutes-to-hours, and now something the customer has paid $3.50 for.

**Who funds it.** Existing Boost inventory — the partner-funded offers Everyday Rewards already issues — plus Woolworths' loyalty budget for margin-protecting swaps. **No new commercial model, and no hidden placement:** every Boost is shown as an offer, marked as one, and does nothing unless the customer taps it. This respects Woolworths' stated position on commercial arrangements ([SmartCompany, 15 January 2026](https://www.smartcompany.com.au/retail/woolworths-ai-chatbot-olive-shopping-basket-product-selection/)).

**Measured on.** Boost activation rate in-window vs. Boosts sent by email; incremental basket value per order; points earned per active member; swap acceptance rate; **substitution satisfaction** — the metric nobody in this industry publishes; and a hard guardrail: complaint and opt-out rate must not move.

**Failure branch (build first).** When the pick is going badly, the window shows the remedy — a like-for-like swap or a refund choice — not a narration of the search. Buell's Experiment 5 is explicit that transparency into failure is negative.

**Nearest precedent.** Woolworths' own "smart swaps" in Olive, shipped in Australia July 2026 ([Woolworths Group, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html)) joined to Everyday Rewards Boosts as Woolworths already defines them in New Zealand ([Woolworths Group, 1 Feb 2024](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2024/woolworths--first-loyalty-programme-members-score-a-surprise-boo.html)). The mechanic closest to this in market is Instacart's — **"You can add items until your shopper checks out"**, with per-item replacement preferences and shopper chat ([Instacart help](https://www.instacart.com/help/section/2114054412)) — plus its published replacement model, whose key design choice was keying substitutions to `retailer_id` so **store brands can be prioritised** ([Instacart engineering](https://www.predictiveanalyticsworld.com/machinelearningtimes/how-instacart-uses-machine-learning-to-suggest-replacements-for-out-of-stock-products/14118/)).

The commercial model is already articulated by Tesco, on an investor call: **"smart stock, which can anticipate when customers are running low on household products. This allows us to send timely personalised reminders, helping both customers and suppliers, and setting a new benchmark for precision-led retail media"** ([Tesco Interim Results 2025/26 transcript, 2 October 2025](https://www.tescoplc.com/media/v52epwqm/tesco-plc-interim-results-2526-investor-analyst-call-transcript.pdf)). That is the funding argument in Tesco's words, not assembl's.

**Why this one is the strongest.** Nobody — not Ocado, Instacart, Kroger, Albertsons or Woolworths — has published a substitution-accuracy figure, and Instacart's own documentation shows preferences set *in advance* rather than a real-time decision gate. A live substitution decision with points and price visible is genuinely unclaimed, and it is measurable.

---

### 2. The Runway — show the last mile to the $15

**What the customer sees.** The Everyday Rewards ladder stops being abstract. On the app home and on the post-checkout confirmation: "You're $180 of shopping from your next $15" — and then the two or three specific Boosts that shorten that most, with the arithmetic shown. Not a progress bar for its own sake: a named, checkable path with the maths on display.

**Wait moment.** App-open dwell and the post-checkout confirmation screen — the two moments where the customer has finished the task and is receptive rather than hurried.

**Who funds it.** Woolworths loyalty budget, with supplier-funded Boosts populating the path. Zero incremental cost if the Boosts are ones already being issued.

**Measured on.** Reward redemption rate; points velocity (days to reach 2,000); scan rate on the pilot cohort against control; and NPS, because the point of showing the arithmetic is trust.

**Failure branch (build first).** If a member is a long way from a reward, do not show a near-empty bar. Show the single most achievable Boost, or say nothing. A visible ladder the customer cannot climb is the "backlog" case from the Boston study — transparency into failure that bought nothing.

**Nearest precedent.** Three strong ones. First and best, **Woolworths has already published that this works**: in F24, Boost access was **up 9%** and *"members who boost reach[ed] their $10 value back more than five times faster than those who simply scan their card"* ([Woolworths Group Annual Report 2024](https://www.woolworthsgroup.com.au/content/dam/wwg/investors/reports/f24/f24/Woolworths%20Group%202024%20Annual%20Report.pdf)). The mechanic is proven; it is simply invisible to the member. This concept makes the five-times-faster path *legible*, which is the only thing standing between the mechanic and wider adoption. (Cite as F24, and note the $10 is the Australian threshold — New Zealand's is $15.)

For scale of what a mature version looks like: Sainsbury's has generated **17 billion personalised discounts** with **1 million weekly users** of Your Nectar Prices and **£60 million** of customer savings in a year, and is working towards **500 million personalised offers a week** ([Sainsbury's, 24 July 2025](https://corporate.sainsburys.co.uk/news/press-releases/unlock-shop-save-sainsburys-rolls-out-your-nectar-prices-across-tills-nationwide/); [Annual Report 2025](https://corporate.sainsburys.co.uk/media/e1lfnybd/sainsbury-annual-report-and-financial-statements-2025.pdf)).

Second, Woolworths' own published claim at NZ launch that members using tailored offers "could be earning rewards over twice as fast as our previous programme" ([Woolworths Group, 1 Feb 2024](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2024/woolworths--first-loyalty-programme-members-score-a-surprise-boo.html)) — a promise made and never made visible. This concept is Woolworths keeping its own word.

Third: **Amazon removed Just Walk Out from US Amazon Fresh stores** because customers wanted to *"know how much money they saved while shopping"* and because *"A running tally of purchases is more important to them"* ([Amazon](https://www.aboutamazon.com/news/retail/amazon-just-walk-out-dash-cart-grocery-shopping-checkout-stores)). Woolworths Group's own Scan&Go Trolley already runs a real-time spend total, gated behind an Everyday Rewards card scan, with **over 70% repeat usage** across 35 Australian stores ([Woolworths Group, 10 July 2025](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2025/woolworths-scan-go-trolley-rolls-out-to-more-new-stores-across-a.html)). This concept is the same idea — running arithmetic, loyalty-keyed — moved into the app, in a market where the trolley does not exist.

It also directly answers the 35% pricing-trust figure ([RNZ, 11 June 2026](https://www.rnz.co.nz/news/personal-finance/597842/supermarket-loyalty-programmes-not-all-they-re-cracked-up-to-be-consumer-warns)) and rests on the field result that operational transparency raised customer-reported quality **22.2%** while cutting throughput times **19.2%** ([Buell, Kim & Tsay, *Management Science*](https://pubsonline.informs.org/doi/10.1287/mnsc.2015.2411)).

---

### 3. List to Trolley — Snap & Shop for New Zealand, Rewards-aware from day one

**What the customer sees.** Photograph a handwritten list stuck to the fridge, or a recipe from a magazine. It becomes a Woolworths NZ basket, with Member Prices and applicable Boosts already applied and labelled, and every line editable. Hard boundary, stated on the screen: it only ever matches items in the Woolworths catalogue. It does not invent recipes and it does not answer questions about anything that is not food.

**Wait moment.** The "what's for dinner / where's my list" moment before the shop begins — the dwell before the basket exists, which is where the most time is lost and where roughly 80% of the answer is already known from history.

**Who funds it.** Woolworths, on conversion and basket size. Boost placements can subsidise it once proven, but it should not launch dependent on supplier money — that keeps the first version clean.

**Measured on.** List-to-basket completion rate; time to build a comparable basket vs. control; basket size and item count; and one absolute: **zero unsafe outputs**, audited.

**Failure branch (build first).** When a list item has no catalogue match, say so plainly on that line and offer a search — never silently substitute something adjacent. An unexplained wrong item in a photo-built basket is the failure mode that kills trust in this feature.

**Nearest precedents, and the anti-precedent.** This is the most-validated concept of the four, which is both reassurance and a reason to move:

- **Woolworths' own Snap & Shop** shipped in Australia July 2026 doing exactly the photo-to-list step — but with no published loyalty integration ([Woolworths Group, 29 June 2026](https://www.woolworthsgroup.com.au/au/en/our-newsroom/latest-news/2026/woolworths-takes-the-hassle-out-of-the-weekly-shop-with-new-digi.html)).
- **Kroger** went live across its websites and apps on **28 July 2026** with an AI Shopping Assistant that **processes a photo of a handwritten list or recipe card** and takes a pasted URL to build a cart ([Kroger IR, 28 July 2026](https://ir.kroger.com/news/news-details/2026/Kroger-Helps-Families-Simplify-Back-to-Routine-Season-with-Fresh-Convenient-Meals-and-a-Smarter-Way-to-Shop/default.aspx)).
- **Target's List Scanner** scans a handwritten or digital list into the app for cart addition, and Target publishes that in-store app users have basket sizes **"nearly 50% higher"** ([Target, 12 November 2025](https://corporate.target.com/press/release/2025/11/target-launches-new-ai-powered-features-to-make-holiday-shopping-easier,-smarter-and-more-fun)).
- **Albertsons** ships the same family of tasks — Rapid Restock, Plan Meals, Shop Lists, Fridge Cleaner, Shop Recipe ([Albertsons, 3 December 2025](https://www.albertsonscompanies.com/newsroom/press-releases/news-details/2025/Albertsons-Companies-Accelerates-Digital-Transformation-with-the-Albertsons-AI-Shopping-Assistant-Redefining-the-Grocery-Shopping-Experience/default.aspx)).
- **Tesco** is running the same feature in a **280,000-colleague internal beta** before customer rollout ([The Grocer, 9 April 2026](https://www.thegrocer.co.uk/news/tesco-launches-meal-planning-basket-building-in-app-ai-assistant/717474.article)) — copy that de-risking model exactly.

The anti-precedent is local and must be named first in any conversation: Pak'nSave's Savey Meal-bot generating a chlorine gas recipe ([NZ Herald, 11 August 2023](https://www.nzherald.co.nz/nz/paknsave-ai-meal-bot-suggests-deadly-and-toxic-spreads-supermarket-says-it-will-keep-fine-tuning/6BHCPHS7BNGQZJHOBI5H5USAPQ/)). Catalogue-bound, not generative, is the entire safety argument.

**[INFERENCE]** Because four major grocers shipped this within nine months, it is the concept most likely to be already on a Woolworths NZ roadmap. Lead with it only if the room needs proof the category has moved; lead with concept 1 or 4 if they need something nobody else has.

---

### 4. Show Your Working — a receipt for every suggestion the agent makes

**What the customer sees.** At the approval step Woolworths has already promised to build, each suggested item carries one plain line: why it is there ("you bought this 9 of the last 12 shops"), whether a supplier paid for the placement, what it costs, and what it earns in points. A single tap opens the same explanation in full. The agent always presents as an agent, never as a person.

**Wait moment.** The pre-checkout review step — the mandatory approval gate. Guaranteed attention, already committed to publicly, currently carrying no loyalty content and no disclosure.

**Who funds it.** Woolworths' trust, risk and compliance budget — this is cheaper than a trust incident. Note the sequencing carefully: Woolworths has said it has **"no plans to place items in baskets based on commercial arrangements"**, so today most lines will read "no supplier paid for this", which is itself the most valuable thing the label can say. Build the mechanism now and it becomes the precondition that would let retail media enter the agent later, labelled and auditable, rather than being ruled out permanently.

**Measured on.** Trust and NPS on the pilot cohort; review-step completion vs. abandonment; opt-out rate; disputed-item rate; and Boost acceptance *after* labelling — the real question being whether honesty costs conversion. My expectation is that it does not, but that is the hypothesis, not the claim.

**Failure branch (build first).** When the agent is unsure, the receipt says so and the item is not pre-ticked. A confident-sounding wrong explanation is worse than no explanation — and per Buell's Experiment 5, narrating a process that is going wrong actively reduces perceived value.

**Nearest precedents.** Woolworths has already built the internal half of this: eight **"Agentic Judges"** vetting the agent's responses, including a "number cruncher" validating maths and pricing and a "product detective" for compliance ([iTnews, 28 April 2026](https://www.itnews.com.au/news/woolworths-gives-agentic-powered-olive-chatbot-to-its-200000-staff-625339)). This concept turns those checks customer-facing.

It answers, directly, the published criticism that an agent's priorities "reflect pricing strategies, promotional priorities and commercial relationships" rather than the customer's interests ([The Conversation, 16 January 2026](https://theconversation.com/do-woolworths-shoppers-want-google-ai-adding-items-to-buy-well-soon-find-out-273342)) — and the reporting that Woolworths **did not clarify** how Olive chooses between competing brands or whether private label could be prioritised ([SmartCompany, 15 January 2026](https://www.smartcompany.com.au/retail/woolworths-ai-chatbot-olive-shopping-basket-product-selection/)). That unanswered question is the one this concept answers.

It sits with the direction the Commerce Commission has signalled on loyalty and promotion transparency ([Commerce Commission](https://www.comcom.govt.nz/regulated-industries/grocery/)), and it has the "agent must present as an agent" lesson already paid for by Woolworths when Olive claimed to be human ([RNZ, 27 February 2026](https://www.rnz.co.nz/news/world/588177/australian-supermarket-giant-reins-in-ai-assistant-claiming-to-be-human)).

**The commercial argument that will actually land.** Woolworths is currently **defending NZCC criminal proceedings filed 5 May 2025 under section 10 of the Fair Trading Act** over the price consumers were to pay for grocery products, plus ACCC proceedings and a class action in Australia over discount pricing representations ([Woolworths Group Annual Report 2025](https://www.woolworthsgroup.com.au/content/dam/wwg/sustainability/reports/f25/Woolworths%20Group%20Annual%20Report%202025%20.pdf)). And on **7 July 2026** the Commerce Commission named **"over 50 different types of supplier payments"** worth around **$6 billion annually**, explicitly including **"promotional support"**, while closing an inquiry to prioritise **enforcement**, with penalties of **$500,000 to $10 million or three times the commercial gain** ([Commerce Commission](https://comcom.govt.nz/news-and-media/news-and-events/2026/supermarket-charges-on-suppliers-harming-grocery-competition/)).

Neither Cartology nor any retailer I checked publishes a labelling standard for sponsored placements.

**[INFERENCE]** So: a company being prosecuted over how it represented prices, whose supplier promotional payments are under active enforcement scrutiny, is about to hand basket-building to an AI — and nobody in the category has published a disclosure standard. Of the four concepts, this is the one no competitor is building, the one that compounds, and the one that is easiest to fund from a budget that already exists. **It is the licence under which everything else can ship.**

---

### Why these four, in one paragraph

Woolworths built an agent and did not connect it to its loyalty programme. It built the loyalty programme and never made the reward path visible. It runs a trolley screen in Australia that shows a running total and nothing else, unlocked by the very card this pitch is about. It has just started charging New Zealanders for the wait it is trying to shorten. Meanwhile Foodstuffs has spent the last ten weeks re-enrolling every customer it has onto a programme that promises personalisation it has not built, and Amazon has already proven — expensively — that shoppers prefer a legible trip to a frictionless one. Each concept above takes one existing surface and joins two things Woolworths already owns. None touches price, which is the line Woolworths NZ has publicly drawn. None proposes hidden paid placement, which is the line Woolworths has publicly drawn for its agent.

### If Kate can only pitch one

**Concept 1, Boost the Basket.** It sits in the one wait Woolworths NZ has just put a price on, it uses an engine that already exists in New Zealand, and it targets the single measurable outcome that **nobody in this industry has published** — substitution quality. Concept 4 is the one to bring as the boundary that makes concept 1 safe. Concept 3 is the most validated and therefore the most likely to already be on someone's roadmap.

---

## What I could not verify

Listed plainly, because an invented number is worse than a missing one.

1. ~~Australian Everyday Rewards membership~~ — **NOW RESOLVED from primary filings. Use 10.6 million active members (Q2 F26, +3.8% YoY) for Australia and 2.1 million (+6% YoY) for New Zealand.** Ignore 15.8m, 9.4m (that is H1 FY24) and Cartology's marketing "+11 million".
2. **Group scan rate / tag rate as a percentage.** Figures of 72% and 73.2% appeared in secondary summaries only. The filings state tag rates are *increasing* without giving a group percentage I could verify. **Do not quote a percentage.** Tesco's Clubcard penetration (**~85% across the group**) and Sainsbury's Nectar Prices participation (**over 85%**) *are* verified if you need a benchmark — but they are different metrics from a scan rate, so do not compare them directly.
3. **"Over 200 million personalised Boosts."** From an unparseable PDF extraction. Unverified. Leave out. **Use instead the verified F24 figure: Boost access up 9%, and Boost users reaching the $10 reward more than five times faster.**
4. **eCommerce penetration of 7.8% and sales growth of 16.3%.** Unreliable extraction. One secondary source gives online sales of $5.3bn for the half ([Inside FMCG, 25 Feb 2026](https://insidefmcg.com.au/2026/02/25/woolworths-profit-nearly-halves-as-pay-issues-persist/)) — that is reportable, the percentages are not.
5. **Whether Olive integrates Everyday Rewards.** Press expectation only. The primary release is silent.
6. **Any Woolworths **NZ** Scan&Go, smart trolley, or Everyday Extra offering.** Not verified in New Zealand. (The Scan&Go Trolley **is** verified in Australia — 35 stores, Everyday Rewards-gated, >70% repeat users. New Zealand: nothing found. Ask in the meeting.)
7. **Google Cloud's Woolworths New Zealand case study.** The page exists at [cloud.google.com/customers/woolworths-new-zealand](https://cloud.google.com/customers/woolworths-new-zealand) but would not render for me. Worth a manual look before the meeting — it may contain NZ-specific detail, and anything in it is a **[VENDOR CLAIM]** regardless.
8. *(see item 25 — NZ advertising code text)*
9. **Foodstuffs facial recognition detail** rests on a Wikipedia summary. Verify before repeating.
10. **Woolworths NZ team-member headcount** and the date the first rebranded store opened — not found.

11. **Whether Tesco's AI assistant is linked to Clubcard.** The Grocer says "previous shopping history and preferences" and does not say Clubcard. Other coverage does. Unverified — and it matters, because it is the closest analogue to this pitch.
12. **Any SmartShop-specific adoption percentage from Sainsbury's.** Never published. The "over 70% of transactions" figure is **self-service overall**, not SmartShop — frequently misquoted.
13. **Tesco and Walmart Scan & Go adoption figures.** Not published.
14. **Ocado's substitution capability or delivery-window design.** The only reachable Ocado engineering post was about triaging customer-service email with NLP (2016), with no outcome metrics. Do not assert Ocado substitution capability.
15. **Walmart substitution ML.** Nothing sourced. Do not claim it.
16. **Instacart's replacement-model publication date.** Cite the work without a date.
17. **Instacart Smart Shop launch date or metrics** — the investor page would not load.
18. **Carrefour Hopla's launch specifics or any Hopla outcome** — Carrefour's own page returned HTTP 402.
19. **Zalando's "up to 7% reduction in return rates"** — traced only to marketing blogs, never to Zalando. Do not publish.
20. **A "56% of Gen Z open to AI meal planning" PwC figure** — relayed second-hand, original never located. Do not publish.
21. **Anything about JD.com, or about 84.51°/Kroger Precision Marketing specifically.** Nothing sourced, despite two attempts. Also unsourced: **Albertsons Media Collective**, **Starbucks Deep Brew**, **Carrefour Links**, **Ahold Delhaize / AD Retail Media / Albert Heijn Bonus**, **Alibaba 88VIP**, and **Kroger Boost membership**. Real programmes, no verified figures — do not quote numbers for any of them.
22. **All Alibaba / Taobao / Alipay AI-agent figures** (300m MAU, 120m agent transactions in a week, etc.) — search-summary only, never fetched. Do not publish.
23. **Amazon Just Walk Out's "27 of 44 US Amazon Fresh stores" split** — press-reported, not verified against an Amazon source.
24. **Domino's Pizza Tracker business-effect figures** — see the warning above. Cite the Tracker, never a number.
25. **NZ Advertising Standards Authority code rule numbers and wording** on identifying advertising — [asa.co.nz](https://www.asa.co.nz/codes/codes/advertising-standards-code/) returned 403. The requirement exists; I cannot quote it. The UK CAP Code Section 2 text above **is** verified and can stand in as the principle, clearly attributed to the UK.
26. **FTC Endorsement Guides and Native Advertising guidance** — both FTC pages returned 403.
27. **IAB Australia retail media measurement standards** — page 404'd. Could not verify any IAB standard.
28. **AANA (Australian Association of National Advertisers) Code of Ethics** clause on distinguishable advertising — page 404'd.
29. **Commerce Commission's specific Fair Trading Act advertising guidance page** — 404'd. The Act's applicability to grocery is verified from the Commission's grocery page; the detailed guidance is not.
30. **Cartology's "11+ million active Everyday Rewards members"** — company marketing on a sales page, contradicted by Cartology's own solutions page (10.4m) and the H1 F26 filing (10.6m). Cite the filing.
31. **Tesco Clubcard Challenges conversion figures (76% / 62% / "half a billion extra points").** These are **Eagle Eye vendor claims**, not Tesco's, and the "half a billion" line could not be found in any Tesco primary document despite being attributed to Ken Murphy. Do not present as Tesco figures.
32. **Nectar total member count.** Not in either Sainsbury's document. "18 million members" and "260 million offers a week" appear only on content-farm sites — do not use.
33. **EU Digital Services Act Articles 25/26/27 text**, **IAB / IAB Australia retail media standards**, **ACCC Customer Loyalty Schemes Report**, and the **AANA Code of Ethics** — none sourced. Do not cite rule numbers for any of them.
34. **NZ Fair Trading Act 1986 ss. 9–13 full text** — legislation.govt.nz returned 403. Section 10's applicability is known only *secondhand*, via Woolworths' own annual report disclosure.
35. **The Commerce Commission's own media release on the Woolworths NZ pricing charges.** The facts on those proceedings come from Woolworths' filing, not the regulator's release. Worth finding before the meeting.
36. **Woolworths Group / Everyday Rewards privacy policy** on data use for personalised offers and advertising — 403/404. **This is a real gap:** if the pitch touches personal data, the actual policy needs reading first.
37. **Everyday Rewards Boosts consumer-facing mechanics** (everydayrewards.co.nz) — JavaScript-rendered, would not fetch. The Boost mechanic here is described **only** in the words of the annual reports. No claim is made about the opt-in flow or how individual offers are selected — **verify by opening the app before the meeting.**
38. **Tesco Media & Insight Platform's own website** and any **dunnhumby**-specific published figure for the Tesco relationship — did not resolve.

### Numbers I discarded

- Everything from three vendor pages that surfaced early: a claimed 10.9m member database with "email open rates rose 16%" and "NPS improved by 10%" attributed to Woolworths. These come from agency and vendor marketing ([maxemus](https://maxemus.com.au/portfolio/woolworths/), [Eagle Eye](https://eagleeye.com/blog/woolworths-ai-personalization-strategy)) and I could not corroborate any of them in Woolworths Group's own material. **Do not use.**
- A "0.5% to 1% return on spending" figure for NZ loyalty programmes appeared in a search summary but I could not tie it to a specific Consumer NZ or Commerce Commission publication. My own 0.75% arithmetic from published Everyday Rewards mechanics is defensible; that range is not.
- Any claim about Woolworths NZ AI plans beyond "likely after Australia". There is nothing more specific on the record.
