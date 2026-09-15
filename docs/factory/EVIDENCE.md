# assembl evidence convention

## Canonical location

For new repository/PR proof, use:

`pr-evidence/<branch-or-pr-slug>/`

Do not create new top-level evidence folders such as:
- `.pr-assets/`
- `.pr-screenshots/`
- `.pr-shots/`
- `.prshots/`

Those existing folders are historical cleanup candidates and should remain untouched until their references/history are verified.

## What belongs in pr-evidence

Use it for review evidence that is useful to a human reviewing a code change:

- before/after screenshots
- short recordings or links/metadata for recordings
- visual regression proof
- browser/runtime receipts
- focused output captures needed to validate a PR

Do not use it as a general media library, product asset store, research archive or generated-content dumping ground.

## Suggested structure

```text
pr-evidence/
  <pr-or-branch>/
    README.md
    before/
    after/
    runtime/
```

The per-change `README.md` should say:
- claim being proved
- how evidence was captured
- environment/route
- relevant test/check result
- known limitations

## Retention

Evidence attached to a merged PR can remain when it explains a meaningful product/architecture decision. Large transient artefacts should move to an appropriate external artefact store or be removed in a deliberate cleanup after the PR no longer needs them.

## Rule

One canonical evidence path going forward. Do not clean historical proof by breaking old review links.
