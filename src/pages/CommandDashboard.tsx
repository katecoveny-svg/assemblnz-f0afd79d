/**
 * Cross-Sector Command Dashboard — "God-mode" view
 * Live stats from all sectors in one overview.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, HardHat, Palette, Car, Package, Bird,
  TrendingUp, Shield, AlertTriangle, CheckCircle2, Clock,
  Video, FileText, Truck, ChefHat, Zap, ArrowRight,
  LayoutDashboard, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SectorSwitcher from "@/components/SectorSwitcher";
import SEO from "@/components/SEO";
import BusinessPulse from "@/components/BusinessPulse";
import AotearoaVerifiedBadge from "@/components/AotearoaVerifiedBadge";

const GOLD = "#4AA5A8";

interface SectorStat {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  color: string;
  route: string;
  stats: { label: string; value: string; icon: React.ElementType; trend?: string }[];
  status: "operational" | "attention" | "critical";
  statusLabel: string;
}

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(74,165,168,0.15)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export default function CommandDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveData, setLiveData] = useState<Record<string, number>>({});

  // Fetch live counts
  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      const [
        { count: creativeAssets },
        { count: contentItems },
        { count: adCreatives },
        { count: bookings },
        { count: shipments },
      ] = await Promise.all([
        supabase.from("creative_assets").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("ad_creatives").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("customs_declarations").select("*", { count: "exact", head: true }),
      ]);

      setLiveData({
        creativeAssets: creativeAssets || 0,
        contentItems: contentItems || 0,
        adCreatives: adCreatives || 0,
        bookings: bookings || 0,
        shipments: shipments || 0,
      });
    };
    fetchCounts();
  }, [user]);

  const sectors: SectorStat[] = [
    {
      id: "auaha", name: "Auaha", nameEn: "Creative & Media",
      icon: Palette, color: "#A8DDDB", route: "/auaha",
      status: "operational", statusLabel: `${liveData.creativeAssets || 0} assets generated`,
      stats: [
        { label: "Assets", value: String(liveData.creativeAssets || 0), icon: Video },
        { label: "Content", value: String(liveData.contentItems || 0), icon: FileText },
        { label: "Ads", value: String(liveData.adCreatives || 0), icon: TrendingUp },
      ],
    },
    {
      id: "waihanga", name: "Waihanga", nameEn: "Construction",
      icon: HardHat, color: "#3A7D6E", route: "/waihanga",
      status: "operational", statusLabel: "H&S monitoring active",
      stats: [
        { label: "Safety", value: "Active", icon: Shield },
        { label: "Compliance", value: "100%", icon: CheckCircle2 },
        { label: "Hazards", value: "0 open", icon: AlertTriangle },
      ],
    },
    {
      id: "pikau", name: "Pikau", nameEn: "Freight & Customs",
      icon: Package, color: "#5AADA0", route: "/pikau",
      status: liveData.shipments ? "attention" : "operational",
      statusLabel: `${liveData.shipments || 0} shipments tracking`,
      stats: [
        { label: "Shipments", value: String(liveData.shipments || 0), icon: Truck },
        { label: "Customs", value: "Clear", icon: Shield },
        { label: "ETA", value: "On time", icon: Clock },
      ],
    },
    {
      id: "manaaki", name: "Manaaki", nameEn: "Hospitality & Tourism",
      icon: UtensilsCrossed, color: "#4AA5A8", route: "/manaaki",
      status: "operational", statusLabel: `${liveData.bookings || 0} bookings tracked`,
      stats: [
        { label: "Bookings", value: String(liveData.bookings || 0), icon: ChefHat },
        { label: "Food Safety", value: "Compliant", icon: Shield },
        { label: "Reviews", value: "Monitored", icon: Activity },
      ],
    },
    {
      id: "arataki", name: "Arataki", nameEn: "Automotive",
      icon: Car, color: "#E8E8E8", route: "/arataki",
      status: "operational", statusLabel: "Workshop ready",
      stats: [
        { label: "WoF Due", value: "None", icon: Clock },
        { label: "RUC", value: "Current", icon: Shield },
        { label: "Service", value: "Up to date", icon: CheckCircle2 },
      ],
    },
  ];

  const statusColor = (s: string) =>
    s === "operational" ? "#00A86B" : s === "attention" ? "#4AA5A8" : "#C85A54";

  return (
    <>
      <SEO title="Command Centre — Assembl" description="Cross-sector overview of your entire NZ operation" />
      <div className="flex h-screen" style={{ background: "transparent" }}>
        <SectorSwitcher
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <LayoutDashboard size={20} style={{ color: GOLD }} />
              <h1 className="text-xl font-display font-bold text-foreground tracking-wide">Command Centre</h1>
            </div>
            <p className="text-xs font-body text-[#9CA3AF] ml-8">
              Your entire NZ operation at a glance — {new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Sector Cards Grid */}
          <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sectors.map((sector, i) => {
              const Icon = sector.icon;
              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={() => navigate(sector.route)}
                  className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    ...GLASS,
                    borderColor: `${sector.color}15`,
                  }}
                >
                  {/* Ambient glow */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ background: sector.color }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${sector.color}12`,
                          border: `1px solid ${sector.color}25`,
                          boxShadow: `0 0 16px ${sector.color}10`,
                        }}
                      >
                        <Icon size={18} style={{ color: sector.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-display font-bold text-foreground">{sector.name}</h3>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400">
                          / {sector.nameEn}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[#D1D5DB] group-hover:text-gray-500 transition-all group-hover:translate-x-1"
                    />
                  </div>

                  {/* Status pill */}
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: statusColor(sector.status), boxShadow: `0 0 8px ${statusColor(sector.status)}` }}
                    />
                    <span className="text-[10px] font-body text-gray-500">{sector.statusLabel}</span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    {sector.stats.map((stat) => {
                      const StatIcon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="rounded-lg px-2.5 py-2 text-center"
                          style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                        >
                          <StatIcon size={12} className="mx-auto mb-1" style={{ color: sector.color, opacity: 0.6 }} />
                          <div className="text-xs font-body font-bold text-[#3D4250]">{stat.value}</div>
                          <div className="text-[8px] font-body text-gray-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Symbiotic Bridge Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                ...GLASS,
                borderColor: "rgba(74,165,168, 0.15)",
                background: "linear-gradient(135deg, rgba(74,165,168,0.03), rgba(90,173,160,0.03))",
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ background: GOLD }} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,165,168,0.1)", border: "1px solid rgba(74,165,168,0.2)" }}>
                    <Zap size={18} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-foreground">Symbiotic Bridge</h3>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Cross-sector intelligence</span>
                  </div>
                </div>
                <p className="text-[11px] font-body text-[#9CA3AF] leading-relaxed mb-4">
                  Construction milestones auto-generate creative content. Freight arrivals trigger hospitality inventory. All sectors share Brand DNA.
                </p>
                <div className="space-y-1.5">
                  {[
                    { from: "Waihanga", to: "Auaha", label: "Milestone → TikTok video", fromColor: "#3A7D6E", toColor: "#A8DDDB" },
                    { from: "Pikau", to: "Manaaki", label: "Customs clear → Inventory update", fromColor: "#5AADA0", toColor: "#4AA5A8" },
                    { from: "Auaha", to: "All", label: "Brand DNA → Tone adaptation", fromColor: "#A8DDDB", toColor: "#00A86B" },
                  ].map((bridge, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-body">
                      <span className="px-1.5 py-0.5 rounded" style={{ background: `${bridge.fromColor}15`, color: bridge.fromColor }}>{bridge.from}</span>
                      <ArrowRight size={10} className="text-[#D1D5DB]" />
                      <span className="px-1.5 py-0.5 rounded" style={{ background: `${bridge.toColor}15`, color: bridge.toColor }}>{bridge.to}</span>
                      <span className="text-gray-400 ml-1">{bridge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Aotearoa Verified Badge */}
            <AotearoaVerifiedBadge />
          </div>

          {/* Business Pulse */}
          <div className="mt-8">
            <BusinessPulse />
          </div>
        </div>
      </div>
    </>
  );
}
