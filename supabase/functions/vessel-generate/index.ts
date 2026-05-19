// supabase/functions/vessel-generate/index.ts
//
// vessel-generate (v2)
// --------------------
// Proxies image generation requests to Fal.ai (Flux 1.1 Pro and Flux 1.1
// Pro Ultra Redux) and OpenAI (gpt-image-1). Provider API keys live in
// assembl-prod Supabase Edge Function secrets so the browser studio and
// in-app Auaha studios can call this endpoint without exposing credentials.
//
// Auth: clients send `Authorization: Bearer <VESSEL_STUDIO_SHARED_SECRET>`.
// CORS: only the origins listed in ALLOWED_ORIGINS get an
//       Access-Control-Allow-Origin header echoed back. Non-browser callers
//       (curl, server-to-server) bypass the CORS layer entirely and rely on
//       the Bearer token as the only gate.
//
// v2 deltas vs v1:
//   - Ultra Redux endpoint when image_url is provided
//   - ALLOWED_ORIGINS-aware CORS (replaces open `*`)
//   - image_url + image_prompt_strength on the request schema
//   - 60s provider timeout, explicit 504 on AbortError
//   - Provider error bodies sanitised before pass-through

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type AspectRatio = "16:9" | "4:5" | "1:1" | "9:16";
type Model = "flux" | "openai";

interface GenerateRequest {
  model: Model;
  prompt: string;
  aspect_ratio: AspectRatio;
  variants: number;
  sref?: string;                 // accepted but ignored — Midjourney-only
  image_url?: string;            // hosted URL or data:image/...;base64,...
  image_prompt_strength: number; // 0..1, default 0.35
  ip_hash?: string;
}

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  content_type: "image/jpeg";
}

interface GenerateResponse {
  images: GeneratedImage[];
  model: Model;
  cost_estimate_usd: number;
  cost_usd_estimate?: number;
  fal_request_id?: string;
  generated_at: string;
}

const FLUX_IMAGE_SIZES: Record<AspectRatio, string> = {
  "16:9": "landscape_16_9",
  "4:5": "portrait_4_5",
  "1:1": "square_hd",
  "9:16": "portrait_16_9",
};

const FLUX_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1344, height: 768 },
  "4:5": { width: 832, height: 1024 },
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 768, height: 1344 },
};

const OPENAI_SIZES: Record<AspectRatio, string> = {
  "16:9": "1536x1024",
  "4:5": "1024x1024",
  "1:1": "1024x1024",
  "9:16": "1024x1536",
};

const OPENAI_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1536, height: 1024 },
  "4:5": { width: 1024, height: 1024 },
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 1024, height: 1536 },
};

const PROVIDER_TIMEOUT_MS = 60_000;

// ─── CORS ──────────────────────────────────────────────────────────────────

function getAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function corsHeaders(
  originHeader: string | null,
  allowedOrigins: string[],
): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  // Only echo back the origin if it matches the allowlist. Browsers will
  // refuse cross-origin reads without ACAO; non-browser callers don't care.
  if (originHeader && allowedOrigins.includes(originHeader)) {
    headers["Access-Control-Allow-Origin"] = originHeader;
  }
  return headers;
}

