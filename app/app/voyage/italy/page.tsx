import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VoyageItalyTool } from './VoyageItalyTool';

export const metadata: Metadata = {
  title: 'voyage italy · assembl',
  description: 'Private Italy travel desk for the signed-in traveller.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function VoyageItalyPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/voyage/italy');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login?redirect=/app/voyage/italy');
  }

  return <VoyageItalyTool />;
}
