/**
 * BusinessContext — The Iho (core) of the Symbiotic OS.
 * Unified global state: ActiveSector, ProjectMemory, and cross-kete reactivity.
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KETE_CONFIG, type KeteDefinition } from "@/components/kete/KeteConfig";

/* ─── Types ──────────────────────────────────────────── */

export type SectorId = "manaaki" | "waihanga" | "auaha" | "arataki" | "pikau" | "toro";

export interface MemoryEntry {
  id: string;
  kete: SectorId;
  type: "site_log" | "customs_alert" | "booking" | "creative_asset" | "incident" | "general";
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SuggestedAction {
  id: string;
  sourceKete: SectorId;
  targetKete: SectorId;
  actionType: "draft_email" | "social_post" | "delay_notice" | "compliance_check" | "staffing_update";
  title: string;
  description: string;
  triggerMemoryId: string;
  createdAt: string;
}

interface BusinessContextValue {
  activeSector: SectorId;
  activeSectorConfig: KeteDefinition | undefined;
  setActiveSector: (s: SectorId) => void;
  projectMemory: MemoryEntry[];
  addMemory: (entry: Omit<MemoryEntry, "id" | "timestamp">) => void;
  suggestedActions: SuggestedAction[];
  dismissSuggestion: (id: string) => void;
  /** Creative templates contextual to the active sector */
  getContextualTemplates: () => string[];
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusinessContext must be inside BusinessProvider");
  return ctx;
}

/* ─── Cross-kete suggestion rules ────────────────────── */

const SUGGESTION_RULES: Array<{
  sourceType: MemoryEntry["type"];
  sourceKete: SectorId;
  generate: (entry: MemoryEntry) => Omit<SuggestedAction, "id" | "createdAt">;
}> = [
  {
    sourceType: "site_log",
    sourceKete: "waihanga",
    generate: (e) => ({
      sourceKete: "waihanga",
      targetKete: "auaha",
      actionType: "social_post",
      title: "Draft stakeholder update",
      description: `Site log: "${e.summary.slice(0, 80)}…" — draft a progress email or social post for stakeholders.`,
      triggerMemoryId: e.id,
    }),
  },
  {
    sourceType: "customs_alert",
    sourceKete: "pikau",
    generate: (e) => ({
      sourceKete: "pikau",
      targetKete: "auaha",
      actionType: "delay_notice",
      title: "Draft delay notification",
      description: `Customs alert: "${e.summary.slice(0, 80)}…" — draft client apology email and social media update.`,
      triggerMemoryId: e.id,
    }),
  },
  {
    sourceType: "customs_alert",
    sourceKete: "pikau",
    generate: (e) => ({
      sourceKete: "pikau",
      targetKete: "manaaki",
      actionType: "staffing_update",
      title: "Update inventory forecast",
      description: `Customs delay may affect supply — review hospitality stock levels.`,
      triggerMemoryId: e.id,
    }),
  },
  {
    sourceType: "booking",
    sourceKete: "manaaki",
    generate: (e) => ({
      sourceKete: "manaaki",
      targetKete: "auaha",
      actionType: "social_post",
      title: "Generate event promotion",
      description: `New booking: "${e.summary.slice(0, 80)}…" — create social media content to promote.`,
      triggerMemoryId: e.id,
    }),
  },
  {
    sourceType: "incident",
    sourceKete: "waihanga",
    generate: (e) => ({
      sourceKete: "waihanga",
      targetKete: "auaha",
      actionType: "draft_email",
      title: "Draft incident report communication",
      description: `Site incident logged — prepare stakeholder communication and WorkSafe notification draft.`,
      triggerMemoryId: e.id,
    }),
  },
];

/* ─── Contextual creative templates per sector ──────── */

const SECTOR_TEMPLATES: Record<SectorId, string[]> = {
  waihanga: [
    "Weekly Stakeholder Email",
    "Site Progress TikTok",
    "H&S Milestone Post",
    "Construction Timelapse Caption",
    "Resource Consent Update",
  ],
  pikau: [
    "Delivery Update Email",
    "Client Notification SMS",
    "Customs Delay Apology",
    "Shipment Arrival Social Post",
    "Trade Compliance Summary",
  ],
  manaaki: [
    "Seasonal Menu Launch Post",
    "Guest Experience Story",
    "Holiday Hours Announcement",
    "Event Promotion Reel",
    "Staff Spotlight Feature",
  ],
  arataki: [
    "New Arrival Showcase",
    "Test Drive Invitation",
    "Service Reminder Campaign",
    "Finance Special Promotion",
    "Customer Delivery Story",
  ],
  auaha: [
    "Brand Campaign Brief",
    "Social Media Calendar",
    "Blog Post Draft",
    "Video Script",
    "Ad Creative Variants",
  ],
  toro: [
    "Whānau Newsletter",
    "Weekly Meal Plan Post",
    "School Event Reminder",
    "Budget Summary Email",
    "Activity Suggestion",
  ],
};

/* ─── Provider ───────────────────────────────────────── */

export function BusinessProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [activeSector, setActiveSectorRaw] = useState<SectorId>("auaha");
  const [projectMemory, setProjectMemory] = useState<MemoryEntry[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);

  // Auto-detect sector from route
  useEffect(() => {
    const match = KETE_CONFIG.find((k) => location.pathname.startsWith(k.route));
    if (match) setActiveSectorRaw(match.id as SectorId);
  }, [location.pathname]);

  const setActiveSector = useCallback((s: SectorId) => setActiveSectorRaw(s), []);

  const activeSectorConfig = KETE_CONFIG.find((k) => k.id === activeSector);

  // Add memory + auto-generate cross-kete suggestions
  const addMemory = useCallback((entry: Omit<MemoryEntry, "id" | "timestamp">) => {
    const newEntry: MemoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setProjectMemory((prev) => [newEntry, ...prev].slice(0, 50));

    // Fire symbiotic suggestion rules
    const newSuggestions: SuggestedAction[] = [];
    for (const rule of SUGGESTION_RULES) {
      if (rule.sourceType === entry.type && rule.sourceKete === entry.kete) {
        newSuggestions.push({
          ...rule.generate(newEntry),
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (newSuggestions.length > 0) {
      setSuggestedActions((prev) => [...newSuggestions, ...prev].slice(0, 20));

      // Also persist to business_memory for server-side access
      persistMemory(newEntry);
    }
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestedActions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getContextualTemplates = useCallback((): string[] => {
    return SECTOR_TEMPLATES[activeSector] || SECTOR_TEMPLATES.auaha;
  }, [activeSector]);

  return (
    <BusinessContext.Provider
      value={{
        activeSector,
        activeSectorConfig,
        setActiveSector,
        projectMemory,
        addMemory,
        suggestedActions,
        dismissSuggestion,
        getContextualTemplates,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

/* ─── Helpers ────────────────────────────────────────── */

async function persistMemory(entry: MemoryEntry) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("business_memory").insert({
      user_id: user.id,
      category: `${entry.kete}:${entry.type}`,
      content: entry.summary,
      tags: [entry.kete, entry.type],
      metadata: entry.metadata as any,
    });
  } catch { /* non-blocking */ }
}
