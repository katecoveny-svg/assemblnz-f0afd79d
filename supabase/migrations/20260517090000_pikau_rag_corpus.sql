-- ═══════════════════════════════════════════════════════════════
-- Pīkau RAG corpus seed — 10 curated NZ freight/customs documents
--
-- Purpose
--   Stand up the smallest viable knowledge base for the Pīkau kete so
--   iho-router's match_kb_knowledge RPC returns substantive results when
--   filtered by agent_pack='pikau'. This is the demo corpus for the
--   Aironaut Customs pilot — a working starting point, not an exhaustive
--   compendium.
--
-- Mechanism
--   • Creates one kb_sources row tagged for the pikau pack.
--   • Inserts 10 kb_documents rows referencing that source.
--   • The kb_enqueue_embedding trigger (migration 20260419022904) fires
--     on insert, queuing each document into kb_embed_queue.
--   • A separate edge-function invoke of `embed-worker` drains the queue
--     using Gemini 768-dim embeddings into kb_doc_chunks.
--
-- Authority & scope
--   Each document is a paraphrased summary of NZ Customs Service guidance,
--   the Customs and Excise Act 2018, MPI Import Health Standard overviews,
--   and FTA preferential-treatment summaries. Citations of section numbers
--   are correct as of NZ legislation in force on 2026-05-17. Always confirm
--   against the live source before quoting in an operational submission.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_source_id uuid;
BEGIN
  -- Idempotent source upsert (kb_sources has no unique on url, so check first).
  SELECT id INTO v_source_id FROM public.kb_sources
    WHERE url = 'internal://kete/pikau/curated' LIMIT 1;

  IF v_source_id IS NULL THEN
    INSERT INTO public.kb_sources (
      name, type, url, category, agent_packs, cadence_minutes, active, config, provenance
    ) VALUES (
      'Pīkau Curated Freight & Customs Pack',
      -- type uses an existing CHECK-allowed value; 'json_api' is the closest
      -- fit for a hand-curated static doc pack until a 'static' type is added.
      'json_api',
      'internal://kete/pikau/curated',
      'customs_freight',
      ARRAY['pikau'],
      10080,             -- weekly check (placeholder — content is hand-curated)
      true,
      jsonb_build_object('curator', 'assembl-team', 'demo', true),
      'Curated by the assembl Pīkau team for the Aironaut Customs pilot. Summaries paraphrase live NZ Customs / MPI / MFAT FTA guidance.'
    )
    RETURNING id INTO v_source_id;
  END IF;

  -- Idempotency: clear any prior demo-pack docs for this source so re-runs
  -- of this migration produce a fresh corpus. Triggers will re-queue.
  DELETE FROM public.kb_documents WHERE source_id = v_source_id;

  -- ── 01 — Customs entry overview ──────────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-01-customs-entry-overview',
    'NZ Customs Entry — Operational Overview',
    'https://www.customs.govt.nz/business/import/',
    $doc$
An import customs entry to the New Zealand Customs Service is required for goods with a Value for Duty (VFD) above the de minimis threshold of NZD 1,000, and for all goods regardless of value where duty or other revenue (such as alcohol or tobacco excise) is payable. Entries are lodged electronically into the Trade Single Window (TSW) by a licensed customs broker or by a self-clearing importer.

A complete entry requires: the consignee's New Zealand Business Number (NZBN); a 10-digit tariff classification per the NZ Working Tariff Document (HS 2022); a country of origin and, where preferential treatment is claimed, a valid Certificate of Origin or self-declaration under the relevant FTA; a valuation determined under one of the six WTO methods (Customs and Excise Act 2018 ss 111–117), with Transaction Value (Method 1) the default; the commercial invoice, packing list, and transport document (Bill of Lading or Air Waybill).

Duty equals VFD multiplied by the applicable tariff rate after any preference is applied. GST is calculated at 15% on the sum of VFD, all duties (including excise where applicable), and the cost of freight and insurance to the first port of arrival in New Zealand. The importer is liable for any errors in classification, valuation, or origin claims, and the Customs Service may issue compliance assessments under s 117(2) for up to four years after entry.

