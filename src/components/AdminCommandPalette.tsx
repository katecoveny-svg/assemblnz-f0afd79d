import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageSquare } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useAuthSafe } from "@/hooks/useAuth";
import { allAgents, packs } from "@/data/agents";

const ADMIN_PAGES = [
  { label: "Admin Dashboard", to: "/admin/dashboard", group: "Admin" },
  { label: "Health", to: "/admin/health", group: "Admin" },
  { label: "Leads", to: "/admin/leads", group: "Admin" },
  { label: "Compliance", to: "/admin/compliance", group: "Admin" },
  { label: "Test Reports", to: "/admin/test-reports", group: "Admin" },
  { label: "Knowledge Base", to: "/admin/knowledge", group: "Admin" },
  { label: "Test Lab", to: "/admin/test-lab", group: "Admin" },
  { label: "Agent Wiring Check", to: "/admin/wiring-check", group: "Admin" },
  { label: "Agent Inspector (edit status/model/collisions)", to: "/admin/agent-inspector", group: "Admin" },
  { label: "Analytics", to: "/admin/analytics", group: "Admin" },
  { label: "Messages", to: "/admin/messages", group: "Admin" },
  { label: "Messaging Hub", to: "/admin/messaging", group: "Admin" },
  { label: "Showcase Videos", to: "/admin/showcase-videos", group: "Admin" },
  { label: "Flint", to: "/admin/flint", group: "Admin" },
  { label: "Packs", to: "/admin/packs", group: "Admin" },
  { label: "Agent Catalog (edit)", to: "/admin/agents", group: "Admin" },
  { label: "Agent Inventory (read-only)", to: "/admin/agents/inventory", group: "Admin" },
  { label: "Agent System Prompts", to: "/admin/agents/prompts", group: "Admin" },
];

const QUICK_LINKS = [
  { label: "Home", to: "/", group: "Site" },
  { label: "Pricing", to: "/pricing", group: "Site" },
  { label: "Contact", to: "/contact", group: "Site" },
  { label: "Showcase", to: "/showcase", group: "Site" },
  { label: "ROI Calculator", to: "/roi", group: "Site" },
  { label: "Demos", to: "/demos", group: "Site" },
];

export default function AdminCommandPalette() {
  const auth = useAuthSafe();
  const isAdmin = auth?.isAdmin ?? false;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Global keyboard shortcut — ⌘K / Ctrl+K
  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  // Listen for custom open events from FAB / mobile tab
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("assembl:openCommand", onOpen);
    return () => window.removeEventListener("assembl:openCommand", onOpen);
  }, []);

  const groupedAgents = useMemo(() => {
    const map = new Map<string, typeof allAgents>();
    for (const a of allAgents) {
      const key = a.pack ?? "core";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, []);

  const packLabel = (id: string) =>
    packs.find((p) => p.id === id)?.name ?? "Core";

  if (!isAdmin) return null;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search agents, pages, or anything…" />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No matches found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => go("/admin/dashboard")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Open Admin Dashboard
            </CommandItem>
            <CommandItem onSelect={() => go("/chat/aura")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with AURA (Hospitality)
            </CommandItem>
          </CommandGroup>

          {Array.from(groupedAgents.entries()).map(([packId, agents]) => (
            <CommandGroup key={packId} heading={`Agents · ${packLabel(packId)}`}>
              {agents.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.name} ${a.role} ${a.expertise.join(" ")} ${a.id}`}
                  onSelect={() => go(`/chat/${a.id}`)}
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: a.color }}
                  />
                  <span className="font-medium">{a.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground truncate">
                    {a.role}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          <CommandGroup heading="Admin Pages">
            {ADMIN_PAGES.map((p) => (
              <CommandItem key={p.to} onSelect={() => go(p.to)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Site">
            {QUICK_LINKS.map((p) => (
              <CommandItem key={p.to} onSelect={() => go(p.to)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Floating mobile FAB — only visible to admins */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="fixed z-[80] right-4 bottom-20 sm:bottom-6 flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(145deg, #FFFFFF, #F4F5F7)",
          border: "1px solid rgba(58,125,110,0.18)",
          boxShadow:
            "0 8px 24px rgba(58,125,110,0.18), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
          color: "#3A7D6E",
        }}
      >
        <Sparkles size={22} strokeWidth={1.75} />
        <span
          className="hidden sm:flex absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono"
          style={{
            background: "#3A7D6E",
            color: "#FFFFFF",
            letterSpacing: "0.5px",
          }}
        >
          ⌘K
        </span>
      </button>
    </>
  );
}
