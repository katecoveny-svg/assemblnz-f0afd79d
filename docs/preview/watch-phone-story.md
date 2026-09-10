# Floating watch and full-size agent phone

The homepage now opens with the actual 1,025-part watch floating in separate assemblies. An 18-second loop seats the mechanism, casing, dial, hands and glass, holds the finished watch, then separates the parts again. Scrolling takes over the timeline and carries the watch through the existing story. The watch fades before the detailed industry cards so their text stays clear.

The phone is wider, with a metal rim, inset screen, hardware details, larger conversation bubbles, an accessible composer and an agent picker that stays inside the screen. `HomeGuidePhone` uses the same `/api/home/agent` endpoint, agent registry, suggestions and simulated-wait script. The compact variant is preserved for other uses.

## Scope

- Homepage copy and links are unchanged.
- Original watch model and film remain available on other public pages.
- Private journey routing, One NZ access, agent endpoints and credentials are unchanged.
- The watch and phone presentation are separate from the live agent response.

## Controls and access

The landing animation starts automatically unless reduced motion or data saver is enabled. A page scroll switches to the story timeline. **Play assembly** runs the loop again; **Follow scroll** returns to the story. **Less motion** shows the assembled still. Drag or arrow keys rotate the model, and the reset button restores the viewing angle. The existing film remains available in its dialog. Animation stops when the watch is off screen, the page is hidden, or the film is open.

## Assets

`public/brand/watch/watch-assembly-story.glb` is 9.84 MB, with 1,025 distinct meshes and 1,025 translation tracks. It retains the original material textures. The loop joins exactly and the assembled hold has zero movement.

`scripts/blender/watch_assembly_story.py` rebuilds the animation from the original `assembl-watch.blend`. The revised editable Blender file is supplied separately with the review package.

## Review checks

- Run repository lint, targeted lint, typecheck and production build.
- Inspect the homepage at 375, 768 and 1280+ CSS pixels.
- Check landing playback, scroll handoff, reverse scroll, pause/reduced motion, film playback and focus return.
- Exercise the live reply, specialist picker, simulated wait and replay inside the larger phone.
- Confirm original copy and anonymous One NZ access responses.