Typical hold reasons include incomplete documentation, misclassification (especially in apparel and footwear where preference rules drive material outcomes), suspect valuation, and biosecurity referrals. Goods may be released against a bond pending resolution. Brokers should retain entry records for seven years per s 248.
    $doc$,
    md5('pikau-01-customs-entry-overview'),
    timestamptz '2026-04-01',
    'NZ',
    ARRAY['pikau', 'customs', 'freight', 'tsw', 'customs-entry'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'process_guide')
  );

  -- ── 02 — Valuation rules (CEA 2018) ──────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-02-valuation-rules',
    'Customs Valuation — Methods 1 to 6 under CEA 2018',
    'https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html#LMS_99095',
    $doc$
The Customs and Excise Act 2018 sets out six hierarchical methods for determining Value for Duty (VFD), drawn from the WTO Valuation Agreement. Each method must be exhausted in order before moving to the next, with the exception that Methods 4 and 5 may be reversed at the importer's request.

Method 1 — Transaction Value (s 113): the price actually paid or payable for the goods when sold for export to New Zealand, with statutory additions (commissions other than buying commissions; cost of containers; packing; assists; royalties and licence fees; proceeds of subsequent resale accruing to the seller; transport and insurance to the place of export). This is the default method and applies in the vast majority of import entries.

Method 2 — Transaction Value of Identical Goods (s 114): used where Method 1 is not available. Identical goods are those the same in all respects, sold for export to NZ at or about the same time, at the same commercial level and in substantially the same quantity.

Method 3 — Transaction Value of Similar Goods (s 115): goods which, although not alike in all respects, have like characteristics and component materials enabling them to perform the same functions.

Method 4 — Deductive Value (s 116): the unit price at which the imported or identical/similar goods are sold in NZ in the greatest aggregate quantity, less commissions and profit, transport, and customs duties.

Method 5 — Computed Value (s 117): the sum of the cost of materials and fabrication, profit and general expenses, and other costs.

Method 6 — Fall-back (s 118): reasonable means consistent with the principles and general provisions of the Act and the WTO Valuation Agreement, using data available in NZ.

When the relationship between buyer and seller may have influenced the price, Customs may scrutinise the transaction value under s 113(4) and request additional substantiation. Brokers should retain pricing build-ups, related-party transfer-pricing studies, and Incoterms evidence.
    $doc$,
    md5('pikau-02-valuation-rules'),
    timestamptz '2026-03-15',
    'NZ',
    ARRAY['pikau', 'customs', 'valuation', 'cea-2018'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'statutory_summary', 'act', 'Customs and Excise Act 2018')
  );

  -- ── 03 — CPTPP Rules of Origin ───────────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-03-cptpp-rules-of-origin',
    'CPTPP Rules of Origin — Operational Guide',
    'https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/cptpp/',
    $doc$
The Comprehensive and Progressive Agreement for Trans-Pacific Partnership (CPTPP) entered into force for New Zealand on 30 December 2018. To claim preferential treatment, goods must be originating in a CPTPP party (Australia, Brunei, Canada, Chile, Japan, Malaysia, Mexico, Peru, Singapore, Vietnam, the United Kingdom, and New Zealand).

Origin is established under one of three tests, as specified in the Product-Specific Rules (PSR) annex: (1) wholly obtained — minerals extracted, plants harvested, animals born/raised, fish caught — entirely in CPTPP parties; (2) change in tariff classification (CTC) — non-originating inputs must undergo a specified tariff-heading or subheading change; (3) regional value content (RVC) — a percentage of the value of the good must originate in CPTPP parties, typically 35–45% depending on method (build-up vs build-down).

