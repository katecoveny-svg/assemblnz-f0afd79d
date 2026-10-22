# Slicing with Bambu Studio: real grams, real print time, plates for a print farm

**Status: added 22 October 2026.** Every served print file is sliced by Bambu Studio's own command line. The slicer's
grams and print minutes replace the mesh estimates in the cost model (`tools/living-cad/launch/cost_model.py`), the
builder's prices (`lib/living/costing.ts`) and the product widget's print time (`lib/living/widget.ts`). Per-product
plate projects (`.3mf`) are built for a print farm to open, check and print.

Profiles: Bambu Lab X1 Carbon, 0.4 mm hardened nozzle (it prints every material in the catalogue, carbon-fibre
included); 0.20 mm Standard; textured PEI plate. Filaments are Bambu's own system profiles:

| our material | Bambu filament profile |
|---|---|
| PLA Matte | Bambu PLA Matte @BBL X1C |
| PETG | Bambu PETG HF @BBL X1C |
| PETG-CF | Bambu PETG-CF @BBL X1C 0.4 nozzle |
| PPA-CF / PA12-CF / PA-CF | Bambu PAHT-CF @BBL X1C (the closest system nylon-CF) |
| TPU 95A | Bambu TPU 95A HF @BBL X1C |
| ASA | Bambu ASA @BBL X1C 0.4 nozzle |

A P1S slices to within a few percent of the X1 Carbon on time; the grams are the same.

## Setup (once per machine)

```bash
# Bambu Studio for Linux (AppImage), extracted, plus its libraries
mkdir -p /opt/bambu && cd /opt/bambu
curl -L -o bambu.AppImage https://github.com/bambulab/BambuStudio/releases/download/v02.08.02.61/BambuStudio_ubuntu24.04-v02.08.02.61-20260820225108.AppImage
chmod +x bambu.AppImage && ./bambu.AppImage --appimage-extract
apt-get install -y libwebkit2gtk-4.1-0 libjavascriptcoregtk-4.1-0 libwayland-server0
```

## Run (from the repo root)

```bash
python3 tools/living-cad/slice/bambu_profiles.py      # flatten the system profiles into slice/profiles/*.json
python3 tools/living-cad/slice/slice_parts.py         # slice every part -> lib/living/slice-report.json (+ out/<id>/)
python3 tools/living-cad/slice/make_plates.py         # one project per product per material -> out/plates/
python3 tools/living-cad/launch/cost_model.py         # costs and prices from the sliced figures
```

`--only id,id` slices or plates a few; `--jobs 4` sets parallel slicer runs. The `out/` folder (sliced plates and
plate projects) is not committed; it rebuilds in about an hour.

## What the numbers mean

- **grams**: filament the slicer lays down for one copy (walls, infill, top and bottom), before purge and failed
  prints (the cost model adds 8 %).
- **minutes**: the slicer's own time prediction for that plate, start to finish.
- Two-colour parts (a body and its `-inlay`) are sliced as two files. Printed together with a colour change, the
  real job is longer than the sum by the filament swaps; the cost model's handling time covers some of it, not all.
- **supports**: each part is sliced first without supports. Where the slicer reports a floating overhang it is sliced
  again with tree supports, and that second slice is the one recorded (`"supports": true`, with the original warning
  kept in `warning_without_supports`). Its grams and minutes include the support material. A plate project that
  holds any such part has supports turned on. These parts are candidates for re-orienting or redesigning in the CAD
  so they print without supports.
- Each part is sliced alone. A farm printing several parts on one plate saves the start-up time of the extra jobs.

## Lineage

Profile flattening follows the approach of `mfranzon/print3d` (MIT), which drives Bambu Studio the same way for a
single printer. Nothing here talks to a printer.
