import { useState, useCallback } from "react";
import { Zap, Database, Layout, Globe, Code, Loader2, Rocket, Table2, Layers, ArrowRight, RefreshCw, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { useBrandDna } from "@/contexts/BrandDnaContext";
import { motion, AnimatePresence } from "framer-motion";

const OBSIDIAN = "#0A0A0A";
const POUNAMU = "#00A86B";
const TEAL = "#00CED1";

interface AppSchema {
  name: string;
  description: string;
  tables: { name: string; columns: { name: string; type: string; nullable: boolean }[] }[];
  pages: { name: string; route: string; description: string }[];
  apiRoutes: { method: string; path: string; description: string }[];
}

export default function AppSparkForge() {
  const { brand } = useBrandDna();
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState<AppSchema | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [activeTab, setActiveTab] = useState<"schema" | "code" | "preview">("schema");
  const [isCreatingTable, setIsCreatingTable] = useState<string | null>(null);

  const generateApp = useCallback(async () => {
    if (!prompt.trim()) return toast.error("Describe your app idea");
    setIsGenerating(true);
    setSchema(null);
    setGeneratedCode("");
    setDeployed(false);

    try {
      let enhancedPrompt = prompt;
      if (brand) {
        enhancedPrompt += `\n\nBrand: ${brand.businessName} (${brand.industry}). Colours: ${JSON.stringify(brand.colors)}. Tone: ${brand.voiceTone}.`;
      }

      const result = await agentChat({
        agentId: "spark",
        packId: "auaha",
        message: `Design a full-stack app for: ${enhancedPrompt}

Return ONLY valid JSON with this structure:
{
  "name": "App Name",
  "description": "One-line description",
  "tables": [
    {
      "name": "table_name",
      "columns": [
        { "name": "id", "type": "UUID PRIMARY KEY DEFAULT gen_random_uuid()", "nullable": false },
        { "name": "user_id", "type": "UUID NOT NULL", "nullable": false },
        { "name": "created_at", "type": "TIMESTAMPTZ DEFAULT now()", "nullable": false }
      ]
    }
  ],
  "pages": [
    { "name": "Dashboard", "route": "/dashboard", "description": "Main overview" }
  ],
  "apiRoutes": [
    { "method": "GET", "path": "/api/items", "description": "List all items" }
  ]
}

NZ context. Include RLS policies. Be specific and practical.`,
        systemPrompt: "You are SPARK, Assembl's no-code app architect. Design pragmatic, NZ-centric applications. Return ONLY valid JSON.",
      });

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse schema");
      const parsed: AppSchema = JSON.parse(jsonMatch[0]);
      setSchema(parsed);

      // Generate React code preview
      const codeResult = await agentChat({
        agentId: "spark",
        packId: "auaha",
        message: `Generate a React TypeScript component for the "${parsed.name}" app with these pages: ${parsed.pages.map(p => p.name).join(", ")}.

Use: Tailwind CSS, Shadcn/UI components, Lucide icons. Dark theme with Pounamu (#00A86B) accent. Include proper TypeScript types. Make it production-ready.

Tables: ${parsed.tables.map(t => t.name).join(", ")}

Return ONLY the code, no markdown fences.`,
        systemPrompt: "You are SPARK. Generate clean, production-ready React/TypeScript code. NZ English in comments.",
      });

      setGeneratedCode(codeResult);
      setActiveTab("schema");
      toast.success(`App schema designed: ${parsed.name}`);
    } catch (e: any) {
      toast.error(e.message || "App generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, brand]);

  const createTable = useCallback(async (table: AppSchema["tables"][0]) => {
    setIsCreatingTable(table.name);
    try {
      const columns = table.columns.map(c => `${c.name} ${c.type}`).join(",\n  ");
      const sql = `CREATE TABLE IF NOT EXISTS public.${table.name} (\n  ${columns}\n);\nALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;`;

      // We can't run raw SQL from client — inform user
      toast.info(`Table "${table.name}" schema copied. Use the migration tool to create it.`);
      navigator.clipboard.writeText(sql);
    } catch (e: any) {
      toast.error(e.message || "Failed to create table");
    } finally {
      setIsCreatingTable(null);
    }
  }, []);

  const mockDeploy = useCallback(async () => {
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsDeploying(false);
    setDeployed(true);
    toast.success("App deployed to production (simulated)");
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${POUNAMU}25, ${TEAL}10)`,
              border: `1px solid ${POUNAMU}30`,
            }}>
              <Zap className="w-5 h-5" style={{ color: POUNAMU }} />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-wide text-[#1A1D29]" style={{ fontFamily: "Inter, sans-serif" }}>
                App SPARK
              </h1>
              <p className="text-[#6B7280] text-xs">No-Code App Forge — Describe, Design, Deploy</p>
            </div>
          </div>
        </div>
        {brand && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]" style={{
            background: "rgba(0,168,107,0.08)",
            border: `1px solid ${POUNAMU}20`,
            color: POUNAMU,
          }}>
            <Sparkles className="w-3 h-3" />
            {brand.businessName} context active
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="rounded-2xl border p-6" style={{
        background: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(0,168,107,0.03))",
        borderColor: "rgba(255,255,255,0.08)",
      }}>
        <label className="text-[#6B7280] text-xs uppercase tracking-wider mb-3 block" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          Describe your app
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A booking app for a Queenstown ski rental with equipment inventory, customer management, and seasonal pricing..."
          className="w-full bg-transparent text-[#1A1D29] text-sm resize-none outline-none min-h-[100px] placeholder:text-[#8B92A0]"
          style={{ fontFamily: "Inter, sans-serif" }}
        />

        {/* Brand suggestions */}
        {brand && brand.suggestions.appIdeas.length > 0 && !prompt && (
          <div className="mt-4 flex flex-wrap gap-2">
            {brand.suggestions.appIdeas.map((idea, i) => (
              <button
                key={i}
                onClick={() => setPrompt(idea)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
                style={{
                  background: "rgba(0,168,107,0.08)",
                  border: `1px solid ${POUNAMU}20`,
                  color: `${POUNAMU}cc`,
                }}
              >
                {idea}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={generateApp}
            disabled={!prompt.trim() || isGenerating}
            className="px-6 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${TEAL})`, color: OBSIDIAN }}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Architecting...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Generate App</>
            )}
          </Button>
        </div>
      </div>

      {/* Schema/Code/Preview */}
      <AnimatePresence>
        {schema && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.03)" }}>
              {(["schema", "code", "preview"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeTab === tab ? `${POUNAMU}20` : "transparent",
                    color: activeTab === tab ? POUNAMU : "rgba(255,255,255,0.4)",
                    border: activeTab === tab ? `1px solid ${POUNAMU}30` : "1px solid transparent",
                  }}
                >
                  {tab === "schema" && <Database className="w-3 h-3 inline mr-1.5" />}
                  {tab === "code" && <Code className="w-3 h-3 inline mr-1.5" />}
                  {tab === "preview" && <Layout className="w-3 h-3 inline mr-1.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Schema View */}
            {activeTab === "schema" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tables */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-[#6B7280] text-xs uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                    <Table2 className="w-3.5 h-3.5" /> Database Tables
                  </h3>
                  {schema.tables.map((table, i) => (
                    <div key={i} className="rounded-xl border p-4" style={{
                      background: "rgba(255,255,255,0.02)",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-mono text-[#1A1D29]">{table.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => createTable(table)}
                          disabled={isCreatingTable === table.name}
                          className="text-xs"
                          style={{ color: POUNAMU }}
                        >
                          {isCreatingTable === table.name ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>Copy SQL</>
                          )}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {table.columns.map((col, j) => (
                          <div key={j} className="flex items-center gap-3 text-xs">
                            <span className="text-[#4A5160] font-mono w-32 truncate">{col.name}</span>
                            <span className="text-[#6B7280] font-mono text-[10px] flex-1 truncate">{col.type}</span>
                            {!col.nullable && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>required</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pages & API */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#6B7280] text-xs uppercase tracking-wider flex items-center gap-2 mb-3" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                      <Layout className="w-3.5 h-3.5" /> UI Pages
                    </h3>
                    {schema.pages.map((page, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04]">
                        <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
                        <div>
                          <p className="text-[#2A2F3D] text-sm">{page.name}</p>
                          <p className="text-[#6B7280] text-[10px] font-mono">{page.route}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-[#6B7280] text-xs uppercase tracking-wider flex items-center gap-2 mb-3" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                      <Globe className="w-3.5 h-3.5" /> API Routes
                    </h3>
                    {schema.apiRoutes.map((route, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04]">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{
                          background: route.method === "GET" ? `${POUNAMU}15` : route.method === "POST" ? `${TEAL}15` : "rgba(255,255,255,0.05)",
                          color: route.method === "GET" ? POUNAMU : TEAL,
                        }}>
                          {route.method}
                        </span>
                        <span className="text-[#6B7280] text-xs font-mono truncate">{route.path}</span>
                      </div>
                    ))}
                  </div>

                  {/* Deploy */}
                  <Button
                    onClick={mockDeploy}
                    disabled={isDeploying || deployed}
                    className="w-full mt-4 rounded-xl py-3"
                    style={{
                      background: deployed ? `${POUNAMU}30` : `linear-gradient(135deg, ${POUNAMU}, ${TEAL})`,
                      color: deployed ? POUNAMU : OBSIDIAN,
                    }}
                  >
                    {isDeploying ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Deploying...</>
                    ) : deployed ? (
                      <><Check className="w-4 h-4 mr-2" /> Deployed</>
                    ) : (
                      <><Rocket className="w-4 h-4 mr-2" /> Deploy to Production</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Code View */}
            {activeTab === "code" && (
              <div className="rounded-xl border overflow-hidden" style={{
                background: "rgba(10,10,10,0.9)",
                borderColor: "rgba(255,255,255,0.06)",
              }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono text-[#6B7280]">
                    {schema.name.replace(/\s+/g, "")}.tsx
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success("Code copied"); }}
                    className="text-[10px] text-[#6B7280] hover:text-[#4A5160] transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-auto max-h-[500px] text-xs text-[#4A5160] font-mono leading-relaxed">
                  {generatedCode || "Generating code..."}
                </pre>
              </div>
            )}

            {/* Preview */}
            {activeTab === "preview" && generatedCode && (
              <div className="rounded-xl border overflow-hidden" style={{
                background: "rgba(10,10,10,0.9)",
                borderColor: "rgba(255,255,255,0.06)",
              }}>
                <div className="p-4 text-center text-[#6B7280] text-sm">
                  <Layout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Live preview renders the generated component</p>
                  <p className="text-xs text-[#8B92A0] mt-1">Download the code to preview locally</p>
                  <Button
                    variant="ghost"
                    className="mt-3 text-xs"
                    style={{ color: POUNAMU }}
                    onClick={() => {
                      const blob = new Blob([generatedCode], { type: "text/typescript" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${schema.name.replace(/\s+/g, "")}.tsx`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download .tsx
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
