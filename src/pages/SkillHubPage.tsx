import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Search, ShoppingBag, GitBranch, BarChart3, Wrench, PlusCircle, Lock, Menu, X
} from "lucide-react";
import assemblMark from "@/assets/brand/assembl-mark.svg";

const SmartAgentSelector = lazy(() => import("@/components/admin/SmartAgentSelector"));
const SkillWiringDashboard = lazy(() => import("@/components/admin/SkillWiringDashboard"));
const SkillMarketplace = lazy(() => import("@/components/admin/SkillMarketplace"));

type Role = 'subscriber' | 'admin';
type Tab = 'smart-select' | 'marketplace' | 'workflows' | 'metrics' | 'skill-wiring' | 'build-agent';

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ElementType;
  role: Role | 'all';
  locked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'smart-select', label: 'Smart Select', icon: Search, role: 'all' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, role: 'all' },
  { id: 'workflows', label: 'Workflows', icon: GitBranch, role: 'all' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, role: 'admin', locked: true },
  { id: 'skill-wiring', label: 'Skill Wiring', icon: Wrench, role: 'admin', locked: true },
  { id: 'build-agent', label: 'Build Agent', icon: PlusCircle, role: 'admin', locked: true },
];

const PlaceholderTab = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center space-y-3">
      <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Brain size={24} style={{ color: 'rgba(255,255,255,0.25)' }} />
      </div>
      <p className="font-display font-light text-lg uppercase tracking-wider"
        style={{ color: 'rgba(255,255,255,0.35)' }}>
        {title}
      </p>
      <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Coming soon
      </p>
    </div>
  </div>
);

const SkillHubPage = () => {
  const [role, setRole] = useState<Role>('subscriber');
  const [activeTab, setActiveTab] = useState<Tab>('smart-select');
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    item => item.role === 'all' || item.role === role
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'smart-select':
        return <SmartAgentSelector />;
      case 'skill-wiring':
        return <SkillWiringDashboard />;
      case 'marketplace':
        return <PlaceholderTab title="Marketplace" />;
      case 'workflows':
        return <PlaceholderTab title="Workflows" />;
      case 'metrics':
        return <PlaceholderTab title="Metrics" />;
      case 'build-agent':
        return <PlaceholderTab title="Build Agent" />;
      default:
        return <PlaceholderTab title={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#09090F' }}>
      {/* ── Mobile top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-4 h-12"
        style={{ background: 'rgba(9,9,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2">
          <img src={assemblMark} alt="Assembl" className="w-6 h-6" />
          <span className="font-display font-light text-xs uppercase tracking-[4px]"
            style={{ color: 'hsl(var(--foreground))' }}>ASSEMBL</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          {mobileOpen ? <X size={18} style={{ color: 'rgba(255,255,255,0.65)' }} /> :
            <Menu size={18} style={{ color: 'rgba(255,255,255,0.65)' }} />}
        </button>
      </div>

      {/* ── Sidebar (desktop) + mobile drawer ── */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40 w-60 shrink-0 flex flex-col
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} style={{
        background: 'rgba(9,9,15,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <div className="p-5 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={assemblMark} alt="Assembl" className="w-8 h-8 logo-glow" />
            <span className="font-display font-light text-sm uppercase tracking-[6px]"
              style={{ color: 'hsl(var(--foreground))' }}>ASSEMBL</span>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            {(['subscriber', 'admin'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  // If switching away from admin and on admin-only tab, reset
                  if (r === 'subscriber' && NAV_ITEMS.find(i => i.id === activeTab)?.role === 'admin') {
                    setActiveTab('smart-select');
                  }
                }}
                className="flex-1 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all"
                style={{
                  background: role === r ? 'hsl(var(--kowhai))' : 'transparent',
                  color: role === r ? '#09090F' : 'rgba(255,255,255,0.45)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          <AnimatePresence mode="popLayout">
            {visibleItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleTabChange(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors relative"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                    color: isActive ? 'hsl(var(--foreground))' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                      style={{ background: 'hsl(var(--kowhai))' }}
                    />
                  )}
                  <item.icon size={15} />
                  <span className="font-body text-xs">{item.label}</span>
                  {item.locked && <Lock size={10} className="ml-auto" style={{ color: 'rgba(255,255,255,0.2)' }} />}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <div className="p-5 pt-3">
          <p className="font-display font-light text-[9px] uppercase tracking-[3px] text-center"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            9 KETE · 78 AGENTS · 1 BRAIN
          </p>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 pt-12 md:pt-0">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'transparent' }} />
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default SkillHubPage;
