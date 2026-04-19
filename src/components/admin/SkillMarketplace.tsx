import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Download, Shield, Award, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

type Certification = 'official' | 'certified' | 'verified' | 'community';
type PriceType = 'free' | 'subscription';

interface MarketplaceSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  publisher: string;
  rating: number;
  installCount: number;
  price: { type: PriceType; amount?: number };
  compatibleKete: string[];
  certification: Certification;
  version: string;
}

const CERT_STYLES: Record<Certification, { label: string; color: string; bg: string; border: string }> = {
  official:  { label: 'Official',  color: '#3A7D6E', bg: 'rgba(58,125,110,0.1)',  border: 'rgba(58,125,110,0.25)' },
  certified: { label: 'Certified', color: '#4AA5A8', bg: 'rgba(212,168,67,0.1)',  border: 'rgba(212,168,67,0.25)' },
  verified:  { label: 'Verified',  color: '#3A6A9C', bg: 'rgba(26,58,92,0.15)',   border: 'rgba(26,58,92,0.3)' },
  community: { label: 'Community', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
};

const KETE_COLORS: Record<string, string> = {
  'All': '#4AA5A8',
  'Pakihi': '#4AA5A8',
  'Auaha': '#B794F4',
  'Hanga': '#C9B458',
  'Hauora': '#7BC8A4',
  'Manaaki': '#E8A87C',
  'Waka': '#6B8FA3',
  'Hangarau': '#3A7D6E',
  'Te Kāhui Reo': '#4AA5A8',
  'Toro': '#E8D5B7',
};

const CATEGORIES = ['All', 'Compliance', 'Operations', 'Sales', 'Design', 'Finance', 'Legal', 'NZ-Specific', 'Māori'];

const SKILLS: MarketplaceSkill[] = [
  {
    id: 'tikanga-compliance', name: 'Tikanga Compliance', description: 'Automated tikanga and cultural protocol checks for all agent outputs. Ensures respectful use of te reo Māori, correct macrons, and culturally appropriate content.',
    category: 'Compliance', publisher: 'Assembl', rating: 4.9, installCount: 2100,
    price: { type: 'free' }, compatibleKete: ['All'], certification: 'official', version: '2.1.0',
  },
  {
    id: 'xero-integration', name: 'Xero Integration', description: 'Full two-way sync with Xero for invoicing, expense tracking, GST returns, and bank reconciliation. Supports multi-currency.',
    category: 'Finance', publisher: 'FinanceNZ', rating: 4.7, installCount: 890,
    price: { type: 'subscription', amount: 49 }, compatibleKete: ['Pakihi'], certification: 'certified', version: '3.0.2',
  },
  {
    id: 'fal-image-gen', name: 'fal.ai Image Gen', description: 'AI-powered image generation using fal.ai models. Create product photos, marketing visuals, and social media assets from text prompts.',
    category: 'Design', publisher: 'CreativeTools', rating: 4.5, installCount: 456,
    price: { type: 'subscription', amount: 29 }, compatibleKete: ['Auaha'], certification: 'verified', version: '1.4.0',
  },
  {
    id: 'worksafe-hs', name: 'WorkSafe H&S', description: 'Complete Health & Safety compliance toolkit aligned with WorkSafe NZ guidelines. Includes hazard registers, incident reporting, and PCBU obligations.',
    category: 'Compliance', publisher: 'Assembl', rating: 4.8, installCount: 1200,
    price: { type: 'free' }, compatibleKete: ['Hanga', 'Hauora'], certification: 'official', version: '2.3.1',
  },
  {
    id: 'te-reo-dictionary', name: 'Te Reo Dictionary', description: 'Comprehensive te reo Māori dictionary with contextual usage, pronunciation guides, and dialect variations. Powered by native speaker data.',
    category: 'Māori', publisher: 'Kaiako Digital', rating: 4.6, installCount: 234,
    price: { type: 'free' }, compatibleKete: ['Te Kāhui Reo'], certification: 'community', version: '1.2.0',
  },
  {
    id: 'stripe-payments', name: 'Stripe Payments', description: 'Accept payments via Stripe with NZ-optimised checkout. Supports one-off and recurring billing, invoices, and multi-currency.',
    category: 'Finance', publisher: 'PayNZ', rating: 4.4, installCount: 678,
    price: { type: 'subscription', amount: 39 }, compatibleKete: ['Pakihi', 'Waka'], certification: 'certified', version: '4.1.0',
  },
];

const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const SkillMarketplace = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  const filtered = SKILLS.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || s.category === category || (category === 'NZ-Specific' && ['Compliance', 'Māori'].includes(s.category));
    return matchSearch && matchCat;
  });

  const handleInstall = (id: string) => {
    setInstalled(prev => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-display font-bold text-[10px] tracking-[4px] uppercase mb-2"
          style={{ color: 'hsl(var(--kowhai))' }}>
          SKILL MARKETPLACE
        </p>
        <h2 className="font-display font-light text-2xl tracking-wide uppercase"
          style={{ color: 'hsl(var(--foreground))' }}>
          Discover and install agent capabilities
        </h2>
      </div>

      {/* Featured banner */}
      <motion.div
        className="glass-card p-4 glow-card-hover flex items-center gap-4 flex-wrap"
        style={{ borderLeft: '3px solid hsl(var(--kowhai))', borderRadius: 12 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles size={18} style={{ color: 'hsl(var(--kowhai))' }} />
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            NEW: WorkSafe H&S skill available for Hanga kete
          </p>
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Complete compliance toolkit — free for all subscribers
          </p>
        </div>
        <button
          onClick={() => handleInstall('worksafe-hs')}
          className="px-4 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all"
          style={{
            background: installed.has('worksafe-hs') ? 'hsl(var(--pounamu))' : 'transparent',
            color: installed.has('worksafe-hs') ? '#09090F' : 'hsl(var(--kowhai))',
            border: `1px solid ${installed.has('worksafe-hs') ? 'hsl(var(--pounamu))' : 'hsl(var(--kowhai))'}`,
          }}
        >
          {installed.has('worksafe-hs') ? '✓ Installed' : 'Install'}
        </button>
      </motion.div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="glass-card p-1" style={{ borderRadius: 12 }}>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <Search size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="flex-1 bg-transparent outline-none font-body text-sm placeholder:text-muted-foreground"
              style={{ color: 'hsl(var(--foreground))' }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider transition-all"
              style={{
                background: category === cat ? 'hsl(var(--kowhai))' : 'rgba(255,255,255,0.03)',
                color: category === cat ? '#09090F' : 'rgba(255,255,255,0.45)',
                border: `1px solid ${category === cat ? 'hsl(var(--kowhai))' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((skill, i) => {
            const cert = CERT_STYLES[skill.certification];
            const isInstalled = installed.has(skill.id);

            return (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-5 glow-card-hover relative"
                style={{ borderRadius: 14 }}
              >
                {/* Cert badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-display font-bold uppercase tracking-wider"
                    style={{ background: cert.bg, color: cert.color, border: `1px solid ${cert.border}` }}>
                    {skill.certification === 'official' && <Shield size={9} />}
                    {skill.certification === 'certified' && <Award size={9} />}
                    {skill.certification === 'verified' && <CheckCircle2 size={9} />}
                    {cert.label}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-mono-jb font-bold text-sm pr-24" style={{ color: 'hsl(var(--foreground))' }}>
                  {skill.name}
                </h3>

                {/* Description */}
                <p className="font-body text-xs mt-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {skill.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] font-mono-jb" style={{ color: 'hsl(var(--kowhai))' }}>
                    <Star size={11} fill="currentColor" /> {skill.rating}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono-jb" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Download size={10} /> {formatCount(skill.installCount)}
                  </span>
                  {skill.compatibleKete.map(k => (
                    <span key={k} className="px-1.5 py-0.5 rounded text-[8px] font-display font-bold uppercase"
                      style={{ background: `${KETE_COLORS[k] || '#888'}15`, color: KETE_COLORS[k] || '#888', border: `1px solid ${KETE_COLORS[k] || '#888'}25` }}>
                      {k}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span className="text-[10px] font-body" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {skill.publisher}
                    </span>
                    <span className="mx-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-[10px] font-mono-jb" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      v{skill.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-jb text-xs font-bold"
                      style={{ color: skill.price.type === 'free' ? 'hsl(var(--pounamu))' : 'hsl(var(--kowhai))' }}>
                      {skill.price.type === 'free' ? 'Free' : `$${skill.price.amount}/mo`}
                    </span>
                    <button
                      onClick={() => handleInstall(skill.id)}
                      disabled={isInstalled}
                      className="px-3 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider transition-all"
                      style={{
                        background: isInstalled ? 'hsl(var(--pounamu))' : 'transparent',
                        color: isInstalled ? '#09090F' : 'hsl(var(--kowhai))',
                        border: `1px solid ${isInstalled ? 'hsl(var(--pounamu))' : 'hsl(var(--kowhai))'}`,
                        opacity: isInstalled ? 0.7 : 1,
                      }}
                    >
                      {isInstalled ? '✓ Installed' : 'Install'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No skills match your search
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillMarketplace;
