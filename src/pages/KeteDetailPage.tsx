import { useParams, useNavigate } from "react-router-dom";
import { KETE_DATA } from "@/components/kete/keteData";
import KeteIcon from "@/components/kete/KeteIcon";
import SEO from "@/components/SEO";
import GlowIcon from "@/components/GlowIcon";
import TextUsButton from "@/components/kete/TextUsButton";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteVideoBlock from "@/components/kete/KeteVideoBlock";

const SLUG_TO_PACK: Record<string, { packId: string; agentId: string }> = {
  manaaki: { packId: "manaaki", agentId: "aura" },
  waihanga: { packId: "waihanga", agentId: "kaupapa" },
  auaha: { packId: "auaha", agentId: "prism" },
  arataki: { packId: "waka", agentId: "motor" },
  pikau: { packId: "pikau", agentId: "gateway" },
  contracts: { packId: "contracts", agentId: "accord" },
};

const NZ_BARRIER_COPY: Record<string, { heading: string; body: string; legislation: string }> = {
  manaaki: {
    heading: "Why this matters in Aotearoa",
    body: "A café owner in Queenstown shouldn't need a lawyer to know if she can trade on Easter Sunday. But right now she does — because the Shop Trading Hours Amendment Act 2016, the Sale and Supply of Alcohol Act 2012, and her local council's alcohol policy all interact differently depending on her location, licence type, and time of day. That's before she gets to her monthly Food Control Plan under the Food Act 2014.",
    legislation: "Food Act 2014 · Shop Trading Hours Amendment Act 2016 · Sale and Supply of Alcohol Act 2012",
  },
  waihanga: {
    heading: "Why this matters in Aotearoa",
    body: "A small builder in Christchurch knows HSWA 2015 requires a site induction before any subcontractor starts work. But when the subbies arrive at 6:30am and the client's pushing for handover, the induction gets skipped — and the PCBU carries personal liability under s.36. Payment claims under the Construction Contracts Act 2002 fail on technicality. Not because the work wasn't done, but because the paperwork wasn't formatted right.",
    legislation: "HSWA 2015 s.36 · Construction Contracts Act 2002 s.20",
  },
  auaha: {
    heading: "Why this matters in Aotearoa",
    body: "A creative studio in Wellington publishes 'NZ's best coffee packaging design' on Instagram. That's an unsubstantiated claim under the Fair Trading Act 1986 — and the Commerce Commission does act on complaints. But the real gap isn't legal compliance. It's cultural. When a brief calls for 'Māori-inspired design elements,' most AI tools generate content without any tikanga review. That's not a compliance failure — it's a trust failure.",
    legislation: "Fair Trading Act 1986 s.9 · s.13",
  },
  arataki: {
    heading: "Why this matters in Aotearoa",
    body: "A customer walks onto the yard in Hamilton comparing a hybrid and a petrol SUV. She wants real NZ fuel costs — not brochure claims from overseas testing cycles. The sales manager needs to get her a CCCFA-compliant finance disclosure before she leaves, because the Credit Contracts and Consumer Finance Act has real teeth since the 2021 amendments. Meanwhile, the service loan car she needs while her trade-in gets inspected requires insurance verification and Consumer Guarantees Act-compliant terms.",
    legislation: "CCCFA 2003 (amended 2021) · Consumer Guarantees Act 1993",
  },
  pikau: {
    heading: "Why this matters in Aotearoa",
    body: "A three-person customs brokerage in Auckland is losing work to bigger firms who've automated their data entry. The owner spends 80% of his brokers' time keying consignment data into CusMod — the same tariff classifications, the same biosecurity declarations, the same GST calculations — while competitors undercut him on price-per-entry. He can't compete on volume. But he can compete on accuracy, relationships, and local knowledge — if the repetitive work is handled.",
    legislation: "Customs and Excise Act 2018 · Biosecurity Act 1993 · NZ Working Tariff",
  },
};

