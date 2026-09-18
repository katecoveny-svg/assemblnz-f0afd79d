# Clean reconciliation after duplicate PRs

This branch starts from main 038adaf. It carries download tests and concrete supporting DO copy from #1370; binary mirrors are regenerated from current source, not copied from an older branch. Portable test output explicitly uses TAP. No runtime validation is weakened and no current research parser/formatting, quota, consent or TypeSafe configuration is replaced.

The accepted DO headline and small-agent positioning remain unchanged. A first attempt to carry an alternative headline correctly failed the front-door brand guard; the unrelated headline change was removed rather than weakening that guard. The supporting task/context/review copy is preserved.

PR #1377 duplicated exact head dd44b57 already squashed in #1371 and was closed. After this repair is tested and merged, close #1370 as superseded by the current research fixes (#1371/#1372) plus this packaging/supporting-copy change. Do not create new PRs from these already-squashed branches.

Definition of done: full DO core suite, research regression tests, typecheck, production build, 375/1440 rendered DO copy. Current 1.6.0 static mirrors must match the API and source byte for byte apart from their root README. Actual native installation and browser permission behaviour are separate device checks.

The Franklin office scene is separate art/runtime integration work; successful packaging is not evidence that the new hero has shipped.