Apparel and textile goods (HS chapters 50–63) are subject to the strict yarn-forward rule: yarn must be spun in a CPTPP party, and all subsequent operations through cut-and-sew must also occur in CPTPP parties. A short-supply list provides limited exceptions where qualifying yarn is not commercially available in the region.

De minimis: up to 10% of the value of non-originating materials may not satisfy the applicable PSR, except for certain agricultural and textile goods which have lower or zero de minimis tolerances.

Documentation: a CPTPP Certification of Origin may be self-issued by the exporter, producer, or (for New Zealand imports) the importer. The certification must contain nine prescribed data elements and is valid for shipments arriving within 12 months. Importers must retain the certification and supporting records for five years (CEA 2018 s 248 sets the seven-year retention for entry documents — the longer period governs).
    $doc$,
    md5('pikau-03-cptpp-rules-of-origin'),
    timestamptz '2026-02-20',
    'International',
    ARRAY['pikau', 'fta', 'cptpp', 'rules-of-origin'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'fta_guide', 'agreement', 'CPTPP')
  );

  -- ── 04 — RCEP preferential treatment ─────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-04-rcep-preferential-treatment',
    'RCEP — Claiming Preferential Treatment on Imports to NZ',
    'https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/regional-comprehensive-economic-partnership/',
    $doc$
The Regional Comprehensive Economic Partnership (RCEP) entered into force for New Zealand on 1 January 2022. RCEP parties include ASEAN countries (Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, the Philippines, Singapore, Thailand, Vietnam) plus Australia, China, Japan, the Republic of Korea, and New Zealand.

RCEP rules of origin are generally less stringent than CPTPP and frequently allow either a CTC test, an RVC test (often 40% build-down), or both as alternatives. Cumulation operates across all RCEP parties, meaning materials originating in any RCEP party count as originating throughout. This makes RCEP particularly useful for consumer goods assembled from inputs sourced across the region.

For apparel (HS 50–63), RCEP rules are less strict than CPTPP — origin is typically conferred by a change in tariff heading (e.g., from yarn at heading 5205 to fabric at heading 5208 to garment at heading 6109), without the yarn-forward requirement.

Documentation: preference can be claimed via a Certificate of Origin issued by a competent authority, an approved exporter's self-declaration, or, after the third year of entry into force, by importer self-declaration. The certification must include the prescribed data set and is valid for one year. Importers should retain certification and supporting documents for the period required under the importing party's law — five years for NZ.

For overlapping coverage (e.g., goods from Vietnam where both CPTPP and RCEP apply), the importer chooses the more favourable preference. The choice must be consistent for the lifetime of the entry and noted on the customs declaration.
    $doc$,
    md5('pikau-04-rcep-preferential-treatment'),
    timestamptz '2026-02-20',
    'International',
    ARRAY['pikau', 'fta', 'rcep', 'rules-of-origin'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'fta_guide', 'agreement', 'RCEP')
  );

  -- ── 05 — NZ-China FTA ────────────────────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-05-nz-china-fta',
    'NZ-China Free Trade Agreement — Preferential Treatment',
    'https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/nz-china-free-trade-agreement/',
    $doc$
The New Zealand-China Free Trade Agreement entered into force on 1 October 2008 and was upgraded by the 2021 Upgrade Protocol, which entered into force on 7 April 2022. China is New Zealand's largest single trading partner for goods imports, making this FTA the most heavily used preference channel for Aotearoa importers.

Origin tests under the FTA are: (1) wholly obtained in China or New Zealand; (2) produced entirely from originating materials; or (3) for goods incorporating non-originating materials, meeting the Product-Specific Rule for the heading — most often a Change in Tariff Classification (CTC) at the four- or six-digit level. RVC tests of 40% (build-up) are available for many headings as alternatives.

A Certificate of Origin (Form A — NZ-China FTA) is issued by an authorised body (the China Council for the Promotion of International Trade or its branches in China; New Zealand exporters obtain CoOs from the major chamber of commerce networks). The certificate must be issued at or before the time of export and is valid for one year.

