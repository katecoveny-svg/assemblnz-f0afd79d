#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Official provider-specific installer. No global install or provider account.
npx --yes impeccable@4.5.2 install --providers=codex --scope=project
npx --yes rea-agents@6.4.0 --help
echo 'Reload Codex, inspect /skills, and approve the project hook in /hooks if prompted.'
