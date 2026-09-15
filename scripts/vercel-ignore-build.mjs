#!/usr/bin/env node
/**
 * Vercel ignored-build decision.
 * Exit 0 = skip deployment, exit 1 = build.
 *
 * We skip branches dedicated to screenshots/evidence and commits that only
 * change non-runtime documentation/research/context. Repo CI still validates
 * canonical context separately, so these changes do not need a Next build.
 */
import { execFileSync } from 'node:child_process';

const ref = process.env.VERCEL_GIT_COMMIT_REF || '';
if (/^(assets\/|pr-assets\/)/.test(ref) || /(shots|screenshots|screens)/i.test(ref)) process.exit(0);

const base = process.env.VERCEL_GIT_PREVIOUS_SHA?.trim() || 'HEAD^';
let files = [];
try {
  files = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' })
    .split('\n').map((value) => value.trim()).filter(Boolean);
} catch {
  // When Git history is too shallow or this is the first deployment, build.
  process.exit(1);
}

if (!files.length) process.exit(0);

const NON_RUNTIME = [
  /^docs\//,
  /^research\//,
  /^outputs\//,
  /^\.pr-(assets|screenshots|shots)\//,
  /^pr-evidence\//,
  /^AGENT_CHAT_STARTER\.md$/,
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^START_HERE\.md$/,
  /^README\.md$/,
  /^config\/context-manifest\.json$/,
];

const onlyNonRuntime = files.every((file) => NON_RUNTIME.some((pattern) => pattern.test(file)));
process.exit(onlyNonRuntime ? 0 : 1);
