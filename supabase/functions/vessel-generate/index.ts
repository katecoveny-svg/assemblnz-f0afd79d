// supabase/functions/vessel-generate/index.ts
//
// vessel-generate
// ---------------
// Proxies image generation requests to Fal.ai (Flux 1.1 Pro) and OpenAI
// (gpt-image-1). Provider API keys live in Supabase Edge Function secrets
// so the browser studio can call this endpoint without exposing credentials.
//
// Auth: clients send `Authorization: Bearer <VESSEL_STUDIO_SHARED_SECRET>`.
// The shared secret is rotatable independently of provider keys.
//
// CORS: open to "*" so the studio can be hosted anywhere.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Max-Age": "86400",
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  "Content-Type": "application/json",
};

type AspectRatio = "16:9" | "4:5" | "1:1" | "9:16";
type Model = "flux" | "openai";

interface GenerateRequest {
  model: Model;
  prompt: string;
  aspect_ratio: AspectRatio;
  variants: number;
  sref?: string;
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

const PROVIDER_TIMEOUT_MS = 120_000; // 2 minutes — high-quality OpenAI gens can run long

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function isAspectRatio(v: unknown): v is AspectRatio {
  return v === "16:9" || v === "4:5" || v === "1:1" || v === "9:16";
}

function isModel(v: unknown): v is Model {
  return v === "flux" || v === "openai";
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

  return {
    ok: true,
    data: {
      model: r.model,
      prompt: r.prompt,
      aspect_ratio: r.aspect_ratio,
      variants,
      sref,
    },
  };
}

// Constant-time string equality. Length mismatch short-circuits, but only
// returns false (timing leak there reveals length, not contents).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function generateFlux(
  req: GenerateRequest,
  falKey: string,
): Promise<Response> {
  const dims = FLUX_DIMENSIONS[req.aspect_ratio];
  const variants = req.variants;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const upstream = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: req.prompt,
        image_size: FLUX_IMAGE_SIZES[req.aspect_ratio],
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: variants,
        enable_safety_checker: true,
        output_format: "jpeg",
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      const safe = errBody.length > 500 ? errBody.slice(0, 500) : errBody;
      return jsonResponse(502, {
        error: `Fal.ai returned ${upstream.status}: ${safe}`,
      });
    }

    const data = await upstream.json();
    const rawImages = Array.isArray(data?.images) ? data.images : [];
    const images: GeneratedImage[] = rawImages.map((img: Record<string, unknown>) => ({
      url: typeof img.url === "string" ? img.url : "",
      width: typeof img.width === "number" ? img.width : dims.width,
      height: typeof img.height === "number" ? img.height : dims.height,
      content_type: "image/jpeg" as const,
    })).filter((img: GeneratedImage) => img.url.length > 0);

    if (images.length === 0) {
      return jsonResponse(502, { error: "Fal.ai returned no images" });
    }

    const response: GenerateResponse = {
      images,
      model: "flux",
      cost_estimate_usd: variants * 0.04,
      generated_at: new Date().toISOString(),
    };
    return jsonResponse(200, response);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    const msg = aborted
      ? `Fal.ai request timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`
      : err instanceof Error
        ? `Fal.ai request failed: ${err.message}`
        : "Fal.ai request failed: unknown error";
    return jsonResponse(502, { error: msg });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateOpenAI(
  req: GenerateRequest,
  openaiKey: string,
): Promise<Response> {
  const dims = OPENAI_DIMENSIONS[req.aspect_ratio];
  const variants = req.variants;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const upstream = await fetch("https://api.openai.com/v1/images/generations", {
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
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      const safe = errBody.length > 500 ? errBody.slice(0, 500) : errBody;
      return jsonResponse(502, {
        error: `OpenAI returned ${upstream.status}: ${safe}`,
      });
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
      return jsonResponse(502, { error: "OpenAI returned no images" });
    }

    const response: GenerateResponse = {
      images,
      model: "openai",
      cost_estimate_usd: variants * 0.19,
      generated_at: new Date().toISOString(),
    };
    return jsonResponse(200, response);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    const msg = aborted
      ? `OpenAI request timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`
      : err instanceof Error
        ? `OpenAI request failed: ${err.message}`
        : "OpenAI request failed: unknown error";
    return jsonResponse(502, { error: msg });
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed; use POST" });
  }

  // Auth: Bearer <VESSEL_STUDIO_SHARED_SECRET>
  const sharedSecret = Deno.env.get("VESSEL_STUDIO_SHARED_SECRET");
  if (!sharedSecret) {
    return jsonResponse(500, {
      error: "Server misconfigured: VESSEL_STUDIO_SHARED_SECRET not set",
    });
  }
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${sharedSecret}`;
  if (!timingSafeEqual(auth, expected)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON" });
  }

  const validated = validateRequest(body);
  if (!validated.ok) {
    return jsonResponse(400, { error: validated.error });
  }
  const data = validated.data;

  // Provider routing
  if (data.model === "flux") {
    const falKey = Deno.env.get("FAL_API_KEY");
    if (!falKey) {
      return jsonResponse(500, {
        error: "Server misconfigured: FAL_API_KEY not set",
      });
    }
    return await generateFlux(data, falKey);
  }

  if (data.model === "openai") {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse(500, {
        error: "Server misconfigured: OPENAI_API_KEY not set",
      });
    }
    if (openaiKey === "PENDING") {
      return jsonResponse(503, { error: "OpenAI key not configured yet" });
    }
    return await generateOpenAI(data, openaiKey);
  }

  // Unreachable — validateRequest narrows model to the union
  return jsonResponse(400, { error: "Unsupported model" });
});