Cumulation is bilateral only — materials originating in third countries (including CPTPP or RCEP parties) do not count as originating for NZ-China preference unless they qualify under the NZ-China FTA's own substantive rules.

The 2022 Upgrade introduced simplified procedures: Authorised Exporter status (issued by China's General Administration of Customs) permits self-certification for repeat exporters; a longer 10-year recordkeeping requirement applies under the Upgrade for exporters and producers.

For combined CPTPP/NZ-China import opportunities (rare in practice, since China is not a CPTPP party), origin claims must be made under only one agreement per entry.
    $doc$,
    md5('pikau-05-nz-china-fta'),
    timestamptz '2026-01-30',
    'International',
    ARRAY['pikau', 'fta', 'nz-china', 'rules-of-origin'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'fta_guide', 'agreement', 'NZ-China FTA')
  );

  -- ── 06 — NZ-UK FTA ───────────────────────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-06-nz-uk-fta',
    'NZ-UK Free Trade Agreement — Key Outcomes for Importers',
    'https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/nz-uk-fta/',
    $doc$
The New Zealand-United Kingdom Free Trade Agreement entered into force on 31 May 2023. It is one of the more ambitious FTAs in force for New Zealand, eliminating tariffs on 100% of New Zealand exports to the UK over a phased schedule and providing immediate or near-immediate preferential rates on most UK-origin imports to New Zealand.

For NZ importers, the most operationally significant outcomes are: immediate elimination of NZ tariffs on most UK-origin consumer goods (textiles, apparel, footwear, leather goods, machinery, motor vehicles), bringing many lines to 0% duty from the previous 5–10% general rate; harmonised origin rules with broadly the same structure as CPTPP (CTC and/or RVC tests with PSR-annex coverage); and self-certification of origin by either exporter or importer, valid for 12 months.

For apparel (HS chapters 61–62), the FTA uses change-in-tariff-heading rules at the six-digit level. This is less stringent than CPTPP's yarn-forward rule and means UK-finished garments from yarn or fabric of any origin generally qualify for preference. The de minimis tolerance is 10% by value of non-originating materials for most goods (lower tolerances apply to a small set of agricultural products).

Documentation: a Certification of Origin contains the prescribed data set (exporter, producer if known, importer, description, HS code, origin criterion, period if blanket). Retention: five years post-entry for the importer; for NZ, this aligns with CEA 2018 record obligations.

The UK is also a CPTPP party (acceded 15 December 2024). Where both NZ-UK FTA and CPTPP preferences are available, importers may choose whichever yields a lower duty outcome and is administratively simpler.
    $doc$,
    md5('pikau-06-nz-uk-fta'),
    timestamptz '2026-01-10',
    'International',
    ARRAY['pikau', 'fta', 'nz-uk', 'rules-of-origin'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'fta_guide', 'agreement', 'NZ-UK FTA')
  );

  -- ── 07 — MPI Import Health Standards overview ─────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-07-mpi-ihs-overview',
    'MPI Import Health Standards — Operational Overview',
    'https://www.mpi.govt.nz/import/border-clearance/import-health-standards/',
    $doc$
Under the Biosecurity Act 1993, the Ministry for Primary Industries (MPI) administers Import Health Standards (IHS) which specify the biosecurity requirements that must be met before goods may be released into New Zealand. An IHS exists for almost every category of biosecurity risk goods: plants and plant products, animals and animal products, food, wood products, packaging materials, used vehicles and machinery, and many consumer goods that may carry contamination (e.g., footwear, used household effects).

Common operational consequences for importers:
• Wooden articles, including pallets and crates, must comply with ISPM 15 (heat treatment or fumigation marked HT/MB) plus the relevant IHS for the article itself. Failure is the most common cause of holds on consumer-goods consignments from Asia.
• Plant-based articles (basketwork, woven goods, dried botanicals) require declarations of treatment and freedom from soil/insects.
• Food consignments fall under the Food Act 2014 + MPI IHS for the relevant commodity; a registered food importer with an MPI Registered Importer of Food (RIF) registration is required.
• Pet food and pet products are high-risk and often require permits issued in advance under specific IHS for the animal-product class.
• Used machinery and vehicles must be steam-cleaned and free of soil; declarations and photographic evidence are routine.

