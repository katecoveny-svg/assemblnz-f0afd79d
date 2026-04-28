import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Loader2, MessageSquare } from "lucide-react";

interface SendResult {
  ok: boolean;
  messageId?: string;
  status?: string | number;
  raw?: unknown;
  error?: string;
}

interface AgentOption {
  id: string;
  name: string;
}

interface ConversationOption {
  id: string;
  channel: string;
  phone_number: string;
  assigned_agent: string | null;
  updated_at: string | null;
}

export default function AdminTnzSend() {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [conversations, setConversations] = useState<ConversationOption[]>([]);
  const [agentId, setAgentId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [recipient, setRecipient] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  useEffect(() => {
    loadAgents();
    loadConversations();
  }, []);

  async function loadAgents() {
    const { data } = await supabase
      .from("agent_prompts")
      .select("id, agent_name")
      .order("agent_name", { ascending: true })
      .limit(200);
    setAgents((data ?? []).map((a: any) => ({ id: a.id, name: a.agent_name })));
  }

  async function loadConversations() {
    const { data } = await supabase
      .from("messaging_conversations")
      .select("id, channel, phone_number, assigned_agent, updated_at")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(50);
    setConversations((data ?? []) as unknown as ConversationOption[]);
  }

  function applyConversation(id: string) {
    setConversationId(id);
    const c = conversations.find((x) => x.id === id);
    if (c) {
      if (c.channel === "sms" || c.channel === "whatsapp") setChannel(c.channel);
      if (c.phone_number) setRecipient(c.phone_number);
    }
  }

  async function handleSend() {
    if (!recipient.trim() || !body.trim()) {
      toast.error("Recipient and message body are required");
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("tnz-send", {
        body: {
          channel,
          to: recipient.trim(),
          message: body.trim(),
          conversation_id: conversationId || undefined,
          agent_id: agentId || undefined,
          source: "admin_manual_send",
        },
      });
      if (error) throw error;
      const r: SendResult = {
        ok: data?.ok ?? data?.success ?? true,
        messageId: data?.messageId ?? data?.message_id ?? data?.id,
        status: data?.status,
        raw: data,
      };
      setResult(r);
      if (r.ok) toast.success(`Sent via ${channel.toUpperCase()}`);
      else toast.error(`Send failed: ${data?.error ?? "unknown"}`);
    } catch (e: any) {
      setResult({ ok: false, error: e?.message ?? String(e) });
      toast.error(`Send failed: ${e?.message ?? e}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-light">Manual SMS / WhatsApp Send</h1>
          <p className="text-sm text-muted-foreground">
            Send a message via the TNZ gateway and view the response.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">Compose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as "sms" | "whatsapp")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agent (optional)</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conversation (optional — autofills recipient & channel)</Label>
            <Select value={conversationId} onValueChange={applyConversation}>
              <SelectTrigger>
                <SelectValue placeholder="New conversation" />
              </SelectTrigger>
              <SelectContent>
                {conversations.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    [{c.channel}] {c.phone_number} {c.assigned_agent ? `· ${c.assigned_agent}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recipient (E.164, e.g. +642123456789)</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="+642123456789"
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={1500}
              placeholder="Type your message…"
            />
            <p className="text-xs text-muted-foreground text-right">{body.length} chars</p>
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" /> Send via tnz-send
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal flex items-center gap-2">
              Response
              <Badge variant={result.ok ? "default" : "destructive"}>
                {result.ok ? "OK" : "Failed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {result.messageId && (
              <div>
                <span className="text-muted-foreground">Message ID:</span>{" "}
                <code className="font-mono">{result.messageId}</code>
              </div>
            )}
            {result.status !== undefined && (
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <code className="font-mono">{String(result.status)}</code>
              </div>
            )}
            {result.error && (
              <div className="text-destructive">
                <span className="text-muted-foreground">Error:</span> {result.error}
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">Raw payload</summary>
              <pre className="mt-2 p-3 rounded-lg bg-muted/50 text-xs overflow-auto max-h-80">
                {JSON.stringify(result.raw ?? result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
