# Franklin / the real 3D homepage

User direction: wide Scandi Auckland-inspired office with Franklin in the real fly-through, clean option-one composition, no busy lower montage. Keep Pursuit / DO / Studio, current typography and plum/rose/paper, and existing private hubs.

## Authored asset

Blender run 35307818280 generated the editable office, named Franklin mesh geometry, embedded material textures, a camera action in the .blend, a glTF asset and five real renders. Artifact 10532268739 contains the .blend and all renders. The wide frame and dog-detail render were inspected. The dog and city are authored interpretations; this is not a photograph or a scanned likeness of the pet. The first geometry is intentionally a reviewable 3D model, not a promise of the generated mockup's photographic fidelity.

The standalone generator is scripts/design/build_franklin_office.py. It never downloads third-party art or exposes client data. The original atelier asset remains for other surfaces and rollback.

## Integration

AssemblWorldHero explicitly selects WorldAtelierStage variant=franklin. The default stage remains atelier so DO and unrelated public pages do not unexpectedly switch worlds. The new scene loads office.glb, preserves its material textures, batches static geometry, and moves the camera through three authored positions on scroll. Franklin remains real 3D geometry in the room, not a cutout or overlaid video.

Mobile has a separately composed camera start and real-render poster; it is not automatically reduced motion. The person's reduced-motion setting or a failed scene uses readable fallback content. Rendering is demand-driven, with camera settling only while needed. The hero text remains an HTML foreground. Large chapter detail cards are removed from the hero composition so they do not obscure the office/dog; accessible chapter controls remain.

## Acceptance

Before production: exact GLB contains named dog meshes and embedded images; typecheck; geometry/camera/batching/content tests; existing DO/research checks; guarded production build; actual WebGL capture at three positions in 375px and 1440px Chromium; nontrivial pixel differences and camera coordinates; pause holds actual camera; reduced-motion, JavaScript-disabled and failed-model poster checks; exact public/private destinations preserved.

Record results after the browser run rather than infer visual readiness from successful generation. These tests do not certify physical iPhone/Safari frame rate. No auth, client records, research quota, TypeSafe enablement, paid billing, private workspace storage or provider configuration is changed.
