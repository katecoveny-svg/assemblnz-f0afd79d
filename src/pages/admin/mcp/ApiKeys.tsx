import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, KeyRound, Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";
import { formatDistanceToNow } from "date-fns";

type ApiKeyRow = {
  id: string;
  org_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

// Generates `asm_live_<32 random bytes hex>` and its SHA-256 hash, in browser.
async function generateApiKey(): Promise<{ key: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const key = `asm_live_${body}`;

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { key, hash, prefix: key.slice(0, 16) };
}

export default function McpApiKeysPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ org_id: "", name: "", expires_in_days: "" });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_api_keys" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ApiKeyRow[];
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, ApiKeyRow[]>();
    (data ?? []).forEach((row) => {
      const arr = map.get(row.org_id) ?? [];
      arr.push(row);
      map.set(row.org_id, arr);
    });
    return Array.from(map.entries());
  }, [data]);

  const create = useMutation({
    mutationFn: async () => {
      if (!form.org_id || !form.name) throw new Error("Org ID and name are required");
      const { key, hash, prefix } = await generateApiKey();
      const expires_at = form.expires_in_days
        ? new Date(Date.now() + Number(form.expires_in_days) * 86400000).toISOString()
        : null;

      const { error } = await supabase.from("mcp_api_keys" as never).insert({
        org_id: form.org_id.trim(),
        name: form.name.trim(),
        key_hash: hash,
        key_prefix: prefix,
        expires_at,
      } as never);
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      setCreatedKey(key);
      setForm({ org_id: "", name: "", expires_in_days: "" });
      qc.invalidateQueries({ queryKey: ["mcp-api-keys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("mcp_api_keys" as never)
        .update({ revoked_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Key revoked");
      qc.invalidateQueries({ queryKey: ["mcp-api-keys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminMcpLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">External access</p>
          <h2 className="font-display text-2xl mt-0.5">API keys</h2>
          <p className="text-sm text-foreground/65 mt-1">
            Per-org keys for the <code className="text-xs">@assembl/mcp</code> npm package and
            external MCP clients (Claude Desktop, Cursor, n8n).
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Mint API key
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-10 text-foreground/55">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-3xl border border-foreground/10 bg-white/60 backdrop-blur-xl p-10 text-center text-foreground/55">
          <KeyRound className="w-8 h-8 mx-auto mb-3 opacity-40" />
          No API keys yet. Mint one for an organisation to enable external MCP access.
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {grouped.map(([orgId, rows]) => (
            <section
              key={orgId}
              className="rounded-3xl border border-foreground/10 bg-white/60 backdrop-blur-xl p-5"
            >
              <header className="mb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">Org</p>
                <h3 className="font-mono text-sm">{orgId}</h3>
              </header>
              <ul className="divide-y divide-foreground/10">
                {rows.map((k) => {
                  const isRevoked = !!k.revoked_at;
                  const isExpired = k.expires_at && new Date(k.expires_at) < new Date();
                  return (
                    <li key={k.id} className="py-3 flex items-center gap-4">
                      <KeyRound
                        className={`w-4 h-4 ${
                          isRevoked || isExpired ? "text-foreground/30" : "text-primary"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{k.name}</p>
                        <p className="text-xs text-foreground/55 font-mono">
                          {k.key_prefix}…
                          {k.last_used_at &&
                            ` · last used ${formatDistanceToNow(new Date(k.last_used_at))} ago`}
                          {!k.last_used_at && " · never used"}
                          {isRevoked && " · REVOKED"}
                          {isExpired && !isRevoked && " · EXPIRED"}
                        </p>
                      </div>
                      {!isRevoked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Revoke key "${k.name}"? This cannot be undone.`)) {
                              revoke.mutate(k.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setCreatedKey(null);
            setCopied(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdKey ? "Key created" : "Mint API key"}</DialogTitle>
            <DialogDescription>
              {createdKey
                ? "Copy this key now — you won't be able to see it again."
                : "Create a new API key for an organisation. The full key is shown only once."}
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-foreground/5 p-3 font-mono text-xs break-all border border-foreground/10">
                {createdKey}
              </div>
              <Button onClick={copyKey} variant="outline" className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> Copy key
                  </>
                )}
              </Button>
              <p className="text-xs text-foreground/55">
                Set this as <code>ASSEMBL_API_KEY</code> in your MCP client environment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="org_id">Organisation ID</Label>
                <Input
                  id="org_id"
                  value={form.org_id}
                  onChange={(e) => setForm({ ...form, org_id: e.target.value })}
                  placeholder="uuid"
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="name">Label</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Claude Desktop – Kate"
                />
              </div>
              <div>
                <Label htmlFor="expires">Expires in days (optional)</Label>
                <Input
                  id="expires"
                  type="number"
                  value={form.expires_in_days}
                  onChange={(e) => setForm({ ...form, expires_in_days: e.target.value })}
                  placeholder="Leave empty for no expiry"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {createdKey ? (
              <Button onClick={() => setOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => create.mutate()}
                  disabled={create.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {create.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 mr-2" />
                  )}
                  Create
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminMcpLayout>
  );
}
