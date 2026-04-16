import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { ArrowRight, ChevronDown } from 'lucide-react';
import KeteMiniIcon, { type KeteGlyph } from '@/components/kete/KeteMiniIcon';
import { KETE_CONFIG } from '@/components/kete/KeteConfig';
import type { KeteType } from '@/lib/personalization/types';

const GLYPH_MAP: Record<string, KeteGlyph> = {
  manaaki: 'check',
  waihanga: 'shield',
  auaha: 'bolt',
  arataki: 'gear',
  pikau: 'globe',
  toro: 'people',
};

const KETE_INFO: Record<string, { name: string; nameEn: string; glyph: KeteGlyph; color: string; path: string; samplePath: string }> = Object.fromEntries(
  KETE_CONFIG.map(k => [k.id, {
    name: k.name.toUpperCase(),
    nameEn: k.nameEn,
    glyph: GLYPH_MAP[k.id] ?? 'check',
    color: k.color,
    path: k.route,
    samplePath: '/sample/manaaki',
  }])
);

export default function ContextBar() {
  const { profile, isPersonalized } = usePersonalization();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isPersonalized || dismissed) return;

    const kete = profile.detectedIndustry;
    if (!kete) return;

    // Show after 60% scroll depth OR 2+ pages in same kete
    const ketePages = profile.signals.pagesViewed.filter(p => {
      if (kete === 'manaaki') return p.startsWith('/manaaki');
      if (kete === 'waihanga') return p.startsWith('/waihanga');
      if (kete === 'auaha') return p.startsWith('/auaha');
      if (kete === 'arataki') return p.startsWith('/arataki');
      if (kete === 'pikau') return p.startsWith('/pikau');
      if (kete === 'toro') return p.startsWith('/toro');
      return false;
    });

    if (ketePages.length >= 2) {
      setVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.6) {
        setVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPersonalized, profile.detectedIndustry, profile.signals.pagesViewed, dismissed]);

  if (!isPersonalized || !profile.detectedIndustry || dismissed) return null;

  const info = KETE_INFO[profile.detectedIndustry];
  if (!info) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-16 left-0 right-0 z-[9998] flex items-center justify-center"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="flex items-center gap-3 px-5 h-[48px] text-[12px] w-full relative overflow-hidden"
            style={{
              background: '#EEEEF2',
              boxShadow: `
                0 4px 16px rgba(166,166,180,0.35),
                0 1px 0 rgba(255,255,255,0.85) inset,
                0 -1px 0 rgba(166,166,180,0.15) inset,
                0 0 24px rgba(58,125,110,0.08)
              `,
              borderBottom: '1px solid rgba(58,125,110,0.1)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {/* Accent glow line */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${info.color}60, ${info.color}, ${info.color}60, transparent)`,
                boxShadow: `0 0 12px ${info.color}30, 0 0 4px ${info.color}20`,
              }}
            />
            {/* Specular highlight */}
            <div
              className="absolute top-0 left-[5%] right-[5%] h-[1px] opacity-70"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }}
            />

            <KeteMiniIcon glyph={info.glyph} color={info.color} size={22} />
            <span style={{ color: 'rgba(26,29,41,0.5)' }}>
              You're exploring
            </span>
            <span className="font-semibold tracking-[2px]" style={{ color: info.color, textShadow: `0 0 8px ${info.color}30` }}>
              {info.name}
            </span>
            <span style={{ color: 'rgba(26,29,41,0.2)' }}>·</span>
            <Link
              to={info.samplePath}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{ color: '#3A7D6E' }}
            >
              See a sample evidence pack
              <ArrowRight size={11} />
            </Link>
            <span style={{ color: 'rgba(26,29,41,0.12)' }}>|</span>
            <Link
              to="/kete"
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(26,29,41,0.45)' }}
            >
              Browse all industries
              <ChevronDown size={11} />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="ml-auto text-[10px] hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(26,29,41,0.25)' }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
