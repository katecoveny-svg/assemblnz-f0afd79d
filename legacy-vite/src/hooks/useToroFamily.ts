import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ToroFamily {
  id: string;
  family_name: string | null;
  name: string | null;
  primary_phone: string | null;
}

/**
 * Resolves the current user's Tōro family. The Tōro stack is SMS-first and
 * mostly single-family per tenant, so we pick the first active family
 * available. If no family exists yet, returns null and isReady=true so the
 * UI can show an empty state.
 */
export function useToroFamily() {
  const [family, setFamily] = useState<ToroFamily | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, error: dbError } = await supabase
          .from("toroa_families")
          .select("id, family_name, name, primary_phone")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (dbError) {
          setError(dbError.message);
        } else if (data) {
          setFamily(data as ToroFamily);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { family, isReady, error };
}
