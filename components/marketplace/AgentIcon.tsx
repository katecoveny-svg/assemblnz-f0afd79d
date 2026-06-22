import {
  Calculator,
  Container,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  LayoutTemplate,
  MessageSquare,
  Mic,
  PiggyBank,
  Plane,
  Refrigerator,
  School,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sunrise,
  Thermometer,
  Type,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Placeholder avatar icons for marketplace agents. */
const ICONS: Record<string, LucideIcon> = {
  Calculator,
  Container,
  FileText,
  GraduationCap,
  Image: ImageIcon,
  LayoutTemplate,
  MessageSquare,
  Mic,
  PiggyBank,
  Plane,
  Refrigerator,
  School,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sunrise,
  Thermometer,
  Type,
  Wallet,
  Zap,
};

export function AgentIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
