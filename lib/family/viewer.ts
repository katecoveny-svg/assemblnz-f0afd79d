import 'server-only';
import { getInviteContext } from '@/lib/demo-invites/server';

/**
 * Who's looking at Family OS. The plan is the whole whānau's — a shared source
 * of truth — but each family member gets their own magic link
 * (demo.assembl.co.nz/for/family-{kate|jack|mila|dad}-{hex}), so we can greet
 * them by name and (next) strip a child's view down to their own events, chores
 * and savings. Parents see everything.
 *
 * Falls back to null when no per-member invite is bound to this browser (e.g.
 * the shared basic-auth demo) — then the page renders unpersonalised, everyone.
 */

const KIDS = new Set(['jack', 'mila']);

export type FamilyViewer = {
  name: string;
  role: 'parent' | 'child';
  isKid: boolean;
  greeting: string;
};

export async function getFamilyViewer(): Promise<FamilyViewer | null> {
  const ctx = await getInviteContext();
  if (!ctx || ctx.demo !== 'family') return null;
  const name = (ctx.recipientName || '').trim();
  if (!name) return null;
  const isKid = KIDS.has(name.toLowerCase());
  // English-led with a warm te reo greeting for whānau context.
  return {
    name,
    role: isKid ? 'child' : 'parent',
    isKid,
    greeting: `Morena, ${name.split(' ')[0]}`,
  };
}
