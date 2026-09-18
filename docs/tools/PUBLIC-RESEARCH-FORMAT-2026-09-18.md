# Source retrieval and presentation formatting

A second bounded real production test reached the local presentation-schema validator and failed with `research_schema_rejected`. Request e824febb-21ea-44e6-bb70-b1951e5a2f90, 18 September 2026 00:22 UTC. The exact field was not retained; do not claim which field failed. The trial was disabled immediately afterwards. Knowledge HTTP/MCP calls succeeded.

This follow-up adds one optional formatting-only pass when the research output is valid JSON but does not match the original Draft schema. It uses the documented output_config.format JSON grammar WITHOUT web-search tools/citations in that formatting call. Anthropic documents native citations and structured outputs as incompatible. The original local length, field and source checks remain in place. A formatted result may not introduce a new evidence URL beyond the original draft. No output is blindly truncated, no schema rules relaxed and no facts are declared independently verified.

Total research-provider calls remain capped at TWO per trial: if server-tool continuation used the second call, formatting is not retried. Formatting has a 28-second timeout and 2,000 output-token limit. Its tokens and call are included in the original receipt. TypeSafe remains separate, optional and currently disabled. No trial quota increase, billing or private knowledge exposure is included.

Tests cover provider payload separation, exactly one edit call, original length constraints and rejection of newly introduced sources. A successful test/mock build still requires a final actual public-company smoke test before claiming the trial works.

Primary implementation reference checked 18 September:
https://platform.claude.com/docs/en/build-with-claude/structured-outputs
