# DO typed reply repair — 15 October 2026 NZDT

Production signed-in widget returned astra_generation_failed on a synthetic consented request after PR1600. Its catch deliberately hid raw errors but retained no categorical diagnostic, so the original provider failure cannot be reconstructed from that response alone.

## Reproduced request defect

An actual installed-SDK mocked HTTP test captured the Responses strict JSON schema: evidence had properties source/citation/quote but required only source/quote. The new regression failed before the fix. OpenAI requires every strict-schema field to be required, allowing null for absent values. The previous URL validator also emitted format:uri, outside the documented supported format list. [Official Structured Outputs contract](https://developers.openai.com/api/docs/guides/structured-outputs).

The provider-only schema now requires nullable citation and avoids URI format on the wire. Only null is normalized to absence. The unchanged domain schema still checks URL syntax and all existing evidence/source matching, route and next-step constraints. This is a reproduced request-contract defect, not retrospective proof of the original live failure's cause.

## Diagnostics and authority

Server warning do_text_generation_failed uses a closed category (provider HTTP, timeout, structured/empty output, wrong model, incomplete output, schema/evidence validation or unknown provider/SDK), optional bounded numeric HTTP status, generated diagnostic UUID and elapsed milliseconds. It never logs exceptions, causes, response bodies, prompts, output, URLs, headers, owner identity or credentials. User-facing error remains sanitized. Caller cancellation still exits without this warning.

No provider/model/effort fallback, token-limit increase, automatic retry, new entitlement, environment change or weakened validation. GPT-6 Astra medium, store:false, maxRetries:0 and existing owner admission/budget remain intact.

## Proof and remaining acceptance

19 focused tests passed: actual SDK request serialization, successful synthetic structured response/null normalization, invalid URL, fabricated quote, wrong model and incomplete finish rejection; diagnostic privacy and HTTP status; existing assistant boundaries. TypeScript and scoped ESLint passed. The full CI DO core command passed locally: 172 test files, 1,874 tests (one file/two tests skipped). Existing provider mocks now include the required nullable citation, including the forged-evidence fixture so it still reaches evidence validation. Hosted production build/release checks are recorded in PR.

After deployment, use the existing signed-in widget and explicit sharing consent for one short synthetic draft request within the existing allowance. Success must render a validated Astra draft. If it fails, inspect only the new sanitized diagnostic category/status; do not expose provider response bodies or widen model/budget policy. Local tests do not establish live provider acceptance.
