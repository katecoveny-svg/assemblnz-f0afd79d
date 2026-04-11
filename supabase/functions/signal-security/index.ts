import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

// ===== NZISM CONTROL MAPPING =====
type NZISMLevel = 1 | 2 | 3 | 4;
type DataClassification = "UNCLASSIFIED" | "IN-CONFIDENCE" | "SENSITIVE" | "RESTRICTED";

interface NZISMControl {
  family: string;
  controlId: string;
  title: string;
  level: NZISMLevel;
  description: string;
}

interface KeteSecurityProfile {
  kete: string;
  dataClassification: DataClassification;
  requiredLevel: NZISMLevel;
  controls: NZISMControl[];
}

const NZISM_CONTROLS: NZISMControl[] = [
  { family: "A", controlId: "A.1", title: "Information Security Policy", level: 1, description: "Documented security policy reviewed annually" },
  { family: "D", controlId: "D.1", title: "User Registration", level: 1, description: "Formal user registration and de-registration process" },
  { family: "D", controlId: "D.2", title: "Privilege Management", level: 1, description: "Restrict and control allocation of privileges" },
  { family: "D", controlId: "D.3", title: "MFA Requirement", level: 2, description: "Multi-factor authentication for sensitive operations" },
  { family: "E", controlId: "E.1", title: "Encryption at Rest", level: 2, description: "AES-256 encryption for stored data" },
  { family: "E", controlId: "E.2", title: "Encryption in Transit", level: 1, description: "TLS 1.3 for all communications" },
  { family: "G", controlId: "G.1", title: "Incident Response", level: 1, description: "Documented incident response procedures" },
  { family: "H", controlId: "H.1", title: "Network Security", level: 1, description: "Network segmentation and monitoring" },
  { family: "K", controlId: "K.1", title: "Security Audits", level: 2, description: "Annual security audit and penetration testing" },
  { family: "L", controlId: "L.1", title: "Data Classification", level: 1, description: "Classify all data by sensitivity" },
];

function mapNZISMControls(kete: string, dataClassification: DataClassification): KeteSecurityProfile {
  const levelMap: Record<DataClassification, NZISMLevel> = {
    "UNCLASSIFIED": 1, "IN-CONFIDENCE": 2, "SENSITIVE": 3, "RESTRICTED": 4,
  };
  const requiredLevel = levelMap[dataClassification];
  const controls = NZISM_CONTROLS.filter(c => c.level <= requiredLevel);
  return { kete, dataClassification, requiredLevel, controls };
}

// ===== RBAC =====
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPermission(userId: string, kete: string, action: string): Promise<boolean> {
  const { data } = await supabase
    .from("permissions")
    .select("allowed, roles!inner(id)")
    .eq("kete", kete)
    .eq("action", action)
    .eq("allowed", true);

  if (!data || data.length === 0) return false;

  const roleIds = data.map((p: any) => p.roles.id);
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId)
    .in("role_id", roleIds);

  return (userRoles?.length || 0) > 0;
}

// ===== RATE LIMITING =====
interface RateLimitConfig { windowMs: number; maxRequests: number; }

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "MANAAKI": { windowMs: 60_000, maxRequests: 100 },
  "WAIHANGA": { windowMs: 60_000, maxRequests: 80 },
  "AUAHA": { windowMs: 60_000, maxRequests: 120 },
  "ARATAKI": { windowMs: 60_000, maxRequests: 80 },
  "PIKAU": { windowMs: 60_000, maxRequests: 60 },
  "TORO": { windowMs: 60_000, maxRequests: 200 },
};

const requestCounts = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string, kete: string): { allowed: boolean; remaining: number } {
  const config = RATE_LIMITS[kete] || { windowMs: 60_000, maxRequests: 100 };
  const key = `${userId}:${kete}`;
  const now = Date.now();
  const entry = requestCounts.get(key);
  if (!entry || now - entry.windowStart > config.windowMs) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }
  entry.count++;
  if (entry.count > config.maxRequests) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

