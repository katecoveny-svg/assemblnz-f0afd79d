import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPO = "katecoveny-svg/assemblnz-f0afd79d";
const DEPLOY_BRANCH = "claude/agentic-ai-platform-75lsX";
const TRACKED_BRANCHES = [DEPLOY_BRANCH, "main", "claude/sims-live-data-sources"];

// Edge functions we care about for "did the deploy land"
const TRACKED_FUNCTIONS = [
  "tnz-send",
  "tnz-inbound",
  "tnz-webhook",
  "chat",
  "stitch-generate",
  "github-sync-status",
];

async function gh(path: string) {
  const token = Deno.env.get("GITHUB_TOKEN");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "assembl-sync-status",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    return { error: `GitHub ${res.status}: ${await res.text()}` };
  }
  return await res.json();
}

async function probeFunction(name: string) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${name}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: "OPTIONS" });
    return {
      name,
      reachable: true,
      status: res.status,
      latency_ms: Date.now() - t0,
    };
  } catch (e) {
    return {
      name,
      reachable: false,
      status: 0,
      latency_ms: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const branchData = await Promise.all(
      TRACKED_BRANCHES.map(async (b) => {
        const data = await gh(`/repos/${REPO}/branches/${encodeURIComponent(b)}`);
        if ((data as any).error) return { branch: b, error: (data as any).error };
        const commit = (data as any).commit;
        return {
          branch: b,
          sha: commit?.sha?.slice(0, 7),
          message: commit?.commit?.message?.split("\n")[0],
          author: commit?.commit?.author?.name,
          date: commit?.commit?.author?.date,
          url: commit?.html_url,
        };
      })
    );

    const recentCommits = await gh(`/repos/${REPO}/commits?sha=${encodeURIComponent(DEPLOY_BRANCH)}&per_page=10`);
    const commits = Array.isArray(recentCommits)
      ? recentCommits.map((c: any) => ({
          sha: c.sha?.slice(0, 7),
          message: c.commit?.message?.split("\n")[0],
          author: c.commit?.author?.name,
          date: c.commit?.author?.date,
          url: c.html_url,
        }))
      : [];

    const functions = await Promise.all(TRACKED_FUNCTIONS.map(probeFunction));

    return new Response(
      JSON.stringify({
        repo: REPO,
        deploy_branch: DEPLOY_BRANCH,
        branches: branchData,
        recent_commits: commits,
        functions,
        checked_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
