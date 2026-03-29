# Te Reo Maori AI Agent Research
## Global Best Practice for Multilingual, Culturally-Specialist AI Systems
**Prepared: 29 March 2026 | For: Assembl te reo agent suite design**

---

## 1. BEST MULTILINGUAL AI AGENTS GLOBALLY

### The 2026 Standard: Cultural Fluency, Not Just Translation

The global standard has shifted from multilingual translation to "cultural fluency" and agentic AI. The best systems do not simply convert words between languages -- they understand cultural contexts, idiomatic expressions, regional variations, code-switching, and adapt communication style to cultural expectations.

### Top Commercial Multilingual Platforms

| Platform | Languages | Key Differentiator |
|----------|-----------|-------------------|
| **Qwen 2.5** | 29+ languages | Top-ranked multilingual LLM, strong Asian language support, Apache 2.0 open-source |
| **Crescendo.ai** | 50+ languages | Native-level fluency, understands local slang/phrases/accents, multilingual VoC reports |
| **Aisera** | Multi-language RAG | Retrieves solutions from one language, delivers in another without extra steps |
| **Zowie** | Enterprise-scale | Deterministic reasoning engine prevents hallucinations, omnichannel deployment |
| **Natterbox** | Salesforce-native | Voice-first, prioritises routing and data security |
| **Retell AI / Brilo AI** | Real-time voice | Pairs ASR, LLM dialogue, and on-the-fly translation |

### What the Best Systems Do for Cultural Nuance

1. **Context-aware responses** -- understand that the same word/phrase carries different meaning across cultures
2. **Code-switching handling** -- seamlessly manage conversations that mix languages (critical for te reo Maori/English bilingual contexts)
3. **Cultural communication style adaptation** -- adjust formality, directness, and relationship-building approaches
4. **Multi-lingual RAG** -- retrieve knowledge in one language and deliver it in the user's preferred language
5. **Deterministic reasoning layers** -- prevent hallucinations, particularly critical for cultural and language content where errors carry deep offence

### Key Lesson for Assembl
Commercial platforms excel at high-resource languages but remain weak on indigenous and low-resource languages. Indigenous language support is led almost entirely by Indigenous-led initiatives, not commercial platforms. Assembl's te reo agent must be built with community partnership, not off-the-shelf multilingual tech.

---

## 2. INDIGENOUS LANGUAGE AI / TECHNOLOGY PROJECTS

### A. Te Hiku Media -- Papa Reo (Aotearoa NZ) -- THE GOLD STANDARD

**The single most important reference point for Assembl.**

- **Organisation**: Te Hiku Media, nonprofit Maori radio station, Kaitaia. Founded 1990. Led by Peter-Lucas Jones (CEO) and Keoni Mahelona.
- **Funding**: $13 million from MBIE for Papa Reo, a 7-year national data science initiative -- the only project of its kind not led by a university.
- **ASR Performance**: 92% accuracy for te reo Maori; 82% for bilingual English/te reo transcription.
- **Data Collection**: Crowdsourced via Korero Maori campaign -- 2,500 people signed up in 10 days, reading 200,000+ phrases, providing 300+ hours of labelled speech data.
- **Archive**: Whare Korero holds 30+ years of digitised archival material with 1,000+ hours of native speaker recordings.
- **Tools Built**: Automatic speech recognition, pronunciation feedback, text-to-speech.
- **Partners**: Mozilla, Cambridge University, Oxford University, NVIDIA, RNZ, Nga Taonga Sound & Vision.
- **Expanding**: Working with Hawaiian (Lauleo project), Samoan, and Pacific communities.

**The Kaitiakitanga License -- Critical for Assembl**

Te Hiku Media created the Kaitiakitanga License, described as "like open source but with affirmative action." Core principles:

- **Rangatiratanga**: Inherent right of data custodians to exercise control over their own data -- self-determination/sovereignty.
- **Whakapapa**: All data carries a genealogy, requiring comprehensive metadata about provenance and context.
- **Kaitiakitanga**: Data is never "owned" but entrusted to respective Maori communities. Must support empowerment and autonomy of Maori.
- Prohibits use of data in applications that surveil, discriminate, or violate human rights.
- Te Hiku recommends the name "Kaitiakitanga" be reserved for tangata whenua of Aotearoa; other communities should adopt a word from their own language.

**Position on Big Tech**: Te Hiku refused to use OpenAI's Whisper, calling it "another case study in colonisation." Their CEO stated at the 2025 World Indigenous Business Forum: "There is no artificial intelligence without Indigenous data. If we do not control our own data, we will lose not just our language, but our identity."

**Lesson for Assembl**: Any te reo agent MUST engage with Te Hiku Media's work. Consider approaching them for partnership or at minimum operate under principles aligned with the Kaitiakitanga License. Do not train on or use te reo data without provenance and community consent.

---

### B. Hawaiian Language (Olelo Hawaii)

- **Lauleo Project**: Gathering Hawaiian speech data to create voice-to-text AI tools, built on Te Hiku Media's infrastructure. Led by Keoni Mahelona. Goal: complete first ASR tool by end of 2025.
- **Lauleo App**: Reading competition format to crowdsource speech data -- teams of 4+ record pre-set sentences, with prizes ($5K/$3K/$2K for top teams). Community-driven, gamified data collection.
- **Duolingo**: Olelo Hawaii was one of the first two indigenous languages on Duolingo (alongside Navajo). 10,000+ active learners at launch. Content created by Hawaiian-language specialists from Kanaeokana network (50+ Hawaiian culture-based schools) and Kamehameha Schools.
- **Kipaepae App** (2024): By Aha Punana Leo. Teaches 700+ sentences with gamified quizzes and progress tracking.
- **Data Sovereignty**: Hawaii's House Bill 546 proposed an "aloha intelligence institute" at UH. Focus on keeping data centres on Indigenous lands.
- **Scale of Challenge**: Fewer than 2,000 fluent speakers (down from 300,000 in 1778). Only 6% of historical Hawaiian-language newspapers/records digitised.

**Lesson for Assembl**: The Lauleo competition model (gamified community data collection with prizes) is an innovative approach worth studying. Partnership with established cultural institutions (like Kamehameha Schools equivalent) gives legitimacy.

---

### C. Canadian First Nations Language Technology

**NRC Indigenous Languages Technology Project** -- one of the most comprehensive government-funded efforts globally. Technologies developed for 25+ languages including Cree, Inuktitut, Innu, Mi'kmaw, Mohawk.

Key tools built:
- **itwewina**: Intelligent Plains Cree dictionary that analyses and assists with word formation (morphological analysis)
- **Inuktitut NLP suite**: Morphological analyser, dictionary, gister -- at user testing phase
- **Machine translation**: English-Inuktitut (research stage)
- **Text-to-speech**: For Kanyen'keha, Plains Cree, SENCOIEN -- designed as a repeatable procedure other communities can follow
- **Predictive text**: For texting in Plains Cree and Makah on mobile phones
- **ASR**: Starting with Inuktitut and Cree, expanding to Innu, Denesuline, Tsuut'ina, Michif

**AingA.I. (2025)**: Iqaluit-based company building AI-powered Inuktitut language app. Collecting text and thousands of hours of audio from language experts in South Baffin dialect.

**Key Challenge**: Polysynthetic languages like Inuktitut and Cree have words made of 7-10 morphemes; most words in a given text have never occurred before in language history. This makes ASR extremely difficult.

**Lesson for Assembl**: Te reo Maori is not polysynthetic to the same degree, but the NRC's "repeatable procedure" approach for TTS -- designed so any community can follow without extra expertise or funding -- is an excellent model for scalable te reo tools.

---

### D. Australian Aboriginal Language Technology

