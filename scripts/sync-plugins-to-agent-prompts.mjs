#!/usr/bin/env node
/**
 * sync-plugins-to-agent-prompts.mjs
 *
 * Reads plugins/managed-agent-cookbooks/<slug>/{agent.yaml,system-prompt.md}
 * and upserts each into public.agent_prompts on the canonical Supabase
 * (Lovable Cloud project: ssaxxdkxzrvkdjsanhei).
 *
 * Idempotent. Bumps `version` only when system_prompt or model_preference
 * actually changes. Marks the new row is_active=true; previous active row
 * for the same (agent_name, pack) is deactivated first.
 *
 * Env required:
 *   SUPABASE_URL                  e.g. https://ssaxxdkxzrvkdjsanhei.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     service-role key (RLS bypass, admin-equivalent)
 *
 * Usage:
 *   node scripts/sync-plugins-to-agent-prompts.mjs           # sync all
 *   node scripts/sync-plugins-to-agent-prompts.mjs --dry-run # report only
 *   node scripts/sync-plugins-to-agent-prompts.mjs --only=toro
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(process.cwd(), "plugins", "managed-agent-cookbooks");
const ARGS = process.argv.slice(2);
const DRY = ARGS.includes("--dry-run");
const ONLY = ARGS.find((a) => a.startsWith("--only="))?.split("=")[1] ?? null;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/** Tiny YAML reader for the top-level scalar keys we care about. */
function readTopLevelScalar(yaml, key) {
  const re = new RegExp(`^${key}\\s*:\\s*["']?([^"'\\n#]+?)["']?\\s*(?:#.*)?$`, "m");
  const m = yaml.match(re);
  return m ? m[1].trim() : null;
}

async function listCookbooks() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function loadCookbook(dirName) {
  const dir = path.join(ROOT, dirName);
  const yamlPath = path.join(dir, "agent.yaml");
  const promptPath = path.join(dir, "system-prompt.md");

  const [yamlRaw, prompt] = await Promise.all([
    fs.readFile(yamlPath, "utf8").catch(() => null),
    fs.readFile(promptPath, "utf8").catch(() => null),
  ]);

  if (!yamlRaw) return { dirName, skip: "no agent.yaml" };
  if (!prompt) return { dirName, skip: "no system-prompt.md" };

  const slug = readTopLevelScalar(yamlRaw, "slug") ?? dirName;
  const displayName = readTopLevelScalar(yamlRaw, "display_name") ?? slug;
  const provider = readTopLevelScalar(yamlRaw, "provider") ?? "anthropic";
  const modelShort = readTopLevelScalar(yamlRaw, "model");
  // Fully-qualify model id to match loadCachedPlugin convention.
  const model = modelShort
    ? (modelShort.includes("/") ? modelShort : `${provider}/${modelShort}`)
    : "anthropic/claude-haiku-4-5-20251001";

  // pack: derive from slug prefix before first '-' (e.g. pikau-customs-broker → pikau)
  // unless slug is single-word, then pack = slug (toro → toro).
  const pack = slug.includes("-") ? slug.split("-")[0] : slug;

  return {
    dirName,
    slug: slug.toLowerCase(),
    pack: pack.toLowerCase(),
    displayName,
    model,
    systemPrompt: prompt.trim(),
  };
}

async function syncOne(cb) {
  const { slug, pack, displayName, model, systemPrompt } = cb;
  // Find current active row (if any).
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
    return {
      slug, pack, action: existing ? "would-update" : "would-insert",
      version: nextVersion,
    };
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
  console.log(`▸ Plugin sync — ${DRY ? "DRY RUN" : "LIVE"} → ${SUPABASE_URL}`);
  const cookbooks = (await listCookbooks()).filter((d) => !ONLY || d.includes(ONLY));
  const results = [];
  for (const dir of cookbooks) {
    try {
      const cb = await loadCookbook(dir);
      if (cb.skip) { results.push({ dir, skipped: cb.skip }); continue; }
      const r = await syncOne(cb);
      results.push({ dir, ...r });
    } catch (err) {
      results.push({ dir, error: err instanceof Error ? err.message : String(err) });
    }
  }

  console.table(results);
  const errs = results.filter((r) => r.error);
  if (errs.length) { console.error(`✗ ${errs.length} error(s)`); process.exit(1); }
  console.log(`✓ Sync complete (${results.length} cookbook(s))`);
}

main().catch((e) => { console.error(e); process.exit(1); });
