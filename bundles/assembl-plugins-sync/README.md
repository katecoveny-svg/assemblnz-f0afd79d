# assembl-plugins → agent_prompts sync (copy-paste bundle)

This bundle is meant to live in the **`katecoveny-svg/assembl-plugins`** repo,
not in this app repo. Lovable Cloud can't push to a different GitHub repo, so
Cowork (or Kate) drops these two files into a local clone of `assembl-plugins`,
commits, and pushes.

## Repo layout this script assumes

The `assembl-plugins` repo holds plugins as top-level kete folders, with
optional one-level nesting for sub-plugins (e.g. `toro/term-planner`):

```
assembl-plugins/
├── pikau-customs-broker/
│   ├── agent.yaml
│   └── system-prompt.md
├── manaaki-front-of-house/
│   ├── agent.yaml
│   └── system-prompt.md
├── toro/
│   ├── kid-money/
│   │   ├── agent.yaml
│   │   └── system-prompt.md
│   ├── term-planner/
│   │   ├── agent.yaml
│   │   └── system-prompt.md
│   └── holiday-ideas/
│       ├── agent.yaml
│       └── system-prompt.md
└── ...
```

The script scans **two levels**:

1. Any top-level dir with `agent.yaml` is treated as a plugin.
2. Otherwise, descend one level — each subdir with `agent.yaml` is a plugin.

`pack` is derived from the slug prefix (before the first `-`), with a
single-word slug (e.g. `kid-money` lives under `toro/`) using the **parent
folder** as the pack when present. `kid-money` → `pack=toro` because the
parent dir is `toro/`. `pikau-customs-broker` → `pack=pikau` from slug prefix.

## Files in this bundle

- `scripts/sync-plugins-to-agent-prompts.mjs` — Node ESM script, no deps but
  `@supabase/supabase-js` (installed in the workflow).
- `.github/workflows/sync-plugins-to-agent-prompts.yml` — runs on push to
  `main` when any plugin file changes; manual `workflow_dispatch` supports
  `dry_run` + `only` filter.

## Required GitHub secrets in `assembl-plugins`

Settings → Secrets and variables → Actions:

- `SUPABASE_URL` = `https://ssaxxdkxzrvkdjsanhei.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = service-role key for that project (Lovable
  Cloud → Backend → Settings → API)

## Drop-in steps

```bash
cd /path/to/assembl-plugins
mkdir -p scripts .github/workflows
cp /path/to/this/bundle/scripts/sync-plugins-to-agent-prompts.mjs scripts/
cp /path/to/this/bundle/.github/workflows/sync-plugins-to-agent-prompts.yml .github/workflows/
git add scripts/sync-plugins-to-agent-prompts.mjs .github/workflows/sync-plugins-to-agent-prompts.yml
git commit -m "ci: sync plugin manifests to agent_prompts on push to main"
git push origin main
```

First push will trigger the workflow. Recommend running once via
`workflow_dispatch` with `dry_run=true` first to verify the diff.
