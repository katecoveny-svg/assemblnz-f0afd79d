import React, { useRef, useState, useCallback, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment"
import { motion, AnimatePresence } from "motion/react"
import jsPDF from "jspdf"

// ─── Types ─────────────────────────────────────────────────────────────────────

type PartId = "identity" | "prompt" | "memory" | "knowledge" | "tools" | "models" | "reasoning" | "guardrails" | "evals"
type ModelId = "claude" | "gpt" | "gemini" | "custom"
type PersonaId = "analytical" | "creative" | "empathetic" | "pragmatic"
type WorldId = "drift" | "ore" | "deep" | "schema"
type ExportTab = "png" | "pdf" | "page" | "code" | "react"
type MatType = "gold" | "brushedGold" | "chrome" | "darkBronze" | "roseGold" | "platinum" | "warmBronze" | "brightGold"

interface Config { agentName: string; model: ModelId; persona: PersonaId; active: Set<PartId> }
interface ComponentStyle { matType: MatType; tint: string }
interface AgentDefinition {
  role: string; purpose: string; inputContract: string; outputContract: string
  allowedSkills: string; allowedTools: string; authorityLevel: string
  escalationRules: string; knownLimitations: string
}
interface PartDef {
  id: PartId; name: string; cat: string; desc: string; tagline: string; features: string[]
  colorHex: string; naturalPos: THREE.Vector3; assemblyPos: THREE.Vector3
}

const DEFINITION_FIELDS: Array<{ key: keyof AgentDefinition; label: string }> = [
  { key: "role",            label: "Role"             },
  { key: "purpose",         label: "Purpose"          },
  { key: "inputContract",   label: "Input contract"   },
  { key: "outputContract",  label: "Output contract"  },
  { key: "allowedSkills",   label: "Allowed skills"   },
  { key: "allowedTools",    label: "Allowed tools"    },
  { key: "authorityLevel",  label: "Authority level"  },
  { key: "escalationRules", label: "Escalation rules" },
  { key: "knownLimitations",label: "Known limitations"},
]

function defaultDef(config: Config): AgentDefinition {
  const active = PARTS.filter(p => config.active.has(p.id))
  const skills = active.filter(p => ["reasoning","memory","knowledge","evals"].includes(p.id)).map(p => p.name)
  const tools  = active.filter(p => ["tools","models"].includes(p.id)).map(p => p.name)
  return {
    role: config.agentName || "AI agent",
    purpose: `A ${config.persona} assistant powered by ${config.model} that carries out tasks end to end — from understanding the request through to proving the outcome.`,
    inputContract: "User messages, session history, injected context documents, structured data payloads",
    outputContract: "Structured responses, completed task artefacts, status confirmations, citations",
    allowedSkills: skills.length ? skills.join(", ") : "Reasoning, Memory, Knowledge",
    allowedTools: config.active.has("tools") ? "Web search, code execution, calendar, email, REST APIs" : "None configured",
    authorityLevel: "L2 — autonomous within defined scope, escalates on ambiguity or low confidence",
    escalationRules: "Escalate when: confidence < 0.7, request is out of scope, user frustration detected, financial/legal threshold reached",
    knownLimitations: "Knowledge cutoff applies · cannot initiate unsolicited contact · no real-money transactions · may hallucinate on sparse domains",
  }
}

// ─── World themes ──────────────────────────────────────────────────────────────

interface WorldTheme {
  bg: number; floorHex: number; wallHex: number; ceilHex: number
  fogNear: number; fogFar: number
  ambientHex: number; ambientInt: number
  hemiSky: number; hemiGround: number; hemiInt: number
  sunHex: number; sunInt: number; fillHex: number; fillInt: number
  lineHex: number; lineOpacity: number; lineGlowHex: number
  particleHex: number; bgParticleHex: number
  emissiveHex: number; emissiveInt: number
  coveHex: number; coveInt: number
  orbHex: number; pdfBg: string
}

const WORLDS: Record<WorldId, WorldTheme> = {
  drift: {
    bg: 0xe4ddd4, floorHex: 0xc8c0b4, wallHex: 0xede8e2, ceilHex: 0xf0ece6, fogNear: 28, fogFar: 65,
    ambientHex: 0xfff8ee, ambientInt: 0.9, hemiSky: 0xfff8ee, hemiGround: 0xc8bfb0, hemiInt: 1.1,
    sunHex: 0xfff8ee, sunInt: 2.6, fillHex: 0xffe8d8, fillInt: 0.7,
    lineHex: 0xd4a843, lineOpacity: 0.22, lineGlowHex: 0xffe090,
    particleHex: 0xffe080, bgParticleHex: 0xc0b898,
    emissiveHex: 0x000000, emissiveInt: 0, coveHex: 0xfff8ee, coveInt: 1.5,
    orbHex: 0xd4a843, pdfBg: "#f4f0eb",
  },
  ore: {
    bg: 0xede0cc, floorHex: 0xcfc0a8, wallHex: 0xf0e4d0, ceilHex: 0xf8f0e4, fogNear: 26, fogFar: 60,
    ambientHex: 0xffe0b0, ambientInt: 1.0, hemiSky: 0xffd890, hemiGround: 0xcfb888, hemiInt: 1.2,
    sunHex: 0xfff0c8, sunInt: 3.0, fillHex: 0xffcc80, fillInt: 0.8,
    lineHex: 0xd4a050, lineOpacity: 0.28, lineGlowHex: 0xffcc50,
    particleHex: 0xf0c050, bgParticleHex: 0xd8b870,
    emissiveHex: 0x402010, emissiveInt: 0.08, coveHex: 0xffe8a0, coveInt: 2.0,
    orbHex: 0xf0c050, pdfBg: "#f5ede0",
  },
  deep: {
    bg: 0x080810, floorHex: 0x0e0e18, wallHex: 0x0a0a14, ceilHex: 0x0c0c16, fogNear: 18, fogFar: 45,
    ambientHex: 0x101028, ambientInt: 0.35, hemiSky: 0x102040, hemiGround: 0x080818, hemiInt: 0.28,
    sunHex: 0x4060ff, sunInt: 0.8, fillHex: 0x8040ff, fillInt: 0.5,
    lineHex: 0x4080ff, lineOpacity: 0.5, lineGlowHex: 0x80c0ff,
    particleHex: 0x80a0ff, bgParticleHex: 0x303080,
    emissiveHex: 0x6080ff, emissiveInt: 0.5, coveHex: 0x4060ff, coveInt: 0.8,
    orbHex: 0x80a0ff, pdfBg: "#0a0a14",
  },
  schema: {
    bg: 0xdce4ee, floorHex: 0xbfc8d5, wallHex: 0xdce8f4, ceilHex: 0xedf2f8, fogNear: 26, fogFar: 62,
    ambientHex: 0xd0e4ff, ambientInt: 0.95, hemiSky: 0xb0d0ff, hemiGround: 0xe8f0ff, hemiInt: 0.5,
    sunHex: 0xd0e8ff, sunInt: 1.8, fillHex: 0xc0d8ff, fillInt: 0.5,
    lineHex: 0x6090d0, lineOpacity: 0.32, lineGlowHex: 0x90c0ff,
    particleHex: 0x80b0ff, bgParticleHex: 0x9090c0,
    emissiveHex: 0x0040a0, emissiveInt: 0.12, coveHex: 0xc0d8ff, coveInt: 1.2,
    orbHex: 0x80b0ff, pdfBg: "#edf2f8",
  },
}

const WORLD_CSS:    Record<WorldId, string> = { drift: "#e4ddd4", ore: "#ede0cc", deep: "#080810", schema: "#dce4ee" }
const WORLD_SWATCH: Record<WorldId, string> = { drift: "#c8c0b4", ore: "#cfc0a8", deep: "#0e0e18", schema: "#bfc8d5" }

// ─── Component definitions ─────────────────────────────────────────────────────

const PARTS: PartDef[] = [
  { id: "identity",   name: "Identity",   cat: "CORE",      colorHex: "#d4a843",
    desc: "The agent's character, purpose and name — the gravitational centre every decision orbits.",
    tagline: "who the agent is",
    features: ["Name & purpose statement", "Role boundaries", "Tone of voice", "Default behaviour"],
    naturalPos: new THREE.Vector3(0, 6.2, 0),        assemblyPos: new THREE.Vector3(0, 4.2, 0) },
  { id: "models",     name: "Models",     cat: "ENGINE",    colorHex: "#c09040",
    desc: "The inference engine — the language model that powers reasoning, generation and response at runtime.",
    tagline: "what thinks",
    features: ["Model selection (Claude · GPT · Gemini)", "Temperature & parameters", "Fallback routing", "Cost & latency tuning"],
    naturalPos: new THREE.Vector3(-5.5, 3.8, -1.5),  assemblyPos: new THREE.Vector3(-1.5, 3.2, 0.4) },
  { id: "prompt",     name: "Prompt",     cat: "INTERFACE", colorHex: "#6b5840",
    desc: "The instruction architecture — how the task is framed, context injected, and output shaped every single call.",
    tagline: "how it thinks",
    features: ["System instructions", "Context injection", "Output format rules", "Few-shot examples"],
    naturalPos: new THREE.Vector3(5.2, 3.6, 0.8),    assemblyPos: new THREE.Vector3(1.5, 3.2, 0.4) },
  { id: "guardrails", name: "Guardrails", cat: "SAFETY",    colorHex: "#c8c4be",
    desc: "The values layer — ethical constraints, accuracy checks and refusal logic that govern every output before it leaves.",
    tagline: "what it won't do",
    features: ["Content policy", "Hallucination checks", "Refusal logic", "Output validation"],
    naturalPos: new THREE.Vector3(0.5, 4.2, 3.8),    assemblyPos: new THREE.Vector3(0, 2.8, 0) },
  { id: "memory",     name: "Memory",     cat: "STATE",     colorHex: "#b8935a",
    desc: "Persistent recall — what the agent has learned and experienced across sessions, surfaced at the right moment.",
    tagline: "what it remembers",
    features: ["Long-term user context", "Episodic event log", "Semantic embeddings", "Session continuity"],
    naturalPos: new THREE.Vector3(-6.0, 2.5, 0.8),   assemblyPos: new THREE.Vector3(-1.3, 2.2, -0.3) },
  { id: "knowledge",  name: "Knowledge",  cat: "LIVE DATA", colorHex: "#c9a96e",
    desc: "Live retrieval — documents, web search and databases consulted in real time to ground every response in fact.",
    tagline: "what it knows now",
    features: ["Document retrieval (RAG)", "Live web search", "Database queries", "Citation grounding"],
    naturalPos: new THREE.Vector3(6.0, 2.5, 0.8),    assemblyPos: new THREE.Vector3(1.3, 2.2, -0.3) },
  { id: "reasoning",  name: "Reasoning",  cat: "COGNITION", colorHex: "#c49070",
    desc: "Chain-of-thought — decomposing problems, checking logic, running sub-tasks and self-correcting before answering.",
    tagline: "how it plans ahead",
    features: ["Step-by-step decomposition", "Self-verification loops", "Sub-agent orchestration", "Preemptive error checking"],
    naturalPos: new THREE.Vector3(-1.0, 2.2, -4.5),  assemblyPos: new THREE.Vector3(0, 1.8, 0) },
  { id: "tools",      name: "Tools",      cat: "ACTION",    colorHex: "#9e9890",
    desc: "External execution — APIs, code runners, calendars and search that let the agent act in the real world, end to end.",
    tagline: "what it can do",
    features: ["Web search & browse", "Code execution", "Calendar & email", "REST API calls"],
    naturalPos: new THREE.Vector3(1.0, 2.2, 4.5),    assemblyPos: new THREE.Vector3(0, 2.6, -1.0) },
  { id: "evals",      name: "Evals",      cat: "QUALITY",   colorHex: "#8090b8",
    desc: "Continuous measurement — automated test suites that score outputs against success criteria, catching regressions and proving the experience is improving over time.",
    tagline: "how it proves it's working",
    features: ["Output scoring rubrics", "Automated regression tests", "Human feedback loops", "Performance dashboards & drift detection"],
    naturalPos: new THREE.Vector3(4.0, 1.8, -3.5),   assemblyPos: new THREE.Vector3(1.0, 1.4, 1.0) },
]

const CONNECTIONS: Array<{ from: PartId; to: PartId }> = [
  { from: "identity",   to: "prompt"     }, { from: "identity",   to: "guardrails" }, { from: "identity",   to: "models"    },
  { from: "prompt",     to: "models"     }, { from: "prompt",     to: "reasoning"  },
  { from: "memory",     to: "reasoning"  }, { from: "knowledge",  to: "reasoning"  }, { from: "tools",      to: "reasoning" },
  { from: "guardrails", to: "reasoning"  }, { from: "memory",     to: "knowledge"  },
  { from: "reasoning",  to: "tools"      }, { from: "reasoning",  to: "evals"      },
  { from: "evals",      to: "identity"   }, { from: "evals",      to: "guardrails" },
]

const PERSONA_COLORS: Record<PersonaId, number> = { analytical: 0xb0c4ff, creative: 0xffc87a, empathetic: 0xffb0cc, pragmatic: 0xd0d0d0 }
const MODEL_COLORS:   Record<ModelId,   number> = { claude: 0xd4662a, gpt: 0x10a37f, gemini: 0x4285f4, custom: 0x9b59b6 }

// ─── Material factories ────────────────────────────────────────────────────────

const MAT_LABELS: Record<MatType, string> = {
  gold: "Gold", brushedGold: "Brushed Gold", chrome: "Chrome", darkBronze: "Dark Bronze",
  roseGold: "Rose Gold", platinum: "Platinum", warmBronze: "Warm Bronze", brightGold: "Bright Gold",
}
const MAT_SWATCHES: Record<MatType, string> = {
  gold: "#d4a843", brushedGold: "#c09040", chrome: "#dedad4", darkBronze: "#3a2c1e",
  roseGold: "#c49070", platinum: "#e0dcd8", warmBronze: "#9e8b6f", brightGold: "#ffe080",
}

function mkMat(type: MatType, tintHex?: string): THREE.MeshStandardMaterial {
  const tint = tintHex ? parseInt(tintHex.replace("#", ""), 16) : undefined
  const base: Record<MatType, [number, number, number, number]> = {
    gold: [tint??0xd4a843,.12,.96,2.2], brushedGold:[tint??0xc09040,.32,.90,1.9],
    chrome:[tint??0xdedad4,.06,1.0,2.8], darkBronze:[tint??0x3a2c1e,.22,.82,1.6],
    roseGold:[tint??0xc49070,.16,.92,2.0], platinum:[tint??0xe0dcd8,.08,1.0,3.0],
    warmBronze:[tint??0x9e8b6f,.25,.85,1.8], brightGold:[tint??0xffe080,.03,1.0,4.0],
  }
  const [color,roughness,metalness,envMapIntensity] = base[type]
  return new THREE.MeshStandardMaterial({color,roughness,metalness,envMapIntensity})
}

// ─── Object builders ───────────────────────────────────────────────────────────

interface Rotator { obj: THREE.Object3D; rx?: number; ry?: number; rz?: number }
interface Built { group: THREE.Group; rotators: Rotator[]; allMeshes: THREE.Mesh[]; customUpdate?: (t:number)=>void }

function collectMeshes(g: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = []; g.traverse(o => { if (o instanceof THREE.Mesh) out.push(o) }); return out
}

function buildIdentity(s: ComponentStyle): Built {
  const g = new THREE.Group()
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(.72,64,64), mkMat(s.matType,s.tint)); sphere.castShadow=true; g.add(sphere)
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(.80,.018,16,96), mkMat("brightGold",s.tint)); r1.rotation.x=Math.PI*.22; g.add(r1)
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(.76,.009,12,80), mkMat("brightGold",s.tint)); r2.rotation.x=-Math.PI*.22; r2.rotation.y=Math.PI*.4; g.add(r2)
  return { group:g, rotators:[{obj:sphere,ry:.12},{obj:r1,rz:.07},{obj:r2,rz:-.09}], allMeshes:collectMeshes(g) }
}
function buildPrompt(s: ComponentStyle): Built {
  const g = new THREE.Group()
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(.38,.13,180,24,2,3), mkMat(s.matType,s.tint)); knot.castShadow=true; g.add(knot)
  const edge = new THREE.Mesh(new THREE.TorusKnotGeometry(.38,.142,80,10,2,3), new THREE.MeshStandardMaterial({color:0x1a1008,roughness:.7,metalness:.2,side:THREE.BackSide})); g.add(edge)
  return { group:g, rotators:[{obj:knot,rx:.28,ry:.18},{obj:edge,rx:.28,ry:.18}], allMeshes:[knot,edge] }
}
function buildMemory(s: ComponentStyle): Built {
  const g = new THREE.Group(); const spinner = new THREE.Group(); g.add(spinner)
  const mat = mkMat(s.matType,s.tint); const edgeMat = mkMat("brightGold",s.tint)
  const slabs: Array<{slab:THREE.Mesh;edge:THREE.Mesh;baseRot:number}> = []
  for (let i=0;i<5;i++) {
    const w=1.0-i*.1; const sl=new THREE.Mesh(new THREE.BoxGeometry(w,.088,w*.72),mat); sl.position.y=-.38+i*.22; sl.rotation.y=i*.15; sl.castShadow=true; spinner.add(sl)
    const ed=new THREE.Mesh(new THREE.BoxGeometry(w+.005,.005,w*.72+.005),edgeMat); ed.position.y=-.335+i*.22; ed.rotation.y=i*.15; spinner.add(ed)
    slabs.push({slab:sl,edge:ed,baseRot:i*.15})
  }
  return { group:g, rotators:[], allMeshes:collectMeshes(g), customUpdate:(t)=>slabs.forEach((s,i)=>{const r=s.baseRot+t*(.16+i*.02);s.slab.rotation.y=r;s.edge.rotation.y=r}) }
}
function buildKnowledge(s: ComponentStyle): Built {
  const g = new THREE.Group()
  const pts = [new THREE.Vector2(0,.72),new THREE.Vector2(.42,.2),new THREE.Vector2(.54,-.08),new THREE.Vector2(.36,-.4),new THREE.Vector2(0,-.72)]
  const gem = new THREE.Mesh(new THREE.LatheGeometry(pts,6), mkMat(s.matType,s.tint)); gem.castShadow=true; g.add(gem)
  g.add(new THREE.Mesh(new THREE.OctahedronGeometry(.22,0), mkMat("brightGold",s.tint)))
  return { group:g, rotators:[{obj:g,ry:.32},{obj:gem,ry:.12}], allMeshes:collectMeshes(g) }
}
function buildTools(s: ComponentStyle): Built {
  const g = new THREE.Group()
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(.65,64,64), mkMat(s.matType,s.tint)); sphere.castShadow=true; g.add(sphere)
  const bm = mkMat("brightGold",s.tint)
  const b1 = new THREE.Mesh(new THREE.TorusGeometry(.68,.012,12,90),bm); b1.rotation.x=Math.PI*.28; g.add(b1)
  const b2 = new THREE.Mesh(new THREE.TorusGeometry(.68,.012,12,90),bm); b2.rotation.x=-Math.PI*.28; g.add(b2)
  return { group:g, rotators:[{obj:sphere,ry:.11},{obj:b1,rz:.055},{obj:b2,rz:-.055}], allMeshes:collectMeshes(g) }
}
function buildModels(s: ComponentStyle): Built {
  const g = new THREE.Group(); const spinner = new THREE.Group(); g.add(spinner)
  const mat = mkMat(s.matType,s.tint)
  for (let i=0;i<4;i++) { const a=(i/4)*Math.PI*2; const t=new THREE.Mesh(new THREE.TetrahedronGeometry(.24,0),mat); t.position.set(Math.cos(a)*.52,Math.sin(i*1.4)*.12,Math.sin(a)*.52); t.castShadow=true; spinner.add(t) }
  spinner.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.2,0), mkMat("gold",s.tint)))
  return { group:g, rotators:[{obj:spinner,ry:.42}], allMeshes:collectMeshes(g) }
}
function buildReasoning(s: ComponentStyle): Built {
  const g = new THREE.Group()
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(.34,.1,200,20,3,5), mkMat(s.matType,s.tint)); knot.castShadow=true; g.add(knot)
  return { group:g, rotators:[{obj:knot,rx:.28,ry:.18}], allMeshes:[knot] }
}
function buildGuardrails(s: ComponentStyle): Built {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.28,.88,48,48), mkMat(s.matType,s.tint)); body.castShadow=true; g.add(body)
  const sm = mkMat("platinum",s.tint)
  ;[-.30,0,.30].forEach(y=>{const sl=new THREE.Mesh(new THREE.TorusGeometry(.284,.008,10,60),sm);sl.rotation.x=Math.PI/2;sl.position.y=y;g.add(sl)})
  return { group:g, rotators:[{obj:body,ry:.18},{obj:g,ry:.06}], allMeshes:collectMeshes(g) }
}
function buildEvals(s: ComponentStyle): Built {
  const g = new THREE.Group(); const mat = mkMat(s.matType,s.tint)
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(.60,.022,12,80),mat); g.add(r1)
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(.58,.015,12,80),mat); r2.rotation.y=Math.PI/2; g.add(r2)
  const r3 = new THREE.Mesh(new THREE.TorusGeometry(.56,.010,12,80),mat); r3.rotation.x=Math.PI/2; g.add(r3)
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.14,24,24), mkMat("brightGold",s.tint)))
  for (let i=0;i<8;i++){const a=(i/8)*Math.PI*2;const tick=new THREE.Mesh(new THREE.BoxGeometry(.04,.12,.02),mkMat("brightGold",s.tint));tick.position.set(Math.cos(a)*.62,Math.sin(a)*.62,0);tick.rotation.z=a;g.add(tick)}
  return { group:g, rotators:[{obj:r1,rx:.25,rz:.05},{obj:r2,ry:.3},{obj:r3,rx:.1,ry:.2}], allMeshes:collectMeshes(g) }
}