function jsonResponse(
  status: number,
  body: unknown,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// ─── Type guards & validation ──────────────────────────────────────────────

function isAspectRatio(v: unknown): v is AspectRatio {
  return v === "16:9" || v === "4:5" || v === "1:1" || v === "9:16";
}

function isModel(v: unknown): v is Model {
  return v === "flux" || v === "openai";
}

function isValidImageUrl(v: unknown): v is string {
  if (typeof v !== "string" || v.length === 0) return false;
  // Accept hosted https URLs or base64 data URLs only. http://localhost is
  // allowed for development; anything else is rejected so we don't proxy
  // arbitrary outbound fetches on the user's behalf.
  return (
    v.startsWith("https://") ||
    v.startsWith("http://localhost") ||
    v.startsWith("http://127.0.0.1") ||
    /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(v)
  );
}

type ValidationResult =
  | { ok: true; data: GenerateRequest }
  | { ok: false; error: string };

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const r = body as Record<string, unknown>;

  if (!isModel(r.model)) {
    return { ok: false, error: "model must be 'flux' or 'openai'" };
  }
  if (typeof r.prompt !== "string" || r.prompt.trim().length === 0) {
    return { ok: false, error: "prompt must be a non-empty string" };
  }
  if (!isAspectRatio(r.aspect_ratio)) {
    return {
      ok: false,
      error: "aspect_ratio must be one of '16:9', '4:5', '1:1', '9:16'",
    };
  }

  let variants = 1;
  if (r.variants !== undefined && r.variants !== null) {
    if (
      typeof r.variants !== "number" ||
      !Number.isInteger(r.variants) ||
      r.variants < 1 ||
      r.variants > 4
    ) {
      return { ok: false, error: "variants must be an integer between 1 and 4" };
    }
    variants = r.variants;
  }

  let sref: string | undefined;
  if (r.sref !== undefined && r.sref !== null) {
    if (typeof r.sref !== "string") {
      return { ok: false, error: "sref must be a string when provided" };
    }
    sref = r.sref;
  }

  let image_url: string | undefined;
  if (r.image_url !== undefined && r.image_url !== null) {
    if (!isValidImageUrl(r.image_url)) {
      return {
        ok: false,
        error:
          "image_url must be a hosted https URL, http://localhost URL, or data:image/(png|jpeg|webp);base64,... URL",
      };
    }
    image_url = r.image_url;
  }

  let image_prompt_strength = 0.35;
  if (r.image_prompt_strength !== undefined && r.image_prompt_strength !== null) {
    if (
      typeof r.image_prompt_strength !== "number" ||
      Number.isNaN(r.image_prompt_strength) ||
      r.image_prompt_strength < 0 ||
      r.image_prompt_strength > 1
    ) {
      return {
        ok: false,
        error: "image_prompt_strength must be a number between 0 and 1",
      };
    }
    image_prompt_strength = r.image_prompt_strength;
  }

  return {
    ok: true,
    data: {
      model: r.model,
      prompt: r.prompt,
      aspect_ratio: r.aspect_ratio,
      variants,
      sref,
      image_url,
      image_prompt_strength,
      ip_hash: typeof r.ip_hash === "string" && r.ip_hash.length > 0
        ? r.ip_hash
        : undefined,
    },
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────

// Constant-time string equality. Length mismatch short-circuits — that
// leaks length, but the expected length is fixed (`Bearer ` + 32 chars)
// and is not secret.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Provider error sanitisation ───────────────────────────────────────────

// Redact accidental key echoes from upstream error bodies before returning
// them to the client. Belt and braces — providers usually mask their own
// keys, but a misconfigured proxy or middleware can leak.
function sanitizeProviderError(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]{10,}/g, "[REDACTED]")
    .replace(/(?:Key\s+)?fal-[A-Za-z0-9_:.-]{10,}/gi, "[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9_.\-=]+/g, "Bearer [REDACTED]")
    .replace(/authorization:\s*[^\s,]+/gi, "authorization: [REDACTED]");
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

async function logVesselGeneration(req: GenerateRequest, falRequestId: string, cost: number) {
  if (!req.ip_hash) return;
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("vessel_generations").insert({
      ip_hash: req.ip_hash,
      prompt: req.prompt.slice(0, 4000),
      aspect_ratio: req.aspect_ratio,
      model: typeof req.image_url === "string" && req.image_url.length > 0
        ? "fal-ai/flux-pro/v1.1-ultra-redux"
        : "fal-ai/flux-pro/v1.1",
      fal_request_id: falRequestId || null,
      cost_usd_estimate: cost,
    });
  } catch (err) {
    console.error("[vessel-generate] generation log insert failed", err);
  }
}

// ─── Provider implementations ──────────────────────────────────────────────

async function generateFlux(
  req: GenerateRequest,
  falKey: string,
  cors: Record<string, string>,
): Promise<Response> {
  const variants = req.variants;
  const useUltraRedux = typeof req.image_url === "string" && req.image_url.length > 0;
  const dims = FLUX_DIMENSIONS[req.aspect_ratio];

  const url = useUltraRedux
    ? "https://fal.run/fal-ai/flux-pro/v1.1-ultra-redux"
    : "https://fal.run/fal-ai/flux-pro/v1.1";

  const body: Record<string, unknown> = useUltraRedux
    ? {
        prompt: req.prompt,
        image_url: req.image_url,
        image_prompt_strength: req.image_prompt_strength,
        aspect_ratio: req.aspect_ratio,
        num_images: variants,
        enable_safety_checker: true,
        output_format: "jpeg",
      }
    : {
        prompt: req.prompt,
        image_size: FLUX_IMAGE_SIZES[req.aspect_ratio],
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: variants,
        enable_safety_checker: true,
        output_format: "jpeg",
      };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      const safe = truncate(sanitizeProviderError(errBody), 500);
      return jsonResponse(
        502,
        { error: `Fal.ai returned ${upstream.status}: ${safe}` },
        cors,
      );
    }

    const data = await upstream.json();
    const rawImages = Array.isArray(data?.images) ? data.images : [];
    const images: GeneratedImage[] = rawImages
      .map((img: Record<string, unknown>) => ({
        url: typeof img.url === "string" ? img.url : "",
        width: typeof img.width === "number" ? img.width : dims.width,
        height: typeof img.height === "number" ? img.height : dims.height,
        content_type: "image/jpeg" as const,
      }))
      .filter((img: GeneratedImage) => img.url.length > 0);

    if (images.length === 0) {
      return jsonResponse(502, { error: "Fal.ai returned no images" }, cors);
    }

    const costPerVariant = useUltraRedux ? 0.06 : 0.04;
    const cost = Number((variants * costPerVariant).toFixed(4));
    const requestInfo = data?.request && typeof data.request === "object"
      ? data.request as Record<string, unknown>
      : {};
    const falRequestId = String(
      data?.request_id ??
      data?.requestId ??
      requestInfo.id ??
      upstream.headers.get("x-fal-request-id") ??
      "",
    );
    await logVesselGeneration(req, falRequestId, cost);

    const response: GenerateResponse = {
      images,
      model: "flux",
      cost_estimate_usd: cost,
      cost_usd_estimate: cost,
      fal_request_id: falRequestId,
      generated_at: new Date().toISOString(),
    };
    return jsonResponse(200, response, cors);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    if (aborted) {
      return jsonResponse(
        504,
        {
          error: `Fal.ai request timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`,
        },
        cors,
      );
    }
    const msg = err instanceof Error ? err.message : "unknown error";
    return jsonResponse(502, { error: `Fal.ai request failed: ${msg}` }, cors);
  } finally {
    clearTimeout(timer);
  }
}

