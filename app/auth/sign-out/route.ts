import { privateAuthRedirect } from '@/lib/auth/response';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return privateAuthRedirect(new URL('/login', request.url), 303);
}
