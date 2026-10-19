# tools/living-cad — assembl / living parametric CAD

`build.py` is the single source for engineering pack AL-02: nine parts on interface IF-01, exported as STEP and STL into `public/living/cad/AL-02/` with a validated manifest that `lib/living/catalogue.ts` reads.

```sh
pip install cadquery            # CadQuery ≥ 2.4
python3 tools/living-cad/build.py          # build, validate, export, write manifests
python3 tools/living-cad/build.py --check  # build and validate only
```

Validation on export: valid B-rep, one solid per part, edge-manifold STL. This is a digital check only; physical fit, strength and wall-mounting remain separate steps. Product canon: `docs/living/ASSEMBL-LIVING.md`.

Change a dimension → re-run → run `pnpm exec vitest run lib/living` → commit the regenerated exports and manifests together.
