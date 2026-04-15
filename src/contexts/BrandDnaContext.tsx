/**
 * Symbiotic Brain — Global Brand DNA Context
 * Shares brand identity across all AUAHA NZ modules so that
 * Video, Copy, Podcast, and App Forge auto-adapt to the scanned brand.
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { toast } from "sonner";

export interface BrandDna {
  businessName: string;
  industry: string;
  tagline: string;
  voiceTone: string;
  colors: { primary: string; secondary: string; accent: string };
  keywords: string[];
  targetAudience: string;
  logoUrl?: string;
  scanUrl?: string;
  suggestions: {
    videoIdeas: string[];
    podcastTopics: string[];
    copyAngles: string[];
    appIdeas: string[];
  };
}

interface BrandDnaContextValue {
  brand: BrandDna | null;
  isScanning: boolean;
  scanUrl: (url: string) => Promise<void>;
  setBrand: (brand: BrandDna | null) => void;
  getSuggestion: (module: "video" | "podcast" | "copy" | "app") => string[];
  /** Returns a system prompt snippet injecting brand voice for any kete */
  getBrandPromptInjection: () => string;
}

const BrandDnaContext = createContext<BrandDnaContextValue | null>(null);

export function useBrandDna() {
  const ctx = useContext(BrandDnaContext);
  if (!ctx) throw new Error("useBrandDna must be used within BrandDnaProvider");
  return ctx;
}

export function BrandDnaProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandDna | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scanUrl = useCallback(async (url: string) => {
    setIsScanning(true);
    try {
      const result = await agentChat({
        agentId: "prism",
        packId: "auaha",
        message: `Scan this website and extract brand DNA: ${url}

Return a JSON object with these exact fields:
{
  "businessName": "...",
  "industry": "...",
  "tagline": "...",
  "voiceTone": "professional/casual/bold/playful",
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "keywords": ["keyword1", "keyword2", ...],
  "targetAudience": "...",
  "suggestions": {
    "videoIdeas": ["idea1", "idea2", "idea3"],
    "podcastTopics": ["topic1", "topic2", "topic3"],
    "copyAngles": ["angle1", "angle2", "angle3"],
    "appIdeas": ["app1", "app2"]
  }
}

Be specific to the brand. NZ context. No generic ideas.`,
        systemPrompt: "You are PRISM, Assembl's brand intelligence agent. Extract brand DNA with surgical precision. Return ONLY valid JSON, no markdown fences.",
      });

      // Parse JSON from response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse brand data");
      
      const parsed = JSON.parse(jsonMatch[0]);
      const brandData: BrandDna = {
        businessName: parsed.businessName || "Unknown",
        industry: parsed.industry || "General",
        tagline: parsed.tagline || "",
        voiceTone: parsed.voiceTone || "professional",
        colors: parsed.colors || { primary: "#00A86B", secondary: "#0A0A0A", accent: "#00CED1" },
        keywords: parsed.keywords || [],
        targetAudience: parsed.targetAudience || "",
        scanUrl: url,
        suggestions: parsed.suggestions || { videoIdeas: [], podcastTopics: [], copyAngles: [], appIdeas: [] },
      };

      setBrand(brandData);

      // Persist to brand_identities table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("brand_identities").upsert({
          user_id: user.id,
          brand_name: brandData.businessName,
          voice_tone: brandData.voiceTone,
          keywords: brandData.keywords,
          target_audience: brandData.targetAudience,
          mission: brandData.tagline,
          scanned_url: url,
          colors: brandData.colors as any,
          scan_data: brandData as any,
        }, { onConflict: "user_id" });
      }

      toast.success(`Brand DNA extracted for ${brandData.businessName}`);
    } catch (e: any) {
      toast.error(e.message || "Brand scan failed");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const getSuggestion = useCallback((module: "video" | "podcast" | "copy" | "app"): string[] => {
    if (!brand) return [];
    const map = {
      video: brand.suggestions.videoIdeas,
      podcast: brand.suggestions.podcastTopics,
      copy: brand.suggestions.copyAngles,
      app: brand.suggestions.appIdeas,
    };
    return map[module] || [];
  }, [brand]);

  /** Injects brand voice context into any agent's system prompt */
  const getBrandPromptInjection = useCallback((): string => {
    if (!brand) return "";
    return `\n\n[BRAND DNA CONTEXT]\nBusiness: ${brand.businessName}\nIndustry: ${brand.industry}\nVoice/Tone: ${brand.voiceTone}\nTagline: "${brand.tagline}"\nTarget audience: ${brand.targetAudience}\nKeywords: ${brand.keywords.join(", ")}\nBrand colours: primary ${brand.colors.primary}, secondary ${brand.colors.secondary}, accent ${brand.colors.accent}\n\nAdapt your language, tone, and recommendations to match this brand identity. Use NZ English throughout.\n[/BRAND DNA CONTEXT]`;
  }, [brand]);

  return (
    <BrandDnaContext.Provider value={{ brand, isScanning, scanUrl, setBrand, getSuggestion, getBrandPromptInjection }}>
      {children}
    </BrandDnaContext.Provider>
  );
}
