# Secure TypeSafe setup and first real DO run

## What has and has not been configured

The original pilot PR #1359 was merged on 18 September 2026 (New Zealand time). Its live `/api/do/decision` route responded `401 {"signedIn":false,"ready":false}` to an unauthenticated check. That proves the route/auth boundary, not a configured key or successful model call.

This agent has not received your early-access key, changed hosting secrets or verified your signed-in Assembl UUID. The available Vercel connector has no environment-variable write action. Do not paste the key into chat, GitHub, source code, a browser demo field or a screenshot.

## 1. enter the secret in Vercel

Open [the project's secure environment-variable settings](https://vercel.com/katecoveny-svgs-projects/assemblnz-f0afd79d/settings/environment-variables).

Project: `assemblnz-f0afd79d` (`prj_0pfAzWeZkMqgS6QAqO7c2BNwuZiR`). Team: `katecoveny-svgs-projects`.

For the new workflow review, choose **Preview**, preferably restricted to branch `feat/do-everywhere-typesafe-workflow-20260918`:

| Name | Value |
|---|---|
| `TYPESAFE_API_KEY` | Enter the early-access key in the hosting secret field; mark sensitive |
| `TYPESAFE_ENABLED` | `true` |
| `TYPESAFE_PILOT_USER_IDS` | Your signed-in Assembl UUID; see step 2 |
| `TYPESAFE_MODEL` | Optional: `jev-1.13.0` (the code default) |
| `TYPESAFE_REVIEW_THRESHOLD` | Optional: `0.75` (provisional, not calibrated) |

Do not add a `NEXT_PUBLIC_` prefix. Preview and Production settings are separate. Do not enable Production as a shortcut to testing a review branch.

## 2. identify the correct account

Open the preview `/do/typesafe`, choose **Use live TypeSafe** and follow **Sign in to DO**. Vercel's preview-access sign-in and Assembl's own sign-in are two different gates. The setup panel displays your own authenticated Assembl UUID; copy that value into the pilot allowlist. Do not use a TypeSafe account ID, GitHub ID or email address instead.

Ensure the preview host is permitted by the existing Supabase authentication redirect configuration. Do not weaken the authentication configuration globally to fix one preview.

## 3. redeploy and verify

Redeploy the same review branch after changing environment values. Reload the pilot and choose live mode. The panel distinguishes key present, flag enabled and account allowed. `ready` means configured, not that the credential has already passed an API test.

First run the included fictional context with TypeSafe consent only. Review the real response or the actual credential/provider error. Never substitute rehearsal output for a live call.

## 4. run the actual DO preparation bridge

On the deployment containing this branch, also tick **Also prepare through DO**. This is separate permission to use the approved source/request with the existing configured preparation providers. Those providers may include Anthropic, OpenAI, Google or Groq through the current model router. No new provider credential is stored by this integration; the existing DO runtime must already be configured.

Click **Choose with TypeSafe. Prepare with DO**. The workflow asks TypeSafe for a fresh decision, then calls DO's existing brief, plan or exact-extraction handler. Unsupported/uncertain decisions do not enter drafting. Exact extraction does not call a writing model. Review the source claim result separately from the newly generated draft.

A successful run should show:

- The actual TypeSafe response/model and trace.
- DO preparation state `prepared`, a real DO draft or exact extraction, and its preparation receipt.
- Explicit review required, not independently verified, not saved and no external action.

If drafting or task reservation fails after a successful TypeSafe decision, that decision is retained with a failed preparation state. Authentication and rate checks run before TypeSafe and can block the entire request. Nothing is silently simulated. Downloading a draft or private proof packet is not a save to a client or Assembl database record.

## Scope still to implement

Vision, authenticated browser/native bridging, durable client/Assembl records, real hosted Pursuit-hub integration, sending and publishing remain tracked in [issue #1360](https://github.com/katecoveny-svg/assemblnz-f0afd79d/issues/1360). They are not unlocked merely by adding the TypeSafe key.

## References

TypeSafe API: https://docs.typesafe.ai/api
TypeSafe models: https://docs.typesafe.ai/models
Vercel preview scoping: https://vercel.com/docs/environment-variables/manage-across-environments
Vercel sensitive variables: https://vercel.com/docs/environment-variables/sensitive-environment-variables