MPI inspection at a transitional facility (TF) is required for many risk goods. Operators must hold a current TF approval from MPI. Customs clearance does not release goods from biosecurity hold — both Customs and MPI must give clearance for the consignment to be released.

Pre-arrival best practice: confirm the IHS reference for each line item, request the supplier provide the required declarations and treatment certificates before shipping, and book transitional-facility inspection slots early. Holds and rework are the most expensive part of a freight-and-customs file.
    $doc$,
    md5('pikau-07-mpi-ihs-overview'),
    timestamptz '2026-03-01',
    'NZ',
    ARRAY['pikau', 'biosecurity', 'mpi', 'ihs'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'process_guide', 'act', 'Biosecurity Act 1993')
  );

  -- ── 08 — IMDG / dangerous goods ──────────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-08-imdg-dangerous-goods',
    'IMDG Code for Sea Freight — Dangerous Goods Essentials',
    'https://www.maritimenz.govt.nz/commercial/dangerous-goods/imdg-code/',
    $doc$
The International Maritime Dangerous Goods (IMDG) Code is the global standard for the carriage of dangerous goods by sea. New Zealand applies the Code via the Maritime Transport Act 1994 and Maritime Rules Part 24A. Sea-freight consignments of dangerous goods must comply on every leg.

The Code classifies goods into nine classes:
1 — Explosives; 2 — Gases (compressed, liquefied, dissolved); 3 — Flammable liquids; 4 — Flammable solids, substances liable to spontaneous combustion, substances which emit flammable gases on contact with water; 5 — Oxidising substances and organic peroxides; 6 — Toxic and infectious substances; 7 — Radioactive material; 8 — Corrosives; 9 — Miscellaneous dangerous substances (including lithium batteries — UN3480 standalone, UN3481 contained in or packed with equipment).

Each substance has a UN number, a Proper Shipping Name, a Packing Group (I — high danger; II — medium; III — low), and packaging instructions. Documentation: a Dangerous Goods Declaration signed by the shipper, accompanied by the packing certificate where applicable. The DG Declaration must be presented to the ocean carrier, the broker, and to Maritime NZ on request.

Common consumer-goods triggers: lithium-battery-powered devices (laptops, phones, e-bikes, e-scooters, power tools, vapes) — almost always Class 9; flammable liquids in cosmetics (perfumes, nail polish, aerosols) — Class 3 or Class 2.1; cleaning chemicals — Class 8 or 9; paints and varnishes — Class 3 if solvent-based.

Air-freight dangerous goods are governed by the equivalent IATA Dangerous Goods Regulations (DGR), with stricter limitations on many lithium-battery configurations. Always check both modes when planning. Misdeclaration of dangerous goods is a serious offence under both the Maritime Transport Act and the Civil Aviation Act.
    $doc$,
    md5('pikau-08-imdg-dangerous-goods'),
    timestamptz '2026-03-25',
    'NZ',
    ARRAY['pikau', 'dangerous-goods', 'imdg', 'maritime'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'process_guide', 'act', 'Maritime Transport Act 1994')
  );

  -- ── 09 — Tyre Stewardship Scheme ─────────────────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-09-tyre-stewardship',
    'Tyrewise Tyre Stewardship Scheme — Importer Obligations',
    'https://www.tyrewise.co.nz/',
    $doc$
The Tyrewise regulated tyre product stewardship scheme commenced on 1 September 2023 under the Waste Minimisation Act 2008. The scheme applies a stewardship fee on every imported tyre — new and used, on or off a vehicle — entering the New Zealand market.

