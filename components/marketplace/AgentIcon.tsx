/**
 * Canonical agent avatar icons — LOCKED CANON (2026-06-23).
 *
 * Ported verbatim from Kate's design source
 * (canon-2026-06-23/e26ab468-assembl_Agent_Avatars.dc.html). Each agent's
 * `icon` field in lib/marketplace/agents.ts is one of these keys. Flat-vector,
 * 64×64 viewBox, canary/charcoal/gold/cream palette. Size comes from className.
 */
import type { ReactElement } from 'react';

const INK = '#3A3832';
const CAN = '#FFD42A';
const GOLD = '#C79B1F';
const CREAM = '#FFF7EC';

function paths(name: string, ink: string): ReactElement[] {
  switch (name) {
    case 'brief':
      return [
        <line key={1} x1={8} y1={44} x2={56} y2={44} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />,
        <path key={2} d="M20 44a12 12 0 0 1 24 0" fill={CAN} />,
        <line key={3} x1={32} y1={14} x2={32} y2={22} stroke={GOLD} strokeWidth={3} strokeLinecap="round" />,
        <line key={4} x1={14} y1={28} x2={20} y2={32} stroke={GOLD} strokeWidth={3} strokeLinecap="round" />,
        <line key={5} x1={50} y1={28} x2={44} y2={32} stroke={GOLD} strokeWidth={3} strokeLinecap="round" />,
      ];
    case 'hui':
      return [
        <path key={1} d="M10 38c0-10 9-18 22-18s22 6 22 16c0 6-4 8-4 8s-2-4-7-4c-6 0-7 6-13 6-12 0-20-5-20-14z" fill={ink} />,
        <path key={2} d="M48 24c2-6 7-7 7-7s-1 6 2 9" stroke={CAN} strokeWidth={3} strokeLinecap="round" fill="none" />,
        <circle key={3} cx={20} cy={34} r={2.4} fill={CREAM} />,
      ];
    case 'list':
      return [
        <path key={1} d="M14 24h36l-4 28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill={CAN} />,
        <path key={2} d="M14 24h36" stroke={ink} strokeWidth={3} strokeLinecap="round" />,
        <path key={3} d="M24 24c0-7 3-12 8-12s8 5 8 12" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />,
        <line key={4} x1={26} y1={32} x2={24} y2={50} stroke={ink} strokeWidth={2.4} />,
        <line key={5} x1={38} y1={32} x2={40} y2={50} stroke={ink} strokeWidth={2.4} />,
      ];
    case 'bell':
      return [
        <path key={1} d="M16 44c2-4 4-7 4-15 0-7 5-12 12-12s12 5 12 12c0 8 2 11 4 15z" fill={ink} />,
        <circle key={2} cx={32} cy={50} r={4} fill={CAN} />,
        <line key={3} x1={32} y1={11} x2={32} y2={17} stroke={GOLD} strokeWidth={3} strokeLinecap="round" />,
      ];
    case 'container':
      return [
        <rect key={1} x={10} y={24} width={44} height={24} rx={2} fill={CAN} />,
        <line key={2} x1={18} y1={24} x2={18} y2={48} stroke={ink} strokeWidth={2.4} />,
        <line key={3} x1={26} y1={24} x2={26} y2={48} stroke={ink} strokeWidth={2.4} />,
        <line key={4} x1={38} y1={24} x2={38} y2={48} stroke={ink} strokeWidth={2.4} />,
        <line key={5} x1={46} y1={24} x2={46} y2={48} stroke={ink} strokeWidth={2.4} />,
        <rect key={6} x={10} y={24} width={44} height={24} rx={2} stroke={ink} strokeWidth={3} fill="none" />,
      ];
    case 'temp':
      return [
        <path key={1} d="M28 14a4 4 0 0 1 8 0v22a8 8 0 1 1-8 0z" fill={CREAM} stroke={ink} strokeWidth={3} />,
        <circle key={2} cx={32} cy={44} r={5} fill={CAN} />,
        <line key={3} x1={32} y1={24} x2={32} y2={40} stroke={CAN} strokeWidth={3} strokeLinecap="round" />,
      ];
    case 'anchor':
      return [
        <circle key={1} cx={32} cy={16} r={5} stroke={ink} strokeWidth={3} fill="none" />,
        <line key={2} x1={32} y1={21} x2={32} y2={50} stroke={ink} strokeWidth={3} strokeLinecap="round" />,
        <line key={3} x1={22} y1={30} x2={42} y2={30} stroke={ink} strokeWidth={3} strokeLinecap="round" />,
        <path key={4} d="M16 38c0 9 7 14 16 14s16-5 16-14" stroke={CAN} strokeWidth={3.4} fill="none" strokeLinecap="round" />,
      ];
    case 'scribe':
      return [
        <path key={1} d="M10 34h10l4-10 7 20 5-12 4 6h14" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
        <path key={2} d="M46 14h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill={CAN} />,
      ];
    case 'voice':
      return [
        <path key={1} d="M12 22h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H26l-10 8v-8h-4a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z" fill={ink} />,
        <line key={2} x1={20} y1={33} x2={20} y2={33} stroke={CAN} strokeWidth={4} strokeLinecap="round" />,
        <line key={3} x1={28} y1={29} x2={28} y2={37} stroke={CAN} strokeWidth={4} strokeLinecap="round" />,
        <line key={4} x1={36} y1={26} x2={36} y2={40} stroke={CAN} strokeWidth={4} strokeLinecap="round" />,
      ];
    case 'whanau':
      return [
        <path key={1} d="M32 14 52 30v22a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V30z" fill={CREAM} stroke={ink} strokeWidth={3} strokeLinejoin="round" />,
        <path key={2} d="M32 48c-6-4-9-7-9-11a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 4-3 7-9 11z" fill={CAN} />,
      ];
    case 'mic':
      return [
        <rect key={1} x={25} y={12} width={14} height={26} rx={7} fill={CAN} />,
        <path key={2} d="M18 32a14 14 0 0 0 28 0" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />,
        <line key={3} x1={32} y1={46} x2={32} y2={52} stroke={ink} strokeWidth={3} strokeLinecap="round" />,
      ];
    case 'invoice':
      return [
        <path key={1} d="M18 12h28v40l-5-3-5 3-5-3-5 3-5-3-3 3z" fill={CREAM} stroke={ink} strokeWidth={3} strokeLinejoin="round" />,
        <line key={2} x1={25} y1={24} x2={39} y2={24} stroke={ink} strokeWidth={2.6} strokeLinecap="round" />,
        <path key={3} d="M25 34l4 4 8-9" stroke={GOLD} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      ];
    case 'roster':
      return [
        <rect key={1} x={10} y={16} width={44} height={38} rx={5} fill={CREAM} stroke={ink} strokeWidth={3} />,
        <line key={2} x1={10} y1={26} x2={54} y2={26} stroke={ink} strokeWidth={3} />,
        <rect key={3} x={16} y={32} width={9} height={7} rx={2} fill={CAN} />,
        <rect key={4} x={29} y={32} width={9} height={7} rx={2} fill={GOLD} />,
        <rect key={5} x={42} y={32} width={6} height={7} rx={2} fill={CAN} />,
        <rect key={6} x={16} y={43} width={9} height={6} rx={2} fill={GOLD} />,
      ];
    case 'panui':
      return [
        <rect key={1} x={10} y={18} width={44} height={30} rx={4} fill={CAN} />,
        <path key={2} d="M10 21 32 37 54 21" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      ];
    case 'tide':
      return [
        <circle key={1} cx={44} cy={22} r={8} fill={CAN} />,
        <path key={2} d="M8 40c5 0 5-4 10-4s5 4 10 4 5-4 10-4 5 4 10 4" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />,
        <path key={3} d="M8 50c5 0 5-4 10-4s5 4 10 4 5-4 10-4 5 4 10 4" stroke={GOLD} strokeWidth={3} fill="none" strokeLinecap="round" />,
      ];
    case 'stock':
      return [
        <rect key={1} x={12} y={30} width={18} height={18} rx={2} fill={CAN} />,
        <rect key={2} x={34} y={30} width={18} height={18} rx={2} fill={CREAM} stroke={ink} strokeWidth={3} />,
        <rect key={3} x={23} y={12} width={18} height={18} rx={2} fill={CREAM} stroke={ink} strokeWidth={3} />,
        <rect key={4} x={12} y={30} width={18} height={18} rx={2} stroke={ink} strokeWidth={3} fill="none" />,
      ];
    case 'shield':
      return [
        <path key={1} d="M32 10 50 16v14c0 13-9 20-18 24-9-4-18-11-18-24V16z" fill={ink} />,
        <path key={2} d="M24 32l6 6 11-13" stroke={CAN} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      ];
    case 'inbox':
      return [
        <path key={1} d="M14 16h36v32H14z" fill={CREAM} stroke={ink} strokeWidth={3} />,
        <rect key={3} x={14} y={36} width={36} height={12} fill={CAN} opacity={0.9} />,
        <path key={4} d="M14 36h12a6 6 0 0 0 12 0h12" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      ];
    case 'power':
      return [
        <path key={1} d="M34 10 18 36h12l-4 18 20-28H34z" fill={CAN} stroke={ink} strokeWidth={2.6} strokeLinejoin="round" />,
      ];
    case 'koru':
      return [
        <path key={1} d="M16 50c-4-16 6-34 26-34 0 0-14 2-14 16 0 8 7 9 11 5 4-5-2-11-6-7" stroke={ink} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
        <circle key={2} cx={31} cy={34} r={3} fill={CAN} />,
      ];
    case 'tax':
      return [
        <rect key={1} x={16} y={12} width={32} height={40} rx={4} fill={CREAM} stroke={ink} strokeWidth={3} />,
        <rect key={2} x={22} y={18} width={20} height={8} rx={2} fill={CAN} />,
        <circle key={3} cx={25} cy={34} r={2.3} fill={ink} />,
        <circle key={4} cx={32} cy={34} r={2.3} fill={ink} />,
        <circle key={5} cx={39} cy={34} r={2.3} fill={ink} />,
        <circle key={6} cx={25} cy={43} r={2.3} fill={ink} />,
        <circle key={7} cx={32} cy={43} r={2.3} fill={ink} />,
        <circle key={8} cx={39} cy={43} r={2.3} fill={GOLD} />,
      ];
    case 'fish':
      return [
        <path key={1} d="M12 32c8-12 24-12 32 0-8 12-24 12-32 0z" fill={CAN} stroke={ink} strokeWidth={3} strokeLinejoin="round" />,
        <path key={2} d="M44 32l10-7v14z" fill={ink} />,
        <circle key={3} cx={22} cy={30} r={2.4} fill={ink} />,
      ];
    case 'careCaptain':
      // "circle within circle" — daily check-in, care held within care.
      return [
        <circle key={1} cx={32} cy={32} r={18} stroke={ink} strokeWidth={3.5} fill="none" />,
        <circle key={2} cx={32} cy={32} r={8} fill={CAN} />,
      ];
    case 'spark':
      // Auaha — asymmetric starburst (a big canary spark + a small gold one).
      return [
        <path key={1} d="M30 8 L35 25 L52 30 L35 35 L30 54 L25 35 L8 30 L25 25 Z" fill={CAN} stroke={ink} strokeWidth={2.6} strokeLinejoin="round" />,
        <path key={2} d="M48 36 L50.5 43 L58 45 L50.5 47 L48 54 L45.5 47 L38 45 L45.5 43 Z" fill={GOLD} />,
      ];
    case 'chief':
      // Chief (EA) — briefcase.
      return [
        <path key={1} d="M24 24v-4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />,
        <rect key={2} x={12} y={24} width={40} height={26} rx={3} fill={CREAM} stroke={ink} strokeWidth={3} />,
        <line key={3} x1={12} y1={35} x2={52} y2={35} stroke={ink} strokeWidth={2.4} />,
        <rect key={4} x={28} y={32} width={8} height={6} rx={1.5} fill={CAN} />,
      ];
    case 'people':
      // Roster (CRM) — contacts.
      return [
        <circle key={1} cx={32} cy={24} r={9} fill={ink} />,
        <path key={2} d="M14 52c0-11 8-16 18-16s18 5 18 16z" fill={CAN} />,
        <path key={3} d="M14 52c0-11 8-16 18-16s18 5 18 16" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />,
      ];
    case 'store':
      // Counter (retail) — storefront.
      return [
        <path key={1} d="M12 22h40v8H12z" fill={CAN} />,
        <line key={2} x1={12} y1={22} x2={52} y2={22} stroke={ink} strokeWidth={3} strokeLinecap="round" />,
        <path key={3} d="M14 30h36v22H14z" fill={CREAM} stroke={ink} strokeWidth={3} strokeLinejoin="round" />,
        <rect key={4} x={28} y={38} width={10} height={14} fill={CAN} />,
      ];
    case 'social':
      // Social Manager — two speech bubbles.
      return [
        <path key={1} d="M10 18h28a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H22l-8 6v-6h-4a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4z" fill={CAN} stroke={ink} strokeWidth={2.6} strokeLinejoin="round" />,
        <path key={2} d="M32 34h18a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-2v5l-6-5h-10a4 4 0 0 1-4-4" fill={CREAM} stroke={ink} strokeWidth={2.6} strokeLinejoin="round" />,
      ];
    case 'atlas':
      // Atlas · Mahere — a folded map with a canary route and a gold marker.
      return [
        <path key={1} d="M12 18l13-4 14 4 13-4v32l-13 4-14-4-13 4z" fill={CREAM} stroke={ink} strokeWidth={3} strokeLinejoin="round" />,
        <line key={2} x1={25} y1={14} x2={25} y2={46} stroke={ink} strokeWidth={2.2} />,
        <line key={3} x1={39} y1={18} x2={39} y2={50} stroke={ink} strokeWidth={2.2} />,
        <path key={4} d="M18 40c6 0 6-12 14-12s8 8 14 6" stroke={CAN} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 5" />,
        <path key={5} d="M44 16c3.3 0 6 2.7 6 6 0 4-6 9-6 9s-6-5-6-9c0-3.3 2.7-6 6-6z" fill={GOLD} />,
        <circle key={6} cx={44} cy={22} r={2.2} fill={CREAM} />,
      ];
    case 'pilot':
      // Pilot · Kaiurungi — a compass: charcoal ring, cream face, a canary
      // needle pointing the way and a gold pivot.
      return [
        <circle key={1} cx={32} cy={32} r={20} fill={CREAM} stroke={ink} strokeWidth={3} />,
        <path key={2} d="M32 16l5 16-5 16-5-16z" fill={CAN} stroke={ink} strokeWidth={2} strokeLinejoin="round" />,
        <circle key={3} cx={32} cy={32} r={3} fill={GOLD} />,
        <line key={4} x1={32} y1={10} x2={32} y2={14} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />,
        <line key={5} x1={32} y1={50} x2={32} y2={54} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />,
        <line key={6} x1={10} y1={32} x2={14} y2={32} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />,
        <line key={7} x1={50} y1={32} x2={54} y2={32} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />,
      ];
    default:
      return [<circle key={1} cx={32} cy={32} r={14} fill={CAN} />];
  }
}

export function AgentIcon({
  name,
  className,
  tone,
}: {
  name: string;
  className?: string;
  /** avatar tile tone — on 'ink' the charcoal line-art is drawn in cream so it stays legible */
  tone?: 'cream' | 'canary' | 'ink';
}) {
  const ink = tone === 'ink' ? CREAM : INK;
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      {paths(name, ink)}
    </svg>
  );
}
