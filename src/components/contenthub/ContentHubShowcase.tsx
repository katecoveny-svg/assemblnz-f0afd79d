import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AgentAvatar from "@/components/AgentAvatar";
import {
  EchoContentPreview,
  FluxPipelinePreview,
  HavenCompliancePreview,
  ForgeComparisonPreview,
  ArohaCalculatorPreview,
  PrismCampaignPreview,
  LedgerPayePreview,
  VaultMortgagePreview,
  ShieldRiskPreview,
  ApexHazardPreview,
  AnchorContractPreview,
  HelmWeeklyPreview,
} from "./MiniPreviews";

const FEATURED = [
  { name: "ECHO", color: "#D4A843", id: "echo", title: "Content Command Centre", desc: "Daily content queue, DM drafts, and performance analytics", Preview: EchoContentPreview },
  { name: "FLUX", color: "#3A6A9C", id: "sales", title: "Sales Pipeline Dashboard", desc: "AI-scored leads, deal health alerts, and revenue forecasting", Preview: FluxPipelinePreview },
  { name: "HAVEN", color: "#4FC3F7", id: "property", title: "Healthy Homes Compliance", desc: "Instant property compliance check with tradie assignment", Preview: HavenCompliancePreview },
  { name: "FORGE", color: "#3A6A9C", id: "automotive", title: "F&I Payment Comparison", desc: "3-lender comparison with CCCFA-compliant disclosure", Preview: ForgeComparisonPreview },
  { name: "AROHA", color: "#3A6A9C", id: "hr", title: "Employment Cost Calculator", desc: "True employer cost breakdown with KiwiSaver & ACC", Preview: ArohaCalculatorPreview },
  { name: "PRISM", color: "#E040FB", id: "marketing", title: "Campaign Generator", desc: "One brief generates email, social, and ad copy", Preview: PrismCampaignPreview },
  { name: "LEDGER", color: "#4FC3F7", id: "accounting", title: "PAYE Calculator", desc: "Instant NZ PAYE breakdown with net take-home pay", Preview: LedgerPayePreview },
  { name: "VAULT", color: "#7E57C2", id: "finance", title: "Mortgage Comparison", desc: "Compare banks and find the cheapest option", Preview: VaultMortgagePreview },
  { name: "SHIELD", color: "#7E57C2", id: "insurance", title: "Risk Assessment", desc: "Natural hazard profile and recommended sum insured", Preview: ShieldRiskPreview },
  { name: "APEX", color: "#5AADA0", id: "construction", title: "Safety Hazard Matrix", desc: "HSWA-compliant hazard register with risk scores", Preview: ApexHazardPreview },
  { name: "ANCHOR", color: "#3A6A9C", id: "legal", title: "Employment Agreement", desc: "ERA 2000-compliant agreement generated in seconds", Preview: AnchorContractPreview },
  { name: "TŌROA", color: "#3A6A9C", id: "operations", title: "Family Weekly Planner", desc: "School timetable, bus routes, and events dashboard", Preview: HelmWeeklyPreview },
];

const ContentHubShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = (scrollRef.current.children[0] as HTMLElement)?.clientWidth || 1;
    const idx = Math.round(scrollLeft / (cardWidth + 24));
    setActiveIdx(Math.min(idx, FEATURED.length - 1));
  };

  const scrollTo = (idx: number) => {
    setActiveIdx(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <section className="pb-16">
      <h2
        className="font-display font-extrabold text-xl sm:text-2xl text-center mb-8 px-4 halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Live agent outputs
      </h2>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 sm:px-8 snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {FEATURED.map((item, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-[85vw] sm:w-[420px] lg:w-[460px] rounded-2xl overflow-hidden group transition-all duration-500 flex flex-col"
            style={{
              background: "rgba(15,15,18,0.8)",
              border: `1px solid ${item.color}15`,
              boxShadow: i === activeIdx
                ? `0 0 60px -20px ${item.color}25, 0 20px 60px -20px rgba(0,0,0,0.5)`
                : `0 10px 40px -20px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Agent header with avatar */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <AgentAvatar agentId={item.id} color={item.color} size={44} showGlow />
              <div>
                <span
                  className="font-mono-jb text-[10px] tracking-wider block"
                  style={{ color: item.color }}
                >
                  {item.name}
                </span>
                <span className="font-display font-bold text-sm text-foreground">
                  {item.title}
                </span>
              </div>
            </div>

            {/* Interactive mini-dashboard */}
            <div
              className="mx-4 rounded-xl p-4 flex-1"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${item.color}10`,
              }}
            >
              <item.Preview />
            </div>

            {/* Card footer */}
            <div className="px-5 pb-5 pt-3 flex items-center justify-between gap-3">
              <p className="font-body text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {item.desc}
              </p>
              <Link
                to={`/chat/${item.id}`}
                className="cta-glass-green shrink-0 inline-flex items-center gap-2 text-xs font-body font-semibold px-4 py-2.5 rounded-lg"
              >
                Try it →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-8">
        {FEATURED.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === activeIdx ? 20 : 8,
              height: 8,
              background: i === activeIdx ? item.color : "rgba(255,255,255,0.15)",
              boxShadow: i === activeIdx ? `0 0 12px ${item.color}40` : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default ContentHubShowcase;
