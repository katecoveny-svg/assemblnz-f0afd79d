/**
 * useViewerScope — bridges the auth layer to the widget registry's
 * scope model (`WidgetRole` + enabled MCP toolsets).
 *
 * The auth hook publishes its own `AppRole`
 * ("free" | "essentials" | "business" | "enterprise" | "admin"). The
 * widget registry uses a finer-grained ladder
 * ("public" | "free" | "starter" | "pro" | "business" | "admin"). This
 * hook does the mapping plus pulls the org's enabled toolsets so
 * `LiveWidgetSection` and `useWidgetData` can enforce scope uniformly.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WidgetRole } from "@/config/widget-types";

const APP_ROLE_TO_WIDGET_ROLE: Record<string, WidgetRole> = {
  free: "free",
  essentials: "starter",
  business: "business",
  enterprise: "business",
  admin: "admin",
};

export interface ViewerScope {
  viewerRole: WidgetRole;
  enabledToolsets: string[];
  loading: boolean;
}

export function useViewerScope(): ViewerScope {
  const { user, role } = useAuth();
  const [enabledToolsets, setEnabledToolsets] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setEnabledToolsets([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from("mcp_org_toolsets")
          .select("toolset_code")
          .eq("user_id", user.id);
        if (cancelled) return;
        const codes = (data ?? [])
          .map((r: { toolset_code: string }) => r.toolset_code)
          .filter(Boolean);
        setEnabledToolsets(codes);
      } catch {
        // Table may not exist yet for some orgs — fall back to no toolsets.
        if (!cancelled) setEnabledToolsets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const viewerRole: WidgetRole = !user
    ? "public"
    : role
      ? (APP_ROLE_TO_WIDGET_ROLE[role] ?? "free")
      : "free";

  // Admins implicitly have every toolset.
  const effectiveToolsets =
    viewerRole === "admin" && enabledToolsets.length === 0
      ? [
          "manaaki_core",
          "waihanga_core",
          "auaha_core",
          "arataki_core",
          "pikau_core",
        ]
      : enabledToolsets;

  return { viewerRole, enabledToolsets: effectiveToolsets, loading };
}
