# assembl factory learnings

Record only durable lessons that should change future work.

## Template

### YYYY-MM-DD — short lesson

**Context**  
What were we trying to do?

**Observed**  
What actually happened?

**Cause**  
Best-supported explanation. Separate evidence from guesswork.

**Factory change**  
What primitive, test, eval, skill, guardrail or canonical doc changed because of this?

**Applies to**  
Products/repos/surfaces affected.

---

## 2026-09-16 — too many entry points create agent drift

**Context**  
Different coding agents were starting from different combinations of `AGENTS.md`, `CLAUDE.md`, stale README material, current strategy docs and historical research.

**Observed**  
Instructions and product direction began diverging between agents, while large context loads consumed unnecessary credits.

**Cause**  
The repo had detailed knowledge but no universally enforced context-routing layer or precedence hierarchy.

**Factory change**  
Added `START_HERE.md`, `docs/context/README.md`, a tighter root `AGENTS.md`, and factory decision/primitive registries.

**Applies to**  
All Assembl coding agents and future repo cleanup work.

### 2026-09-16 — Public DO account and voice continuity

Public route exemptions must be tested against earlier redirects: the legacy splash gate redirected `/login` and `/auth/*` before reaching its exemption list, blocking DO account entry. Keep personal DO confirmation on the workspace host and preserve operator-host isolation. Normalise return paths before checking scope.

Direct browser voice needs a server-locked, short-lived token, a persistent account allowance, setup acknowledgement before microphone frames, and cancellation that also handles a late permission result. An audio transcript or compiled brief is a draft; adding it to a task must remain a separate reviewed action. See `docs/reviews/2026-09-16-do-voice/README.md` for boundaries and proof.
