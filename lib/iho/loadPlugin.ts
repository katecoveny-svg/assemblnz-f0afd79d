/**
 * loadPlugin — Day 8 file-based plugin loader (minimal stub).
 *
 * Spec: outputs/CANON-plugin-architecture-2026-05-08.md (§6.2).
 * This is the pre-cache form of the loader: it reads markdown +
 * JSON + YAML from the on-disk `plugins/` tree and returns an
 * assembled definition. A future PR adds the Supabase
 * `agent_prompts` write-through cache keyed by slug + git SHA
 * (canon §6.2 step 6).
 *
 * Important — runtime envelope: `plugins/` is excluded from the
 * Vercel deployment (`.vercelignore` and `tsconfig.json` exclude).
 * That means this loader works in:
 *   - local Next.js dev (`pnpm dev` against the repo root)
 *   - Node scripts run from the repo root (e.g.
 *     `scripts/verify-plugin-loader.ts`)
 *   - Server contexts that mount the repo (e.g. a sync job that
 *     hydrates the `agent_prompts` cache table at deploy time)
 * but NOT in Vercel-deployed serverless functions, which never
 * see the `plugins/` directory. Production runtime is expected
 * to read from the cache, not call this loader directly. The
 * cache hydration step runs in CI / a deploy hook.
 *
 * Skills are NOT parsed for YAML frontmatter here — that's a v2
 * concern. We return raw skill markdown plus the path so callers
 * (or the cache-hydrator) can do the parse if they need it.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface LoadedSkill {
  slug: string;
  pluginSlug: string;
  path: string;
  content: string;
}

export interface LoadedSubagent {
  slug: string;
  yaml: string;
  path: string;
}

export interface PluginManifest {
  name: string;
  displayName?: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  priceTier?: string;
  monthlyPrice?: number;
  currency?: string;
  skills?: string[];
  connectors?: unknown[];
  [key: string]: unknown;
}

export interface LoadedPlugin {
  slug: string;
  manifest: PluginManifest;
  manifestPath: string;
  agentYaml: string | null;
  agentYamlPath: string | null;
  systemPrompt: string | null;
  systemPromptPath: string | null;
  skills: LoadedSkill[];
  subagents: LoadedSubagent[];
  pluginsRoot: string;
}

/**
 * Resolve the on-disk root for the plugins/ tree. Defaults to
 * `<process.cwd()>/plugins`; override via PLUGINS_ROOT for ops
 * paths that live outside the repo cwd.
 */
export function pluginsRoot(): string {
  const override = process.env.PLUGINS_ROOT;
  if (override && override.length > 0) return override;
  return path.resolve(process.cwd(), 'plugins');
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(p: string): Promise<string | null> {
  if (!(await fileExists(p))) return null;
  return fs.readFile(p, 'utf8');
}

/**
 * Load the assembled definition for a plugin.
 *
 * Throws if the plugin manifest is missing — that's a hard
 * misconfiguration. Sub-agents and managed-agent cookbooks are
 * optional and degrade to nulls.
 */
export async function loadPlugin(slug: string): Promise<LoadedPlugin> {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    throw new Error(`loadPlugin: invalid slug "${slug}" — expected lowercase-kebab`);
  }

  const root = pluginsRoot();
  const pluginDir = path.join(root, slug);
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

  const manifestRaw = await readIfExists(manifestPath);
  if (manifestRaw === null) {
    throw new Error(
      `loadPlugin("${slug}"): manifest not found at ${manifestPath}`,
    );
  }

  let manifest: PluginManifest;
  try {
    manifest = JSON.parse(manifestRaw) as PluginManifest;
  } catch (err) {
    throw new Error(
      `loadPlugin("${slug}"): manifest at ${manifestPath} is not valid JSON — ${
        err instanceof Error ? err.message : 'unknown parse error'
      }`,
    );
  }

  const skillsDir = path.join(pluginDir, 'skills');
  const skills: LoadedSkill[] = [];
  if (await fileExists(skillsDir)) {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
      const content = await readIfExists(skillPath);
      if (content === null) continue;
      skills.push({
        slug: entry.name,
        pluginSlug: slug,
        path: skillPath,
        content,
      });
    }
  }

  // Optional managed-agent cookbook: agent.yaml, system-prompt.md, subagents/*.yaml
  const cookbookDir = path.join(root, 'managed-agent-cookbooks', slug);
  let agentYaml: string | null = null;
  let agentYamlPath: string | null = null;
  let systemPrompt: string | null = null;
  let systemPromptPath: string | null = null;
  const subagents: LoadedSubagent[] = [];

  if (await fileExists(cookbookDir)) {
    const ay = path.join(cookbookDir, 'agent.yaml');
    const ayContent = await readIfExists(ay);
    if (ayContent !== null) {
      agentYaml = ayContent;
      agentYamlPath = ay;
    }

    const sp = path.join(cookbookDir, 'system-prompt.md');
    const spContent = await readIfExists(sp);
    if (spContent !== null) {
      systemPrompt = spContent;
      systemPromptPath = sp;
    }

    const subagentsDir = path.join(cookbookDir, 'subagents');
    if (await fileExists(subagentsDir)) {
      const entries = await fs.readdir(subagentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.yaml') && !entry.name.endsWith('.yml')) continue;
        const subPath = path.join(subagentsDir, entry.name);
        const yaml = await readIfExists(subPath);
        if (yaml === null) continue;
        const baseName = entry.name.replace(/\.ya?ml$/, '');
        subagents.push({ slug: baseName, yaml, path: subPath });
      }
    }
  }

  return {
    slug,
    manifest,
    manifestPath,
    agentYaml,
    agentYamlPath,
    systemPrompt,
    systemPromptPath,
    skills,
    subagents,
    pluginsRoot: root,
  };
}

/**
 * Cheap "does this slug have a manifest" probe — used by
 * routers that want to know whether a plugin is installed
 * without paying the full read cost.
 */
export async function hasPlugin(slug: string): Promise<boolean> {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) return false;
  const manifestPath = path.join(
    pluginsRoot(),
    slug,
    '.claude-plugin',
    'plugin.json',
  );
  return fileExists(manifestPath);
}
