import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  { name: "ECHO", color: "#E4A0FF", id: "echo", title: "Content Command Centre", desc: "Daily content queue, DM drafts, and performance analytics — all running on autopilot", Preview: EchoContentPreview },
  { name: "FLUX", color: "#00E5FF", id: "sales", title: "Sales Pipeline Dashboard", desc: "AI-scored leads, deal health alerts, and revenue forecasting for NZ businesses", Preview: FluxPipelinePreview },
  { name: "HAVEN", color: "#FF80AB", id: "property", title: "Healthy Homes Compliance", desc: "Instant property compliance check with pass/fail scoring and tradie assignment", Preview: HavenCompliancePreview },
  { name: "FORGE", color: "#FF4D6A", id: "automotive", title: "F&I Payment Comparison", desc: "3-lender comparison with CCCFA-compliant disclosure generated in seconds", Preview: ForgeComparisonPreview },
  { name: "AROHA", color: "#FF6F91", id: "hr", title: "Employment Cost Calculator", desc: "True employer cost breakdown showing the 19.6% gap most employers don't know about", Preview: ArohaCalculatorPreview },
  { name: "PRISM", color: "#E040FB", id: "marketing", title: "Campaign Generator", desc: "One brief generates email, LinkedIn, Instagram, Reel script, and ad copy", Preview: PrismCampaignPreview },
  { name: "LEDGER", color: "#4FC3F7", id: "accounting", title: "PAYE Calculator", desc: "Instant NZ PAYE breakdown with KiwiSaver, ACC, and net take-home pay", Preview: LedgerPayePreview },
  { name: "VAULT", color: "#7E57C2", id: "finance", title: "Mortgage Comparison", desc: "Compare 4 banks side-by-side and find the cheapest option over loan life", Preview: VaultMortgagePreview },
  { name: "SHIELD", color: "#7E57C2", id: "insurance", title: "Risk Assessment", desc: "Natural hazard profile and recommended sum insured for any NZ address", Preview: ShieldRiskPreview },
  { name: "APEX", color: "#FF6F00", id: "construction", title: "Safety Hazard Matrix", desc: "HSWA-compliant hazard register with risk scores and controls", Preview: ApexHazardPreview },
  { name: "ANCHOR", color: "#00E5FF", id: "legal", title: "Employment Agreement", desc: "ERA 2000-compliant employment agreement generated in seconds", Preview: AnchorContractPreview },
  { name: "HELM", color: "#00E5FF", id: "operations", title: "Family Weekly Planner", desc: "School timetable, bus routes, packing lists, and events — one dashboard", Preview: HelmWeeklyPreview },
];

const ContentHubShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % FEATURED.length;
        scrollRef.current?.children[next]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

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
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 sm:px-8 snap-x snap-mandatory scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onScroll={handleScroll}
      >
        {FEATURED.map((item, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-[85vw] sm:w-[440px] lg:w-[480px] rounded-2xl overflow-hidden group transition-all duration-500 flex flex-col"
            style={{
              background: "rgba(15,15,18,0.8)",
              border: `1px solid ${item.color}15`,
              boxShadow: i === activeIdx
                ? `0 0 60px -20px ${item.color}25, 0 20px 60px -20px rgba(0,0,0,0.5)`
                : `0 10px 40px -20px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Agent badge header */}
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }}
              />
              <span
                className="font-mono-jb text-[10px] tracking-wider px-2.5 py-1 rounded-md"
                style={{
                  background: `${item.color}10`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                }}
              >
                {item.name}
              </span>
              <span className="font-syne font-bold text-sm text-foreground ml-1">
                {item.title}
              </span>
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
            <div className="px-5 pb-5 pt-3 space-y-3">
              <p className="font-jakarta text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                {item.desc}
              </p>
              <Link
                to={`/chat/${item.id}`}
                className="cta-glass-green inline-flex items-center gap-2 text-xs font-jakarta font-semibold px-5 py-2.5 rounded-lg"
              >
                Try {item.name} →
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
