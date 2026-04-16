import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { KETE_CONFIG } from '@/components/kete/KeteConfig';
import type { KeteType } from '@/lib/personalization/types';

/* ── Industry-specific SVG icons (not generic glyphs) ── */
function KeteIcon({ id, color, size = 20 }: { id: string; color: string; size?: number }) {
  if (id === 'manaaki') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3C9.5 3 7.5 5 7.5 7.5c0 2 1.5 3.8 3.5 4.3V15H9v2h6v-2h-2v-3.2c2-.5 3.5-2.3 3.5-4.3C16.5 5 14.5 3 12 3z" fill={color} opacity="0.9"/>
      <path d="M9 19h6v1.5a1 1 0 01-1 1h-4a1 1 0 01-1-1V19z" fill={color} opacity="0.5"/>
    </svg>
  );
  if (id === 'waihanga') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="17" width="16" height="3" rx="1" fill={color} opacity="0.9"/>
      <path d="M6 17v-2a6 6 0 0112 0v2" stroke={color} strokeWidth="2" fill="none"/>
      <line x1="10" y1="17" x2="10" y2="12" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <line x1="14" y1="17" x2="14" y2="11" stroke={color} strokeWidth="1.2" opacity="0.5"/>
    </svg>
  );
  if (id === 'auaha') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <circle cx="9" cy="9.5" r="2" fill={color} opacity="0.85"/>
      <circle cx="15.5" cy="9.5" r="1.5" fill={color} opacity="0.65"/>
      <circle cx="9.5" cy="15" r="1.3" fill={color} opacity="0.55"/>
      <circle cx="15" cy="15" r="1.7" fill={color} opacity="0.75"/>
    </svg>
  );
  if (id === 'arataki') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 15h16v2.5a1 1 0 01-1 1H5a1 1 0 01-1-1V15z" fill={color} opacity="0.85"/>
      <path d="M6 15l1.5-5h9L18 15" stroke={color} strokeWidth="1.5" fill="none"/>
      <circle cx="7.5" cy="16.5" r="1.5" fill={color} opacity="0.5"/>
      <circle cx="16.5" cy="16.5" r="1.5" fill={color} opacity="0.5"/>
      <rect x="9" y="12" width="6" height="2" rx="0.5" fill={color} opacity="0.3"/>
    </svg>
  );
  if (id === 'pikau') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" fill="none"/>
      <line x1="9" y1="5" x2="9" y2="19" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="15" y1="5" x2="15" y2="19" stroke={color} strokeWidth="1" opacity="0.4"/>
      <path d="M3 10h18" stroke={color} strokeWidth="1" opacity="0.35"/>
    </svg>
  );
  if (id === 'toro') return (
    <svg width={size + 4} height={size} viewBox="0 0 28 20" fill="none">
      <path d="M14 10 C11 7, 5 5, 1 7 C5 6.5, 9 8, 12 9.5 L14 10 L16 9.5 C19 8, 23 6.5, 27 7 C23 5, 17 7, 14 10Z" fill={color} opacity="0.85"/>
      <ellipse cx="14" cy="10.5" rx="2.5" ry="1.2" fill={color}/>
    </svg>
  );
  return null;
}