- **Google/UWA Project**: Adding Aboriginal English to Google services, targeting mid-2026. Part of Google's $1B Australian Digital Future Initiative. Critical insight: most Indigenous children start school speaking Aboriginal English, which AI currently cannot recognise.
- **UWA AI for Oral Knowledge (2026)**: Using Claude (Anthropic) to decipher handwritten field notebooks, cross-reference genealogies, and organise archival material. Work that took months now takes hours.
- **Noongar App**: Deep learning identifies wildflowers and displays names/sounds in Noongar language, aiding pronunciation.
- **Jingulu/JSwarm**: UNSW researchers found Jingulu language (3 verbs: come, go, do) translates naturally into AI commands for swarm robotics.
- **PULiiMA Conference**: Australia's Indigenous Languages & Technology Conference (Darwin, 2025) drew 700+ Indigenous attendees -- the major gathering point.
- **Abundant Intelligence Project**: Indigenous research initiative exploring AI supply chains, policy, governance, and Indigenous data sovereignty.

**Lesson for Assembl**: The UWA genealogy/archival project shows practical AI applications beyond language learning -- business intelligence for iwi governance and native title. This aligns directly with Assembl's business positioning.

---

### E. FLAIR (First Languages AI Reality) -- Canada/Global

- Founded by Michael Running Wolf (Northern Cheyenne, former Amazon Alexa engineer), PhD at McGill University.
- Based at Mila (Quebec AI Institute).
- **"Language in a Box"**: Portable, voice-based learning system delivering customisable guided lessons. Hardware-focused, works offline.
- **Indigenous Pathfinders in AI**: Training programme, 2026 cohort applications open.
- Building foundational ASR for rapid creation of custom models for endangered languages.
- Explicitly designed to respect data sovereignty and linguistic self-determination.

**Lesson for Assembl**: The "Language in a Box" offline-capable model is relevant for rural/remote NZ communities with limited internet connectivity.

---

### F. Welsh Language Technology -- Government-Led Excellence

Wales represents the best example of government-backed minority language AI:

- **Cysgliad/Cysill**: Spelling and grammar checker for Welsh. **Cysgeir**: Bilingual dictionaries.
- **Paldaruo**: App to crowdsource speech recordings via smartphones.
- **Macsen**: First Welsh language digital personal assistant.
- **Trawsgrifiwr**: First Welsh language transcriber.
- **Lleisiwr**: Service allowing Welsh speakers at risk of losing their voice (MND, throat cancer) to continue communicating in Welsh.
- **UK-LLM**: Sovereign AI initiative building models based on NVIDIA Nemotron that reason in both English and Welsh. Trained on Isambard-AI supercomputer. Used NVIDIA NIM to translate 30 million+ entries from English to Welsh to create training data.
- **Microsoft Copilot**: Now supports Welsh prompts and questions.
- **Mozilla Common Voice**: 1,285+ Welsh voices crowdsourced.

**Lesson for Assembl**: Wales shows what's possible when government, universities, and tech companies collaborate on minority language AI. The Welsh Government's Language Technology Action Plan is a model Assembl could reference when engaging NZ government.

---

### G. Irish Language (Gaeilge)

- Major AI chatbots (Gemini, ChatGPT) still struggle badly with Irish. Gemini has worst pronunciation; ChatGPT confuses Irish with Scots Gaelic.
- **aimsigh.com**: Custom Irish-language search engine using finite state transducer for morphological rules -- addresses the problem that Google returns English pages for Irish queries.
- Irish has a corpus of ~150 million words (vs 4 billion for Basque) -- data scarcity is the core challenge.
- CivTech Scotland aims to bring Scottish Gaelic AI "on par with well-supported minority languages (Basque, Irish, Welsh)."

**Lesson for Assembl**: Even well-resourced minority languages face AI challenges. The aimsigh.com approach (custom search that understands language morphology) could inspire a te reo-aware search/knowledge retrieval system within Assembl agents.

---

## 3. NZ GOVERNMENT AI / CHATBOT STANDARDS

