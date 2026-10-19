# tools/living-cad — assembl living parts library v0.3

The parametric source for the assembl TURN standard and every assembl living and dayrally part, the build and fit-test scripts, the test-print kit and the launch files. Upstream notes are in `UPSTREAM-README-v0.3.md`; product canon is `docs/living/ASSEMBL-LIVING.md`.

```sh
pip install manifold3d trimesh numpy fonttools
python3 cad/build.py            # grid, tile, stack, light → parts/stl, parts/glb, parts/parts-report.json
python3 cad/build_extras.py     # cut-out tray, renter parts → parts/parts-report-extras.json
python3 cad/build_dayrally.py   # dayrally v1 + bike → parts/parts-report-dayrally.json
python3 cad/build_dayrally2.py  # dayrally v2 → parts/parts-report-dayrally2.json (needs store/model/ to exist)
python3 cad/test_kit.py         # parts/test-kit
python3 cad/fit_test.py && python3 cad/fit_test_dayrally.py && python3 cad/fit_test_dayrally2.py
cd ../.. && python3 tools/living-cad/manifest.py   # lib/living/cad-manifest.json + public/living/cad/v0.3
```

Change a number in `cad/lib.py` → rebuild → `pnpm exec vitest run lib/living` → commit the regenerated reports, manifest and served print files together. Generated meshes are ignored except the served set that `manifest.py` copies.

Local change from upstream: `build_extras.py` and `build_dayrally.py` write their own report files instead of overwriting `parts-report.json`, so all four reports survive a full rebuild.
