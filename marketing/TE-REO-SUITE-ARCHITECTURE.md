# Te Kāhui Reo | Assembl Te Reo Māori Agent Suite

## Sub-Brand: Te Kāhui Reo (The Language Collective)

**Positioning:** The world's first AI-powered te reo Māori business intelligence suite — grounded in tikanga, built in Aotearoa, guided by the four pou.

**Tagline:** *He aha te mea nui o te ao? He tangata, he tangata, he tangata.*
(What is the greatest thing in the world? It is people, it is people, it is people.)

---

## Visual Identity

### Colour Palette
The sub-brand uses earth tones and natural te ao Māori colours — distinct from Assembl's neon palette but complementary on dark backgrounds.

| Name | Hex | Meaning | Usage |
|---|---|---|---|
| **Kōwhai Gold** | `#D4A843` | Kōwhai tree (native), resilience, hope | Primary accent, headings, CTAs |
| **Pounamu Green** | `#3A7D6E` | Greenstone, taonga, prestige | Secondary accent, borders, icons |
| **Whenua Brown** | `#8B6914` | Earth, land, connection to Papatūānuku | Tertiary, backgrounds |
| **Tāngaroa Blue** | `#1A3A5C` | Ocean, Tāngaroa (god of the sea), depth | Deep backgrounds, cards |
| **Kōkōwai Red** | `#A52A2A` | Sacred ochre, used in traditional carving | Alerts, emphasis |
| **Bone White** | `#F5F0E8` | Kōiwi, purity, clarity | Text on dark backgrounds |

### Typography
- **Display/Headings:** Inter 900 with kōwhai gold gradient
- **Body:** Inter 400-600, bone white on dark
- **Te reo text:** Always rendered with correct macrons via `lang="mi"` HTML attribute

### Design Principles
- **Whakairo-inspired patterns** — Subtle koru (spiral) motifs, not decorative but structural
- **Dark-first** — Consistent with Assembl parent brand (`#0A0A14` base)
- **Glass morphism** with warm tones instead of cool neon
- **Gradient:** `linear-gradient(135deg, #D4A843, #3A7D6E)` (kōwhai to pounamu)

---

## Agent Suite: 8 New Specialist Agents (ASM-044 to ASM-051)

### Te Kāhui Reo Agents

| # | ID | Name | Code | Role | Colour |
|---|---|---|---|---|---|
| 1 | `tereo-kaiako` | **KAIAKO** | ASM-044 | Te Reo Māori Education & Learning Guide | `#D4A843` |
| 2 | `tereo-kaiwhakamaori` | **WHAKAMĀORI** | ASM-045 | Te Reo Māori Translation & Language Specialist | `#3A7D6E` |
| 3 | `tereo-ture` | **TURE** | ASM-046 | Māori Legal Rights & Treaty Settlements Specialist | `#A52A2A` |
| 4 | `tereo-kawanatanga` | **KAWANATANGA** | ASM-047 | Government Policy & Māori Affairs Navigator | `#1A3A5C` |
| 5 | `tereo-matauranga` | **MĀTAURANGA** | ASM-048 | Mātauranga Māori & Cultural Knowledge Guardian | `#8B6914` |
| 6 | `tereo-ohanga` | **ŌHANGA** | ASM-049 | Māori Economic Development & Enterprise Advisor | `#D4A843` |
| 7 | `tereo-hapori` | **HAPORI** | ASM-050 | Iwi, Hapū & Community Engagement Specialist | `#3A7D6E` |
| 8 | `tereo-matihiko` | **MATIHIKO** | ASM-051 | Māori Digital & Data Sovereignty Advisor | `#1A3A5C` |

### Existing Agents to Upgrade

