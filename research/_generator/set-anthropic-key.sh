#!/usr/bin/env bash
# One paste, everything wired.
#
#   bash ~/assembl-web/research/_generator/set-anthropic-key.sh
#
# You paste each key once at a hidden prompt in your own terminal. It is held
# in a shell variable for the length of this run, piped straight into each
# provider's CLI over stdin, and never printed, logged or written to a file.
#
# It validates before it sets anything — the last outage was caused by eight
# keys concatenated into one value, and by a key pasted into the NAME field
# (secret names are not encrypted). Both are checked for here.

set -uo pipefail

CF_PROJECTS=(
  assembling-giltrap
  assembling-southern-cross
  assembling-nzpost
  assembling-aig
  assembling-trademe
)
RESEARCH="$HOME/assembl-web/research"

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; }

# ── read + validate ───────────────────────────────────────────────────────────
read_key() {                     # $1 = label, $2 = expected prefix, $3 = var name
  local label="$1" prefix="$2" __var="$3" value=""
  # A real masked box on macOS. The value goes straight from the dialog into a
  # shell variable — it is never echoed to the terminal or written to disk.
  if command -v osascript >/dev/null 2>&1; then
    value=$(osascript <<OSA 2>/dev/null
try
  set r to display dialog "Paste the $label.

It goes straight to Cloudflare and Vercel. It is never shown, saved or logged." ¬
    default answer "" with hidden answer ¬
    with title "assembl — set a key" ¬
    buttons {"Skip", "Set it"} default button "Set it" with icon note
  if button returned of r is "Skip" then return ""
  return text returned of r
on error
  return ""
end try
OSA
)
  else
    printf 'Paste the %s (hidden), then press return.\n> ' "$label"
    read -rs value; printf '\n'
  fi
  value="$(printf '%s' "$value" | tr -d '[:space:]')"   # kill stray newlines/spaces

  if [ -z "$value" ]; then bad "nothing entered"; return 1; fi
  case "$value" in "$prefix"*) ;; *) bad "does not start $prefix — wrong value?"; return 1 ;; esac

  # the one that broke production: several keys pasted end to end
  local occurrences
  occurrences=$(printf '%s' "$value" | grep -o "$prefix" | wc -l | tr -d ' ')
  if [ "$occurrences" -gt 1 ]; then
    bad "contains $occurrences keys joined together — paste ONE key only"; return 1
  fi
  if [ "${#value}" -gt 200 ]; then
    bad "length ${#value} is far too long for one key — paste ONE key only"; return 1
  fi

  ok "looks right — length ${#value}"
  printf -v "$__var" '%s' "$value"
}

bold "── keys ──"
read_key "Anthropic API key" "sk-ant-" ANTHROPIC || exit 1
printf '\nGemini key for the fallback? Press return alone to skip.\n'
read_key "Gemini API key" "AIza" GEMINI || GEMINI=""

# ── verify against the provider before storing it anywhere ────────────────────
bold "── checking the key actually works ──"
STATUS=$(printf '%s' "$ANTHROPIC" | ANTHROPIC_KEY_STDIN=1 python3 -c '
import sys,json,urllib.request,urllib.error
key=sys.stdin.read().strip()
req=urllib.request.Request("https://api.anthropic.com/v1/messages",
  data=json.dumps({"model":"claude-opus-5","max_tokens":8,
                   "messages":[{"role":"user","content":"ok"}]}).encode(),
  headers={"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"})
try:
    urllib.request.urlopen(req,timeout=40); print("OK")
except urllib.error.HTTPError as e:
    print(f"{e.code}:{json.loads(e.read()).get(chr(101)+chr(114)+chr(114)+chr(111)+chr(114),{}).get(chr(116)+chr(121)+chr(112)+chr(101),chr(63))}")
except Exception as ex: print(type(ex).__name__)
')
if [ "$STATUS" != "OK" ]; then
  bad "Anthropic rejected it ($STATUS) — nothing has been changed."
  echo "     Issue a fresh key at https://console.anthropic.com and run this again."
  unset ANTHROPIC GEMINI; exit 1
fi
ok "Anthropic accepted it on claude-opus-5"

# ── Cloudflare Pages ──────────────────────────────────────────────────────────
bold "── Cloudflare Pages ──"
for P in "${CF_PROJECTS[@]}"; do
  printf '  %-28s ' "$P"
  printf '%s' "$ANTHROPIC" | npx --yes wrangler pages secret put ANTHROPIC_API_KEY \
      --project-name "$P" >/dev/null 2>&1 && printf 'anthropic ' || printf 'ANTHROPIC-FAILED '
  if [ -n "$GEMINI" ]; then
    printf '%s' "$GEMINI" | npx --yes wrangler pages secret put GEMINI_API_KEY \
        --project-name "$P" >/dev/null 2>&1 && printf 'gemini ' || printf 'GEMINI-FAILED '
  fi
  # a Pages secret only takes effect on the next deploy
  ( cd "$RESEARCH/$P" 2>/dev/null && npx --yes wrangler pages deploy . \
      --project-name "$P" --branch main --commit-dirty=true >/dev/null 2>&1 )
  printf 'deployed\n'
done

# ── Vercel ────────────────────────────────────────────────────────────────────
bold "── Vercel ──"
cd "$HOME/assembl-web" || exit 1
for ENVIRONMENT in production preview development; do
  printf '  %-14s ' "$ENVIRONMENT"
  npx --yes vercel env rm ANTHROPIC_API_KEY "$ENVIRONMENT" --yes >/dev/null 2>&1
  printf '%s' "$ANTHROPIC" | npx --yes vercel env add ANTHROPIC_API_KEY "$ENVIRONMENT" >/dev/null 2>&1 \
    && printf 'set\n' || printf 'FAILED\n'
done
printf '  redeploying production… '
npx --yes vercel --prod >/dev/null 2>&1 && printf 'done\n' || printf 'FAILED — run: npx vercel --prod\n'

unset ANTHROPIC GEMINI

# ── prove it ──────────────────────────────────────────────────────────────────
bold "── verifying (a healthy key reads ~108) ──"
sleep 12
for P in "${CF_PROJECTS[@]}"; do
  printf '  %-28s ' "$P"
  curl -s --max-time 20 "https://$P.pages.dev/api/agent" | python3 -c '
import sys,json
try:
    d=json.load(sys.stdin)
    print(f"key_length={d[\"key_length\"]}  gemini={d[\"gemini_fallback\"]}  last_failure={d[\"last_failure\"]}")
except Exception: print("could not reach it")' 2>/dev/null || echo "unreachable"
done
printf '  %-28s ' "assembl.co.nz blueprint"
curl -s --max-time 25 "https://www.assembl.co.nz/api/agent-brief" | python3 -c '
import sys,json
try:
    d=json.load(sys.stdin); print(f"key_length={d[\"key_length\"]}  last_failure={d[\"last_failure\"]}")
except Exception: print("could not reach it")' 2>/dev/null || echo "unreachable"

echo
echo "Anything reading 864 did not take — rerun and check you paste ONE key."