const PIPELINE_IN_ACTION: Record<string, { query: string; stages: { name: string; question: string; action: string }[] }> = {
  manaaki: {
    query: "Can I serve alcohol at my Easter Sunday brunch event?",
    stages: [
      { name: "Kahu", question: "What's allowed here?", action: "Checks Shop Trading Hours Amendment Act 2016 + local alcohol policy + Easter trading exemption register" },
      { name: "Iho", question: "Which specialist handles this?", action: "Routes to Hospitality compliance specialist (AURA agent)" },
      { name: "Tā", question: "Does the work, properly", action: "Drafts location-specific answer with Act + Section citations in NZ English" },
      { name: "Mahara", question: "Checks against what we've learned", action: "Cross-checks against latest council policy update (verified 5am scan)" },
      { name: "Mana", question: "Proves it was done right", action: "Adds 'Not legal advice' disclaimer + requires operator sign-off before posting to staff" },
    ],
  },
  waihanga: {
    query: "Generate a site induction for the new electrical subcontractor starting Monday",
    stages: [
      { name: "Kahu", question: "What's allowed here?", action: "Checks HSWA 2015 s.36 site induction requirements + SWMS for this site" },
      { name: "Iho", question: "Which specialist handles this?", action: "Routes to Site safety specialist (ĀRAI agent)" },
      { name: "Tā", question: "Does the work, properly", action: "Generates site-specific induction from SWMS + LBP register, formatted for SMS delivery" },
      { name: "Mahara", question: "Checks against what we've learned", action: "Cross-checks against current site hazard register and active notifiable works" },
      { name: "Mana", question: "Proves it was done right", action: "Requires PCBU sign-off + acknowledged receipt timestamp before marking 'complete'" },
    ],
  },
  auaha: {
    query: "Review this Instagram campaign copy before we publish",
    stages: [
      { name: "Kahu", question: "What's allowed here?", action: "Checks Fair Trading Act 1986 s.9 (misleading conduct) and s.13 (false representations)" },
      { name: "Iho", question: "Which specialist handles this?", action: "Routes to Creative compliance specialist + tikanga review if cultural content detected" },
      { name: "Tā", question: "Does the work, properly", action: "Reviews each claim against substantiation requirements, suggests compliant rewording" },
      { name: "Mahara", question: "Checks against what we've learned", action: "Cross-checks against previous campaign approvals and known Commerce Commission guidance" },
      { name: "Mana", question: "Proves it was done right", action: "Outputs PASS / FLAG / FAIL per claim, with human approval required before publish" },
    ],
  },
  arataki: {
    query: "Compare fuel costs for the RAV4 Hybrid vs petrol for a customer commuting Hillcrest to CBD daily",
    stages: [
      { name: "Kahu", question: "What's allowed here?", action: "Checks CCCFA disclosure requirements if finance is discussed" },
      { name: "Iho", question: "Which specialist handles this?", action: "Routes to Dealership sales specialist (ARATAKI agent)" },
      { name: "Tā", question: "Does the work, properly", action: "Calculates real NZ fuel costs using live prices (Z, BP, Mobil, Gull, Waitomo) × customer's commute distance" },
      { name: "Mahara", question: "Checks against what we've learned", action: "Verifies fuel price data is timestamped and sourced; CCCFA disclosure matches current requirements" },
      { name: "Mana", question: "Proves it was done right", action: "Requires human sign-off before customer handover of any comparison or finance document" },
    ],
  },
  pikau: {
    query: "Process this commercial invoice for a shipment of automotive parts from Osaka",
    stages: [
      { name: "Kahu", question: "What's allowed here?", action: "Checks Customs and Excise Act 2018 + Biosecurity Act 1993 + applicable tariff concessions" },
      { name: "Iho", question: "Which specialist handles this?", action: "Routes to Customs entry specialist (PIKAU agent)" },
      { name: "Tā", question: "Does the work, properly", action: "Extracts invoice data, maps to NZ Working Tariff codes, populates CusMod fields, calculates duty + GST" },
      { name: "Mahara", question: "Checks against what we've learned", action: "Cross-checks tariff classification against latest Working Tariff update + flags any biosecurity declarations" },
      { name: "Mana", question: "Proves it was done right", action: "Requires licensed customs broker sign-off before submission — never auto-submits" },
    ],
  },
};

const KeteDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const kete = KETE_DATA.find(k => k.slug === slug);

  if (!kete) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFBFC" }}>
        <div className="text-center">
          <h1 className="text-2xl mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#3D4250" }}>Kete not found</h1>
          <button onClick={() => navigate("/kete")} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#D4A843", border: "1px solid #D4A84330", background: "#D4A84310" }}>
            Back to collection
          </button>
        </div>
      </div>
    );
  }

  const nzBarrier = NZ_BARRIER_COPY[kete.slug];
  const pipelineExample = PIPELINE_IN_ACTION[kete.slug];
  const isAuaha = kete.slug === "auaha";

  return (
    <>
      <SEO title={`${kete.name} — ${kete.englishName} | Assembl`} description={kete.description} />
      <div className="min-h-screen" style={{ background: "#FAFBFC" }}>
        {/* Hero */}
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
          <button onClick={() => navigate("/kete")} className="flex items-center gap-1.5 text-xs mb-10 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D425080" }}>
            <GlowIcon name="ArrowLeft" size={14} color="rgba(61,66,80,0.4)" />
            Back to Kete Collection
          </button>

          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-[200px] h-[220px] shrink-0">
              <KeteIcon name={kete.name} accentColor={kete.accentColor} accentLight={kete.accentLight} variant={kete.variant} size="large" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl tracking-[5px] uppercase mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250" }}>
                {kete.name}
              </h1>
              <p className="text-base tracking-[2px] uppercase mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: kete.accentColor }}>
                {kete.englishName}
              </p>
              <p className="text-base leading-relaxed max-w-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D4250CC" }}>
                {kete.description}
              </p>
              <div className="flex items-center gap-4 mt-6">
                <span className="text-xs tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: kete.accentColor }}>
                  {kete.agentCount} agents
                </span>
                {kete.badge && (
                  <span className="text-[11px] tracking-[1px] uppercase px-3 py-1 rounded" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3D425080", background: `${kete.accentColor}15` }}>
                    {kete.badge}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PART 3 — Why this matters in Aotearoa */}
          {nzBarrier && (
            <section
              className="rounded-xl p-6 mb-12"
              style={{
                background: `${kete.accentColor}14`,
                borderLeft: `3px solid ${kete.accentColor}`,
              }}
            >
              <h2 className="text-base mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: "#1A1D29" }}>
                {nzBarrier.heading}
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                {nzBarrier.body}
              </p>
              <div className="pt-3" style={{ borderTop: `1px solid ${kete.accentColor}25` }}>
                <p className="text-[11px] uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: kete.accentColor }}>
                  {nzBarrier.legislation}
                </p>
              </div>
            </section>
          )}

          {/* PART 4 — Refuse-When-Unsafe (AUAHA only) */}
          {isAuaha && (
            <section className="mb-12">
              <h2 className="text-lg tracking-[3px] uppercase mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250B3" }}>
                Refuse-When-Unsafe
              </h2>
              <p className="text-sm mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1D29", fontWeight: 500 }}>
                How Assembl Handles Cultural Boundaries
              </p>
              <p className="text-sm leading-relaxed mb-6 max-w-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                Most AI safety systems use a binary approach: allow or block. Assembl's creative agents use a three-stage pattern that's more nuanced — and more useful.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Stage 1 — Generate", desc: "The agent works normally on the brief. Design concepts, copy drafts, campaign ideas — standard creative output with FTA 1986 compliance checks." },
                  { label: "Stage 2 — Detect & Pause", desc: "When the brief crosses a tikanga boundary — say, 'Māori-inspired design elements' — the agent pauses. Not a hard block. A structured pause that explains what it detected and why it stopped." },
                  { label: "Stage 3 — Offer Alternatives", desc: "The agent offers three paths: consult a Māori advisor (with draft questions prepared), use publicly available design elements with proper attribution, or restructure the brief to avoid the boundary entirely." },
                ].map(card => (
                  <div
                    key={card.label}
                    className="rounded-2xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(184,165,208,0.25)",
                      boxShadow: "0 4px 24px rgba(184,165,208,0.08)",
                    }}
                  >
                    <p className="text-[11px] uppercase tracking-wider mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#B8A5D0" }}>
                      {card.label}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D4250CC" }}>
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[12px] mt-5 max-w-3xl leading-relaxed italic" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF" }}>
                This pattern is what Assembl proposes as a testable research artefact for the AAAIP programme. The question isn't whether AI should refuse — it's whether there's a middle ground between "generate everything" and "block everything" that actually serves creative professionals and the communities whose taonga they're working with.
              </p>
            </section>
          )}

          {/* PART 6 — Pipeline in Action */}
          {pipelineExample && (
            <section
              className="rounded-xl p-6 mb-12"
              style={{
                background: "rgba(34,197,94,0.05)",
                borderLeft: "3px solid #22C55E",
              }}
            >
              <h2 className="text-base mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: "#1A1D29" }}>
                Pipeline in Action
              </h2>
              <p className="text-[11px] uppercase tracking-wider mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#22C55E" }}>
                Real query · Five stages
              </p>
              <p className="text-[14px] mb-5 italic" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D4250" }}>
                "{pipelineExample.query}"
              </p>
              <ol className="space-y-3">
                {pipelineExample.stages.map((s, i) => (
                  <li key={s.name} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <div className="flex items-baseline gap-2 shrink-0 sm:w-[280px]">
                      <span className="text-[11px] tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#22C55E", fontWeight: 700 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[13px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1D29", fontWeight: 600 }}>
                        {s.name}
                      </span>
                      <span className="text-[12px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                        ("{s.question}")
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D4250CC" }}>
                      {s.action}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="text-[12px] mt-5 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                Every output passes through all five stages. Draft-only posture — no agent publishes, sends, or executes without a named human operator's approval.
              </p>
            </section>
          )}

          {/* Per-kete video block (silently hides if no video uploaded) */}
          <KeteVideoBlock slug={kete.slug} accentColor={kete.accentColor} keteName={kete.name} />

          {/* Agents grid */}
          {kete.agents && kete.agents.length > 0 && (
            <section>
              <h2 className="text-lg tracking-[3px] uppercase mb-8" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250B3" }}>
                Specialist Agents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kete.agents.map(agent => (
                  <div key={agent.name} className="p-4 rounded-xl border transition-all duration-200 hover:border-gray-300"
                    style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", borderColor: "rgba(61,66,80,0.08)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kete.accentColor}15` }}>
                        <span className="text-[10px] font-bold" style={{ color: kete.accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
                          {agent.name.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-wider uppercase" style={{ color: "#3D4250DD" }}>{agent.name}</p>
                        <p className="text-[11px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D425066" }}>{agent.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Migration Support */}
          {(() => {
            const MIGRATION_COPY: Record<string, { subheading: string; body: string; examples: string[] }> = {
              manaaki: { subheading: "Moving from your current POS, booking, or rostering system?", body: "Assembl migrates your menu data, staff rosters, supplier records, compliance logs, and booking history from platforms like Lightspeed, Kounta, Deputy, or ResDiary. Your food control plan records come across too — no gaps in your audit trail.", examples: ["Lightspeed POS", "Kounta", "Deputy rosters", "ResDiary bookings", "Xero integration data"] },
              waihanga: { subheading: "Bringing your site data across from existing project management tools?", body: "Assembl pulls in your project schedules, subcontractor records, safety documentation, consent tracking, and payment claim history from tools like Procore, Buildertrend, or even spreadsheet-based systems. Your H&S records transfer with full traceability.", examples: ["Procore", "Buildertrend", "Aconex", "Excel project trackers", "PDF safety docs"] },
              auaha: { subheading: "Migrating from your current content and project management stack?", body: "Assembl imports your content calendars, brand assets, client briefs, project histories, and approval workflows from tools like Monday.com, Asana, Trello, or Google Drive. Your creative IP stays organised and searchable.", examples: ["Monday.com", "Asana", "Trello", "Google Drive", "Dropbox asset libraries"] },
              arataki: { subheading: "Switching from your current dealership management system?", body: "Assembl migrates your vehicle inventory, customer records, service histories, finance disclosures, and warranty data from legacy DMS platforms like Pentana, Titan, or ERA. Compliance documentation transfers intact.", examples: ["Pentana DMS", "Titan DMS", "ERA", "Custom dealer databases", "Excel stock sheets"] },
              pikau: { subheading: "Moving from your current freight and customs management platform?", body: "Assembl imports your shipping records, customs declarations, client profiles, carrier rate tables, and compliance documentation from platforms like CargoWise, WiseTech, or bespoke systems. Your NZCS filing history comes across clean.", examples: ["CargoWise One", "WiseTech", "Customs broker databases", "Rate spreadsheets", "EDI records"] },
            };
            const mc = MIGRATION_COPY[kete.slug];
            if (!mc) return null;
            return (
              <section className="mt-16 rounded-2xl p-6 sm:p-8" style={{ background: `${kete.accentColor}08`, border: `1px solid ${kete.accentColor}12` }}>
                <h2 className="text-lg tracking-[3px] uppercase mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250B3" }}>
                  Nuku Mai · Migration Support
                </h2>
                <p className="text-[15px] font-medium mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: kete.accentColor }}>
                  {mc.subheading}
                </p>
                <p className="text-[14px] leading-[1.7] mb-5 max-w-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                  {mc.body}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {mc.examples.map(ex => (
                    <span key={ex} className="text-[11px] px-3 py-1.5 rounded-full tracking-wider uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: kete.accentColor, background: `${kete.accentColor}10` }}>
                      {ex}
                    </span>
                  ))}
                </div>
                <a href="/migration" className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: kete.accentColor }}>
                  Learn more about migration <span>→</span>
                </a>
              </section>
            );
          })()}

          {/* CTA */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <button onClick={() => navigate("/contact")} className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: `${kete.accentColor}20`, color: kete.accentColor, border: `1px solid ${kete.accentColor}30`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Get started
            </button>
            <TextUsButton keteName={kete.name} accentColor={kete.accentColor} />
          </div>
        </div>
      </div>
      {(() => {
        const pack = SLUG_TO_PACK[kete.slug] || { packId: "assembl", agentId: "echo" };
        return (
          <KeteAgentChat
            keteName={kete.name}
            keteLabel={kete.englishName}
            accentColor={kete.accentColor}
            defaultAgentId={pack.agentId}
            packId={pack.packId}
            starterPrompts={[
              `What can ${kete.name} agents do for my business?`,
              `How does onboarding work for ${kete.englishName}?`,
              "What compliance is covered?",
            ]}
          />
        );
      })()}
    </>
  );
};

export default KeteDetailPage;
