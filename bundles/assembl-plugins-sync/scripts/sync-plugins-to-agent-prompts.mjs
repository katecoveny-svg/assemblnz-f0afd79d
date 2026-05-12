#!/usr/bin/env node
/**
 * sync-plugins-to-agent-prompts.mjs (assembl-plugins layout)
 *
 * Scans the assembl-plugins repo for plugin folders and upserts each into
 * public.agent_prompts on the canonical Supabase (Lovable Cloud project
 * ssaxxdkxzrvkdjsanhei).
 *
 * Layout supported (two-level):
 *   <repo-root>/<slug>/{agent.yaml,system-prompt.md}              # top-level kete plugins
 *   <repo-root>/<pack>/<slug>/{agent.yaml,system-prompt.md}       # sub-plugins (e.g. toro/kid-money)
 *
 * Idempotent. Bumps `version` only when system_prompt, model_preference, or
 * display_name actually change. Marks the new row is_active=true; previous
 * active row for the same (agent_name, pack) is deactivated first.
 *
 * Env required:
 *   SUPABASE_URL                  e.g. https://ssaxxdkxzrvkdjsanhei.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     service-role key (RLS bypass, admin-equivalent)
 *
 * Usage:
 *   node scripts/sync-plugins-to-agent-prompts.mjs              # sync all
 *   node scripts/sync-plugins-to-agent-prompts.mjs --dry-run    # report only
 *   node scripts/sync-plugins-to-agent-prompts.mjs --only=toro  # filter by substring
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const DRY = ARGS.includes("--dry-run");
const ONLY = ARGS.find((a) => a.startsWith("--only="))?.split("=")[1] ?? null;

// Folders that are definitely not plugins.
const SKIP_DIRS = new Set([
  ".git", ".github", "node_modules", "scripts", "bundles",
  "docs", "tests", "test", ".vscode", ".idea", "dist", "build",
]);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/** Read a top-level scalar key from a tiny YAML manifest. */
function readTopLevelScalar(yaml, key) {
  const re = new RegExp(`^${key}\\s*:\\s*["']?([^"'\\n#]+?)["']?\\s*(?:#.*)?$`, "m");
  const m = yaml.match(re);
  return m ? m[1].trim() : null;
}

async function isDir(p) {
  try { return (await fs.stat(p)).isDirectory(); } catch { return false; }
}
async function fileExists(p) {
  try { return (await fs.stat(p)).isFile(); } catch { return false; }
}

/** Find every plugin folder (a dir containing agent.yaml), one or two levels deep. */
async function findPluginDirs() {
  const out = [];
  const top = await fs.readdir(ROOT, { withFileTypes: true });
  for (const e of top) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith(".") && SKIP_DIRS.has(e.name)) continue;
    if (SKIP_DIRS.has(e.name)) continue;

    const dir = path.join(ROOT, e.name);
    if (await fileExists(path.join(dir, "agent.yaml"))) {
      out.push({ dir, parentName: null, dirName: e.name });
      continue;
    }
    // Descend one level for sub-plugins.
    const inner = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const sub of inner) {
      if (!sub.isDirectory()) continue;
      const subDir = path.join(dir, sub.name);
      if (await fileExists(path.join(subDir, "agent.yaml"))) {
        out.push({ dir: subDir, parentName: e.name, dirName: sub.name });
      }
    }
  }
  return out;
}

async function loadPlugin({ dir, parentName, dirName }) {
  const [yamlRaw, prompt] = await Promise.all([
    fs.readFile(path.join(dir, "agent.yaml"), "utf8").catch(() => null),
    fs.readFile(path.join(dir, "system-prompt.md"), "utf8").catch(() => null),
  ]);
  if (!yamlRaw) return { dirName, skip: "no agent.yaml" };
  if (!prompt) return { dirName, skip: "no system-prompt.md" };

  const slug = (readTopLevelScalar(yamlRaw, "slug") ?? dirName).toLowerCase();
  const displayName = readTopLevelScalar(yamlRaw, "display_name") ?? slug;
  const provider = readTopLevelScalar(yamlRaw, "provider") ?? "anthropic";
  const modelShort = readTopLevelScalar(yamlRaw, "model");
  const model = modelShort
    ? (modelShort.includes("/") ? modelShort : `${provider}/${modelShort}`)
    : "anthropic/claude-haiku-4-5-20251001";

  // pack precedence:
  //   1. explicit `pack:` in agent.yaml
  //   2. parent folder name (e.g. toro/kid-money → pack=toro)
  //   3. slug prefix before first '-' (pikau-customs-broker → pack=pikau)
  //   4. slug itself (single-word slug)
  const explicitPack = readTopLevelScalar(yamlRaw, "pack");
  const pack = (explicitPack
    ?? parentName
    ?? (slug.includes("-") ? slug.split("-")[0] : slug)
  ).toLowerCase();

  return { slug, pack, displayName, model, systemPrompt: prompt.trim(), dirName };
}

async function syncOne(cb) {
  const { slug, pack, displayName, model, systemPrompt } = cb;
  const { data: existing, error: selErr } = await sb
    .from("agent_prompts")
    .select("id, version, system_prompt, model_preference, display_name")
    .eq("agent_name", slug)
    .eq("pack", pack)
    .eq("is_active", true)
    .maybeSingle();
  if (selErr) throw new Error(`select ${slug}/${pack}: ${selErr.message}`);

  if (
    existing &&
    existing.system_prompt === systemPrompt &&
    existing.model_preference === model &&
    existing.display_name === displayName
  ) {
    return { slug, pack, action: "noop", version: existing.version };
  }

  const nextVersion = (existing?.version ?? 0) + 1;
  if (DRY) {
    return { slug, pack, action: existing ? "would-update" : "would-insert", version: nextVersion };
  }

  if (existing) {
    const { error: deactErr } = await sb
      .from("agent_prompts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (deactErr) throw new Error(`deactivate ${slug}: ${deactErr.message}`);
  }

  const { error: insErr } = await sb.from("agent_prompts").insert({
    agent_name: slug,
    pack,
    display_name: displayName,
    system_prompt: systemPrompt,
    model_preference: model,
    version: nextVersion,
    is_active: true,
  });
  if (insErr) throw new Error(`insert ${slug}: ${insErr.message}`);

  return { slug, pack, action: existing ? "updated" : "inserted", version: nextVersion };
}

async function main() {
  console.log(`▸ assembl-plugins sync — ${DRY ? "DRY RUN" : "LIVE"} → ${SUPABASE_URL}`);
  const found = await findPluginDirs();
  const filtered = found.filter((p) => !ONLY || p.dirName.includes(ONLY) || (p.parentName ?? "").includes(ONLY));

  const results = [];
  for (const p of filtered) {
    try {
      const cb = await loadPlugin(p);
      if (cb.skip) { results.push({ dir: p.dirName, skipped: cb.skip }); continue; }
      const r = await syncOne(cb);
      results.push({ dir: p.parentName ? `${p.parentName}/${p.dirName}` : p.dirName, ...r });
    } catch (err) {
      results.push({ dir: p.dirName, error: err instanceof Error ? err.message : String(err) });
    }
  }

  console.table(results);
  const errs = results.filter((r) => r.error);
  if (errs.length) { console.error(`✗ ${errs.length} error(s)`); process.exit(1); }
  console.log(`✓ Sync complete (${results.length} plugin(s))`);
}

main().catch((e) => { console.error(e); process.exit(1); });
