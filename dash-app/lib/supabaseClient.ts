// Browser Supabase client. Safe to use the ANON key here (public).
// Returns null in DEMO MODE (no env vars set) so the app runs with no backend.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isDemoMode = !url || !anon;

export const supabase: SupabaseClient | null = isDemoMode
  ? null
  : createClient(url!, anon!);
