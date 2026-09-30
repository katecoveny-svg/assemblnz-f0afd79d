# OpenAI Agents API and Sign in with ChatGPT — assembl integration brief

Verified against official documentation on 30 September 2026. This is a technical
and application brief, not confirmation that assembl has partner access.

## What the Agents API adds

The Agents API manages agent sessions and can provide an OpenAI-hosted browser
through computer use. Assembl can start a session, follow events, handle website
access/sign-in requests, inspect saved browser activity and delete the session.
The existing Agents SDK package in this repo is not proof that this newer hosted
API has already been integrated or enabled for the account.

For DO, retain the job ID, owner, permissions, approval and evidence in Assembl.
Use the hosted browser for one bounded task where a supported direct API is
unavailable. Start with research or document preparation, then request a human
handoff for sign-in. Stop before sending, purchasing or submitting; the existing
approval boundary remains authoritative. Store the session ID and returned
artifacts against the job, record failure/uncertainty, and provide cancellation
and deletion. Meter session/model/browser costs against a per-job budget.

“Their computer” can mean two different things:

- **OpenAI's hosted computer:** documented browser capability of Agents API.
  This is the quickest route for DO to work in an isolated browser session.
- **A customer's actual computer or phone:** this API alone does not confer
  local access. It needs a separately installed and explicitly permitted local
  companion/extension and supported platform capabilities. An iPhone keyboard
  does not become a general background device controller through this API.

Production acceptance: create one session with assembl's authorised API account;
exercise permitted website navigation and sign-in handoff; observe events;
cancel it; inspect evidence; confirm no external action occurred without approval.
Credentials, session access and billing must be supplied through secure project
configuration. No live hosted-computer session was executed by this build.

Sources:
- https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use
- https://developers.openai.com/api/docs/guides/agents-api

## Pursuing Sign in with ChatGPT

OpenAI currently offers it to selected commercial partners and directs applicants
to an interest form. Request a registered client ID. Do not display a working
sign-in button or invent a client ID while waiting.

Application text for Kate to review:

> assembl is a New Zealand platform that turns live business signals into governed
> agentic work. Pursuit finds meaningful changes and opportunities. DO assembles
> the context, agents, tools and permissions to act, with human approval for
> consequential steps and evidence of what happened. Studio turns that work into
> demonstrations, proposals and customer experiences.
>
> We want Sign in with ChatGPT to make account creation and access to assembl DO
> simpler, and to connect the same identity to our authenticated enquiry-workflow
> plugin. Our first pilot prepares customer replies, asks the owner to approve
> sending, and records the provider receipt and subsequent outcomes. We retain
> per-user access controls and explicit approval for external actions.
>
> We would like commercial partner access for a remotely hosted SaaS product.
> Please confirm the available identity scopes, web/plugin account-linking path,
> registration requirements and whether any ChatGPT-plan usage entitlement is
> available for this commercial deployment. We do not assume plan usage or access
> to ChatGPT conversation history is included with sign-in.

Website: https://www.assembl.co.nz
Proposed production callback to register: `https://www.assembl.co.nz/auth/chatgpt/callback`.
This callback is reserved in the plan, not implemented or registered yet. Supply
a separate exact staging callback once the staging origin is chosen. Kate should
supply the contact email and company/legal particulars requested by the form;
this brief does not invent registration details.

When approved, use a maintained OIDC library for Authorization Code + PKCE,
state and nonce. Receive the assigned `oaiapp_` client ID, exact redirect URIs,
issuer/discovery configuration, authentication method and any client secret.
Verify ID-token signature, issuer, audience, expiry and nonce; bind to a durable
one-time login transaction. Link an existing Assembl account only after explicit
proof of ownership, using verified issuer/client/subject identity. Do not merge
accounts based solely on a matching email. Create the existing Assembl session
and keep Supabase ownership/RLS intact. Add logout, unlink and revocation tests.

Sign-in, the Assembl MCP OAuth connection, and use of a ChatGPT subscription for
model inference are separate capabilities. Ask OpenAI about each for assembl's
commercial hosted use case. A successful identity login is not an API budget.

Sources and application entry:
- https://developers.openai.com/siwc/request-client-id
- https://developers.openai.com/siwc/website
- https://developers.openai.com/siwc/token-sharing-open-source

The interest form has not been submitted. Approval, a registered client ID and a
verified live callback are still required before customer rollout.
