import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRELLO_BASE = "https://api.trello.com/1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TRELLO_API_KEY = Deno.env.get("TRELLO_API_KEY");
  const TRELLO_TOKEN = Deno.env.get("TRELLO_TOKEN");

  if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Trello credentials not configured. Add TRELLO_API_KEY and TRELLO_TOKEN secrets." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authParams = `key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

  try {
    const { action, ...params } = await req.json();

    let result: any;

    switch (action) {
      case "createBoard": {
        const { name, desc, defaultLists } = params;
        const resp = await fetch(
          `${TRELLO_BASE}/boards?${authParams}&name=${encodeURIComponent(name)}&desc=${encodeURIComponent(desc || "")}&defaultLists=${defaultLists !== false}`,
          { method: "POST" }
        );
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "createList": {
        const { name, idBoard, pos } = params;
        const resp = await fetch(
          `${TRELLO_BASE}/lists?${authParams}&name=${encodeURIComponent(name)}&idBoard=${idBoard}${pos ? `&pos=${pos}` : ""}`,
          { method: "POST" }
        );
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "createCard": {
        const { name, desc, idList, due, labels } = params;
        let url = `${TRELLO_BASE}/cards?${authParams}&name=${encodeURIComponent(name)}&idList=${idList}`;
        if (desc) url += `&desc=${encodeURIComponent(desc)}`;
        if (due) url += `&due=${encodeURIComponent(due)}`;
        if (labels) url += `&idLabels=${encodeURIComponent(labels)}`;
        const resp = await fetch(url, { method: "POST" });
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "moveCard": {
        const { cardId, idList: targetList, pos: cardPos } = params;
        let url = `${TRELLO_BASE}/cards/${cardId}?${authParams}&idList=${targetList}`;
        if (cardPos) url += `&pos=${cardPos}`;
        const resp = await fetch(url, { method: "PUT" });
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "addComment": {
        const { cardId, text } = params;
        const resp = await fetch(
          `${TRELLO_BASE}/cards/${cardId}/actions/comments?${authParams}&text=${encodeURIComponent(text)}`,
          { method: "POST" }
        );
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "getBoards": {
        const resp = await fetch(`${TRELLO_BASE}/members/me/boards?${authParams}&fields=name,desc,url,dateLastActivity`);
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "getLists": {
        const { boardId } = params;
        const resp = await fetch(`${TRELLO_BASE}/boards/${boardId}/lists?${authParams}`);
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      case "getCards": {
        const { listId } = params;
        const resp = await fetch(`${TRELLO_BASE}/lists/${listId}/cards?${authParams}`);
        result = await resp.json();
        if (!resp.ok) throw new Error(`Trello API error: ${JSON.stringify(result)}`);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Supported: createBoard, createList, createCard, moveCard, addComment, getBoards, getLists, getCards` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Trello API error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
