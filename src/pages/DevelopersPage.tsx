import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Copy, Check, Terminal, Zap, Calculator, Thermometer, DollarSign, Users } from "lucide-react";
import { useState } from "react";

const MCP_URL = `https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/assembl-mcp`;

const TOOLS = [
  { name: "nz_employment_cost", icon: Users, description: "Calculate true annual cost of a NZ employee including KiwiSaver, ACC, leave, holidays" },
  { name: "nz_gst_calculator", icon: DollarSign, description: "Convert between GST-inclusive and GST-exclusive amounts (15%)" },
  { name: "nz_minimum_wage_check", icon: Calculator, description: "Check compliance with NZ minimum wage ($23.95/hr adult, April 2026)" },
  { name: "nz_paye_calculator", icon: DollarSign, description: "Calculate PAYE tax using 2026 NZ tax brackets" },
  { name: "nz_food_safety_temp_check", icon: Thermometer, description: "Validate food temperatures against NZ Food Act 2014" },
];

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "assembl-nz": {
      "url": "${MCP_URL}"
    }
  }
}`;

export default function DevelopersPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-display font-bold">Developers</h1>
        </div>
        <p className="text-muted-foreground mb-10">Connect Assembl's NZ business intelligence tools to Claude Desktop, Cursor, or any MCP-compatible client.</p>

        {/* MCP Endpoint */}
        <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">MCP Server Endpoint</h2>
          </div>
          <div className="flex items-center gap-2 bg-background/60 rounded-lg px-4 py-3 font-mono text-sm">
            <span className="flex-1 truncate text-primary">{MCP_URL}</span>
            <button onClick={() => copy(MCP_URL, "url")} className="p-1.5 rounded hover:bg-muted/20 transition-colors">
              {copied === "url" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Claude Desktop Config */}
        <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Claude Desktop Configuration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Add this to your <code className="bg-muted/20 px-1.5 py-0.5 rounded text-xs">claude_desktop_config.json</code>:
          </p>
          <div className="relative">
            <pre className="bg-background/60 rounded-lg p-4 font-mono text-sm overflow-x-auto text-muted-foreground">
              {CLAUDE_CONFIG}
            </pre>
            <button
              onClick={() => copy(CLAUDE_CONFIG, "config")}
              className="absolute top-3 right-3 p-1.5 rounded hover:bg-muted/20 transition-colors"
            >
              {copied === "config" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Available Tools */}
        <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Available Tools</h2>
          <div className="space-y-3">
            {TOOLS.map(tool => (
              <div key={tool.name} className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                <tool.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <code className="text-sm font-mono text-foreground">{tool.name}</code>
                  <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BrandFooter />
    </div>
  );
}