### Public Service AI Framework (2025)

- Sits within the National AI Strategy launched July 2025.
- Not binding, but agencies "encouraged to align."
- Emphasises: ethics, bias/fairness, accessibility and inclusion of Maori and Pacific peoples, transparency, privacy, rigorous testing.
- Explicit focus on **embedding Maori views** into AI services and tools.

### GovGPT -- NZ's Bilingual Government Chatbot

- Developed with Whariki Maori Business Network and Microsoft.
- Supports multiple languages including te reo Maori text.
- Uses RAG (retrieval augmented generation) to pull from government websites and minimise hallucinations.
- Developed by Callaghan Innovation.

### Responsible GenAI Guidance (February 2025)

- Key considerations: ethics, bias/fairness, accessibility/inclusion of Maori and Pacific peoples, transparency, privacy, rigorous testing.
- No standalone AI Act in NZ; existing laws apply (Fair Trading Act, Human Rights Act, Privacy Act).

### Web Accessibility Standards (March 2025)

- Agencies face constraints around live caption and audio description providers who can accommodate both te reo Maori and English.
- Budget and availability of bilingual providers is a known gap.

### NZ Institute for Advanced Technology

- $231M Auckland-based initiative (2025-2029), incubated in MBIE.
- Focus on turning advanced tech (AI, quantum) into commercial outcomes.
- Becomes independent July 2026.

### Regulatory Approach

NZ Cabinet agreed on "proportionate and risk-based approach to AI regulation" using "agile approaches" and "existing mechanisms" rather than a standalone AI Act. No specific AI legislation as of March 2025.

**Lesson for Assembl**: The GovGPT approach (RAG from authoritative sources + bilingual delivery) is the baseline Assembl should match. The lack of mandatory standards is an opportunity to set the standard and become the reference point.

---

## 4. CULTURAL COMPETENCY FRAMEWORKS FOR AI

### Global Frameworks

| Framework | Focus |
|-----------|-------|
| **UNESCO Recommendation on Ethics of AI** (2021) | Endorsed by 194 states. Principles: Do No Harm, safety, fairness, nondiscrimination, privacy, sustainability, transparency, human oversight, accountability |
| **NIST AI Risk Management Framework** | Four functions: Govern (policies), Map (understand risks), Measure (test/monitor), Manage (allocate resources) |
| **EU AI Act** | Risk-tiered: unacceptable, high, limited, minimal. Bans social scoring, strict controls on high-risk |
| **UNESCO Independent Expert Group on AI and Culture** (2025) | Specific focus on cultural diversity and AI |

### Indigenous Data Sovereignty Frameworks

| Framework | Origin | Core Principles |
|-----------|--------|----------------|
| **Kaitiakitanga License** | Te Hiku Media (NZ) | Rangatiratanga, Whakapapa, Kaitiakitanga. "Like open source with affirmative action" |
| **CARE Principles** | Global Indigenous Data Alliance (GIDA) | Collective benefit, Authority to control, Responsibility, Ethics |
| **OCAP Principles** | First Nations Information Governance Centre (Canada) | Ownership, Control, Access, Possession |
| **Te Mana Raraunga** | Maori Data Sovereignty Network (NZ) | Maori data sovereignty principles underpinning the Kaitiakitanga License |

### How the Best Systems Ensure Cultural Accuracy

1. **Co-design with community** -- Indigenous elders and educators involved from design phase, not consulted after
2. **Community-led content validation** -- All content reviewed and approved by language/cultural experts before deployment
3. **Living governance** -- Frameworks evolve; the Kaitiakitanga License is explicitly described as a "work in progress"
4. **Ongoing auditing** -- Continuous review for bias, cultural errors, and appropriateness
5. **Human oversight** -- AI supports and empowers, never replaces human cultural knowledge holders
6. **Explicit disclaimers** -- Clear acknowledgement of AI limitations, especially for cultural content
7. **Lifecycle governance** -- From design through deployment, monitoring, and continuous improvement