The fee is collected by the New Zealand Customs Service at the point of entry, calculated per Equivalent Passenger Unit (EPU), and remitted to the scheme operator. Current published fees: NZD 6.65 + GST per passenger-car tyre (EPU 1.0), with light-truck and motorcycle tyres rated at fractional EPU values and heavy-vehicle / earthmoving tyres at multiples of EPU.

Importer responsibilities: register with the Tyrewise scheme; declare the EPU count on the customs entry under tariff lines 4011 (new) or 4012 (retreaded/used); pay the fee with other duties; retain records for the periods required by CEA 2018 (seven years).

Exemptions are narrow — non-pneumatic tyres (HS 4012.90, 4013), tyres on imported new vehicles for which the fee is paid by the vehicle importer at registration, and certain re-exports under bond. Confirm exemption status before declaring zero EPU.

Operationally, the fee adds a fixed-rupture cost to every consumer-goods consignment that includes tyres — most commonly bicycles, motorcycles, and consumer e-mobility. The fee is not a duty for FTA purposes (so it is not eliminated under CPTPP/RCEP/NZ-China/NZ-UK) but is GST-inclusive on the importer's downstream pricing build-up.
    $doc$,
    md5('pikau-09-tyre-stewardship'),
    timestamptz '2026-04-10',
    'NZ',
    ARRAY['pikau', 'stewardship', 'tyres', 'customs'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'scheme_guide', 'act', 'Waste Minimisation Act 2008')
  );

  -- ── 10 — Aironaut Customs service overview ──────────────────────
  INSERT INTO public.kb_documents (source_id, external_id, title, url, content, content_hash, published_at, jurisdiction, topic_tags, metadata)
  VALUES (
    v_source_id,
    'pikau-10-aironaut-customs-overview',
    'Aironaut Customs — Pikau Pilot Partner Profile',
    'internal://kete/pikau/aironaut-customs',
    $doc$
Aironaut Customs is the Pīkau pilot partner for the freight & customs kete. Aironaut is a New Zealand licensed customs broker operating across the major ports of entry (Auckland, Tauranga, Wellington, Christchurch) with specialist capability in consumer-goods importing, dangerous-goods declarations, and FTA preference claims.

Aironaut's service mix:
• End-to-end customs broking: tariff classification, valuation, lodgement of customs entries through the Trade Single Window (TSW), preference claims under CPTPP, RCEP, NZ-China FTA, NZ-UK FTA, and PACER Plus.
• Freight forwarding coordination: ocean and air freight with established carrier relationships across the Asia-Pacific and Europe.
• Dangerous-goods declarations for IMDG and IATA shipments, including lithium-battery consignments (UN3480/3481) and consumer flammables (Class 3 — perfumes, nail polish, paints, solvent-based cleaning products).
• Biosecurity advisory and MPI Import Health Standard navigation, including transitional-facility coordination for wooden articles, plant-based goods, and used machinery.
• Landed-cost modelling for clients evaluating new SKUs or shifting origin.

Common file profile: an Aironaut customer importing a mixed container of consumer goods from a CPTPP / RCEP / NZ-China origin country, mid-five-figure NZD VFD per container, ~80% of lines qualifying for preferential treatment if the Certificate of Origin is in order. Repeated patterns include: apparel from Vietnam (CPTPP preference, yarn-forward sensitive), consumer electronics from China (NZ-China preference, mostly 0% general rate), furniture from China/Vietnam (CPTPP/NZ-China, MPI wood-treatment hold risk).

When the Pīkau agent is asked an operational question by Aironaut staff, defaults: cite the relevant Act section, propose the most efficient preferred preference, flag biosecurity risk, and recommend the documentation package the broker should request from the supplier before shipping.
    $doc$,
    md5('pikau-10-aironaut-customs-overview'),
    timestamptz '2026-05-15',
    'NZ',
    ARRAY['pikau', 'aironaut', 'customs-broker', 'pilot'],
    jsonb_build_object('kete', 'pikau', 'doc_type', 'partner_profile', 'pilot', 'Aironaut Customs')
  );

END $$;
