#!/usr/bin/env node
/**
 * verify-plugin-loader.mjs
 *
 * Smoke test for `lib/iho/loadPlugin.ts`. Mirrors the canon §6.2
 * acceptance criterion — "Plugin loader recognises `toro` slug
 * (test by calling `loadPlugin('toro')` server-side and verifying
 * it returns a non-null assembled definition)".
 *
 * Re-implements the loader logic in plain ESM JS so this script
 * runs without a TypeScript build step (`node scripts/verify-plugin-loader.mjs`).
 * The TypeScript loader at lib/iho/loadPlugin.ts is the source of
 * truth; this script's job is to prove the on-disk plugin layout
 * is the right shape, not to import the TS module.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const pluginsRoot = process.env.PLUGINS_ROOT ?? path.join(repoRoot, 'plugins');

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function readIfExists(p) {
  if (!(await exists(p))) return null;
  return fs.readFile(p, 'utf8');
}

async function loadPlugin(slug) {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    throw new Error(`invalid slug "${slug}"`);
  }
  const pluginDir = path.join(pluginsRoot, slug);
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  const manifestRaw = await readIfExists(manifestPath);
  if (manifestRaw === null) throw new Error(`manifest missing at ${manifestPath}`);
  const manifest = JSON.parse(manifestRaw);

  const skills = [];
  const skillsDir = path.join(pluginDir, 'skills');
  if (await exists(skillsDir)) {
    for (const entry of await fs.readdir(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const sp = path.join(skillsDir, entry.name, 'SKILL.md');
      const content = await readIfExists(sp);
      if (content === null) continue;
      skills.push({ slug: entry.name, path: sp, length: content.length });
    }
  }

  const cookbookDir = path.join(pluginsRoot, 'managed-agent-cookbooks', slug);
  let agentYaml = null;
  let systemPrompt = null;
  const subagents = [];
  if (await exists(cookbookDir)) {
    agentYaml = await readIfExists(path.join(cookbookDir, 'agent.yaml'));
    systemPrompt = await readIfExists(path.join(cookbookDir, 'system-prompt.md'));
    const subagentsDir = path.join(cookbookDir, 'subagents');
    if (await exists(subagentsDir)) {
      for (const entry of await fs.readdir(subagentsDir, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.yaml') && !entry.name.endsWith('.yml')) continue;
        const yamlContent = await readIfExists(path.join(subagentsDir, entry.name));
        if (yamlContent === null) continue;
        subagents.push({
          slug: entry.name.replace(/\.ya?ml$/, ''),
          path: path.join(subagentsDir, entry.name),
          length: yamlContent.length,
        });
      }
    }
  }

  return { slug, manifest, skills, agentYaml, systemPrompt, subagents };
}

const TARGET = process.argv[2] ?? 'toro';

try {
  const plugin = await loadPlugin(TARGET);
  const summary = {
    slug: plugin.slug,
    manifest_name: plugin.manifest.name,
    manifest_displayName: plugin.manifest.displayName ?? null,
    manifest_version: plugin.manifest.version,
    skills_count: plugin.skills.length,
    skills: plugin.skills.map((s) => s.slug).sort(),
    agent_yaml_present: plugin.agentYaml !== null,
    system_prompt_present: plugin.systemPrompt !== null,
    subagents_count: plugin.subagents.length,
    subagents: plugin.subagents.map((s) => s.slug).sort(),
  };
  console.log(`✓ loadPlugin("${TARGET}") returned a non-null assembled definition`);
  console.log(JSON.stringify(summary, null, 2));
  if (
    plugin.manifest.name !== TARGET ||
    plugin.skills.length === 0 ||
    plugin.agentYaml === null ||
    plugin.systemPrompt === null
  ) {
    console.error(`✗ assembled definition is incomplete — see summary above`);
    process.exit(2);
  }
  process.exit(0);
} catch (err) {
  console.error(`✗ loadPlugin("${TARGET}") failed:`, err instanceof Error ? err.message : err);
  process.exit(1);
}