### Sensitive Cultural Content Protocols

- **Never assume authority** -- AI must not position itself as an authority on tikanga, whakapapa, or other culturally sensitive knowledge
- **Defer to knowledge holders** -- Always direct users to appropriate human experts for sensitive queries
- **Restrict certain content** -- Some cultural knowledge is not appropriate for AI systems to hold or share (e.g., restricted whakapapa, sacred narratives, gender-specific knowledge)
- **Contextual awareness** -- Understand that cultural protocols vary by iwi, hapu, and whanau
- **Transparent provenance** -- Always attribute knowledge sources and acknowledge limitations

**Lesson for Assembl**: Build a cultural governance board/advisory group from day one. The Kaitiakitanga License, CARE Principles, and Te Mana Raraunga framework should be the foundation. Adopt explicit disclaimers and a "defer to humans" protocol for sensitive content.

---

## 5. EDUCATION TECHNOLOGY FOR TE REO MAORI

### Current Te Reo Learning Apps & Platforms

| App | Approach | Key Features | Cost |
|-----|----------|-------------|------|
| **Reo Ora** | Comprehensive modules | Pronunciation practice with mic recording and comparison, beginner to advanced | Freemium |
| **Drops** | Visual gamification | 40+ languages including te reo, visual learning | $160/yr or $300 lifetime |
| **Rongo** | Speaking-first | Kaiako (teacher) speaks, you repeat, on-board language processing assesses pronunciation. 24 lessons, 10+ new words each | Free |
| **Korerorero** | University-developed (AUT) | Listening, repetition, real-life vocabulary. Te Ara Poutama, AUT | Free |
| **Kupu** | AR + image recognition | Take a photo, Kupu identifies objects and gives te reo names. Developed by Spark/Google | Free |
| **Talkpal** | AI tutoring / conversation | Live chats with AI tutors or native speakers on different topics | Freemium |
| **Memrise** | Spaced repetition | Video clips, mnemonic techniques, social learning community | Freemium |
| **LuvLingua** | Game-based | 200+ lessons, fun games, beginner to intermediate | Freemium |
| **Ka Piki** | Sentence recognition | Full grammatically correct sentences, correct/not-correct tapping | Free |
| **Tatau** | Number gamification | Maori counting system, timed translation of numerals | Free |
| **Tipu** | Personalised progression | Teacher named Koi with "Personalised Progression Memory" that tracks what you know | Unknown |

### Key Resources (Not Apps)

- **Te Aka**: Authoritative online Maori-English dictionary -- the essential reference
- **Aki Hauora**: Learning tool for health professionals, Maori terms in clinical settings
- **Papa Reo tools**: Pronunciation feedback, speech-to-text, text-to-speech

### NCEA Te Reo Maori Proficiency Framework

- **Levels 1, 2, 3, and NZ Scholarship** achievement standards
- **He Arawhata Reo**: Grammar progression framework covering L1-L3
- **Tukutuku Ako**: Learning matrices in English and te reo Maori
- **Co-requisite (2024-2025)**: All NCEA learners need 20 credits in either English literacy/numeracy OR te reo matatini/pangarau
- **Te Aho Arataki Marau**: Curriculum guidelines for teaching te reo in English-medium schools

### Gamification That Works for Indigenous Languages

Research from AMCIS 2025 identifies best practices:

1. **Mission-based quests** embedding culturally responsive narratives (community stories, dialogues, scenarios)
2. **Avatar interactions** with real-time feedback loops
3. **NLP-powered adaptive algorithms** that dynamically adjust task difficulty and content sequencing
4. **Co-design workshops with elders and educators** -- not optional, essential
5. **Self-determination theory (SDT)** as foundation -- autonomy, competence, cultural connectedness
6. **Community-led content validation** for cultural integrity
7. **Avoid generic gamification** -- badges/points systems that lack cultural grounding feel extractive

