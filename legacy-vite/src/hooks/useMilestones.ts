import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MILESTONES } from "@/engine/personality";
import { toast } from "sonner";

/**
 * Hook that checks milestone counters and shows celebration toasts.
 * Call once in DashboardPage to trigger checks on load.
 */
export function useMilestones(counters: { documents: number; workflows: number; apps: number; streak: number }) {
  const { user } = useAuth();
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Load already-achieved milestones from localStorage
    const storageKey = `assembl_milestones_${user.id}`;
    const achieved = JSON.parse(localStorage.getItem(storageKey) || "[]") as string[];
    shownRef.current = new Set(achieved);

    // Check each milestone
    const newlyAchieved: string[] = [];

    for (const ms of MILESTONES) {
      if (shownRef.current.has(ms.id)) continue;

      const value = counters[ms.metric as keyof typeof counters] || 0;
      if (value >= ms.threshold) {
        newlyAchieved.push(ms.id);
        shownRef.current.add(ms.id);

        // Show celebration toast with a short delay per milestone
        setTimeout(() => {
          toast.success(ms.label, {
            description: ms.message,
            duration: 6000,
            icon: "",
          });
        }, newlyAchieved.indexOf(ms.id) * 2500);
      }
    }

    if (newlyAchieved.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify([...achieved, ...newlyAchieved]));
    }
  }, [user, counters.documents, counters.workflows, counters.apps, counters.streak]);
}