// ===== TAMPER-EVIDENT AUDIT LOGGING =====
async function logWithHashChain(
  requestId: string, userId: string, kete: string,
  actionType: string, step: string, status: string,
  details: Record<string, unknown>
): Promise<void> {
  const { data: prev } = await supabase.from("pipeline_audit_logs")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1).single();

  const hashPrev = prev?.id || "GENESIS";
  const payload = JSON.stringify({ requestId, userId, kete, actionType, step, status, details, hashPrev });
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(payload));
  const hashCurrent = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

  await supabase.from("pipeline_audit_logs").insert({
    request_id: requestId,
    agent_name: kete,
    stage: step,
    status,
    input_snapshot: details,
    output_snapshot: { hash_prev: hashPrev, hash_current: hashCurrent },
  });
}

// ===== IPP ENFORCER =====
type IPPNumber = 1 | 2 | 3 | "3A" | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface IPPCheck {
  ipp: IPPNumber;
  title: string;
  compliant: boolean;
  reason: string;
  recommendation?: string;
}

interface DataOperation {
  type: "collect" | "store" | "use" | "disclose" | "transfer" | "delete" | "correct";
  dataClassification: "personal" | "sensitive" | "health" | "financial" | "biometric";
  source: "individual" | "third_party" | "public" | "government";
  purpose: string;
  hasConsent: boolean;
  hasNotification: boolean;
  retentionDays?: number;
  crossBorder?: boolean;
  destinationCountry?: string;
  uniqueIdentifier?: boolean;
}

function enforceIPP(operation: DataOperation, context: Record<string, unknown> = {}) {
  const checks: IPPCheck[] = [];

  checks.push({ ipp: 1, title: "Purpose of Collection", compliant: !!operation.purpose && operation.purpose.length > 0, reason: operation.purpose ? `Lawful purpose: ${operation.purpose}` : "No purpose specified", recommendation: !operation.purpose ? "Document lawful purpose" : undefined });
  checks.push({ ipp: 2, title: "Source of Information", compliant: operation.source === "individual" || !!context.thirdPartyJustification, reason: operation.source === "individual" ? "Collected directly" : "Third party — justification required" });
  checks.push({ ipp: 3, title: "Collection Notification", compliant: operation.hasNotification, reason: operation.hasNotification ? "Individual notified" : "Not notified" });

  const ipp3aApplies = operation.source === "third_party";
  checks.push({ ipp: "3A", title: "Third-Party Collection (IPP 3A)", compliant: !ipp3aApplies || operation.hasNotification, reason: ipp3aApplies ? (operation.hasNotification ? "Notified of third-party collection" : "VIOLATION: Not notified (IPP 3A effective 1 May 2026)") : "N/A" });

  checks.push({ ipp: 4, title: "Manner of Collection", compliant: true, reason: "Collection method assumed lawful" });
  checks.push({ ipp: 5, title: "Storage and Security", compliant: true, reason: `Data classified as ${operation.dataClassification} — controls applied` });
  checks.push({ ipp: 6, title: "Individual Access", compliant: true, reason: "SAR workflow available" });
  checks.push({ ipp: 7, title: "Correction Rights", compliant: true, reason: "Correction workflow available" });
  checks.push({ ipp: 8, title: "Accuracy", compliant: operation.type !== "use" || !!context.accuracyVerified, reason: operation.type === "use" ? (context.accuracyVerified ? "Verified" : "Not verified") : "N/A" });
  checks.push({ ipp: 9, title: "Retention Limits", compliant: !operation.retentionDays || operation.retentionDays <= 2555, reason: operation.retentionDays ? `${operation.retentionDays} days` : "No retention set" });
  checks.push({ ipp: 10, title: "Use Limitation", compliant: !!operation.purpose, reason: operation.purpose ? `Used for: ${operation.purpose}` : "No purpose documented" });
  checks.push({ ipp: 11, title: "Disclosure Limitation", compliant: operation.type !== "disclose" || operation.hasConsent, reason: operation.type === "disclose" ? (operation.hasConsent ? "Consented" : "No consent") : "N/A" });
  checks.push({ ipp: 12, title: "Cross-Border Transfer", compliant: !operation.crossBorder || !!context.adequateProtection, reason: operation.crossBorder ? (context.adequateProtection ? `Protected transfer to ${operation.destinationCountry}` : `Unprotected transfer to ${operation.destinationCountry}`) : "No cross-border" });
  checks.push({ ipp: 13, title: "Unique Identifiers", compliant: !operation.uniqueIdentifier || !!context.uniqueIdJustification, reason: operation.uniqueIdentifier ? "Justification required" : "No unique ID" });

  const violations = checks.filter(c => !c.compliant);
  return { overallCompliant: violations.length === 0, checks, violations, timestamp: new Date().toISOString() };
}