**What does NOT work**:
- Generic "fun-based" games without cultural framework
- Gamification designed without involving a model/framework for culturally tailored serious games
- Systems that tokenise culture (e.g., Maori imagery as decoration rather than structural element)

**Lesson for Assembl**: Align learning levels to the NCEA framework (He Arawhata Reo) so users can track real-world progress. Use mission-based quests grounded in tikanga rather than generic gamification. The Tipu app's "Personalised Progression Memory" concept is worth studying.

---

## 6. SUMMARY: WHAT ASSEMBL SHOULD BUILD

### Non-Negotiable Foundations

1. **Cultural governance from day one** -- Establish a te reo Maori advisory group (kaumatua, language experts, community representatives) before writing a single line of code
2. **Kaitiakitanga-aligned data practices** -- Follow Te Mana Raraunga and CARE principles. Never use te reo data without clear provenance and consent
3. **Partnership with Te Hiku Media** -- Approach them for collaboration or at minimum ensure alignment with their work. Do not duplicate or compete
4. **Explicit disclaimers** -- Every te reo agent must clearly state: AI is a tool to support te reo learning and use, not an authority on language or tikanga
5. **Human-in-the-loop for sensitive content** -- Anything touching tikanga, whakapapa, or culturally sensitive knowledge must defer to human experts

### Features to Build (Informed by Global Best Practice)

| Feature | Inspired By | Priority |
|---------|-------------|----------|
| Bilingual code-switching support | Crescendo.ai, Te Hiku Media's 82% bilingual ASR | Critical |
| RAG from authoritative te reo sources | GovGPT, aimsigh.com | Critical |
| Pronunciation feedback | Papa Reo, Rongo app | High |
| NCEA-aligned proficiency levels | He Arawhata Reo framework | High |
| Industry-specific te reo vocabulary | Aki Hauora (health model), Assembl's 16-industry structure | High |
| Cultural protocol awareness | Kaitiakitanga License principles | Critical |
| Offline capability for rural communities | FLAIR "Language in a Box" | Medium |
| Adaptive learning with personalised progression | Tipu app, AMCIS 2025 research | Medium |
| Community content validation workflow | FLAIR co-design model, NRC repeatable procedures | High |
| Multi-channel delivery (web, mobile, WhatsApp) | GovGPT, commercial platforms | Medium |

### Governance Model

Based on global best practice, Assembl's te reo agent suite should operate under:

1. **Te reo Maori Advisory Board** -- Minimum 3 members: a kaumatua, a te reo educator, and a language technology expert
2. **Content review process** -- All te reo content reviewed by advisory board before deployment
3. **Living license** -- Adopt or align with Kaitiakitanga License principles, making clear Assembl does not "own" te reo content
4. **Regular cultural audits** -- Quarterly review of agent outputs by advisory board
5. **Clear boundaries** -- Document what the agent will and will not do (e.g., will not interpret tikanga, will not share restricted cultural knowledge)
6. **Attribution** -- Always credit sources and knowledge holders

### Competitive Positioning

No NZ-based commercial AI platform currently offers what Assembl could build: business intelligence agents that operate bilingually with genuine cultural competency across 16 industries. The closest competitors are:

- **Te Hiku Media**: Language technology, not business intelligence
- **GovGPT**: Government services only, not industry-specific
- **Generic te reo apps**: Education/learning only, not business tools

Assembl's unique position is at the intersection of business intelligence + te reo competency + industry specialisation. This has no direct competitor globally.

---

## SOURCES