async function generateOpenAI(
  req: GenerateRequest,
  openaiKey: string,
  cors: Record<string, string>,
): Promise<Response> {
  const variants = req.variants;
  const dims = OPENAI_DIMENSIONS[req.aspect_ratio];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const upstream = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: req.prompt,
          n: variants,
          size: OPENAI_SIZES[req.aspect_ratio],
          quality: "high",
          output_format: "jpeg",
        }),
        signal: controller.signal,
      },
    );

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      const safe = truncate(sanitizeProviderError(errBody), 500);
      return jsonResponse(
        502,
        { error: `OpenAI returned ${upstream.status}: ${safe}` },
        cors,
      );
    }

    const data = await upstream.json();
    const rawImages = Array.isArray(data?.data) ? data.data : [];
    const images: GeneratedImage[] = rawImages
      .map((img: Record<string, unknown>) => {
        let url = "";
        if (typeof img.b64_json === "string" && img.b64_json.length > 0) {
          url = `data:image/jpeg;base64,${img.b64_json}`;
        } else if (typeof img.url === "string") {
          url = img.url;
        }
        return {
          url,
          width: dims.width,
          height: dims.height,
          content_type: "image/jpeg" as const,
        };
      })
      .filter((img: GeneratedImage) => img.url.length > 0);

    if (images.length === 0) {
      return jsonResponse(502, { error: "OpenAI returned no images" }, cors);
    }

    const response: GenerateResponse = {
      images,
      model: "openai",
      cost_estimate_usd: variants * 0.19,
      generated_at: new Date().toISOString(),
    };
    return jsonResponse(200, response, cors);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    if (aborted) {
      return jsonResponse(
        504,
        {
          error: `OpenAI request timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`,
        },
        cors,
      );
    }
    const msg = err instanceof Error ? err.message : "unknown error";
    return jsonResponse(502, { error: `OpenAI request failed: ${msg}` }, cors);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Request handler ───────────────────────────────────────────────────────

serve(async (req) => {
  const allowedOrigins = getAllowedOrigins();
  const originHeader = req.headers.get("origin");
  const cors = corsHeaders(originHeader, allowedOrigins);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed; use POST" }, cors);
  }

  // Auth: Bearer <VESSEL_STUDIO_SHARED_SECRET> or internal service-role calls.
  const sharedSecret = Deno.env.get("VESSEL_STUDIO_SHARED_SECRET");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!sharedSecret && !serviceRoleKey) {
    return jsonResponse(
      500,
      { error: "Server misconfigured: no vessel function auth secret set" },
      cors,
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const expected = sharedSecret ? `Bearer ${sharedSecret}` : "";
  const expectedService = serviceRoleKey ? `Bearer ${serviceRoleKey}` : "";
  const authorised = (expected.length > 0 && timingSafeEqual(auth, expected)) ||
    (expectedService.length > 0 && timingSafeEqual(auth, expectedService));
  if (!authorised) {
    return jsonResponse(401, { error: "Unauthorized" }, cors);
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON" }, cors);
  }

  const validated = validateRequest(body);
  if (!validated.ok) {
    return jsonResponse(400, { error: validated.error }, cors);
  }
  const data = validated.data;

  // Provider routing
  if (data.model === "flux") {
    const falKey = Deno.env.get("FAL_API_KEY");
    if (!falKey) {
      return jsonResponse(
        500,
        { error: "Server misconfigured: FAL_API_KEY not set" },
        cors,
      );
    }
    return await generateFlux(data, falKey, cors);
  }

  if (data.model === "openai") {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse(
        500,
        { error: "Server misconfigured: OPENAI_API_KEY not set" },
        cors,
      );
    }
    if (openaiKey === "PENDING") {
      return jsonResponse(503, { error: "OpenAI key not configured yet" }, cors);
    }
    return await generateOpenAI(data, openaiKey, cors);
  }

  return jsonResponse(400, { error: "Unsupported model" }, cors);
});
