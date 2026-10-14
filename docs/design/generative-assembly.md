# Generative assembly

**Route:** `/creative-studio/generate`, linked from the Studio door (`/creative-studio`).
**Status:** built 14 October 2026; not yet reviewed by Kate on real hardware.
**Redirects:** `/creative-playground` and `/generative-studio` (and `/generative-studio/index.html`) redirect here, with query strings preserved, so old playground share links still open the same piece. `/creative-playground/avatars` stays where it is.

## What it is

One studio, built from the playground's TypeScript shell (`components/studios/GenerativeArtCanvas.tsx`), with the homepage tide engine (`public/direction-4c/assembl-tide.js`) mounted as the first family, **Assembly**. The engine is mounted as it is, not copied: the homepage and the studio run the same file.

- **Any species.** `lib/generative-art/species.ts` holds twelve species as data: tara (the homepage tern), kererū, pīwakawaka, tūī, kōtuku, tākapu, tāmure, kahawai, aihe, starling, corvid and plankton. Each has a silhouette (numbers the engine builds a bird, swimmer or mote from), a motion (wingbeat, sideways tail beat, a dolphin's vertical beat, or a pulse), a beat rate and amplitude, a default flock size and mill speed, a size range, six part tones for upper and under surfaces, and a default ground. Silhouettes are stylised studies from each species' proportions, not field-guide drawings, and tones sit on the plum canon, so a tūī is a dark bird with a pale throat, not iridescent blue-green. Adding a species is one entry.
- **Any assembl object, or any word.** The flock can assemble into any of the engine's twelve shapes (assembl wordmark, a mark, DO, cloud, signal, pin, bubble, tick, frame, sparkle, padlock, seal) or spell up to 24 characters typed into the studio's text field.
- **Grounds.** Plum, paper or chalk. A light species on a light ground, or a dark species on plum, is flipped along the canon ramp so the flock stays legible. A test checks every species on both.

## Engine additions (`assembl-tide.js`)

All optional. Every default reproduces the homepage: with the same poster, a homepage frame from the changed engine is pixel-identical to one from the previous engine (virtual clock, seeded randomness, 1280 × 800, zero differing pixels).

| Option or call | Purpose |
|---|---|
| `seed` | flock and formation sampling seed (default 7, as before) |
| `species` | silhouette, motion, beat, amplitude and part colours |
| `text` | a word for the `text` formation slot, fitted inside the wordmark's box |
| `ground` | solid canon background in place of the plate; skips the plate vignette and the post-pass vignette |
| `bloom` | glow scale (the studio uses 0 on light grounds) |
| `size` | exact render size, for off-screen exports |
| `exactCount` | keep the flock count on narrow screens, so exports match across devices |
| `centred`, `fitWidth` | aim the camera at the formation and leave margin, instead of the homepage hero framing |
| `preserveDrawingBuffer`, `manual` | export support |
| `step(dt, draw)`, `jumpForm`, `setGround`, `setBloom`, `setBeat`, `setSpin`, `setSpeciesColours`, `time` | studio controls; `step` advances the world by a fixed dt so a seed renders the same frames every time |

## Exports and receipts

- **PNG** at the chosen social size or any asset size: rendered off-screen at the exact size, assembled, then a fixed eight seconds of flight.
- **MP4, WebM and GIF loops** of 4, 6, 8 or 12 seconds: the flock is a cloud for the first eighth, then assembles and holds. Frames are rendered off-screen with a fixed step (30 fps for video, 15 for GIF) and encoded in the browser: MP4 and WebM through WebCodecs (`mediabunny` 1.59.1), GIF through `gifenc` 1.0.3. MP4 needs an H.264 encoder in the browser (Chrome, Edge and Safari have one; open-source Chromium does not), and the studio says so instead of failing silently.
- **One stamp.** Every raster export, stills and every loop frame, is stamped once by the shell: the lowercase Instrument Sans wordmark with a dusty rose dot, and a receipt line in IBM Plex Mono naming family, species, formation (or the typed word) and seed, for example `assembly · kōtuku · a mark · seed 8471`. Before this, family PNGs carried two overlapping marks, the shell's and an older italic Cormorant `assembl.`. SVG and code exports keep their own mark, now in Instrument Sans and IBM Plex Mono.
- **Regenerate exactly.** The share link carries every setting; with the receipt's seed it reproduces the same still or loop.

## Branding

Everything the studio draws is a canon token (deep plum, ink, muted plum, dusty rose, chalk, paper) or a mix of them (`lib/generative-art/canon.ts`). A test scans every hex value in the families, renderers, Line presets, backgrounds and watermark.

- 329 off-canon colours across 17 families and three renderers were regraded by a deterministic script. It keeps each colour's OKLab lightness on the deep plum to paper ramp and turns its chroma into a pull toward dusty rose, so each piece keeps its value structure.
- The attractor family's HSL hue sweeps (blue, teal, orange, green) became two-stop canon gradients.
- The universal backgrounds became Paper, Plum and Chalk; their ids (`paper`, `ink`, `seaFog`) are unchanged so shared links resolve.
- The 2D flocking presets take their names, grounds and tones from the species registry (murmuration is the starling, fish school is kahawai, wanderers are pīwakawaka).
- 87 preset labels and blurbs that named old colours were renamed. Ids are unchanged. The old names are recorded below as history, not shown in the UI.

## Honesty

- No third-party service is called by default. The older static studio, which loaded an external image service (`js.puter.com`) and CDN scripts, is no longer reachable; its file stays in `public/generative-studio/` as history until its remaining engines are ported or retired.
- Chrome and Waves fetched their studio lighting from a third-party CDN at runtime (drei's `preset="studio"`). They now use the repo's own `public/brand/watch/studio-lighting-final.hdr`.
- Silhouettes are labelled as stylised studies; generated pieces are never presented as photographs or field records.

## Not done yet

- The static studio's 26 engines are not ported. Its GIF, WebM and MP4 export now exist in the TypeScript studio for Assembly only; other families export stills.
- Real-hardware checks: export speed and frame time on a mid-range laptop and a phone. The cloud checks used software GL.
- Reduced motion: the engine freezes time under `prefers-reduced-motion`, so the live view shows the assembled shape without motion; loops exported by such a visitor are still frames.

## History: before and after
### Colour regrade (329 values)

| File | Before | After |
|---|---|---|
| ChromeCanvas.tsx | `#DADCDE` | `#E0DADB` |
| ChromeCanvas.tsx | `#FFFFFF` | `#FFFDFB` |
| ChromeCanvas.tsx | `#E7F0FF` | `#F3EDEC` |
| ChromeCanvas.tsx | `#FFF3E7` | `#F4EEED` |
| TerrainCanvas.tsx | `#FFE7C7` | `#E4D9D9` |
| TerrainCanvas.tsx | `#B4C7D9` | `#CDC1C4` |
| TerrainCanvas.tsx | `#FFF4E4` | `#F2ECEB` |
| WavesCanvas.tsx | `#FFFFFF` | `#FFFDFB` |
| WavesCanvas.tsx | `#E7F0FF` | `#F3EDEC` |
| attractors.ts | `#F5F1E8` | `#F5F0EF` |
| attractors.ts | `#101216` | `#280F24` |
| attractors.ts | `#F1EDE1` | `#F1ECEB` |
| attractors.ts | `#F2EFE4` | `#F3EEED` |
| attractors.ts | `#181B22` | `#2C1227` |
| chladni.ts | `#F5F1E8` | `#F5F0EF` |
| chladni.ts | `#231F1B` | `#2E152A` |
| chladni.ts | `#8A8678` | `#91808A` |
| chladni.ts | `#0F1116` | `#2A1025` |
| chladni.ts | `#141821` | `#2E1428` |
| chladni.ts | `#4A4A55` | `#594353` |
| chladni.ts | `#DCDDE0` | `#E1DBDD` |
| chladni.ts | `#2A3038` | `#3E2639` |
| chladni.ts | `#8A93A0` | `#9D8D95` |
| chladni.ts | `#F7EBCF` | `#EAE1E0` |
| chladni.ts | `#5C3212` | `#523343` |
| chladni.ts | `#B08A4A` | `#A3898F` |
| chladni.ts | `#101319` | `#2B1126` |
| chladni.ts | `#151A22` | `#2D1328` |
| chladni.ts | `#79A6B2` | `#AA989E` |
| chladni.ts | `#3C7FA0` | `#896E77` |
| chrome.ts | `#EDEFF1` | `#F2EEED` |
| chrome.ts | `#EBECED` | `#EFEBEB` |
| chrome.ts | `#F4CE7A` | `#BFA7AA` |
| chrome.ts | `#FBF6EA` | `#F6F1F0` |
| chrome.ts | `#F1B7A6` | `#D2C2C3` |
| chrome.ts | `#FBEFEA` | `#F5F1EF` |
| chrome.ts | `#5E8C7A` | `#907982` |
| chrome.ts | `#EBF0EC` | `#F2EDED` |
| chrome.ts | `#22262C` | `#351C30` |
| chrome.ts | `#DFE1E3` | `#E4DFE0` |
| chrome.ts | `#C9743E` | `#A1848A` |
| chrome.ts | `#F4ECE3` | `#F1ECEB` |
| chrome.ts | `#3C7FA0` | `#896E77` |
| chrome.ts | `#E7EFF3` | `#F1ECEC` |
| constellation.ts | `#FBF7EE` | `#F8F4F3` |
| constellation.ts | `#2B6B57` | `#705460` |
| constellation.ts | `#5B5049` | `#604B5A` |
| constellation.ts | `#23211F` | `#30172C` |
| constellation.ts | `#0B0B0F` | `#280F24` |
| constellation.ts | `#4A4A55` | `#594353` |
| constellation.ts | `#0D1119` | `#2D1328` |
| constellation.ts | `#F4CE7A` | `#BFA7AA` |
| constellation.ts | `#4C8BE0` | `#9F8287` |
| constellation.ts | `#8A56D0` | `#8D6D75` |
| constellation.ts | `#F4EFE4` | `#F3EEED` |
| constellation.ts | `#8F3A22` | `#6F4D58` |
| constellation.ts | `#B29B7B` | `#AC999F` |
| constellation.ts | `#5B2418` | `#543544` |
| constellation.ts | `#1F262D` | `#341B2F` |
| constellation.ts | `#F5F1E8` | `#F5F0EF` |
| constellation.ts | `#8AB9C4` | `#BBABAF` |
| constellation.ts | `#4A97A9` | `#9C838A` |
| dla.ts | `#F9F5EC` | `#F8F4F2` |
| dla.ts | `#8F3A22` | `#6F4D58` |
| dla.ts | `#F0B421` | `#BBA3A6` |
| dla.ts | `#EEF2F4` | `#F4F0EF` |
| dla.ts | `#164856` | `#533747` |
| dla.ts | `#B4CFD9` | `#D2C6C9` |
| dla.ts | `#F5EFDE` | `#F2ECEB` |
| dla.ts | `#5C3212` | `#523343` |
| dla.ts | `#F0A24C` | `#BAA1A4` |
| dla.ts | `#F0F3E9` | `#F5F0EF` |
| dla.ts | `#2E4529` | `#503444` |
| dla.ts | `#9AAF6D` | `#B69EA2` |
| dla.ts | `#101216` | `#280F24` |
| dla.ts | `#F5F1E8` | `#F5F0EF` |
| dla.ts | `#F4CE7A` | `#BFA7AA` |
| flow.ts | `#FBF7EE` | `#F8F4F3` |
| flow.ts | `#4A4139` | `#513B4B` |
| flow.ts | `#786754` | `#79636F` |
| flow.ts | `#B29B7B` | `#AC999F` |
| flow.ts | `#DBC7A6` | `#D3C6C8` |
| flow.ts | `#0B0B0F` | `#280F24` |
| flow.ts | `#1F1F27` | `#2F152A` |
| flow.ts | `#3D3E48` | `#4D3647` |
| flow.ts | `#7D7F8B` | `#8B7A84` |
| flow.ts | `#0D1119` | `#2D1328` |
| flow.ts | `#3EE7B3` | `#BDA4A7` |
| flow.ts | `#4C8BE0` | `#9F8287` |
| flow.ts | `#8A56D0` | `#8D6D75` |
| flow.ts | `#F0A5C6` | `#C4AEB1` |
| flow.ts | `#1B0F0B` | `#2F1529` |
| flow.ts | `#F7E7A5` | `#D0BEBF` |
| flow.ts | `#F4A25C` | `#BAA1A4` |
| flow.ts | `#C7462B` | `#8D6D75` |
| flow.ts | `#7A1A14` | `#664551` |
| flow.ts | `#F1F4EA` | `#F6F1F0` |
| flow.ts | `#2E4529` | `#503444` |
| flow.ts | `#5A7245` | `#7B606B` |
| flow.ts | `#9AAF6D` | `#B69EA2` |
| flow.ts | `#CDD9A7` | `#D8C9CA` |
| grid.ts | `#231F1B` | `#2E152A` |
| grid.ts | `#5C574F` | `#65515F` |
| grid.ts | `#8E8479` | `#91808A` |
| grid.ts | `#F5EFDE` | `#F2ECEB` |
| grid.ts | `#C0341C` | `#84646C` |
| grid.ts | `#F0B421` | `#BBA3A6` |
| grid.ts | `#1F5DAA` | `#74535E` |
| grid.ts | `#2B6B57` | `#705460` |
| grid.ts | `#6E957F` | `#99848C` |
| grid.ts | `#B8B2A8` | `#BBAFB4` |
| grid.ts | `#23211F` | `#30172C` |
| grid.ts | `#FBF7EE` | `#F8F4F3` |
| grid.ts | `#4A4139` | `#513B4B` |
| grid.ts | `#786754` | `#79636F` |
| grid.ts | `#B29B7B` | `#AC999F` |
| grid.ts | `#101216` | `#280F24` |
| grid.ts | `#F4CE7A` | `#BFA7AA` |
| grid.ts | `#4C8BE0` | `#9F8287` |
| grid.ts | `#8A56D0` | `#8D6D75` |
| grid.ts | `#3EE7B3` | `#BDA4A7` |
| growth.ts | `#F6F3EB` | `#F6F2F1` |
| growth.ts | `#3A2F24` | `#41283A` |
| growth.ts | `#5E8C7A` | `#907982` |
| growth.ts | `#F1F5EC` | `#F7F2F1` |
| growth.ts | `#2E4529` | `#503444` |
| growth.ts | `#8AAF6D` | `#B39A9E` |
| growth.ts | `#F5EFDE` | `#F2ECEB` |
| growth.ts | `#8F3A22` | `#6F4D58` |
| growth.ts | `#231F1B` | `#2E152A` |
| growth.ts | `#23211F` | `#30172C` |
| growth.ts | `#5B5049` | `#604B5A` |
| growth.ts | `#EBF0F4` | `#F2EEED` |
| growth.ts | `#1F5A6E` | `#654956` |
| growth.ts | `#3C7FA0` | `#896E77` |
| growth.ts | `#101216` | `#280F24` |
| growth.ts | `#F4CE7A` | `#BFA7AA` |
| growth.ts | `#3EE7B3` | `#BDA4A7` |
| marble.ts | `#F9F5EC` | `#F8F4F2` |
| marble.ts | `#231F1B` | `#2E152A` |
| marble.ts | `#5B5049` | `#604B5A` |
| marble.ts | `#B29B7B` | `#AC999F` |
| marble.ts | `#F5EFDE` | `#F2ECEB` |
| marble.ts | `#8F3A22` | `#6F4D58` |
| marble.ts | `#F0B421` | `#BBA3A6` |
| marble.ts | `#1F5DAA` | `#74535E` |
| marble.ts | `#2E4529` | `#503444` |
| marble.ts | `#E9EFF2` | `#F1EDEC` |
| marble.ts | `#0E2E36` | `#3A1E31` |
| marble.ts | `#1F5A6E` | `#654956` |
| marble.ts | `#79A6B2` | `#AA989E` |
| marble.ts | `#FAF3E4` | `#F4EEED` |
| marble.ts | `#8F5A15` | `#7D5D67` |
| marble.ts | `#C79B1F` | `#B59A9E` |
| marble.ts | `#F4CE7A` | `#BFA7AA` |
| marble.ts | `#8A2A57` | `#6A4854` |
| marble.ts | `#EEC8D2` | `#DCD0D1` |
| marble.ts | `#F5F1E8` | `#F5F0EF` |
| orbit.ts | `#050F1C` | `#34192D` |
| orbit.ts | `#BFA37A` | `#B5A2A7` |
| orbit.ts | `#6E5F47` | `#715A66` |
| orbit.ts | `#D4A843` | `#B9A0A3` |
| orbit.ts | `#8A6A2E` | `#836770` |
| orbit.ts | `#B8964F` | `#AD9498` |
| orbit.ts | `#D8C9A8` | `#D4C7C8` |
| orbit.ts | `#C8B48C` | `#C2B1B5` |
| orbit.ts | `#F4F1EA` | `#F4F0EF` |
| orbit.ts | `#CFC4AC` | `#CDC1C4` |
| orbit.ts | `#1B1A17` | `#280F25` |
| orbit.ts | `#000000` | `#240B21` |
| orbit.ts | `#0B0C0E` | `#260D23` |
| orbit.ts | `#D6DADF` | `#DED8D9` |
| orbit.ts | `#5A6068` | `#6C5966` |
| orbit.ts | `#7A5F26` | `#775A65` |
| orbit.ts | `#8E959C` | `#9E8F98` |
| orbit.ts | `#0C1836` | `#442738` |
| orbit.ts | `#DCE6F2` | `#EAE3E3` |
| orbit.ts | `#5C6B84` | `#79636E` |
| reaction.ts | `#FBF7EE` | `#F8F4F3` |
| reaction.ts | `#F5E7CC` | `#EAE1E0` |
| reaction.ts | `#B7412A` | `#84646C` |
| reaction.ts | `#5A1B10` | `#5A3A48` |
| reaction.ts | `#F1EDE1` | `#F1ECEB` |
| reaction.ts | `#E5D8B0` | `#E0D3D4` |
| reaction.ts | `#3A2612` | `#3C2033` |
| reaction.ts | `#0F0A05` | `#2B1126` |
| reaction.ts | `#E8E5DA` | `#E9E3E3` |
| reaction.ts | `#1D2A35` | `#381E31` |
| reaction.ts | `#08111A` | `#30152A` |
| reaction.ts | `#F5EAEF` | `#F1ECEB` |
| reaction.ts | `#F0C6D7` | `#DDD0D1` |
| reaction.ts | `#8A2A57` | `#6A4854` |
| reaction.ts | `#3E102A` | `#4F3040` |
| reaction.ts | `#DDD7C8` | `#DDD5D6` |
| reaction.ts | `#2E2A22` | `#392134` |
| reaction.ts | `#0F0D07` | `#2B1126` |
| reaction.ts | `#F1F5F1` | `#F7F3F2` |
| reaction.ts | `#CFE2D5` | `#E2DADA` |
| reaction.ts | `#1F5A4A` | `#614552` |
| reaction.ts | `#0A2B22` | `#3B1F31` |
| ripples.ts | `#0E2E36` | `#3A1E31` |
| ripples.ts | `#B0C0C4` | `#C4B9BD` |
| ripples.ts | `#3C7FA0` | `#896E77` |
| ripples.ts | `#12141A` | `#2A1126` |
| ripples.ts | `#DADDE1` | `#E1DBDC` |
| ripples.ts | `#1C222B` | `#31172B` |
| ripples.ts | `#8A93A0` | `#9D8D95` |
| ripples.ts | `#F5F1E8` | `#F5F0EF` |
| ripples.ts | `#0F1116` | `#2A1025` |
| ripples.ts | `#B4BAC4` | `#C1B6BB` |
| ripples.ts | `#5B5049` | `#604B5A` |
| ripples.ts | `#FAF3E4` | `#F4EEED` |
| ripples.ts | `#8F5A15` | `#7D5D67` |
| ripples.ts | `#F5E4C4` | `#E6DBDB` |
| ripples.ts | `#C79B1F` | `#B59A9E` |
| ripples.ts | `#8A3F5C` | `#72515C` |
| ripples.ts | `#F0C6D7` | `#DDD0D1` |
| ripples.ts | `#3E102A` | `#4F3040` |
| sandpile.ts | `#F5F1E8` | `#F5F0EF` |
| sandpile.ts | `#D0C0AA` | `#CBBFC2` |
| sandpile.ts | `#8A7660` | `#88737D` |
| sandpile.ts | `#4A4139` | `#513B4B` |
| sandpile.ts | `#231F1B` | `#2E152A` |
| sandpile.ts | `#0F1116` | `#2A1025` |
| sandpile.ts | `#2A3038` | `#3E2639` |
| sandpile.ts | `#5C6672` | `#725E6B` |
| sandpile.ts | `#B4BAC4` | `#C1B6BB` |
| sandpile.ts | `#F5EFDE` | `#F2ECEB` |
| sandpile.ts | `#F0B421` | `#BBA3A6` |
| sandpile.ts | `#C7462B` | `#8D6D75` |
| sandpile.ts | `#5B2418` | `#543544` |
| sandpile.ts | `#E9EFF2` | `#F1EDEC` |
| sandpile.ts | `#A4C2CE` | `#C6B8BC` |
| sandpile.ts | `#4A97A9` | `#9C838A` |
| sandpile.ts | `#164856` | `#533747` |
| sandpile.ts | `#08222A` | `#371B2E` |
| sandpile.ts | `#EBF0EC` | `#F2EDED` |
| sandpile.ts | `#CDD9A7` | `#D8C9CA` |
| sandpile.ts | `#8AAF6D` | `#B39A9E` |
| sandpile.ts | `#2E4529` | `#503444` |
| sandpile.ts | `#101711` | `#2C1227` |
| terrain.ts | `#F6EEDA` | `#F0E9E8` |
| terrain.ts | `#3D2A1A` | `#3F2436` |
| terrain.ts | `#B78256` | `#A1878D` |
| terrain.ts | `#F5E0BA` | `#E0D4D4` |
| terrain.ts | `#F5E9D3` | `#EEE6E5` |
| terrain.ts | `#8F5A2E` | `#7C5F69` |
| terrain.ts | `#D3A566` | `#BEA8AA` |
| terrain.ts | `#F5E4C4` | `#E6DBDB` |
| terrain.ts | `#E7EEF3` | `#F0ECEB` |
| terrain.ts | `#2B4457` | `#523847` |
| terrain.ts | `#94A9B7` | `#B0A1A7` |
| terrain.ts | `#F5F1E8` | `#F5F0EF` |
| terrain.ts | `#F0F1EA` | `#F3EFEE` |
| terrain.ts | `#2E4529` | `#503444` |
| terrain.ts | `#6E957F` | `#99848C` |
| terrain.ts | `#DDE1CB` | `#E4DCDC` |
| terrain.ts | `#1B1712` | `#2A1025` |
| terrain.ts | `#0D0806` | `#291025` |
| terrain.ts | `#5C1A0E` | `#5C3C4A` |
| terrain.ts | `#F0A24C` | `#BAA1A4` |
| terrain.ts | `#12141A` | `#2A1126` |
| terrain.ts | `#1C222B` | `#31172B` |
| terrain.ts | `#525C6A` | `#695461` |
| terrain.ts | `#DADDE1` | `#E1DBDC` |
| verlet.ts | `#FBF7EE` | `#F8F4F3` |
| verlet.ts | `#B29B7B` | `#AC999F` |
| verlet.ts | `#4A4139` | `#513B4B` |
| verlet.ts | `#F5F1E8` | `#F5F0EF` |
| verlet.ts | `#D0C0AA` | `#CBBFC2` |
| verlet.ts | `#5C574F` | `#65515F` |
| verlet.ts | `#0F1116` | `#2A1025` |
| verlet.ts | `#8A93A0` | `#9D8D95` |
| verlet.ts | `#6E957F` | `#99848C` |
| verlet.ts | `#2B6B57` | `#705460` |
| verlet.ts | `#EEC8D2` | `#DCD0D1` |
| verlet.ts | `#8A3F5C` | `#72515C` |
| waves.ts | `#8E8479` | `#91808A` |
| waves.ts | `#E9EFF2` | `#F1EDEC` |
| waves.ts | `#1F5A6E` | `#654956` |
| waves.ts | `#A4C2CE` | `#C6B8BC` |
| waves.ts | `#FAF3E4` | `#F4EEED` |
| waves.ts | `#8F5A15` | `#7D5D67` |
| waves.ts | `#F4CE7A` | `#BFA7AA` |
| waves.ts | `#1B1F24` | `#2D1429` |
| waves.ts | `#2A3038` | `#3E2639` |
| waves.ts | `#8A98A4` | `#A09199` |
| waves.ts | `#8A3F5C` | `#72515C` |
| waves.ts | `#EEC8D2` | `#DCD0D1` |
| waves.ts | `#EBF0EC` | `#F2EDED` |
| waves.ts | `#1F4F40` | `#573B4A` |
| waves.ts | `#8FB3A0` | `#B5A4A9` |
| waves.ts | `#F5ECDE` | `#F2ECEB` |
| waves.ts | `#8B4820` | `#72525D` |
| waves.ts | `#E0A469` | `#BFA7AA` |
| waves.ts | `#E5EEEF` | `#EFEBEA` |
| waves.ts | `#0F5A66` | `#634654` |
| waves.ts | `#79A6B2` | `#AA989E` |
| waves.ts | `#F5F1E8` | `#F5F0EF` |
| waves.ts | `#B29B7B` | `#AC999F` |
| waves.ts | `#0D1119` | `#2D1328` |
| waves.ts | `#3EE7B3` | `#BDA4A7` |
| waves.ts | `#8A56D0` | `#8D6D75` |
| presets.ts | `#0D3B48` | `#472A3C` |
| presets.ts | `#1A5164` | `#5C404E` |
| presets.ts | `#2C6E7E` | `#765B67` |
| presets.ts | `#4A8A99` | `#907780` |
| presets.ts | `#79A6B2` | `#AA989E` |
| presets.ts | `#B7CED5` | `#D1C6C9` |
| presets.ts | `#3D160C` | `#47293A` |
| presets.ts | `#5B2418` | `#543544` |
| presets.ts | `#8F3A22` | `#6F4D58` |
| presets.ts | `#C7623D` | `#987A80` |
| presets.ts | `#E39274` | `#BBA2A5` |
| presets.ts | `#F3C3AF` | `#D9CBCC` |
| presets.ts | `#F8FAFA` | `#FCF9F7` |
| presets.ts | `#08222A` | `#371B2E` |
| presets.ts | `#0E2E36` | `#3A1E31` |
| presets.ts | `#164856` | `#533747` |
| presets.ts | `#1F677A` | `#705460` |
| presets.ts | `#4A97A9` | `#9C838A` |
| presets.ts | `#8AB9C4` | `#BBABAF` |
| presets.ts | `#FBF7F0` | `#FAF6F4` |
| presets.ts | `#3B2F22` | `#41283A` |
| presets.ts | `#5B4A38` | `#5D4554` |
| presets.ts | `#8A7660` | `#88737D` |
| presets.ts | `#B39F87` | `#AE9DA3` |
| presets.ts | `#D0C0AA` | `#CBBFC2` |
| presets.ts | `#E8DECD` | `#E5DDDD` |

### Preset names (87 strings)

| File | Id | Field | Before | After |
|---|---|---|---|---|
| attractors.ts | rossler | blurb | coiled ribbon on cream | coiled ribbon on chalk |
| chladni.ts | brass | label | Brass Plate | Rose Plate |
| chladni.ts | brass | blurb | warm brass with dark sand | warm rose plate, dark sand |
| chladni.ts | midnight | blurb | teal ripples on ink | dusty rose ripples on deep plum |
| chrome.ts | gold | label | Gold | Dusty Rose |
| chrome.ts | emerald | label | Emerald | Muted Plum |
| chrome.ts | copper | label | Copper | Warm Rose |
| chrome.ts | ocean | label | Ocean | Plum Glass |
| chrome.ts | gold-knot | label | Gold Knot | Rose Knot |
| chrome.ts | gold-knot | blurb | gilded torus knot, editorial studio | dusty rose torus knot, editorial studio |
| chrome.ts | rose-sphere | blurb | satin rose gold sphere | satin pale rose sphere |
| chrome.ts | emerald-ico | label | Emerald Ico | Plum Ico |
| chrome.ts | emerald-ico | blurb | faceted emerald icosahedron | faceted muted plum icosahedron |
| chrome.ts | obsidian-wobble | blurb | black glass, gentle flex | deep plum glass, gentle flex |
| chrome.ts | copper-torus | label | Copper Torus | Rose Torus |
| chrome.ts | copper-torus | blurb | copper mirror, warm register | rose mirror, warm register |
| chrome.ts | ocean-ico | label | Ocean Ico | Plum Glass Ico |
| chrome.ts | ocean-ico | blurb | teal glass icosahedron | muted plum glass icosahedron |
| constellation.ts | paper | blurb | pounamu nodes on paper — the assembl register | muted plum nodes on paper · the assembl register |
| constellation.ts | ink | blurb | black nodes, editorial diagram | deep plum nodes, editorial diagram |
| constellation.ts | night | blurb | golden nodes on midnight, drifting | dusty rose nodes on deep plum, drifting |
| constellation.ts | linen | blurb | warm coral network on cream | warm plum network on chalk |
| constellation.ts | slate | blurb | pearl nodes on slate | chalk nodes on deep plum |
| dla.ts | frost | blurb | window frost — pale blue | window frost, pale plum on chalk |
| dla.ts | bronze | label | Bronze Coral | Plum Coral |
| dla.ts | bronze | blurb | bronze branches on cream | plum branches on chalk |
| dla.ts | moss | label | Moss | Lichen |
| flow.ts | aurora | label | Aurora | Night Veil |
| flow.ts | aurora | blurb | green-purple ribbons on dark ground | dusty rose ribbons on deep plum |
| flow.ts | ember | label | Ember | Rose Sparks |
| flow.ts | ember | blurb | warm coal-fire particles rising | warm rose particles rising |
| flow.ts | meadow | blurb | soft green strokes, spring air | soft plum strokes, spring air |
| grid.ts | molnar | blurb | Vera Molnár homage — rotated squares on cream | Vera Molnár homage, rotated squares on chalk |
| grid.ts | bauhaus | blurb | primary blocks, minimal outline | plum and rose blocks, minimal outline |
| grid.ts | pounamu | label | Pounamu | Plum Lattice |
| grid.ts | pounamu | blurb | sage grid on paper | muted plum grid on paper |
| grid.ts | cream | label | Cream | Chalk |
| grid.ts | night | blurb | saturated blocks on dark | rose blocks on deep plum |
| line.ts | bloom | blurb | blue-teal shells stacked like tissue paper | plum and rose shells stacked like tissue paper |
| line.ts | sunrise | blurb | warm coral and terracotta at dawn | warm rose and muted plum at dawn |
| line.ts | ocean | label | Ocean Interference | Tide Interference |
| line.ts | ocean | blurb | deeper teals with more layers | deeper plums with more layers |
| line.ts | whisper | blurb | paper-cream, near-monochrome, ultra-soft | paper and chalk, near-monochrome, ultra-soft |
| marble.ts | ocean | label | Ocean | Tide |
| marble.ts | ocean | blurb | blue-teal comb-sweep | deep plum comb-sweep |
| marble.ts | gold | label | Gold Leaf | Rose Leaf |
| marble.ts | gold | blurb | gold veins on cream | rose veins on chalk |
| marble.ts | bloom | blurb | pink drops in slow water | rose drops in slow water |
| orbit.ts | paper | blurb | brass on off-white — light posts and print | dusty rose on paper · light posts and print |
| orbit.ts | gallery | blurb | bone white, black gloss cores on brass | chalk ground, deep plum gloss cores on rose |
| orbit.ts | night | blurb | deep navy, cool chrome, gold cores | ink ground, cool chrome, rose cores |
| reaction.ts | emerald | label | Emerald Coral | Plum Coral |
| reaction.ts | emerald | blurb | coral in a green register | coral in a muted plum register |
| ripples.ts | ink | blurb | ink ripples on cream | ink ripples on chalk |
| ripples.ts | gold | label | Gold Basin | Rose Basin |
| ripples.ts | gold | blurb | gold ripples in warm light | rose ripples in warm light |
| ripples.ts | rose | blurb | rose crests on shell pink | rose crests on pale rose |
| sandpile.ts | ember | label | Ember | Rose Cascade |
| sandpile.ts | ocean | label | Ocean | Tide |
| sandpile.ts | ocean | blurb | teal grains, wider threshold | plum grains, wider threshold |
| sandpile.ts | moss | label | Moss | Lichen |
| sandpile.ts | moss | blurb | random-drop mossy growth | random-drop lichen growth |
| terrain.ts | basin | label | Sage Basin | Plum Basin |
| terrain.ts | basin | blurb | sage valley in soft light | muted plum valley in soft light |
| terrain.ts | volcano | label | Ember Ridge | Night Ridge |
| terrain.ts | volcano | blurb | lava-veined ridge in night | rose-veined ridge at night |
| verlet.ts | pounamu | label | Pounamu | Plum Weave |
| verlet.ts | pounamu | blurb | sage-green weave on paper | muted plum weave on paper |
| verlet.ts | bloom | blurb | pink lace at rest | rose lace at rest |
| waves.ts | ocean | label | Ocean | Tide |
| waves.ts | ocean | blurb | ocean surface in evening light | tide surface in evening light |
| waves.ts | gold | label | Gold Sheet | Rose Sheet |
| waves.ts | gold | blurb | gilded foil bending under a lamp | rose foil bending under a lamp |
| waves.ts | slate | blurb | slate glass — night register | deep plum glass, night register |
| waves.ts | bloom | blurb | pink silk, editorial hero | rose silk, editorial hero |
| waves.ts | pounamu | label | Pounamu | Plum Sheet |
| waves.ts | pounamu | blurb | jade sheet — brand register | muted plum sheet, brand register |
| waves.ts | copper | label | Copper | Warm Rose |
| waves.ts | copper | blurb | copper foil in a warm lamp | rose foil in a warm lamp |
| waves.ts | lagoon | blurb | shallow teal water, gentle chop | shallow plum water, gentle chop |
| waves.ts | aurora | label | Aurora | Night Veil |
| waves.ts | aurora | blurb | aurora ribbons on midnight | rose ribbons on deep plum |
| presets.ts | bloom | blurb | blue-teal shells stacked like tissue paper | plum and rose shells stacked like tissue paper |
| presets.ts | sunrise | blurb | warm coral and terracotta at dawn | dusty rose and muted plum at first light |
| presets.ts | ocean | label | Ocean Interference | Tide Interference |
| presets.ts | ocean | blurb | deeper teals with more layers | deeper plum with more layers |
| presets.ts | whisper | blurb | paper-cream, near-monochrome, ultra-soft | paper and chalk, near-monochrome, ultra-soft |

## Evidence

Captures from a local build with software GL, in `docs/design/generative-assembly/`: `species-and-grounds.jpg` (starling spelling "kia ora" on paper, kōtuku as the a mark on chalk, corvid as the padlock on plum, an aihe pod milling), `still-and-loop-frames.jpg` (a PNG export and the first and last frames of a WebM loop, with wordmark and receipt), `all-families-on-canon.jpg` (all 19 families after the regrade; DLA was still growing at capture time), `studio-page.jpg`.