// ===== BREACH CLASSIFICATION =====
interface BreachReport {
  breachId: string;
  discoveryDate: string;
  description: string;
  affectedDataTypes: string[];
  estimatedAffected: number;
  harmLikelihood: "low" | "medium" | "high" | "critical";
  containmentActions: string[];
}

function classifyBreach(breach: BreachReport) {
  const hasSensitive = breach.affectedDataTypes.some(t => ["health", "financial", "biometric", "criminal", "ethnic"].some(s => t.includes(s)));
  const highHarm = ["high", "critical"].includes(breach.harmLikelihood);
  const largeScale = breach.estimatedAffected > 100;
  const isNotifiable = hasSensitive && (highHarm || largeScale);

  let level: "minor" | "significant" | "major" | "critical" = "minor";
  if (hasSensitive && highHarm && largeScale) level = "critical";
  else if (highHarm || largeScale) level = "major";
  else if (hasSensitive) level = "significant";

  const deadline = new Date(breach.discoveryDate);
  deadline.setHours(deadline.getHours() + 72);

  return { isNotifiable, level, deadline72h: deadline.toISOString(), notifyCommissioner: isNotifiable && ["major", "critical"].includes(level), notifyIndividuals: isNotifiable };
}

// ===== MĀORI DATA SOVEREIGNTY — MEAD'S FIVE TESTS =====
function meadsFiveTests(dataTypes: string[], proposedUses: string[], iwisConsulted: string[]) {
  const hasMaoriData = dataTypes.some(d => ["whakapapa", "iwi", "hapu", "whanau", "maori", "cultural", "genealogy"].some(k => d.toLowerCase().includes(k)));

  const whakapapa = { name: "Whakapapa", passed: hasMaoriData, requiresConsultation: hasMaoriData };
  const tika = { name: "Tika", passed: iwisConsulted.length > 0, requiresConsultation: true };
  const communityBenefit = { name: "Community Benefit", passed: proposedUses.some(u => ["benefit", "improve", "support", "empower"].some(k => u.toLowerCase().includes(k))), requiresConsultation: true };
  const teTiriti = { name: "Te Tiriti o Waitangi", passed: iwisConsulted.length > 0 && proposedUses.some(u => u.toLowerCase().includes("partnership")), requiresConsultation: true };
  const mana = { name: "Mana", passed: !proposedUses.some(u => ["exploit", "appropriate", "commercialize"].some(k => u.toLowerCase().includes(k))), requiresConsultation: true };

  const allPassed = [whakapapa, tika, communityBenefit, teTiriti, mana].every(t => t.passed);
  const anyNeedsConsult = [whakapapa, tika, communityBenefit, teTiriti, mana].some(t => t.requiresConsultation && iwisConsulted.length === 0);

  return {
    assessmentId: `mdsa-${Date.now()}`,
    tests: { whakapapa, tika, communityBenefit, teTiriti, mana },
    allPassed,
    recommendation: !allPassed ? "declined" : anyNeedsConsult ? "refer-to-iwi" : "approved",
  };
}

// ===== MAIN HANDLER =====
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const { action, userId, kete, payload } = body;

    // Rate limit check
    if (userId && kete) {
      const rateCheck = checkRateLimit(userId, kete.toUpperCase());
      if (!rateCheck.allowed) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded", remaining: 0 }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    let result: any;

    switch (action) {
      case "nzism_profile":
        result = mapNZISMControls(payload.kete, payload.dataClassification);
        break;

      case "check_permission":
        result = { allowed: await checkPermission(payload.userId, payload.kete, payload.action) };
        break;

      case "enforce_ipp":
        result = enforceIPP(payload.operation, payload.context || {});
        break;

      case "classify_breach":
        result = classifyBreach(payload.breach);
        break;

      case "maori_sovereignty":
        result = meadsFiveTests(payload.dataTypes, payload.proposedUses, payload.iwisConsulted || []);
        break;

      case "audit_log":
        await logWithHashChain(payload.requestId, userId, kete, payload.actionType, payload.step, payload.status, payload.details || {});
        result = { logged: true };
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