### Te Hiku Media / Papa Reo
- [NVIDIA Blog: Maori Speech AI Model](https://blogs.nvidia.com/blog/te-hiku-media-maori-speech-ai/)
- [Papa Reo Platform](https://papareo.nz/)
- [Te Hiku Media: Te Reo Maori Speech Recognition](https://tehiku.nz/te-hiku-tech/papa-reo/14135/te-reo-maori-speech-recognition)
- [Te Hiku Media: Data Sovereignty and the Kaitiakitanga License](https://tehiku.nz/te-hiku-tech/te-hiku-dev-korero/25141/data-sovereignty-and-the-kaitiakitanga-license)
- [GitHub: Kaitiakitanga License](https://github.com/TeHikuMedia/Kaitiakitanga-License)
- [Papa Reo Blog: Whisper is Another Case Study in Colonisation](https://blog.papareo.nz/whisper-is-another-case-study-in-colonisation/)
- [Papa Reo Blog: Practical Guide to Creating Your Own Stewardship License](https://blog.papareo.nz/a-practical-guide-to-creating-your-own-stewardship-license/)

### Indigenous Language AI Projects
- [National Indigenous Times: Teaching Machines to Speak Maori](https://nit.com.au/03-11-2025/21077/eaching-the-machines-to-speak-maori-innovation-and-the-fight-for-data-sovereignty)
- [FLAIR at Mila Quebec](https://mila.quebec/en/ai4humanity/applied-projects/first-languages-ai-reality)
- [Prism Reports: Indigenous Leader Using AI to Protect Endangered Languages](https://prismreports.org/2026/02/26/indigenous-languages-preservation-ai/)
- [The Conversation: How AI Could Help Safeguard Indigenous Languages](https://theconversation.com/how-ai-could-help-safeguard-indigenous-languages-255359)
- [Cultural Survival: Indigenous Peoples and AI](https://www.culturalsurvival.org/news/indigenous-peoples-and-ai-defending-rights-shaping-future-technology)

### Hawaiian Language
- [UH Hilo: Hawaiian Language College Turns to AI](https://hilo.hawaii.edu/chancellor/stories/2025/02/26/hawaiian-language-college-turns-to-ai/)
- [Ka Wai Ola: Olelo Hawaii Launches on Duolingo](https://kawaiola.news/moomeheu/olelo-hawaii-in-the-palm-of-your-hand-olelo-hawaii-launches-on-popular-language-learning-app-duolingo/)
- [Kamehameha Schools: Lauleo App](https://www.ksbe.edu/article/lend-your-leo-to-new-oiwi-run-app-meant-to-amplify-olelo-hawaii)
- [Honolulu Star-Advertiser: Native Hawaiians Developing Sovereign AI Data](https://www.staradvertiser.com/2025/03/31/hawaii-news/native-hawaiians-developing-sovereign-ai-data/)

### Canadian First Nations
- [NRC: Canadian Indigenous Languages Technology Project](https://nrc.canada.ca/en/research-development/research-collaboration/programs/canadian-indigenous-languages-technology-project)
- [NRC: Speech Generation for Indigenous Language Education](https://nrc.canada.ca/en/research-development/research-collaboration/programs/speech-generation-indigenous-language-education)
- [NRC: Fact Sheet on Indigenous Languages Technology](https://nrc.canada.ca/en/research-development/research-collaboration/programs/fact-sheet-indigenous-languages-technology-project)
- [NationTalk: Inuit Innovators Turn to AI to Revitalize Inuktitut](https://nationtalk.ca/story/inuit-innovators-turn-to-ai-to-revitalize-inuktitut-cbc)

### Australian Aboriginal Language Technology
- [Google/NIT: Teaching AI Aboriginal English](https://nit.com.au/19-02-2025/16375/google-researchers-team-to-teach-ai-aboriginal-english)
- [UWA: AI for First Nations Oral Cultural Knowledge](https://www.uwa.edu.au/news/article/2026/march/how-ai-has-powerful-uses-for-first-nations-oral-cultural-knowledge)
- [ACM FAccT 2025: Designing Speech Technologies for Aboriginal English](https://dl.acm.org/doi/10.1145/3715275.3732010)
- [ACS: Australian Indigenous Language Used in AI Breakthrough](https://ia.acs.org.au/article/2022/australian-indigenous-language-used-in-ai-breakthrough.html)

### Welsh / Irish / European Minority Languages
- [GOV.WALES: Welsh Language Technology and AI](https://www.gov.wales/welsh-language-technology-and-ai)
- [GOV.WALES: Welsh Language Technology and AI Updates](https://www.gov.wales/welsh-language-technology-and-ai-updates)
- [Bangor University: UK-LLM Brings AI to UK Languages with NVIDIA Nemotron](https://www.bangor.ac.uk/news/2025-09-15-reaching-across-the-isles-uk-llm-brings-ai-to-uk-languages-with-nvidia-nemotron)
- [RTE: Could AI Help You Learn Gaeilge?](https://www.rte.ie/brainstorm/2025/0807/1507692-gaeilge-artificial-intelligence-language-immersion-technology/)
- [Irish Times: AI is Smart, Don't Ask It to Speak Irish](https://www.irishtimes.com/business/2025/10/02/ai-is-smart-just-dont-ask-it-to-speak-the-irish-language/)
- [CivTech: Gaelic Language Data Sparsity Challenge](https://www.civtech.scot/civtech-11-challenge-2-data-sparsity-gaelic-language)

### NZ Government Standards
- [NZ Digital Government: Responsible AI Guidance for Public Service](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/overview)
- [NZ Digital Government: Public Service AI Framework](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/public-service-artificial-intelligence-framework)
- [Interest.co.nz: GovGPT AI Chatbot for Businesses](https://www.interest.co.nz/technology/129681/callaghan-innovation-and-wh%C4%81riki-m%C4%81ori-business-network-develop-govgpt-ai-chatbot)
- [NZ Digital Government: Web Standards March 2025](https://dns.govt.nz/standards-and-guidance/nz-government-web-standards/new-web-standards-for-march-2025)
- [NZ Digital Government: Public Service AI Work Programme](https://dns.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/public-service-ai-work-programme)

### Data Sovereignty & Governance
- [UNESCO: Indigenous Data Sovereignty Guidelines](https://www.unesco.org/ethics-ai/en/articles/new-report-and-guidelines-indigenous-data-sovereignty-artificial-intelligence-developments)
- [UN: Ensuring Indigenous Peoples' Rights in the Age of AI](https://www.un.org/en/desa/ensuring-indigenous-peoples%E2%80%99-rights-age-ai)
- [SAGE Journals: Indigenous Data Sovereignty -- A Catalyst for Ethical AI](https://journals.sagepub.com/doi/full/10.1177/00076503241271143)

### Te Reo Education / Apps
- [Consumer NZ: Learn Te Reo Maori Apps](https://www.consumer.org.nz/articles/learn-te-reo-maori-on-your-phone-or-tablet-with-these-apps)
- [Talkpal: Top 7 Maori Language Apps 2025](https://talkpal.ai/top-7-best-maori-language-apps-to-learn-te-reo-fast-in-2025/)
- [Reo Ora App](https://reoora.com/embrace-the-maori-language-and-learning-te-reo-maori-with-the-reo-ora-app/)
- [NCEA: Te Reo Maori Curriculum](https://ncea.education.govt.nz/te-reo-maori/te-reo-maori)

### Gamification Research
- [AMCIS 2025: AI-Driven Gamified Indigenous Language Learning](https://aisel.aisnet.org/amcis2025/is_education/is_education/3/)
- [PMC: Serious Game Design Model for Language Learning in Cultural Context](https://pmc.ncbi.nlm.nih.gov/articles/PMC8964384/)

### Multilingual AI Platforms
- [Natterbox: Best Multilingual AI Agents 2026](https://natterbox.com/blog/the-best-multilingual-ai-agents-in-2026-a-buyers-checklist-for-global-cx/)
- [Crescendo.ai: Best Multilingual Chatbots 2026](https://www.crescendo.ai/blog/best-multilingual-chatbots)
- [Aisera: Multilingual AI Agents 2026](https://aisera.com/blog/multilingual-ai-agent/)