const BUILDERS: Record<PartId,(s:ComponentStyle)=>Built> = {
  identity:buildIdentity, prompt:buildPrompt, memory:buildMemory, knowledge:buildKnowledge,
  tools:buildTools, models:buildModels, reasoning:buildReasoning, guardrails:buildGuardrails, evals:buildEvals,
}
const DEFAULT_MAT: Record<PartId,MatType> = {
  identity:"gold", models:"warmBronze", prompt:"darkBronze", guardrails:"platinum",
  memory:"brushedGold", knowledge:"brushedGold", reasoning:"roseGold", tools:"chrome", evals:"chrome",
}

function easeInOutCubic(t: number) { return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2 }

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, maxLines = 3) {
  if (!text) { ctx.fillText("—", x, y); return }
  const words = text.split(" "); let line = ""; let row = 0
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y + row * lineH); row++; line = word
      if (row >= maxLines) { ctx.fillText(line + "…", x, y + row * lineH); return }
    } else line = test
  }
  if (line) ctx.fillText(line, x, y + row * lineH)
}

const F:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" }
const M:  React.CSSProperties = { fontFamily: "'DM Mono', monospace", fontWeight: 300 }
const CG: React.CSSProperties = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" }

export default function App() {
  const containerRef   = useRef<HTMLDivElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const rendererRef    = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef       = useRef<THREE.Scene | null>(null)
  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null)
  const focusPartCbRef = useRef<(id: PartId | null) => void>(() => {})
  const rebuildPartRef = useRef<(id: PartId, style: ComponentStyle) => void>(() => {})

  const [assembled,    setAssembled]    = useState(false)
  const [focusedPart,  setFocusedPart]  = useState<PartId | null>(null)
  const [config, setConfig] = useState<Config>({ agentName: "", model: "claude", persona: "analytical", active: new Set(PARTS.map(p=>p.id)) })
  const [panelOpen,    setPanelOpen]    = useState(true)
  const [world,        setWorld]        = useState<WorldId>("drift")
  const [customBg,     setCustomBg]     = useState<string | null>(null)
  const [exportOpen,   setExportOpen]   = useState(false)
  const [exportTab,    setExportTab]    = useState<ExportTab>("png")
  const [ambientThinking, setAmbientThinking] = useState(true)
  const [agentDef, setAgentDef] = useState<AgentDefinition>({
    role:"",purpose:"",inputContract:"",outputContract:"",allowedSkills:"",allowedTools:"",authorityLevel:"",escalationRules:"",knownLimitations:"",
  })
  const [compStyles, setCompStyles] = useState<Record<PartId,ComponentStyle>>(() => {
    const out = {} as Record<PartId,ComponentStyle>; PARTS.forEach(p=>{out[p.id]={matType:DEFAULT_MAT[p.id],tint:""}}); return out
  })

  const assembledRef  = useRef(false)
  const configRef     = useRef<Config>(config)
  const worldRef      = useRef<WorldId>("drift")
  const customBgRef   = useRef<string|null>(null)
  const ambientRef    = useRef(true)
  const compStylesRef = useRef(compStyles)

  useEffect(()=>{assembledRef.current=assembled},[assembled])
  useEffect(()=>{configRef.current=config},[config])
  useEffect(()=>{worldRef.current=world},[world])
  useEffect(()=>{customBgRef.current=customBg},[customBg])
  useEffect(()=>{ambientRef.current=ambientThinking},[ambientThinking])
  useEffect(()=>{compStylesRef.current=compStyles},[compStyles])

  useEffect(()=>{
    if (assembled) setAgentDef(prev=>{
      const defs = defaultDef(configRef.current)
      return Object.fromEntries(Object.entries(prev).map(([k,v])=>[k,v||(defs as any)[k]])) as AgentDefinition
    })
  },[assembled])

  const togglePart = useCallback((id:PartId)=>{
    setConfig(prev=>{const n=new Set(prev.active);n.has(id)?n.delete(id):n.add(id);return{...prev,active:n}})
  },[])

  const updateCompStyle = useCallback((id:PartId, patch:Partial<ComponentStyle>)=>{
    setCompStyles(prev=>{const n={...prev,[id]:{...prev[id],...patch}};rebuildPartRef.current(id,n[id]);return n})
  },[])

  useEffect(()=>{
    const container = containerRef.current; const canvas = canvasRef.current
    if (!container||!canvas) return

    const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true})
    renderer.setSize(container.clientWidth,container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15
    renderer.setClearColor(0xe4ddd4); rendererRef.current=renderer

    const scene = new THREE.Scene()
    scene.background=new THREE.Color(0xe4ddd4); scene.fog=new THREE.Fog(0xe4ddd4,28,65)
    sceneRef.current=scene

    const camera = new THREE.PerspectiveCamera(44,container.clientWidth/container.clientHeight,.1,140)
    camera.position.set(0,5.5,22); cameraRef.current=camera

    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture; pmrem.dispose()

    const controls = new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true; controls.dampingFactor=.05
    controls.minDistance=3; controls.maxDistance=38
    controls.maxPolarAngle=Math.PI*.48; controls.minPolarAngle=Math.PI*.04
    controls.target.set(0,3.2,0)

    interface CamAnim{fromP:THREE.Vector3;toP:THREE.Vector3;fromT:THREE.Vector3;toT:THREE.Vector3;t:number;dur:number}
    let camAnim:CamAnim|null=null
    const HOME_POS=new THREE.Vector3(0,5.5,22); const HOME_TGT=new THREE.Vector3(0,3.2,0)
    const _mwp=new THREE.Vector3()
    function startCamAnim(toP:THREE.Vector3,toT:THREE.Vector3,dur=1.25){camAnim={fromP:camera.position.clone(),toP:toP.clone(),fromT:controls.target.clone(),toT:toT.clone(),t:0,dur}}
    const focusedRef={current:null as PartId|null}
    function resetCamera(){startCamAnim(HOME_POS,HOME_TGT);setFocusedPart(null);focusedRef.current=null}

    const ambientLight=new THREE.AmbientLight(0xfff8ee,.9); scene.add(ambientLight)
    const hemiLight=new THREE.HemisphereLight(0xfff8ee,0xc8bfb0,1.1); scene.add(hemiLight)
    const sun=new THREE.DirectionalLight(0xfff8ee,2.6)
    sun.position.set(10,20,10); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048)
    sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-6
    sun.shadow.camera.near=1;sun.shadow.camera.far=80;sun.shadow.bias=-.0003;sun.shadow.normalBias=.014; scene.add(sun)
    const fill=new THREE.DirectionalLight(0xffe8d8,.7); fill.position.set(-14,8,-8); scene.add(fill)
    const moodLight=new THREE.PointLight(0xb0c4ff,.5,30,2); moodLight.position.set(0,16,0); scene.add(moodLight)
    const modelLight=new THREE.PointLight(0xd4662a,.8,10,2); scene.add(modelLight)

    const floorMat=new THREE.MeshStandardMaterial({color:0xc8c0b4,roughness:.72,metalness:.02})
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor)
    const wallMat=new THREE.MeshStandardMaterial({color:0xede8e2,roughness:.92,metalness:0})
    const backWall=new THREE.Mesh(new THREE.PlaneGeometry(100,28),wallMat); backWall.position.set(0,14,-13); scene.add(backWall)
    const leftWall=new THREE.Mesh(new THREE.PlaneGeometry(36,28),wallMat); leftWall.rotation.y=Math.PI/2; leftWall.position.set(-28,14,0); scene.add(leftWall)
    const rightWall=new THREE.Mesh(new THREE.PlaneGeometry(36,28),wallMat); rightWall.rotation.y=-Math.PI/2; rightWall.position.set(28,14,0); scene.add(rightWall)
    const ceilMat=new THREE.MeshStandardMaterial({color:0xf0ece6,roughness:1.0})
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(100,100),ceilMat); ceil.rotation.x=Math.PI/2; ceil.position.y=20; scene.add(ceil)
    const coveMat=new THREE.MeshStandardMaterial({color:0xfffdf8,emissive:new THREE.Color(0xfff8ee),emissiveIntensity:1.5,roughness:1})
    const coveLights:THREE.PointLight[]=[]
    for(let i=0;i<4;i++){const cx=-18+i*12;const cg=new THREE.Group();cg.position.set(cx,19.2,-5);cg.add(new THREE.Mesh(new THREE.BoxGeometry(9,.07,.8),coveMat));scene.add(cg);const pt=new THREE.PointLight(0xfff8ee,42,30,1.7);pt.position.set(cx,18,-5);scene.add(pt);coveLights.push(pt)}

    document.fonts.ready.then(()=>{
      const W=1800,H=260; const c=document.createElement("canvas"); c.width=W; c.height=H
      const ctx=c.getContext("2d")!; ctx.clearRect(0,0,W,H); ctx.textAlign="center"
      ctx.fillStyle="rgba(80,68,50,0.28)"; ctx.font="400 20px 'DM Sans',sans-serif"; ctx.fillText("THE ANATOMY OF INTELLIGENCE",W/2,44)
      ctx.strokeStyle="rgba(80,68,50,0.14)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W/2-340,60); ctx.lineTo(W/2+340,60); ctx.stroke()
      ctx.fillStyle="rgba(28,20,12,0.52)"; ctx.font="300 80px 'Cormorant Garamond',Georgia,serif"; ctx.fillText("assembl",W/2,158)
      ctx.fillStyle="rgba(80,68,50,0.22)"; ctx.font="300 17px 'DM Mono',monospace"; ctx.fillText("agent studio · assembl.co.nz",W/2,198)
      const plane=new THREE.Mesh(new THREE.PlaneGeometry(24,3.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}))
      plane.position.set(0,15.5,-12.7); scene.add(plane)
    })

    interface PartScene{id:PartId;def:PartDef;mainGroup:THREE.Group;objGroup:THREE.Group;floatGroup:THREE.Group;clickMesh:THREE.Mesh;currentPos:THREE.Vector3;floatPhase:number;rotators:Rotator[];allMeshes:THREE.Mesh[];spot:THREE.SpotLight;customUpdate?:(t:number)=>void;glowDisc:THREE.Mesh}
    const partScenes:PartScene[]=[]; const clickMeshes:THREE.Mesh[]=[]; const partMap=new Map<PartId,PartScene>()

    PARTS.forEach((def,i)=>{
      const style=compStylesRef.current[def.id]; const built=BUILDERS[def.id](style)
      const {group:objGroup,rotators,allMeshes}=built
      const floatGroup=new THREE.Group(); floatGroup.add(objGroup)
      const clickMesh=new THREE.Mesh(new THREE.SphereGeometry(.9,8,8),new THREE.MeshBasicMaterial({visible:false}))
      clickMesh.userData={partId:def.id}; floatGroup.add(clickMesh); clickMeshes.push(clickMesh)
      const mainGroup=new THREE.Group(); mainGroup.add(floatGroup); mainGroup.position.copy(def.naturalPos); scene.add(mainGroup)
      const spot=new THREE.SpotLight(0xfff8ee,45,22,.38,.72,2.0)
      spot.position.set(def.naturalPos.x,def.naturalPos.y+12,def.naturalPos.z+2); spot.target.position.copy(def.naturalPos); scene.add(spot); scene.add(spot.target)
      const glow=new THREE.Mesh(new THREE.CircleGeometry(.55,32),new THREE.MeshBasicMaterial({color:parseInt(def.colorHex.replace("#",""),16),transparent:true,opacity:.08}))
      glow.rotation.x=-Math.PI/2; glow.position.set(def.naturalPos.x,.01,def.naturalPos.z); scene.add(glow)
      const ps:PartScene={id:def.id,def,mainGroup,objGroup,floatGroup,clickMesh,currentPos:def.naturalPos.clone(),floatPhase:i*.78,rotators,allMeshes,spot,customUpdate:built.customUpdate,glowDisc:glow}
      partScenes.push(ps); partMap.set(def.id,ps)
    })

    rebuildPartRef.current=(id,style)=>{
      const ps=partMap.get(id); if(!ps) return
      ps.floatGroup.remove(ps.objGroup)
      ps.objGroup.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach((m:THREE.Material)=>m.dispose())}})
      const built=BUILDERS[id](style); ps.objGroup=built.group; ps.rotators=built.rotators; ps.allMeshes=built.allMeshes; ps.customUpdate=built.customUpdate; ps.floatGroup.add(ps.objGroup)
    }

    interface ConnScene{from:PartId;to:PartId;sharpLine:THREE.Line;glowLine:THREE.Line;particles:THREE.Mesh[];progresses:number[];speed:number}
    const connScenes:ConnScene[]=CONNECTIONS.map((c,i)=>{
      const mkLine=(op:number,add=false)=>{const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(6),3));return new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xd4a843,transparent:true,opacity:op,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:false}))}
      const sl=mkLine(.2); scene.add(sl); const gl=mkLine(.12,true); scene.add(gl)
      const particles:THREE.Mesh[]=[]; const progresses:number[]=[]
      for(let k=0;k<3;k++){const p=new THREE.Mesh(new THREE.SphereGeometry(.04-k*.009,6,6),new THREE.MeshBasicMaterial({color:0xffe080,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(p);particles.push(p);progresses.push((i*.1+k*.33)%1)}
      return{from:c.from,to:c.to,sharpLine:sl,glowLine:gl,particles,progresses,speed:.26+i*.012}
    })

    const makeOrbLayer=(count:number,radius:number,size:number)=>{
      const pos=new Float32Array(count*3)
      for(let i=0;i<count;i++){const phi=Math.acos(-1+(2*i)/count);const theta=Math.sqrt(count*Math.PI)*phi;const r=radius+(Math.random()-.5)*.35;pos[i*3]=Math.cos(theta)*Math.sin(phi)*r;pos[i*3+1]=Math.sin(theta)*Math.sin(phi)*r;pos[i*3+2]=Math.cos(phi)*r}
      const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3))
      const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xd4a843,size,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true}))
      pts.position.set(0,3.2,0); scene.add(pts); return pts
    }
    const orbShell=makeOrbLayer(1200,3.1,.042)
    const orbHaze=makeOrbLayer(600,3.9,.028)
    const orbCore=makeOrbLayer(800,2.4,.034)

    const bgCount=180; const bgPos=new Float32Array(bgCount*3)
    for(let i=0;i<bgCount*3;i+=3){bgPos[i]=(Math.random()-.5)*50;bgPos[i+1]=Math.random()*18+.5;bgPos[i+2]=(Math.random()-.5)*30-2}
    const bgGeo=new THREE.BufferGeometry();bgGeo.setAttribute("position",new THREE.BufferAttribute(bgPos,3))
    const bgParticles=new THREE.Points(bgGeo,new THREE.PointsMaterial({color:0xc0b898,size:.05,transparent:true,opacity:.35})); scene.add(bgParticles)

    let dragPartId:PartId|null=null; let pointerDownX=0; let pointerDownY=0
    const dragPlane=new THREE.Plane(); const dragOffset=new THREE.Vector3(); const dragIntersect=new THREE.Vector3()
    const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2()
    let hoveredId:PartId|null=null

    function focusComponent(id:PartId|null){
      if(id===null){resetCamera();return}
      if(focusedRef.current===id){resetCamera();return}
      focusedRef.current=id; setFocusedPart(id)
      const ps=partMap.get(id)!; ps.mainGroup.getWorldPosition(_mwp)
      startCamAnim(new THREE.Vector3(_mwp.x*.6,_mwp.y+.8,_mwp.z+6.0),new THREE.Vector3(_mwp.x,_mwp.y,_mwp.z))
    }
    focusPartCbRef.current=focusComponent

    const onPointerDown=(e:PointerEvent)=>{
      pointerDownX=e.clientX; pointerDownY=e.clientY
      const rect=canvas.getBoundingClientRect()
      pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1)
      raycaster.setFromCamera(pointer,camera)
      const hits=raycaster.intersectObjects(clickMeshes)
      if(hits.length){dragPartId=hits[0].object.userData.partId;controls.enabled=false;const ps=partMap.get(dragPartId)!;dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),ps.mainGroup.position);if(raycaster.ray.intersectPlane(dragPlane,dragIntersect))dragOffset.copy(ps.mainGroup.position).sub(dragIntersect)}
    }
    const onPointerMove=(e:PointerEvent)=>{
      const rect=canvas.getBoundingClientRect()
      pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1)
      if(dragPartId){raycaster.setFromCamera(pointer,camera);if(raycaster.ray.intersectPlane(dragPlane,dragIntersect)){const ps=partMap.get(dragPartId)!;const np=dragIntersect.clone().add(dragOffset);np.y=Math.max(1.2,np.y);ps.def.naturalPos.copy(np);ps.currentPos.copy(np);ps.mainGroup.position.copy(np);ps.glowDisc.position.set(np.x,.01,np.z);ps.spot.target.position.copy(np);ps.spot.target.updateMatrixWorld()}}
    }
    const onPointerUp=(e:PointerEvent)=>{if(dragPartId){const moved=Math.abs(e.clientX-pointerDownX)>7||Math.abs(e.clientY-pointerDownY)>7;if(!moved)focusComponent(dragPartId);dragPartId=null;controls.enabled=true}}
    const onResize=()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}

    canvas.addEventListener("pointerdown",onPointerDown)
    canvas.addEventListener("pointermove",onPointerMove)
    canvas.addEventListener("pointerup",onPointerUp)
    window.addEventListener("resize",onResize)

    const _tBg=new THREE.Color();const _cBg=new THREE.Color(0xe4ddd4)
    const _tFloor=new THREE.Color();const _tWall=new THREE.Color();const _tCeil=new THREE.Color()
    const _tLine=new THREE.Color();const _tGlow=new THREE.Color();const _tParticle=new THREE.Color()
    const _tEmissive=new THREE.Color();const _tMood=new THREE.Color();const _tModel=new THREE.Color()
    const _tOrb=new THREE.Color();const _from=new THREE.Vector3();const _to=new THREE.Vector3()
    const lerpPos=new THREE.Vector3()

    let animId:number; let prevTime=performance.now(); let elapsed=0

    const tick=()=>{
      animId=requestAnimationFrame(tick)
      const now=performance.now();const dt=Math.min((now-prevTime)/1000,.05);prevTime=now;elapsed+=dt
      const cfg=configRef.current;const asm=assembledRef.current;const w=WORLDS[worldRef.current]

      if(camAnim){camAnim.t=Math.min(1,camAnim.t+dt/camAnim.dur);const e=easeInOutCubic(camAnim.t);camera.position.lerpVectors(camAnim.fromP,camAnim.toP,e);controls.target.lerpVectors(camAnim.fromT,camAnim.toT,e);if(camAnim.t>=1)camAnim=null}
      controls.update()

      const cbg=customBgRef.current
      _tBg.setHex(cbg?parseInt(cbg.replace("#",""),16):w.bg)
      _cBg.lerp(_tBg,dt*2.2); renderer.setClearColor(_cBg)
      ;(scene.background as THREE.Color).copy(_cBg);(scene.fog as THREE.Fog).color.copy(_cBg)
      ;(scene.fog as THREE.Fog).near=w.fogNear;(scene.fog as THREE.Fog).far=w.fogFar
      _tFloor.setHex(w.floorHex);floorMat.color.lerp(_tFloor,dt*2)
      _tWall.setHex(w.wallHex);wallMat.color.lerp(_tWall,dt*2)
      _tCeil.setHex(w.ceilHex);ceilMat.color.lerp(_tCeil,dt*2)
      ambientLight.color.setHex(w.ambientHex);ambientLight.intensity+=(w.ambientInt-ambientLight.intensity)*dt*2
      hemiLight.color.setHex(w.hemiSky);hemiLight.groundColor.setHex(w.hemiGround);hemiLight.intensity+=(w.hemiInt-hemiLight.intensity)*dt*2
      sun.color.setHex(w.sunHex);sun.intensity+=(w.sunInt-sun.intensity)*dt*2
      fill.color.setHex(w.fillHex);fill.intensity+=(w.fillInt-fill.intensity)*dt*2
      coveLights.forEach(pt=>{pt.color.setHex(w.coveHex);pt.intensity+=(w.coveInt*42-pt.intensity)*dt*2})
      coveMat.emissive.setHex(w.coveHex);coveMat.emissiveIntensity+=(w.coveInt*1.5-coveMat.emissiveIntensity)*dt*2
      _tLine.setHex(w.lineHex);_tGlow.setHex(w.lineGlowHex);_tParticle.setHex(w.particleHex);_tEmissive.setHex(w.emissiveHex)
      ;(bgParticles.material as THREE.PointsMaterial).color.setHex(w.bgParticleHex)
      _tMood.setHex(PERSONA_COLORS[cfg.persona]);moodLight.color.lerp(_tMood,dt*1.5)
      _tModel.setHex(MODEL_COLORS[cfg.model]);modelLight.color.lerp(_tModel,dt*2)
      partMap.get("models")!.mainGroup.getWorldPosition(_mwp);modelLight.position.lerp(_mwp,.08)

      if(!dragPartId){
        raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickMeshes)
        const nh:PartId|null=hits.length?hits[0].object.userData.partId:null
        if(nh!==hoveredId){hoveredId=nh;canvas.style.cursor=nh?"grab":"default"}
      }
      if(dragPartId)canvas.style.cursor="grabbing"

      const lp=new THREE.Vector3()
      partScenes.forEach(ps=>{
        const isActive=cfg.active.has(ps.id);const isFocused=focusedRef.current===ps.id;const isDragged=dragPartId===ps.id
        if(!isDragged){
          lp.copy(asm?ps.def.assemblyPos:ps.def.naturalPos)
          if(!asm&&!isActive)lp.setY(lp.y-.4)
          ps.currentPos.lerp(lp,Math.min(dt*(asm?2.5:2.0),.12));ps.mainGroup.position.copy(ps.currentPos)
        }
        const ts=isFocused?1.22:hoveredId===ps.id?1.1:isActive?1.0:.7
        const cs=ps.mainGroup.scale.x;ps.mainGroup.scale.setScalar(cs+(ts-cs)*Math.min(dt*6,.25))
        ps.floatGroup.position.y=Math.sin(elapsed*.9+ps.floatPhase)*(isActive?.1:.04)
        ps.floatGroup.rotation.y+=dt*.14
        if(ps.customUpdate)ps.customUpdate(elapsed+ps.floatPhase*1.2)
        else ps.rotators.forEach(r=>{if(r.rx)r.obj.rotation.x+=r.rx*dt;if(r.ry)r.obj.rotation.y+=r.ry*dt;if(r.rz)r.obj.rotation.z+=r.rz*dt})
        ps.spot.target.position.copy(ps.mainGroup.position);ps.spot.target.updateMatrixWorld()
        ps.spot.intensity+=((isFocused?85:isActive?45:10)-ps.spot.intensity)*dt*3
        const tOp=isActive?1.0:.25
        ps.allMeshes.forEach(m=>{const mat=m.material as THREE.MeshStandardMaterial;if(mat.transparent)mat.opacity+=(tOp-mat.opacity)*dt*3;if(mat.emissive)mat.emissive.lerp(_tEmissive,dt*2);if(mat.emissiveIntensity!==undefined)mat.emissiveIntensity+=(w.emissiveInt-mat.emissiveIntensity)*dt*2})
        ;(ps.glowDisc.material as THREE.MeshBasicMaterial).opacity+=((isActive?.10:.02)-(ps.glowDisc.material as THREE.MeshBasicMaterial).opacity)*dt*3
      })

      connScenes.forEach((conn,ci)=>{
        conn.progresses.forEach((p,k)=>{conn.progresses[k]=(p+conn.speed*dt*(ambientRef.current?1:.04))%1})
        const fPs=partMap.get(conn.from)!;const tPs=partMap.get(conn.to)!
        _from.copy(fPs.mainGroup.position);_to.copy(tPs.mainGroup.position)
        const updLine=(line:THREE.Line,col:THREE.Color)=>{const pos=line.geometry.attributes.position as THREE.BufferAttribute;pos.setXYZ(0,_from.x,_from.y,_from.z);pos.setXYZ(1,_to.x,_to.y,_to.z);pos.needsUpdate=true;(line.material as THREE.LineBasicMaterial).color.lerp(col,dt*2.5)}
        updLine(conn.sharpLine,_tLine);updLine(conn.glowLine,_tGlow)
        const ba=cfg.active.has(conn.from)&&cfg.active.has(conn.to);const pulse=Math.sin(elapsed*1.2+ci*.38)*.06
        ;(conn.sharpLine.material as THREE.LineBasicMaterial).opacity+=((ba?w.lineOpacity+pulse:w.lineOpacity*.08)-(conn.sharpLine.material as THREE.LineBasicMaterial).opacity)*dt*4
        ;(conn.glowLine.material  as THREE.LineBasicMaterial).opacity+=((ba&&ambientRef.current?w.lineOpacity*.7+pulse:0)-(conn.glowLine.material as THREE.LineBasicMaterial).opacity)*dt*4
        conn.particles.forEach((p,k)=>{p.position.lerpVectors(_from,_to,conn.progresses[k]);(p.material as THREE.MeshBasicMaterial).color.lerp(_tParticle,dt*3);(p.material as THREE.MeshBasicMaterial).opacity+=((ba&&ambientRef.current?Math.sin(conn.progresses[k]*Math.PI)*(.75-k*.18):0)-(p.material as THREE.MeshBasicMaterial).opacity)*dt*5})
      })

      _tOrb.setHex(w.orbHex)
      const orbPulse=Math.sin(elapsed*.9)*.1+Math.sin(elapsed*2.3)*.04
      ;[orbShell,orbHaze,orbCore].forEach((orb,idx)=>{
        const mat=orb.material as THREE.PointsMaterial
        const targets=[asm?.52+orbPulse:0, asm?.28+orbPulse*.5:0, asm?.42+orbPulse:0]
        mat.opacity+=(targets[idx]-mat.opacity)*dt*(asm?1.8:3); mat.color.lerp(_tOrb,dt*2)
      })
      orbShell.rotation.y=elapsed*.11; orbShell.rotation.x=Math.sin(elapsed*.34)*.06
      orbHaze.rotation.y=-elapsed*.065; orbHaze.rotation.z=elapsed*.045
      orbCore.rotation.y=elapsed*.17; orbCore.rotation.z=Math.sin(elapsed*.4)*.07

      bgParticles.rotation.y=elapsed*.005
      renderer.render(scene,camera)
    }
    tick()

    return()=>{
      cancelAnimationFrame(animId);controls.dispose()
      canvas.removeEventListener("pointerdown",onPointerDown)
      canvas.removeEventListener("pointermove",onPointerMove)
      canvas.removeEventListener("pointerup",onPointerUp)
      window.removeEventListener("resize",onResize)
      renderer.dispose()
    }
  },[]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderAtSize = useCallback((w: number, h: number): HTMLCanvasElement => {
    const renderer = rendererRef.current!
    const container = containerRef.current!
    const scene = sceneRef.current!
    const camera = cameraRef.current!
    const origW = container.clientWidth
    const origH = container.clientHeight
    renderer.setPixelRatio(1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    const out = document.createElement("canvas"); out.width = w; out.height = h
    out.getContext("2d")!.drawImage(renderer.domElement, 0, 0, w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(origW, origH, false)
    camera.aspect = origW / origH
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    return out
  }, [])

  function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if ((ctx as any).roundRect) { (ctx as any).roundRect(x, y, w, h, r); return }
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y)
  }

  const exportPNG = useCallback(async ()=>{
    try{await document.fonts.load("300 80px 'Cormorant Garamond'")}catch(_){}
    const W=2160,H=2160
    const sceneH = Math.round(W * 9/16)
    const snap = renderAtSize(W, sceneH)
    const c=document.createElement("canvas"); c.width=W; c.height=H
    const ctx=c.getContext("2d")!
    const isDark=world==="deep"
    const worldHex=customBg?parseInt(customBg.replace("#",""),16):WORLDS[world].bg
    const [wr,wg,wb]=[(worldHex>>16)&255,(worldHex>>8)&255,worldHex&255]
    ctx.drawImage(snap,0,0,W,sceneH)
    const fadeStart=sceneH-Math.round(W*.08)
    const g=ctx.createLinearGradient(0,fadeStart,0,sceneH+80)
    g.addColorStop(0,`rgba(${wr},${wg},${wb},0)`)
    g.addColorStop(1,`rgba(${wr},${wg},${wb},1)`)
    ctx.fillStyle=g; ctx.fillRect(0,fadeStart,W,sceneH-fadeStart+80)
    ctx.fillStyle=`rgb(${wr},${wg},${wb})`; ctx.fillRect(0,sceneH+80,W,H-sceneH-80)
    const FG0=isDark?"rgba(220,225,255,0.90)":"rgba(22,16,8,0.86)"
    const FG1=isDark?"rgba(180,190,220,0.55)":"rgba(70,58,42,0.52)"
    const FG2=isDark?"rgba(140,155,200,0.28)":"rgba(80,68,50,0.24)"
    const DIV=isDark?"rgba(180,190,220,0.12)":"rgba(28,24,18,0.10)"
    const pad=Math.round(W*.12)
    let y=sceneH+Math.round(W*.055)
    if(config.agentName){
      ctx.textAlign="center"; ctx.fillStyle=FG0
      ctx.font=`300 ${Math.round(W*.038)}px 'Cormorant Garamond',Georgia,serif`
      ctx.fillText(config.agentName,W/2,y); y+=Math.round(W*.048)
    }
    ctx.textAlign="center"; ctx.fillStyle=FG1
    ctx.font=`300 ${Math.round(W*.0088)}px 'DM Mono',monospace`
    ;(ctx as any).letterSpacing="0.22em"
    ctx.fillText(`${config.model.toUpperCase()} · ${config.persona.toUpperCase()} · ${world.toUpperCase()}`,W/2,y)
    ;(ctx as any).letterSpacing="0"; y+=Math.round(W*.032)
    ctx.strokeStyle=DIV; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke()
    y+=Math.round(W*.026)
    const active=PARTS.filter(p=>config.active.has(p.id))
    const cols=Math.min(active.length,active.length<=6?3:5)
    const rows=Math.ceil(active.length/cols)
    const cellW=Math.round((W-pad*2)/cols)
    const nameFs=Math.round(W*.013)
    ctx.font=`400 ${nameFs}px 'DM Sans',sans-serif`
    active.forEach((p,i)=>{
      const col=i%cols,row=Math.floor(i/cols)
      const cx=pad+col*cellW+cellW/2
      const cy=y+row*Math.round(W*.038)
      const tw=ctx.measureText(p.name).width
      const dotX=cx-tw/2-Math.round(W*.005)
      ctx.fillStyle=p.colorHex; ctx.beginPath(); ctx.arc(dotX,cy-nameFs*.28,Math.round(W*.003),0,Math.PI*2); ctx.fill()
      ctx.fillStyle=FG1; ctx.textAlign="left"; ctx.fillText(p.name,cx-tw/2+Math.round(W*.006),cy)
    })
    y+=rows*Math.round(W*.038)+Math.round(W*.02)
    ctx.strokeStyle=DIV; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pad,H-Math.round(W*.065)); ctx.lineTo(W-pad,H-Math.round(W*.065)); ctx.stroke()
    ctx.textAlign="center"; ctx.fillStyle=FG2
    ctx.font=`300 ${Math.round(W*.022)}px 'Cormorant Garamond',Georgia,serif`
    ctx.fillText("assembl",W/2,H-Math.round(W*.034))
    ctx.font=`300 ${Math.round(W*.008)}px 'DM Mono',monospace`
    ;(ctx as any).letterSpacing="0.2em"; ctx.fillStyle=isDark?"rgba(140,155,200,0.18)":"rgba(80,68,50,0.16)"
    ctx.fillText("ASSEMBL.CO.NZ",W/2,H-Math.round(W*.015));(ctx as any).letterSpacing="0"
    const a=document.createElement("a"); a.download=`${config.agentName||"agent"}-assembl.png`; a.href=c.toDataURL("image/png"); a.click()
  },[config,world,customBg,renderAtSize])

  const exportPDF = useCallback(async()=>{
    try{await document.fonts.load("300 80px 'Cormorant Garamond'")}catch(_){}
    const W=2480,H=3508
    const S=W/595
    const M=Math.round(S*28)
    const cW=W-M*2
    const rW=cW, rH=Math.round(rW*9/16)
    const snap=renderAtSize(rW,rH)
    const c=document.createElement("canvas"); c.width=W; c.height=H
    const ctx=c.getContext("2d")!
    const isDark=world==="deep"; const pdfBg=WORLDS[world].pdfBg
    ctx.fillStyle=pdfBg; ctx.fillRect(0,0,W,H)
    const FG0=isDark?"rgba(220,225,255,0.90)":"rgba(18,12,6,0.88)"
    const FG1=isDark?"rgba(180,190,220,0.62)":"rgba(60,48,32,0.62)"
    const FG2=isDark?"rgba(140,155,200,0.35)":"rgba(80,68,50,0.32)"
    const BDR=isDark?"rgba(180,190,220,0.10)":"rgba(80,68,50,0.11)"
    const p=(n:number)=>Math.round(n)
    const hdrY=Math.round(S*36)
    ctx.textAlign="left"; ctx.fillStyle=FG0
    ctx.font=`300 ${p(S*30)}px 'Cormorant Garamond',Georgia,serif`
    ctx.fillText("assembl",M,hdrY)
    ctx.textAlign="right"; ctx.fillStyle=FG2
    ctx.font=`300 ${p(S*7.5)}px 'DM Mono',monospace`
    ;(ctx as any).letterSpacing="0.2em"
    ctx.fillText("ASSEMBL.CO.NZ",W-M,hdrY-p(S*4))
    ctx.fillText("AGENT STUDIO",W-M,hdrY+p(S*9))
    ;(ctx as any).letterSpacing="0"
    ctx.strokeStyle=BDR; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(M,hdrY+p(S*16)); ctx.lineTo(W-M,hdrY+p(S*16)); ctx.stroke()
    let curY=hdrY+p(S*52)
    ctx.textAlign="center"; ctx.fillStyle=FG0
    ctx.font=`300 ${p(S*38)}px 'Cormorant Garamond',Georgia,serif`
    ctx.fillText(config.agentName||"Unnamed Agent",W/2,curY); curY+=p(S*18)
    ctx.fillStyle=FG1
    ctx.font=`300 ${p(S*8)}px 'DM Mono',monospace`
    ;(ctx as any).letterSpacing="0.2em"
    ctx.fillText(`${config.model.toUpperCase()} · ${config.persona.toUpperCase()} · ${world.toUpperCase()}`,W/2,curY)
    ;(ctx as any).letterSpacing="0"; curY+=p(S*28)
    const rR=p(S*7)
    ctx.save(); ctx.beginPath(); rr(ctx,M,curY,rW,rH,rR); ctx.closePath(); ctx.clip()
    ctx.drawImage(snap,M,curY,rW,rH)
    ctx.restore()
    ctx.strokeStyle=BDR; ctx.lineWidth=1; ctx.beginPath(); rr(ctx,M,curY,rW,rH,rR); ctx.closePath(); ctx.stroke()
    curY+=rH+p(S*24)
    ctx.textAlign="left"; ctx.fillStyle=FG2
    ctx.font=`300 ${p(S*6.5)}px 'DM Mono',monospace`
    ;(ctx as any).letterSpacing="0.26em"; ctx.fillText("COMPONENTS",M,curY); ;(ctx as any).letterSpacing="0"
    curY+=p(S*14)
    const active=PARTS.filter(p2=>config.active.has(p2.id))
    const tagFs=p(S*8.5), tagH=p(S*18), tagR=p(S*4), tagDot=p(S*3.5), tagPad=p(S*10), tagGap=p(S*5)
    ctx.font=`400 ${tagFs}px 'DM Sans',sans-serif`
    let tx=M, ty=curY+tagH
    active.forEach(pt=>{
      const tw=ctx.measureText(pt.name).width+tagPad*2+tagDot*2+p(S*4)
      if(tx+tw>W-M){tx=M;ty+=tagH+p(S*7)}
      ctx.fillStyle=isDark?"rgba(180,190,220,0.06)":"rgba(80,68,50,0.06)";ctx.beginPath();rr(ctx,tx,ty-tagH+p(S*2),tw,tagH,tagR);ctx.closePath();ctx.fill()
      ctx.strokeStyle=isDark?`${pt.colorHex}44`:`${pt.colorHex}33`;ctx.lineWidth=1;ctx.beginPath();rr(ctx,tx,ty-tagH+p(S*2),tw,tagH,tagR);ctx.closePath();ctx.stroke()
      ctx.fillStyle=pt.colorHex;ctx.beginPath();ctx.arc(tx+tagPad,ty-tagH/2+p(S*2),tagDot,0,Math.PI*2);ctx.fill()
      ctx.fillStyle=FG1;ctx.fillText(pt.name,tx+tagPad+tagDot+p(S*4),ty-p(S*2))
      tx+=tw+tagGap
    })
    curY=ty+p(S*28)
    const cardPad=p(S*22), cardR2=p(S*10)
    const fieldCols=3, fieldColW=Math.floor((cW-cardPad*2)/fieldCols)
    const labelFs=p(S*6), valueFs=p(S*9), lineH=valueFs*1.65
    const rowH=p(S*42)
    const fieldRows=Math.ceil(DEFINITION_FIELDS.length/fieldCols)
    const cardH=cardPad*2+p(S*22)+fieldRows*rowH+p(S*10)
    ctx.fillStyle=isDark?"rgba(255,255,255,0.025)":"rgba(255,255,255,0.58)"
    ctx.beginPath(); rr(ctx,M,curY,cW,cardH,cardR2); ctx.closePath(); ctx.fill()
    ctx.strokeStyle=BDR; ctx.lineWidth=1
    ctx.beginPath(); rr(ctx,M,curY,cW,cardH,cardR2); ctx.closePath(); ctx.stroke()
    ctx.textAlign="left"; ctx.fillStyle=FG2
    ctx.font=`300 ${p(S*6.5)}px 'DM Mono',monospace`
    ;(ctx as any).letterSpacing="0.26em"; ctx.fillText("AGENT DEFINITION",M+cardPad,curY+p(S*18)); ;(ctx as any).letterSpacing="0"
    ctx.strokeStyle=isDark?"rgba(255,255,255,0.06)":"rgba(80,68,50,0.07)"; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(M+cardPad,curY+p(S*24)); ctx.lineTo(M+cW-cardPad,curY+p(S*24)); ctx.stroke()
    const fStartY=curY+cardPad+p(S*16)
    DEFINITION_FIELDS.forEach((field,i)=>{
      const col=i%fieldCols,row=Math.floor(i/fieldCols)
      const fx=M+cardPad+col*fieldColW, fy=fStartY+row*rowH
      ctx.font=`500 ${labelFs}px 'DM Sans',sans-serif`
      ctx.fillStyle=isDark?"rgba(140,155,200,0.50)":"rgba(80,68,50,0.46)"
      ;(ctx as any).letterSpacing="0.2em"; ctx.textAlign="left"; ctx.fillText(field.label.toUpperCase(),fx,fy); ;(ctx as any).letterSpacing="0"
      ctx.font=`300 ${valueFs}px 'DM Sans',sans-serif`
      ctx.fillStyle=isDark?"rgba(180,190,220,0.80)":"rgba(22,14,6,0.76)"
      wrapText(ctx,agentDef[field.key]||"—",fx,fy+p(S*11),fieldColW-p(S*10),lineH,3)
    })
    curY+=cardH+p(S*20)
    ctx.strokeStyle=BDR; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(M,curY); ctx.lineTo(W-M,curY); ctx.stroke()
    curY+=p(S*18)
    ctx.textAlign="center"
    ctx.font=`300 ${p(S*14)}px 'Cormorant Garamond',Georgia,serif`; ctx.fillStyle=FG2
    ctx.fillText("assembl.co.nz",W/2,curY); curY+=p(S*16)
    ctx.font=`300 ${p(S*7.5)}px 'Cormorant Garamond',Georgia,serif`
    ctx.fillStyle=isDark?"rgba(140,155,200,0.24)":"rgba(80,68,50,0.22)"
    ctx.fillText("assembl creates agentic customer journeys that understand what people need, complete the work around them, and prove the experience is improving.",W/2,curY)
    const pdf=new jsPDF({orientation:"portrait",unit:"px",format:[W,H],hotfixes:["px_scaling"]})
    pdf.addImage(c.toDataURL("image/jpeg",.96),"JPEG",0,0,W,H)
    pdf.save(`${config.agentName||"agent"}-assembl.pdf`)
  },[config,world,agentDef,renderAtSize])

  const exportPage = useCallback(()=>{
    const activeIds=Array.from(config.active)
    const html=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${config.agentName||"assembl agent"}</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:${WORLDS[world].pdfBg};font-family:'DM Sans',sans-serif}#c{display:block;width:100%;height:100%}</style></head><body><canvas id="c"></canvas><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"}}<\/script><script type="module">import*as THREE from'three';import{OrbitControls}from'three/addons/controls/OrbitControls.js';import{RoomEnvironment}from'three/addons/environments/RoomEnvironment.js';const canvas=document.getElementById('c');const R=new THREE.WebGLRenderer({canvas,antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));R.toneMapping=THREE.ACESFilmicToneMapping;R.setClearColor(${WORLDS[world].bg});const S=new THREE.Scene();S.background=new THREE.Color(${WORLDS[world].bg});const C=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,140);C.position.set(0,5.5,22);const pmrem=new THREE.PMREMGenerator(R);S.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();const ctrl=new OrbitControls(C,R.domElement);ctrl.enableDamping=true;ctrl.target.set(0,3.2,0);S.add(new THREE.AmbientLight(${WORLDS[world].ambientHex},${WORLDS[world].ambientInt}));const sun=new THREE.DirectionalLight(${WORLDS[world].sunHex},${WORLDS[world].sunInt});sun.position.set(10,20,10);sun.castShadow=true;S.add(sun);const fl=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:${WORLDS[world].floorHex},roughness:.72}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;S.add(fl);let prev=performance.now(),el=0;(function tick(){requestAnimationFrame(tick);const dt=Math.min((performance.now()-prev)/1e3,.05);prev=performance.now();el+=dt;ctrl.update();R.render(S,C)})();window.addEventListener('resize',()=>{C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});<\/script></body></html>`
    const blob=new Blob([html],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.download=`${config.agentName||"agent"}-assembl.html`;a.href=url;a.click();URL.revokeObjectURL(url)
  },[config,world])

  const exportCode = useCallback(()=>{
    const data={_source:"assembl.co.nz",name:config.agentName||"Unnamed Agent",model:config.model,persona:config.persona,world,capabilities:Object.fromEntries(PARTS.map(p=>[p.id,config.active.has(p.id)])),componentStyles:compStyles,definition:agentDef}
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.download=`${config.agentName||"agent"}-assembl.json`;a.href=url;a.click();URL.revokeObjectURL(url)
  },[config,world,compStyles,agentDef])

  const exportReact = useCallback(()=>{
    const n=(config.agentName||"Agent").replace(/[^a-zA-Z0-9]/g,"").replace(/^[^a-zA-Z]/,"A")||"Agent"
    const src=`// assembl.co.nz\nexport default function ${n}Agent(){ return <canvas /> }`
    const blob=new Blob([src],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.download=`${n}Agent.tsx`;a.href=url;a.click();URL.revokeObjectURL(url)
  },[config])

  const focusedDef = PARTS.find(p=>p.id===focusedPart)
  const isDark = world==="deep"
  const fg      = isDark?"rgba(200,210,240,0.65)":"rgba(28,24,18,0.55)"
  const fgSub   = isDark?"rgba(200,210,240,0.32)":"rgba(28,24,18,0.32)"
  const fgStrong = isDark?"rgba(220,225,255,0.9)":"#1a1712"
  const panelBg = isDark?"rgba(10,10,20,0.92)":"rgba(244,240,234,0.96)"
  const panelBdr = isDark?"rgba(255,255,255,0.07)":"rgba(28,24,18,0.1)"
  const divBdr  = isDark?"rgba(255,255,255,0.05)":"rgba(28,24,18,0.07)"
  const inputBdr = isDark?"rgba(255,255,255,0.12)":"rgba(28,24,18,0.12)"

  const EXPORT_TABS: Array<{id:ExportTab;label:string;sub:string}> = [
    {id:"png",  label:"PNG",  sub:"2160px social"},
    {id:"pdf",  label:"PDF",  sub:"A4 document"},
    {id:"page", label:"Page", sub:"embeddable HTML"},
    {id:"code", label:"JSON", sub:"config"},
    {id:"react",label:"React",sub:"TSX component"},
  ]

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden"
      style={{background:customBg??WORLD_CSS[world],fontFamily:"'DM Sans',sans-serif"}}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {panelOpen&&!assembled&&(
          <motion.div className="absolute top-1/2 left-5 -translate-y-1/2 w-[236px] pointer-events-auto z-20"
            initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:.5}}
            style={{maxHeight:"calc(100vh - 80px)",overflowY:"auto"}}>
            <div className="rounded-[14px]" style={{background:panelBg,backdropFilter:"blur(22px)",border:`1px solid ${panelBdr}`}}>
              <div className="px-5 py-4" style={{borderBottom:`1px solid ${divBdr}`}}>
                <span className="text-[9px] tracking-[0.38em] uppercase" style={{...M,color:fgSub}}>Agent Design</span>
              </div>
              <div className="px-5 py-4 space-y-5">
                <div>
                  <label className="block text-[8.5px] tracking-[0.18em] uppercase mb-2" style={{...M,color:fgSub}}>Name</label>
                  <input type="text" placeholder="Unnamed agent" value={config.agentName}
                    onChange={e=>setConfig(c=>({...c,agentName:e.target.value}))}
                    className="w-full bg-transparent text-[11px] outline-none pb-1"
                    style={{...F,fontWeight:400,color:fgStrong,borderBottom:`1px solid ${inputBdr}`,caretColor:isDark?"#8888ff":"#333"}} />
                </div>
                <div>
                  <label className="block text-[8.5px] tracking-[0.18em] uppercase mb-2.5" style={{...M,color:fgSub}}>World</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["drift","ore","deep","schema"] as WorldId[]).map(w=>(
                      <button key={w} onClick={()=>{setWorld(w);setCustomBg(null)}}
                        className="flex items-center gap-2 py-1.5 px-2.5 rounded-[8px] transition-all duration-200"
                        style={{background:world===w&&!customBg?(isDark?"rgba(100,120,255,0.14)":"rgba(28,24,18,0.07)"):"transparent",border:`1px solid ${world===w&&!customBg?(isDark?"rgba(100,120,255,0.22)":"rgba(28,24,18,0.14)"):inputBdr}`}}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/10" style={{background:WORLD_SWATCH[w]}}/>
                        <span className="text-[8.5px] tracking-[0.1em] uppercase capitalize" style={{...M,color:world===w&&!customBg?(isDark?"rgba(160,180,255,.9)":"#3a3020"):fgSub}}>{w}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[8.5px] tracking-[0.18em] uppercase mb-2.5" style={{...M,color:fgSub}}>Background</label>
                  <div className="flex items-center gap-2.5">
                    <label className="relative w-8 h-8 rounded-[6px] overflow-hidden cursor-pointer border" style={{borderColor:inputBdr}}>
                      <input type="color" value={customBg??WORLD_CSS[world]} onChange={e=>setCustomBg(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"/>
                      <div className="absolute inset-0 rounded-[5px]" style={{background:customBg??WORLD_CSS[world]}}/>
                    </label>
                    <span className="text-[9px]" style={{...M,color:fgSub}}>{customBg??"world default"}</span>
                    {customBg&&<button onClick={()=>setCustomBg(null)} className="text-[8px] underline" style={{color:fgSub}}>reset</button>}
                  </div>
                </div>
                <div>
                  <label className="block text-[8.5px] tracking-[0.18em] uppercase mb-2.5" style={{...M,color:fgSub}}>Model</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["claude","gpt","gemini","custom"] as ModelId[]).map(m=>{
                      const mc=m==="claude"?"#d4662a":m==="gpt"?"#10a37f":m==="gemini"?"#4285f4":"#9b59b6"
                      return(<button key={m} onClick={()=>setConfig(c=>({...c,model:m}))} className="py-1.5 rounded-[8px] text-[8.5px] tracking-[0.1em] uppercase transition-all duration-200"
                        style={{...M,background:config.model===m?`${mc}18`:"transparent",color:config.model===m?mc:fgSub,border:`1px solid ${config.model===m?`${mc}40`:inputBdr}`}}>
                        {m==="custom"?"Custom":m.charAt(0).toUpperCase()+m.slice(1)}</button>)
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[8.5px] tracking-[0.18em] uppercase mb-2.5" style={{...M,color:fgSub}}>Persona</label>
                  <div className="space-y-1.5">
                    {(["analytical","creative","empathetic","pragmatic"] as PersonaId[]).map(p=>(
                      <button key={p} onClick={()=>setConfig(c=>({...c,persona:p}))} className="flex items-center gap-2.5 w-full">
                        <div className="w-2.5 h-2.5 rounded-full border transition-all duration-200 flex-shrink-0"
                          style={{borderColor:config.persona===p?(isDark?"#8888ee":"#6a5840"):inputBdr,background:config.persona===p?(isDark?"#8888ee":"#6a5840"):"transparent"}}/>
                        <span className="text-[9px] tracking-[0.08em] capitalize" style={{...F,color:config.persona===p?fgStrong:fgSub}}>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8.5px] tracking-[0.18em] uppercase" style={{...M,color:fgSub}}>Ambient Thinking</p>
                  </div>
                  <button onClick={()=>setAmbientThinking(a=>!a)}
                    className="w-9 h-5 rounded-full relative transition-all duration-300 flex-shrink-0"
                    style={{background:ambientThinking?(isDark?"#6080ff":"#6a5840"):(isDark?"rgba(255,255,255,0.1)":"rgba(28,24,18,0.12)")}}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300" style={{left:ambientThinking?"calc(100% - 18px)":"2px"}}/>
                  </button>
                </div>
                <div>
                  <label className="block text-[8.5px] tracking-[0.18em] uppercase mb-2.5" style={{...M,color:fgSub}}>Capabilities</label>
                  <div className="space-y-1.5">
                    {PARTS.map(p=>(
                      <button key={p.id} onClick={()=>togglePart(p.id)} className="flex items-center gap-2.5 w-full">
                        <div className="w-2.5 h-2.5 rounded-sm border transition-all duration-200 flex-shrink-0 flex items-center justify-center"
                          style={{borderColor:config.active.has(p.id)?(isDark?"#8888ee":"#6a5840"):inputBdr,background:config.active.has(p.id)?(isDark?"#8888ee":"#6a5840"):"transparent"}}>
                          {config.active.has(p.id)&&<svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 2" stroke="white" strokeWidth="1" strokeLinecap="round"/></svg>}
                        </div>
                        <span className="text-[9px]" style={{...F,color:config.active.has(p.id)?fgStrong:fgSub}}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {focusedDef&&!assembled&&(
          <motion.div className="absolute top-1/2 right-5 -translate-y-1/2 w-[272px] pointer-events-auto z-20"
            initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}}
            transition={{duration:.5,ease:[.16,1,.3,1]}}>
            <div className="rounded-[14px]" style={{background:panelBg,backdropFilter:"blur(22px)",border:`1px solid ${panelBdr}`}}>
              <div className="p-6 pb-4">
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{...M,color:focusedDef.colorHex}}>{focusedDef.cat}</p>
                <p className="leading-[1.2] mt-1.5" style={{...CG,fontWeight:400,fontSize:26,color:fgStrong}}>{focusedDef.name}</p>
                <p className="text-[9px] mt-1 tracking-[0.08em]" style={{...M,color:fgSub,fontStyle:"italic"}}>{focusedDef.tagline}</p>
                <p className="text-[12px] leading-[1.75] mt-3" style={{...F,color:isDark?"rgba(180,190,220,.55)":"#7a756e"}}>{focusedDef.desc}</p>
              </div>
              <div style={{height:1,background:divBdr}}/>
              <div className="px-6 py-4 space-y-1.5">
                {focusedDef.features.map(f=>(
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:focusedDef.colorHex,opacity:.7}}/>
                    <span className="text-[11.5px]" style={{...F,color:isDark?"rgba(180,190,220,.6)":"#5e5a54"}}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{height:1,background:divBdr}}/>
              <div className="px-6 py-4">
                <p className="text-[8.5px] tracking-[0.18em] uppercase mb-3" style={{...M,color:fgSub}}>Material</p>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {(Object.keys(MAT_LABELS) as MatType[]).map(mt=>{
                    const cs=compStyles[focusedDef.id]
                    return(<button key={mt} onClick={()=>updateCompStyle(focusedDef.id,{matType:mt})} title={MAT_LABELS[mt]}
                      className="aspect-square rounded-[6px] transition-all duration-200"
                      style={{background:MAT_SWATCHES[mt],border:`2px solid ${cs?.matType===mt?fgStrong:"transparent"}`,boxShadow:cs?.matType===mt?"0 0 0 1px rgba(0,0,0,0.15)":"none"}}/>)
                  })}
                </div>
                <div className="flex items-center gap-2.5">
                  <label className="text-[8.5px] tracking-[0.12em] uppercase" style={{...M,color:fgSub}}>Tint</label>
                  <label className="relative w-6 h-6 rounded-[4px] overflow-hidden cursor-pointer border" style={{borderColor:inputBdr}}>
                    <input type="color" value={compStyles[focusedDef.id]?.tint||focusedDef.colorHex} onChange={e=>updateCompStyle(focusedDef.id,{tint:e.target.value})} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"/>
                    <div className="absolute inset-0 rounded-[3px]" style={{background:compStyles[focusedDef.id]?.tint||focusedDef.colorHex}}/>
                  </label>
                  {compStyles[focusedDef.id]?.tint&&<button onClick={()=>updateCompStyle(focusedDef.id,{tint:""})} className="text-[8px] underline" style={{color:fgSub}}>clear</button>}
                </div>
              </div>
              <div style={{height:1,background:divBdr}}/>
              <div className="px-6 py-4">
                <button onClick={()=>togglePart(focusedDef.id)} className="w-full py-2 text-[8.5px] tracking-[0.2em] uppercase rounded-[8px] transition-all duration-200"
                  style={{...M,background:config.active.has(focusedDef.id)?(isDark?"rgba(100,120,200,.14)":"rgba(28,24,18,.07)"):"transparent",color:config.active.has(focusedDef.id)?(isDark?"rgba(160,180,255,.8)":"#6a5840"):fgSub,border:`1px solid ${panelBdr}`}}>
                  {config.active.has(focusedDef.id)?"Active · click to disable":"Disabled · click to enable"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assembled&&(
          <motion.div className="absolute top-1/2 right-5 -translate-y-1/2 w-[300px] pointer-events-auto z-20"
            initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}}
            transition={{duration:.7,ease:[.16,1,.3,1]}}
            style={{maxHeight:"calc(100vh - 80px)",overflowY:"auto"}}>
            <div className="rounded-[14px]" style={{background:panelBg,backdropFilter:"blur(24px)",border:`1px solid ${panelBdr}`}}>
              <div className="px-6 pt-5 pb-4" style={{borderBottom:`1px solid ${divBdr}`}}>
                <p className="text-[9px] tracking-[0.38em] uppercase" style={{...M,color:fgSub}}>Agent Definition</p>
                {config.agentName
                  ?<p className="mt-1.5" style={{...CG,fontWeight:400,fontSize:22,color:fgStrong}}>{config.agentName}</p>
                  :<p className="mt-1" style={{...CG,fontStyle:"italic",fontSize:16,color:fgSub}}>Unnamed agent</p>}
                <p className="text-[9px] mt-0.5" style={{...M,color:fgSub}}>{config.model} · {config.persona} · {Array.from(config.active).length} components</p>
              </div>
              <div className="px-6 py-4 space-y-4">
                {DEFINITION_FIELDS.map(field=>(
                  <div key={field.key}>
                    <label className="block text-[8px] tracking-[0.22em] uppercase mb-1.5" style={{...M,color:fgSub}}>{field.label}</label>
                    <textarea value={agentDef[field.key]} onChange={e=>setAgentDef(prev=>({...prev,[field.key]:e.target.value}))}
                      rows={2} className="w-full bg-transparent text-[10.5px] leading-[1.68] outline-none resize-none"
                      style={{...F,color:fg,borderBottom:`1px solid ${divBdr}`,paddingBottom:"6px"}}/>
                  </div>
                ))}
              </div>
              <div className="px-6 py-5" style={{borderTop:`1px solid ${divBdr}`}}>
                <p className="text-[10.5px] leading-[1.78]" style={{...CG,fontStyle:"italic",color:fgSub}}>assembl creates agentic customer journeys.</p>
                <p className="text-[8px] mt-3 tracking-[0.12em]" style={{...M,color:fgSub+"80"}}>assembl.co.nz</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportOpen&&(
          <motion.div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="absolute inset-0" style={{backdropFilter:"blur(6px)",background:isDark?"rgba(0,0,8,.72)":"rgba(212,206,198,.72)"}} onClick={()=>setExportOpen(false)}/>
            <motion.div className="relative z-10 flex rounded-[18px] overflow-hidden"
              style={{width:580,maxHeight:"min(82vh,640px)",background:isDark?"rgba(8,8,18,.98)":"rgba(246,242,237,.98)",border:`1px solid ${panelBdr}`,boxShadow:isDark?"0 32px 64px rgba(0,0,0,.6)":"0 32px 64px rgba(0,0,0,.14)"}}
              initial={{scale:.97,y:10}} animate={{scale:1,y:0}} exit={{scale:.97,y:10}}
              transition={{duration:.32,ease:[.16,1,.3,1]}}>
              <div className="flex flex-col flex-shrink-0" style={{width:164,borderRight:`1px solid ${divBdr}`}}>
                <div className="px-5 pt-6 pb-5" style={{borderBottom:`1px solid ${divBdr}`}}>
                  <p className="text-[8.5px] tracking-[0.36em] uppercase" style={{...M,color:fgSub}}>Export</p>
                  <p className="mt-1.5 leading-[1.15]" style={{...CG,fontWeight:400,fontSize:18,color:fgStrong}}>{config.agentName||"Your agent"}</p>
                </div>
                <div className="flex-1 py-3">
                  {EXPORT_TABS.map(tab=>{
                    const active=exportTab===tab.id
                    return(
                      <button key={tab.id} onClick={()=>setExportTab(tab.id)}
                        className="w-full flex flex-col items-start px-5 py-3 transition-all duration-150 relative"
                        style={{background:active?(isDark?"rgba(255,255,255,.05)":"rgba(28,24,18,.05)"):"transparent"}}>
                        {active&&<div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full" style={{background:isDark?"rgba(160,180,255,.6)":"#9e8b6f"}}/>}
                        <span className="text-[10px] tracking-[0.04em]" style={{...F,fontWeight:active?500:400,color:active?fgStrong:fg}}>{tab.label}</span>
                        <span className="text-[8px] mt-0.5" style={{...M,color:fgSub}}>{tab.sub}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="px-5 pb-5 pt-3" style={{borderTop:`1px solid ${divBdr}`}}>
                  <p className="text-[9px] leading-relaxed" style={{...CG,fontStyle:"italic",color:fgSub}}>assembl.co.nz</p>
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0" style={{overflowY:"auto"}}>
                <div className="flex items-start justify-between px-7 pt-6 pb-5" style={{borderBottom:`1px solid ${divBdr}`}}>
                  <div>
                    <p className="text-[8.5px] tracking-[0.3em] uppercase" style={{...M,color:fgSub}}>{EXPORT_TABS.find(t=>t.id===exportTab)?.sub}</p>
                    <p className="mt-1" style={{...CG,fontWeight:400,fontSize:22,color:fgStrong}}>{EXPORT_TABS.find(t=>t.id===exportTab)?.label}</p>
                  </div>
                  <button onClick={()=>setExportOpen(false)} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:opacity-60 mt-0.5"
                    style={{border:`1px solid ${panelBdr}`,color:fgSub}}><span className="text-[13px] leading-none">×</span></button>
                </div>
                <div className="flex-1 px-7 py-6 space-y-5">
                  {exportTab==="png"&&(
                    <>
                      <p className="text-[11px] leading-[1.7]" style={{...F,color:fg}}>2160 × 2160 px · component breakdown · assembl branding.</p>
                      <ExportBtn isDark={isDark} label="Download 2160px PNG" onClick={exportPNG}/>
                    </>
                  )}
                  {exportTab==="pdf"&&(
                    <>
                      <p className="text-[11px] leading-[1.7]" style={{...F,color:fg}}>A4 portrait · 3D render · definition card · component tags.</p>
                      <ExportBtn isDark={isDark} label="Download A4 PDF" onClick={exportPDF}/>
                    </>
                  )}
                  {exportTab==="page"&&(
                    <>
                      <p className="text-[11px] leading-[1.7]" style={{...F,color:fg}}>Standalone HTML · Three.js via CDN · no build step.</p>
                      <ExportBtn isDark={isDark} label="Download HTML Page" onClick={exportPage}/>
                    </>
                  )}
                  {exportTab==="code"&&(
                    <>
                      <p className="text-[11px] leading-[1.7]" style={{...F,color:fg}}>Full configuration JSON. Import into any assembl workspace.</p>
                      <ExportBtn isDark={isDark} label="Download JSON Config" onClick={exportCode}/>
                    </>
                  )}
                  {exportTab==="react"&&(
                    <>
                      <p className="text-[11px] leading-[1.7]" style={{...F,color:fg}}>React TSX component with Three.js.</p>
                      <ExportBtn isDark={isDark} label="Download TSX Component" onClick={exportReact}/>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-8 pt-5">
          <div className="flex flex-col">
            <span className="text-[9px] tracking-[0.2em] uppercase" style={{...M,color:fgSub}}>interactive exhibition · 2025</span>
            <span className="mt-1" style={{...CG,fontWeight:400,fontSize:18,color:fgStrong}}>{config.agentName||"the assembl agent"}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 pointer-events-auto">
            <button onClick={()=>setPanelOpen(o=>!o)} className="text-[8px] tracking-[0.25em] uppercase transition-opacity hover:opacity-70" style={{...M,color:fgSub}}>{panelOpen?"hide":"design"}</button>
            <button onClick={()=>setExportOpen(true)} className="text-[8px] tracking-[0.25em] uppercase transition-opacity hover:opacity-70" style={{...M,color:fgSub}}>export</button>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2" style={{bottom:90}}>
          <div className="flex gap-4 px-5 py-2 rounded-full" style={{background:isDark?"rgba(10,10,20,.7)":"rgba(200,192,180,.7)",backdropFilter:"blur(8px)",border:`1px solid ${panelBdr}`}}>
            {["Drag components","·","Orbit view","·","Click to inspect"].map((t,i)=>(
              <span key={i} className="text-[10.5px]" style={{...F,color:fgSub}}>{t}</span>
            ))}
          </div>
        </div>
        <div className="absolute pointer-events-auto" style={{bottom:80,left:"50%",transform:"translateX(-50%)"}}>
          <AnimatePresence mode="wait">
            {assembled?(
              <motion.div key="dis" className="flex flex-col items-center gap-3"
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}>
                <p className="text-[9px] tracking-[0.4em] uppercase text-center" style={{...M,color:fgSub}}>{config.agentName?`${config.agentName} assembled`:"agent assembled"}</p>
                <button onClick={()=>{setAssembled(false);assembledRef.current=false}} className="px-10 py-3 rounded-full transition-all duration-300" style={{border:`1px solid ${panelBdr}`}}>
                  <span className="text-[9px] tracking-[0.38em] uppercase" style={{...M,color:fg}}>Disassemble</span>
                </button>
              </motion.div>
            ):(
              <motion.button key="asm"
                onClick={()=>{setAssembled(true);assembledRef.current=true;setPanelOpen(false);setFocusedPart(null);focusPartCbRef.current(null)}}
                className="px-10 py-3 rounded-full hover:-translate-y-px transition-all duration-300"
                style={{border:`1px solid ${isDark?"rgba(255,255,255,.22)":"rgba(28,24,18,.22)"}`,background:isDark?"rgba(10,10,20,.3)":"rgba(244,240,234,.3)",backdropFilter:"blur(8px)"}}
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}>
                <span className="text-[9px] tracking-[0.38em] uppercase" style={{...M,color:isDark?"rgba(200,210,240,.8)":"#5a4e3c"}}>Assemble</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto flex" style={{height:66,borderTop:`1px solid ${panelBdr}`,background:isDark?"rgba(8,8,16,.92)":"rgba(212,206,198,.9)",backdropFilter:"blur(18px)"}}>
        {PARTS.map((p,i)=>(
          <button key={p.id} onClick={()=>focusPartCbRef.current(assembled?null:p.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 px-0.5 py-2 transition-all duration-200 relative overflow-hidden"
            style={{background:focusedPart===p.id?(isDark?"rgba(255,255,255,.06)":"rgba(28,24,18,.07)" ):"transparent",borderRight:i<PARTS.length-1?`1px solid ${panelBdr}`:"none"}}>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] transition-transform duration-300 origin-left" style={{background:p.colorHex,transform:focusedPart===p.id?"scaleX(1)":"scaleX(0)"}}/>
            <span className="text-[6.5px] tracking-[0.12em] uppercase leading-none" style={{...M,color:fgSub}}>{p.cat}</span>
            <span className="text-[9px] font-medium leading-none mt-0.5" style={{...F,color:focusedPart===p.id?fgStrong:fg}}>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ExportBtn({isDark,label,onClick}:{isDark:boolean;label:string;onClick:()=>void}){
  return(
    <button onClick={onClick} className="w-full py-3 rounded-[9px] text-[8.5px] tracking-[0.28em] uppercase transition-all hover:opacity-80"
      style={{fontFamily:"'DM Mono',monospace",fontWeight:300,color:isDark?"rgba(160,180,255,.85)":"#6a5840",border:`1px solid ${isDark?"rgba(100,120,255,.25)":"rgba(106,88,64,.28)"}`,background:isDark?"rgba(80,100,200,.09)":"rgba(106,88,64,.07)"}}>
      {label}
    </button>
  )
}
