'use client';
/**
 * SectionReveal — compatibility shim
 * Existing pages (app/legal/disclaimer/page.tsx) import SectionReveal
 * from '@/components/SectionReveal'.
 * Routes to the canonical FadeUp component (whileInView, prefers-reduced-motion safe).
 */
export { FadeUp as SectionReveal } from '@/components/motion/FadeUp';
