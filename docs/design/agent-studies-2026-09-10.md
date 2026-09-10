# Arc, Forge and Customs visual studies

Visual refresh of `/agents/arc`, `/agents/forge` and `/agents/customs`. The reference is [Heron](https://heronaiapp.com/): architectural linework, detailed material studies, fine rules and a generous paper field, adapted to the assembl brand.

Four original illustrations were generated with Higgsfield (`gpt_image_2`, 10 September 2026) and reviewed before use. Web assets are under `public/brand/agent-studies/`.

| Asset | Generation | Subject |
| --- | --- | --- |
| arc-harbour-terraces.webp | a4f61d56-b0d4-428b-bd87-5c79805afb15 | Fictional Auckland timber terraces with metal gable roofs and native planting |
| arc-exploded-model.webp | 499145db-7487-4963-907e-30686f2b0f43 | A separate conceptual timber construction study |
| forge-vehicle-study.webp | d14cbbc1-46ed-4d9a-8abe-a6feea2ccb09 | Graphite vehicle body, glazing and chassis study |
| customs-harbour-study.webp | d9a0aee9-ff4e-45bf-83b7-01e7d38bc681 | Coastal container vessel, cargo and document study |

The Heron building image was a style reference for the first generation. No Heron imagery, code, copy or claims are shipped. The illustrations are fictional concepts, not representations of real projects or engineering documents. Arc's street and construction studies are separate conceptual views, not an asserted CAD model of one building. The existing interactive fictional plan and code flags remain the demonstration.

The new stylesheet is scoped to `.agent-edition` on these three routes. Copy modules, routes, agent services and permissions are preserved. Forge still links to Arataki for the live automotive agent. Local draft previews remain labelled scripted and do not send or lodge anything.

Validation: targeted lint and repository lint; TypeScript; production build; 82 existing tests covering craft, agent flags, privacy and loyalty. Browser checks cover 1280px desktop and 375px mobile, the Arc artwork switch, plan flags, Forge service tab, draft approval gate and scripted chat. Comparison with live pages preserved all 423 original visible leaf text elements: Arc 122, Forge 163, Customs 138. Added illustration captions and controls are excluded from that comparison.

The current main branch also contained a TypeScript inference error in `EvidenceReceiptPort2faDemo`: the selected workflow was inferred as only its first literal ID. Its state now accepts all defined workflow IDs. This changes no copy or behaviour.
