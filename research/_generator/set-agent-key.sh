#!/usr/bin/env bash
#
# set-agent-key.sh — put the real Anthropic key on every live concept-demo
# Pages project, so the demo agents answer on claude-opus-5 instead of falling
# through to the Workers AI llama.
#
# WHY THIS IS A SCRIPT AND NOT SOMETHING CLAUDE RAN
# Claude Code's permission classifier blocks a command that reads a credentials
# file and pipes it to a network tool — correctly, since that is exactly the
# shape of an exfiltration. So the key never passes through Claude. It goes
# from your own secrets file into wrangler's stdin, on your machine.
#
# WHAT IT CHANGES
# Every project's functions/api/agent.js already prefers Anthropic and already
# names claude-opus-5. Only the secret is missing. Setting it flips
# GET /api/agent from anthropic_key_present:false to true, and POST answers
# start coming back with backend "claude-opus-5" instead of "workers-ai".
#
# WORTH KNOWING BEFORE YOU RUN IT
# These /api/agent endpoints are public and unauthenticated. The in-code rate
# limit is per-isolate and its own comment calls it "a speed bump rather than a
# wall". So this key is now spendable by anyone who finds a demo URL. That is a
# real exposure and it is the reason Claude flagged it rather than just doing
# it. If you want it narrowed, run it with a list of projects instead of all of
# them (see USAGE), or put a Turnstile in front of /api/agent first.
#
# USAGE
#   ./set-agent-key.sh                      # all live demo projects
#   ./set-agent-key.sh assembling-tower assembling-summerset   # just these
#   SECRETS=/path/to/other.json ./set-agent-key.sh
#
# ROLLBACK
#   npx wrangler pages secret delete ANTHROPIC_API_KEY --project-name <proj>

set -euo pipefail

SECRETS="${SECRETS:-$HOME/Downloads/assembl-secrets-backup.json}"

if [[ ! -f "$SECRETS" ]]; then
  echo "✗ secrets file not found: $SECRETS" >&2
  echo "  point SECRETS at the right file and re-run." >&2
  exit 1
fi

# Read once, into a shell-local variable. Never echoed, never logged.
KEY="$(python3 -c "
import json, sys
try:
    d = json.load(open('$SECRETS'))
except Exception as e:
    sys.exit('cannot parse secrets file: %s' % e)
k = d.get('secrets', {}).get('ANTHROPIC_API_KEY', '')
if not k:
    sys.exit('no secrets.ANTHROPIC_API_KEY in the file')
sys.stdout.write(k)
")"

# Sanity-check the shape without ever showing it. A real key is ~108 chars and
# starts sk-ant; a truncated paste is the most common failure and it fails
# silently at request time, which is the worst way to find out.
if [[ ${#KEY} -lt 90 || "${KEY:0:6}" != "sk-ant" ]]; then
  echo "✗ that does not look like an Anthropic key (length ${#KEY}, expected ~108 and an sk-ant prefix)" >&2
  exit 1
fi
echo "✓ key looks well-formed (length ${#KEY})"

# The live projects. Passed args win, so you can narrow the blast radius.
if [[ $# -gt 0 ]]; then
  PROJECTS=("$@")
else
  PROJECTS=(
    assembling-roomcheck
    assembling-woolworths-rewards
    assembling-ryman-family
    assembling-summerset
    assembling-tower
    assembling-airnz
    assembling-contact
    assembling-concept
    assembling-giltrap
    assembling-nzpost
    assembling-aig
    assembling-southern-cross
    assembling-trademe
    assembling-nectar
    assembling-instant-finance
    assembling-myfoodbag
    assembling-electrickiwi
    assembling-hnry
    assembling-sharesies
    assembling-construction
    assembling-ryman
    assembling-demo-retirement
    assembling-demo-airline
    assembling-demo-grocery
    assembling-demo-energy
    assembling-demo-banking
  )
fi

echo "→ setting ANTHROPIC_API_KEY on ${#PROJECTS[@]} project(s)"
echo

FAILED=()
for p in "${PROJECTS[@]}"; do
  printf '%-34s ' "$p"
  if printf '%s' "$KEY" | npx wrangler pages secret put ANTHROPIC_API_KEY \
       --project-name "$p" >/dev/null 2>&1; then
    echo "set"
  else
    echo "FAILED"
    FAILED+=("$p")
  fi
done

unset KEY

echo
echo "── verifying (the health endpoint reports presence and length, never the key) ──"
for p in "${PROJECTS[@]}"; do
  printf '%-34s ' "$p"
  EP=/api/agent
  [[ "$p" == "assembling-roomcheck" ]] && EP=/api/plan
  curl -s -m 15 "https://$p.pages.dev$EP" \
    | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    print('no health endpoint on this build (older agent.js — GET falls through to the page)')
    raise SystemExit
print('key_present=%s len=%s model=%s' % (
    d.get('anthropic_key_present'), d.get('key_length'), d.get('model')))
" 2>/dev/null || echo "unreachable"
done

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo
  echo "✗ failed on: ${FAILED[*]}"
  echo "  usually means the project name is wrong or wrangler needs a re-login:"
  echo "    npx wrangler login"
  exit 1
fi

echo
echo "Secrets set. NOW REDEPLOY — this part is not optional."
echo
echo "A Pages secret binds to a DEPLOYMENT, not to the project. Running this script"
echo "alone left 20 of 25 projects still answering on the Workers AI fallback until"
echo "each one was redeployed. To bind them all:"
echo
echo "  cd ~/assembl-web/research"
echo "  for d in assembling-*/; do (cd \"\$d\" && npx wrangler pages deploy . \\"
echo "    --project-name \"\${d%/}\" --branch main --commit-dirty=true >/dev/null 2>&1 \\"
echo "    && echo \"\${d%/} ok\"); done"
echo
echo "Three projects have a production branch that is NOT main — assembling-airnz,"
echo "assembling-contact and assembling-concept use the project name as the branch."
echo "Deploying those with --branch main reports success and changes nothing."
echo
echo "Older builds without the GET handler will still work; they just cannot"
echo "report their own health. To confirm one of those, POST to it:"
echo "  curl -s -X POST https://<proj>.pages.dev/api/agent \\"
echo "    -H 'content-type: application/json' \\"
echo "    -d '{\"agent\":\"concept\",\"message\":\"what would you never do?\"}' | head -c 300"
echo "and look for \"backend\":\"claude-opus-5\"."
