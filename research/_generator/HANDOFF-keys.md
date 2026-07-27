# Handoff — wire the API keys and verify

**For:** Cowork, or anyone with terminal access on Kate's machine
**Time:** about three minutes, most of it waiting for deploys
**Why it can't be fully automated:** the key has to be revealed once. Nothing on
the machine has it — Vercel marks it sensitive and returns `[SENSITIVE]` on
pull, and Cloudflare Pages secrets cannot be read back at all.

---

## Just do this

```bash
bash ~/assembl-web/research/_generator/set-anthropic-key.sh
```

A masked dialog box appears. Paste the Anthropic key, then the Gemini key (or
Skip). Everything after that is automatic: validate → test against Anthropic →
set on 5 Cloudflare projects and 3 Vercel environments → redeploy all → verify.

Get the keys from:
- Anthropic — https://console.anthropic.com → API keys
- Gemini — https://aistudio.google.com/apikey

---

## What "working" looks like

Every line should read `key_length=108`. The script prints this at the end, or
check any time:

```bash
curl -s https://www.assembl.co.nz/api/agent-brief
curl -s https://assembling-giltrap.pages.dev/api/agent
```

```json
{ "key_length": 108, "last_failure": null, "gemini_fallback": true }
```

| Reading | Meaning |
|---|---|
| `key_length: 108` | correct |
| `key_length: 864` | several keys concatenated — the paste went in more than once |
| `key_length: 0` | not set, or the project was not redeployed |
| `last_failure: "401:authentication_error"` | key present but rejected — revoked or wrong |
| `last_failure: "… answered by gemini instead"` | Claude failed, Gemini covered it |

---

## Two traps that already bit us

**1. The key went into the NAME field.** `wrangler pages secret put ANTHROPIC_API_KEY`
takes the *name* as the argument and asks for the value at a prompt. A key put in
the name slot is stored unencrypted and printed in full by `wrangler pages secret
list`. **A key that has ever been a secret name must be treated as compromised
and rotated.** The script cannot make this mistake.

**2. Eight keys concatenated.** Repeated `vercel env add` appended rather than
replaced, producing an 864-character value that 401'd everywhere. The script
counts `sk-ant-` occurrences and refuses more than one.

---

## If something still fails

Env changes **only take effect on the next deploy**, on both platforms.

```bash
# Cloudflare — per project
cd ~/assembl-web/research/assembling-giltrap
npx wrangler pages deploy . --project-name assembling-giltrap --branch main --commit-dirty=true

# Vercel
cd ~/assembl-web && npx vercel --prod
```

Check which account wrangler is on — secrets set on the wrong account go nowhere:

```bash
npx wrangler whoami          # expect assembl@assembl.co.nz
```

---

## What this switches on

**The model ladder** — Opus 5 → Gemini 2.5 Flash → Workers AI → each page's own
written answers. Each rung is tried when the one above *fails*, not only when its
key is missing. A key that is present but rejected falls through too; that was
the bug that made the demos answer with nothing at all.

**Surfaces affected**

| Surface | What breaks without a key |
|---|---|
| `assembl.co.nz` "put your website in" | returns "didn't come back cleanly" to every visitor |
| 5 concept demos | agents answer from the fallback, which is not good enough to send to a buyer |

**Do not send demo links to a named buyer until `last_failure` is `null`.** The
fallback model called the Giltrap concept "a futuristic vehicle design" — fine as
a safety net, wrong in front of a dealer principal.

---

## Cost note

Opus 5 sits on public endpoints. Guards in place: 30 requests per IP per hour on
the demo agent, 30 per hour on the blueprint. Pages isolates are ephemeral so
these are speed bumps, not hard walls. If a link is shared widely, consider
dropping the demo agents to Sonnet and keeping Opus 5 for the blueprint.
