#!/usr/bin/env node
/** Exit 0 skips Vercel; exit 1 builds. Unknown paths/history always build. */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Audited authoring/evidence paths only. Never infer relevance from branch names
// or file extensions alone. See docs/build-cost-workflow.md for dependencies.
const NON_RUNTIME = [
  /^docs\/(context|factory)\/[^\n]+\.md$/,
  /^docs\/(deployment-and-release-checklist|deployment-surfaces|build-cost-workflow)\.md$/,
  /^research\/[^\n]+\.md$/,
  /^outputs\/[^\n]+\.(md|png|jpg|webp|pdf)$/,
  /^\.pr-(assets|screenshots|shots)\/[^\n]+\.(md|png|jpg|webp|pdf)$/,
  /^pr-evidence\/[^\n]+\.(md|png|jpg|webp|pdf)$/,
  /^(AGENT_CHAT_STARTER|AGENTS|CLAUDE|START_HERE|README)\.md$/,
  /^config\/context-manifest\.json$/,
  // Unapplied proposal excluded by tsconfig; its security CI remains mandatory.
  /^security-proposals\/nz-edge-maintenance\//,
];

export function shouldBuild(files) {
  return !files.length || files.some(file => !NON_RUNTIME.some(pattern => pattern.test(file)));
}

export function buildDecision(env = process.env, git = execFileSync) {
  // Missing previous deployment is not evidence of irrelevance. HEAD^ misses
  // earlier commits in a batched push and can hide a runtime change.
  const base = env.VERCEL_GIT_PREVIOUS_SHA?.trim();
  if (!base) return true;
  try {
    const files = git('git', ['diff', '--name-only', '-z', '--no-renames', base, 'HEAD'], { encoding: 'utf8' })
      .split('\0').filter(Boolean);
    return shouldBuild(files);
  } catch { return true; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const build = buildDecision();
  console.log(`vercel-ignore-build: ${build ? 'build (runtime, unknown, or redeploy)' : 'skip (audited authoring/evidence only)'}`);
  process.exit(build ? 1 : 0);
}
