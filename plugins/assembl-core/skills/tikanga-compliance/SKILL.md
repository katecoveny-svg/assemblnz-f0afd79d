---
name: tikanga-compliance
description: |
  Fires on every customer-facing output — social posts, emails, press
  releases, web copy, agent responses, marketing materials, in-app
  messaging, support replies, ad creative, slide decks. Every. Time.

  Performs the four-pou check (rangatiratanga, kaitiakitanga,
  manaakitanga, whanaungatanga), enforces macrons in te reo Māori,
  applies the banned-words list (including the "AI" hard rule for
  customer-facing copy), and flags reserved taonga terms that require
  consultation before use.

  Trigger phrases / contexts: any customer-facing draft, "publish",
  "send", "tweet", "post", "newsletter", "press release", "campaign",
  Māori words appearing in copy, iwi or hapū references, kowhaiwhai or
  carving imagery, claims of te reo capability, anything destined for
  a public audience.
mandatory: true
applies_to: ["*"]
---

# Tikanga compliance — core skill

## When to use

Every customer-facing piece of text. Every. Time. That includes:

- Social posts (LinkedIn, X, Instagram, TikTok, Facebook)
- Email campaigns, transactional emails, newsletters
- Press releases, blog posts, articles
- Website copy, landing pages, microcopy
- In-product strings, error messages, onboarding flows
- Agent responses to end users
- Marketing materials, ad creative, slide decks
- Support replies and FAQ entries

If the output will be seen by anyone outside the build team, this skill
fires before the draft is approved.

## What this skill will NOT do

- Invent te reo Māori words or phrases.
- Claim mātauranga Māori expertise on behalf of assembl or the agent.
- Render a kowhaiwhai or carving pattern visually.
- Assign a kete name (or any taonga term) without consultation with
  mana whenua or kaitiaki.
- Replace tikanga consultation with AI judgement. The skill flags;
  humans decide.

## Tikanga check

This skill IS the tikanga check.

## Privacy Act check

Where tikanga compliance touches personal cultural identity (whakapapa,
iwi affiliation, hapū affiliation), apply IPP 1 minimisation — only
collect what is genuinely needed — and consult mana whenua before
recording or publishing. Whakapapa is taonga, not metadata.

## Workflow steps

### The four pou — apply all four

- **Rangatiratanga** (self-determination, authority): is the content
  respecting Māori authority over Māori knowledge and resources? Are
  mana whenua present in decisions about their content? If the content
  refers to a specific iwi, hapū, or marae, are the rights-holders the
  ones telling the story?
- **Kaitiakitanga** (guardianship, stewardship): is the content
  protecting Māori knowledge and taonga? Are we taking from Māori, or
  contributing to mana whenua? Treat mātauranga as taonga, not as a
  resource to extract.
- **Manaakitanga** (hospitality, reciprocal care): is the content
  welcoming, respectful, generous? Does it elevate the reader rather
  than diminish? In dispute, in support, in marketing — does the
  language carry care?
- **Whanaungatanga** (relationship, kinship): is the content building
  or strengthening relationships? Are credit and acknowledgement
  properly given? Are the people behind the work named where named is
  appropriate?

If any pou is failing, halt the draft and flag for human review.

### Macron enforcement — non-negotiable

Every te reo word with a macron MUST have it. Common ones to spot-check:

- Pīkau — kete name (customs broker pack)
- Tā — used as part of the Tā Mahara compliance pou
- Mahara — memory, recall (Tā Mahara pou)
- Mana — authority, prestige
- Kaupapa — purpose, plan, ground rules
- Aotearoa — New Zealand
- Māori — the people
- Pākehā — non-Māori New Zealander of European descent
- Tōro — kete name (commercial pack)
- Kahurangi — kete name
- Whānau — extended family

If you see "Pikau" without the macron, it is wrong. Same for "Maori",
"whanau", "Pakeha", "Toro". Fix before output.

When in doubt, check the Te Aka Māori Dictionary for spelling.

### Banned words and phrases

- **"AI" in customer-facing copy** — replace with "intelligent
  automation" or describe the function (per Plugin Architecture Canon
  §10 hard rule 4). Internal documentation is fine; customer-facing
  copy is not.
- Sacred taonga terms used as product names without consultation:
  "moko", "tāonga", "haka", "wahine".
- Kōwhaiwhai or carving patterns rendered visually (no generation, no
  pseudo-tā moko, no whakairo imagery).
- Claims of te reo capability ("our AI speaks Māori") without Te Hiku
  Media or kaitiaki consultation.
- Generic marketing filler that diminishes the reader: "cutting-edge",
  "synergy", "leverage" (as a verb), "disruptive", "game-changing".

### Reserved terms — consultation required

The following categories require consultation with the relevant
rights-holders before use:

- Anything that names a specific iwi or hapū.
- Anything that names a specific tribal taonga.
- Karakia, whaikōrero, waiata, mōteatea — sacred forms; not generated
  by the agent.
- Specific wāhi tapu, urupā, or ceremonial place references.

If the draft uses a reserved term and there is no consultation record,
halt and flag.

### Final pre-output checklist

1. Four pou applied — pass.
2. Macrons checked — pass.
3. Banned words scanned — pass.
4. Reserved terms either consulted or absent — pass.
5. "AI" not used in customer-facing copy — pass.
6. Output staged for human sign-off.

## References

- Te Hiku Media: `https://tehiku.nz`
- Karaitiana Taiuru — Indigenous Peoples AI Framework:
  `https://www.taiuru.maori.nz`
- Te Aka Māori Dictionary: `https://maoridictionary.co.nz`
- Te Mātāwai: `https://tematawai.maori.nz`
- Te Taura Whiri i te Reo Māori (Māori Language Commission):
  `https://www.tetaurawhiri.govt.nz`
- Te Mana Raraunga — Māori Data Sovereignty Network:
  `https://www.temanararaunga.maori.nz`
- Mead, H.M. (2003). *Tikanga Māori: Living by Māori Values*. Huia
  Publishers, Wellington.
