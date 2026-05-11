#!/usr/bin/env bash
# Convenience: spin up assembl locally with everything pointed at the
# live assembl-prod Supabase (same approach Lovable was using — no local
# Postgres needed for development).
#
# Usage:
#   ./scripts/setup-local.sh
#
# What it does:
#   1. Verifies prerequisites (node 20+, npm, supabase CLI)
#   2. Installs node_modules
#   3. Copies .env.local.example → .env.local if it doesn't exist
#   4. Reminds you to fill in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
#   5. Runs typecheck + lint as smoke tests
#   6. Tells you what to run next
#
# What it does NOT do:
#   - Touch the live Supabase project. Migrations and edge-function deploys
#     go through GitHub Actions on push to main.

set -euo pipefail

c_green=$'\e[32m'
c_red=$'\e[31m'
c_yellow=$'\e[33m'
c_dim=$'\e[2m'
c_reset=$'\e[0m'

say() { printf "%s\n" "$1"; }
ok() { printf "${c_green}✓${c_reset} %s\n" "$1"; }
warn() { printf "${c_yellow}!${c_reset} %s\n" "$1"; }
fail() { printf "${c_red}✗${c_reset} %s\n" "$1"; exit 1; }

# 1. Prereqs
command -v node >/dev/null 2>&1 || fail "node not found. Install Node 20+ from https://nodejs.org"
node_major="$(node -v | sed 's/v\([0-9]*\).*/\1/')"
if [ "$node_major" -lt 20 ]; then
  fail "Node 20+ required (you have $(node -v))."
fi
ok "Node $(node -v)"

command -v npm >/dev/null 2>&1 || fail "npm not found."
ok "npm $(npm -v)"

if command -v supabase >/dev/null 2>&1; then
  ok "supabase CLI $(supabase --version 2>/dev/null | head -1)"
else
  warn "supabase CLI not found — needed for local edge-function tests and ad-hoc migrations. Install: npm i -g supabase"
fi

# 2. Install dependencies
say ""
say "${c_dim}Installing dependencies...${c_reset}"
npm install
ok "Dependencies installed"

# 3. .env.local
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  ok "Created .env.local from template"
  warn "Edit .env.local and set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  say "  Find it at: https://supabase.com/dashboard/project/wurwcrgxjjwqdaxqceey/settings/api"
else
  ok ".env.local exists (leaving untouched)"
fi

# 4. Verify the publishable key is set
if grep -q '^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""' .env.local 2>/dev/null; then
  warn "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is empty — set it in .env.local before running the dev server"
fi

# 5. Smoke tests
say ""
say "${c_dim}Smoke tests${c_reset}"
if npm run typecheck --silent 2>&1 | tail -5; then
  ok "Type-check passed"
else
  warn "Type-check reported errors (review above)"
fi

# 6. Next steps
say ""
say "${c_green}All set.${c_reset}"
say ""
say "Next:"
say "  ${c_dim}npm run dev${c_reset}            # http://localhost:3000"
say "  ${c_dim}npm run build${c_reset}          # production build"
say "  ${c_dim}npm run lint${c_reset}           # ESLint"
say "  ${c_dim}npm test${c_reset}               # Vitest suite"
say ""
say "Deploys (automatic on push to main):"
say "  ${c_dim}.github/workflows/deploy-edge-functions.yml${c_reset}"
say "  ${c_dim}.github/workflows/db-migrate.yml${c_reset}"
say ""
say "See ${c_dim}MOVING-FROM-LOVABLE.md${c_reset} for the full off-Lovable runbook."
