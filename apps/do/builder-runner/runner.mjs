#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const out = { harness: 'auto', repo: process.cwd(), prompt: '', promptFile: '', authority: 'prepare_pr', execute: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--execute') out.execute = true;
    else if (arg === '--harness') out.harness = argv[++i] || 'auto';
    else if (arg === '--repo') out.repo = argv[++i] || out.repo;
    else if (arg === '--prompt') out.prompt = argv[++i] || '';
    else if (arg === '--prompt-file') out.promptFile = argv[++i] || '';
    else if (arg === '--authority') out.authority = argv[++i] || out.authority;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function usage() {
  return `Builderdoo local runner\n\nUsage:\n  node apps/do/builder-runner/runner.mjs --harness grok --repo . --prompt-file /tmp/builderdoo.txt [--execute]\n\nOptions:\n  --harness auto|grok|claude|codex\n  --repo PATH\n  --prompt TEXT\n  --prompt-file PATH\n  --authority plan_only|branch_and_build|prepare_pr\n  --execute   Actually launch the harness. Without this flag the runner only prints what it would run.\n`;
}

function installed(command) {
  const result = spawnSync('/usr/bin/env', ['which', command], { encoding: 'utf8' });
  return result.status === 0 && Boolean(result.stdout.trim());
}

function chooseHarness(requested) {
  if (requested !== 'auto') {
    if (!['grok', 'claude', 'codex'].includes(requested)) throw new Error(`Unsupported harness: ${requested}`);
    if (!installed(requested)) throw new Error(`${requested} is not installed or not on PATH`);
    return requested;
  }
  for (const candidate of ['grok', 'claude', 'codex']) if (installed(candidate)) return candidate;
  throw new Error('No supported local builder harness found. Install Grok Build, Claude Code, or Codex CLI first.');
}

function authorityRules(authority) {
  if (authority === 'plan_only') {
    return 'PLAN ONLY. Do not edit files, run mutating commands, create commits, push, merge, deploy or contact external services. Inspect and return a concrete implementation plan with proof steps.';
  }
  if (authority === 'branch_and_build') {
    return 'You may edit and test only inside the current isolated branch/worktree. Do not push, merge, deploy, publish, spend money, change credentials, or perform external consequential actions.';
  }
  if (authority === 'prepare_pr') {
    return 'You may edit, test and prepare a reviewable local change/PR handoff inside the current isolated branch/worktree. Do not merge, deploy, publish, spend money, change credentials, or perform external consequential actions.';
  }
  throw new Error(`Unsupported authority: ${authority}`);
}

function commandFor(harness, prompt, authority) {
  const guardedPrompt = `${prompt}\n\nBUILDERDOO EXECUTION BOUNDARY\n${authorityRules(authority)}`;
  if (harness === 'grok') {
    const args = ['--no-auto-update', '-p', guardedPrompt, '--output-format', 'streaming-json'];
    if (authority === 'plan_only') args.push('--deny', 'Edit', '--deny', 'Bash');
    return { command: 'grok', args };
  }
  if (harness === 'claude') {
    const args = ['-p', guardedPrompt, '--output-format', 'stream-json', '--max-turns', '24'];
    if (authority === 'plan_only') args.push('--permission-mode', 'plan');
    return { command: 'claude', args };
  }
  return { command: 'codex', args: ['exec', '--json', guardedPrompt] };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const repo = path.resolve(args.repo);
  await access(path.join(repo, 'AGENTS.md'));
  await access(path.join(repo, 'START_HERE.md'));

  let prompt = args.prompt.trim();
  if (!prompt && args.promptFile) prompt = (await readFile(path.resolve(args.promptFile), 'utf8')).trim();
  if (!prompt) throw new Error('Pass --prompt or --prompt-file with the portable Builderdoo handoff.');

  const harness = chooseHarness(args.harness);
  const launch = commandFor(harness, prompt, args.authority);

  console.error(`Builderdoo runner · harness=${harness} · authority=${args.authority}`);
  console.error(`repo=${repo}`);
  console.error(`command=${launch.command} ${launch.args.map((value) => value.includes(' ') ? JSON.stringify(value) : value).join(' ')}`);

  if (!args.execute) {
    console.error('\nDry run only. Re-run with --execute after reviewing the harness, repo and authority above.');
    return;
  }

  const child = spawn(launch.command, launch.args, {
    cwd: repo,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', (error) => {
    console.error(`Builderdoo could not launch ${harness}:`, error.message);
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    if (signal) console.error(`Builderdoo runner stopped by ${signal}`);
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}

main().catch((error) => {
  console.error(`Builderdoo runner: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
