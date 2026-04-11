import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Fetch pipeline counts grouped by stage */
export function useAuahaPipelineCounts() {
  return useQuery({
    queryKey: ["auaha-pipeline-counts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("pipeline_stage")
        .eq("user_id", user.id);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((r) => {
        counts[r.pipeline_stage] = (counts[r.pipeline_stage] || 0) + 1;
      });
      return counts;
    },
    refetchInterval: 15000,
  });
}

/** Fetch recent content items */
export function useRecentContentItems(limit = 5) {
  return useQuery({
    queryKey: ["auaha-recent-content", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });
}

/** Fetch campaigns */
export function useAuahaCampaigns() {
  return useQuery({
    queryKey: ["auaha-campaigns"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });
}

/** Fetch brand identity */
export function useAuahaBrand() {
  return useQuery({
    queryKey: ["auaha-brand"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("brand_identities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Fetch creative assets */
export function useCreativeAssets(limit = 20) {
  return useQuery({
    queryKey: ["auaha-assets", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("creative_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });
}

/** Dashboard aggregate metrics */
export function useAuahaDashboardMetrics() {
  return useQuery({
    queryKey: ["auaha-dashboard-metrics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { contentCount: 0, campaignCount: 0, assetCount: 0, pipelineCounts: {} as Record<string, number> };

      const [contentRes, campaignRes, assetRes, pipelineRes] = await Promise.all([
        supabase.from("content_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("creative_assets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("content_items").select("pipeline_stage").eq("user_id", user.id),
      ]);

      const pipelineCounts: Record<string, number> = {};
      (pipelineRes.data || []).forEach((r) => {
        pipelineCounts[r.pipeline_stage] = (pipelineCounts[r.pipeline_stage] || 0) + 1;
      });

      return {
        contentCount: contentRes.count || 0,
        campaignCount: campaignRes.count || 0,
        assetCount: assetRes.count || 0,
        pipelineCounts,
      };
    },
    refetchInterval: 10000,
  });
}