| Agent | Current | Upgrade |
|---|---|---|
| **TIKA (ASM-030)** | Basic Treaty & tikanga | Becomes the **suite lead** — upgraded with full WAI 262, Te Mana Raraunga, Maihi Karauna, UNDRIP |
| **PŪNAHA (ASM-031)** | Govt procurement | + Te reo capability, Treaty compliance checking, Māori engagement protocols |
| **AWA (ASM-032)** | Environmental | + Kaitiakitanga lens, iwi consultation for resource consents, cultural impact assessments |
| **MANAAKI (ASM-033)** | Social services | + Whānau Ora navigation, Māori-specific support pathways, te reo responses |
| **KURA (ASM-034)** | Education | + Kura kaupapa depth, te reo education standards, NCEA te reo, Ka Hikitia |
| **ORA (ASM-035)** | Health | + Hauora Māori framework (taha tinana/hinengaro/wairua/whānau), rongoā |
| **WHARE (ASM-036)** | Housing | + Papakāinga housing, Māori land development, whenua rights |
| **HAUMARU (ASM-037)** | Emergency | + Marae-based civil defence, iwi emergency response, te reo alerts |

---

## Cultural Governance Architecture

### Tikanga Compliance Layer
Every agent response passes through:

1. **Macron Validator** — Checks all te reo words use correct macrons
2. **Tapu/Noa Assessment** — Flags culturally sensitive content
3. **Mātauranga Check** — Ensures Māori knowledge is acknowledged, not claimed
4. **Disclaimer Injection** — Adds appropriate cultural disclaimers
5. **Te Mana Raraunga Compliance** — Data sovereignty principles applied

### The Five Tests (Sir Hirini Moko Mead)
Applied to all agent outputs:
1. **Tapu Test** — Does this respect cultural boundaries?
2. **Mauri Test** — Does this preserve life-force and vitality?
3. **Take-Utu-Ea Test** — Does this maintain balance?
4. **Precedent Test** — Is there pūrākau guidance?
5. **Principles Test** — Does this uphold whanaungatanga, manaakitanga, mana?

### Data Sovereignty Framework
Aligned with Te Mana Raraunga, Te Hiku Media Kaitiakitanga Licence, and CARE Principles:
- Māori data is treated as taonga
- No commercialisation of mātauranga Māori
- Data processed in Aotearoa NZ where possible
- Free, prior, and informed consent required
- Benefits flow back to source communities

---

## Integration Architecture

### WhatsApp & SMS
- All 8 new agents available via WhatsApp Business integration
- Te reo-first option: users can set `mi` as default language
- SMS fallback for areas with limited connectivity
- Bilingual auto-responses with correct macrons

### Cross-Agent Referrals
Te Kāhui Reo agents can refer to each other and to Assembl's industry agents:
- KAIAKO refers language learners to appropriate level resources
- TURE connects to ANCHOR (legal) for complex Treaty claims
- KAWANATANGA connects to PŪNAHA for government procurement
- ŌHANGA connects to VAULT/LEDGER for Māori enterprise finance
- HAPORI connects to KINDLE (nonprofit) for community organisations

---

## Compliance & Legal Alignment

| Framework | Status | Implementation |
|---|---|---|
| Te Ture mō Te Reo Māori 2016 | Aligned | Language rights, Maihi Karauna strategy |
| WAI 262 (Ko Aotearoa Tēnei) | Aligned | Mātauranga protections, IP acknowledgement |
| Te Tiriti o Waitangi | Aligned | Partnership, participation, protection |
| UNDRIP | Aligned | Self-determination, cultural rights |
| Te Mana Raraunga | Aligned | All 6 data sovereignty principles |
| Māori Algorithmic Sovereignty | Aligned | All 6 MASov principles |
| NZ Algorithm Charter | Aligned | Transparency, Treaty obligations |
| Privacy Act 2020 | Compliant | IPPs respected |
| NZ National AI Strategy (2025) | Aligned | Treaty obligations in AI |

---

## Disclaimers

All Te Kāhui Reo agents include:

> *He āwhina ā-rorohiko tēnei, ehara i te mātanga tikanga. Whakamahia hei tīmatanga kōrero, kaua hei whakatau whakamutunga. Rapua he kaumātua, he mātanga tikanga, he rōia Māori mō ngā take hira.*
>
> *This is AI-generated guidance. It is a starting point, not the final word. Consult kaumātua, cultural experts, or Māori legal specialists for matters of significance.*