const KETE_INFO: Record<string, { name: string; nameEn: string; color: string; path: string; samplePath: string }> = Object.fromEntries(
  KETE_CONFIG.map(k => [k.id, {
    name: k.name.toUpperCase(),
    nameEn: k.nameEn,
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

  const rgb = hexToRgb(info.color);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-16 left-0 right-0 z-[9998] flex items-center justify-center"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="flex items-center gap-3 px-5 h-[52px] text-[12px] w-full relative overflow-hidden"
            style={{
              background: '#EEEEF2',
              boxShadow: `
                0 6px 20px rgba(166,166,180,0.4),
                0 1px 0 rgba(255,255,255,0.9) inset,
                0 -1px 0 rgba(166,166,180,0.12) inset,
                0 0 30px rgba(${rgb},0.1)
              `,
              borderBottom: `1px solid rgba(${rgb},0.12)`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {/* Liquid glass animated background blobs */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 180, height: 60,
                  left: '10%', top: '-10px',
                  background: `radial-gradient(ellipse, rgba(${rgb},0.10) 0%, transparent 70%)`,
                  animation: 'contextBlob1 8s ease-in-out infinite',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 120, height: 50,
                  right: '20%', top: '-5px',
                  background: `radial-gradient(ellipse, rgba(232,169,72,0.08) 0%, transparent 70%)`,
                  animation: 'contextBlob2 10s ease-in-out infinite',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 100, height: 40,
                  left: '55%', top: '5px',
                  background: `radial-gradient(ellipse, rgba(200,195,220,0.08) 0%, transparent 70%)`,
                  animation: 'contextBlob1 12s ease-in-out infinite reverse',
                }}
              />
            </div>

            {/* Accent glow line top */}
            <div
              className="absolute top-0 left-[8%] right-[8%] h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(${rgb},0.5), ${info.color}, rgba(${rgb},0.5), transparent)`,
                boxShadow: `0 0 16px rgba(${rgb},0.25), 0 0 6px rgba(${rgb},0.15)`,
              }}
            />
            {/* Specular highlight */}
            <div
              className="absolute top-0 left-[4%] right-[4%] h-[1px] opacity-80"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }}
            />

            {/* Kete icon */}
            <div
              className="relative shrink-0"
              style={{
                filter: `drop-shadow(0 0 6px rgba(${rgb},0.35))`,
              }}
            >
              <KeteIcon id={profile.detectedIndustry!} color={info.color} size={22} />
            </div>

            <span style={{ color: 'rgba(26,29,41,0.5)' }}>
              You're exploring
            </span>
            <span
              className="font-semibold tracking-[2px]"
              style={{
                color: info.color,
                textShadow: `0 0 10px rgba(${rgb},0.3)`,
              }}
            >
              {info.name}
            </span>
            <span style={{ color: 'rgba(26,29,41,0.15)' }}>·</span>

            {/* 3D pop-out button — sample pack */}
            <Link
              to={info.samplePath}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-[1px]"
              style={{
                color: '#1A1D29',
                background: '#EEEEF2',
                boxShadow: `
                  3px 3px 8px rgba(166,166,180,0.4),
                  -3px -3px 8px rgba(255,255,255,0.9),
                  inset 0 1px 0 rgba(255,255,255,0.7)
                `,
                border: `1px solid rgba(${rgb},0.1)`,
              }}
            >
              See sample pack
              <ArrowRight size={10} />
            </Link>

            {/* 3D pop-out button — browse */}
            <Link
              to="/kete"
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-[1px]"
              style={{
                color: 'rgba(26,29,41,0.55)',
                background: '#EEEEF2',
                boxShadow: `
                  3px 3px 8px rgba(166,166,180,0.35),
                  -3px -3px 8px rgba(255,255,255,0.85),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
              }}
            >
              Browse all
              <ChevronDown size={10} />
            </Link>

            {/* Dismiss — 3D inset button */}
            <button
              onClick={() => setDismissed(true)}
              className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                color: 'rgba(26,29,41,0.3)',
                background: '#E8E8EC',
                boxShadow: `
                  inset 2px 2px 4px rgba(166,166,180,0.35),
                  inset -2px -2px 4px rgba(255,255,255,0.8)
                `,
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          <style>{`
            @keyframes contextBlob1 {
              0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; }
              50% { transform: translateX(30px) scale(1.15); opacity: 1; }
            }
            @keyframes contextBlob2 {
              0%, 100% { transform: translateX(0) scale(1); opacity: 0.6; }
              50% { transform: translateX(-20px) scale(1.1); opacity: 1; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
