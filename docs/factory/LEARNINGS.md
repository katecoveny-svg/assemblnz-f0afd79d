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
