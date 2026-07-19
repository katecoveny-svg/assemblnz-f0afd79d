# assembl studio — developer notes

The studio is a visual workbench that turns a typed agent definition into an editable, testable interface. Live at **`/studio`**; first prototype ships with the sample **koro** agent.

## Architectural decisions

1. **The schema is the source of truth.** `lib/studio/schema.ts` defines every agent shape (`AgentDefinition`, `AgentConnection`, per-component sub-schemas) as Zod. Nothing else in the studio duplicates that data. The 3D scene, component library, properties panel, x-ray view, activity view, mobile editor, and deployment summary all read from the same store.

2. **Zustand for state.** `lib/studio/store.ts` exports a single hook. No context provider, no prop-drilling. Actions are typed, undo/redo is built in, and the test workflow lives in the same store so activity events are just entries in `state.test.activity`.

3. **Simulation is explicit.** Every connector is flagged `simulated: true`. The 9-stage refund workflow (`lib/studio/simulate.ts`) is a hard-coded stage table — this is a demonstration test, not a live runtime. The final "sent" stage never talks to Gmail.

4. **DOM labels over WebGL text.** The 3D scene uses drei `<Html>` overlays for every module label so text is readable + accessible. Essential information is never trapped inside the canvas.

5. **The scene is not the source of truth.** `AgentScene.tsx` derives its layout from `agent.knowledge`, `agent.abilities`, `agent.connectors`, etc. Adding a schema component makes it appear in the scene; removing it in the panel removes it from the scene.

## How agent data maps to visual components

| Schema field         | Library entry                       | 3D shape                    | Panel section          |
|----------------------|-------------------------------------|-----------------------------|------------------------|
| `identity`           | (implicit)                          | (part of core)              | Identity form          |
| `instructions`       | Essentials · Instructions           | Chrome capsule above core   | Structured fields      |
| `intelligence`       | Essentials · Intelligence           | (part of core)              | Model / effort / temp  |
| `memory`             | Essentials · Memory                 | Frosted cube (right of core)| Scope / retention      |
| `knowledge[]`        | Knowledge · Files/Website/Drive/Policy | Clear glass cubes (left) | Title / items / status |
| `abilities[]`        | Abilities · Draft/Send/…            | Chrome capsules (front)     | Connector / approval   |
| `connectors[]`       | Connected apps · Gmail/…            | Chrome tile                 | Provider / scopes      |
| `boundaries[]`       | Control · Boundary                  | Transparent shell (wraps)   | Rule / description     |
| `approvals[]`        | Control · Approval                  | Warm chrome block           | Triggers / gates ability |
| `evaluations[]`      | Control · Tone/Fact evaluation      | Orbiting ring around core   | Pass threshold         |

## Adding a new component type

1. Add the type string to `ComponentType` enum in `schema.ts`.
2. Add the sub-schema (Zod) for its data if it doesn't fit an existing one.
3. Add a `LibraryEntry` to `COMPONENT_LIBRARY` — category, label, description, `multiInstance`.
4. Extend `addComponent` in `store.ts` with the default shape when this type is added.
5. In `PropertiesPanel.tsx` add a case in `renderMain()` for the new `component.kind`.
6. In `AgentScene.tsx`, add a mesh function + a case in `useSceneModules()` so it appears in the scene.

That's it — the top bar, x-ray, activity view, and mobile editor pick it up automatically because they all read from `listAllComponents(agent)`.

## Adding a new connector

1. Add `connector-<provider>` to `ComponentType`.
2. Add a `LibraryEntry` in `connected-apps` category.
3. Extend `store.addComponent` to insert a `Connector` with the right default provider label + scopes.
4. Optionally add an ability that depends on it via a `connections` edge with `relationship: 'enables'`.

## Adding a new evaluation

1. Add `evaluation-<kind>` to `ComponentType`.
2. Add a `LibraryEntry` in `control` category.
3. Extend `store.addComponent` with the default `Evaluation` shape.
4. Add a `connections` edge with `relationship: 'evaluates'` targeting the ability it judges.

## Creating a new agent template

1. Copy `lib/studio/koro.ts` to `lib/studio/<name>.ts`.
2. Change the values — every field is typed, so the compiler tells you what's missing.
3. `AgentDefinition.parse(...)` at the bottom validates at import time.
4. Load it into the store by replacing the initial `agent: KORO_AGENT` in `store.ts`.

## Replacing simulated test stages with real execution

`lib/studio/simulate.ts` exports `TEST_STAGES: TestStageSpec[]`. Each stage has an `id`, `label`, `activity` message, `active` component IDs, and `autoAdvanceAfterMs`.

To wire a live agent runtime:
1. Keep the stage table — it's the UX contract.
2. In `store.runTest`, replace the auto-advance timer with a call to the runtime. The runtime should emit events matching the stage IDs.
3. When the runtime reaches the `awaiting-approval` stage, keep the human-in-the-loop UI as-is; the "approve" button just tells the runtime to continue.

## Connecting a production agent runtime later

The agent definition (`AgentDefinition`) is designed to be shipped to a runtime unchanged:
- `intelligence.model` → the runtime's model choice
- `instructions` → composed by `composeSystemPrompt(agent)` (already used in the Advanced tab)
- `knowledge[]` → runtime's retrieval config
- `abilities[]` + `connectors[]` → runtime's tool definitions
- `approvals[]` → runtime's HITL gate rules
- `boundaries[]` → runtime's system-prompt rules + runtime-level filters
- `evaluations[]` → runtime's per-response scoring hooks

Persistence layer (Postgres/Supabase) can serialise the schema directly — every field is JSON-safe and validated by Zod on read.

## What is real vs simulated in this prototype

**Real:**
- The typed agent schema + Zod validation
- All UI state, undo/redo, selection, mode switching
- Structured instruction editing → composed system prompt
- Component library reflecting the current agent
- 3D scene deriving every module from the schema
- X-ray view listing every relationship with its explanation
- Activity trace recording every stage with timestamps

**Simulated (labelled in the UI):**
- The Gmail connector — no live OAuth, no live inbox
- The 9-stage refund workflow — hard-coded stage timings
- Confidence + cost + duration numbers during the test
- The final "send" — no email actually goes out
