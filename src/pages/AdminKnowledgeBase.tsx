import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, RefreshCw, Database, ExternalLink } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const ALL_AGENTS = [
  "AROHA","LEDGER","APEX","AURA","HAVEN","FORGE","ANCHOR",
  "TERRA","FLUX","PRISM","ECHO","SHIELD","VAULT","TORO",
  "GROVE","COMPASS","VITAE","KINDLE","VOYAGE","ATLAS","AWA",
];

interface KnowledgeEntry {
  id: string;
  agent_id: string;
  topic: string;
  content: string;
  confidence: number | null;
  is_active: boolean | null;
  is_stale: boolean | null;
  stale_reason: string | null;
  source_url: string | null;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
}

const defaultEntry = {
  agent_id: "",
  topic: "",
  content: "",
  confidence: 1.0,
  source_url: "",
  is_active: true,
  is_stale: false,
};

export default function AdminKnowledgeBase() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [staleFilter, setStaleFilter] = useState("all");
  const [editEntry, setEditEntry] = useState<Partial<KnowledgeEntry> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["knowledge-base", agentFilter, staleFilter],
    queryFn: async () => {
      let q = supabase.from("agent_knowledge_base").select("*").order("updated_at", { ascending: false }).limit(500);
      if (agentFilter !== "all") q = q.eq("agent_id", agentFilter.toLowerCase());
      if (staleFilter === "stale") q = q.eq("is_stale", true);
      if (staleFilter === "active") q = q.eq("is_stale", false);
      const { data, error } = await q;
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (entry: Partial<KnowledgeEntry>) => {
      const payload = {
        agent_id: entry.agent_id!.toLowerCase(),
        topic: entry.topic!,
        content: entry.content!,
        confidence: entry.confidence ?? 1.0,
        source_url: entry.source_url || null,
        is_active: entry.is_active ?? true,
        is_stale: entry.is_stale ?? false,
        last_verified: new Date().toISOString(),
      };
      if (entry.id) {
        const { error } = await supabase.from("agent_knowledge_base").update(payload).eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("agent_knowledge_base").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Knowledge entry saved");
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      setIsDialogOpen(false);
      setEditEntry(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agent_knowledge_base").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = entries.filter((e) =>
    !search || e.topic.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditEntry({ ...defaultEntry });
    setIsDialogOpen(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditEntry({ ...entry });
    setIsDialogOpen(true);
  };

  return (
    <AdminShell
      title="Knowledge Base"
      subtitle={`${entries.length} entries across all agents`}
      icon={<Database size={18} style={{ color: "#D4A843" }} />}
      backTo="/admin/compliance"
      actions={
        <Button onClick={openNew} className="bg-[#D4A843] text-black hover:bg-[#D4A843]/80">
          <Plus className="h-4 w-4 mr-2" /> Add Entry
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search topics or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-gray-200 text-foreground"
            />
          </div>
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[160px] bg-white/5 border-gray-200 text-foreground">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {ALL_AGENTS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={staleFilter} onValueChange={setStaleFilter}>
            <SelectTrigger className="w-[140px] bg-white/5 border-gray-200 text-foreground">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="stale">Stale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-white/40">Loading knowledge base...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-white/40">No entries found. Add knowledge to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="text-white/60">Agent</TableHead>
                  <TableHead className="text-white/60">Topic</TableHead>
                  <TableHead className="text-white/60 hidden lg:table-cell">Content</TableHead>
                  <TableHead className="text-white/60 w-[100px]">Confidence</TableHead>
                  <TableHead className="text-white/60 w-[100px]">Status</TableHead>
                  <TableHead className="text-white/60 w-[140px]">Last Verified</TableHead>
                  <TableHead className="text-white/60 w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id} className="border-gray-200 hover:bg-white/5">
                    <TableCell>
                      <Badge className="bg-[#1A3A5C]/60 text-[#D4A843] border-[#D4A843]/30 uppercase text-xs">
                        {entry.agent_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-white/90 max-w-[200px] truncate">
                      {entry.topic}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-white/60 max-w-[300px] truncate text-sm">
                      {entry.content}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${(entry.confidence ?? 0) >= 0.9 ? "text-[#3A7D6E]" : (entry.confidence ?? 0) >= 0.7 ? "text-amber-400" : "text-red-400"}`}>
                        {((entry.confidence ?? 0) * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.is_stale ? (
                        <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs">Stale</Badge>
                      ) : entry.is_active ? (
                        <Badge variant="outline" className="border-[#3A7D6E]/50 text-[#3A7D6E] text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-300 text-white/40 text-xs">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {entry.last_verified ? new Date(entry.last_verified).toLocaleDateString("en-NZ") : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-foreground" onClick={() => openEdit(entry)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-white/40 hover:text-red-400"
                          onClick={() => { if (confirm("Delete this entry?")) deleteMutation.mutate(entry.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {entry.source_url && (
                          <a href={entry.source_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-[#D4A843]">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#FAFBFC] border-gray-200 text-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#D4A843]">{editEntry?.id ? "Edit" : "Add"} Knowledge Entry</DialogTitle>
            </DialogHeader>
            {editEntry && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Agent</label>
                  <Select value={editEntry.agent_id?.toUpperCase() || ""} onValueChange={(v) => setEditEntry({ ...editEntry, agent_id: v })}>
                    <SelectTrigger className="bg-white/5 border-gray-200 text-foreground">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_AGENTS.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Topic / Domain</label>
                  <Input
                    value={editEntry.topic || ""}
                    onChange={(e) => setEditEntry({ ...editEntry, topic: e.target.value })}
                    placeholder="e.g. Minimum Wage Rate 2026"
                    className="bg-white/5 border-gray-200 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Content</label>
                  <Textarea
                    value={editEntry.content || ""}
                    onChange={(e) => setEditEntry({ ...editEntry, content: e.target.value })}
                    placeholder="The current minimum wage is $23.15/hour as of 1 April 2024..."
                    rows={5}
                    className="bg-white/5 border-gray-200 text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Confidence (0-1)</label>
                    <Input
                      type="number" min={0} max={1} step={0.05}
                      value={editEntry.confidence ?? 1.0}
                      onChange={(e) => setEditEntry({ ...editEntry, confidence: parseFloat(e.target.value) })}
                      className="bg-white/5 border-gray-200 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Source URL</label>
                    <Input
                      value={editEntry.source_url || ""}
                      onChange={(e) => setEditEntry({ ...editEntry, source_url: e.target.value })}
                      placeholder="https://..."
                      className="bg-white/5 border-gray-200 text-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editEntry.is_active ?? true}
                      onChange={(e) => setEditEntry({ ...editEntry, is_active: e.target.checked })}
                      className="rounded"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editEntry.is_stale ?? false}
                      onChange={(e) => setEditEntry({ ...editEntry, is_stale: e.target.checked })}
                      className="rounded"
                    />
                    Mark as Stale
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-200 text-white/60">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => upsertMutation.mutate(editEntry)}
                    disabled={!editEntry.agent_id || !editEntry.topic || !editEntry.content}
                    className="bg-[#D4A843] text-black hover:bg-[#D4A843]/80"
                  >
                    {editEntry.id ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}
