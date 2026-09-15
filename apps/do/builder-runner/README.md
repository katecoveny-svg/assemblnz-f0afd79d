# Builderdoo local runner

This is the first execution bridge between a Builderdoo job and a repo-capable coding harness on your own Mac.

Builderdoo owns the **job contract, Assembl context, authority boundary and proof requirements**. The coding harness is replaceable.

Supported harnesses in this first slice:

- Grok Build (`grok`)
- Claude Code (`claude`)
- Codex CLI (`codex`)

The runner does **not** store provider credentials, GitHub PATs or passwords. Authenticate the chosen CLI through its own supported login/configuration flow.

## 1. work in an isolated branch or worktree

Do not run Builderdoo against a dirty `main` checkout.

Create or enter a dedicated branch/worktree using your normal repo workflow first.

## 2. get the portable handoff

Open `/do/builder`, plan a job and choose **copy builder handoff**.

Save that text to a local file, for example:

```bash
pbpaste > /tmp/builderdoo-job.txt
```

Review the file before execution. It should contain the objective, canonical context, capability route, definition of done, proof requirements and authority boundary — never API keys or passwords.

## 3. dry-run the runner

From the Assembl repo:

```bash
node apps/do/builder-runner/runner.mjs \
  --harness auto \
  --repo . \
  --prompt-file /tmp/builderdoo-job.txt \
  --authority prepare_pr
```

Without `--execute`, nothing is launched. Builderdoo prints the selected harness, repo and command so you can inspect them.

Choose a specific harness when useful:

```bash
--harness grok
--harness claude
--harness codex
```

## 4. execute only after reviewing the boundary

```bash
node apps/do/builder-runner/runner.mjs \
  --harness grok \
  --repo . \
  --prompt-file /tmp/builderdoo-job.txt \
  --authority prepare_pr \
  --execute
```

Authority modes:

- `plan_only` — inspect and plan only; no file edits/mutating commands
- `branch_and_build` — may edit/test inside the current isolated branch/worktree; no push/merge/deploy
- `prepare_pr` — may edit/test and prepare a reviewable change/PR handoff; no merge/deploy

The runner deliberately does **not** add blanket `always approve` / `skip permissions` flags. The harness's normal tool/permission controls remain in force.

## Current limits

- This runner does not yet create/manage worktrees for you.
- It does not create GitHub PRs itself yet.
- It does not persist job progress back into DO Office yet.
- Codex headless execution may depend on the exact installed CLI version and terminal environment. Because the runner inherits your terminal stdio, it avoids intentionally detaching the process; use another supported harness if a local Codex version is unstable in headless mode.
- Provider/model routing displayed by `/do/builder` is the Assembl intelligence recommendation. The selected local harness may still have its own model configuration. A later executor adapter will pass the routed model preference when the harness supports it cleanly.

## next

The durable target is:

`Builderdoo job → isolated executor → live progress → proof → reviewable PR → DO Office receipt`

The local runner is the first safe bridge toward that loop.
